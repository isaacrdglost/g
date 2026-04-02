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

    const total = registros
      .filter((r) => {
        const d = new Date(r.mes);
        return d.getFullYear() === ano && d.getMonth() === mes;
      })
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
        backgroundColor: "#1C1C1C",
        padding: "10px 16px",
        borderRadius: 10,
        fontSize: 13,
        fontFamily: "var(--font-dm-mono)",
        color: "#D4E600",
        fontWeight: 600,
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

export default function FaturamentoChart({ registros = [] }) {
  const [periodo, setPeriodo] = useState(6);
  const dados = gerarDadosMensais(registros, periodo);
  const temDados = dados.some((d) => d.valor > 0);

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EBEBEB",
        borderRadius: 16,
        padding: "24px 28px",
      }}
    >
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
          Faturamento mensal
        </span>

        <div
          className="flex"
          style={{
            backgroundColor: "#F3F3F3",
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
                backgroundColor: periodo === p ? "#FFFFFF" : "transparent",
                color: periodo === p ? "#1C1C1C" : "#8A8A8A",
                border: "none",
                transition: "all 0.2s ease",
              }}
            >
              {p} meses
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 240, marginTop: 20 }}>
        {temDados ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dados}
              margin={{ top: 5, right: 10, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="gradientLime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4E600" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#D4E600" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#F3F3F3"
                strokeDasharray="0"
              />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#8A8A8A" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#D6D6D6" }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                }
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#D4E600", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="#D4E600"
                strokeWidth={2.5}
                fill="url(#gradientLime)"
                dot={{ r: 0 }}
                activeDot={{
                  r: 5,
                  fill: "#D4E600",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span style={{ fontSize: 14, color: "#D6D6D6" }}>
              Nenhum faturamento lancado ainda
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
