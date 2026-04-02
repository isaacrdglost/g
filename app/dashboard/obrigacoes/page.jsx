"use client";

import { useDashboard } from "@/lib/dashboard-context";
import BlurOverlay from "@/components/dashboard/BlurOverlay";
import Link from "next/link";

function IconCalendario() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="14" rx="2" />
      <path d="M2 8h16M6 4V2M14 4V2" />
    </svg>
  );
}

function IconDocumento() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6l-4-4z" />
      <path d="M12 2v4h4M8 10h4M8 14h2" />
    </svg>
  );
}

function IconAlvara() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  );
}

function calcularStatusDasn() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const prazo = new Date(ano, 4, 31); // 31 de maio
  const diffMs = prazo.getTime() - hoje.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return { status: "atrasado", texto: "Prazo encerrado", dias: 0 };
  if (diffDias <= 30) return { status: "pendente", texto: `${diffDias} dias restantes`, dias: diffDias };
  return { status: "em_dia", texto: `Prazo: 31/05/${ano}`, dias: diffDias };
}

const STATUS_STYLES = {
  em_dia: { label: "Em dia", color: "#6B7400", bg: "rgba(212,230,0,0.12)" },
  pendente: { label: "Pendente", color: "#7A5A00", bg: "#FFF3CD" },
  atrasado: { label: "Atrasado", color: "#8B1A1A", bg: "#FDF0F0" },
};

export default function ObrigacoesPage() {
  const { carregando, semCnpj } = useDashboard();

  const dasn = calcularStatusDasn();
  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const diasParaDas = diaAtual <= 20 ? 20 - diaAtual : 0;
  const statusDas = diaAtual <= 20 ? "em_dia" : "pendente";

  const obrigacoes = [
    {
      icon: <IconCalendario />,
      titulo: "DAS mensal",
      descricao: "Pagamento do Documento de Arrecadação do Simples Nacional. Vence todo dia 20.",
      prazo: diasParaDas > 0 ? `Vence em ${diasParaDas} dias` : "Vence hoje",
      status: statusDas,
      acao: { label: "Ver DAS", href: "/dashboard/das" },
    },
    {
      icon: <IconDocumento />,
      titulo: "DASN-SIMEI (Declaração Anual)",
      descricao: "Declaração anual de faturamento do MEI. Deve ser entregue todo ano.",
      prazo: dasn.texto,
      status: dasn.status,
      acao: {
        label: "Acessar portal",
        href: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/dasnsimei.app/Identificacao",
        externo: true,
      },
    },
    {
      icon: <IconAlvara />,
      titulo: "Alvará de funcionamento",
      descricao: "Verifique com a prefeitura da sua cidade se o alvará precisa de renovação anual.",
      prazo: "Consulte sua prefeitura",
      status: "em_dia",
      acao: null,
    },
  ];

  if (carregando) {
    return (
      <div className="flex flex-col gap-5" style={{ maxWidth: 780 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #D6D6D6", borderRadius: 12, height: 100 }}
          />
        ))}
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
        Obrigações
      </h1>

      <div className="flex flex-col gap-3">
        {obrigacoes.map((item, i) => {
          const estilo = STATUS_STYLES[item.status];
          return (
            <div
              key={i}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D6D6D6",
                borderRadius: 12,
                padding: "20px 24px",
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: "#F3F3F3",
                      color: "#1C1C1C",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1C" }}>
                      {item.titulo}
                    </p>
                    <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 2, lineHeight: 1.5 }}>
                      {item.descricao}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "var(--font-dm-mono)",
                          color: "#1C1C1C",
                        }}
                      >
                        {item.prazo}
                      </span>
                      <span
                        className="flex items-center gap-1.5"
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: estilo.color,
                          backgroundColor: estilo.bg,
                          padding: "2px 8px",
                          borderRadius: 99,
                        }}
                      >
                        <span
                          className="inline-block rounded-full"
                          style={{ width: 6, height: 6, backgroundColor: estilo.color, flexShrink: 0 }}
                        />
                        {estilo.label}
                      </span>
                    </div>
                  </div>
                </div>

                {item.acao && (
                  item.acao.externo ? (
                    <a
                      href={item.acao.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg text-xs transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#1C1C1C",
                        fontWeight: 500,
                        border: "1px solid #D6D6D6",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {item.acao.label}
                    </a>
                  ) : (
                    <Link
                      href={item.acao.href}
                      className="px-4 py-2 rounded-lg text-xs transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: "#1C1C1C",
                        color: "#D4E600",
                        fontWeight: 500,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {item.acao.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (semCnpj) return <BlurOverlay>{conteudo}</BlurOverlay>;
  return conteudo;
}
