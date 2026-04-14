"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import { useToast } from "@/lib/toast-context";

const ASSUNTOS_CHAMADO = [
  "Problema com pagamento",
  "DAS nao aparece corretamente",
  "Erro ao emitir nota fiscal",
  "Problema no login ou cadastro",
  "Duvida sobre o plano Pro",
  "Outro assunto",
];

export default function BotaoSuporte() {
  const dashCtx = useDashboard();
  const toastCtx = useToast();
  const perfil = dashCtx?.perfil;
  const mostrarToast = toastCtx?.mostrarToast || (() => {});

  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [faqData, setFaqData] = useState(null);
  const [fase, setFase] = useState("inicio");
  const [assuntoSelecionado, setAssuntoSelecionado] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensagens]);
  useEffect(() => { if (aberto && !faqData) fetch("/suporte-faq.json").then((r) => r.json()).then(setFaqData).catch(() => {}); }, [aberto]);
  useEffect(() => { if (aberto && mensagens.length === 0) { setMensagens([{ tipo: "bot", texto: "Ola! Sou o assistente do Guiado. Como posso ajudar?" }]); setFase("inicio"); } }, [aberto]);
  useEffect(() => { if (!aberto) { setMensagens([]); setFase("inicio"); setAssuntoSelecionado(""); } }, [aberto]);

  function addBot(texto) { setMensagens((p) => [...p, { tipo: "bot", texto }]); }
  function addUser(texto) { setMensagens((p) => [...p, { tipo: "user", texto }]); }
  function addOpcoes(opcoes) { setMensagens((p) => [...p, { tipo: "opcoes", opcoes }]); }

  function handleInicio(opcao) {
    if (opcao === "duvidas") {
      addUser("Tenho uma duvida");
      setTimeout(() => { addBot("Qual o tema?"); setFase("categoria"); }, 400);
    } else if (opcao === "chamado") {
      addUser("Preciso de ajuda");
      setTimeout(() => { addBot("Vou te direcionar pra abrir um chamado."); }, 400);
      setTimeout(() => { window.location.href = "/dashboard/conta?aba=suporte"; setAberto(false); }, 1200);
    } else if (opcao === "chamados") {
      addUser("Meus chamados");
      carregarChamados();
    }
  }

  function handleCategoria(cat) {
    addUser(cat.titulo);
    setTimeout(() => {
      addBot("Encontrei essas duvidas:");
      setMensagens((p) => [...p, { tipo: "opcoes_faq", perguntas: cat.perguntas }]);
      setFase("faq_perguntas");
    }, 400);
  }

  function handlePerguntaFaq(pergunta) {
    addUser(pergunta.pergunta);
    setTimeout(() => {
      addBot(pergunta.resposta);
      setMensagens((p) => [...p, { tipo: "opcoes_resolucao", pergunta: pergunta.pergunta }]);
    }, 500);
  }

  function handleResolucao(resolveu, pergunta) {
    if (resolveu) {
      addUser("Resolveu!");
      setTimeout(() => { addBot("Que bom! Algo mais?"); setFase("inicio"); }, 400);
    } else {
      addUser("Nao resolveu");
      setTimeout(() => { addBot("Sem problema. Vou te direcionar pra abrir um chamado com nossa equipe."); }, 400);
      setTimeout(() => { window.location.href = "/dashboard/conta?aba=suporte"; setAberto(false); }, 1500);
    }
  }


  async function carregarChamados() {
    if (!perfil?.id) { setTimeout(() => addBot("Voce precisa estar logado."), 400); setTimeout(() => setFase("inicio"), 600); return; }
    try {
      const supabase = createClient();
      const { data } = await supabase.from("tickets").select("*").eq("user_id", perfil.id).order("created_at", { ascending: false }).limit(5);
      if (!data || data.length === 0) setTimeout(() => { addBot("Nenhum chamado aberto."); setFase("inicio"); }, 400);
      else setTimeout(() => { setMensagens((p) => [...p, { tipo: "lista_chamados", chamados: data }]); setFase("inicio"); }, 400);
    } catch { setTimeout(() => { addBot("Erro ao carregar."); setFase("inicio"); }, 400); }
  }

  const sc = { aberto: "#E24B4A", em_andamento: "#F59E0B", resolvido: "#4ADE80" };

  return (
    <>
      <button onClick={() => setAberto(!aberto)} className="cursor-pointer" style={{ position: "fixed", bottom: 24, right: 24, width: 52, height: 52, borderRadius: 16, backgroundColor: aberto ? "#2A1F14" : "#D4500A", border: "none", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: aberto ? "0 2px 10px rgba(0,0,0,0.2)" : "0 4px 20px rgba(212,80,10,0.35)", zIndex: 998, transition: "all 0.2s" }}>
        {aberto ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l10 10M15 5l-10 10" /></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>}
      </button>

      {aberto && (
        <div style={{ position: "fixed", bottom: 88, right: 24, width: 340, height: 460, maxHeight: "70vh", backgroundColor: "#141414", borderRadius: 20, overflow: "hidden", zIndex: 997, boxShadow: "0 12px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", animation: "fadeIn 0.2s ease-out" }}>
          {/* Header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <div className="flex items-center gap-2">
              <img src="/logo-v1-dark.svg" alt="" style={{ width: 22, height: 22, borderRadius: 5 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#FAF8F5", lineHeight: 1 }}>Guiado</p>
                <p style={{ fontSize: 9, color: "rgba(74,222,128,0.7)", marginTop: 1 }}>Online</p>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 6px" }}>
            {mensagens.map((msg, i) => {
              if (msg.tipo === "bot") return (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 10, maxWidth: "85%" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: "rgba(212,80,10,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#D4500A" }} />
                  </div>
                  <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "10px 10px 10px 3px", padding: "8px 12px" }}>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{msg.texto}</p>
                  </div>
                </div>
              );
              if (msg.tipo === "user") return (
                <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                  <div style={{ backgroundColor: "#D4500A", borderRadius: "10px 10px 3px 10px", padding: "8px 12px", maxWidth: "80%" }}>
                    <p style={{ fontSize: 12, color: "#FFF", lineHeight: 1.5 }}>{msg.texto}</p>
                  </div>
                </div>
              );
              if (msg.tipo === "opcoes_faq") return (
                <div key={i} className="flex flex-wrap gap-1" style={{ marginBottom: 10, maxWidth: "90%" }}>
                  {msg.perguntas.map((p, j) => (
                    <button key={j} onClick={() => handlePerguntaFaq(p)} className="cursor-pointer" style={{ padding: "5px 10px", borderRadius: 99, fontSize: 10, backgroundColor: "rgba(212,80,10,0.06)", color: "#D4500A", border: "1px solid rgba(212,80,10,0.1)", textAlign: "left", lineHeight: 1.3 }}>{p.pergunta}</button>
                  ))}
                </div>
              );
              if (msg.tipo === "opcoes_resolucao") return (
                <div key={i} className="flex items-center gap-1.5" style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Resolveu?</span>
                  <button onClick={() => handleResolucao(true, msg.pergunta)} className="cursor-pointer" style={{ padding: "4px 10px", borderRadius: 99, fontSize: 10, backgroundColor: "rgba(74,222,128,0.06)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.1)" }}>Sim</button>
                  <button onClick={() => handleResolucao(false, msg.pergunta)} className="cursor-pointer" style={{ padding: "4px 10px", borderRadius: 99, fontSize: 10, backgroundColor: "rgba(226,75,74,0.06)", color: "#E24B4A", border: "1px solid rgba(226,75,74,0.1)" }}>Nao</button>
                </div>
              );
              if (msg.tipo === "lista_chamados") return (
                <div key={i} style={{ marginBottom: 10 }}>
                  {msg.chamados.map((c) => (
                    <div key={c.id} style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "6px 10px", marginBottom: 3, borderLeft: `2px solid ${sc[c.status] || "#C8C2B8"}` }}>
                      <p style={{ fontSize: 11, fontWeight: 500, color: "#FAF8F5" }}>{c.assunto}</p>
                      {c.resposta_admin && <p style={{ fontSize: 10, color: "rgba(74,222,128,0.6)", marginTop: 2 }}>{c.resposta_admin}</p>}
                    </div>
                  ))}
                </div>
              );
              return null;
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Opcoes - sempre pills, nunca input */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 12px", flexShrink: 0 }}>
            {fase === "inicio" && (
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => handleInicio("duvidas")} className="cursor-pointer" style={{ padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 500, backgroundColor: "rgba(212,80,10,0.08)", color: "#D4500A", border: "1px solid rgba(212,80,10,0.12)" }}>Tenho uma duvida</button>
                <button onClick={() => handleInicio("chamado")} className="cursor-pointer" style={{ padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 500, backgroundColor: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>Preciso de ajuda</button>
                <button onClick={() => handleInicio("chamados")} className="cursor-pointer" style={{ padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 500, backgroundColor: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>Meus chamados</button>
              </div>
            )}
            {fase === "categoria" && faqData && (
              <div className="flex flex-wrap gap-1.5">
                {faqData.categorias.map((cat) => (
                  <button key={cat.id} onClick={() => handleCategoria(cat)} className="cursor-pointer" style={{ padding: "5px 10px", borderRadius: 99, fontSize: 10, fontWeight: 500, backgroundColor: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>{cat.titulo}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
