"use client";

import { useEffect, useState } from "react";
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
  let corBarra = "#D4E600";
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
              backgroundColor: "#D4E600",
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
                    color: "#6B7400",
                  }}
                >
                  +{Number(r.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>

                <button
                  onClick={() => handleExcluir(r.id)}
                  disabled={excluindo}
                  className="cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-30"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 4,
                    color: "#8A8A8A",
                  }}
                  title="Excluir"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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

  if (semCnpj) return <BlurOverlay>{conteudo}</BlurOverlay>;
  return conteudo;
}

