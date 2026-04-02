"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import { useToast } from "@/lib/toast-context";
import { DIA_VENCIMENTO_DAS } from "@/lib/constants";
import { calcularValorDas } from "@/lib/das-valores";
import BlurOverlay from "@/components/dashboard/BlurOverlay";

const MESES_LABEL = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const MESES_COMPLETO = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// ======== STATUS HELPERS ========

function calcularStatusDas(dasDoMes) {
  if (!dasDoMes) return "pendente";
  if (dasDoMes.status === "pago") return "pago";
  const hoje = new Date();
  if (hoje.getDate() > DIA_VENCIMENTO_DAS) return "atrasado";
  return "pendente";
}

function calcularStatusDasn(dasnStatus) {
  if (dasnStatus?.feita) return "feita";
  const hoje = new Date();
  const prazo = new Date(hoje.getFullYear(), 4, 31);
  if (hoje > prazo) return "atrasada";
  return "a_fazer";
}

function diasParaDasn() {
  const hoje = new Date();
  const prazo = new Date(hoje.getFullYear(), 4, 31);
  const diff = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
  return diff;
}

function diasParaDas() {
  const hoje = new Date();
  const vencimento = new Date(hoje.getFullYear(), hoje.getMonth(), DIA_VENCIMENTO_DAS);
  return Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
}

// ======== ICONS ========

function IconCalendar({ size = 24, color = "#D4E600" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18M8 4V2M16 4V2" />
    </svg>
  );
}

function IconDocument({ size = 24, color = "#D4E600" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path d="M14 2v6h6M10 13h4M10 17h2" />
    </svg>
  );
}

function IconChart({ size = 24, color = "#D4E600" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 4 5-8" />
    </svg>
  );
}

function IconCheckCircle({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  );
}

function IconAlertCircle({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 7v3M10 13h.01" />
    </svg>
  );
}

function IconChevron({ aberto }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      style={{
        transition: "transform 0.2s ease",
        transform: aberto ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function IconExternalLink({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 7.5v3.5a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h3.5M8 2h4v4M6 8l6-6" />
    </svg>
  );
}

function IconShield({ size = 22, color = "#D4E600" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V5l7-3z" />
      <path d="M8 11l2 2 4-4" />
    </svg>
  );
}

// ======== STATUS PILL ========

function StatusPill({ status, label }) {
  const estilos = {
    pago: { color: "#8A8A8A", bg: "#F3F3F3", label: label || "Pago" },
    feita: { color: "#8A8A8A", bg: "#F3F3F3", label: label || "Feita" },
    pendente: { color: "#7A5A00", bg: "#FFF3CD", label: label || "Pendente" },
    a_fazer: { color: "#7A5A00", bg: "#FFF3CD", label: label || "A fazer" },
    lancado: { color: "#8A8A8A", bg: "#F3F3F3", label: label || "Lancado" },
    atrasado: { color: "#8B1A1A", bg: "#FDF0F0", label: label || "Atrasado" },
    atrasada: { color: "#8B1A1A", bg: "#FDF0F0", label: label || "Atrasada" },
    futuro: { color: "#D6D6D6", bg: "#F7F7F5", label: label || "Futuro" },
  };
  const e = estilos[status] || estilos.pendente;
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        fontSize: 11,
        fontWeight: 500,
        color: e.color,
        backgroundColor: e.bg,
        padding: "3px 10px",
        borderRadius: 99,
      }}
    >
      <span
        className="inline-block rounded-full"
        style={{ width: 5, height: 5, backgroundColor: e.color, flexShrink: 0 }}
      />
      {e.label}
    </span>
  );
}

// ======== PRIORITY INDICATOR ========

function PriorityBadge({ level }) {
  const config = {
    alta: { label: "Prioridade alta", color: "#8B1A1A", bg: "#FDF0F0" },
    media: { label: "Mensal", color: "#7A5A00", bg: "#FFF3CD" },
    baixa: { label: "Recomendado", color: "#8A8A8A", bg: "#F3F3F3" },
  };
  const c = config[level] || config.media;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: c.color,
        backgroundColor: c.bg,
        padding: "2px 8px",
        borderRadius: 6,
      }}
    >
      {c.label}
    </span>
  );
}

