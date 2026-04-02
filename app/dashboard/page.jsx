"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import { DIA_VENCIMENTO_DAS } from "@/lib/constants";
import { calcularValorDas } from "@/lib/das-valores";

import LimitBar from "@/components/dashboard/LimitBar";
import DasCard from "@/components/dashboard/DasCard";
import FaturamentoCard from "@/components/dashboard/FaturamentoCard";
import SituacaoCard from "@/components/dashboard/SituacaoCard";
import FaturamentoChart from "@/components/dashboard/FaturamentoChart";
import DasHistorico from "@/components/dashboard/DasHistorico";
import BlurOverlay from "@/components/dashboard/BlurOverlay";

// Dados fake positivos para preview sem CNPJ
const FAKE_DAS = { valor: 71.6, status: "pago", competencia: new Date().toISOString() };
const FAKE_FATURAMENTOS = [
  { mes: "2026-01-01", valor: 5800 },
  { mes: "2026-02-01", valor: 6200 },
  { mes: "2026-03-01", valor: 7100 },
  { mes: "2026-04-01", valor: 6500 },
];
const FAKE_DAS_HISTORICO = [
  { id: "f1", competencia: "2026-04-01", valor: 71.6, status: "pago", data_pagamento: "2026-04-15" },
  { id: "f2", competencia: "2026-03-01", valor: 71.6, status: "pago", data_pagamento: "2026-03-18" },
  { id: "f3", competencia: "2026-02-01", valor: 71.6, status: "pago", data_pagamento: "2026-02-17" },
  { id: "f4", competencia: "2026-01-01", valor: 71.6, status: "pago", data_pagamento: "2026-01-19" },
  { id: "f5", competencia: "2025-12-01", valor: 66.6, status: "pago", data_pagamento: "2025-12-18" },
];

// Gerar os últimos 12 meses anteriores ao mês atual
function gerarMesesAnteriores(qtd) {
  const meses = [];
  const hoje = new Date();
  for (let i = 1; i <= qtd; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
    );
  }
  return meses;
}

