"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { LIMITE_ANUAL, DIA_VENCIMENTO_DAS } from "@/lib/constants";

const MESES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Retorna { ano, mes, dia } da data atual sem problemas de fuso
function hoje() {
  const d = new Date();
  return { ano: d.getFullYear(), mes: d.getMonth(), dia: d.getDate() };
}

// Extrai ano e mes (0-indexed) de uma string de competencia "YYYY-MM-DD"
function parseCompetencia(comp) {
  if (!comp) return null;
  const partes = String(comp).split("-");
  return { ano: Number(partes[0]), mes: Number(partes[1]) - 1 };
}

function gerarNotificacoes(dasRegistros, faturamentos, totalAnual, semCnpj) {
  const notifs = [];
  const { ano, mes, dia } = hoje();

  // --- URGENTE ---

  // a) DAS atrasado: competencia anterior ao mes atual e nao pago
  if (dasRegistros && dasRegistros.length > 0) {
    dasRegistros.forEach((das) => {
      const comp = parseCompetencia(das.competencia);
      if (!comp) return;
      const eAnterior = comp.ano < ano || (comp.ano === ano && comp.mes < mes);
      if (eAnterior && das.status !== "pago") {
        const mesNome = MESES[comp.mes] || "";
        notifs.push({
          id: `das-atrasado-${comp.ano}${String(comp.mes + 1).padStart(2, "0")}`,
          titulo: "DAS em atraso",
          texto: `Seu DAS de ${mesNome} esta atrasado. Regularize agora para evitar multa.`,
          cor: "#E24B4A",
          tipo: "urgente",
          acao: "/dashboard/das",
          lida: false,
        });
      }
    });
  }

  // b) DAS vencendo em 5 dias ou menos (dia >= 15 do mes atual)
  if (dasRegistros && dia >= 15 && dia <= DIA_VENCIMENTO_DAS) {
    const dasMesAtual = dasRegistros.find((das) => {
      const comp = parseCompetencia(das.competencia);
      return comp && comp.ano === ano && comp.mes === mes;
    });
    if (dasMesAtual && dasMesAtual.status !== "pago") {
      const diasRestantes = DIA_VENCIMENTO_DAS - dia;
      const mesNome = MESES[mes];
      notifs.push({
        id: `das-vencendo-${ano}${String(mes + 1).padStart(2, "0")}`,
        titulo: diasRestantes === 0
          ? "DAS vence hoje"
          : `DAS vence em ${diasRestantes} ${diasRestantes === 1 ? "dia" : "dias"}`,
        texto: `Seu DAS de ${mesNome} vence dia ${DIA_VENCIMENTO_DAS}. Pague agora para evitar multa de 0,33% ao dia.`,
        cor: "#E24B4A",
        tipo: "urgente",
        acao: "/dashboard/das",
        lida: false,
      });
    }
  }

  // c) Faturamento > 80%
  const percentual = totalAnual / LIMITE_ANUAL;
  if (percentual > 0.8) {
    const pctFormatado = Math.round(percentual * 100);
    notifs.push({
      id: "limite-risco",
      titulo: "Limite anual em risco",
      texto: `Voce ja usou ${pctFormatado}% do limite. Considere planejar a migracao para ME.`,
      cor: "#E24B4A",
      tipo: "urgente",
      acao: "/dashboard/faturamento",
      lida: false,
    });
  }

  // --- ATENCAO ---

  // d) Faturamento > 60% (e <= 80%)
  if (percentual > 0.6 && percentual <= 0.8) {
    const pctFormatado = Math.round(percentual * 100);
    notifs.push({
      id: "limite-atencao",
      titulo: `Voce usou ${pctFormatado}% do limite anual`,
      texto: `Ja faturou ${formatarMoeda(totalAnual)} de R$ 81.000. Fique atento ao ritmo.`,
      cor: "#F59E0B",
      tipo: "atencao",
      acao: "/dashboard/faturamento",
      lida: false,
    });
  }

  // e) Epoca da DASN (marco, abril, maio)
  if (mes >= 2 && mes <= 4) {
    notifs.push({
      id: `dasn-${ano}`,
      titulo: "DASN vence em maio",
      texto: "A Declaracao Anual do MEI vence dia 31 de maio. Nao deixe para ultima hora.",
      cor: "#F59E0B",
      tipo: "atencao",
      acao: "/dashboard/obrigacoes",
      lida: false,
    });
  }

  // --- INFO ---

  // f) Sem lancamentos de faturamento (usuario com CNPJ)
  if (!semCnpj) {
    const temLancamento =
      faturamentos &&
      faturamentos.length > 0 &&
      faturamentos.some((f) => Number(f.valor) > 0);
    if (!temLancamento) {
      notifs.push({
        id: "sem-faturamento",
        titulo: "Registre seus recebimentos",
        texto: "Sem lancamentos, nao conseguimos calcular seu limite real. Lance seu primeiro recebimento.",
        cor: "#3B82F6",
        tipo: "info",
        acao: null,
        lida: false,
      });
    }
  }

  // g) Boas-vindas (sem CNPJ)
  if (semCnpj) {
    notifs.push({
      id: "bem-vindo",
      titulo: "Bem-vindo ao Guiado",
      texto: "Seu MEI organizado em um lugar so. Comece cadastrando seu CNPJ.",
      cor: "#3B82F6",
      tipo: "info",
      acao: "/dashboard/conta",
      lida: false,
    });
  }

  // Ordenar: urgente > atencao > info
  const ordem = { urgente: 0, atencao: 1, info: 2 };
  notifs.sort((a, b) => ordem[a.tipo] - ordem[b.tipo]);

  return notifs;
}

