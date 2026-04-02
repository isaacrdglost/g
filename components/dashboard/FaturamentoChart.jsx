"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

const MESES_LABEL = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function gerarDadosMensais(registros, qtdMeses) {
  const hoje = new Date();
  const meses = [];

  for (let i = qtdMeses - 1; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const ano = data.getFullYear();
    const mes = data.getMonth();

    const chave = `${ano}-${String(mes + 1).padStart(2, "0")}`;
    const total = registros
      .filter((r) => r.mes?.startsWith(chave))
      .reduce((soma, r) => soma + Number(r.valor), 0);

    meses.push({ mes: MESES_LABEL[mes], valor: total });
  }

  return meses;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div
      style={{
        backgroundColor: "#2A1F14",
        padding: "10px 16px",
        borderRadius: 10,
        fontSize: 13,
        fontFamily: "var(--font-dm-mono)",
        color: "#D4500A",
        fontWeight: 600,
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 400, display: "block", marginBottom: 2 }}>
        {label}
      </span>
      {Number(payload[0].value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}
    </div>
  );
}

export default function FaturamentoChart({ registros = [], valorMes = 0, valorMesAnterior = 0 }) {
  const [periodo, setPeriodo] = useState(6);
  const dados = gerarDadosMensais(registros, periodo);
  const temDados = dados.some((d) => d.valor > 0);

  const variacao = valorMesAnterior > 0
    ? Math.round(((valorMes - valorMesAnterior) / valorMesAnterior) * 100)
    : 0;

  return (
    <div
      style={{
        backgroundColor: "#F2EFE9",
        border: "1px solid #E8E3DA",
        borderRadius: 16,
        padding: "24px 28px",
        height: "100%",
      }}
    >
      {/* Header: valor + variacao + toggle */}
      <div className="flex items-start justify-between">
        <div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#7A6255",
            }}
          >
            Faturamento do mes
          </span>

          <div className="flex items-baseline gap-3" style={{ marginTop: 8 }}>
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: 28,
                fontWeight: 700,
                color: "#2A1F14",
                letterSpacing: "-0.02em",
              }}
            >
              {valorMes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            {variacao !== 0 && (
              <span
                className="inline-flex items-center gap-1"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-dm-mono)",
                  color: variacao > 0 ? "#A83D08" : "#8B1A1A",
                  backgroundColor: variacao > 0 ? "rgba(212,80,10,0.12)" : "#FDF0F0",
                  padding: "3px 8px",
                  borderRadius: 99,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  {variacao > 0 ? <path d="M1 7l3-3 2 2 3-4" /> : <path d="M1 3l3 3 2-2 3 4" />}
                </svg>
                {variacao > 0 ? "+" : ""}{variacao}%
              </span>
            )}
          </div>
        </div>

        <div
          className="flex"
          style={{
            backgroundColor: "#EDE8E0",
            borderRadius: 8,
            padding: 2,
          }}
        >
          {[6, 12].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className="px-3 py-1 rounded-md text-xs cursor-pointer"
              style={{
                fontWeight: 500,
                backgroundColor: periodo === p ? "#F2EFE9" : "transparent",
                color: periodo === p ? "#2A1F14" : "#7A6255",
                border: "none",
                transition: "all 0.2s ease",
              }}
            >
              {p}m
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 200, marginTop: 16 }}>
        {temDados ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dados}
              margin={{ top: 5, right: 10, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="gradientLime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4500A" stopOpacity={0.35} />
                  <stop offset="50%" stopColor="#D4500A" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#D4500A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#EDE8E0"
                strokeDasharray="0"
              />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#7A6255" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#C8C2B8" }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                }
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#D4500A", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="#D4500A"
                strokeWidth={3}
                fill="url(#gradientLime)"
                dot={{ r: 0 }}
                activeDot={{
                  r: 6,
                  fill: "#D4500A",
                  stroke: "#F2EFE9",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span style={{ fontSize: 14, color: "#C8C2B8" }}>
              Nenhum faturamento lancado ainda
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
