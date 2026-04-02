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
  const prazo = new Date(hoje.getFullYear(), 4, 31); // 31 de maio
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

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      // DAS do mes atual
      const dasMes = todosOsDas.find((d) => d.competencia?.startsWith(mesAtualStr));
      setDasDoMes(dasMes || null);

      // DASN
      setDasnStatus(resDasn.data || null);

      // Faturamento do mes
      setTemFaturamentoMes((resFat.data || []).length > 0);

      // Dados anuais pra timeline
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
      <div className="flex flex-col gap-4" style={{ maxWidth: 780 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #EBEBEB", borderRadius: 16, height: i === 4 ? 100 : 140 }}
          />
        ))}
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
    <div className="flex flex-col gap-4" style={{ maxWidth: 780 }}>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#1C1C1C",
          letterSpacing: "-0.03em",
        }}
      >
        Obrigacoes
      </h1>

      {/* ======== BANNER DE STATUS ======== */}
      <div
        style={{
          backgroundColor: atrasados > 0 ? "#FDF0F0" : pendencias === 0 ? "rgba(212,230,0,0.12)" : "#FFF3CD",
          border: `1px solid ${atrasados > 0 ? "#E05252" : pendencias === 0 ? "rgba(212,230,0,0.2)" : "#E5D590"}`,
          borderRadius: 16,
          padding: "16px 20px",
        }}
      >
        <div className="flex items-center gap-3">
          <div style={{ color: atrasados > 0 ? "#8B1A1A" : pendencias === 0 ? "#6B7400" : "#7A5A00" }}>
            {pendencias === 0 ? <IconCheck /> : <IconAlert />}
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: atrasados > 0 ? "#8B1A1A" : pendencias === 0 ? "#6B7400" : "#7A5A00" }}>
              {atrasados > 0
                ? `Atencao: ${atrasados} obrigacao${atrasados > 1 ? "oes" : ""} em atraso`
                : pendencias === 0
                  ? "Voce esta em dia com todas as obrigacoes"
                  : `Voce tem ${pendencias} obrigacao${pendencias > 1 ? "oes" : ""} pendente${pendencias > 1 ? "s" : ""}`}
            </p>
            {pendencias > 0 && (
              <p style={{ fontSize: 13, color: atrasados > 0 ? "#8B1A1A" : "#7A5A00", opacity: 0.7, marginTop: 2 }}>
                Confira abaixo os detalhes de cada uma.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ======== CARD: DAS MENSAL ======== */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EBEBEB",
          borderRadius: 16,
          padding: "24px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: statusDas === "pago" ? "#EBEBEB" : "#D4E600" }} />

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8A8A" }}>
                Imposto mensal (DAS)
              </span>
              <StatusPill status={statusDas} />
            </div>

            <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: 32, fontWeight: 700, color: "#1C1C1C", marginTop: 10, letterSpacing: "-0.02em" }}>
              {valorDas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>

            <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 6 }}>
              {statusDas === "pago" ? (
                <>Pago em {dasDoMes?.data_pagamento ? new Date(dasDoMes.data_pagamento + "T12:00:00").toLocaleDateString("pt-BR") : "data registrada"}</>
              ) : diasParaDas() > 0 ? (
                <>Vence em <span style={{ fontWeight: 600, color: "#1C1C1C" }}>{diasParaDas()} dias</span> · {DIA_VENCIMENTO_DAS}/{String(hoje.getMonth() + 1).padStart(2, "0")}/{anoAtual}</>
              ) : diasParaDas() === 0 ? (
                <span style={{ fontWeight: 600, color: "#E05252" }}>Vence hoje</span>
              ) : (
                <span style={{ fontWeight: 600, color: "#E05252" }}>Venceu ha {Math.abs(diasParaDas())} dias</span>
              )}
            </p>
          </div>

          <div style={{ fontSize: 36, color: "#F3F3F3" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="6" width="28" height="26" rx="3" />
              <path d="M4 14h28M12 6V2M24 6V2" />
            </svg>
          </div>
        </div>

        {statusDas !== "pago" && (
          <div className="flex gap-3 mt-5">
            <a
              href={linkPgmei}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm btn-primary"
              style={{ backgroundColor: "#D4E600", color: "#1C1C1C", fontWeight: 600, textDecoration: "none" }}
            >
              Gerar boleto no PGMEI
            </a>
            <button
              onClick={marcarDasPago}
              disabled={salvandoDas}
              className="px-4 py-2.5 rounded-xl text-sm cursor-pointer btn-primary disabled:opacity-50"
              style={{ backgroundColor: "#FFFFFF", color: "#1C1C1C", fontWeight: 500, border: "1px solid #EBEBEB" }}
            >
              {salvandoDas ? "Salvando..." : "Marcar como pago"}
            </button>
          </div>
        )}

        {/* Explicacao colapsavel */}
        <button
          onClick={() => setExplicacaoDas(!explicacaoDas)}
          className="flex items-center gap-1.5 mt-4 cursor-pointer"
          style={{ background: "none", border: "none", fontSize: 13, color: "#8A8A8A", padding: 0 }}
        >
          O que e o DAS?
          <IconChevron aberto={explicacaoDas} />
        </button>
        {explicacaoDas && (
          <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 8, lineHeight: 1.6, paddingLeft: 1 }}>
            O DAS e o unico imposto mensal do MEI. Ele cobre INSS, ISS ou ICMS dependendo da sua atividade. Pagar em dia garante seus direitos previdenciarios (aposentadoria, auxilio-doenca) e mantem seu CNPJ ativo.
          </p>
        )}
      </div>

      {/* ======== CARD: DASN ======== */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EBEBEB",
          borderRadius: 16,
          padding: "24px 24px",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8A8A" }}>
                Declaracao anual ({anoAtual - 1})
              </span>
              <StatusPill status={statusDasn} />
            </div>

            <p style={{ fontSize: 20, fontWeight: 600, color: "#1C1C1C", marginTop: 10, letterSpacing: "-0.03em" }}>
              DASN-SIMEI
            </p>

            <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 6 }}>
              {statusDasn === "feita" ? (
                <>Entregue em {dasnStatus?.data_feita ? new Date(dasnStatus.data_feita + "T12:00:00").toLocaleDateString("pt-BR") : "data registrada"}</>
              ) : diasParaDasn() > 0 ? (
                <>Prazo: <span style={{ fontWeight: 600, color: "#1C1C1C" }}>{diasParaDasn()} dias restantes</span> · ate 31/05/{anoAtual}</>
              ) : (
                <span style={{ fontWeight: 600, color: "#E05252" }}>Prazo encerrado ha {Math.abs(diasParaDasn())} dias</span>
              )}
            </p>
          </div>

          <div style={{ fontSize: 36, color: "#F3F3F3" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4H10a4 4 0 00-4 4v20a4 4 0 004 4h16a4 4 0 004-4V12l-8-8z" />
              <path d="M22 4v8h8M14 18h8M14 24h4" />
            </svg>
          </div>
        </div>

        {statusDasn !== "feita" && (
          <div className="flex gap-3 mt-5">
            <a
              href={linkDasn}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm btn-primary"
              style={{ backgroundColor: "#D4E600", color: "#1C1C1C", fontWeight: 600, textDecoration: "none" }}
            >
              Fazer declaracao
            </a>
            <button
              onClick={marcarDasnFeita}
              disabled={salvandoDasn}
              className="px-4 py-2.5 rounded-xl text-sm cursor-pointer btn-primary disabled:opacity-50"
              style={{ backgroundColor: "#FFFFFF", color: "#1C1C1C", fontWeight: 500, border: "1px solid #EBEBEB" }}
            >
              {salvandoDasn ? "Salvando..." : "Ja entreguei"}
            </button>
          </div>
        )}

        <button
          onClick={() => setExplicacaoDasn(!explicacaoDasn)}
          className="flex items-center gap-1.5 mt-4 cursor-pointer"
          style={{ background: "none", border: "none", fontSize: 13, color: "#8A8A8A", padding: 0 }}
        >
          O que e a DASN?
          <IconChevron aberto={explicacaoDasn} />
        </button>
        {explicacaoDasn && (
          <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 8, lineHeight: 1.6 }}>
            A Declaracao Anual do Simples Nacional (DASN) e obrigatoria todo ano ate 31 de maio. Voce informa quanto faturou no ano anterior. E rapida, gratuita, e pode ser feita pelo portal do Simples Nacional.
          </p>
        )}
      </div>

      {/* ======== CARD: RELATORIO MENSAL ======== */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EBEBEB",
          borderRadius: 16,
          padding: "24px 24px",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8A8A" }}>
                Registro de vendas ({MESES_COMPLETO[mesAtual]})
              </span>
              <StatusPill status={statusRelatorio} />
            </div>

            <p style={{ fontSize: 20, fontWeight: 600, color: "#1C1C1C", marginTop: 10, letterSpacing: "-0.03em" }}>
              Relatorio mensal de receitas
            </p>

            <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 6 }}>
              {temFaturamentoMes
                ? "Voce ja tem lancamentos registrados neste mes."
                : "Nenhum lancamento registrado neste mes ainda."}
            </p>
          </div>

          <div style={{ fontSize: 36, color: "#F3F3F3" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 32L14 18l8 8 10-16" />
            </svg>
          </div>
        </div>

        <Link
          href="/dashboard/faturamento"
          className="flex items-center justify-center mt-5 py-2.5 rounded-xl text-sm btn-primary"
          style={{
            backgroundColor: temFaturamentoMes ? "#FFFFFF" : "#1C1C1C",
            color: temFaturamentoMes ? "#1C1C1C" : "#D4E600",
            fontWeight: 600,
            textDecoration: "none",
            border: temFaturamentoMes ? "1px solid #EBEBEB" : "none",
          }}
        >
          {temFaturamentoMes ? "Ver lancamentos" : "Lancar faturamento"}
        </Link>

        <button
          onClick={() => setExplicacaoRelatorio(!explicacaoRelatorio)}
          className="flex items-center gap-1.5 mt-4 cursor-pointer"
          style={{ background: "none", border: "none", fontSize: 13, color: "#8A8A8A", padding: 0 }}
        >
          Por que registrar?
          <IconChevron aberto={explicacaoRelatorio} />
        </button>
        {explicacaoRelatorio && (
          <p style={{ fontSize: 13, color: "#8A8A8A", marginTop: 8, lineHeight: 1.6 }}>
            O MEI deve guardar os comprovantes das vendas e servicos todo mes. No Guiado voce registra aqui. Isso serve como seu controle financeiro e base para a declaracao anual.
          </p>
        )}
      </div>

      {/* ======== TIMELINE ANUAL ======== */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EBEBEB",
          borderRadius: 16,
          padding: "24px 24px",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8A8A" }}>
          Timeline {anoAtual}
        </span>

        <div className="flex items-center justify-between gap-1 mt-5">
          {Array.from({ length: 12 }, (_, i) => {
            const mesStr = `${anoAtual}-${String(i + 1).padStart(2, "0")}`;
            const das = dasAnual.find((d) => d.competencia?.startsWith(mesStr));
            const futuro = i > mesAtual;
            const atual = i === mesAtual;

            let cor = "#EBEBEB"; // futuro
            if (!futuro) {
              if (das?.status === "pago") cor = "#4ADE80";
              else if (i < mesAtual) cor = "#E05252"; // atrasado (mes passado sem pago)
              else cor = "#FACC15"; // pendente (mes atual)
            }

            const selecionado = mesSelecionado === i;

            return (
              <button
                key={i}
                onClick={() => setMesSelecionado(selecionado ? null : i)}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
                style={{ background: "none", border: "none", padding: "4px 0", flex: 1 }}
              >
                <div
                  style={{
                    width: atual ? 14 : 10,
                    height: atual ? 14 : 10,
                    borderRadius: 99,
                    backgroundColor: cor,
                    border: atual ? "2px solid #1C1C1C" : selecionado ? "2px solid #1C1C1C" : "none",
                    transition: "all 0.2s ease",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: atual ? "#1C1C1C" : "#D6D6D6",
                    fontWeight: atual ? 600 : 400,
                  }}
                >
                  {MESES_LABEL[i]}
                </span>
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
            }}
          >
            {(() => {
              const mesStr = `${anoAtual}-${String(mesSelecionado + 1).padStart(2, "0")}`;
              const das = dasAnual.find((d) => d.competencia?.startsWith(mesStr));
              const futuro = mesSelecionado > mesAtual;

              if (futuro) {
                return <p style={{ fontSize: 13, color: "#D6D6D6" }}>Mes futuro, sem dados ainda.</p>;
              }

              if (!das) {
                return <p style={{ fontSize: 13, color: "#8A8A8A" }}>Sem registro de DAS para {MESES_COMPLETO[mesSelecionado]}.</p>;
              }

              return (
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#1C1C1C" }}>
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
        <div className="flex items-center gap-4 mt-4">
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
  );

  if (semCnpj) return <BlurOverlay>{conteudo}</BlurOverlay>;
  return conteudo;
}
