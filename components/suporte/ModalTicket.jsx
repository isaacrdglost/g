"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import { useToast } from "@/lib/toast-context";

function tempoRelativo(dataStr) {
  const agora = new Date();
  const data = new Date(dataStr);
  const diffMs = agora - data;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `ha ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `ha ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "ha 1 dia";
  if (diffD < 30) return `ha ${diffD} dias`;
  const diffM = Math.floor(diffD / 30);
  if (diffM === 1) return "ha 1 mes";
  return `ha ${diffM} meses`;
}

function StatusBadge({ status }) {
  const cores = {
    aberto: { bg: "rgba(226,75,74,0.15)", text: "#E24B4A", label: "Aberto" },
    em_andamento: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B", label: "Em andamento" },
    resolvido: { bg: "rgba(74,222,128,0.15)", text: "#4ADE80", label: "Resolvido" },
  };
  const c = cores[status] || cores.aberto;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 99,
        backgroundColor: c.bg,
        color: c.text,
      }}
    >
      {c.label}
    </span>
  );
}

export default function ModalTicket({ aberto, onFechar }) {
  const { perfil } = useDashboard();
  const { mostrarToast } = useToast();

  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [prioridade, setPrioridade] = useState("normal");
  const [enviando, setEnviando] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Carregar tickets ao abrir
  useEffect(() => {
    if (aberto && perfil?.id) {
      carregarTickets();
    }
  }, [aberto, perfil?.id]);

  // Reset form ao fechar
  useEffect(() => {
    if (!aberto) {
      setAssunto("");
      setMensagem("");
      setPrioridade("normal");
    }
  }, [aberto]);

  async function carregarTickets() {
    if (!perfil?.id) return;
    setCarregando(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", perfil.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTickets(data || []);
    } catch {
      // silencioso
    } finally {
      setCarregando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!assunto.trim() || !mensagem.trim()) return;
    if (!perfil?.id) return;

    setEnviando(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("tickets").insert({
        user_id: perfil.id,
        assunto: assunto.trim(),
        mensagem: mensagem.trim(),
        prioridade,
        status: "aberto",
      });
      if (error) throw error;
      mostrarToast("Chamado enviado com sucesso!", "sucesso");
      setAssunto("");
      setMensagem("");
      setPrioridade("normal");
      carregarTickets();
    } catch {
      mostrarToast("Erro ao enviar chamado. Tente novamente.", "erro");
    } finally {
      setEnviando(false);
    }
  }

  if (!aberto) return null;

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "#FFFFFF",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s ease",
  };

  const modal = (
    <>
      {/* Overlay */}
      <div
        onClick={onFechar}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 999,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "calc(100% - 32px)",
          maxWidth: 500,
          maxHeight: "85vh",
          overflowY: "auto",
          backgroundColor: "#141414",
          borderRadius: 20,
          zIndex: 1000,
          padding: "28px 24px",
        }}
      >
        {/* Botao fechar */}
        <button
          onClick={onFechar}
          className="cursor-pointer"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            padding: 4,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>

        {/* Secao 1: Formulario */}
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#FFFFFF", margin: 0 }}>
          Abrir chamado
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, marginBottom: 20 }}>
          Descreva seu problema e responderemos em breve.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>
              Assunto
            </label>
            <input
              type="text"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Ex: Problema ao gerar boleto"
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>
              Mensagem
            </label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descreva o que aconteceu..."
              required
              rows={4}
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>
              Prioridade
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPrioridade("normal")}
                className="cursor-pointer"
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  backgroundColor: prioridade === "normal" ? "rgba(255,255,255,0.08)" : "transparent",
                  color: prioridade === "normal" ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                  transition: "all 0.15s ease",
                }}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setPrioridade("urgente")}
                className="cursor-pointer"
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  border: prioridade === "urgente" ? "1px solid rgba(226,75,74,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  backgroundColor: prioridade === "urgente" ? "rgba(226,75,74,0.15)" : "transparent",
                  color: prioridade === "urgente" ? "#E24B4A" : "rgba(255,255,255,0.4)",
                  transition: "all 0.15s ease",
                }}
              >
                Urgente
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando || !assunto.trim() || !mensagem.trim()}
            className="cursor-pointer"
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 12,
              border: "none",
              backgroundColor: "#D4500A",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
              opacity: enviando || !assunto.trim() || !mensagem.trim() ? 0.5 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            {enviando ? "Enviando..." : "Enviar chamado"}
          </button>
        </form>

        {/* Divisor */}
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)", margin: "24px 0" }} />

        {/* Secao 2: Historico */}
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", margin: "0 0 14px" }}>
          Seus chamados
        </h3>

        {carregando ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} style={{ height: 52, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "16px 0" }}>
            Nenhum chamado aberto ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#FFFFFF", lineHeight: 1.3 }}>
                    {ticket.assunto}
                  </span>
                  <StatusBadge status={ticket.status} />
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, display: "block" }}>
                  {tempoRelativo(ticket.created_at)}
                </span>

                {/* Resposta do admin */}
                {ticket.resposta_admin && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "10px 12px",
                      borderRadius: 8,
                      backgroundColor: "rgba(74,222,128,0.06)",
                      border: "1px solid rgba(74,222,128,0.1)",
                    }}
                  >
                    <div className="flex items-center gap-1.5" style={{ marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: 4,
                          backgroundColor: "rgba(74,222,128,0.15)",
                          color: "#4ADE80",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Respondido
                      </span>
                      {ticket.respondido_em && (
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                          {tempoRelativo(ticket.respondido_em)}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>
                      {ticket.resposta_admin}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
