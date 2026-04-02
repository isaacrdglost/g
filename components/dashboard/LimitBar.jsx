"use client";

import { useEffect, useState } from "react";
import { LIMITE_ANUAL } from "@/lib/constants";

export default function LimitBar({ totalFaturado = 0 }) {
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

  let corBarra = "#FF5C00";
  if (percentual >= 90) corBarra = "#E05252";
  else if (percentual >= 75) corBarra = "#F59E0B";

  return (
    <div
      style={{
        backgroundColor: "#F2EFE9",
        border: "1px solid #EBEBEB",
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
            color: "#8A8A8A",
          }}
        >
          Limite anual de faturamento
        </span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-dm-mono)",
            color: "#CC4400",
            backgroundColor: "rgba(255,92,0,0.12)",
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
            color: "#1C1C1C",
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
            color: "#D6D6D6",
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
          backgroundColor: "#F3F3F3",
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
    </div>
  );
}
