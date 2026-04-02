"use client";

import { useState, useEffect, useCallback } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { useToast } from "@/lib/toast-context";
import { listarNotas, cancelarNota } from "@/lib/notas-service";
import BlurOverlay from "@/components/dashboard/BlurOverlay";
import ResumoCard from "@/components/dashboard/ResumoCard";
import ModalEmitirNota from "@/components/notas/ModalEmitirNota";

const STATUS_STYLES = {
  rascunho: { bg: "#EDE8E0", text: "#7A6255", dot: "#7A6255", label: "Rascunho" },
  aguardando_confirmacao: { bg: "#FEF3EC", text: "#A83D08", dot: "#A83D08", label: "Aguardando" },
  emitida: { bg: "#ECFDF5", text: "#065F46", dot: "#065F46", label: "Emitida" },
  cancelada: { bg: "#FDF0F0", text: "#8B1A1A", dot: "#8B1A1A", label: "Cancelada" },
};

const MESES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatarCompetencia(competencia) {
  if (!competencia) return "";
  const partes = competencia.split("-");
  const ano = partes[0];
  const mes = parseInt(partes[1], 10);
  return `${MESES[mes - 1]} ${ano}`;
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.rascunho;
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        fontSize: 11,
        fontWeight: 500,
        borderRadius: 99,
        padding: "3px 10px",
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: style.dot,
          flexShrink: 0,
        }}
      />
      {style.label}
    </span>
  );
}

