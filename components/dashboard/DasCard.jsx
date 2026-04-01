"use client";

import { DIA_VENCIMENTO_DAS } from "@/lib/constants";

const STATUS_STYLES = {
  pendente: { label: "Pendente", color: "#7A5A00", bg: "#FFF3CD" },
  pago: { label: "Pago", color: "#8A8A8A", bg: "#F3F3F3" },
  atrasado: { label: "Atrasado", color: "#8B1A1A", bg: "#FDF0F0" },
};

export default function DasCard({ das, cnpj }) {
  if (!das) return null;

  const estilo = STATUS_STYLES[das.status] || STATUS_STYLES.pendente;

  // Calcular dias até vencimento
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

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #1C1C1C",
        borderTop: "3px solid #D4E600",
        borderRadius: 12,
        padding: "22px 26px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        {/* Título */}
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#8A8A8A",
          }}
        >
          DAS do mês
        </span>

        {/* Valor */}
        <div className="mt-2">
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: 26,
              fontWeight: 700,
              color: "#1C1C1C",
            }}
          >
            {das.valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>

        {/* Vencimento */}
        <p className="mt-2" style={{ fontSize: 13, color: "#8A8A8A" }}>
          {diasRestantes > 0 ? (
            <>
              Vence em{" "}
              <span style={{ fontWeight: 600, color: "#1C1C1C" }}>
                {diasRestantes} {diasRestantes === 1 ? "dia" : "dias"}
              </span>{" "}
              · {dataVencimento}
            </>
          ) : diasRestantes === 0 ? (
            <span style={{ fontWeight: 600, color: "#E05252" }}>
              Vence hoje · {dataVencimento}
            </span>
          ) : (
            <span style={{ fontWeight: 600, color: "#E05252" }}>
              Venceu em {dataVencimento}
            </span>
          )}
        </p>

        {/* Pill */}
        <span
          className="inline-flex items-center gap-1.5 mt-3"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: estilo.color,
            backgroundColor: estilo.bg,
            padding: "3px 10px",
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

      {/* Botão */}
      {das.status !== "pago" && (
        <a
          href={linkPgmei}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center mt-5 py-2.5 rounded-lg text-sm transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#1C1C1C",
            color: "#D4E600",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Gerar boleto no PGMEI
        </a>
      )}
    </div>
  );
}
