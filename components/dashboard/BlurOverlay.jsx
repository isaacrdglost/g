"use client";

import Link from "next/link";

const BENEFICIOS = [
  { texto: "Acompanhe seu limite anual de R$ 81.000 em tempo real", icon: "M12 20V10M18 20V4M6 20v-4" },
  { texto: "Saiba exatamente quando o DAS vence e pague em 1 clique", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" },
  { texto: "Emita notas fiscais e controle seu faturamento mensal", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M10 13h4M10 17h2" },
  { texto: "Documentos do CNPJ sempre atualizados e acessiveis", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" },
];

export default function BlurOverlay({ children }) {
  return (
    <div className="relative">
      {/* Card flutuante */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          width: "100%",
          maxWidth: 500,
          backgroundColor: "#F2EFE9",
          border: "1px solid #E8E3DA",
          borderRadius: 20,
          padding: "32px 32px 28px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center" style={{ marginBottom: 20 }}>
          <img src="/logo-icon-light.svg" alt="Guiado" style={{ width: 36, height: 36 }} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#2A1F14", letterSpacing: "-0.03em", textAlign: "center" }}>
          Cadastre seu CNPJ para comecar
        </h2>
        <p style={{ fontSize: 14, color: "#7A6255", marginTop: 8, lineHeight: 1.6, textAlign: "center" }}>
          Com o CNPJ cadastrado, o Guiado busca seus dados na Receita Federal e ativa tudo automaticamente.
        </p>

        {/* Beneficios */}
        <div className="flex flex-col gap-3" style={{ marginTop: 24 }}>
          {BENEFICIOS.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "rgba(212,80,10,0.08)",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4500A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={b.icon} />
                </svg>
              </div>
              <span style={{ fontSize: 13, color: "#2A1F14", lineHeight: 1.5, paddingTop: 5 }}>
                {b.texto}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/dashboard/conta"
          className="flex items-center justify-center mt-6 py-3 rounded-xl text-sm transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#D4500A",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 15,
            textDecoration: "none",
          }}
        >
          Cadastrar meu CNPJ
        </Link>

        <p style={{ fontSize: 11, color: "#C8C2B8", textAlign: "center", marginTop: 12 }}>
          Leva menos de 1 minuto. Seus dados vem direto da Receita Federal.
        </p>
      </div>

      {/* Conteudo com blur */}
      <div
        style={{
          filter: "blur(4px)",
          opacity: 0.6,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
