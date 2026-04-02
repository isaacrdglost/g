"use client";

import { useMemo } from "react";
import Link from "next/link";
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
      className="flex items-center justify-between"
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #F3F3F3",
        padding: "18px 32px",
      }}
    >
      <div>
        {carregando ? (
          <div className="skeleton rounded" style={{ width: 180, height: 22 }} />
        ) : (
          <h1
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#1C1C1C",
              fontFamily: "var(--font-dm-sans)",
              letterSpacing: "-0.03em",
            }}
          >
            Ola, {primeiroNome}
          </h1>
        )}
        <p style={{ fontSize: 13, color: "#D6D6D6", marginTop: 1 }}>
          {dataFormatada}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/notas"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm btn-primary"
          style={{
            backgroundColor: "#1C1C1C",
            color: "#FFFFFF",
            fontWeight: 500,
            textDecoration: "none",
            fontSize: 13,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M7 1v12M1 7h12" />
          </svg>
          Emitir nota
        </Link>

        <Link
          href="/dashboard/conta"
          className="flex items-center justify-center rounded-full btn-primary"
          style={{
            width: 38,
            height: 38,
            backgroundColor: "#D4E600",
            color: "#1C1C1C",
            fontWeight: 600,
            fontSize: 12,
            fontFamily: "var(--font-dm-sans)",
            textDecoration: "none",
          }}
        >
          {carregando ? "" : iniciais}
        </Link>
      </div>
    </header>
  );
}
