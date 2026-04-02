"use client";

import { useEffect, useState } from "react";
import { LIMITE_ANUAL } from "@/lib/constants";
import InfoTooltip from "./InfoTooltip";

export default function LimitBar({ totalFaturado = 0, mesesDecorridos = 0 }) {
  const [largura, setLargura] = useState(0);

  const percentual = Math.min(
    Math.round((totalFaturado / LIMITE_ANUAL) * 100),
    100
  );
  const restante = Math.max(LIMITE_ANUAL - totalFaturado, 0);

  useEffect(() => {
    const timer = setTimeout(() => setLargura(percentual), 50);
    return () => clearTimeout(timer);
  }, [percentual]);

  let corBarra = "#D4500A";
  if (percentual >= 90) corBarra = "#E05252";
  else if (percentual >= 75) corBarra = "#F59E0B";

  return (
    <div
      style={{
        backgroundColor: "#F2EFE9",
        border: "1px solid #E8E3DA",
        borderRadius: 16,
        padding: "18px 24px",
      }}
    >
      {/* Label */}
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#7A6255",
          }}
        >
          Limite anual de faturamento
          <InfoTooltip text="O MEI pode faturar ate R$ 81.000 por ano. Se ultrapassar, precisa migrar para ME e pagar mais impostos." />
        </span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-dm-mono)",
            color: "#A83D08",
            backgroundColor: "rgba(212,80,10,0.12)",
            padding: "4px 10px",
            borderRadius: 99,
            fontWeight: 500,
          }}
        >
          {restante.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}{" "}
          restantes
        </span>
      </div>

      {/* Valor */}
      <div className="flex items-baseline gap-2">
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: 28,
            fontWeight: 700,
            color: "#2A1F14",
            letterSpacing: "-0.02em",
          }}
        >
          {totalFaturado.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: 14,
            color: "#C8C2B8",
            fontWeight: 400,
          }}
        >
          / R$ 81.000
        </span>
      </div>

      {/* Barra de progresso */}
      <div
        style={{
          height: 6,
          borderRadius: 99,
          backgroundColor: "#EDE8E0",
          overflow: "hidden",
          marginTop: 14,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${largura}%`,
            borderRadius: 99,
            backgroundColor: corBarra,
            transition: "width 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>

      {/* Contexto inteligente */}
      {mesesDecorridos > 0 && (() => {
        const mediaMensal = totalFaturado / mesesDecorridos;
        const projecaoAnual = mediaMensal * 12;
        const pct = (totalFaturado / 81000) * 100;

        let contexto = "";
        if (pct > 80) {
          contexto = "Risco alto. Considere migrar para ME antes de estourar.";
        } else if (pct >= 50) {
          const mesesParaEstourar = (81000 - totalFaturado) / mediaMensal;
          const hoje = new Date();
          const mesEstouro = new Date(hoje.getFullYear(), hoje.getMonth() + Math.ceil(mesesParaEstourar), 1);
          const nomeMes = mesEstouro.toLocaleDateString("pt-BR", { month: "long" });
          contexto = `Atencao: no ritmo atual voce atinge o limite em ${nomeMes}.`;
        } else {
          const projecaoFmt = projecaoAnual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
          contexto = `Voce esta tranquilo. Ritmo atual projeta ${projecaoFmt} ate dezembro.`;
        }

        return (
          <p style={{ fontSize: 12, color: "#7A6255", marginTop: 10, lineHeight: 1.5 }}>
            {contexto}
          </p>
        );
      })()}
    </div>
  );
}
