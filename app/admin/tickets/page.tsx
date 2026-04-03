"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";

const STATUS_COLORS: Record<string, string> = {
  aberto: "#E24B4A",
  em_andamento: "#F59E0B",
  resolvido: "#4ADE80",
};

const STATUS_LABELS: Record<string, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
};

const PRIORIDADE_COLORS: Record<string, string> = {
  baixa: "#C8C2B8",
  normal: "#3B82F6",
  alta: "#F59E0B",
  urgente: "#E24B4A",
};

const PRIORIDADE_LABELS: Record<string, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
};

const FILTROS = ["todos", "aberto", "em_andamento", "resolvido"];
const FILTRO_LABELS: Record<string, string> = {
  todos: "Todos",
  aberto: "Abertos",
  em_andamento: "Em andamento",
  resolvido: "Resolvidos",
};

function tempoRelativo(dataStr: string): string {
  const agora = new Date();
  const data = new Date(dataStr);
  const diffMs = agora.getTime() - data.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `ha ${diffMin} min`;
  if (diffHoras < 24) return `ha ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;
  if (diffDias < 30) return `ha ${diffDias} dia${diffDias > 1 ? "s" : ""}`;
  return `ha ${Math.floor(diffDias / 30)} mes${Math.floor(diffDias / 30) > 1 ? "es" : ""}`;
}

interface Ticket {
  id: string;
  user_id: string;
  assunto: string;
  mensagem: string;
  status: string;
  prioridade: string;
  created_at: string;
  resposta_admin?: string;
  respondido_em?: string;
  user_email?: string;
  user_nome?: string;
}

export default function AdminTickets() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [ordenar, setOrdenar] = useState<"recentes" | "prioridade">("recentes");

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    const supabase = createAdminClient();
    setLoading(true);

    // Fetch tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (ticketsError || !ticketsData) {
      setLoading(false);
      return;
    }

    // Fetch user profiles for each unique user_id
    const userIds = [...new Set(ticketsData.map((t: any) => t.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, nome_fantasia")
      .in("id", userIds);

    const profileMap: Record<string, any> = {};
    if (profiles) {
      profiles.forEach((p: any) => {
        profileMap[p.id] = p;
      });
    }

    const enriched = ticketsData.map((t: any) => ({
      ...t,
      user_email: profileMap[t.user_id]?.email || "Sem email",
      user_nome: profileMap[t.user_id]?.nome_fantasia || "Usuario",
    }));

    setTickets(enriched);
    setLoading(false);
  }

  const filtrados = tickets.filter((t) => {
    if (filtro === "todos") return true;
    return t.status === filtro;
  });

  const ordenados = [...filtrados].sort((a, b) => {
    if (ordenar === "prioridade") {
      const ordem = { urgente: 0, alta: 1, normal: 2, baixa: 3 };
      return (ordem[a.prioridade as keyof typeof ordem] ?? 3) - (ordem[b.prioridade as keyof typeof ordem] ?? 3);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F0F", padding: "32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#FAF8F5", marginBottom: 4 }}>
            Tickets de suporte
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
            Gerencie os tickets enviados pelos usuarios
          </p>
        </div>

        {/* Filtros e ordenacao */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {FILTROS.map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: 500,
                  border: "1px solid",
                  borderColor: filtro === f ? "#D4500A" : "rgba(255,255,255,0.08)",
                  background: filtro === f ? "rgba(212,80,10,0.15)" : "rgba(255,255,255,0.04)",
                  color: filtro === f ? "#D4500A" : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {FILTRO_LABELS[f]}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto" }}>
            <select
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value as "recentes" | "prioridade")}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 13,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
            >
              <option value="recentes">Mais recentes</option>
              <option value="prioridade">Prioridade</option>
            </select>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)" }}>
            Carregando tickets...
          </div>
        ) : ordenados.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)" }}>
            Nenhum ticket encontrado
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ordenados.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                style={{
                  background: "#1A1A1A",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* User info */}
                <div style={{ flex: "0 0 180px", minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#FAF8F5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ticket.user_nome}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ticket.user_email}
                  </div>
                </div>

                {/* Assunto */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ticket.assunto}
                  </div>
                </div>

                {/* Prioridade badge */}
                <div
                  style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 500,
                    background: `${PRIORIDADE_COLORS[ticket.prioridade] || "#3B82F6"}20`,
                    color: PRIORIDADE_COLORS[ticket.prioridade] || "#3B82F6",
                    whiteSpace: "nowrap",
                  }}
                >
                  {PRIORIDADE_LABELS[ticket.prioridade] || ticket.prioridade}
                </div>

                {/* Status badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 500,
                    background: `${STATUS_COLORS[ticket.status] || "#3B82F6"}20`,
                    color: STATUS_COLORS[ticket.status] || "#3B82F6",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: STATUS_COLORS[ticket.status] || "#3B82F6",
                    }}
                  />
                  {STATUS_LABELS[ticket.status] || ticket.status}
                </div>

                {/* Tempo */}
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", flex: "0 0 90px", textAlign: "right" }}>
                  {tempoRelativo(ticket.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
