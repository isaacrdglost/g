"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import BlurOverlay from "@/components/dashboard/BlurOverlay";
import ResumoCard from "@/components/dashboard/ResumoCard";
import { useToast } from "@/lib/toast-context";
import { DIA_VENCIMENTO_DAS } from "@/lib/constants";

const MESES_LABEL = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MESES_CURTO = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

const STATUS_STYLES = {
  pendente: { label: "Pendente", color: "#7A5A00", bg: "#FFF3CD" },
  pago: { label: "Pago", color: "#7A6255", bg: "#EDE8E0" },
  atrasado: { label: "Atrasado", color: "#8B1A1A", bg: "#FDF0F0" },
};

function calcularStatus(registro) {
  if (registro.status === "pago") return "pago";
  const hoje = new Date();
  const [anoComp, mesComp] = (registro.competencia || "").split("-").map(Number);
  const mesAtual = hoje.getFullYear() * 12 + (hoje.getMonth() + 1);
  const mesReg = anoComp * 12 + mesComp;
  if (mesReg < mesAtual) return "atrasado";
  return "pendente";
}

function calcularJurosEstimado(valorOriginal, competencia) {
  const hoje = new Date();
  const [ano, mes] = (competencia || "").split("-").map(Number);
  const vencimento = new Date(ano, mes - 1, DIA_VENCIMENTO_DAS);
  const diasAtraso = Math.max(0, Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24)));
  if (diasAtraso <= 0) return { valorEstimado: valorOriginal, diasAtraso: 0, temJuros: false };
  const multa = Math.min(diasAtraso * 0.0033, 0.20);
  const mesesAtraso = Math.max(1, Math.ceil(diasAtraso / 30));
  const selic = mesesAtraso * 0.01;
  const valorEstimado = valorOriginal * (1 + multa + selic);
  return { valorEstimado: Math.round(valorEstimado * 100) / 100, diasAtraso, temJuros: true };
}

