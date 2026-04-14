"use client";

import { useState, useEffect, useRef } from "react";
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
  return `ha ${diffD} dias`;
}

export default function BotaoSuporte() {
  const { perfil } = useDashboard();
  const { mostrarToast } = useToast();

  const [aberto, setAberto] = useState(false);
  const [tela, setTela] = useState("inicio"); // inicio | faq | chamado | historico
  const [faqData, setFaqData] = useState(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [perguntaAberta, setPerguntaAberta] = useState(null);

  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [prioridade, setPrioridade] = useState("normal");
  const [enviando, setEnviando] = useState(false);
  const [tickets, setTickets] = useState([]);

  const chatRef = useRef(null);

  // Carregar FAQ
  useEffect(() => {
    if (aberto && !faqData) {
      fetch("/suporte-faq.json").then((r) => r.json()).then(setFaqData).catch(() => {});
    }
  }, [aberto]);

  // Carregar tickets
  useEffect(() => {
    if (aberto && perfil?.id) carregarTickets();
  }, [aberto, perfil?.id]);

  // Reset ao fechar
  useEffect(() => {
    if (!aberto) {
      setTela("inicio");
      setCategoriaAtiva(null);
      setPerguntaAberta(null);
      setAssunto("");
      setMensagem("");
    }
  }, [aberto]);

  async function carregarTickets() {
    if (!perfil?.id) return;
    try {
      const supabase = createClient();
      const { data } = await supabase.from("tickets").select("*").eq("user_id", perfil.id).order("created_at", { ascending: false });
      setTickets(data || []);
    } catch {}
  }

  async function handleEnviar(e) {
    e.preventDefault();
    if (!assunto.trim() || !mensagem.trim() || !perfil?.id) return;
    setEnviando(true);
    try {
      const supabase = createClient();
      await supabase.from("tickets").insert({ user_id: perfil.id, assunto: assunto.trim(), mensagem: mensagem.trim(), prioridade, status: "aberto" });
      mostrarToast("Chamado enviado!");
      setAssunto("");
      setMensagem("");
      setTela("historico");
      carregarTickets();
    } catch {
      mostrarToast("Erro ao enviar", "error");
    }
    setEnviando(false);
  }

  const ICONES = {
    cartao: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>,
    calendario: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
    grafico: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20V10M18 20V4M6 20v-4" /></svg>,
    documento: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /></svg>,
    usuario: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="5" /><path d="M5 21a7 7 0 0114 0" /></svg>,
    interrogacao: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 17h.01" /></svg>,
  };

  const ticketsAbertos = tickets.filter((t) => t.status !== "resolvido").length;

  return (
    <>
      {/* Botao flutuante */}
      <button
        onClick={() => setAberto(!aberto)}
        className="cursor-pointer"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: aberto ? "#2A1F14" : "#D4500A",
          border: "none",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: aberto ? "0 2px 10px rgba(0,0,0,0.2)" : "0 4px 20px rgba(212,80,10,0.35)",
          zIndex: 998,
          transition: "all 0.2s ease",
        }}
      >
        {aberto ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 5l10 10M15 5l-10 10" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
        {!aberto && ticketsAbertos > 0 && (
          <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", backgroundColor: "#E24B4A", fontSize: 10, fontWeight: 700, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {ticketsAbertos}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {aberto && (
        <div
          ref={chatRef}
          style={{
            position: "fixed",
            bottom: 88,
            right: 24,
            width: 380,
            maxHeight: "70vh",
            backgroundColor: "#141414",
            borderRadius: 20,
            overflow: "hidden",
            zIndex: 997,
            boxShadow: "0 12px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {/* Header */}
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <div className="flex items-center gap-3">
              <img src="/logo-v1-dark.svg" alt="" style={{ width: 28, height: 28, borderRadius: 7 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#FAF8F5" }}>Guiado</p>
                <p style={{ fontSize: 11, color: "rgba(74,222,128,0.7)" }}>Online</p>
              </div>
            </div>
          </div>

          {/* Conteudo scrollavel */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 12px" }}>
            {tela === "inicio" && (
              <>
                {/* Mensagem de boas vindas */}
                <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "14px 14px 14px 4px", padding: "12px 16px", marginBottom: 16, maxWidth: "85%" }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                    Ola! Como posso te ajudar? Escolha uma opcao abaixo ou abra um chamado direto.
                  </p>
                </div>

                {/* Opcoes como botoes de chat */}
                <div className="flex flex-wrap gap-2" style={{ marginBottom: 16 }}>
                  <button onClick={() => { setTela("faq"); }} className="cursor-pointer" style={{ padding: "8px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500, backgroundColor: "rgba(212,80,10,0.1)", color: "#D4500A", border: "1px solid rgba(212,80,10,0.15)" }}>
                    Duvidas frequentes
                  </button>
                  <button onClick={() => setTela("chamado")} className="cursor-pointer" style={{ padding: "8px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500, backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    Abrir chamado
                  </button>
                  <button onClick={() => { setTela("historico"); carregarTickets(); }} className="cursor-pointer" style={{ padding: "8px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500, backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    Meus chamados {ticketsAbertos > 0 && `(${ticketsAbertos})`}
                  </button>
                </div>

                {/* Categorias do FAQ como cards compactos */}
                {faqData?.categorias?.slice(0, 4).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategoriaAtiva(cat); setTela("faq"); }}
                    className="flex items-center gap-2.5 w-full cursor-pointer"
                    style={{ padding: "10px 12px", borderRadius: 10, backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)", marginBottom: 6, textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}
                  >
                    <span style={{ color: "#D4500A", flexShrink: 0 }}>{ICONES[cat.icone] || ICONES.interrogacao}</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{cat.titulo}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" style={{ marginLeft: "auto" }}><path d="M4 2l4 4-4 4" /></svg>
                  </button>
                ))}
              </>
            )}

            {tela === "faq" && categoriaAtiva && (
              <>
                <button onClick={() => { setCategoriaAtiva(null); setTela("inicio"); }} className="flex items-center gap-1.5 cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, padding: 0, marginBottom: 12 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 10l-4-4 4-4" /></svg>
                  Voltar
                </button>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#FAF8F5", marginBottom: 14 }}>{categoriaAtiva.titulo}</p>

                {categoriaAtiva.perguntas.map((p, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <button onClick={() => setPerguntaAberta(perguntaAberta === i ? null : i)} className="flex items-center justify-between w-full cursor-pointer" style={{ padding: "10px 12px", borderRadius: perguntaAberta === i ? "10px 10px 0 0" : 10, backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderBottom: perguntaAberta === i ? "none" : undefined, textAlign: "left", color: "#FAF8F5", fontSize: 13 }}>
                      <span>{p.pergunta}</span>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, transform: perguntaAberta === i ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}><path d="M2 3.5l3 3 3-3" /></svg>
                    </button>
                    {perguntaAberta === i && (
                      <div style={{ padding: "12px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", borderRadius: "0 0 10px 10px" }}>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{p.resposta}</p>
                        <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Resolveu?</span>
                          <button onClick={() => { mostrarToast("Que bom!"); setPerguntaAberta(null); }} className="cursor-pointer" style={{ background: "none", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 6, padding: "2px 8px", fontSize: 10, color: "#4ADE80" }}>Sim</button>
                          <button onClick={() => { setAssunto(p.pergunta); setTela("chamado"); }} className="cursor-pointer" style={{ background: "none", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 6, padding: "2px 8px", fontSize: 10, color: "#E24B4A" }}>Nao</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {tela === "faq" && !categoriaAtiva && (
              <>
                <button onClick={() => setTela("inicio")} className="flex items-center gap-1.5 cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, padding: 0, marginBottom: 12 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 10l-4-4 4-4" /></svg>
                  Voltar
                </button>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#FAF8F5", marginBottom: 14 }}>Duvidas frequentes</p>
                {faqData?.categorias?.map((cat) => (
                  <button key={cat.id} onClick={() => setCategoriaAtiva(cat)} className="flex items-center gap-2.5 w-full cursor-pointer" style={{ padding: "10px 12px", borderRadius: 10, backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)", marginBottom: 6, textAlign: "left" }}>
                    <span style={{ color: "#D4500A", flexShrink: 0 }}>{ICONES[cat.icone] || ICONES.interrogacao}</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{cat.titulo}</span>
                  </button>
                ))}
              </>
            )}

            {tela === "chamado" && (
              <>
                <button onClick={() => setTela("inicio")} className="flex items-center gap-1.5 cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, padding: 0, marginBottom: 12 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 10l-4-4 4-4" /></svg>
                  Voltar
                </button>

                <form onSubmit={handleEnviar}>
                  <input type="text" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Assunto" required style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)", color: "#FFF", fontSize: 13, outline: "none", marginBottom: 8, fontFamily: "inherit" }} />
                  <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Descreva o problema..." required rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)", color: "#FFF", fontSize: 13, outline: "none", resize: "vertical", marginBottom: 8, fontFamily: "inherit" }} />
                  <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                    {["normal", "urgente"].map((p) => (
                      <button key={p} type="button" onClick={() => setPrioridade(p)} className="cursor-pointer" style={{ padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 500, border: "none", backgroundColor: prioridade === p ? (p === "urgente" ? "rgba(226,75,74,0.12)" : "rgba(212,80,10,0.1)") : "rgba(255,255,255,0.04)", color: prioridade === p ? (p === "urgente" ? "#E24B4A" : "#D4500A") : "rgba(255,255,255,0.3)", textTransform: "capitalize" }}>{p}</button>
                    ))}
                  </div>
                  <button type="submit" disabled={enviando} className="cursor-pointer" style={{ width: "100%", padding: "10px", borderRadius: 10, backgroundColor: "#D4500A", color: "#FFF", fontWeight: 600, fontSize: 13, border: "none", opacity: enviando ? 0.5 : 1 }}>
                    {enviando ? "Enviando..." : "Enviar chamado"}
                  </button>
                </form>
              </>
            )}

            {tela === "historico" && (
              <>
                <button onClick={() => setTela("inicio")} className="flex items-center gap-1.5 cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, padding: 0, marginBottom: 12 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 10l-4-4 4-4" /></svg>
                  Voltar
                </button>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#FAF8F5", marginBottom: 14 }}>Seus chamados</p>

                {tickets.length === 0 ? (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "20px 0" }}>Nenhum chamado ainda</p>
                ) : tickets.map((t) => {
                  const statusCor = { aberto: "#E24B4A", em_andamento: "#F59E0B", resolvido: "#4ADE80" };
                  return (
                    <div key={t.id} style={{ padding: "10px 12px", borderRadius: 10, backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)", marginBottom: 6 }}>
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#FAF8F5" }}>{t.assunto}</span>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: statusCor[t.status] || "#C8C2B8", flexShrink: 0 }} />
                      </div>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2, display: "block" }}>{tempoRelativo(t.created_at)}</span>
                      {t.resposta_admin && (
                        <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, backgroundColor: "rgba(74,222,128,0.05)", borderLeft: "2px solid rgba(74,222,128,0.3)" }}>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{t.resposta_admin}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
