"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { useSidebar } from "@/lib/sidebar-context";
import { extrairNome } from "@/lib/utils";
import ModalRecebimento from "@/components/dashboard/ModalRecebimento";

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
  const { toggle } = useSidebar();
  const dataFormatada = useMemo(() => formatarData(), []);
  const [modalAberto, setModalAberto] = useState(false);

  const nomeCompleto = perfil?.nome_fantasia
    ? extrairNome(perfil.nome_fantasia)
    : perfil?.email || "";
  const primeiroNome = nomeCompleto.split(" ")[0].split("@")[0];
  const iniciais = getIniciais(nomeCompleto);

  return (
    <>
      <header
        className="flex items-center justify-between lg:px-8 lg:py-5"
        style={{
          backgroundColor: "#F7F7F5",
          borderBottom: "1px solid #EBEBEB",
          padding: "14px 16px",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="lg:hidden cursor-pointer"
            style={{ background: "none", border: "none", color: "#1C1C1C", padding: 4 }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 6h16M3 11h16M3 16h16" />
            </svg>
          </button>

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
            <p className="hidden sm:block" style={{ fontSize: 13, color: "#D6D6D6", marginTop: 1 }}>
              {dataFormatada}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm btn-primary cursor-pointer"
            style={{
              backgroundColor: "#D4E600",
              color: "#1C1C1C",
              fontWeight: 600,
              fontSize: 13,
              border: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 1v12M1 7h12" />
            </svg>
            <span className="hidden sm:inline">Lancar recebimento</span>
          </button>

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

      <ModalRecebimento
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
      />
    </>
  );
}