function IconX({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function IconExternal({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 8v3.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 11.5v-7A1.5 1.5 0 012.5 3H6M9 1h4v4M6 8L13 1" />
    </svg>
  );
}

export default function NotasPage() {
  const { perfil, carregando: carregandoPerfil, semCnpj } = useDashboard();
  const { mostrar } = useToast();

  const [notas, setNotas] = useState([]);
  const [carregandoNotas, setCarregandoNotas] = useState(true);
  const [filtro, setFiltro] = useState("todas");
  const [modalAberto, setModalAberto] = useState(false);
  const [notaParaEditar, setNotaParaEditar] = useState(null);

  const carregarNotas = useCallback(async () => {
    if (!perfil?.id) return;
    try {
      setCarregandoNotas(true);
      const dados = await listarNotas(perfil.id);
      setNotas(dados);
    } catch (err) {
      mostrar("Erro ao carregar notas fiscais", "erro");
    } finally {
      setCarregandoNotas(false);
    }
  }, [perfil?.id, mostrar]);

  useEffect(() => {
    carregarNotas();
  }, [carregarNotas]);

  // Resumos
  const emitidas = notas.filter((n) => n.status === "emitida");
  const totalEmitidas = emitidas.length;
  const valorTotalEmitido = emitidas.reduce((acc, n) => acc + Number(n.valor || 0), 0);
  const pendentes = notas.filter((n) => n.status === "rascunho" || n.status === "aguardando_confirmacao").length;

  // Filtragem
  const notasFiltradas = filtro === "todas"
    ? notas
    : filtro === "rascunhos"
      ? notas.filter((n) => n.status === "rascunho" || n.status === "aguardando_confirmacao")
      : filtro === "emitidas"
        ? notas.filter((n) => n.status === "emitida")
        : notas.filter((n) => n.status === "cancelada");

  async function handleCancelar(notaId) {
    try {
      await cancelarNota(notaId);
      mostrar("Nota cancelada", "sucesso");
      carregarNotas();
    } catch {
      mostrar("Erro ao cancelar nota", "erro");
    }
  }

  function abrirModal(nota = null) {
    setNotaParaEditar(nota);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setNotaParaEditar(null);
  }

  function handleNotaSalva() {
    fecharModal();
    carregarNotas();
  }

  if (carregandoPerfil) {
    return (
      <div style={{ maxWidth: 900 }}>
        <div className="animate-pulse" style={{ backgroundColor: "#F2EFE9", border: "1px solid #E8E3DA", borderRadius: 16, height: 200 }} />
      </div>
    );
  }

  const filtros = [
    { key: "todas", label: "Todas" },
    { key: "rascunhos", label: "Rascunhos" },
    { key: "emitidas", label: "Emitidas" },
    { key: "canceladas", label: "Canceladas" },
  ];

  const conteudo = (
    <div className="flex flex-col gap-5" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#2A1F14",
            letterSpacing: "-0.03em",
          }}
        >
          Notas fiscais
        </h1>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#D4500A",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 13,
            padding: "10px 18px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M7 1v12M1 7h12" />
          </svg>
          Emitir nota
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ResumoCard label="Total emitidas" valor={totalEmitidas} />
        <ResumoCard label="Valor total emitido" valor={formatarMoeda(valorTotalEmitido)} mono />
        <ResumoCard label="Rascunhos pendentes" valor={pendentes} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: 99,
              border: filtro === f.key ? "none" : "1px solid #E8E3DA",
              backgroundColor: filtro === f.key ? "#D4500A" : "transparent",
              color: filtro === f.key ? "#FFFFFF" : "#7A6255",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notes list */}
      {carregandoNotas ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                backgroundColor: "#F2EFE9",
                border: "1px solid #E8E3DA",
                borderRadius: 16,
                height: 72,
              }}
            />
          ))}
        </div>
      ) : notasFiltradas.length === 0 && notas.length === 0 ? (
        /* Empty state */
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E3DA",
            borderRadius: 16,
            padding: "48px 24px",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#E8E3DA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 6H16a6 6 0 00-6 6v24a6 6 0 006 6h16a6 6 0 006-6V16l-10-10z" />
            <path d="M28 6v10h10M18 24h12M18 30h8" />
          </svg>
          <p style={{ fontSize: 14, color: "#7A6255", marginTop: 16, lineHeight: 1.6 }}>
            Nenhuma nota fiscal registrada. Emita sua primeira nota para comecar.
          </p>
          <button
            onClick={() => abrirModal()}
            className="mt-4 transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "#D4500A",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: 13,
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
            }}
          >
            Emitir primeira nota
          </button>
        </div>
      ) : notasFiltradas.length === 0 ? (
        <div
          className="flex items-center justify-center"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E3DA",
            borderRadius: 16,
            padding: "32px 24px",
          }}
        >
          <p style={{ fontSize: 14, color: "#7A6255" }}>
            Nenhuma nota encontrada nesse filtro.
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E3DA",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {notasFiltradas.map((nota, i) => (
            <div
              key={nota.id}
              className="flex items-center gap-4 flex-wrap md:flex-nowrap"
              style={{
                padding: "16px 20px",
                borderTop: i > 0 ? "1px solid #E8E3DA" : "none",
              }}
            >
              {/* Left: tomador + descricao */}
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#2A1F14",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {nota.tomador_nome || "Sem tomador"}
                </p>
                {nota.descricao && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#7A6255",
                      marginTop: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {nota.descricao}
                  </p>
                )}
              </div>

              {/* Center: valor */}
              <div style={{ flexShrink: 0, textAlign: "right", minWidth: 100 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#2A1F14",
                    fontFamily: "var(--font-dm-mono)",
                  }}
                >
                  {formatarMoeda(nota.valor || 0)}
                </p>
              </div>

              {/* Center: competencia */}
              <div style={{ flexShrink: 0, minWidth: 100 }}>
                <p style={{ fontSize: 12, color: "#7A6255" }}>
                  {formatarCompetencia(nota.competencia)}
                </p>
              </div>

              {/* Right: status + numero_nota */}
              <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                <StatusBadge status={nota.status} />
                {nota.status === "emitida" && nota.numero_nota && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#7A6255",
                      fontFamily: "var(--font-dm-mono)",
                    }}
                  >
                    #{nota.numero_nota}
                  </span>
                )}
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                {nota.status === "rascunho" && (
                  <button
                    onClick={() => abrirModal(nota)}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#D4500A",
                      background: "none",
                      border: "1px solid #D4500A",
                      borderRadius: 8,
                      padding: "5px 12px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Continuar emissao
                  </button>
                )}

                {nota.status === "aguardando_confirmacao" && (
                  <button
                    onClick={() => abrirModal(nota)}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#D4500A",
                      background: "none",
                      border: "1px solid #D4500A",
                      borderRadius: 8,
                      padding: "5px 12px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Anexar PDF
                  </button>
                )}

                {nota.status === "emitida" && nota.pdf_url && (
                  <a
                    href={nota.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#D4500A",
                      textDecoration: "none",
                      background: "none",
                      border: "1px solid #D4500A",
                      borderRadius: 8,
                      padding: "5px 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <IconExternal size={12} />
                    Ver PDF
                  </a>
                )}

                {nota.status !== "emitida" && (
                  <button
                    onClick={() => handleCancelar(nota.id)}
                    title="Cancelar nota"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      border: "1px solid #E8E3DA",
                      background: "none",
                      color: "#7A6255",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <IconX size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* "Em breve" teaser card */}
      <div
        style={{
          backgroundColor: "rgba(212,80,10,0.12)",
          border: "1px solid #D4500A",
          borderRadius: 12,
          padding: "22px 26px",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: "#D4500A",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            G
          </span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#2A1F14" }}>
              Em breve: emissao direto pelo Guiado
            </p>
            <p style={{ fontSize: 13, color: "#A83D08", marginTop: 2 }}>
              Estamos trabalhando para voce emitir NFS-e sem sair da plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModalEmitirNota
        aberto={modalAberto}
        onFechar={fecharModal}
        userId={perfil?.id}
        onNotaSalva={handleNotaSalva}
        notaExistente={notaParaEditar}
      />
    </div>
  );

  if (semCnpj) return <BlurOverlay>{conteudo}</BlurOverlay>;
  return conteudo;
}
