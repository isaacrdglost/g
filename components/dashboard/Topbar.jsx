"use client";

import { useMemo } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { extrairNome } from "@/lib/utils";

function getIniciais(nome) {
  if (!nome) return "?";
  return nome
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatarData() {
  const hoje = new Date();
  return hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function IconNota() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V6L9 1z" />
      <path d="M9 1v5h5" />
    </svg>
  );
}

export default function Topbar() {
  const { perfil, carregando } = useDashboard();
  const dataFormatada = useMemo(() => formatarData(), []);

  const nomeCompleto = perfil?.nome_fantasia
    ? extrairNome(perfil.nome_fantasia)
    : perfil?.email || "";
  const primeiroNome = nomeCompleto.split(" ")[0].split("@")[0];
  const iniciais = getIniciais(nomeCompleto);

  return (
    <header
      className="flex items-center justify-between px-7 py-4"
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #D6D6D6",
      }}
    >
      {/* Esquerda */}
      <div>
        {carregando ? (
          <div
            className="rounded"
            style={{ width: 160, height: 20, backgroundColor: "#EBEBEB" }}
          />
        ) : (
          <h1
            className="text-lg"
            style={{
              fontWeight: 600,
              color: "#1C1C1C",
              fontFamily: "var(--font-dm-sans)",
              letterSpacing: "-0.03em",
            }}
          >
            Olá, {primeiroNome}
          </h1>
        )}
        <p
          className="text-sm mt-0.5"
          style={{ color: "#8A8A8A" }}
        >
          {dataFormatada}
        </p>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          style={{
            backgroundColor: "#1C1C1C",
            color: "#FFFFFF",
            fontWeight: 500,
          }}
        >
          <IconNota />
          Emitir nota
        </button>

        {/* Avatar */}
        <div
          className="flex items-center justify-center rounded-full text-xs"
          style={{
            width: 36,
            height: 36,
            backgroundColor: "#D4E600",
            color: "#1C1C1C",
            fontWeight: 600,
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {carregando ? "" : iniciais}
        </div>
      </div>
    </header>
  );
}
