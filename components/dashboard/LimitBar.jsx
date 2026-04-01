"use client";

import { useEffect, useState } from "react";
import { LIMITE_ANUAL } from "@/lib/constants";

// Calcular projeção de quando atinge o limite
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

  useEffect(() => {
    const timer = setTimeout(() => setLargura(percentual), 50);
    return () => clearTimeout(timer);
  }, [percentual]);

  // Cor da barra muda conforme percentual
  let corBarra = "#D4E600";
  if (percentual >= 90) corBarra = "#E05252";
  else if (percentual >= 75) corBarra = "#F59E0B";

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #D6D6D6",
        borderRadius: 12,
        padding: "22px 26px",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#8A8A8A",
            }}
          >
            Limite anual de faturamento
          </span>

          <div className="flex items-baseline gap-1.5 mt-2">
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: 32,
                fontWeight: 700,
                color: "#1C1C1C",
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
                fontSize: 18,
                color: "#8A8A8A",
              }}
            >
              / R$ 81.000
            </span>
          </div>
        </div>

        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: 36,
            fontWeight: 300,
            color: "#1C1C1C",
          }}
        >
          {percentual}%
        </span>
      </div>

      {/* Barra de progresso */}
      <div
        className="mt-4"
        style={{
          height: 6,
          borderRadius: 99,
          backgroundColor: "#EBEBEB",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${largura}%`,
            borderRadius: 99,
            backgroundColor: corBarra,
            transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between mt-3">
        <span style={{ fontSize: 13, color: "#8A8A8A" }}>
          {projecao ? (
            <>
              No ritmo atual, você atinge o limite em{" "}
              <span style={{ color: "#1C1C1C", fontWeight: 500 }}>
                {projecao}
              </span>
            </>
          ) : (
            "Comece a lançar faturamento para ver a projeção"
          )}
        </span>

        <span
          style={{
            fontSize: 12,
            fontFamily: "var(--font-dm-mono)",
            color: "#6B7400",
            backgroundColor: "rgba(212,230,0,0.12)",
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
    </div>
  );
}
