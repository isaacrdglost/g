"use client";

import { useState, useMemo } from "react";
import { DIA_VENCIMENTO_DAS } from "@/lib/constants";

function calcularDiasParaDas() {
  const hoje = new Date();
  const vencimento = new Date(hoje.getFullYear(), hoje.getMonth(), DIA_VENCIMENTO_DAS);
  const diffMs = vencimento.getTime() - hoje.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function gerarNotificacoes() {
  const diasDas = calcularDiasParaDas();

  let textoDas;
  if (diasDas > 0) {
    textoDas = `Seu DAS vence em ${diasDas} ${diasDas === 1 ? "dia" : "dias"}, no dia 20. Nao deixe passar!`;
  } else if (diasDas === 0) {
    textoDas = "Seu DAS vence hoje, dia 20. Pague agora!";
  } else {
    textoDas = `Seu DAS venceu ha ${Math.abs(diasDas)} dias. Regularize o quanto antes.`;
  }

  return [
    {
      id: "atualizacao",
      texto: "Novidade: agora voce pode lancar recebimentos direto do dashboard.",
      tempo: "agora",
      cor: "#8A8A8A",
      lida: false,
    },
    {
      id: "das-pendente",
      texto: textoDas,
      tempo: "hoje",
      cor: "#F59E0B",
      lida: false,
    },
    {
      id: "assinatura",
      texto: "Seu plano Free tem recursos limitados. Conheca o Pro.",
      tempo: "ha 2 dias",
      cor: "#3B82F6",
      lida: false,
    },
    {
      id: "boas-vindas",
      texto: "Bem-vindo ao Guiado! Cadastre seu CNPJ para comecar.",
      tempo: "ha 5 dias",
      cor: "#4ADE80",
      lida: true,
    },
  ];
}

export function useNotificacoes() {
  const iniciais = useMemo(() => gerarNotificacoes(), []);
  const [notificacoes, setNotificacoes] = useState(iniciais);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  function marcarComoLida(id) {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  }

  function marcarTodasComoLidas() {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  return { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas };
}
