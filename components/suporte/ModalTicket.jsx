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
    <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99, backgroundColor: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
}

const ICONES = {
  cartao: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>,
  calendario: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  grafico: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 20V10M18 20V4M6 20v-4" /></svg>,
  documento: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6" /></svg>,
  usuario: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="5" /><path d="M5 21a7 7 0 0114 0" /></svg>,
  interrogacao: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 17h.01" /></svg>,
};

export default function ModalTicket({ aberto, onFechar }) {
  const { perfil } = useDashboard();
  const { mostrarToast } = useToast();

  // Telas: faq | categoria | chamado | historico
  const [tela, setTela] = useState("faq");
  const [faqData, setFaqData] = useState(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [perguntaAberta, setPerguntaAberta] = useState(null);

  // Chamado
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [prioridade, setPrioridade] = useState("normal");
  const [enviando, setEnviando] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Carregar FAQ
  useEffect(() => {
    if (aberto && !faqData) {
      fetch("/suporte-faq.json")
        .then((r) => r.json())
        .then((d) => setFaqData(d))
        .catch(() => {});
    }
  }, [aberto]);

  // Carregar tickets
  useEffect(() => {
    if (aberto && perfil?.id) carregarTickets();
  }, [aberto, perfil?.id]);

  // Reset ao fechar
  useEffect(() => {
    if (!aberto) {
      setTela("faq");
      setCategoriaAtiva(null);
      setPerguntaAberta(null);
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
      const { data } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", perfil.id)
        .order("created_at", { ascending: false });
      setTickets(data || []);
    } catch {}
    setCarregando(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!assunto.trim() || !mensagem.trim() || !perfil?.id) return;
    setEnviando(true);
    try {
      const supabase = createClient();
      await supabase.from("tickets").insert({
        user_id: perfil.id,
        assunto: assunto.trim(),
        mensagem: mensagem.trim(),
        prioridade,
        status: "aberto",
      });
      mostrarToast("Chamado enviado com sucesso!");
      setAssunto("");
      setMensagem("");
      setPrioridade("normal");
      setTela("historico");
      carregarTickets();
    } catch {
      mostrarToast("Erro ao enviar chamado.", "error");
    }
    setEnviando(false);
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
  };

  const ticketsAbertos = tickets.filter((t) => t.status !== "resolvido").length;

  function renderConteudo() {
    // FAQ - categorias
    if (tela === "faq") {
      return (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#FFFFFF", marginBottom: 4 }}>Como podemos ajudar?</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Selecione um tema ou abra um chamado direto.</p>

          <div className="flex flex-col gap-2">
            {faqData?.categorias?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategoriaAtiva(cat); setTela("categoria"); setPerguntaAberta(null); }}
                className="flex items-center gap-3 cursor-pointer"
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  textAlign: "left",
                  width: "100%",
                  color: "#FAF8F5",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(212,80,10,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4500A", flexShrink: 0 }}>
                  {ICONES[cat.icone] || ICONES.interrogacao}
                </div>
                <span>{cat.titulo}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" style={{ marginLeft: "auto" }}>
                  <path d="M5 3l4 4-4 4" />
                </svg>
              </button>
            ))}
          </div>

          {/* Botoes rapidos */}
          <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)", margin: "20px 0" }} />

          <div className="flex gap-2">
            <button
              onClick={() => setTela("chamado")}
              className="flex-1 cursor-pointer"
              style={{ padding: "10px", borderRadius: 10, backgroundColor: "#D4500A", color: "#FFFFFF", fontWeight: 600, fontSize: 13, border: "none" }}
            >
              Abrir chamado
            </button>
            <button
              onClick={() => { setTela("historico"); carregarTickets(); }}
              className="flex-1 cursor-pointer"
              style={{ padding: "10px", borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: 13, border: "none" }}
            >
              Meus chamados {ticketsAbertos > 0 && `(${ticketsAbertos})`}
            </button>
          </div>
        </>
      );
    }

    // Categoria selecionada - perguntas
    if (tela === "categoria" && categoriaAtiva) {
      return (
        <>
          <button
            onClick={() => setTela("faq")}
            className="flex items-center gap-2 cursor-pointer"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, padding: 0, marginBottom: 16 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 11l-4-4 4-4" /></svg>
            Voltar
          </button>

          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#FFFFFF", marginBottom: 20 }}>{categoriaAtiva.titulo}</h2>

          <div className="flex flex-col gap-2">
            {categoriaAtiva.perguntas.map((p, i) => (
              <div key={i}>
                <button
                  onClick={() => setPerguntaAberta(perguntaAberta === i ? null : i)}
                  className="flex items-center justify-between cursor-pointer w-full"
                  style={{
                    padding: "12px 14px",
                    borderRadius: perguntaAberta === i ? "12px 12px 0 0" : 12,
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderBottom: perguntaAberta === i ? "none" : undefined,
                    textAlign: "left",
                    color: "#FAF8F5",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <span>{p.pergunta}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, transform: perguntaAberta === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }}>
                    <path d="M2 4l4 4 4-4" />
                  </svg>
                </button>
                {perguntaAberta === i && (
                  <div style={{
                    padding: "14px",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderTop: "none",
                    borderRadius: "0 0 12px 12px",
                  }}>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>{p.resposta}</p>
                    <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Resolveu sua duvida?</span>
                      <button
                        onClick={() => { mostrarToast("Que bom!"); setPerguntaAberta(null); }}
                        className="cursor-pointer"
                        style={{ background: "none", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#4ADE80", fontWeight: 500 }}
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => { setAssunto(p.pergunta); setTela("chamado"); }}
                        className="cursor-pointer"
                        style={{ background: "none", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#E24B4A", fontWeight: 500 }}
                      >
                        Nao, abrir chamado
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      );
    }

    // Formulario de chamado
    if (tela === "chamado") {
      return (
        <>
          <button
            onClick={() => setTela("faq")}
            className="flex items-center gap-2 cursor-pointer"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, padding: 0, marginBottom: 16 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 11l-4-4 4-4" /></svg>
            Voltar
          </button>

          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#FFFFFF", marginBottom: 20 }}>Abrir chamado</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Assunto</label>
              <input type="text" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Ex: Problema ao gerar boleto" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Mensagem</label>
              <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Descreva o que aconteceu..." required rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Prioridade</label>
              <div className="flex gap-2">
                {[
                  { val: "normal", label: "Normal" },
                  { val: "urgente", label: "Urgente" },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setPrioridade(p.val)}
                    className="cursor-pointer"
                    style={{
                      padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                      border: prioridade === p.val && p.val === "urgente" ? "1px solid rgba(226,75,74,0.3)" : "1px solid rgba(255,255,255,0.1)",
                      backgroundColor: prioridade === p.val ? (p.val === "urgente" ? "rgba(226,75,74,0.15)" : "rgba(255,255,255,0.08)") : "transparent",
                      color: prioridade === p.val ? (p.val === "urgente" ? "#E24B4A" : "#FFFFFF") : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={enviando || !assunto.trim() || !mensagem.trim()}
              className="cursor-pointer"
              style={{
                width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
                backgroundColor: "#D4500A", color: "#FFFFFF", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                opacity: enviando || !assunto.trim() || !mensagem.trim() ? 0.5 : 1,
              }}
            >
              {enviando ? "Enviando..." : "Enviar chamado"}
            </button>
          </form>
        </>
      );
    }

    // Historico
    if (tela === "historico") {
      return (
        <>
          <button
            onClick={() => setTela("faq")}
            className="flex items-center gap-2 cursor-pointer"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, padding: 0, marginBottom: 16 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 11l-4-4 4-4" /></svg>
            Voltar
          </button>

          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#FFFFFF", marginBottom: 20 }}>Seus chamados</h2>

          {carregando ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (<div key={i} style={{ height: 52, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)" }} />))}
            </div>
          ) : tickets.length === 0 ? (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "16px 0" }}>
              Nenhum chamado aberto ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#FFFFFF", lineHeight: 1.3 }}>{ticket.assunto}</span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, display: "block" }}>{tempoRelativo(ticket.created_at)}</span>
                  {ticket.resposta_admin && (
                    <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 8, backgroundColor: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.1)" }}>
                      <div className="flex items-center gap-1.5" style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, backgroundColor: "rgba(74,222,128,0.15)", color: "#4ADE80", textTransform: "uppercase", letterSpacing: "0.05em" }}>Respondido</span>
                        {ticket.respondido_em && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{tempoRelativo(ticket.respondido_em)}</span>}
                      </div>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>{ticket.resposta_admin}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    return null;
  }

  const modal = (
    <>
      <div onClick={onFechar} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 999 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "calc(100% - 32px)", maxWidth: 460, maxHeight: "85vh", overflowY: "auto", backgroundColor: "#141414", borderRadius: 20, zIndex: 1000, padding: "28px 24px" }}>
        <button onClick={onFechar} className="cursor-pointer" style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "rgba(255,255,255,0.4)", padding: 4 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
        </button>
        {renderConteudo()}
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
