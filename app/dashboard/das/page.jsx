"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import BlurOverlay from "@/components/dashboard/BlurOverlay";
import ResumoCard from "@/components/dashboard/ResumoCard";
import { useToast } from "@/lib/toast-context";
import { DIA_VENCIMENTO_DAS } from "@/lib/constants";

const MESES_LABEL = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MESES_CURTO = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

const STATUS_STYLES = {
  pendente: { label: "Pendente", color: "#7A5A00", bg: "#FFF3CD" },
  pago: { label: "Pago", color: "#8A8A8A", bg: "#F3F3F3" },
  atrasado: { label: "Atrasado", color: "#8B1A1A", bg: "#FDF0F0" },
};

function calcularStatus(registro) {
  if (registro.status === "pago") return "pago";

  const hoje = new Date();
  const [anoComp, mesComp] = (registro.competencia || "").split("-").map(Number);
  const mesAtual = hoje.getFullYear() * 12 + (hoje.getMonth() + 1);
  const mesReg = anoComp * 12 + mesComp;

  if (mesReg < mesAtual) return "atrasado";
  return "pendente";
}

// Calcular juros estimados do DAS atrasado
// Multa: 0,33% ao dia (max 20%) + Selic mensal (~1%)
function calcularJurosEstimado(valorOriginal, competencia) {
  const hoje = new Date();
  const [ano, mes] = (competencia || "").split("-").map(Number);
  const vencimento = new Date(ano, mes - 1, DIA_VENCIMENTO_DAS);
  const diasAtraso = Math.max(0, Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24)));

  if (diasAtraso <= 0) return { valorEstimado: valorOriginal, diasAtraso: 0, temJuros: false };

  const multa = Math.min(diasAtraso * 0.0033, 0.20); // 0,33%/dia, max 20%
  const mesesAtraso = Math.max(1, Math.ceil(diasAtraso / 30));
  const selic = mesesAtraso * 0.01; // ~1% ao mes estimado

  const valorEstimado = valorOriginal * (1 + multa + selic);
  return { valorEstimado: Math.round(valorEstimado * 100) / 100, diasAtraso, temJuros: true };
}

const FAKE_DAS = [
  { id: "f1", competencia: "2026-04-01", valor: 71.6, status: "pago", data_pagamento: "2026-04-15" },
  { id: "f2", competencia: "2026-03-01", valor: 71.6, status: "pago", data_pagamento: "2026-03-18" },
  { id: "f3", competencia: "2026-02-01", valor: 71.6, status: "pago", data_pagamento: "2026-02-17" },
  { id: "f4", competencia: "2026-01-01", valor: 71.6, status: "pago", data_pagamento: "2026-01-19" },
  { id: "f5", competencia: "2025-12-01", valor: 66.6, status: "pago", data_pagamento: "2025-12-18" },
  { id: "f6", competencia: "2025-11-01", valor: 66.6, status: "pago", data_pagamento: "2025-11-16" },
];

