"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BRASIL_API_BASE } from "@/lib/constants";
import { extrairNome, formatarCnpj } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import { useDashboard } from "@/lib/dashboard-context";
import { inicializarDasUsuario } from "@/lib/das-service";
import BlurOverlay from "@/components/dashboard/BlurOverlay";

function limparCnpj(valor) {
  return valor.replace(/\D/g, "");
}

const TABS = [
  { id: "perfil", label: "Perfil" },
  { id: "assinatura", label: "Assinatura" },
  { id: "seguranca", label: "Seguranca" },
];

const PLANOS = [
  {
    id: "free",
    nome: "Free",
    preco: "R$ 0",
    periodo: "",
    descricao: "Para quem esta comecando",
    recursos: [
      "Dashboard basico",
      "Barra de limite anual",
      "DAS do mes atual",
      "Situacao cadastral",
    ],
  },
  {
    id: "pro",
    nome: "Pro",
    preco: "R$ 39,90",
    periodo: "/mes",
    descricao: "Controle completo do seu MEI",
    recursos: [
      "Tudo do Free",
      "Historico completo de DAS",
      "Controle de faturamento",
      "Alertas por e-mail",
      "Grafico de faturamento",
    ],
  },
  {
    id: "anual",
    nome: "Anual",
    preco: "R$ 399",
    periodo: "/ano",
    descricao: "Pro com desconto (~2 meses gratis)",
    recursos: [
      "Tudo do Pro",
      "Economia de ~R$ 80/ano",
      "Prioridade no suporte",
    ],
  },
];

// Estilos reutilizaveis
const labelStyle = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#8A8A8A",
};

const cardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #EBEBEB",
  borderRadius: 16,
  padding: 24,
};

const emBreveBadge = {
  fontSize: 11,
  fontWeight: 500,
  color: "#7A5A00",
  backgroundColor: "rgba(204,168,48,0.12)",
  padding: "3px 10px",
  borderRadius: 99,
};

