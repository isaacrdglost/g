"use client";

import { useState } from "react";
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
  const [fasePagamento, setFasePagamento] = useState(false);
  const [dataPagamento, setDataPagamento] = useState(() => new Date().toISOString().split("T")[0]);
  const [salvando, setSalvando] = useState(false);

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
    setFasePagamento(false);
    setDataPagamento(new Date().toISOString().split("T")[0]);
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
          backgroundColor: "#FFFFFF",
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
            backgroundColor: "#D4E600",
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
              backgroundColor: "#1C1C1C",
              color: "#D4E600",
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

      {/* Modal */}
      {modalAberto && (
        <>
          <div
            onClick={fecharModal}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 50,
              animation: "fadeIn 0.2s ease-out",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 51,
              width: "100%",
              maxWidth: 420,
              margin: "0 16px",
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              overflow: "hidden",
              animation: "modalIn 0.3s ease-out",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between" style={{ padding: "24px 24px 0" }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1C1C1C", letterSpacing: "-0.03em" }}>
                  Pagar DAS
                </h2>
                <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 2 }}>
                  Competencia de {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={fecharModal}
                className="cursor-pointer"
                style={{ background: "none", border: "none", color: "#D6D6D6", padding: 4 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M4 4l10 10M14 4l-10 10" />
                </svg>
              </button>
            </div>

            <div style={{ padding: "20px 24px 24px" }}>
              {!fasePagamento ? (
                <div className="flex flex-col gap-3">
                  {/* CTA principal - Gerar boleto */}
                  <a
                    href={linkPgmei}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 btn-primary"
                    style={{
                      padding: "18px 20px",
                      borderRadius: 16,
                      textDecoration: "none",
                      backgroundColor: "#1C1C1C",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: "rgba(212,230,0,0.15)",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#D4E600" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 1H5a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7l-6-6z" />
                        <path d="M11 1v6h6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>
                        Gerar boleto no PGMEI
                      </p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                        Abre o portal da Receita Federal
                      </p>
                    </div>
                    <div
                      className="flex items-center justify-center"
                      style={{
                        fontFamily: "var(--font-dm-mono)",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#D4E600",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {das.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                  </a>

                  {/* Separador */}
                  <div className="flex items-center gap-3" style={{ padding: "4px 0" }}>
                    <div style={{ flex: 1, height: 1, backgroundColor: "#EBEBEB" }} />
                    <span style={{ fontSize: 11, color: "#D6D6D6", fontWeight: 500 }}>ou</span>
                    <div style={{ flex: 1, height: 1, backgroundColor: "#EBEBEB" }} />
                  </div>

                  {/* Secundario - Marcar como pago */}
                  <button
                    onClick={() => setFasePagamento(true)}
                    className="flex items-center gap-3 cursor-pointer"
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: "1px solid #EBEBEB",
                      backgroundColor: "#FFFFFF",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M4 8l2.5 2.5L12 5" />
                    </svg>
                    <span style={{ fontSize: 13, color: "#8A8A8A", fontWeight: 500 }}>
                      Ja paguei esse DAS
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D6D6D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto" }}>
                      <path d="M5 3l4 4-4 4" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#8A8A8A" }}>
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
                        border: "1px solid #EBEBEB",
                        fontSize: 14,
                        color: "#1C1C1C",
                      }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setFasePagamento(false)}
                      className="flex-1 py-3 rounded-xl cursor-pointer"
                      style={{
                        border: "1px solid #EBEBEB",
                        backgroundColor: "#FFFFFF",
                        color: "#8A8A8A",
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
                        backgroundColor: "#1C1C1C",
                        color: "#D4E600",
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
        </>
      )}
    </>
  );
}
