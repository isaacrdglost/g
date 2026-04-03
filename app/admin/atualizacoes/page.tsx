"use client";

import { useEffect, useState } from "react";

const SEGMENTO_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "free", label: "Apenas Free" },
  { value: "pro", label: "Apenas Pro" },
];

const SEGMENTO_COLORS: Record<string, string> = {
  todos: "#3B82F6",
  free: "#C8C2B8",
  pro: "#D4500A",
};

interface Atualizacao {
  id: string;
  titulo: string;
  conteudo: string;
  segmento: string;
  publicado: boolean;
  created_at: string;
}

export default function AdminAtualizacoes() {
  const [atualizacoes, setAtualizacoes] = useState<Atualizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Form state
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [segmento, setSegmento] = useState("todos");
  const [publicarAgora, setPublicarAgora] = useState(true);

  useEffect(() => {
    fetchAtualizacoes();
  }, []);

  async function fetchAtualizacoes() {
    setLoading(true);
    const res = await fetch("/api/admin?action=atualizacoes");
    const data = await res.json();
    setAtualizacoes(data.atualizacoes || []);
    setLoading(false);
  }

  async function handlePublicar() {
    if (!titulo.trim() || !conteudo.trim()) {
      showToast("Preencha titulo e conteudo", "error");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "atualizacao_create",
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          segmento,
          publicado: publicarAgora,
        }),
      });
      const data = await res.json();

      if (data.error) {
        showToast("Erro ao publicar atualizacao", "error");
      } else {
        showToast(publicarAgora ? "Atualizacao publicada" : "Rascunho salvo", "success");
        setTitulo("");
        setConteudo("");
        setSegmento("todos");
        fetchAtualizacoes();
      }
    } catch {
      showToast("Erro ao publicar atualizacao", "error");
    }

    setSaving(false);
  }

  async function handleDespublicar(id: string) {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "atualizacao_toggle",
          id,
          publicado: false,
        }),
      });
      const data = await res.json();

      if (data.error) {
        showToast("Erro ao despublicar", "error");
      } else {
        showToast("Atualizacao despublicada", "success");
        fetchAtualizacoes();
      }
    } catch {
      showToast("Erro ao despublicar", "error");
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

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F0F", padding: "32px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#FAF8F5", marginBottom: 4 }}>
            Atualizacoes
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
            Crie e gerencie atualizacoes para os usuarios
          </p>
        </div>

        {/* Create form */}
        <div
          style={{
            background: "#1A1A1A",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: "24px",
            marginBottom: 32,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#FAF8F5" }}>
            Nova atualizacao
          </h3>

          {/* Titulo */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Titulo
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Titulo da atualizacao"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#FAF8F5",
              }}
            />
          </div>

          {/* Conteudo */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Conteudo
            </label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Descreva a atualizacao..."
              rows={6}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                fontSize: 14,
                lineHeight: 1.6,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#FAF8F5",
                resize: "vertical",
              }}
            />
          </div>

          {/* Segmento */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
              Segmento
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {SEGMENTO_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSegmento(opt.value)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    border: "1px solid",
                    borderColor: segmento === opt.value ? "#D4500A" : "rgba(255,255,255,0.08)",
                    background: segmento === opt.value ? "rgba(212,80,10,0.15)" : "rgba(255,255,255,0.04)",
                    color: segmento === opt.value ? "#D4500A" : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle publicar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setPublicarAgora(!publicarAgora)}
              style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                background: publicarAgora ? "#D4500A" : "rgba(255,255,255,0.1)",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: publicarAgora ? 20 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#FAF8F5",
                  transition: "left 0.2s",
                }}
              />
            </button>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              {publicarAgora ? "Publicar agora" : "Salvar rascunho"}
            </span>
          </div>

          {/* Button */}
          <button
            onClick={handlePublicar}
            disabled={saving}
            style={{
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
            {saving ? "Salvando..." : publicarAgora ? "Publicar" : "Salvar rascunho"}
          </button>
        </div>

        {/* List */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#FAF8F5", marginBottom: 16 }}>
            Historico de atualizacoes
          </h3>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.3)" }}>
              Carregando...
            </div>
          ) : atualizacoes.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.3)" }}>
              Nenhuma atualizacao criada
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {atualizacoes.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "#1A1A1A",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#FAF8F5", marginBottom: 4 }}>
                      {item.titulo}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                      {formatDate(item.created_at)}
                    </div>
                  </div>

                  {/* Segmento badge */}
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 500,
                      background: `${SEGMENTO_COLORS[item.segmento] || "#3B82F6"}20`,
                      color: SEGMENTO_COLORS[item.segmento] || "#3B82F6",
                      textTransform: "capitalize",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.segmento === "todos" ? "Todos" : item.segmento === "free" ? "Free" : "Pro"}
                  </span>

                  {/* Status publicado */}
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "3px 10px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 500,
                      background: item.publicado ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.06)",
                      color: item.publicado ? "#4ADE80" : "rgba(255,255,255,0.3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: item.publicado ? "#4ADE80" : "rgba(255,255,255,0.2)",
                      }}
                    />
                    {item.publicado ? "Publicado" : "Rascunho"}
                  </span>

                  {/* Despublicar */}
                  {item.publicado && (
                    <button
                      onClick={() => handleDespublicar(item.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        background: "rgba(226,75,74,0.1)",
                        color: "#E24B4A",
                        border: "1px solid rgba(226,75,74,0.2)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s",
                      }}
                    >
                      Despublicar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
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
