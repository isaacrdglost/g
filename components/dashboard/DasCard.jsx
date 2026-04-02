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
        border: "1px solid #EBEBEB",
        borderRadius: 16,
        padding: "24px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
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
        <a
          href={linkPgmei}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center py-2.5 rounded-xl text-sm btn-primary"
          style={{
            backgroundColor: "#1C1C1C",
            color: "#D4E600",
            fontWeight: 600,
            textDecoration: "none",
            marginTop: 20,
          }}
        >
          Gerar boleto no PGMEI
        </a>
      )}
    </div>
  );
}
