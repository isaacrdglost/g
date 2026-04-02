"use client";

import { useEffect, useState } from "react";
import { LIMITE_ANUAL } from "@/lib/constants";

function calcularProjecao(totalFaturado, mesesDecorridos) {
  if (totalFaturado === 0 || mesesDecorridos === 0) return null;
  const mediaMensal = totalFaturado / mesesDecorridos;
  if (mediaMensal === 0) return null;

  const restante = LIMITE_ANUAL - totalFaturado;
  const mesesRestantes = Math.ceil(restante / mediaMensal);

  const dataProjecao = new Date();
  dataProjecao.setMonth(dataProjecao.getMonth() + mesesRestantes);

  return dataProjecao.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export default function LimitBar({ totalFaturado = 0, mesesDecorridos = 1 }) {
  const [largura, setLargura] = useState(0);

  const percentual = Math.min(
    Math.round((totalFaturado / LIMITE_ANUAL) * 100),
    100
  );
  const restante = Math.max(LIMITE_ANUAL - totalFaturado, 0);
  const projecao = calcularProjecao(totalFaturado, mesesDecorridos);
  const mediaMensal = mesesDecorridos > 0 ? totalFaturado / mesesDecorridos : 0;

  useEffect(() => {
    const timer = setTimeout(() => setLargura(percentual), 50);
    return () => clearTimeout(timer);
  }, [percentual]);

  let corBarra = "#D4E600";
  if (percentual >= 90) corBarra = "#E05252";
  else if (percentual >= 75) corBarra = "#F59E0B";

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EBEBEB",
        borderRadius: 16,
        padding: "28px 32px",
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
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

          <div className="flex items-baseline gap-2 mt-3">
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: 40,
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
                fontSize: 16,
                color: "#D6D6D6",
                fontWeight: 400,
              }}
            >
              / R$ 81.000
            </span>
          </div>
        </div>

        {/* Percentual grande */}
        <div className="text-right">
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: 48,
              fontWeight: 300,
              color: "#1C1C1C",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {percentual}
            <span style={{ fontSize: 24, color: "#D6D6D6" }}>%</span>
          </span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div
        style={{
          height: 8,
          borderRadius: 99,
          backgroundColor: "#F3F3F3",
          overflow: "hidden",
          marginTop: 24,
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

      {/* Info row */}
      <div className="flex items-center justify-between" style={{ marginTop: 16 }}>
        <div className="flex items-center gap-4">
          {projecao && (
            <span style={{ fontSize: 13, color: "#8A8A8A" }}>
              Projecao:{" "}
              <span style={{ color: "#1C1C1C", fontWeight: 500 }}>
                {projecao}
              </span>
            </span>
          )}
          <span style={{ fontSize: 13, color: "#8A8A8A" }}>
            Media mensal:{" "}
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "#1C1C1C",
                fontWeight: 500,
              }}
            >
              {mediaMensal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </span>
        </div>

        <span
          style={{
            fontSize: 12,
            fontFamily: "var(--font-dm-mono)",
            color: "#6B7400",
            backgroundColor: "rgba(212,230,0,0.12)",
            padding: "5px 12px",
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
    </div>
  );
}
