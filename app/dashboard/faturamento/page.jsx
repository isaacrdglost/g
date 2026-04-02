"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import { LIMITE_ANUAL } from "@/lib/constants";
import BlurOverlay from "@/components/dashboard/BlurOverlay";
import ResumoCard from "@/components/dashboard/ResumoCard";
import { useToast } from "@/lib/toast-context";

const MESES_LABEL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const FAKE_FATURAMENTOS = [
  { id: "f1", mes: "2026-04-01", valor: 6500, descricao: "Venda de produtos" },
  { id: "f2", mes: "2026-03-01", valor: 7100, descricao: "Serviço prestado" },
  { id: "f3", mes: "2026-02-01", valor: 6200, descricao: "Consultoria" },
  { id: "f4", mes: "2026-01-01", valor: 5800, descricao: "Venda online" },
];

export default function FaturamentoPage() {
  const { perfil, carregando: carregandoPerfil, semCnpj } = useDashboard();
  const supabase = createClient();
  const { mostrarToast } = useToast();

  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Formulário
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [mesRef, setMesRef] = useState(() => {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}`;
  });
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [modalNota, setModalNota] = useState(false);

  const linkNfse = "https://www.nfse.gov.br/EmissorNacional";
  const cnpj = perfil?.cnpj || "";

  useEffect(() => {
    if (!perfil) return;

    if (semCnpj) {
      setRegistros(FAKE_FATURAMENTOS);
      setCarregando(false);
      return;
    }

    async function carregar() {
      const { data } = await supabase
        .from("faturamento")
        .select("*")
        .eq("user_id", perfil.id)
        .order("mes", { ascending: false });

      setRegistros(data || []);
      setCarregando(false);
    }
    carregar();
  }, [perfil, semCnpj]);

  async function handleLancar(e) {
    e.preventDefault();
    if (!valor || Number(valor) <= 0) return;
    setSalvando(true);

    const { data } = await supabase
      .from("faturamento")
      .insert({
        user_id: perfil.id,
        mes: `${mesRef}-01`,
        valor: Number(valor),
        descricao: descricao.trim() || null,
      })
      .select()
      .single();

    if (data) {
      setRegistros((prev) =>
        [data, ...prev].sort((a, b) => b.mes.localeCompare(a.mes))
      );
      setValor("");
      setDescricao("");
      mostrarToast("Faturamento lancado");
    }
    setSalvando(false);
  }

  async function handleExcluir(id) {
    setExcluindoId(id);
    await supabase.from("faturamento").delete().eq("id", id);
    setRegistros((prev) => prev.filter((r) => r.id !== id));
    setExcluindoId(null);
    mostrarToast("Lancamento excluido");
  }

  // Calcular resumo
  const anoAtual = new Date().getFullYear();
  const registrosAno = registros.filter(
    (r) => new Date(r.mes).getFullYear() === anoAtual
  );
  const totalAnual = registrosAno.reduce(
    (s, r) => s + Number(r.valor), 0
  );

  // Agrupar por mês para calcular média e melhor mês
  const porMes = {};
  registrosAno.forEach((r) => {
    const chave = r.mes.slice(0, 7);
    porMes[chave] = (porMes[chave] || 0) + Number(r.valor);
  });
  const mesesComValor = Object.entries(porMes);
  const mediaMensal =
    mesesComValor.length > 0 ? totalAnual / mesesComValor.length : 0;

  let melhorMes = "";
  let melhorValor = 0;
  mesesComValor.forEach(([chave, val]) => {
    if (val > melhorValor) {
      melhorValor = val;
      const d = new Date(chave + "-01");
      melhorMes = MESES_LABEL[d.getMonth()];
    }
  });

  // Barra de progresso
  const percentual = Math.min(Math.round((totalAnual / LIMITE_ANUAL) * 100), 100);
  let corBarra = "#FF5C00";
  if (percentual >= 90) corBarra = "#E05252";
  else if (percentual >= 75) corBarra = "#F59E0B";

  if (carregandoPerfil || carregando) {
    return (
      <div className="flex flex-col gap-5" style={{ maxWidth: 780 }}>
        <div
          className="grid gap-4"
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
                padding: "18px 20px",
                height: 80,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const conteudo = (
    <div className="flex flex-col gap-5" style={{ maxWidth: 780 }}>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#1C1C1C",
          letterSpacing: "-0.03em",
        }}
      >
        Faturamento
      </h1>

      {/* Cards de resumo */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        <ResumoCard
          label="Total faturado no ano"
          valor={totalAnual.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          mono
        />
        <ResumoCard
          label="Média mensal"
          valor={mediaMensal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          mono
        />
        <ResumoCard
          label="Melhor mês do ano"
          valor={
            melhorMes
              ? `${melhorMes} (${melhorValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})`
              : "Sem dados"
          }
        />
      </div>

      {/* Formulário */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D6D6D6",
          borderRadius: 12,
          padding: "22px 26px",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#8A8A8A",
          }}
        >
          Lançar faturamento
        </span>

        <form
          onSubmit={handleLancar}
          className="flex items-end gap-3 mt-4"
        >
          <div className="flex flex-col gap-1.5 flex-1">
            <label
              htmlFor="valor"
              className="text-xs"
              style={{ fontWeight: 500, color: "#1C1C1C" }}
            >
              Valor (R$)
            </label>
            <input
              id="valor"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="outline-none"
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #D6D6D6",
                fontSize: 14,
                fontFamily: "var(--font-dm-mono)",
                color: "#1C1C1C",
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <label
              htmlFor="descricao"
              className="text-xs"
              style={{ fontWeight: 500, color: "#1C1C1C" }}
            >
              Descrição (opcional)
            </label>
            <input
              id="descricao"
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Venda de produtos"
              className="outline-none"
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #D6D6D6",
                fontSize: 14,
                color: "#1C1C1C",
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="mes"
              className="text-xs"
              style={{ fontWeight: 500, color: "#1C1C1C" }}
            >
              Mês
            </label>
            <input
              id="mes"
              type="month"
              value={mesRef}
              onChange={(e) => setMesRef(e.target.value)}
              className="outline-none"
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #D6D6D6",
                fontSize: 14,
                color: "#1C1C1C",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="px-5 py-2.5 rounded-lg text-sm cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: "#FF5C00",
              color: "#1C1C1C",
              fontWeight: 600,
              border: "none",
              whiteSpace: "nowrap",
            }}
          >
            {salvando ? "Salvando..." : "Lançar"}
          </button>
        </form>
      </div>

      {/* Barra de progresso do limite */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D6D6D6",
          borderRadius: 12,
          padding: "18px 22px",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 13, color: "#8A8A8A" }}>
            Limite anual:{" "}
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontWeight: 500,
                color: "#1C1C1C",
              }}
            >
              {totalAnual.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
            <span style={{ color: "#8A8A8A" }}> / R$ 81.000</span>
          </span>

          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: 14,
              fontWeight: 500,
              color: "#1C1C1C",
            }}
          >
            {percentual}%
          </span>
        </div>

        <div
          style={{
            height: 6,
            borderRadius: 99,
            backgroundColor: "#EBEBEB",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${percentual}%`,
              borderRadius: 99,
              backgroundColor: corBarra,
              transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
      </div>

      {/* Lista de lançamentos */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D6D6D6",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            padding: "18px 22px 0",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#8A8A8A",
            }}
          >
            Lançamentos
          </span>
        </div>

        {registros.length === 0 && (
          <p
            style={{
              padding: "24px 22px",
              fontSize: 14,
              color: "#8A8A8A",
            }}
          >
            Nenhum lançamento registrado
          </p>
        )}

        {registros.map((r, i) => {
          const d = new Date(r.mes);
          const excluindo = excluindoId === r.id;

          return (
            <div
              key={r.id}
              className="flex items-center justify-between"
              style={{
                padding: "14px 22px",
                borderBottom:
                  i < registros.length - 1 ? "1px solid #EBEBEB" : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    backgroundColor: "#F3F3F3",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#1C1C1C",
                    letterSpacing: "0.02em",
                  }}
                >
                  {MESES_LABEL[d.getMonth()]?.slice(0, 3).toUpperCase()}
                </div>

                <div>
                  <span
                    className="block text-sm"
                    style={{ fontWeight: 500, color: "#1C1C1C" }}
                  >
                    {MESES_LABEL[d.getMonth()]} {d.getFullYear()}
                  </span>
                  {r.descricao && (
                    <span
                      className="block"
                      style={{ fontSize: 12, color: "#8A8A8A" }}
                    >
                      {r.descricao}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#CC4400",
                  }}
                >
                  +{Number(r.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>

                <button
                  onClick={() => setModalNota(true)}
                  className="cursor-pointer transition-opacity hover:opacity-70"
                  style={{ background: "none", border: "none", padding: 4, color: "#8A8A8A" }}
                  title="Emitir nota fiscal"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 1H4a1.5 1.5 0 00-1.5 1.5v11A1.5 1.5 0 004 15h8a1.5 1.5 0 001.5-1.5V5.5L9 1z" />
                    <path d="M9 1v5h4.5" />
                  </svg>
                </button>

                <button
                  onClick={() => handleExcluir(r.id)}
                  disabled={excluindo}
                  className="cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-30"
                  style={{ background: "none", border: "none", padding: 4, color: "#8A8A8A" }}
                  title="Excluir"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4M6.67 7.33v4M9.33 7.33v4M12.67 4v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const modalNotaEl = modalNota && createPortal(
    <>
      <div onClick={() => setModalNota(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999, animation: "fadeIn 0.2s ease-out" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1000, width: "100%", maxWidth: 420, margin: "0 16px", backgroundColor: "#1C1C1C", borderRadius: 20, overflow: "hidden", animation: "modalIn 0.3s ease-out" }}>
        <div className="flex items-center justify-between" style={{ padding: "24px 24px 0" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.03em" }}>Emitir nota fiscal</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Emissor Nacional de NFS-e</p>
          </div>
          <button onClick={() => setModalNota(false)} className="cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l10 10M14 4l-10 10" /></svg>
          </button>
        </div>
        <ModalNotaConteudo cnpj={cnpj} linkNfse={linkNfse} mostrarToast={mostrarToast} onFechar={() => setModalNota(false)} />
      </div>
    </>,
    document.body
  );

  if (semCnpj) return <BlurOverlay>{conteudo}</BlurOverlay>;
  return <>{conteudo}{modalNotaEl}</>;
}

function ModalNotaConteudo({ cnpj, linkNfse, mostrarToast, onFechar }) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(cnpj);
    setCopiado(true);
    mostrarToast("CNPJ copiado!");
  }

  return (
    <div style={{ padding: "20px 24px 24px" }} className="flex flex-col gap-4">
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
        O Emissor Nacional pode pedir seu CNPJ. Copie abaixo e cole no campo do portal.
      </p>

      <button
        onClick={copiar}
        className="flex items-center justify-between cursor-pointer"
        style={{
          padding: "16px 18px", borderRadius: 14,
          backgroundColor: "rgba(255,255,255,0.07)",
          border: copiado ? "1px solid rgba(255,92,0,0.3)" : "1px solid rgba(255,255,255,0.1)",
          width: "100%", textAlign: "left", transition: "all 0.2s ease",
        }}
      >
        <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 18, fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.02em" }}>
          {cnpj}
        </span>
        {copiado ? (
          <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: "#FF5C00", fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#FF5C00" strokeWidth="2" strokeLinecap="round"><path d="M3 7l2.5 2.5L11 4" /></svg>
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
        href={linkNfse}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => { if (!copiado) copiar(); }}
        className="flex items-center justify-center py-3.5 rounded-xl btn-primary"
        style={{ backgroundColor: "#FF5C00", color: "#1C1C1C", fontWeight: 600, fontSize: 15, textDecoration: "none", border: "none" }}
      >
        Ir para o Emissor Nacional
      </a>

      <button onClick={onFechar} className="cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 500, padding: 4 }}>
        Voltar
      </button>
    </div>
  );
}

