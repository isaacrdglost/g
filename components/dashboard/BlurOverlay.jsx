"use client";

import { useState } from "react";
import Link from "next/link";

export default function BlurOverlay({ children }) {
  const [fechado, setFechado] = useState(false);

  return (
    <div className="relative">
      {/* Card flutuante centralizado */}
      {!fechado && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            width: "100%",
            maxWidth: 420,
            backgroundColor: "#FFFFFF",
            border: "1px solid #D6D6D6",
            borderRadius: 12,
            padding: "24px 24px 20px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          {/* Botão fechar */}
          <button
            onClick={() => setFechado(true)}
            className="cursor-pointer"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "none",
              border: "none",
              padding: 4,
              color: "#8A8A8A",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>

          <p style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1C", letterSpacing: "-0.03em" }}>
            Cadastre seu CNPJ para acompanhar seu MEI
          </p>
          <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 6, lineHeight: 1.5 }}>
            Com o CNPJ cadastrado você acompanha DAS, faturamento e obrigações do seu negócio.
          </p>

          <Link
            href="/dashboard/conta"
            className="flex items-center justify-center mt-5 py-2.5 rounded-lg text-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "#D4E600",
              color: "#1C1C1C",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Cadastrar CNPJ
          </Link>
        </div>
      )}

      {/* Conteúdo com blur */}
      <div
        style={{
          filter: "blur(3px)",
          opacity: 0.7,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
