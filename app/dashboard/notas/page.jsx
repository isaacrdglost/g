"use client";

import { useDashboard } from "@/lib/dashboard-context";
import BlurOverlay from "@/components/dashboard/BlurOverlay";

function IconNota() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3H8a3 3 0 00-3 3v16a3 3 0 003 3h12a3 3 0 003-3V10l-7-7z" />
      <path d="M16 3v7h7M10 14h8M10 18h5" />
    </svg>
  );
}

export default function NotasPage() {
  const { carregando, semCnpj } = useDashboard();

  if (carregando) {
    return (
      <div style={{ maxWidth: 780 }}>
        <div
          className="animate-pulse"
          style={{ backgroundColor: "#F2EFE9", border: "1px solid #D6D6D6", borderRadius: 12, height: 200 }}
        />
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
        Emitir Nota Fiscal
      </h1>

      {/* Card principal */}
      <div
        style={{
          backgroundColor: "#F2EFE9",
          border: "1px solid #D6D6D6",
          borderRadius: 12,
          padding: "28px 26px",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center"
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              backgroundColor: "#F3F3F3",
              color: "#1C1C1C",
              flexShrink: 0,
            }}
          >
            <IconNota />
          </div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 600, color: "#1C1C1C", letterSpacing: "-0.03em" }}>
              Nota Fiscal de Serviço (NFS-e)
            </p>
            <p style={{ fontSize: 14, color: "#8A8A8A", marginTop: 6, lineHeight: 1.6 }}>
              Como MEI, você pode emitir NFS-e pelo portal nacional. A emissão é gratuita e obrigatória quando o serviço é prestado para empresas.
            </p>
            <p style={{ fontSize: 14, color: "#8A8A8A", marginTop: 8, lineHeight: 1.6 }}>
              Para pessoas físicas, a emissão é opcional.
            </p>
          </div>
        </div>

        <a
          href="https://www.nfse.gov.br/EmissorNacional"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 mt-6 py-3 rounded-lg text-sm transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#FF5C00",
            color: "#1C1C1C",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 8v3.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 11.5v-7A1.5 1.5 0 012.5 3H6M9 1h4v4M6 8L13 1" />
          </svg>
          Acessar Emissor Nacional NFS-e
        </a>
      </div>

      {/* Card "em breve" */}
      <div
        style={{
          backgroundColor: "rgba(255,92,0,0.12)",
          border: "1px solid #FF5C00",
          borderRadius: 12,
          padding: "22px 26px",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: "#FF5C00",
              color: "#1C1C1C",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            G
          </span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1C" }}>
              Em breve: emissão direto pelo Guiado
            </p>
            <p style={{ fontSize: 13, color: "#CC4400", marginTop: 2 }}>
              Estamos trabalhando para você emitir NFS-e sem sair da plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (semCnpj) return <BlurOverlay>{conteudo}</BlurOverlay>;
  return conteudo;
}