export default function DashboardPage() {
  const { perfil, dadosCnpj, carregando: carregandoPerfil, semCnpj } = useDashboard();
  const supabase = createClient();

  const [faturamentos, setFaturamentos] = useState([]);
  const [dasRegistros, setDasRegistros] = useState([]);
  const [dasMesAtual, setDasMesAtual] = useState(null);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [mostrarBanner, setMostrarBanner] = useState(false);

  useEffect(() => {
    if (!perfil) return;

    // Sem CNPJ: mostrar dados fake
    if (semCnpj) {
      setCarregandoDados(false);
      return;
    }

    async function carregarDados() {
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const inicioAno = `${anoAtual}-01-01`;
      const fimAno = `${anoAtual}-12-31`;

      const [resFaturamento, resDas] = await Promise.all([
        supabase
          .from("faturamento")
          .select("*")
          .eq("user_id", perfil.id)
          .gte("mes", inicioAno)
          .lte("mes", fimAno)
          .order("mes", { ascending: true }),
        supabase
          .from("das_payments")
          .select("*")
          .eq("user_id", perfil.id)
          .order("competencia", { ascending: false }),
      ]);

      const fats = resFaturamento.data || [];
      let dasAll = resDas.data || [];

      setFaturamentos(fats);

      setDasRegistros(dasAll);

      // Verificar DAS do mês atual
      const mesAtual = `${anoAtual}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;
      let dasDoMes = dasAll.find((d) => {
        const comp = new Date(d.competencia);
        return (
          comp.getFullYear() === anoAtual &&
          comp.getMonth() === hoje.getMonth()
        );
      });

      if (!dasDoMes) {
        const valorDas = calcularValorDas(perfil.cnae);
        const { data: novoDas } = await supabase
          .from("das_payments")
          .insert({
            user_id: perfil.id,
            competencia: mesAtual,
            valor: valorDas,
            status: "pendente",
          })
          .select()
          .single();

        if (novoDas) {
          dasDoMes = novoDas;
          setDasRegistros((prev) => [novoDas, ...prev]);
        }
      }

      if (
        dasDoMes &&
        dasDoMes.status === "pendente" &&
        hoje.getDate() > DIA_VENCIMENTO_DAS
      ) {
        const { data: atualizado } = await supabase
          .from("das_payments")
          .update({ status: "atrasado" })
          .eq("id", dasDoMes.id)
          .select()
          .single();

        if (atualizado) {
          dasDoMes = atualizado;
          setDasRegistros((prev) =>
            prev.map((d) => (d.id === atualizado.id ? atualizado : d))
          );
        }
      }

      setDasMesAtual(dasDoMes);
      setCarregandoDados(false);
    }

    carregarDados();
  }, [perfil, semCnpj]);

  if (carregandoPerfil || carregandoDados) {
    return (
      <div className="flex flex-col gap-4">
        <div
          className="skeleton"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #F3F3F3",
            borderRadius: 16,
            padding: "28px 32px",
            height: 150,
          }}
        >
          <div className="rounded" style={{ width: 180, height: 10, backgroundColor: "#F3F3F3" }} />
          <div className="rounded mt-5" style={{ width: 260, height: 32, backgroundColor: "#F3F3F3" }} />
          <div className="rounded mt-5" style={{ width: "100%", height: 8, backgroundColor: "#F3F3F3" }} />
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #F3F3F3",
                borderRadius: 16,
                padding: "24px",
                height: 150,
              }}
            >
              <div className="rounded" style={{ width: 90, height: 8, backgroundColor: "#F3F3F3" }} />
              <div className="rounded mt-5" style={{ width: 130, height: 26, backgroundColor: "#F3F3F3" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Dados reais ou fake
  const usarFake = semCnpj;
  const hoje = new Date();
  const mesAtualIndex = hoje.getMonth();

  const fats = usarFake ? FAKE_FATURAMENTOS : faturamentos;
  const totalAnual = fats.reduce((s, f) => s + Number(f.valor), 0);
  const mesAtualStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const faturamentoMesAtual = fats
    .filter((f) => f.mes?.startsWith(mesAtualStr))
    .reduce((s, f) => s + Number(f.valor), 0);
  const mesesDecorridos = Math.max(mesAtualIndex + 1, 1);

  const dasAtual = usarFake ? FAKE_DAS : dasMesAtual;
  const dasHist = usarFake ? FAKE_DAS_HISTORICO : dasRegistros;

  const conteudo = (
    <div className="flex flex-col gap-5">
      {/* Banner de primeiro acesso (dados reais) */}
      {mostrarBanner && !usarFake && (
        <div
          className="flex items-center justify-between"
          style={{
            backgroundColor: "#FFF3CD",
            border: "1px solid #E5D590",
            borderRadius: 12,
            padding: "14px 20px",
          }}
        >
          <span style={{ fontSize: 14, color: "#7A5A00" }}>
            Encontramos seus últimos 12 meses de DAS. Marque os que você já pagou!
          </span>
          <Link
            href="/dashboard/das"
            className="px-4 py-1.5 rounded-lg text-sm"
            style={{
              backgroundColor: "#1C1C1C",
              color: "#D4E600",
              fontWeight: 500,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Atualizar histórico
          </Link>
        </div>
      )}

      <div className="card-animate">
        <LimitBar totalFaturado={totalAnual} mesesDecorridos={mesesDecorridos} />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="card-animate"><DasCard das={dasAtual} cnpj={perfil?.cnpj || "00000000000000"} /></div>
        <div className="card-animate"><FaturamentoCard valorMes={faturamentoMesAtual} totalAnual={totalAnual} /></div>
        <div className="card-animate"><SituacaoCard dadosCnpj={dadosCnpj} perfil={perfil} /></div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div className="card-animate"><FaturamentoChart registros={fats} /></div>
        <div className="card-animate"><DasHistorico registros={dasHist} /></div>
      </div>
    </div>
  );

  if (usarFake) {
    return <BlurOverlay>{conteudo}</BlurOverlay>;
  }

  return conteudo;
}
