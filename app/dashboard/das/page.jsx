"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import BlurOverlay from "@/components/dashboard/BlurOverlay";

const MESES_LABEL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MESES_CURTO = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

const STATUS_STYLES = {
  pendente: { label: "Pendente", color: "#7A5A00", bg: "#FFF3CD" },
  pago: { label: "Pago", color: "#8A8A8A", bg: "#F3F3F3" },
  atrasado: { label: "Atrasado", color: "#8B1A1A", bg: "#FDF0F0" },
};

// Calcular status real baseado na data
function calcularStatus(registro) {
  if (registro.status === "pago") return "pago";

  const hoje = new Date();
  const comp = new Date(registro.competencia);
  const mesAtual = hoje.getFullYear() * 12 + hoje.getMonth();
  const mesComp = comp.getFullYear() * 12 + comp.getMonth();

  if (mesComp < mesAtual) return "atrasado";
  return "pendente";
}

const FAKE_DAS = [
  { id: "f1", competencia: "2026-04-01", valor: 71.6, status: "pago", data_pagamento: "2026-04-15" },
  { id: "f2", competencia: "2026-03-01", valor: 71.6, status: "pago", data_pagamento: "2026-03-18" },
  { id: "f3", competencia: "2026-02-01", valor: 71.6, status: "pago", data_pagamento: "2026-02-17" },
  { id: "f4", competencia: "2026-01-01", valor: 71.6, status: "pago", data_pagamento: "2026-01-19" },
  { id: "f5", competencia: "2025-12-01", valor: 66.6, status: "pago", data_pagamento: "2025-12-18" },
  { id: "f6", competencia: "2025-11-01", valor: 66.6, status: "pago", data_pagamento: "2025-11-16" },
];

export default function DasPage() {
  const { perfil, carregando: carregandoPerfil, semCnpj } = useDashboard();
  const supabase = createClient();

  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState(null);

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

  async function marcarComoPago(id) {
    setSalvandoId(id);

    const hoje = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("das_payments")
      .update({ status: "pago", data_pagamento: hoje })
      .eq("id", id)
      .select()
      .single();

    if (data) {
      setRegistros((prev) => prev.map((r) => (r.id === id ? data : r)));
    }
    setSalvandoId(null);
  }

  // Calcular resumo
  const resumo = registros.reduce(
    (acc, r) => {
      const status = calcularStatus(r);
      if (status === "pago") {
        acc.pagos++;
        acc.totalPago += Number(r.valor);
      } else if (status === "atrasado") {
        acc.atrasados++;
      } else {
        acc.pendentes++;
      }
      return acc;
    },
    { pagos: 0, pendentes: 0, atrasados: 0, totalPago: 0 }
  );

  const linkPgmei = `https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao?cnpj=${perfil?.cnpj || ""}`;

  if (carregandoPerfil || carregando) {
    return (
      <div className="flex flex-col gap-5" style={{ maxWidth: 780 }}>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
        >
          {[1, 2, 3, 4].map((i) => (
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
        Pagamento DAS
      </h1>

      {/* Cards de resumo */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        <ResumoCard label="Pagos no ano" valor={resumo.pagos} cor="#1C1C1C" />
        <ResumoCard label="Pendentes" valor={resumo.pendentes} cor="#7A5A00" />
        <ResumoCard label="Atrasados" valor={resumo.atrasados} cor="#8B1A1A" />
        <ResumoCard
          label="Total pago no ano"
          valor={resumo.totalPago.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          cor="#1C1C1C"
          mono
        />
      </div>

      {/* Lista de DAS */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D6D6D6",
          borderRadius: 12,
        }}
      >
        {registros.length === 0 && (
          <p
            style={{
              padding: "24px",
              fontSize: 14,
              color: "#8A8A8A",
              textAlign: "center",
            }}
          >
            Nenhum registro de DAS
          </p>
        )}

        {registros.map((registro, i) => {
          const status = calcularStatus(registro);
          const estilo = STATUS_STYLES[status];
          const comp = new Date(registro.competencia);
          const mesIndex = comp.getMonth();
          const ano = comp.getFullYear();
          const salvando = salvandoId === registro.id;

          return (
            <div
              key={registro.id}
              className="flex items-center justify-between"
              style={{
                padding: "16px 22px",
                borderBottom:
                  i < registros.length - 1 ? "1px solid #EBEBEB" : "none",
              }}
            >
              {/* Esquerda: ícone + info */}
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
                  {MESES_CURTO[mesIndex]}
                </div>

                <div>
                  <span
                    className="block text-sm"
                    style={{ fontWeight: 500, color: "#1C1C1C" }}
                  >
                    {MESES_LABEL[mesIndex]} {ano}
                  </span>
                  <span
                    className="block"
                    style={{
                      fontSize: 13,
                      fontFamily: "var(--font-dm-mono)",
                      color: "#8A8A8A",
                    }}
                  >
                    {Number(registro.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>

              {/* Direita: status + ações */}
              <div className="flex items-center gap-3">
                {/* Data de pagamento se pago */}
                {status === "pago" && registro.data_pagamento && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "#8A8A8A",
                      fontFamily: "var(--font-dm-mono)",
                    }}
                  >
                    {new Date(registro.data_pagamento).toLocaleDateString(
                      "pt-BR"
                    )}
                  </span>
                )}

                {/* Pill */}
                <span
                  className="flex items-center gap-1.5"
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: estilo.color,
                    backgroundColor: estilo.bg,
                    padding: "3px 10px",
                    borderRadius: 99,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    className="inline-block rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      backgroundColor: estilo.color,
                      flexShrink: 0,
                    }}
                  />
                  {estilo.label}
                </span>

                {/* Ações para pendente/atrasado */}
                {status !== "pago" && (
                  <>
                    <a
                      href={linkPgmei}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#1C1C1C",
                        fontWeight: 500,
                        border: "1px solid #D6D6D6",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Gerar boleto
                    </a>

                    <button
                      onClick={() => marcarComoPago(registro.id)}
                      disabled={salvando}
                      className="px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{
                        backgroundColor: "#1C1C1C",
                        color: "#D4E600",
                        fontWeight: 500,
                        border: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {salvando ? "Salvando..." : "Marcar como pago"}
                    </button>
                  </>
                )}
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

function ResumoCard({ label, valor, cor, mono }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #D6D6D6",
        borderRadius: 12,
        padding: "18px 20px",
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
        {label}
      </span>
      <p
        className="mt-1.5"
        style={{
          fontSize: mono ? 18 : 24,
          fontWeight: mono ? 700 : 600,
          color: cor,
          fontFamily: mono ? "var(--font-dm-mono)" : "var(--font-dm-sans)",
          letterSpacing: mono ? 0 : "-0.03em",
        }}
      >
        {valor}
      </p>
    </div>
  );
}
