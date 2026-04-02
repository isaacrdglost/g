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
          style={{ backgroundColor: "#F2EFE9", border: "1px solid #C8C2B8", borderRadius: 12, height: 200 }}
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
          color: "#2A1F14",
          letterSpacing: "-0.03em",
        }}
      >
        Emitir Nota Fiscal
      </h1>

      {/* Card principal */}
      <div
        style={{
          backgroundColor: "#F2EFE9",
          border: "1px solid #C8C2B8",
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
              backgroundColor: "#EDE8E0",
              color: "#2A1F14",
              flexShrink: 0,
            }}
          >
            <IconNota />
          </div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 600, color: "#2A1F14", letterSpacing: "-0.03em" }}>
              Nota Fiscal de Serviço (NFS-e)
            </p>
            <p style={{ fontSize: 14, color: "#7A6255", marginTop: 6, lineHeight: 1.6 }}>
              Como MEI, você pode emitir NFS-e pelo portal nacional. A emissão é gratuita e obrigatória quando o serviço é prestado para empresas.
            </p>
            <p style={{ fontSize: 14, color: "#7A6255", marginTop: 8, lineHeight: 1.6 }}>
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
            backgroundColor: "#D4500A",
            color: "#FFFFFF",
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
          backgroundColor: "rgba(212,80,10,0.12)",
          border: "1px solid #D4500A",
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
              backgroundColor: "#D4500A",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            G
          </span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#2A1F14" }}>
              Em breve: emissão direto pelo Guiado
            </p>
            <p style={{ fontSize: 13, color: "#A83D08", marginTop: 2 }}>
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
