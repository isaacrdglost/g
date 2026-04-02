"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import { atualizarStatusDasAtrasados } from "@/lib/das-service";

import LimitBar from "@/components/dashboard/LimitBar";
import DasCard from "@/components/dashboard/DasCard";
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

export default function DashboardPage() {
  const { perfil, dadosCnpj, carregando: carregandoPerfil, semCnpj } = useDashboard();
  const supabase = createClient();

  const [faturamentos, setFaturamentos] = useState([]);
  const [dasRegistros, setDasRegistros] = useState([]);
  const [dasMesAtual, setDasMesAtual] = useState(null);
  const [carregandoDados, setCarregandoDados] = useState(true);

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
      const dasAll = resDas.data || [];

      setFaturamentos(fats);
      setDasRegistros(dasAll);

      // Atualizar status de DAS atrasados (uma vez por sessao)
      await atualizarStatusDasAtrasados(supabase, perfil.id);

      // Encontrar DAS do mes atual (somente leitura)
      const mesAtualStr = `${anoAtual}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
      const dasDoMes = dasAll.find((d) => d.competencia?.startsWith(mesAtualStr));
      setDasMesAtual(dasDoMes || null);

      setCarregandoDados(false);
    }

    carregarDados();

    // Escutar evento de recebimento salvo pelo modal
    function handleRecebimento() {
      carregarDados();
    }
    window.addEventListener("recebimento-salvo", handleRecebimento);
    return () => window.removeEventListener("recebimento-salvo", handleRecebimento);
  }, [perfil, semCnpj]);

  if (carregandoPerfil || carregandoDados) {
    return (
      <div className="flex flex-col gap-4">
        <div
          className="skeleton"
          style={{
            backgroundColor: "#F2EFE9",
            border: "1px solid #EDE8E0",
            borderRadius: 16,
            padding: "28px 32px",
            height: 150,
          }}
        >
          <div className="rounded" style={{ width: 180, height: 10, backgroundColor: "#EDE8E0" }} />
          <div className="rounded mt-5" style={{ width: 260, height: 32, backgroundColor: "#EDE8E0" }} />
          <div className="rounded mt-5" style={{ width: "100%", height: 8, backgroundColor: "#EDE8E0" }} />
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                backgroundColor: "#F2EFE9",
                border: "1px solid #EDE8E0",
                borderRadius: 16,
                padding: "24px",
                height: 150,
              }}
            >
              <div className="rounded" style={{ width: 90, height: 8, backgroundColor: "#EDE8E0" }} />
              <div className="rounded mt-5" style={{ width: 130, height: 26, backgroundColor: "#EDE8E0" }} />
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

  const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const mesAnteriorStr = `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, "0")}`;
  const faturamentoMesAnterior = fats
    .filter((f) => f.mes?.startsWith(mesAnteriorStr))
    .reduce((s, f) => s + Number(f.valor), 0);

  const dasAtual = usarFake ? FAKE_DAS : dasMesAtual;
  const dasHist = usarFake ? FAKE_DAS_HISTORICO : dasRegistros;

  const conteudo = (
    <div className="flex flex-col gap-5">
      <div className="card-animate">
        <LimitBar totalFaturado={totalAnual} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-animate"><DasCard das={dasAtual} cnpj={perfil?.cnpj || "00000000000000"} /></div>
        <div className="card-animate"><SituacaoCard dadosCnpj={dadosCnpj} perfil={perfil} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="card-animate"><FaturamentoChart registros={fats} valorMes={faturamentoMesAtual} valorMesAnterior={faturamentoMesAnterior} /></div>
        <div className="card-animate"><DasHistorico registros={dasHist} /></div>
      </div>
    </div>
  );

  if (usarFake) {
    return <BlurOverlay>{conteudo}</BlurOverlay>;
  }

  return conteudo;
}
