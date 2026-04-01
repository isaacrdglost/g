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
  const { perfil, dadosCnpj, carregando: carregandoPerfil } = useDashboard();
  const supabase = createClient();

  const [faturamentos, setFaturamentos] = useState([]);
  const [dasRegistros, setDasRegistros] = useState([]);
  const [dasMesAtual, setDasMesAtual] = useState(null);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [mostrarBanner, setMostrarBanner] = useState(false);

  useEffect(() => {
    if (!perfil) return;

    async function carregarDados() {
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const inicioAno = `${anoAtual}-01-01`;
      const fimAno = `${anoAtual}-12-31`;

      // Buscar faturamento e DAS em paralelo
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

      // Primeiro acesso: popular últimos 12 meses se tem menos de 2 registros
      if (dasAll.length < 2) {
        const valorDas = calcularValorDas(perfil.cnae);
        const mesesAnteriores = gerarMesesAnteriores(12);

        // Filtrar meses que já existem
        const competenciasExistentes = new Set(
          dasAll.map((d) => d.competencia?.slice(0, 7))
        );
        const mesesParaCriar = mesesAnteriores.filter(
          (m) => !competenciasExistentes.has(m.slice(0, 7))
        );

        if (mesesParaCriar.length > 0) {
          const novos = mesesParaCriar.map((competencia) => ({
            user_id: perfil.id,
            competencia,
            valor: valorDas,
            status: "pendente",
          }));

          const { data: inseridos } = await supabase
            .from("das_payments")
            .insert(novos)
            .select();

          if (inseridos) {
            dasAll = [...dasAll, ...inseridos].sort(
              (a, b) => b.competencia.localeCompare(a.competencia)
            );
            setMostrarBanner(true);
          }
        }
      }

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

      // Se não existe, criar com status pendente
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

      // Se já passou do dia 20 e está pendente, marcar como atrasado
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
  }, [perfil]);

  if (carregandoPerfil || carregandoDados) {
    return (
      <div className="flex flex-col gap-5">
        {/* Skeleton LimitBar */}
        <div
          className="animate-pulse"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D6D6D6",
            borderRadius: 12,
            padding: "22px 26px",
            height: 140,
          }}
        >
          <div
            className="rounded"
            style={{ width: 200, height: 12, backgroundColor: "#EBEBEB" }}
          />
          <div
            className="rounded mt-4"
            style={{ width: 280, height: 28, backgroundColor: "#EBEBEB" }}
          />
          <div
            className="rounded mt-4"
            style={{ width: "100%", height: 6, backgroundColor: "#EBEBEB" }}
          />
        </div>

        {/* Skeleton cards */}
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D6D6D6",
                borderRadius: 12,
                padding: "22px 26px",
                height: 160,
              }}
            >
              <div
                className="rounded"
                style={{ width: 100, height: 10, backgroundColor: "#EBEBEB" }}
              />
              <div
                className="rounded mt-4"
                style={{ width: 140, height: 24, backgroundColor: "#EBEBEB" }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calcular totais
  const hoje = new Date();
  const mesAtualIndex = hoje.getMonth();
  const totalAnual = faturamentos.reduce(
    (soma, f) => soma + Number(f.valor),
    0
  );
  const faturamentoMesAtual = faturamentos
    .filter((f) => new Date(f.mes).getMonth() === mesAtualIndex)
    .reduce((soma, f) => soma + Number(f.valor), 0);

  // Meses decorridos no ano (mínimo 1)
  const mesesDecorridos = Math.max(mesAtualIndex + 1, 1);

  return (
    <div className="flex flex-col gap-5">
      {/* Banner de primeiro acesso */}
      {mostrarBanner && (
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
            Encontramos seus últimos 12 meses de DAS. Marque os que você já
            pagou!
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

      <LimitBar
        totalFaturado={totalAnual}
        mesesDecorridos={mesesDecorridos}
      />

      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        <DasCard das={dasMesAtual} cnpj={perfil.cnpj} />
        <FaturamentoCard
          valorMes={faturamentoMesAtual}
          totalAnual={totalAnual}
        />
        <SituacaoCard dadosCnpj={dadosCnpj} perfil={perfil} />
      </div>

      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: "1fr 300px" }}
      >
        <FaturamentoChart registros={faturamentos} />
        <DasHistorico registros={dasRegistros} />
      </div>
    </div>
  );
}
