"use client";

import { useState } from "react";

const NOTIFICACOES_INICIAIS = [
  {
    id: "boas-vindas",
    texto: "Bem-vindo ao Guiado! Cadastre seu CNPJ para comecar.",
    tempo: "ha 1 dia",
    cor: "#4ADE80",
    lida: false,
  },
  {
    id: "das-pendente",
    texto: "Seu DAS de abril vence em 6 dias. Nao deixe passar!",
    tempo: "ha 2 dias",
    cor: "#F59E0B",
    lida: false,
  },
  {
    id: "assinatura",
    texto: "Seu plano Free tem recursos limitados. Conheca o Pro.",
    tempo: "ha 3 dias",
    cor: "#3B82F6",
    lida: false,
  },
  {
    id: "atualizacao",
    texto: "Novidade: agora voce pode lancar recebimentos direto do dashboard.",
    tempo: "ha 5 dias",
    cor: "#8A8A8A",
    lida: true,
  },
];

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState(NOTIFICACOES_INICIAIS);

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
