"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";

interface Metrics {
  total: number;
  free: number;
  pro: number;
  hoje: number;
  semana: number;
  ticketsAbertos: number;
}

interface Profile {
  id: string;
  nome_fantasia: string;
  email?: string;
  plano: string;
  created_at: string;
}

interface Ticket {
  id: string;
  assunto: string;
  status: string;
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
  marginBottom: 6,
};

const valueStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  color: "#FAF8F5",
  fontFamily: "var(--font-dm-mono), monospace",
  letterSpacing: "-0.02em",
};

function formatDate(d: string) {
  const parts = d.split("T")[0].split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function planoBadge(plano: string) {
  const isPro = plano === "pro" || plano === "anual";
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
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
    aberto: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B" },
    resolvido: { bg: "rgba(74,222,128,0.15)", text: "#4ADE80" },
    fechado: { bg: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.4)" },
  };
  const c = colors[status] || colors.aberto;
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

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    free: 0,
    pro: 0,
    hoje: 0,
    semana: 0,
    ticketsAbertos: 0,
  });
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createAdminClient();

      // Metrics
      const { count: total } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: free } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .or("plano.eq.free,plano.is.null");

      const { count: pro } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .in("plano", ["pro", "anual"]);

      // Hoje
      const todayStr = new Date().toISOString().split("T")[0];
      const { count: hoje } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStr);

      // Semana
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: semana } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      // Tickets abertos
      let ticketsAbertos = 0;
      try {
        const { count } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true })
          .eq("status", "aberto");
        ticketsAbertos = count || 0;
      } catch {}

      setMetrics({
        total: total || 0,
        free: free || 0,
        pro: pro || 0,
        hoje: hoje || 0,
        semana: semana || 0,
        ticketsAbertos,
      });

      // Usuarios recentes
      const { data: recentUsers } = await supabase
        .from("profiles")
        .select("id, nome_fantasia, plano, created_at, cnpj")
        .order("created_at", { ascending: false })
        .limit(5);

      // Buscar emails via auth admin
      const usersWithEmail = await Promise.all(
        (recentUsers || []).map(async (u: any) => {
          try {
            const { data } = await supabase.auth.admin.getUserById(u.id);
            return { ...u, email: data?.user?.email || "—" };
          } catch {
            return { ...u, email: "—" };
          }
        })
      );
      setUsuarios(usersWithEmail as Profile[]);

      // Tickets recentes
      try {
        const { data: recentTickets } = await supabase
          .from("tickets")
          .select("id, assunto, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5);
        setTickets((recentTickets as Ticket[]) || []);
      } catch {}

      setLoading(false);
    }
    load();
  }, []);

  const mrr = metrics.pro * 39.9;

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, padding: 20 }}>
        Carregando...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <h2
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#FAF8F5",
          marginBottom: 20,
          letterSpacing: "-0.01em",
        }}
      >
        Visao geral
      </h2>

      {/* Metrics grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {/* Total de contas */}
        <div style={cardStyle}>
          <div style={labelStyle}>Total de contas</div>
          <div style={valueStyle}>{metrics.total}</div>
        </div>

        {/* Free / Pro */}
        <div style={cardStyle}>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Plano Free</div>
              <div style={{ ...valueStyle, fontSize: 28 }}>{metrics.free}</div>
            </div>
            <div
              style={{
                width: 1,
                background: "rgba(255,255,255,0.06)",
                margin: "0 0",
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Plano Pro</div>
              <div style={{ ...valueStyle, fontSize: 28 }}>{metrics.pro}</div>
            </div>
          </div>
        </div>

        {/* Novos */}
        <div style={cardStyle}>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Novos hoje</div>
              <div style={{ ...valueStyle, fontSize: 28 }}>{metrics.hoje}</div>
            </div>
            <div
              style={{
                width: 1,
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Essa semana</div>
              <div style={{ ...valueStyle, fontSize: 28 }}>{metrics.semana}</div>
            </div>
          </div>
        </div>

        {/* Tickets abertos */}
        <div style={cardStyle}>
          <div style={labelStyle}>Tickets abertos</div>
          <div style={valueStyle}>{metrics.ticketsAbertos}</div>
        </div>

        {/* MRR */}
        <div style={{ ...cardStyle, gridColumn: "span 2" }}>
          <div style={labelStyle}>MRR estimado</div>
          <div style={valueStyle}>
            {mrr.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.3)",
              marginTop: 4,
            }}
          >
            {metrics.pro} assinante{metrics.pro !== 1 ? "s" : ""} Pro x R$ 39,90
          </div>
        </div>
      </div>

      {/* Two-col bottom */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Usuarios recentes */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span style={labelStyle}>Usuarios recentes</span>
            <Link
              href="/admin/usuarios"
              style={{ fontSize: 12, color: "#D4500A", textDecoration: "none" }}
            >
              Ver todos
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {usuarios.length === 0 && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                Nenhum usuario encontrado
              </div>
            )}
            {usuarios.map((u) => (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#FAF8F5" }}>
                    {u.nome_fantasia || "Sem nome"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                    {u.email || "-"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {planoBadge(u.plano)}
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.25)",
                      fontFamily: "var(--font-dm-mono), monospace",
                    }}
                  >
                    {formatDate(u.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets recentes */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span style={labelStyle}>Tickets recentes</span>
            <Link
              href="/admin/tickets"
              style={{ fontSize: 12, color: "#D4500A", textDecoration: "none" }}
            >
              Ver todos
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tickets.length === 0 && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                Nenhum ticket encontrado
              </div>
            )}
            {tickets.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: "#FAF8F5" }}>
                  {t.assunto}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {statusBadge(t.status)}
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.25)",
                      fontFamily: "var(--font-dm-mono), monospace",
                    }}
                  >
                    {formatDate(t.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