function formatarMoeda(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const FAKE_DAS = [
  { id: "f1", competencia: "2026-04-01", valor: 71.6, status: "pago", data_pagamento: "2026-04-15" },
  { id: "f2", competencia: "2026-03-01", valor: 71.6, status: "pago", data_pagamento: "2026-03-18" },
  { id: "f3", competencia: "2026-02-01", valor: 71.6, status: "pago", data_pagamento: "2026-02-17" },
  { id: "f4", competencia: "2026-01-01", valor: 71.6, status: "pago", data_pagamento: "2026-01-19" },
  { id: "f5", competencia: "2025-12-01", valor: 66.6, status: "pago", data_pagamento: "2025-12-18" },
  { id: "f6", competencia: "2025-11-01", valor: 66.6, status: "pago", data_pagamento: "2025-11-16" },
];

// Modal de Pagamento
function ModalPagamento({ registro, onFechar, onSalvar, salvando }) {
  const status = calcularStatus(registro);
  const atrasado = status === "atrasado";
  const juros = atrasado ? calcularJurosEstimado(Number(registro.valor), registro.competencia) : null;

  const valorInicial = atrasado && juros ? juros.valorEstimado : Number(registro.valor);
  const [valorCentavos, setValorCentavos] = useState(Math.round(valorInicial * 100));
  const [valorDisplay, setValorDisplay] = useState(formatarMoeda(Math.round(valorInicial * 100)));
  const [dataPagamento, setDataPagamento] = useState(() => new Date().toISOString().split("T")[0]);

  const [anoStr, mesStr] = (registro.competencia || "").split("-");
  const mesIndex = parseInt(mesStr, 10) - 1;

  function handleValorChange(e) {
    const digits = e.target.value.replace(/\D/g, "");
    const centavos = parseInt(digits || "0", 10);
    setValorCentavos(centavos);
    setValorDisplay(centavos === 0 ? "" : formatarMoeda(centavos));
  }

  return createPortal(
    <>
      <div onClick={onFechar} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999, animation: "fadeIn 0.2s ease-out" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1000, width: "100%", maxWidth: 420, margin: "0 16px", backgroundColor: "#141414", borderRadius: 20, overflow: "hidden", animation: "modalIn 0.3s ease-out" }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: "24px 24px 0" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.03em" }}>
              Marcar como pago
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              {MESES_LABEL[mesIndex]} {anoStr}
            </p>
          </div>
          <button onClick={onFechar} className="cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l10 10M14 4l-10 10" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px" }} className="flex flex-col gap-4">
          {/* Valor original */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Valor original</span>
            <span style={{ display: "block", fontFamily: "var(--font-dm-mono)", fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              {Number(registro.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            {atrasado && juros && (
              <span style={{ display: "block", fontSize: 11, color: "#F59E0B", marginTop: 4 }}>
                Atrasado {juros.diasAtraso} dias - valor estimado com juros pre-preenchido
              </span>
            )}
          </div>

          {/* Valor pago */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>
              Qual valor voce pagou?
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={valorDisplay}
              onChange={handleValorChange}
              placeholder="R$ 0,00"
              className="outline-none"
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.07)",
                fontSize: 22,
                fontFamily: "var(--font-dm-mono)",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            />
          </div>

          {/* Data */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>
              Quando voce pagou?
            </label>
            <input
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              className="outline-none"
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.07)",
                fontSize: 14,
                color: "#FFFFFF",
                colorScheme: "dark",
              }}
            />
          </div>

          {/* Botoes */}
          <div className="flex gap-3" style={{ marginTop: 4 }}>
            <button
              onClick={onFechar}
              className="flex-1 py-3 rounded-xl cursor-pointer"
              style={{ border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent", color: "rgba(255,255,255,0.45)", fontWeight: 500, fontSize: 14 }}
            >
              Cancelar
            </button>
            <button
              onClick={() => onSalvar(registro.id, valorCentavos / 100, dataPagamento)}
              disabled={salvando || valorCentavos <= 0}
              className="flex-1 py-3 rounded-xl cursor-pointer btn-primary disabled:opacity-40"
              style={{ border: "none", backgroundColor: "#D4500A", color: "#FFFFFF", fontWeight: 600, fontSize: 14 }}
            >
              {salvando ? "Salvando..." : "Confirmar pagamento"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// Modal Gerar Boleto (com fluxo copiar CNPJ)
function ModalBoleto({ cnpj, onFechar, mostrarToast }) {
  const [copiado, setCopiado] = useState(false);
  const linkPgmei = `https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao?cnpj=${cnpj}`;

  function copiar() {
    navigator.clipboard.writeText(cnpj);
    setCopiado(true);
    mostrarToast("CNPJ copiado!");
  }

  return createPortal(
    <>
      <div onClick={onFechar} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999, animation: "fadeIn 0.2s ease-out" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1000, width: "100%", maxWidth: 420, margin: "0 16px", backgroundColor: "#141414", borderRadius: 20, overflow: "hidden", animation: "modalIn 0.3s ease-out" }}>
        <div className="flex items-center justify-between" style={{ padding: "24px 24px 0" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.03em" }}>
              Gerar boleto
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Portal PGMEI da Receita Federal
            </p>
          </div>
          <button onClick={onFechar} className="cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l10 10M14 4l-10 10" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px" }} className="flex flex-col gap-4">
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            O portal do PGMEI nao preenche o CNPJ automaticamente. Copie seu CNPJ abaixo e cole no campo do portal.
          </p>

          {/* CNPJ para copiar */}
          <button
            onClick={copiar}
            className="flex items-center justify-between cursor-pointer"
            style={{
              padding: "16px 18px",
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.07)",
              border: copiado ? "1px solid rgba(212,80,10,0.3)" : "1px solid rgba(255,255,255,0.1)",
              width: "100%",
              textAlign: "left",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 18, fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.02em" }}>
              {cnpj}
            </span>
            {copiado ? (
              <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: "#D4500A", fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 7l2.5 2.5L11 4" />
                </svg>
                Copiado
              </span>
            ) : (
              <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="9" height="9" rx="1.5" />
                  <path d="M10 4V2.5A1.5 1.5 0 008.5 1h-6A1.5 1.5 0 001 2.5v6A1.5 1.5 0 002.5 10H4" />
                </svg>
                Copiar
              </span>
            )}
          </button>

          <a
            href={linkPgmei}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { if (!copiado) copiar(); }}
            className="flex items-center justify-center py-3.5 rounded-xl btn-primary"
            style={{ backgroundColor: "#D4500A", color: "#FFFFFF", fontWeight: 600, fontSize: 15, textDecoration: "none", border: "none" }}
          >
            Ir para o PGMEI
          </a>

          <button
            onClick={onFechar}
            className="cursor-pointer"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 500, padding: 4 }}
          >
            Voltar
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function DasPage() {
  const { perfil, carregando: carregandoPerfil, semCnpj } = useDashboard();
  const supabase = createClient();
  const { mostrarToast } = useToast();

  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);

  // Modais
  const [modalPagamento, setModalPagamento] = useState(null);
  const [modalBoleto, setModalBoleto] = useState(false);

  useEffect(() => {
    if (!perfil) return;
    if (semCnpj) {
      setRegistros(FAKE_DAS);
      setCarregando(false);
      return;
    }
    async function carregar() {
      const { data } = await supabase
        .from("das_payments")
        .select("*")
        .eq("user_id", perfil.id)
        .order("competencia", { ascending: false });
      setRegistros(data || []);
      setCarregando(false);
    }
    carregar();
  }, [perfil, semCnpj]);

  useEffect(() => {
    function handleClick() { setMenuAberto(null); }
    if (menuAberto) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [menuAberto]);

  async function salvarPagamento(id, valor, data) {
    setSalvandoId(id);
    const { data: updated } = await supabase
      .from("das_payments")
      .update({ status: "pago", valor, data_pagamento: data })
      .eq("id", id)
      .select()
      .single();

    if (updated) {
      setRegistros((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      mostrarToast("DAS marcado como pago");
    }
    setSalvandoId(null);
    setModalPagamento(null);
  }

  async function desfazerPagamento(id) {
    setSalvandoId(id);
    const { data } = await supabase
      .from("das_payments")
      .update({ status: "pendente", data_pagamento: null })
      .eq("id", id)
      .select()
      .single();

    if (data) {
      setRegistros((prev) => prev.map((r) => (r.id === id ? data : r)));
      mostrarToast("Pagamento desfeito");
    }
    setSalvandoId(null);
    setMenuAberto(null);
  }

  const resumo = registros.reduce(
    (acc, r) => {
      const status = calcularStatus(r);
      if (status === "pago") { acc.pagos++; acc.totalPago += Number(r.valor); }
      else if (status === "atrasado") acc.atrasados++;
      else acc.pendentes++;
      return acc;
    },
    { pagos: 0, pendentes: 0, atrasados: 0, totalPago: 0 }
  );

  const temAtrasados = resumo.atrasados > 0;

  if (carregandoPerfil || carregando) {
    return (
      <div className="flex flex-col gap-5" style={{ maxWidth: 780 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ backgroundColor: "#F2EFE9", border: "1px solid #E8E3DA", borderRadius: 16, height: 80 }} />
          ))}
        </div>
      </div>
    );
  }

  const conteudo = (
    <div className="flex flex-col gap-5" style={{ maxWidth: 780 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#2A1F14", letterSpacing: "-0.03em" }}>
        Pagamento DAS
      </h1>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResumoCard label="Pagos no ano" valor={resumo.pagos} cor="#2A1F14" />
        <ResumoCard label="Pendentes" valor={resumo.pendentes} cor="#7A5A00" />
        <ResumoCard label="Atrasados" valor={resumo.atrasados} cor="#8B1A1A" />
        <ResumoCard
          label="Total pago no ano"
          valor={resumo.totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          cor="#2A1F14"
          mono
        />
      </div>

      {/* Lista de DAS */}
      <div style={{ backgroundColor: "#F2EFE9", border: "1px solid #E8E3DA", borderRadius: 16 }}>
        {registros.length === 0 && (
          <p style={{ padding: 24, fontSize: 14, color: "#7A6255", textAlign: "center" }}>
            Nenhum registro de DAS
          </p>
        )}

        {registros.map((registro, i) => {
          const status = calcularStatus(registro);
          const estilo = STATUS_STYLES[status];
          const [anoStr, mesStr] = (registro.competencia || "").split("-");
          const mesIndex = parseInt(mesStr, 10) - 1;
          const ano = anoStr;
          const salvando = salvandoId === registro.id;

          const atrasado = status === "atrasado";
          const juros = atrasado ? calcularJurosEstimado(Number(registro.valor), registro.competencia) : null;

          return (
            <div
              key={registro.id}
              style={{ borderBottom: i < registros.length - 1 ? "1px solid #EDE8E0" : "none" }}
            >
              <div
                className="flex items-center justify-between"
                style={{ padding: "16px 22px" }}
              >
                {/* Esquerda */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 42, height: 42, borderRadius: 10,
                      backgroundColor: "#FAF8F5", fontSize: 11,
                      fontWeight: 600, color: "#7A6255", letterSpacing: "0.02em",
                    }}
                  >
                    {MESES_CURTO[mesIndex]}
                  </div>
                  <div>
                    <span className="block text-sm" style={{ fontWeight: 500, color: "#2A1F14" }}>
                      {MESES_LABEL[mesIndex]} {ano}
                    </span>
                    <span className="block" style={{ fontSize: 13, fontFamily: "var(--font-dm-mono)", color: "#7A6255" }}>
                      {Number(registro.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      {atrasado && juros && (
                        <span style={{ color: "#8B1A1A", marginLeft: 4 }}>
                          (~{juros.valorEstimado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}*)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Direita */}
                <div className="flex items-center gap-3">
                  {status === "pago" && registro.data_pagamento && (
                    <span style={{ fontSize: 12, color: "#C8C2B8", fontFamily: "var(--font-dm-mono)" }}>
                      {(() => { const [a, m, d] = (registro.data_pagamento || "").split("-"); return d ? `${d}/${m}/${a}` : ""; })()}
                    </span>
                  )}

                  <span className="flex items-center gap-1.5" style={{ fontSize: 11, fontWeight: 500, color: estilo.color, backgroundColor: estilo.bg, padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap" }}>
                    <span className="inline-block rounded-full" style={{ width: 5, height: 5, backgroundColor: estilo.color, flexShrink: 0 }} />
                    {estilo.label}
                  </span>

                  {/* Acoes para pendente/atrasado */}
                  {status !== "pago" && (
                    <>
                      <button
                        onClick={() => setModalBoleto(true)}
                        className="hidden sm:flex px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                        style={{
                          backgroundColor: "#F2EFE9", color: "#2A1F14", fontWeight: 500,
                          border: "1px solid #E8E3DA", whiteSpace: "nowrap",
                          transition: "border-color 0.15s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#D4500A"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E8E3DA"; }}
                      >
                        Gerar boleto
                      </button>
                      <button
                        onClick={() => setModalPagamento(registro)}
                        className="px-3 py-1.5 rounded-lg text-xs cursor-pointer btn-primary"
                        style={{ backgroundColor: "#D4500A", color: "#FFFFFF", fontWeight: 500, border: "none", whiteSpace: "nowrap" }}
                      >
                        Marcar como pago
                      </button>
                    </>
                  )}

                  {/* Menu 3 pontos (pago) */}
                  {status === "pago" && (
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuAberto(menuAberto === registro.id ? null : registro.id); }}
                        className="cursor-pointer"
                        style={{ background: "none", border: "none", color: "#C8C2B8", padding: 4, display: "flex", alignItems: "center" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <circle cx="8" cy="3" r="1.5" />
                          <circle cx="8" cy="8" r="1.5" />
                          <circle cx="8" cy="13" r="1.5" />
                        </svg>
                      </button>

                      {menuAberto === registro.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: "absolute", right: 0, top: "100%", marginTop: 4,
                            backgroundColor: "#F2EFE9", border: "1px solid #E8E3DA", borderRadius: 12,
                            padding: "4px", minWidth: 180, zIndex: 30,
                            boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
                            animation: "fadeIn 0.15s ease-out",
                          }}
                        >
                          <button
                            onClick={() => desfazerPagamento(registro.id)}
                            disabled={salvando}
                            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm cursor-pointer disabled:opacity-50"
                            style={{ background: "none", border: "none", color: "#2A1F14", textAlign: "left" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FAF8F5"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M2 5h8M4 5l1-3h4l1 3M3 5v6.5a1.5 1.5 0 001.5 1.5h5a1.5 1.5 0 001.5-1.5V5" />
                            </svg>
                            Desfazer pagamento
                          </button>
                          <button
                            onClick={() => { setMenuAberto(null); setModalBoleto(true); }}
                            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm cursor-pointer"
                            style={{ background: "none", border: "none", color: "#2A1F14", textAlign: "left" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FAF8F5"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 8v3.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 11.5v-7A1.5 1.5 0 012.5 3H6M9 1h4v4M6 8L13 1" />
                            </svg>
                            Ver no PGMEI
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
            <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
            <path d="M10 6v4l2.5 2.5" />
            <path d="M2 10h2M16 10h2" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2">
            <p style={{ fontSize: 14, fontWeight: 600, color: "#2A1F14" }}>Sincronizacao automatica com PGMEI</p>
            <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", backgroundColor: "#FFF3CD", color: "#7A5A00", padding: "2px 8px", borderRadius: 99 }}>Em breve</span>
          </div>
          <p style={{ fontSize: 12, color: "#7A6255", marginTop: 4, lineHeight: 1.5 }}>Seu historico de pagamentos sera verificado automaticamente na Receita Federal.</p>
        </div>
      </div>

      {/* Legenda de juros */}
      {temAtrasados && (
        <p style={{ fontSize: 12, color: "#C8C2B8", lineHeight: 1.5 }}>
          * Valores estimados com multa (0,33% ao dia, max 20%) e juros (~1% ao mes baseado na Selic). O valor exato e calculado no portal do PGMEI na hora de gerar o boleto.
        </p>
      )}

      {/* Modais */}
      {modalPagamento && (
        <ModalPagamento
          registro={modalPagamento}
          onFechar={() => setModalPagamento(null)}
          onSalvar={salvarPagamento}
          salvando={!!salvandoId}
        />
      )}

      {modalBoleto && (
        <ModalBoleto
          cnpj={perfil?.cnpj || ""}
          onFechar={() => setModalBoleto(false)}
          mostrarToast={mostrarToast}
        />
      )}
    </div>
  );

  if (semCnpj) return <BlurOverlay>{conteudo}</BlurOverlay>;
  return conteudo;
}