export function useNotificacoes(perfil, semCnpj) {
  const [dasRegistros, setDasRegistros] = useState(null);
  const [faturamentos, setFaturamentos] = useState(null);
  const [totalAnual, setTotalAnual] = useState(0);
  const [lidas, setLidas] = useState(new Set());

  // Buscar dados do Supabase quando perfil estiver disponivel
  useEffect(() => {
    if (!perfil?.id) return;

    const supabase = createClient();
    const { ano } = hoje();

    async function carregar() {
      // Buscar DAS
      const { data: dasData } = await supabase
        .from("das_payments")
        .select("*")
        .eq("user_id", perfil.id)
        .order("competencia", { ascending: false });

      if (dasData) setDasRegistros(dasData);

      // Buscar faturamento do ano atual
      const inicioAno = `${ano}-01-01`;
      const fimAno = `${ano}-12-31`;
      const { data: fatData } = await supabase
        .from("faturamento")
        .select("*")
        .eq("user_id", perfil.id)
        .gte("mes", inicioAno)
        .lte("mes", fimAno);

      if (fatData) {
        setFaturamentos(fatData);
        const total = fatData.reduce((acc, f) => acc + Number(f.valor || 0), 0);
        setTotalAnual(total);
      }
    }

    carregar();
  }, [perfil?.id]);

  const notificacoes = useMemo(() => {
    if (!perfil?.id) return [];
    return gerarNotificacoes(dasRegistros, faturamentos, totalAnual, semCnpj);
  }, [dasRegistros, faturamentos, totalAnual, semCnpj, perfil?.id]);

  // Aplicar estado de leitura
  const notificacoesComLeitura = useMemo(
    () => notificacoes.map((n) => ({ ...n, lida: lidas.has(n.id) })),
    [notificacoes, lidas]
  );

  const naoLidas = useMemo(
    () => notificacoesComLeitura.filter((n) => n.tipo === "urgente" && !n.lida).length,
    [notificacoesComLeitura]
  );

  const temUrgente = useMemo(
    () => notificacoesComLeitura.some((n) => n.tipo === "urgente" && !n.lida),
    [notificacoesComLeitura]
  );

  function marcarComoLida(id) {
    setLidas((prev) => new Set([...prev, id]));
  }

  function marcarTodasComoLidas() {
    setLidas(new Set(notificacoes.map((n) => n.id)));
  }

  return {
    notificacoes: notificacoesComLeitura,
    naoLidas,
    temUrgente,
    marcarComoLida,
    marcarTodasComoLidas,
  };
}