// ======== MAIN ========

export default function ObrigacoesPage() {
  const { perfil, carregando: carregandoPerfil, semCnpj } = useDashboard();
  const supabase = createClient();
  const { mostrarToast } = useToast();

  const [carregando, setCarregando] = useState(true);
  const [dasDoMes, setDasDoMes] = useState(null);
  const [dasnStatus, setDasnStatus] = useState(null);
  const [temFaturamentoMes, setTemFaturamentoMes] = useState(false);
  const [dasAnual, setDasAnual] = useState([]);
  const [salvandoDas, setSalvandoDas] = useState(false);
  const [salvandoDasn, setSalvandoDasn] = useState(false);

  // Colapsaveis
  const [explicacaoDas, setExplicacaoDas] = useState(false);
  const [explicacaoDasn, setExplicacaoDasn] = useState(false);
  const [explicacaoRelatorio, setExplicacaoRelatorio] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState(null);

  useEffect(() => {
    if (!perfil) return;
    if (semCnpj) {
      setCarregando(false);
      return;
    }

    async function carregar() {
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtualStr = `${anoAtual}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

      const [resDas, resDasn, resFat] = await Promise.all([
        supabase
          .from("das_payments")
          .select("*")
          .eq("user_id", perfil.id)
          .order("competencia", { ascending: true }),
        supabase
          .from("dasn_status")
          .select("*")
          .eq("user_id", perfil.id)
          .eq("ano", anoAtual - 1)
          .single(),
        supabase
          .from("faturamento")
          .select("id")
          .eq("user_id", perfil.id)
          .gte("mes", `${mesAtualStr}-01`)
          .lte("mes", `${mesAtualStr}-31`)
          .limit(1),
      ]);

      const todosOsDas = resDas.data || [];
      const dasMes = todosOsDas.find((d) => d.competencia?.startsWith(mesAtualStr));
      setDasDoMes(dasMes || null);
      setDasnStatus(resDasn.data || null);
      setTemFaturamentoMes((resFat.data || []).length > 0);
      setDasAnual(todosOsDas);
      setCarregando(false);
    }
    carregar();
  }, [perfil, semCnpj]);

  async function marcarDasPago() {
    if (!dasDoMes) return;
    setSalvandoDas(true);
    const hoje = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("das_payments")
      .update({ status: "pago", data_pagamento: hoje })
      .eq("id", dasDoMes.id)
      .select()
      .single();

    if (data) {
      setDasDoMes(data);
      setDasAnual((prev) => prev.map((d) => (d.id === data.id ? data : d)));
      mostrarToast("DAS marcado como pago");
    }
    setSalvandoDas(false);
  }

  async function marcarDasnFeita() {
    setSalvandoDasn(true);
    const hoje = new Date();
    const anoRef = hoje.getFullYear() - 1;

    const { data, error } = await supabase
      .from("dasn_status")
      .upsert(
        {
          user_id: perfil.id,
          ano: anoRef,
          feita: true,
          data_feita: hoje.toISOString().split("T")[0],
        },
        { onConflict: "user_id,ano" }
      )
      .select()
      .single();

    if (!error) {
      setDasnStatus(data || { feita: true, data_feita: hoje.toISOString().split("T")[0] });
      mostrarToast("Declaracao anual marcada como feita");
    }
    setSalvandoDasn(false);
  }

  if (carregandoPerfil || carregando) {
    return (
      <div style={{ maxWidth: 900 }}>
        <div className="skeleton" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EBEBEB", borderRadius: 16, height: 72, marginBottom: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #EBEBEB", borderRadius: 16, height: 200 }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Calcular status
  const statusDas = calcularStatusDas(dasDoMes);
  const statusDasn = calcularStatusDasn(dasnStatus);
  const statusRelatorio = temFaturamentoMes ? "lancado" : "pendente";

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();
  const valorDas = calcularValorDas(perfil?.cnae);

  // Contagem de pendencias
  const pendencias = [
    statusDas !== "pago" ? 1 : 0,
    statusDasn !== "feita" ? 1 : 0,
    statusRelatorio === "pendente" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const atrasados = [
    statusDas === "atrasado" ? 1 : 0,
    statusDasn === "atrasada" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const linkPgmei = `https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao?cnpj=${perfil?.cnpj || ""}`;
  const linkDasn = "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/dasnsimei.app/Identificacao";

  const conteudo = (
    <div style={{ maxWidth: 900 }}>
      {/* ======== HEADER ======== */}
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#1C1C1C",
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          Obrigacoes
        </h1>
      </div>

      {/* ======== STATUS BANNER ======== */}
      <div
        className="card-animate"
        style={{
          backgroundColor: atrasados > 0 ? "#FDF0F0" : pendencias === 0 ? "#FFFFFF" : "#FFF3CD",
          border: `1px solid ${atrasados > 0 ? "rgba(224,82,82,0.2)" : pendencias === 0 ? "#EBEBEB" : "rgba(229,213,144,0.5)"}`,
          borderRadius: 16,
          padding: "18px 22px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: atrasados > 0 ? "rgba(139,26,26,0.08)" : pendencias === 0 ? "rgba(212,230,0,0.12)" : "rgba(122,90,0,0.08)",
              color: atrasados > 0 ? "#8B1A1A" : pendencias === 0 ? "#6B7400" : "#7A5A00",
              flexShrink: 0,
            }}
          >
            {pendencias === 0 ? <IconShield size={20} color="currentColor" /> : <IconAlertCircle size={20} />}
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: atrasados > 0 ? "#8B1A1A" : pendencias === 0 ? "#1C1C1C" : "#7A5A00", margin: 0 }}>
              {atrasados > 0
                ? `${atrasados} obrigacao${atrasados > 1 ? "oes" : ""} em atraso`
                : pendencias === 0
                  ? "Tudo em dia"
                  : `${pendencias} pendencia${pendencias > 1 ? "s" : ""} este mes`}
            </p>
            <p style={{ fontSize: 13, color: atrasados > 0 ? "#8B1A1A" : pendencias === 0 ? "#8A8A8A" : "#7A5A00", opacity: 0.8, marginTop: 2 }}>
              {atrasados > 0
                ? "Resolva o mais rapido possivel para evitar multas."
                : pendencias === 0
                  ? "Seu MEI esta regular, continue assim."
                  : "Confira os detalhes abaixo."}
            </p>
          </div>
        </div>

        {/* Contadores */}
        <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
          <div style={{ textAlign: "center", padding: "0 8px" }}>
            <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: 22, fontWeight: 700, color: "#1C1C1C", margin: 0, lineHeight: 1 }}>
              {3 - pendencias}
            </p>
            <p style={{ fontSize: 10, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>feitas</p>
          </div>
          <div style={{ width: 1, height: 28, backgroundColor: "#EBEBEB" }} />
          <div style={{ textAlign: "center", padding: "0 8px" }}>
            <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: 22, fontWeight: 700, color: pendencias > 0 ? "#7A5A00" : "#8A8A8A", margin: 0, lineHeight: 1 }}>
              {pendencias}
            </p>
            <p style={{ fontSize: 10, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>restam</p>
          </div>
        </div>
      </div>

      {/* ======== CARDS GRID ======== */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ======== CARD 1: DASN (DECLARACAO ANUAL) ======== */}
        <div
          className="card-animate"
          style={{
            backgroundColor: "#FFFFFF",
            border: statusDasn === "atrasada" ? "1px solid rgba(224,82,82,0.3)" : "1px solid #EBEBEB",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Accent bar */}
          <div style={{
            height: 3,
            background: statusDasn === "feita" ? "#EBEBEB" : statusDasn === "atrasada" ? "#E05252" : "#D4E600",
          }} />

          <div style={{ padding: "24px 24px 20px" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4" style={{ flex: 1 }}>
                {/* Icon */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: statusDasn === "feita" ? "#F3F3F3" : "rgba(212,230,0,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconDocument size={22} color={statusDasn === "feita" ? "#8A8A8A" : "#D4E600"} />
                </div>

                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8A8A" }}>
                      Declaracao anual ({anoAtual - 1})
                    </span>
                    <PriorityBadge level="alta" />
                    <StatusPill status={statusDasn} />
                  </div>

                  <p style={{ fontSize: 18, fontWeight: 600, color: "#1C1C1C", marginTop: 8, letterSpacing: "-0.03em" }}>
                    DASN-SIMEI
                  </p>

                  <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 4, lineHeight: 1.5 }}>
                    Informe quanto seu MEI faturou em {anoAtual - 1}. Todos os MEIs precisam entregar, mesmo quem faturou zero.
                  </p>

                  {/* Deadline info */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 10,
                      padding: "6px 12px",
                      borderRadius: 8,
                      backgroundColor: statusDasn === "feita" ? "#F3F3F3" : statusDasn === "atrasada" ? "#FDF0F0" : "#F7F7F5",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={statusDasn === "atrasada" ? "#E05252" : "#8A8A8A"} strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="7" cy="7" r="5.5" />
                      <path d="M7 4.5V7l2 1" />
                    </svg>
                    <span style={{ fontSize: 12, fontFamily: "var(--font-dm-mono)", color: statusDasn === "feita" ? "#8A8A8A" : statusDasn === "atrasada" ? "#8B1A1A" : "#1C1C1C", fontWeight: 500 }}>
                      {statusDasn === "feita" ? (
                        <>Entregue em {dasnStatus?.data_feita ? new Date(dasnStatus.data_feita + "T12:00:00").toLocaleDateString("pt-BR") : "data registrada"}</>
                      ) : diasParaDasn() > 0 ? (
                        <>{diasParaDasn()} dias restantes - ate 31/05/{anoAtual}</>
                      ) : (
                        <>Prazo encerrado ha {Math.abs(diasParaDasn())} dias</>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {statusDasn !== "feita" && (
              <div className="flex gap-3 mt-5" style={{ paddingLeft: 64 }}>
                <a
                  href={linkDasn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm"
                  style={{ backgroundColor: "#D4E600", color: "#1C1C1C", fontWeight: 600, textDecoration: "none", transition: "transform 0.15s" }}
                >
                  Fazer declaracao
                  <IconExternalLink size={13} />
                </a>
                <button
                  onClick={marcarDasnFeita}
                  disabled={salvandoDasn}
                  className="px-4 py-2.5 rounded-xl text-sm cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: "#FFFFFF", color: "#1C1C1C", fontWeight: 500, border: "1px solid #EBEBEB", transition: "transform 0.15s" }}
                >
                  {salvandoDasn ? "Salvando..." : "Ja entreguei"}
                </button>
              </div>
            )}

            {/* Explicacao */}
            <div style={{ paddingLeft: 64, marginTop: 16 }}>
              <button
                onClick={() => setExplicacaoDasn(!explicacaoDasn)}
                className="flex items-center gap-1.5 cursor-pointer"
                style={{ background: "none", border: "none", fontSize: 13, color: "#8A8A8A", padding: 0 }}
              >
                Entender a DASN
                <IconChevron aberto={explicacaoDasn} />
              </button>
              {explicacaoDasn && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "14px 16px",
                    backgroundColor: "#F7F7F5",
                    borderRadius: 12,
                    fontSize: 13,
                    color: "#8A8A8A",
                    lineHeight: 1.7,
                  }}
                >
                  <p style={{ margin: "0 0 8px" }}>
                    A Declaracao Anual do Simples Nacional (DASN-SIMEI) e obrigatoria todo ano ate 31 de maio.
                  </p>
                  <p style={{ margin: "0 0 8px" }}>
                    Voce informa quanto faturou no ano anterior. E rapida, gratuita, e pode ser feita pelo portal do Simples Nacional.
                  </p>
                  <p style={{ margin: 0, fontWeight: 500, color: "#7A5A00" }}>
                    Quem nao entrega pode ter o CNPJ cancelado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======== CARD 2: DAS MENSAL ======== */}
        <div
          className="card-animate"
          style={{
            backgroundColor: "#FFFFFF",
            border: statusDas === "atrasado" ? "1px solid rgba(224,82,82,0.3)" : "1px solid #EBEBEB",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div style={{
            height: 3,
            background: statusDas === "pago" ? "#EBEBEB" : statusDas === "atrasado" ? "#E05252" : "#D4E600",
          }} />

          <div style={{ padding: "24px 24px 20px" }}>
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: statusDas === "pago" ? "#F3F3F3" : "rgba(212,230,0,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconCalendar size={22} color={statusDas === "pago" ? "#8A8A8A" : "#D4E600"} />
              </div>

              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8A8A" }}>
                    Imposto mensal (DAS)
                  </span>
                  <PriorityBadge level="media" />
                  <StatusPill status={statusDas} />
                </div>

                <div className="flex items-baseline gap-3 mt-2">
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: 32, fontWeight: 700, color: "#1C1C1C", letterSpacing: "-0.02em", margin: 0 }}>
                    {valorDas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  <span style={{ fontSize: 13, color: "#8A8A8A" }}>
                    {MESES_COMPLETO[mesAtual]} {anoAtual}
                  </span>
                </div>

                {/* Deadline info */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 10,
                    padding: "6px 12px",
                    borderRadius: 8,
                    backgroundColor: statusDas === "pago" ? "#F3F3F3" : statusDas === "atrasado" ? "#FDF0F0" : "#F7F7F5",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={statusDas === "atrasado" ? "#E05252" : "#8A8A8A"} strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="7" cy="7" r="5.5" />
                    <path d="M7 4.5V7l2 1" />
                  </svg>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-dm-mono)", color: statusDas === "pago" ? "#8A8A8A" : statusDas === "atrasado" ? "#8B1A1A" : "#1C1C1C", fontWeight: 500 }}>
                    {statusDas === "pago" ? (
                      <>Pago em {dasDoMes?.data_pagamento ? new Date(dasDoMes.data_pagamento + "T12:00:00").toLocaleDateString("pt-BR") : "data registrada"}</>
                    ) : diasParaDas() > 0 ? (
                      <>{diasParaDas()} dias para o vencimento - {DIA_VENCIMENTO_DAS}/{String(hoje.getMonth() + 1).padStart(2, "0")}/{anoAtual}</>
                    ) : diasParaDas() === 0 ? (
                      <>Vence hoje</>
                    ) : (
                      <>Venceu ha {Math.abs(diasParaDas())} dias</>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {statusDas !== "pago" && (
              <div className="flex gap-3 mt-5" style={{ paddingLeft: 64 }}>
                <a
                  href={linkPgmei}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm"
                  style={{ backgroundColor: "#D4E600", color: "#1C1C1C", fontWeight: 600, textDecoration: "none", transition: "transform 0.15s" }}
                >
                  Gerar boleto no PGMEI
                  <IconExternalLink size={13} />
                </a>
                <button
                  onClick={marcarDasPago}
                  disabled={salvandoDas}
                  className="px-4 py-2.5 rounded-xl text-sm cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: "#FFFFFF", color: "#1C1C1C", fontWeight: 500, border: "1px solid #EBEBEB", transition: "transform 0.15s" }}
                >
                  {salvandoDas ? "Salvando..." : "Marcar como pago"}
                </button>
              </div>
            )}

            {/* Explicacao */}
            <div style={{ paddingLeft: 64, marginTop: 16 }}>
              <button
                onClick={() => setExplicacaoDas(!explicacaoDas)}
                className="flex items-center gap-1.5 cursor-pointer"
                style={{ background: "none", border: "none", fontSize: 13, color: "#8A8A8A", padding: 0 }}
              >
                Entender o DAS
                <IconChevron aberto={explicacaoDas} />
              </button>
              {explicacaoDas && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "14px 16px",
                    backgroundColor: "#F7F7F5",
                    borderRadius: 12,
                    fontSize: 13,
                    color: "#8A8A8A",
                    lineHeight: 1.7,
                  }}
                >
                  <p style={{ margin: "0 0 8px" }}>
                    O DAS e o unico imposto mensal do MEI. Cobre INSS, ISS ou ICMS dependendo da sua atividade.
                  </p>
                  <p style={{ margin: 0 }}>
                    Pagar em dia garante seus direitos previdenciarios (aposentadoria, auxilio-doenca) e mantem seu CNPJ ativo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======== CARD 3: RELATORIO MENSAL ======== */}
        <div
          className="card-animate"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #EBEBEB",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div style={{
            height: 3,
            background: statusRelatorio === "lancado" ? "#EBEBEB" : "rgba(212,230,0,0.5)",
          }} />

          <div style={{ padding: "24px 24px 20px" }}>
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: statusRelatorio === "lancado" ? "#F3F3F3" : "rgba(212,230,0,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconChart size={22} color={statusRelatorio === "lancado" ? "#8A8A8A" : "#D4E600"} />
              </div>

              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8A8A" }}>
                    Registro de vendas ({MESES_COMPLETO[mesAtual]})
                  </span>
                  <PriorityBadge level="baixa" />
                  <StatusPill status={statusRelatorio} />
                </div>

                <p style={{ fontSize: 18, fontWeight: 600, color: "#1C1C1C", marginTop: 8, letterSpacing: "-0.03em" }}>
                  Relatorio mensal de receitas
                </p>

                <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 4, lineHeight: 1.5 }}>
                  {temFaturamentoMes
                    ? "Voce ja tem lancamentos registrados neste mes."
                    : "Registre suas vendas e servicos para manter o controle do faturamento."}
                </p>
              </div>
            </div>

            {/* Action */}
            <div style={{ paddingLeft: 64, marginTop: 16 }}>
              <Link
                href="/dashboard/faturamento"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm"
                style={{
                  backgroundColor: temFaturamentoMes ? "#FFFFFF" : "#1C1C1C",
                  color: temFaturamentoMes ? "#1C1C1C" : "#D4E600",
                  fontWeight: 600,
                  textDecoration: "none",
                  border: temFaturamentoMes ? "1px solid #EBEBEB" : "none",
                  transition: "transform 0.15s",
                }}
              >
                {temFaturamentoMes ? "Ver lancamentos" : "Lancar faturamento"}
              </Link>
            </div>

            {/* Explicacao */}
            <div style={{ paddingLeft: 64, marginTop: 16 }}>
              <button
                onClick={() => setExplicacaoRelatorio(!explicacaoRelatorio)}
                className="flex items-center gap-1.5 cursor-pointer"
                style={{ background: "none", border: "none", fontSize: 13, color: "#8A8A8A", padding: 0 }}
              >
                Entender o registro mensal
                <IconChevron aberto={explicacaoRelatorio} />
              </button>
              {explicacaoRelatorio && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "14px 16px",
                    backgroundColor: "#F7F7F5",
                    borderRadius: 12,
                    fontSize: 13,
                    color: "#8A8A8A",
                    lineHeight: 1.7,
                  }}
                >
                  <p style={{ margin: "0 0 8px" }}>
                    O MEI deve guardar os comprovantes das vendas e servicos todo mes.
                  </p>
                  <p style={{ margin: 0 }}>
                    Registrar aqui serve como seu controle financeiro e base para a declaracao anual (DASN).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======== TIMELINE ANUAL ======== */}
        <div
          className="card-animate"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #EBEBEB",
            borderRadius: 16,
            padding: "24px 24px",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8A8A" }}>
              Historico DAS {anoAtual}
            </span>
            <Link
              href="/dashboard/das"
              style={{ fontSize: 12, color: "#8A8A8A", textDecoration: "none", fontWeight: 500 }}
            >
              Ver completo
            </Link>
          </div>

          {/* Timeline horizontal */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
            {Array.from({ length: 12 }, (_, i) => {
              const mesStr = `${anoAtual}-${String(i + 1).padStart(2, "0")}`;
              const das = dasAnual.find((d) => d.competencia?.startsWith(mesStr));
              const futuro = i > mesAtual;
              const atual = i === mesAtual;

              let cor = "#EBEBEB";
              let corLinha = "#EBEBEB";
              if (!futuro) {
                if (das?.status === "pago") { cor = "#4ADE80"; corLinha = "#4ADE80"; }
                else if (i < mesAtual) { cor = "#E05252"; corLinha = "#E05252"; }
                else { cor = "#FACC15"; corLinha = "#FACC15"; }
              }

              const selecionado = mesSelecionado === i;

              return (
                <button
                  key={i}
                  onClick={() => setMesSelecionado(selecionado ? null : i)}
                  className="flex flex-col items-center cursor-pointer"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    flex: 1,
                    minWidth: 0,
                    position: "relative",
                  }}
                >
                  {/* Label do mes */}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: atual ? 600 : 400,
                      color: atual ? "#1C1C1C" : selecionado ? "#1C1C1C" : "#D6D6D6",
                      marginBottom: 8,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {MESES_LABEL[i]}
                  </span>

                  {/* Dot */}
                  <div
                    style={{
                      width: atual ? 16 : selecionado ? 14 : 10,
                      height: atual ? 16 : selecionado ? 14 : 10,
                      borderRadius: 99,
                      backgroundColor: cor,
                      border: atual ? "2.5px solid #1C1C1C" : selecionado ? "2px solid #1C1C1C" : "none",
                      transition: "all 0.2s ease",
                      zIndex: 2,
                      position: "relative",
                    }}
                  />

                  {/* Connector line */}
                  {i < 11 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 25,
                        left: "50%",
                        width: "100%",
                        height: 2,
                        backgroundColor: futuro ? "#F3F3F3" : corLinha,
                        opacity: 0.3,
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Status label abaixo */}
                  {atual && (
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 600,
                        color: "#D4E600",
                        backgroundColor: "#1C1C1C",
                        padding: "1px 5px",
                        borderRadius: 4,
                        marginTop: 6,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Atual
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detalhe do mes selecionado */}
          {mesSelecionado !== null && (
            <div
              style={{
                marginTop: 16,
                padding: "14px 16px",
                backgroundColor: "#F7F7F5",
                borderRadius: 12,
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              {(() => {
                const mesStr = `${anoAtual}-${String(mesSelecionado + 1).padStart(2, "0")}`;
                const das = dasAnual.find((d) => d.competencia?.startsWith(mesStr));
                const futuro = mesSelecionado > mesAtual;

                if (futuro) {
                  return <p style={{ fontSize: 13, color: "#D6D6D6", margin: 0 }}>Mes futuro, sem dados ainda.</p>;
                }

                if (!das) {
                  return <p style={{ fontSize: 13, color: "#8A8A8A", margin: 0 }}>Sem registro de DAS para {MESES_COMPLETO[mesSelecionado]}.</p>;
                }

                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#1C1C1C", margin: 0 }}>
                        DAS {MESES_COMPLETO[mesSelecionado]} {anoAtual}
                      </p>
                      <p style={{ fontSize: 13, fontFamily: "var(--font-dm-mono)", color: "#8A8A8A", marginTop: 2 }}>
                        {Number(das.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                    <StatusPill status={das.status === "pago" ? "pago" : mesSelecionado < mesAtual ? "atrasado" : "pendente"} />
                  </div>
                );
              })()}
            </div>
          )}

          {/* Legenda */}
          <div className="flex items-center gap-5 mt-4" style={{ paddingTop: 12, borderTop: "1px solid #F3F3F3" }}>
            {[
              { cor: "#4ADE80", label: "Pago" },
              { cor: "#FACC15", label: "Pendente" },
              { cor: "#E05252", label: "Atrasado" },
              { cor: "#EBEBEB", label: "Futuro" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: item.cor, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: "#8A8A8A" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (semCnpj) return <BlurOverlay>{conteudo}</BlurOverlay>;
  return conteudo;
}