export default function DasPage() {
  const { perfil, carregando: carregandoPerfil, semCnpj } = useDashboard();
  const supabase = createClient();
  const { mostrarToast } = useToast();

  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);
  const [confirmandoId, setConfirmandoId] = useState(null);
  const [dataPagamento, setDataPagamento] = useState("");

  useEffect(() => {
    if (!perfil) return;

    if (semCnpj) {
      setRegistros(FAKE_DAS);
      setCarregando(false);
      return;
    }

    async function carregar() {
      const { data } = await supabase
        .from("das_payments")
        .select("*")
        .eq("user_id", perfil.id)
        .order("competencia", { ascending: false });

      setRegistros(data || []);
      setCarregando(false);
    }
    carregar();
  }, [perfil, semCnpj]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClick() { setMenuAberto(null); }
    if (menuAberto) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [menuAberto]);

  function abrirConfirmacao(id) {
    setConfirmandoId(id);
    setDataPagamento(new Date().toISOString().split("T")[0]);
  }

  async function confirmarPagamento() {
    if (!confirmandoId || !dataPagamento) return;
    setSalvandoId(confirmandoId);

    const { data } = await supabase
      .from("das_payments")
      .update({ status: "pago", data_pagamento: dataPagamento })
      .eq("id", confirmandoId)
      .select()
      .single();

    if (data) {
      setRegistros((prev) => prev.map((r) => (r.id === data.id ? data : r)));
      mostrarToast("DAS marcado como pago");
    }
    setSalvandoId(null);
    setConfirmandoId(null);
    setDataPagamento("");
  }

  async function desfazerPagamento(id) {
    setSalvandoId(id);
    const { data } = await supabase
      .from("das_payments")
      .update({ status: "pendente", data_pagamento: null })
      .eq("id", id)
      .select()
      .single();

    if (data) {
      setRegistros((prev) => prev.map((r) => (r.id === id ? data : r)));
      mostrarToast("Pagamento desfeito");
    }
    setSalvandoId(null);
    setMenuAberto(null);
  }

  // Resumo
  const resumo = registros.reduce(
    (acc, r) => {
      const status = calcularStatus(r);
      if (status === "pago") {
        acc.pagos++;
        acc.totalPago += Number(r.valor);
      } else if (status === "atrasado") {
        acc.atrasados++;
      } else {
        acc.pendentes++;
      }
      return acc;
    },
    { pagos: 0, pendentes: 0, atrasados: 0, totalPago: 0 }
  );

  const linkPgmei = `https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao?cnpj=${perfil?.cnpj || ""}`;
  const temAtrasados = resumo.atrasados > 0;

  if (carregandoPerfil || carregando) {
    return (
      <div className="flex flex-col gap-5" style={{ maxWidth: 780 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #EBEBEB", borderRadius: 16, height: 80 }}
            />
          ))}
        </div>
      </div>
    );
  }

  const conteudo = (
    <div className="flex flex-col gap-5" style={{ maxWidth: 780 }}>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#1C1C1C",
          letterSpacing: "-0.03em",
        }}
      >
        Pagamento DAS
      </h1>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResumoCard label="Pagos no ano" valor={resumo.pagos} cor="#1C1C1C" />
        <ResumoCard label="Pendentes" valor={resumo.pendentes} cor="#7A5A00" />
        <ResumoCard label="Atrasados" valor={resumo.atrasados} cor="#8B1A1A" />
        <ResumoCard
          label="Total pago no ano"
          valor={resumo.totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          cor="#1C1C1C"
          mono
        />
      </div>

      {/* Lista de DAS */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EBEBEB",
          borderRadius: 16,
        }}
      >
        {registros.length === 0 && (
          <p style={{ padding: 24, fontSize: 14, color: "#8A8A8A", textAlign: "center" }}>
            Nenhum registro de DAS
          </p>
        )}

        {registros.map((registro, i) => {
          const status = calcularStatus(registro);
          const estilo = STATUS_STYLES[status];
          const [anoStr, mesStr] = (registro.competencia || "").split("-");
          const mesIndex = parseInt(mesStr, 10) - 1;
          const ano = anoStr;
          const salvando = salvandoId === registro.id;

          const atrasado = status === "atrasado";
          const juros = atrasado ? calcularJurosEstimado(Number(registro.valor), registro.competencia) : null;

          return (
            <div key={registro.id}>
            <div
              className="flex items-center justify-between"
              style={{
                padding: "16px 22px",
                borderBottom: (confirmandoId !== registro.id && i < registros.length - 1) ? "1px solid #F3F3F3" : "none",
              }}
            >
              {/* Esquerda */}
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: "#F7F7F5",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#8A8A8A",
                    letterSpacing: "0.02em",
                  }}
                >
                  {MESES_CURTO[mesIndex]}
                </div>

                <div>
                  <span className="block text-sm" style={{ fontWeight: 500, color: "#1C1C1C" }}>
                    {MESES_LABEL[mesIndex]} {ano}
                  </span>
                  <span
                    className="block"
                    style={{
                      fontSize: 13,
                      fontFamily: "var(--font-dm-mono)",
                      color: "#8A8A8A",
                    }}
                  >
                    {Number(registro.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    {atrasado && juros && (
                      <span style={{ color: "#8B1A1A", marginLeft: 4 }}>
                        (~{juros.valorEstimado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}*)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Direita */}
              <div className="flex items-center gap-3">
                {status === "pago" && registro.data_pagamento && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "#D6D6D6",
                      fontFamily: "var(--font-dm-mono)",
                    }}
                  >
                    {(() => {
                      const [a, m, d] = (registro.data_pagamento || "").split("-");
                      return d ? `${d}/${m}/${a}` : "";
                    })()}
                  </span>
                )}

                {/* Pill */}
                <span
                  className="flex items-center gap-1.5"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: estilo.color,
                    backgroundColor: estilo.bg,
                    padding: "3px 10px",
                    borderRadius: 99,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    className="inline-block rounded-full"
                    style={{ width: 5, height: 5, backgroundColor: estilo.color, flexShrink: 0 }}
                  />
                  {estilo.label}
                </span>

                {/* Acoes */}
                {status !== "pago" && (
                  <>
                    <a
                      href={linkPgmei}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:flex px-3 py-1.5 rounded-lg text-xs btn-primary"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#1C1C1C",
                        fontWeight: 500,
                        border: "1px solid #EBEBEB",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Gerar boleto
                    </a>

                    <button
                      onClick={() => abrirConfirmacao(registro.id)}
                      className="px-3 py-1.5 rounded-lg text-xs cursor-pointer btn-primary"
                      style={{
                        backgroundColor: "#1C1C1C",
                        color: "#D4E600",
                        fontWeight: 500,
                        border: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Marcar como pago
                    </button>
                  </>
                )}

                {/* Menu 3 pontos (pago) */}
                {status === "pago" && (
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuAberto(menuAberto === registro.id ? null : registro.id);
                      }}
                      className="cursor-pointer"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#D6D6D6",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="8" cy="3" r="1.5" />
                        <circle cx="8" cy="8" r="1.5" />
                        <circle cx="8" cy="13" r="1.5" />
                      </svg>
                    </button>

                    {menuAberto === registro.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "100%",
                          marginTop: 4,
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #EBEBEB",
                          borderRadius: 12,
                          padding: "4px",
                          minWidth: 180,
                          zIndex: 30,
                          animation: "fadeIn 0.15s ease-out",
                        }}
                      >
                        <button
                          onClick={() => desfazerPagamento(registro.id)}
                          disabled={salvando}
                          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm cursor-pointer disabled:opacity-50"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#1C1C1C",
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F7F5"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M2 5h8M4 5l1-3h4l1 3M3 5v6.5a1.5 1.5 0 001.5 1.5h5a1.5 1.5 0 001.5-1.5V5" />
                          </svg>
                          Desfazer pagamento
                        </button>
                        <a
                          href={linkPgmei}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm"
                          style={{
                            textDecoration: "none",
                            color: "#1C1C1C",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F7F5"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 8v3.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 11.5v-7A1.5 1.5 0 012.5 3H6M9 1h4v4M6 8L13 1" />
                          </svg>
                          Ver no PGMEI
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Painel de confirmacao de pagamento */}
            {confirmandoId === registro.id && (
              <div
                style={{
                  padding: "16px 22px",
                  backgroundColor: "#F7F7F5",
                  borderBottom: i < registros.length - 1 ? "1px solid #F3F3F3" : "none",
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 500, color: "#1C1C1C", marginBottom: 12 }}>
                  Quando voce pagou esse DAS?
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={dataPagamento}
                    onChange={(e) => setDataPagamento(e.target.value)}
                    className="outline-none"
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #EBEBEB",
                      fontSize: 14,
                      color: "#1C1C1C",
                      backgroundColor: "#FFFFFF",
                    }}
                  />
                  <button
                    onClick={confirmarPagamento}
                    disabled={salvandoId === registro.id || !dataPagamento}
                    className="px-4 py-2.5 rounded-xl text-xs cursor-pointer btn-primary disabled:opacity-50"
                    style={{
                      backgroundColor: "#1C1C1C",
                      color: "#D4E600",
                      fontWeight: 600,
                      border: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {salvandoId === registro.id ? "Salvando..." : "Confirmar"}
                  </button>
                  <button
                    onClick={() => { setConfirmandoId(null); setDataPagamento(""); }}
                    className="px-3 py-2.5 rounded-xl text-xs cursor-pointer"
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: "#8A8A8A",
                      fontWeight: 500,
                      border: "1px solid #EBEBEB",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            </div>
          );
        })}
      </div>

      {/* Legenda de juros */}
      {temAtrasados && (
        <p style={{ fontSize: 12, color: "#D6D6D6", lineHeight: 1.5 }}>
          * Valores estimados com multa (0,33% ao dia, max 20%) e juros (~1% ao mes baseado na Selic). O valor exato e calculado no portal do PGMEI na hora de gerar o boleto.
        </p>
      )}
    </div>
  );

  if (semCnpj) return <BlurOverlay>{conteudo}</BlurOverlay>;
  return conteudo;
}
