"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

const MESES_LABEL = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const LIMITE_MENSAL = 81000 / 12; // 6750

function calcularMediaUltimos3(registros, hoje) {
  // Pega os ultimos 3 meses com dados reais (valor > 0)
  const mesesComValor = [];
  for (let i = 0; i < 12 && mesesComValor.length < 3; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const chave = `${ano}-${String(mes + 1).padStart(2, "0")}`;
    const total = registros
      .filter((r) => r.mes?.startsWith(chave))
      .reduce((soma, r) => soma + Number(r.valor), 0);
    if (total > 0) {
      mesesComValor.push(total);
    }
  }
  if (mesesComValor.length === 0) return 0;
  return mesesComValor.reduce((a, b) => a + b, 0) / mesesComValor.length;
}

function gerarDadosMensais(registros, qtdMeses) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const media3 = calcularMediaUltimos3(registros, hoje);

  const meses = [];

  if (qtdMeses === 12) {
    // Mostrar Jan-Dez do ano atual
    for (let m = 0; m < 12; m++) {
      const chave = `${anoAtual}-${String(m + 1).padStart(2, "0")}`;
      const total = registros
        .filter((r) => r.mes?.startsWith(chave))
        .reduce((soma, r) => soma + Number(r.valor), 0);

      if (m <= mesAtual) {
        // Mes atual ou passado: dado real
        meses.push({ mes: MESES_LABEL[m], valor: total, projecao: null });
      } else {
        // Mes futuro: projecao
        meses.push({ mes: MESES_LABEL[m], valor: null, projecao: media3 > 0 ? Math.round(media3) : null });
      }
    }
    // Conectar ultimo mes real com primeiro mes de projecao:
    // Adicionar projecao no ultimo mes real para a linha nao ter gap
    if (mesAtual < 11 && media3 > 0) {
      meses[mesAtual].projecao = meses[mesAtual].valor;
    }
  } else {
    // 6 meses: janela de 6 meses a partir de (mesAtual - 5)
    const mesInicio = mesAtual - 5;
    for (let i = 0; i < 6; i++) {
      const idx = mesInicio + i;
      const data = new Date(anoAtual, idx, 1);
      const ano = data.getFullYear();
      const mes = data.getMonth();
      const chave = `${ano}-${String(mes + 1).padStart(2, "0")}`;
      const total = registros
        .filter((r) => r.mes?.startsWith(chave))
        .reduce((soma, r) => soma + Number(r.valor), 0);

      const ehFuturo = (ano > anoAtual) || (ano === anoAtual && mes > mesAtual);
      if (ehFuturo) {
        meses.push({ mes: MESES_LABEL[mes], valor: null, projecao: media3 > 0 ? Math.round(media3) : null });
      } else {
        meses.push({ mes: MESES_LABEL[mes], valor: total, projecao: null });
      }
    }
    // Conectar ultimo mes real com projecao
    const ultimoReal = meses.findLastIndex((d) => d.valor !== null);
    const primeiroProj = meses.findIndex((d) => d.projecao !== null);
    if (ultimoReal >= 0 && primeiroProj >= 0 && media3 > 0) {
      meses[ultimoReal].projecao = meses[ultimoReal].valor;
    }
  }

  return meses;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const valorReal = payload.find((p) => p.dataKey === "valor");
  const valorProj = payload.find((p) => p.dataKey === "projecao");
  const valor = valorReal?.value ?? valorProj?.value;
  if (valor == null) return null;

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
        {label}{valorProj?.value != null && valorReal?.value == null ? " (projecao)" : ""}
      </span>
      {Number(valor).toLocaleString("pt-BR", {
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

  // Calcular projecao anual para texto conclusivo
  const hoje = new Date();
  const media3 = calcularMediaUltimos3(registros, hoje);
  const projecaoAnual = Math.round(media3 * 12);
  const ultrapassaLimite = projecaoAnual > 81000;

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
                <linearGradient id="gradientBrand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(212,80,10,0.15)" stopOpacity={1} />
                  <stop offset="50%" stopColor="rgba(212,80,10,0.05)" stopOpacity={1} />
                  <stop offset="100%" stopColor="rgba(212,80,10,0)" stopOpacity={1} />
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
              <ReferenceLine
                y={LIMITE_MENSAL}
                stroke="#E24B4A"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ value: "Limite mensal", position: "right", fontSize: 10, fill: "#E24B4A" }}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="#D4500A"
                strokeWidth={3}
                fill="url(#gradientBrand)"
                dot={{ r: 0 }}
                activeDot={{
                  r: 6,
                  fill: "#D4500A",
                  stroke: "#F2EFE9",
                  strokeWidth: 3,
                }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="projecao"
                stroke="#7A6255"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
                connectNulls
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

      {/* Conclusion text */}
      {temDados && media3 > 0 && (
        <p
          style={{
            fontSize: 12,
            fontWeight: 500,
            marginTop: 12,
            color: ultrapassaLimite ? "#E24B4A" : "#7A6255",
          }}
        >
          {ultrapassaLimite
            ? `Atencao: projecao de ${projecaoAnual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} ultrapassa o limite anual.`
            : `Projecao: ${projecaoAnual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} ate dezembro - dentro do limite.`}
        </p>
      )}
    </div>
  );
}
