"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Profile {
  id: string;
  nome_fantasia: string;
  email?: string;
  cnpj?: string;
  plano: string;
  onboarding_completo?: boolean;
  created_at: string;
}

const PAGE_SIZE = 20;

function formatDate(d: string) {
  const parts = d.split("T")[0].split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function maskCnpj(cnpj: string | null | undefined) {
  if (!cnpj) return "-";
  const n = cnpj.replace(/\D/g, "");
  if (n.length < 4) return n;
  return `${n.slice(0, 2)}.${"*".repeat(3)}.${"*".repeat(3)}/${"*".repeat(4)}-${n.slice(-2)}`;
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

function onboardingBadge(done: boolean) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 99,
        background: done ? "rgba(74,222,128,0.15)" : "rgba(245,158,11,0.15)",
        color: done ? "#4ADE80" : "#F59E0B",
      }}
    >
      {done ? "Completo" : "Pendente"}
    </span>
  );
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [busca, setBusca] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" });

    if (filtroPlano !== "todos") {
      if (filtroPlano === "pro") {
        query = query.in("plano", ["pro", "anual"]);
      } else {
        query = query.eq("plano", filtroPlano);
      }
    }

    if (busca) {
      query = query.or(
        `email.ilike.%${busca}%,nome_fantasia.ilike.%${busca}%`
      );
    }

    if (filtroPeriodo !== "todos") {
      const now = new Date();
      let since: Date;
      if (filtroPeriodo === "hoje") {
        since = new Date(now.toISOString().split("T")[0]);
      } else if (filtroPeriodo === "7d") {
        since = new Date();
        since.setDate(since.getDate() - 7);
      } else {
        since = new Date();
        since.setDate(since.getDate() - 30);
      }
      query = query.gte("created_at", since.toISOString());
    }

    const { data, count } = await query
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      .order("created_at", { ascending: false });

    setUsuarios((data as Profile[]) || []);
    setTotal(count || 0);
    setLoading(false);
  }, [page, busca, filtroPlano, filtroPeriodo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [busca, filtroPlano, filtroPeriodo]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 13,
    color: "#FAF8F5",
    outline: "none",
  };

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    background: active ? "rgba(212,80,10,0.15)" : "rgba(255,255,255,0.04)",
    color: active ? "#D4500A" : "rgba(255,255,255,0.4)",
    transition: "background 0.15s",
  });

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
        Usuarios
      </h2>

      {/* Filters bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ ...inputStyle, width: 280 }}
        />

        <div style={{ display: "flex", gap: 4 }}>
          {[
            { label: "Todos", value: "todos" },
            { label: "Free", value: "free" },
            { label: "Pro", value: "pro" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltroPlano(f.value)}
              style={filterBtnStyle(filtroPlano === f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {[
            { label: "Todos", value: "todos" },
            { label: "Hoje", value: "hoje" },
            { label: "7 dias", value: "7d" },
            { label: "30 dias", value: "30d" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltroPeriodo(f.value)}
              style={filterBtnStyle(filtroPeriodo === f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-dm-mono), monospace",
          }}
        >
          {total} resultado{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#1A1A1A",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {["Nome / Email", "CNPJ", "Plano", "Cadastro", "Onboarding", ""].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
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
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  Carregando...
                </td>
              </tr>
            )}
            {!loading && usuarios.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  Nenhum usuario encontrado
                </td>
              </tr>
            )}
            {!loading &&
              usuarios.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ fontWeight: 500, color: "#FAF8F5" }}>
                      {u.nome_fantasia || "Sem nome"}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.35)",
                        marginTop: 1,
                      }}
                    >
                      {u.email || "-"}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      fontFamily: "var(--font-dm-mono), monospace",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {maskCnpj(u.cnpj)}
                  </td>
                  <td style={{ padding: "10px 16px" }}>{planoBadge(u.plano)}</td>
                  <td
                    style={{
                      padding: "10px 16px",
                      fontFamily: "var(--font-dm-mono), monospace",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    {formatDate(u.created_at)}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    {onboardingBadge(!!u.onboarding_completo)}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <Link
                      href={`/admin/usuarios/${u.id}`}
                      style={{
                        fontSize: 12,
                        color: "#D4500A",
                        textDecoration: "none",
                      }}
                    >
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginTop: 16,
          }}
        >
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            style={{
              padding: "6px 16px",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: page === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)",
              cursor: page === 0 ? "default" : "pointer",
            }}
          >
            Anterior
          </button>
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "var(--font-dm-mono), monospace",
            }}
          >
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            style={{
              padding: "6px 16px",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color:
                page >= totalPages - 1
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(255,255,255,0.5)",
              cursor: page >= totalPages - 1 ? "default" : "pointer",
            }}
          >
            Proximo
          </button>
        </div>
      )}
    </div>
  );
}
