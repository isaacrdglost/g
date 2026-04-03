"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";

const STATUS_OPTIONS = [
  { value: "aberto", label: "Aberto", color: "#E24B4A" },
  { value: "em_andamento", label: "Em andamento", color: "#F59E0B" },
  { value: "resolvido", label: "Resolvido", color: "#4ADE80" },
];

const PRIORIDADE_OPTIONS = [
  { value: "baixa", label: "Baixa", color: "#C8C2B8" },
  { value: "normal", label: "Normal", color: "#3B82F6" },
  { value: "alta", label: "Alta", color: "#F59E0B" },
  { value: "urgente", label: "Urgente", color: "#E24B4A" },
];

const PLANO_COLORS: Record<string, string> = {
  free: "#C8C2B8",
  pro: "#D4500A",
  anual: "#D4500A",
};

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
}

interface UserProfile {
  id: string;
  email?: string;
  nome_fantasia?: string;
  plano?: string;
  cnpj?: string;
}

export default function AdminTicketDetail() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [status, setStatus] = useState("aberto");
  const [prioridade, setPrioridade] = useState("normal");
  const [resposta, setResposta] = useState("");

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  async function fetchTicket() {
    const supabase = createAdminClient();
    setLoading(true);

    const { data: ticketData, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (error || !ticketData) {
      setLoading(false);
      return;
    }

    setTicket(ticketData);
    setStatus(ticketData.status || "aberto");
    setPrioridade(ticketData.prioridade || "normal");
    setResposta(ticketData.resposta_admin || "");

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, nome_fantasia, plano, cnpj")
      .eq("id", ticketData.user_id)
      .single();

    if (profile) {
      setUser(profile);
    }

    setLoading(false);
  }

  async function handleSave() {
    const supabase = createAdminClient();
    setSaving(true);

    const updates: any = {
      status,
      prioridade,
    };

    if (resposta.trim()) {
      updates.resposta_admin = resposta.trim();
      updates.respondido_em = new Date().toISOString();
    }

    const { error } = await supabase
      .from("tickets")
      .update(updates)
      .eq("id", ticketId);

    setSaving(false);

    if (error) {
      showToast("Erro ao salvar resposta", "error");
    } else {
      showToast("Resposta salva com sucesso", "success");
      fetchTicket();
    }
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function formatDate(dateStr: string) {
    const parts = dateStr.split("T")[0].split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function formatDateTime(dateStr: string) {
    const d = new Date(dateStr);
    const parts = dateStr.split("T")[0].split("-");
    const time = dateStr.split("T")[1]?.substring(0, 5) || "";
    return `${parts[2]}/${parts[1]}/${parts[0]} as ${time}`;
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F0F0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>Carregando...</span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F0F0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>Ticket nao encontrado</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F0F", padding: "32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Back */}
        <button
          onClick={() => router.push("/admin/tickets")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: 24,
            padding: 0,
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 8H1M8 15l-7-7 7-7" />
          </svg>
          Voltar para tickets
        </button>

        {/* Split layout */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {/* Left - Ticket info (60%) */}
          <div style={{ flex: "1 1 580px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* User card */}
            <div
              style={{
                background: "#1A1A1A",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#FAF8F5" }}>
                  {user?.nome_fantasia || "Usuario"}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  {user?.email || "Sem email"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 500,
                    background: `${PLANO_COLORS[user?.plano || "free"] || "#C8C2B8"}20`,
                    color: PLANO_COLORS[user?.plano || "free"] || "#C8C2B8",
                    textTransform: "uppercase",
                  }}
                >
                  {user?.plano || "free"}
                </span>
                <button
                  onClick={() => router.push(`/admin/usuarios/${user?.id}`)}
                  style={{
                    fontSize: 12,
                    color: "#D4500A",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Ver perfil
                </button>
              </div>
            </div>

            {/* Ticket content */}
            <div
              style={{
                background: "#1A1A1A",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "24px",
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#FAF8F5", marginBottom: 8 }}>
                {ticket.assunto}
              </h2>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
                Aberto em {formatDateTime(ticket.created_at)}
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.6)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {ticket.mensagem}
              </div>
            </div>

            {/* Previous admin response */}
            {ticket.resposta_admin && (
              <div
                style={{
                  background: "rgba(212,80,10,0.06)",
                  border: "1px solid rgba(212,80,10,0.15)",
                  borderRadius: 12,
                  padding: "20px 24px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <svg width="14" height="14" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#D4500A" }}>Resposta do admin</span>
                  {ticket.respondido_em && (
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>
                      {formatDateTime(ticket.respondido_em)}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", whiteSpace: "pre-wrap" }}>
                  {ticket.resposta_admin}
                </div>
              </div>
            )}
          </div>

          {/* Right - Admin panel (40%) */}
          <div style={{ flex: "0 0 360px", minWidth: 300 }}>
            <div
              style={{
                background: "#1A1A1A",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                position: "sticky",
                top: 32,
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#FAF8F5", marginBottom: -8 }}>
                Painel do admin
              </h3>

              {/* Status */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#FAF8F5",
                    cursor: "pointer",
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prioridade */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                  Prioridade
                </label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#FAF8F5",
                    cursor: "pointer",
                  }}
                >
                  {PRIORIDADE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resposta */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                  Resposta
                </label>
                <textarea
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  placeholder="Escreva a resposta para o usuario..."
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    fontSize: 13,
                    lineHeight: 1.6,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#FAF8F5",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  background: "#D4500A",
                  color: "#FAF8F5",
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                  transition: "all 0.2s",
                }}
              >
                {saving ? "Salvando..." : "Salvar resposta"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            zIndex: 50,
            background: toast.type === "success" ? "#1A1A1A" : "rgba(226,75,74,0.15)",
            color: toast.type === "success" ? "#4ADE80" : "#E24B4A",
            border: `1px solid ${toast.type === "success" ? "rgba(74,222,128,0.2)" : "rgba(226,75,74,0.3)"}`,
            animation: "toastIn 0.3s ease-out",
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
