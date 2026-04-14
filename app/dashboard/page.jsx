"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import { atualizarStatusDasAtrasados } from "@/lib/das-service";
import { isPro } from "@/lib/plano";

import LimitBar from "@/components/dashboard/LimitBar";
import DasCard from "@/components/dashboard/DasCard";
import SituacaoCard from "@/components/dashboard/SituacaoCard";
import AtividadeCard from "@/components/dashboard/AtividadeCard";
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
  const [bannerFechado, setBannerFechado] = useState(false);

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
  const temDadosEstimados = fats.some(f => f.confirmado === false);
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

  const temDasDesconhecido = isPro(perfil) && dasRegistros?.some(d => d.status === "desconhecido");

  const mesesDecorridos = Math.max(mesAtualIndex + 1, 1);

  // Alertas contextuais
  const mostrarAlertaDASN = mesAtualIndex >= 2 && mesAtualIndex <= 4;
  const mostrarAlertaFaturamento = !semCnpj && faturamentos.length === 0;

  const conteudo = (
    <div className="flex flex-col gap-5">
      {(mostrarAlertaDASN || mostrarAlertaFaturamento) && (
        <div className="flex flex-col gap-3">
          {mostrarAlertaDASN && (
            <div style={{
              backgroundColor: "#FEF3EC",
              border: "1px solid #D4500A",
              borderRadius: 16,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#D4500A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="14" height="13" rx="2" />
                  <path d="M2 7h14M6 1v4M12 1v4" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#2A1F14" }}>
                  DASN vence em 31 de maio
                </p>
                <p style={{ fontSize: 12, color: "#7A6255", marginTop: 2 }}>
                  Declaracao Anual obrigatoria. Nao entregar pode cancelar seu CNPJ.
                </p>
              </div>
              <Link href="/dashboard/obrigacoes" style={{ fontSize: 13, fontWeight: 600, color: "#D4500A", textDecoration: "none", whiteSpace: "nowrap" }}>
                Declarar agora →
              </Link>
            </div>
          )}

          {mostrarAlertaFaturamento && (
            <div style={{
              backgroundColor: "#F2EFE9",
              border: "1px solid #E8E3DA",
              borderRadius: 16,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#E8E3DA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#7A6255" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 9h16M9 1v16" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#2A1F14" }}>
                  Nenhum recebimento registrado
                </p>
                <p style={{ fontSize: 12, color: "#7A6255", marginTop: 2 }}>
                  Registre seus recebimentos para ativar o controle de limite.
                </p>
              </div>
              <Link href="/dashboard/faturamento" style={{ fontSize: 13, fontWeight: 600, color: "#7A6255", textDecoration: "none", whiteSpace: "nowrap" }}>
                Lancar primeiro recebimento →
              </Link>
            </div>
          )}
        </div>
      )}

      {temDadosEstimados && !bannerFechado && (
        <div style={{
          backgroundColor: "#F2EFE9",
          border: "1px solid #E8E3DA",
          borderRadius: 16,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: "rgba(212,80,10,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#D4500A" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="8" cy="8" r="7" />
              <path d="M8 5v3M8 10.5v.5" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#2A1F14" }}>Seus dados foram estimados no cadastro</p>
            <p style={{ fontSize: 12, color: "#7A6255", marginTop: 2 }}>Lance seus recebimentos reais para ativar o controle preciso do seu limite.</p>
          </div>
          <Link href="/dashboard/faturamento" style={{ fontSize: 12, fontWeight: 600, color: "#D4500A", textDecoration: "none", whiteSpace: "nowrap" }}>
            Lancar agora
          </Link>
          <button onClick={() => setBannerFechado(true)} style={{ background: "none", border: "none", color: "#C8C2B8", cursor: "pointer", padding: 4 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8" /></svg>
          </button>
        </div>
      )}

      {temDasDesconhecido && (
        <div
          style={{
            backgroundColor: "#FEF3EC",
            borderLeft: "3px solid #D4500A",
            borderRadius: "0 12px 12px 0",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p style={{ fontSize: 13, color: "#2A1F14", lineHeight: 1.5 }}>
            Estamos sincronizando seu historico de DAS com a Receita Federal. Isso pode levar ate 2 horas.
          </p>
        </div>
      )}

      <div className="card-animate">
        <LimitBar totalFaturado={totalAnual} mesesDecorridos={mesesDecorridos} estimado={temDadosEstimados} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-animate"><DasCard das={dasAtual} cnpj={perfil?.cnpj || "00000000000000"} /></div>
        <div className="card-animate"><SituacaoCard dadosCnpj={dadosCnpj} perfil={perfil} /></div>
        <div className="card-animate"><AtividadeCard dadosCnpj={dadosCnpj} perfil={perfil} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="card-animate"><FaturamentoChart registros={fats} valorMes={faturamentoMesAtual} valorMesAnterior={faturamentoMesAnterior} /></div>
        <div className="card-animate"><DasHistorico registros={dasHist} /></div>
      </div>

      {/* Em breve */}
      <div style={{
        backgroundColor: "#F2EFE9",
        border: "1px dashed #E8E3DA",
        borderRadius: 16,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(212,80,10,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#D4500A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="16" height="13" rx="2" />
            <path d="M2 8h16" />
            <path d="M6 2v4M14 2v4" />
            <circle cx="10" cy="13" r="1.5" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2">
            <p style={{ fontSize: 14, fontWeight: 600, color: "#2A1F14" }}>Conexao bancaria automatica</p>
            <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", backgroundColor: "#FFF3CD", color: "#7A5A00", padding: "2px 8px", borderRadius: 99 }}>Em breve</span>
          </div>
          <p style={{ fontSize: 12, color: "#7A6255", marginTop: 4, lineHeight: 1.5 }}>Conecte sua conta e seus recebimentos serao lancados automaticamente todo mes via Open Finance.</p>
        </div>
      </div>
    </div>
  );

  if (usarFake) {
    return <BlurOverlay>{conteudo}</BlurOverlay>;
  }

  return conteudo;
}
