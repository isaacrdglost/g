"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import { useToast } from "@/lib/toast-context";
import { DIA_VENCIMENTO_DAS } from "@/lib/constants";

const STATUS_STYLES = {
  pendente: { label: "Pendente", color: "#7A5A00", bg: "#FFF3CD" },
  pago: { label: "Pago", color: "#8A8A8A", bg: "#F3F3F3" },
  atrasado: { label: "Atrasado", color: "#8B1A1A", bg: "#FDF0F0" },
};

export default function DasCard({ das, cnpj }) {
  const { mostrarToast } = useToast();
  const supabase = createClient();

  const [modalAberto, setModalAberto] = useState(false);
  const [fase, setFase] = useState("menu"); // menu | boleto | pago
  const [dataPagamento, setDataPagamento] = useState(() => new Date().toISOString().split("T")[0]);
  const [salvando, setSalvando] = useState(false);
  const [cnpjCopiado, setCnpjCopiado] = useState(false);

  if (!das) return null;

  const estilo = STATUS_STYLES[das.status] || STATUS_STYLES.pendente;

  const hoje = new Date();
  const vencimento = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    DIA_VENCIMENTO_DAS
  );
  const diffMs = vencimento.getTime() - hoje.getTime();
  const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const linkPgmei = `https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao?cnpj=${cnpj}`;
  const dataVencimento = vencimento.toLocaleDateString("pt-BR");

  function fecharModal() {
    setModalAberto(false);
    setFase("menu");
    setCnpjCopiado(false);
    setDataPagamento(new Date().toISOString().split("T")[0]);
  }

  function copiarCnpj() {
    navigator.clipboard.writeText(cnpj);
    setCnpjCopiado(true);
    mostrarToast("CNPJ copiado!");
  }

  async function confirmarPagamento() {
    if (!das.id) return;
    setSalvando(true);

    const { error } = await supabase
      .from("das_payments")
      .update({ status: "pago", data_pagamento: dataPagamento })
      .eq("id", das.id);

    if (error) {
      mostrarToast("Erro ao salvar. Tente novamente.", "error");
      setSalvando(false);
      return;
    }

    mostrarToast("DAS marcado como pago");
    setSalvando(false);
    fecharModal();
    window.dispatchEvent(new CustomEvent("recebimento-salvo"));
  }

  return (
    <>
      <div
        style={{
          backgroundColor: "#F2EFE9",
          border: "1px solid #EBEBEB",
          borderRadius: 16,
          padding: "24px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          height: "100%",
        }}
      >
        {/* Accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: "#E05E1A",
          }}
        />

        <div>
          <div className="flex items-center justify-between">
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8A8A8A",
              }}
            >
              DAS do mes
            </span>
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: estilo.color,
                backgroundColor: estilo.bg,
                padding: "3px 10px",
                borderRadius: 99,
              }}
            >
              <span
                className="inline-block rounded-full"
                style={{ width: 5, height: 5, backgroundColor: estilo.color }}
              />
              {estilo.label}
            </span>
          </div>

          <p
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: 32,
              fontWeight: 700,
              color: "#1C1C1C",
              marginTop: 12,
              letterSpacing: "-0.02em",
            }}
          >
            {das.valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>

          <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 8 }}>
            {das.status === "pago" ? (
              <span style={{ color: "#8A8A8A" }}>Pago</span>
            ) : diasRestantes > 0 ? (
              <>
                Vence em{" "}
                <span style={{ fontWeight: 600, color: "#1C1C1C" }}>
                  {diasRestantes} {diasRestantes === 1 ? "dia" : "dias"}
                </span>{" "}
                · {dataVencimento}
              </>
            ) : diasRestantes === 0 ? (
              <span style={{ fontWeight: 600, color: "#E05252" }}>
                Vence hoje
              </span>
            ) : (
              <span style={{ fontWeight: 600, color: "#E05252" }}>
                Venceu em {dataVencimento}
              </span>
            )}
          </p>
        </div>

        {das.status !== "pago" && (
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center justify-center py-2.5 rounded-xl text-sm btn-primary cursor-pointer"
            style={{
              backgroundColor: "#E05E1A",
              color: "#FFFFFF",
              fontWeight: 600,
              border: "none",
              marginTop: 20,
              width: "100%",
            }}
          >
            Pagar DAS
          </button>
        )}
      </div>

      {/* Modal via portal */}
      {modalAberto && createPortal(
        <>
          <div
            onClick={fecharModal}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 999,
              animation: "fadeIn 0.2s ease-out",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              width: "100%",
              maxWidth: 420,
              margin: "0 16px",
              backgroundColor: "#1C1C1C",
              borderRadius: 20,
              overflow: "hidden",
              animation: "modalIn 0.3s ease-out",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between" style={{ padding: "24px 24px 0" }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.03em" }}>
                  Pagar DAS
                </h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  Competencia de {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={fecharModal}
                className="cursor-pointer"
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", padding: 4 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M4 4l10 10M14 4l-10 10" />
                </svg>
              </button>
            </div>

            <div style={{ padding: "20px 24px 24px" }}>
              {fase === "menu" && (
                <div className="flex flex-col gap-3">
                  {/* Gerar boleto */}
                  <button
                    onClick={() => setFase("boleto")}
                    className="flex items-center gap-4 cursor-pointer"
                    style={{
                      padding: "18px 20px",
                      borderRadius: 16,
                      backgroundColor: "rgba(224,94,26,0.12)",
                      border: "1px solid rgba(224,94,26,0.15)",
                      textAlign: "left",
                      width: "100%",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(224,94,26,0.18)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(224,94,26,0.12)"; }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: "#E05E1A",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 1H5a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7l-6-6z" />
                        <path d="M11 1v6h6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#E05E1A" }}>
                        Gerar boleto no PGMEI
                      </p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                        Vamos te direcionar pro portal
                      </p>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-dm-mono)",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#E05E1A",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {das.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                  </button>

                  {/* Separador */}
                  <div className="flex items-center gap-3" style={{ padding: "4px 0" }}>
                    <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>ou</span>
                    <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
                  </div>

                  {/* Marcar como pago */}
                  <button
                    onClick={() => setFase("pago")}
                    className="flex items-center gap-3 cursor-pointer"
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      textAlign: "left",
                      width: "100%",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M4 8l2.5 2.5L12 5" />
                    </svg>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                      Ja paguei esse DAS
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto" }}>
                      <path d="M5 3l4 4-4 4" />
                    </svg>
                  </button>
                </div>
              )}

              {fase === "boleto" && (
                <div className="flex flex-col gap-4">
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                    O portal do PGMEI nao preenche o CNPJ automaticamente. Copie seu CNPJ abaixo e cole no campo do portal.
                  </p>

                  {/* CNPJ para copiar */}
                  <button
                    onClick={copiarCnpj}
                    className="flex items-center justify-between cursor-pointer"
                    style={{
                      padding: "16px 18px",
                      borderRadius: 14,
                      backgroundColor: "rgba(255,255,255,0.07)",
                      border: cnpjCopiado ? "1px solid rgba(224,94,26,0.3)" : "1px solid rgba(255,255,255,0.1)",
                      width: "100%",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-dm-mono)",
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#FFFFFF",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {cnpj}
                    </span>
                    {cnpjCopiado ? (
                      <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: "#E05E1A", fontWeight: 500 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#E05E1A" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 7l2.5 2.5L11 4" />
                        </svg>
                        Copiado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="4" y="4" width="9" height="9" rx="1.5" />
                          <path d="M10 4V2.5A1.5 1.5 0 008.5 1h-6A1.5 1.5 0 001 2.5v6A1.5 1.5 0 002.5 10H4" />
                        </svg>
                        Copiar
                      </span>
                    )}
                  </button>

                  {/* Botao ir pro portal */}
                  <a
                    href={linkPgmei}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (!cnpjCopiado) copiarCnpj();
                    }}
                    className="flex items-center justify-center py-3.5 rounded-xl btn-primary"
                    style={{
                      backgroundColor: "#E05E1A",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      fontSize: 15,
                      textDecoration: "none",
                      border: "none",
                    }}
                  >
                    Ir para o PGMEI
                  </a>

                  <button
                    onClick={() => setFase("menu")}
                    className="cursor-pointer"
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.3)",
                      fontSize: 13,
                      fontWeight: 500,
                      padding: 4,
                    }}
                  >
                    Voltar
                  </button>
                </div>
              )}

              {fase === "pago" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>
                      Quando voce pagou esse DAS?
                    </label>
                    <input
                      type="date"
                      value={dataPagamento}
                      onChange={(e) => setDataPagamento(e.target.value)}
                      className="outline-none"
                      style={{
                        padding: "14px 16px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.1)",
                        backgroundColor: "rgba(255,255,255,0.07)",
                        fontSize: 14,
                        color: "#FFFFFF",
                        colorScheme: "dark",
                      }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setFase("menu")}
                      className="flex-1 py-3 rounded-xl cursor-pointer"
                      style={{
                        border: "1px solid rgba(255,255,255,0.1)",
                        backgroundColor: "transparent",
                        color: "rgba(255,255,255,0.45)",
                        fontWeight: 500,
                        fontSize: 14,
                      }}
                    >
                      Voltar
                    </button>
                    <button
                      onClick={confirmarPagamento}
                      disabled={salvando}
                      className="flex-1 py-3 rounded-xl cursor-pointer btn-primary disabled:opacity-40"
                      style={{
                        border: "none",
                        backgroundColor: "#E05E1A",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {salvando ? "Salvando..." : "Confirmar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
