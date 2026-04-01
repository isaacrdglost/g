"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

const MESES_LABEL = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

// Gerar dados dos últimos N meses a partir dos registros de faturamento
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

    meses.push({
      mes: MESES_LABEL[mes],
      valor: total,
    });
  }

  return meses;
}

export default function FaturamentoChart({ registros = [] }) {
  const [periodo, setPeriodo] = useState(6);
  const dados = gerarDadosMensais(registros, periodo);
  const ultimoIndex = dados.length - 1;
  const temDados = dados.some((d) => d.valor > 0);

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
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#8A8A8A",
          }}
        >
          Faturamento mensal
        </span>

        <div className="flex gap-1">
          {[6, 12].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className="px-3 py-1 rounded-md text-xs cursor-pointer transition-colors"
              style={{
                fontWeight: 500,
                backgroundColor:
                  periodo === p ? "rgba(212,230,0,0.12)" : "transparent",
                color: periodo === p ? "#6B7400" : "#8A8A8A",
                border: "none",
              }}
            >
              {p} meses
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className="mt-5" style={{ height: 220 }}>
        {temDados ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dados}
              margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
            >
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#8A8A8A" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#8A8A8A" }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                }
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={32}>
                {dados.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === ultimoIndex ? "#D4E600" : "#EBEBEB"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span style={{ fontSize: 14, color: "#8A8A8A" }}>
              Nenhum faturamento lançado ainda
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