export default function ContaPage() {
  const router = useRouter();
  const supabase = createClient();
  const { mostrarToast } = useToast();
  const { recarregar } = useDashboard();

  const [carregando, setCarregando] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("perfil");
  const [editando, setEditando] = useState(false);

  // Estado do formulario de CNPJ
  const [cnpjInput, setCnpjInput] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [dadosCnpj, setDadosCnpj] = useState(null);
  const [erroCnpj, setErroCnpj] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Carregar perfil do usuario
  useEffect(() => {
    async function carregarPerfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserEmail(user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data?.cnpj) {
        setPerfil(data);
      }
      setCarregando(false);
    }
    carregarPerfil();
  }, []);

  // Buscar CNPJ na BrasilAPI
  const buscarCnpj = useCallback(async (cnpjLimpo) => {
    setBuscando(true);
    setDadosCnpj(null);
    setErroCnpj("");

    try {
      const res = await fetch(`${BRASIL_API_BASE}/cnpj/v1/${cnpjLimpo}`);
      if (!res.ok) {
        setErroCnpj("CNPJ nao encontrado. Verifique o numero digitado.");
        setBuscando(false);
        return;
      }
      const dados = await res.json();
      setDadosCnpj(dados);
    } catch {
      setErroCnpj("Erro ao consultar o CNPJ. Tente novamente.");
    }
    setBuscando(false);
  }, []);

  // Buscar automaticamente quando CNPJ completo
  function handleCnpjChange(e) {
    const formatado = formatarCnpj(e.target.value);
    setCnpjInput(formatado);
    setErroCnpj("");
    setDadosCnpj(null);

    const limpo = limparCnpj(formatado);
    if (limpo.length === 14) {
      buscarCnpj(limpo);
    }
  }

  // Salvar perfil no Supabase
  async function salvarPerfil() {
    if (!dadosCnpj) return;
    setSalvando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const cnpjLimpo = limparCnpj(cnpjInput);
    const cnaePrincipal = dadosCnpj.cnae_fiscal_descricao || "";
    const cnaeCode = dadosCnpj.cnae_fiscal?.toString() || "";

    const perfilData = {
      id: user.id,
      cnpj: cnpjLimpo,
      nome_fantasia: extrairNome(dadosCnpj.nome_fantasia || dadosCnpj.razao_social) || "",
      cnae: cnaeCode,
      situacao: dadosCnpj.descricao_situacao_cadastral || "",
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(perfilData, { onConflict: "id" });

    if (error) {
      setErroCnpj("Erro ao salvar. Tente novamente.");
      setSalvando(false);
      return;
    }

    // Primeira vez salvando CNPJ: inicializar DAS
    if (!perfil) {
      await inicializarDasUsuario(supabase, user.id, cnaeCode);
    }

    mostrarToast("CNPJ cadastrado com sucesso");
    await recarregar();

    // Primeira vez, redirecionar para dashboard
    if (!perfil) {
      router.push("/dashboard");
      return;
    }

    setPerfil(perfilData);
    setEditando(false);
    setSalvando(false);
    setDadosCnpj(null);
    setCnpjInput("");
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <span style={{ color: "#8A8A8A", fontSize: 14 }}>Carregando...</span>
      </div>
    );
  }

  const planoAtual = perfil?.plano || "free";
  const mostrarFormulario = !perfil || editando;

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#1C1C1C",
          letterSpacing: "-0.03em",
          marginBottom: 24,
        }}
      >
        Minha conta
      </h1>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid #EBEBEB",
          marginBottom: 28,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id)}
            className="cursor-pointer"
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              color: abaAtiva === tab.id ? "#1C1C1C" : "#8A8A8A",
              background: "none",
              border: "none",
              borderBottom: abaAtiva === tab.id ? "2px solid #CCA830" : "2px solid transparent",
              marginBottom: -1,
              transition: "color 0.2s, border-color 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Aba Perfil */}
      {abaAtiva === "perfil" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Card de informacoes do usuario */}
          <div style={cardStyle}>
            <span style={labelStyle}>Informacoes da conta</span>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Email */}
              <div>
                <span style={{ ...labelStyle, fontSize: 10 }}>E-mail</span>
                <p
                  className="mt-1"
                  style={{ fontSize: 15, color: "#1C1C1C" }}
                >
                  {userEmail || "Nao informado"}
                </p>
              </div>

              {/* Nome fantasia */}
              {perfil && (
                <div>
                  <span style={{ ...labelStyle, fontSize: 10 }}>Nome fantasia</span>
                  <p
                    className="mt-1"
                    style={{ fontSize: 15, color: "#1C1C1C", fontWeight: 500 }}
                  >
                    {extrairNome(perfil.nome_fantasia) || "Nao informado"}
                  </p>
                </div>
              )}

              {/* Plano atual */}
              <div>
                <span style={{ ...labelStyle, fontSize: 10 }}>Plano</span>
                <div className="mt-1">
                  <span style={emBreveBadge}>
                    {planoAtual === "pro" ? "Pro" : planoAtual === "anual" ? "Anual" : "Free"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card CNPJ - perfil existente */}
          {perfil && !editando && (
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={labelStyle}>Dados do CNPJ</span>
                <button
                  onClick={() => {
                    setEditando(true);
                    setCnpjInput("");
                    setDadosCnpj(null);
                    setErroCnpj("");
                  }}
                  className="cursor-pointer"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#8A8A8A",
                    background: "none",
                    border: "none",
                    padding: 0,
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                  }}
                >
                  Atualizar
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* CNPJ */}
                <div>
                  <span style={{ ...labelStyle, fontSize: 10 }}>CNPJ</span>
                  <p
                    className="mt-1"
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: 16,
                      color: "#1C1C1C",
                    }}
                  >
                    {formatarCnpj(perfil.cnpj)}
                  </p>
                </div>

                {/* CNAE */}
                <div>
                  <span style={{ ...labelStyle, fontSize: 10 }}>CNAE</span>
                  <p
                    className="mt-1"
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: 14,
                      color: "#1C1C1C",
                    }}
                  >
                    {perfil.cnae || "Nao informado"}
                  </p>
                </div>

                {/* Situacao */}
                <div>
                  <span style={{ ...labelStyle, fontSize: 10 }}>Situacao na Receita</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="inline-block rounded-full"
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor:
                          perfil.situacao?.toLowerCase() === "ativa" ? "#4ADE80" : "#E05252",
                      }}
                    />
                    <span style={{ fontSize: 15, color: "#1C1C1C", fontWeight: 500 }}>
                      {perfil.situacao || "Desconhecida"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulario de CNPJ */}
          {mostrarFormulario && (
            <div style={cardStyle}>
              <span style={labelStyle}>
                {perfil ? "Atualizar CNPJ" : "Cadastrar CNPJ"}
              </span>

              <p className="mt-3 mb-4" style={{ fontSize: 14, color: "#8A8A8A", lineHeight: 1.5 }}>
                Informe o CNPJ do seu MEI para buscarmos seus dados automaticamente.
              </p>

              {/* Input CNPJ */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="cnpj"
                  className="text-sm"
                  style={{ fontWeight: 500, color: "#1C1C1C" }}
                >
                  CNPJ
                </label>
                <input
                  id="cnpj"
                  type="text"
                  value={cnpjInput}
                  onChange={handleCnpjChange}
                  placeholder="00.000.000/0000-00"
                  className="outline-none"
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid #EBEBEB",
                    fontSize: 16,
                    fontFamily: "var(--font-dm-mono)",
                    color: "#1C1C1C",
                    backgroundColor: "#FFFFFF",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#CCA830";
                    e.target.style.boxShadow = "0 0 0 3px rgba(204,168,48,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#EBEBEB";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Loading */}
              {buscando && (
                <p className="mt-3" style={{ fontSize: 13, color: "#8A8A8A" }}>
                  Buscando dados do CNPJ...
                </p>
              )}

              {/* Erro */}
              {erroCnpj && (
                <p
                  className="mt-3 text-sm"
                  style={{
                    color: "#E05252",
                    backgroundColor: "#FDF0F0",
                    padding: "8px 12px",
                    borderRadius: 8,
                  }}
                >
                  {erroCnpj}
                </p>
              )}

              {/* Card de confirmacao */}
              {dadosCnpj && (
                <div
                  className="mt-4"
                  style={{
                    backgroundColor: "#F7F7F5",
                    border: "1px solid #EBEBEB",
                    borderRadius: 12,
                    padding: "16px 20px",
                  }}
                >
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1C" }}>
                    {extrairNome(dadosCnpj.nome_fantasia || dadosCnpj.razao_social)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="inline-block rounded-full"
                      style={{
                        width: 7,
                        height: 7,
                        backgroundColor:
                          dadosCnpj.descricao_situacao_cadastral?.toLowerCase() === "ativa"
                            ? "#4ADE80"
                            : "#E05252",
                      }}
                    />
                    <span style={{ fontSize: 13, color: "#1C1C1C" }}>
                      {dadosCnpj.descricao_situacao_cadastral}
                    </span>
                  </div>

                  <p className="mt-2" style={{ fontSize: 13, color: "#8A8A8A" }}>
                    CNAE:{" "}
                    <span
                      style={{
                        fontFamily: "var(--font-dm-mono)",
                        color: "#1C1C1C",
                      }}
                    >
                      {dadosCnpj.cnae_fiscal}
                    </span>
                    {" - "}
                    {dadosCnpj.cnae_fiscal_descricao}
                  </p>

                  <button
                    onClick={salvarPerfil}
                    disabled={salvando}
                    className="w-full mt-4 py-2.5 rounded-xl text-sm cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{
                      backgroundColor: "#CCA830",
                      color: "#1C1C1C",
                      fontWeight: 600,
                      border: "none",
                    }}
                  >
                    {salvando ? "Salvando..." : "Confirmar e salvar"}
                  </button>
                </div>
              )}

              {/* Botao cancelar quando editando */}
              {editando && (
                <button
                  onClick={() => {
                    setEditando(false);
                    setCnpjInput("");
                    setDadosCnpj(null);
                    setErroCnpj("");
                  }}
                  className="mt-3 text-sm cursor-pointer"
                  style={{
                    color: "#8A8A8A",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Aba Assinatura */}
      {abaAtiva === "assinatura" && (
        <>
          {!perfil ? (
            <BlurOverlay>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <AssinaturaContent planoAtual="free" />
              </div>
            </BlurOverlay>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <AssinaturaContent planoAtual={planoAtual} />
            </div>
          )}
        </>
      )}

      {/* Aba Seguranca */}
      {abaAtiva === "seguranca" && (
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={labelStyle}>Seguranca</span>
            <span style={emBreveBadge}>Em breve</span>
          </div>

          <p style={{ fontSize: 14, color: "#8A8A8A", lineHeight: 1.6, marginBottom: 20 }}>
            Estamos trabalhando em recursos de seguranca para proteger ainda mais a sua conta.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { titulo: "Alterar senha", desc: "Atualize sua senha de acesso" },
              { titulo: "Autenticacao em duas etapas", desc: "Adicione uma camada extra de protecao" },
              { titulo: "Sessoes ativas", desc: "Veja e gerencie seus dispositivos conectados" },
            ].map((item) => (
              <div
                key={item.titulo}
                style={{
                  padding: "14px 16px",
                  backgroundColor: "#F7F7F5",
                  borderRadius: 12,
                  border: "1px solid #EBEBEB",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#1C1C1C" }}>
                      {item.titulo}
                    </p>
                    <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 2 }}>
                      {item.desc}
                    </p>
                  </div>
                  <span style={{ ...emBreveBadge, fontSize: 10 }}>Em breve</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente separado para o conteudo da aba Assinatura
function AssinaturaContent({ planoAtual }) {
  return (
    <>
      {/* Card plano atual */}
      <div style={cardStyle}>
        <span style={labelStyle}>Plano atual</span>
        <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: 32,
              fontWeight: 700,
              color: "#1C1C1C",
              letterSpacing: "-0.02em",
            }}
          >
            {PLANOS.find((p) => p.id === planoAtual)?.preco || "R$ 0"}
          </span>
          <span style={{ fontSize: 14, color: "#8A8A8A" }}>
            {PLANOS.find((p) => p.id === planoAtual)?.periodo || ""}
          </span>
        </div>
        <p style={{ fontSize: 14, color: "#8A8A8A", marginTop: 6 }}>
          {PLANOS.find((p) => p.id === planoAtual)?.descricao || ""}
        </p>
      </div>

      {/* Comparacao de planos */}
      <div>
        <span style={{ ...labelStyle, display: "block", marginBottom: 14 }}>
          Planos disponiveis
        </span>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {PLANOS.map((plano) => {
            const isAtual = plano.id === planoAtual;
            return (
              <div
                key={plano.id}
                style={{
                  ...cardStyle,
                  border: isAtual ? "2px solid #CCA830" : "1px solid #EBEBEB",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Badge plano atual */}
                {isAtual && (
                  <span
                    style={{
                      ...emBreveBadge,
                      position: "absolute",
                      top: 14,
                      right: 14,
                    }}
                  >
                    Plano atual
                  </span>
                )}

                <p style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1C" }}>
                  {plano.nome}
                </p>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#1C1C1C",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {plano.preco}
                  </span>
                  {plano.periodo && (
                    <span style={{ fontSize: 13, color: "#8A8A8A" }}>{plano.periodo}</span>
                  )}
                </div>

                <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 6, lineHeight: 1.4 }}>
                  {plano.descricao}
                </p>

                {/* Lista de recursos */}
                <ul style={{ marginTop: 16, marginBottom: 16, padding: 0, listStyle: "none", flex: 1 }}>
                  {plano.recursos.map((recurso) => (
                    <li
                      key={recurso}
                      style={{
                        fontSize: 13,
                        color: "#3A3A3A",
                        padding: "4px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M3 7l3 3 5-5"
                          stroke="#CCA830"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {recurso}
                    </li>
                  ))}
                </ul>

                {/* Botao */}
                {isAtual ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-sm"
                    style={{
                      backgroundColor: "#F3F3F3",
                      color: "#8A8A8A",
                      fontWeight: 500,
                      border: "none",
                      cursor: "default",
                    }}
                  >
                    Ativo
                  </button>
                ) : (
                  <div style={{ position: "relative" }} className="group">
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl text-sm cursor-not-allowed"
                      style={{
                        backgroundColor: "#1C1C1C",
                        color: "#CCA830",
                        fontWeight: 600,
                        border: "none",
                        opacity: 0.5,
                      }}
                    >
                      Assinar
                    </button>
                    <span
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 6px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        ...emBreveBadge,
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}
                      className="group-hover:!opacity-100"
                    >
                      Em breve
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Metodo de pagamento */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={labelStyle}>Metodo de pagamento</span>
          <span style={emBreveBadge}>Em breve</span>
        </div>
        <p style={{ fontSize: 14, color: "#8A8A8A", lineHeight: 1.5 }}>
          Pagamento via cartao de credito ou Pix estara disponivel em breve.
        </p>
      </div>

      {/* Cancelar assinatura */}
      {planoAtual !== "free" && (
        <div style={{ paddingTop: 4 }}>
          <button
            disabled
            className="cursor-not-allowed text-sm"
            style={{
              color: "#8A8A8A",
              background: "none",
              border: "none",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: 2,
              opacity: 0.6,
            }}
          >
            Cancelar assinatura
          </button>
        </div>
      )}
    </>
  );
}
