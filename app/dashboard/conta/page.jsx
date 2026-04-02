"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BRASIL_API_BASE } from "@/lib/constants";
import { extrairNome, formatarCnpj } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import { useDashboard } from "@/lib/dashboard-context";
import { inicializarDasUsuario } from "@/lib/das-service";

function limparCnpj(valor) {
  return valor.replace(/\D/g, "");
}

export default function ContaPage() {
  const router = useRouter();
  const supabase = createClient();
  const { mostrarToast } = useToast();
  const { recarregar } = useDashboard();

  const [carregando, setCarregando] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [editando, setEditando] = useState(false);

  // Estado do formulário de CNPJ
  const [cnpjInput, setCnpjInput] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [dadosCnpj, setDadosCnpj] = useState(null);
  const [erroCnpj, setErroCnpj] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Carregar perfil do usuário
  useEffect(() => {
    async function carregarPerfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

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
        setErroCnpj("CNPJ não encontrado. Verifique o número digitado.");
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

  // Formulário de CNPJ (novo ou editando)
  const mostrarFormulario = !perfil || editando;

  return (
    <div style={{ maxWidth: 560 }}>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#1C1C1C",
          letterSpacing: "-0.03em",
          marginBottom: 24,
        }}
      >
        {perfil && !editando ? "Minha conta" : "Complete seu perfil"}
      </h1>

      {/* Perfil existente */}
      {perfil && !editando && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D6D6D6",
            borderRadius: 12,
            padding: "22px 26px",
          }}
        >
          {/* CNPJ */}
          <div className="mb-4">
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#8A8A8A",
              }}
            >
              CNPJ
            </span>
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

          {/* Nome fantasia */}
          <div className="mb-4">
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#8A8A8A",
              }}
            >
              Nome fantasia
            </span>
            <p className="mt-1" style={{ fontSize: 16, color: "#1C1C1C", fontWeight: 500 }}>
              {extrairNome(perfil.nome_fantasia) || "Não informado"}
            </p>
          </div>

          {/* CNAE */}
          <div className="mb-4">
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#8A8A8A",
              }}
            >
              CNAE
            </span>
            <p
              className="mt-1"
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: 14,
                color: "#1C1C1C",
              }}
            >
              {perfil.cnae || "Não informado"}
            </p>
          </div>

          {/* Situação */}
          <div className="mb-4">
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#8A8A8A",
              }}
            >
              Situação na Receita
            </span>
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
              <span style={{ fontSize: 16, color: "#1C1C1C", fontWeight: 500 }}>
                {perfil.situacao || "Desconhecida"}
              </span>
            </div>
          </div>

          {/* Plano */}
          <div className="mb-5">
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#8A8A8A",
              }}
            >
              Plano
            </span>
            <div className="mt-1">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#6B7400",
                  backgroundColor: "rgba(212,230,0,0.12)",
                  padding: "3px 10px",
                  borderRadius: 99,
                }}
              >
                {perfil.plano === "pro"
                  ? "Pro"
                  : perfil.plano === "anual"
                    ? "Anual"
                    : "Free"}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setEditando(true);
              setCnpjInput("");
              setDadosCnpj(null);
              setErroCnpj("");
            }}
            className="py-2 px-4 rounded-lg text-sm cursor-pointer transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#1C1C1C",
              fontWeight: 500,
              border: "1px solid #D6D6D6",
            }}
          >
            Atualizar CNPJ
          </button>
        </div>
      )}

      {/* Formulário de CNPJ */}
      {mostrarFormulario && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D6D6D6",
            borderRadius: 12,
            padding: "22px 26px",
          }}
        >
          <p className="mb-4" style={{ fontSize: 14, color: "#8A8A8A" }}>
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
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #D6D6D6",
                fontSize: 16,
                fontFamily: "var(--font-dm-mono)",
                color: "#1C1C1C",
                backgroundColor: "#FFFFFF",
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

          {/* Card de confirmação */}
          {dadosCnpj && (
            <div
              className="mt-4"
              style={{
                backgroundColor: "#F7F7F5",
                border: "1px solid #D6D6D6",
                borderRadius: 8,
                padding: "16px 18px",
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
                className="w-full mt-4 py-2.5 rounded-lg text-sm cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: "#D4E600",
                  color: "#1C1C1C",
                  fontWeight: 600,
                  border: "none",
                }}
              >
                {salvando ? "Salvando..." : "Confirmar e salvar"}
              </button>
            </div>
          )}

          {/* Botão cancelar quando editando */}
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
  );
}
