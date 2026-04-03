"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Profile {
  id: string;
  nome_fantasia: string;
  email?: string;
  cnpj?: string;
  plano: string;
  cnae?: string;
  situacao?: string;
  created_at: string;
  avatar_url?: string;
}

interface DasPayment {
  id: string;
  competencia: string;
  valor: number;
  status: string;
  data_pagamento?: string;
}

interface Faturamento {
  id: string;
  mes: string;
  valor: number;
  descricao?: string;
  created_at: string;
}

interface Nota {
  id: string;
  numero?: string;
  valor: number;
  destinatario?: string;
  data_emissao?: string;
  status?: string;
  created_at: string;
}

interface Ticket {
  id: string;
  assunto: string;
  status: string;
  mensagem?: string;
  created_at: string;
}

const cardStyle: React.CSSProperties = {
  background: "#1A1A1A",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  padding: "20px 24px",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: "rgba(255,255,255,0.3)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  marginBottom: 4,
};

function formatDate(d: string | null | undefined) {
  if (!d) return "-";
  const parts = d.split("T")[0].split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarCnpj(cnpj: string | null | undefined) {
  if (!cnpj) return "-";
  const n = cnpj.replace(/\D/g, "");
  if (n.length < 14) return cnpj;
  return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5, 8)}/${n.slice(8, 12)}-${n.slice(12)}`;
}

function planoBadge(plano: string) {
  const isPro = plano === "pro" || plano === "anual";
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 99,
        background: isPro ? "rgba(212,80,10,0.15)" : "rgba(255,255,255,0.06)",
        color: isPro ? "#D4500A" : "rgba(255,255,255,0.4)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {plano || "free"}
    </span>
  );
}

function statusBadge(status: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    pendente: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B" },
    pago: { bg: "rgba(74,222,128,0.15)", text: "#4ADE80" },
    atrasado: { bg: "rgba(226,75,74,0.15)", text: "#E24B4A" },
    aberto: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B" },
    resolvido: { bg: "rgba(74,222,128,0.15)", text: "#4ADE80" },
    fechado: { bg: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.4)" },
  };
  const c = colors[status] || colors.pendente;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 99,
        background: c.bg,
        color: c.text,
      }}
    >
      {status}
    </span>
  );
}

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const tabs = ["DAS", "Faturamento", "Notas", "Tickets"] as const;
type Tab = (typeof tabs)[number];

export default function UsuarioDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("DAS");
  const [das, setDas] = useState<DasPayment[]>([]);
  const [faturamento, setFaturamento] = useState<Faturamento[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletando, setDeletando] = useState(false);

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este usuario? Todos os dados serao apagados permanentemente.")) return;
    setDeletando(true);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_user", userId: id }),
      });
      router.push("/admin/usuarios");
    } catch {
      setDeletando(false);
    }
  }

  // Load all user data
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const res = await fetch(`/api/admin?action=usuario&id=${id}`);
      const data = await res.json();
      setProfile(data.profile as Profile);
      setDas((data.das as DasPayment[]) || []);
      setFaturamento((data.faturamento as Faturamento[]) || []);
      setNotas((data.notas as Nota[]) || []);
      setTickets((data.tickets as Ticket[]) || []);
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, padding: 20 }}>
        Carregando...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, padding: 20 }}>
        Usuario nao encontrado
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, position: "relative" }}>
      {/* Back */}
      <Link
        href="/admin/usuarios"
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.4)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 20,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Voltar
      </Link>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={deletando}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          background: "none",
          border: "1px solid rgba(226,75,74,0.2)",
          borderRadius: 10,
          padding: "8px 16px",
          fontSize: 12,
          fontWeight: 500,
          color: "#E24B4A",
          cursor: "pointer",
          transition: "all 0.15s ease",
          opacity: deletando ? 0.5 : 1,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(226,75,74,0.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        {deletando ? "Excluindo..." : "Excluir usuario"}
      </button>

      {/* Profile header */}
      <div
        style={{
          ...cardStyle,
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "rgba(212,80,10,0.15)",
            color: "#D4500A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {getInitials(profile.nome_fantasia)}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#FAF8F5",
                letterSpacing: "-0.02em",
              }}
            >
              {profile.nome_fantasia || "Sem nome"}
            </span>
            {planoBadge(profile.plano)}
          </div>
          <div
            style={{
              display: "flex",
              gap: 20,
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              flexWrap: "wrap",
            }}
          >
            {profile.email && <span>{profile.email}</span>}
            {profile.cnpj && (
              <span style={{ fontFamily: "var(--font-dm-mono), monospace" }}>
                {formatarCnpj(profile.cnpj)}
              </span>
            )}
            <span style={{ fontFamily: "var(--font-dm-mono), monospace" }}>
              Cadastro: {formatDate(profile.created_at)}
            </span>
          </div>
          {profile.cnae && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
              CNAE: {profile.cnae}
              {profile.situacao && (
                <span style={{ marginLeft: 12 }}>Situacao: {profile.situacao}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: 0,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 500,
              border: "none",
              borderBottom:
                activeTab === tab ? "2px solid #D4500A" : "2px solid transparent",
              background: "transparent",
              color:
                activeTab === tab ? "#D4500A" : "rgba(255,255,255,0.35)",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={cardStyle}>
                {/* DAS Tab */}
        {activeTab === "DAS" && (
          <>
            {das.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                Nenhum DAS encontrado
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Competencia", "Valor", "Status", "Data pagamento"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 500,
                          color: "rgba(255,255,255,0.3)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {das.map((d) => (
                    <tr
                      key={d.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "var(--font-dm-mono), monospace",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {formatDate(d.competencia)}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "var(--font-dm-mono), monospace",
                          color: "#FAF8F5",
                          fontWeight: 500,
                        }}
                      >
                        {formatMoney(d.valor)}
                      </td>
                      <td style={{ padding: "8px 12px" }}>{statusBadge(d.status)}</td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "var(--font-dm-mono), monospace",
                          color: "rgba(255,255,255,0.35)",
                          fontSize: 12,
                        }}
                      >
                        {formatDate(d.data_pagamento)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Faturamento Tab */}
        {activeTab === "Faturamento" && (
          <>
            {faturamento.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                Nenhum faturamento encontrado
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Mes", "Valor", "Descricao", "Criado em"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 500,
                          color: "rgba(255,255,255,0.3)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {faturamento.map((f) => (
                    <tr
                      key={f.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "var(--font-dm-mono), monospace",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {formatDate(f.mes)}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "var(--font-dm-mono), monospace",
                          color: "#FAF8F5",
                          fontWeight: 500,
                        }}
                      >
                        {formatMoney(f.valor)}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {f.descricao || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "var(--font-dm-mono), monospace",
                          color: "rgba(255,255,255,0.35)",
                          fontSize: 12,
                        }}
                      >
                        {formatDate(f.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Notas Tab */}
        {activeTab === "Notas" && (
          <>
            {notas.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                Nenhuma nota encontrada
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Numero", "Destinatario", "Valor", "Status", "Emissao"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 12px",
                            textAlign: "left",
                            fontSize: 11,
                            fontWeight: 500,
                            color: "rgba(255,255,255,0.3)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {notas.map((n) => (
                    <tr
                      key={n.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "var(--font-dm-mono), monospace",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {n.numero || "-"}
                      </td>
                      <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.4)" }}>
                        {n.destinatario || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "var(--font-dm-mono), monospace",
                          color: "#FAF8F5",
                          fontWeight: 500,
                        }}
                      >
                        {formatMoney(n.valor)}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        {n.status ? statusBadge(n.status) : "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "var(--font-dm-mono), monospace",
                          color: "rgba(255,255,255,0.35)",
                          fontSize: 12,
                        }}
                      >
                        {formatDate(n.data_emissao || n.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Tickets Tab */}
        {activeTab === "Tickets" && (
          <>
            {tickets.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                Nenhum ticket encontrado
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontWeight: 500, color: "#FAF8F5" }}>
                        {t.assunto}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {statusBadge(t.status)}
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: "var(--font-dm-mono), monospace",
                            color: "rgba(255,255,255,0.25)",
                          }}
                        >
                          {formatDate(t.created_at)}
                        </span>
                      </div>
                    </div>
                    {t.mensagem && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.3)",
                          lineHeight: 1.5,
                        }}
                      >
                        {t.mensagem}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
