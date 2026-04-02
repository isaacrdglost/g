"use client";

import { useDashboard } from "@/lib/dashboard-context";
import BlurOverlay from "@/components/dashboard/BlurOverlay";

function IconExternal() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 8v3.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 11.5v-7A1.5 1.5 0 012.5 3H6M9 1h4v4M6 8L13 1" />
    </svg>
  );
}

const DOCUMENTOS = [
  {
    titulo: "CCMEI",
    descricao: "Certificado da Condição de Microempreendedor Individual. Comprova que você é MEI.",
    href: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/ccmei",
    icone: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="16" height="16" rx="2" />
        <path d="M8 11l2 2 4-4" />
      </svg>
    ),
  },
  {
    titulo: "Situação Cadastral",
    descricao: "Comprovante de inscrição e situação cadastral do seu CNPJ na Receita Federal.",
    href: "https://servicos.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp",
    icone: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M11 7v4l2.5 2.5" />
      </svg>
    ),
  },
  {
    titulo: "DAS pagos",
    descricao: "Acesse o portal PGMEI para consultar e gerar comprovantes de pagamento do DAS.",
    href: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao",
    icone: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="18" height="14" rx="2" />
        <path d="M2 8h18" />
        <path d="M6 12h4" />
      </svg>
    ),
  },
  {
    titulo: "DASN-SIMEI",
    descricao: "Declaração Anual do Simples Nacional para o MEI. Entregue todos os anos até 31 de maio.",
    href: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/dasnsimei.app/Identificacao",
    icone: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H7a2 2 0 00-2 2v14a2 2 0 002 2h8a2 2 0 002-2V6l-4-4z" />
        <path d="M13 2v4h4M9 10h4M9 14h2" />
      </svg>
    ),
  },
];

export default function DocumentosPage() {
  const { carregando, semCnpj } = useDashboard();

  if (carregando) {
    return (
      <div style={{ maxWidth: 780 }}>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #D6D6D6", borderRadius: 12, height: 160 }}
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
        Documentos
      </h1>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {DOCUMENTOS.map((doc, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D6D6D6",
              borderRadius: 12,
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: "#F3F3F3",
                  color: "#1C1C1C",
                  marginBottom: 14,
                }}
              >
                {doc.icone}
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1C" }}>
                {doc.titulo}
              </p>
              <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 4, lineHeight: 1.5 }}>
                {doc.descricao}
              </p>
            </div>

            <a
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-5 py-2.5 rounded-lg text-sm transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "#F3F3F3",
                color: "#1C1C1C",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Acessar
              <IconExternal />
            </a>
          </div>
        ))}
      </div>
    </div>
  );

  if (semCnpj) return <BlurOverlay>{conteudo}</BlurOverlay>;
  return conteudo;
}
