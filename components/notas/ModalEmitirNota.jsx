"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/lib/toast-context";
import {
  criarRascunho,
  confirmarEmissao,
  uploadPdf,
  criarLancamentoAutomatico,
} from "@/lib/notas-service";

function getCompetenciaAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

function getHojeString() {
  const hoje = new Date();
  return hoje.toISOString().split("T")[0];
}

function formatarMoeda(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ModalEmitirNota({
  aberto,
  onFechar,
  userId,
  onNotaSalva,
  notaExistente,
}) {
  const { mostrarToast } = useToast();

  // Determinar fase inicial baseado em notaExistente
  function faseInicial() {
    if (notaExistente) {
      if (notaExistente.status === "aguardando_confirmacao") return 3;
      if (notaExistente.status === "rascunho") return 2;
    }
    return 1;
  }

  const [fase, setFase] = useState(faseInicial);
  const [salvando, setSalvando] = useState(false);
  const [notaSalva, setNotaSalva] = useState(notaExistente || null);

  // Fase 1 - Formulario
  const [tomadorNome, setTomadorNome] = useState("");
  const [tomadorDocumento, setTomadorDocumento] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorDisplay, setValorDisplay] = useState("");
  const [valorCentavos, setValorCentavos] = useState(0);
  const [competencia, setCompetencia] = useState(getCompetenciaAtual);

  // Fase 3 - Registrar emissao
  const [numeroNota, setNumeroNota] = useState("");
  const [dataEmissao, setDataEmissao] = useState(getHojeString);
  const [arquivo, setArquivo] = useState(null);

  // Reset ao abrir/fechar
  useEffect(() => {
    if (aberto) {
      setFase(faseInicial());
      setNotaSalva(notaExistente || null);
      if (!notaExistente) {
        setTomadorNome("");
        setTomadorDocumento("");
        setDescricao("");
        setValorDisplay("");
        setValorCentavos(0);
        setCompetencia(getCompetenciaAtual());
      }
      setNumeroNota("");
      setDataEmissao(getHojeString());
      setArquivo(null);
      setSalvando(false);
    }
  }, [aberto, notaExistente]);

  function handleValorChange(e) {
    const digits = e.target.value.replace(/\D/g, "");
    const centavos = parseInt(digits || "0", 10);
    setValorCentavos(centavos);
    setValorDisplay(centavos === 0 ? "" : formatarMoeda(centavos));
  }

  function fechar() {
    onFechar();
  }

  // Fase 1 - Salvar rascunho e abrir portal
  async function handleSubmitFase1(e) {
    e.preventDefault();
    if (valorCentavos <= 0 || !tomadorNome.trim() || !descricao.trim()) return;
    setSalvando(true);

    try {
      const [ano, mes] = competencia.split("-");
      const competenciaDate = `${ano}-${mes}-01`;
      const valorReais = valorCentavos / 100;

      const nota = await criarRascunho(userId, {
        tomadorNome: tomadorNome.trim(),
        tomadorDocumento: tomadorDocumento.trim(),
        descricao: descricao.trim(),
        valor: valorReais,
        competencia: competenciaDate,
      });

      setNotaSalva(nota);

      // Copiar dados formatados para a area de transferencia
      const textoClipboard = `Tomador: ${tomadorNome.trim()} | Documento: ${tomadorDocumento.trim() || "-"} | Servico: ${descricao.trim()} | Valor: ${formatarMoeda(valorCentavos)} | Competencia: ${mes}/${ano}`;
      try {
        await navigator.clipboard.writeText(textoClipboard);
      } catch {
        // Clipboard pode falhar em alguns navegadores
      }

      // Abrir portal NFS-e
      window.open("https://nfse.gov.br/EmissorNacional", "_blank");

      if (onNotaSalva) onNotaSalva();
      setFase(2);
    } catch (err) {
      mostrarToast("Erro ao salvar rascunho. Tente novamente.", "error");
    } finally {
      setSalvando(false);
    }
  }

  // Fase 3 - Registrar emissao
  async function handleSubmitFase3(e) {
    e.preventDefault();
    if (!numeroNota.trim() || !notaSalva) return;
    setSalvando(true);

    try {
      const temPdf = !!arquivo;
      const notaAtualizada = await confirmarEmissao(
        notaSalva.id,
        numeroNota.trim(),
        dataEmissao,
        temPdf
      );

      if (arquivo) {
        await uploadPdf(userId, notaSalva.id, arquivo);
      }

      if (notaAtualizada.status === "emitida") {
        await criarLancamentoAutomatico(userId, notaAtualizada);
      }

      mostrarToast("Nota fiscal registrada com sucesso");
      if (onNotaSalva) onNotaSalva();
      fechar();
    } catch (err) {
      mostrarToast("Erro ao registrar emissao. Tente novamente.", "error");
    } finally {
      setSalvando(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      mostrarToast("O arquivo deve ter no maximo 5MB.", "error");
      e.target.value = "";
      return;
    }
    setArquivo(file);
  }

  if (!aberto) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={fechar}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 999,
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          width: "100%",
          maxWidth: 480,
          margin: "0 16px",
          backgroundColor: "#2A1F14",
          borderRadius: 20,
          overflow: "hidden",
          animation: "modalIn 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: "24px 24px 0" }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#FAF8F5",
                letterSpacing: "-0.03em",
              }}
            >
              {fase === 1 && "Emitir nota fiscal"}
              {fase === 2 && "Emitir nota fiscal"}
              {fase === 3 && "Registrar emissao"}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                marginTop: 2,
              }}
            >
              {fase === 1 && "Preencha os dados do servico"}
              {fase === 2 && "Confirme a emissao no portal"}
              {fase === 3 && "Informe os dados da nota emitida"}
            </p>
          </div>
          <button
            onClick={fechar}
            className="cursor-pointer"
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.3)",
              padding: 4,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M4 4l10 10M14 4l-10 10" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          {/* ======= FASE 1 - Formulario ======= */}
          {fase === 1 && (
            <form onSubmit={handleSubmitFase1} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Nome do tomador
                </label>
                <input
                  type="text"
                  required
                  value={tomadorNome}
                  onChange={(e) => setTomadorNome(e.target.value)}
                  placeholder="Nome da empresa ou pessoa"
                  autoFocus
                  className="outline-none"
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    fontSize: 14,
                    color: "#FFFFFF",
                    colorScheme: "dark",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  CNPJ ou CPF do tomador
                </label>
                <input
                  type="text"
                  value={tomadorDocumento}
                  onChange={(e) => setTomadorDocumento(e.target.value)}
                  placeholder="Opcional"
                  className="outline-none"
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    fontSize: 14,
                    color: "#FFFFFF",
                    colorScheme: "dark",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Descricao do servico
                </label>
                <textarea
                  required
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o servico prestado"
                  className="outline-none"
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    fontSize: 14,
                    color: "#FFFFFF",
                    colorScheme: "dark",
                    resize: "none",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Valor
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={valorDisplay}
                  onChange={handleValorChange}
                  placeholder="R$ 0,00"
                  className="outline-none"
                  style={{
                    padding: "16px 18px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    fontSize: 28,
                    fontFamily: "var(--font-dm-mono)",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    letterSpacing: "-0.02em",
                    colorScheme: "dark",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Competencia
                </label>
                <input
                  type="month"
                  value={competencia}
                  onChange={(e) => setCompetencia(e.target.value)}
                  className="outline-none"
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    fontSize: 14,
                    color: "#FFFFFF",
                    colorScheme: "dark",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={
                  salvando ||
                  valorCentavos <= 0 ||
                  !tomadorNome.trim() ||
                  !descricao.trim()
                }
                className="py-3.5 rounded-xl cursor-pointer disabled:opacity-40"
                style={{
                  backgroundColor: "#D4500A",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: 15,
                  border: "none",
                  marginTop: 4,
                  transition: "opacity 0.2s ease",
                }}
              >
                {salvando
                  ? "Salvando..."
                  : "Ir para o portal e salvar rascunho"}
              </button>
            </form>
          )}

          {/* ======= FASE 2 - Confirmacao ======= */}
          {fase === 2 && (
            <>
              {/* Resumo da nota salva */}
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  marginBottom: 20,
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Rascunho salvo
                  </p>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#D4500A",
                      backgroundColor: "rgba(212,80,10,0.15)",
                      padding: "2px 8px",
                      borderRadius: 99,
                    }}
                  >
                    Dados copiados
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#FAF8F5",
                    marginBottom: 4,
                  }}
                >
                  {notaSalva?.tomador_nome}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#D4500A",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {notaSalva?.valor?.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>

              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#FAF8F5",
                  marginBottom: 16,
                }}
              >
                Voce ja emitiu a nota no portal?
              </p>

              <div className="flex flex-col gap-3">
                {/* Sim, emiti */}
                <button
                  onClick={() => setFase(3)}
                  className="flex items-center gap-4 cursor-pointer"
                  style={{
                    padding: "18px 20px",
                    borderRadius: 14,
                    backgroundColor: "rgba(212,80,10,0.12)",
                    border: "1px solid rgba(212,80,10,0.15)",
                    textAlign: "left",
                    width: "100%",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(212,80,10,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(212,80,10,0.12)";
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: "#D4500A",
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M5 10l3.5 3.5L15 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#D4500A",
                      }}
                    >
                      Sim, emiti
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.35)",
                        marginTop: 2,
                      }}
                    >
                      Vou registrar os dados da nota
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </button>

                {/* Ainda nao */}
                <button
                  onClick={fechar}
                  className="flex items-center gap-4 cursor-pointer"
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    textAlign: "left",
                    width: "100%",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.05)";
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.07)",
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <circle cx="8" cy="8" r="6" />
                      <path d="M8 5v3.5" />
                      <path d="M8 11h.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      Ainda nao, fazer depois
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.25)",
                        marginTop: 2,
                      }}
                    >
                      O rascunho fica salvo
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* ======= FASE 3 - Registrar emissao ======= */}
          {fase === 3 && (
            <form onSubmit={handleSubmitFase3} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Numero da nota
                </label>
                <input
                  type="text"
                  required
                  value={numeroNota}
                  onChange={(e) => setNumeroNota(e.target.value)}
                  placeholder="Ex: 00001"
                  autoFocus
                  className="outline-none"
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    fontSize: 14,
                    color: "#FFFFFF",
                    colorScheme: "dark",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Data de emissao
                </label>
                <input
                  type="date"
                  value={dataEmissao}
                  onChange={(e) => setDataEmissao(e.target.value)}
                  className="outline-none"
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    fontSize: 14,
                    color: "#FFFFFF",
                    colorScheme: "dark",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  PDF da nota (opcional)
                </label>
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                      width: "100%",
                      colorScheme: "dark",
                    }}
                  />
                  {arquivo && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "#D4500A",
                        marginTop: 8,
                      }}
                    >
                      {arquivo.name}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={salvando || !numeroNota.trim()}
                className="py-3.5 rounded-xl cursor-pointer disabled:opacity-40"
                style={{
                  backgroundColor: "#D4500A",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: 15,
                  border: "none",
                  marginTop: 4,
                  transition: "opacity 0.2s ease",
                }}
              >
                {salvando ? "Salvando..." : "Salvar nota emitida"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
