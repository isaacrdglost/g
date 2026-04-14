"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ModalUpgrade({ aberto, onFechar, recurso }) {
  // Bloquear scroll do body quando aberto
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [aberto]);

  // Fechar com Escape
  useEffect(() => {
    if (!aberto) return;
    function handleKey(e) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  const linkMensal = process.env.NEXT_PUBLIC_HUBLA_CHECKOUT_MENSAL || "#";
  const linkAnual = process.env.NEXT_PUBLIC_HUBLA_CHECKOUT_ANUAL || "#";

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Overlay */}
      <div
        onClick={onFechar}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
          backgroundColor: "#141414",
          borderRadius: 20,
          padding: "36px 32px 32px",
          border: "1px solid rgba(255,255,255,0.08)",
          animation: "modalIn 0.25s ease-out",
        }}
      >
        {/* Botao fechar */}
        <button
          onClick={onFechar}
          className="cursor-pointer"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            padding: 4,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>

        {/* Titulo */}
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#FAF8F5", letterSpacing: "-0.02em" }}>
          Recurso exclusivo do Pro
        </h2>

        {/* Descricao do recurso */}
        {recurso && (
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8, lineHeight: 1.5 }}>
            {recurso}
          </p>
        )}

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)", margin: "24px 0" }} />

        {/* Beneficios */}
        <div className="flex flex-col gap-2.5" style={{ marginBottom: 24 }}>
          {[
            "Historico completo de DAS automatico",
            "Lancamentos ilimitados",
            "Notas fiscais organizadas",
            "Alertas inteligentes",
            "Projecao de limite anual",
            "Documentos do CNPJ em 1 clique",
            "Suporte prioritario",
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-2.5">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M3 8l3.5 3.5L13 5" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{feat}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 24 }} />

        {/* Precos */}
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>
              R$ 59,90
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#FAF8F5", fontFamily: "var(--font-dm-mono)" }}>
              R$ 39,90
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>/mes</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>
              R$ 599,00
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#FAF8F5", fontFamily: "var(--font-dm-mono)" }}>
              R$ 359,00
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>/ano</span>
          </div>

          {/* Badge */}
          <span
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              fontSize: 12,
              fontWeight: 600,
              color: "#D4500A",
              backgroundColor: "rgba(212,80,10,0.12)",
              padding: "5px 12px",
              borderRadius: 99,
            }}
          >
            Preco de lancamento
          </span>
        </div>

        {/* Botoes */}
        <div className="flex flex-col gap-3" style={{ marginTop: 28 }}>
          <a
            href={linkMensal}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center cursor-pointer"
            style={{
              padding: "14px 24px",
              borderRadius: 12,
              backgroundColor: "#D4500A",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
              border: "none",
            }}
          >
            Assinar mensal - R$ 39,90
          </a>

          <a
            href={linkAnual}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center cursor-pointer"
            style={{
              padding: "14px 24px",
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#FAF8F5",
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            Assinar anual (3 meses gratis)
          </a>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
