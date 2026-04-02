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
import AvatarPicker from "@/components/dashboard/AvatarPicker";

function limparCnpj(valor) {
  return valor.replace(/\D/g, "");
}

const TABS = [
  { id: "perfil", label: "Perfil", icon: "M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0" },
  { id: "assinatura", label: "Assinatura", icon: "M1 21L8 13l5 5 8-13" },
  { id: "seguranca", label: "Seguranca", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
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
  color: "#7A6255",
};

const cardStyle = {
  backgroundColor: "#F2EFE9",
  border: "1px solid #E8E3DA",
  borderRadius: 16,
  padding: 24,
};

const emBreveBadge = {
  fontSize: 11,
  fontWeight: 500,
  color: "#A83D08",
  backgroundColor: "rgba(212,80,10,0.12)",
  padding: "3px 10px",
  borderRadius: 99,
};

export default function ContaPage() {
  const router = useRouter();
  const supabase = createClient();
  const { mostrarToast } = useToast();
  const { recarregar, atualizarPerfil } = useDashboard();

  const [carregando, setCarregando] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("perfil");
  const [editando, setEditando] = useState(false);
  const [memberSince, setMemberSince] = useState("");

  const [avatarPickerAberto, setAvatarPickerAberto] = useState(false);

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

      // Formatar data de criacao
      if (user.created_at) {
        const parts = user.created_at.split("T")[0].split("-");
        const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
        setMemberSince(`${meses[parseInt(parts[1], 10) - 1]} ${parts[0]}`);
      }

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
        <span style={{ color: "#7A6255", fontSize: 14 }}>Carregando...</span>
      </div>
    );
  }

  const planoAtual = perfil?.plano || "free";
  const mostrarFormulario = !perfil || editando;
  const nomeExibir = perfil ? extrairNome(perfil.nome_fantasia) : userEmail.split("@")[0];
  const iniciais = nomeExibir
    ? nomeExibir.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#2A1F14",
          letterSpacing: "-0.03em",
          marginBottom: 24,
        }}
      >
        Minha conta
      </h1>

      {/* Layout: vertical tabs (desktop) / horizontal tabs (mobile) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs - vertical on desktop, horizontal on mobile */}
        <div className="lg:w-48 flex-shrink-0">
          {/* Mobile: horizontal tabs */}
          <div
            className="flex lg:hidden"
            style={{
              gap: 0,
              borderBottom: "1px solid #E8E3DA",
              marginBottom: 4,
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAbaAtiva(tab.id)}
                className="cursor-pointer flex items-center gap-2"
                style={{
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: abaAtiva === tab.id ? "#D4500A" : "#7A6255",
                  background: "none",
                  border: "none",
                  borderBottom: abaAtiva === tab.id ? "2px solid #D4500A" : "2px solid transparent",
                  marginBottom: -1,
                  transition: "color 0.2s, border-color 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop: vertical tabs */}
          <div className="hidden lg:flex flex-col gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAbaAtiva(tab.id)}
                className="cursor-pointer flex items-center gap-3 text-left"
                style={{
                  padding: "10px 14px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: abaAtiva === tab.id ? "#D4500A" : "#7A6255",
                  background: abaAtiva === tab.id ? "rgba(212,80,10,0.06)" : "none",
                  border: "none",
                  borderLeft: abaAtiva === tab.id ? "2px solid #D4500A" : "2px solid transparent",
                  borderRadius: "0 10px 10px 0",
                  transition: "color 0.2s, background-color 0.2s, border-color 0.2s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {/* Aba Perfil */}
          {abaAtiva === "perfil" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Discord-style profile header card */}
              <div
                style={{
                  backgroundColor: "#2A1F14",
                  borderRadius: 20,
                  padding: 0,
                  overflow: "hidden",
                }}
              >
                {/* Banner */}
                <div
                  style={{
                    height: 120,
                    background: "linear-gradient(135deg, #D4500A 0%, #A83D08 50%, #2A1F14 100%)",
                    borderRadius: "20px 20px 0 0",
                    position: "relative",
                  }}
                />

                {/* Avatar + info area */}
                <div style={{ padding: "0 24px 20px 24px", position: "relative" }}>
                  {/* Avatar overlapping banner */}
                  <div
                    onClick={() => setAvatarPickerAberto(true)}
                    className="cursor-pointer"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: perfil?.avatar ? "none" : "linear-gradient(135deg, #5A5A5A, #2C2C2C)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "4px solid #2A1F14",
                      marginTop: -40,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {perfil?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/avatars/${perfil.avatar}.svg`}
                        alt="Avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span
                        style={{
                          color: "#FFFFFF",
                          fontSize: 24,
                          fontWeight: 600,
                          fontFamily: "var(--font-dm-sans)",
                        }}
                      >
                        {iniciais}
                      </span>
                    )}

                    {/* Edit overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.15s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </div>

                    {/* Plan badge next to avatar */}
                    {planoAtual === "pro" || planoAtual === "anual" ? (
                      <span
                        style={{
                          position: "absolute",
                          bottom: -2,
                          right: -6,
                          background: "linear-gradient(135deg, #D4500A, #FF7A35)",
                          color: "#FFFFFF",
                          fontSize: 8,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          padding: "2px 7px",
                          borderRadius: 6,
                          border: "2px solid #2A1F14",
                          boxShadow: "0 0 8px rgba(212,80,10,0.4)",
                          lineHeight: "normal",
                        }}
                      >
                        PRO
                      </span>
                    ) : (
                      <span
                        style={{
                          position: "absolute",
                          bottom: -2,
                          right: -6,
                          background: "rgba(255,255,255,0.12)",
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 8,
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          padding: "2px 7px",
                          borderRadius: 6,
                          border: "2px solid #2A1F14",
                          lineHeight: "normal",
                        }}
                      >
                        FREE
                      </span>
                    )}
                  </div>

                  {/* User info */}
                  <div style={{ marginTop: 14 }}>
                    <p
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#FFFFFF",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {nomeExibir || "Usuario"}
                    </p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                      {userEmail}
                    </p>
                    {perfil?.cnpj && (
                      <p
                        style={{
                          fontFamily: "var(--font-dm-mono)",
                          fontSize: 14,
                          color: "rgba(255,255,255,0.4)",
                          marginTop: 6,
                        }}
                      >
                        {formatarCnpj(perfil.cnpj)}
                      </p>
                    )}
                    {memberSince && (
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
                        Membro desde {memberSince}
                      </p>
                    )}
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
                        color: "#7A6255",
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
                          color: "#2A1F14",
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
                          color: "#2A1F14",
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
                        <span style={{ fontSize: 15, color: "#2A1F14", fontWeight: 500 }}>
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

                  <p className="mt-3 mb-4" style={{ fontSize: 14, color: "#7A6255", lineHeight: 1.5 }}>
                    Informe o CNPJ do seu MEI para buscarmos seus dados automaticamente.
                  </p>

                  {/* Input CNPJ */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="cnpj"
                      className="text-sm"
                      style={{ fontWeight: 500, color: "#2A1F14" }}
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
                        border: "1px solid #E8E3DA",
                        fontSize: 16,
                        fontFamily: "var(--font-dm-mono)",
                        color: "#2A1F14",
                        backgroundColor: "#F2EFE9",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#D4500A";
                        e.target.style.boxShadow = "0 0 0 3px rgba(212,80,10,0.15)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E8E3DA";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  {/* Loading */}
                  {buscando && (
                    <p className="mt-3" style={{ fontSize: 13, color: "#7A6255" }}>
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
                        backgroundColor: "#FAF8F5",
                        border: "1px solid #E8E3DA",
                        borderRadius: 12,
                        padding: "16px 20px",
                      }}
                    >
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#2A1F14" }}>
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
                        <span style={{ fontSize: 13, color: "#2A1F14" }}>
                          {dadosCnpj.descricao_situacao_cadastral}
                        </span>
                      </div>

                      <p className="mt-2" style={{ fontSize: 13, color: "#7A6255" }}>
                        CNAE:{" "}
                        <span
                          style={{
                            fontFamily: "var(--font-dm-mono)",
                            color: "#2A1F14",
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
                          backgroundColor: "#D4500A",
                          color: "#FFFFFF",
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
                        color: "#7A6255",
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

              <p style={{ fontSize: 14, color: "#7A6255", lineHeight: 1.6, marginBottom: 20 }}>
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
                      backgroundColor: "#FAF8F5",
                      borderRadius: 12,
                      border: "1px solid #E8E3DA",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "#2A1F14" }}>
                          {item.titulo}
                        </p>
                        <p style={{ fontSize: 13, color: "#7A6255", marginTop: 2 }}>
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
      </div>

      <AvatarPicker
        aberto={avatarPickerAberto}
        onFechar={() => setAvatarPickerAberto(false)}
        avatarAtual={perfil?.avatar}
        onSelecionar={async (avatarId) => {
          if (atualizarPerfil) {
            await atualizarPerfil({ avatar: avatarId || null });
          }
          setPerfil((prev) => prev ? { ...prev, avatar: avatarId || null } : prev);
          mostrarToast(avatarId ? "Avatar atualizado" : "Avatar removido");
        }}
      />
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
              color: "#2A1F14",
              letterSpacing: "-0.02em",
            }}
          >
            {PLANOS.find((p) => p.id === planoAtual)?.preco || "R$ 0"}
          </span>
          <span style={{ fontSize: 14, color: "#7A6255" }}>
            {PLANOS.find((p) => p.id === planoAtual)?.periodo || ""}
          </span>
        </div>
        <p style={{ fontSize: 14, color: "#7A6255", marginTop: 6 }}>
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
                  border: isAtual ? "2px solid #D4500A" : "1px solid #E8E3DA",
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

                <p style={{ fontSize: 16, fontWeight: 600, color: "#2A1F14" }}>
                  {plano.nome}
                </p>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#2A1F14",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {plano.preco}
                  </span>
                  {plano.periodo && (
                    <span style={{ fontSize: 13, color: "#7A6255" }}>{plano.periodo}</span>
                  )}
                </div>

                <p style={{ fontSize: 13, color: "#7A6255", marginTop: 6, lineHeight: 1.4 }}>
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
                          stroke="#D4500A"
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
                      backgroundColor: "#EDE8E0",
                      color: "#7A6255",
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
                        backgroundColor: "#2A1F14",
                        color: "#D4500A",
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
        <p style={{ fontSize: 14, color: "#7A6255", lineHeight: 1.5 }}>
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
              color: "#7A6255",
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
