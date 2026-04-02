"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useDashboard } from "@/lib/dashboard-context";
import { useToast } from "@/lib/toast-context";
import { createClient } from "@/lib/supabase";
import { formatarCnpj } from "@/lib/utils";
import BlurOverlay from "@/components/dashboard/BlurOverlay";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */

function IconExternal() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 8v3.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 11.5v-7A1.5 1.5 0 012.5 3H6M9 1h4v4M6 8L13 1" />
    </svg>
  );
}

function IconFolder({ open }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#2A1F14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6a2 2 0 012-2h3.172a2 2 0 011.414.586L9.5 5.5H16a2 2 0 012 2v1H4.5L2 16V6z" />
        <path d="M4.5 8.5L2 16h13.5a2 2 0 001.932-1.478L19 8.5H4.5z" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#2A1F14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6a2 2 0 012-2h3.172a2 2 0 011.414.586L9.5 5.5H16a2 2 0 012 2V14a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12V3M4.5 6L8 2.5 11.5 6" />
      <path d="M2 12v1.5a1 1 0 001 1h10a1 1 0 001-1V12" />
    </svg>
  );
}

function IconDownload({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={color || "#7A6255"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v9M4.5 8L8 11.5 11.5 8" />
      <path d="M2 12v1.5a1 1 0 001 1h10a1 1 0 001-1V12" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#7A6255" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 4h11M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4M6.5 7v4M9.5 7v4" />
      <path d="M3.5 4l.5 9a1.5 1.5 0 001.5 1.5h5A1.5 1.5 0 0012 13l.5-9" />
    </svg>
  );
}

function IconChevron({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#7A6255"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.2s ease",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
      }}
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#7A6255" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1.5H4.5a1.5 1.5 0 00-1.5 1.5v10a1.5 1.5 0 001.5 1.5h7a1.5 1.5 0 001.5-1.5V5.5L9 1.5z" />
      <path d="M9 1.5v4h4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Portal cards (left column)                                         */
/* ------------------------------------------------------------------ */

const DOCUMENTOS = [
  {
    titulo: "CCMEI",
    descricao: "Certificado da Condi\u00e7\u00e3o de Microempreendedor Individual. Comprova que voc\u00ea \u00e9 MEI.",
    href: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/ccmei",
    icone: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="16" height="16" rx="2" />
        <path d="M8 11l2 2 4-4" />
      </svg>
    ),
  },
  {
    titulo: "Situa\u00e7\u00e3o Cadastral",
    descricao: "Comprovante de inscri\u00e7\u00e3o e situa\u00e7\u00e3o cadastral do seu CNPJ na Receita Federal.",
    href: "https://servicos.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp",
    icone: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M11 7v4l2.5 2.5" />
      </svg>
    ),
  },
  {
    titulo: "DAS pagos",
    descricao: "Acesse o portal PGMEI para consultar e gerar comprovantes de pagamento do DAS.",
    href: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao",
    icone: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="18" height="14" rx="2" />
        <path d="M2 8h18" />
        <path d="M6 12h4" />
      </svg>
    ),
  },
  {
    titulo: "DASN-SIMEI",
    descricao: "Declara\u00e7\u00e3o Anual do Simples Nacional para o MEI. Entregue todos os anos at\u00e9 31 de maio.",
    href: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/dasnsimei.app/Identificacao",
    icone: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H7a2 2 0 00-2 2v14a2 2 0 002 2h8a2 2 0 002-2V6l-4-4z" />
        <path d="M13 2v4h4M9 10h4M9 14h2" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Folder definitions                                                 */
/* ------------------------------------------------------------------ */

const PASTAS = [
  { id: "ccmei", nome: "CCMEI", descricao: "Certificado MEI" },
  { id: "das-pagos", nome: "DAS Pagos", descricao: "Comprovantes de pagamento" },
  { id: "notas-fiscais", nome: "Notas Fiscais", descricao: "Notas de servi\u00e7o emitidas" },
  { id: "dasn", nome: "Declara\u00e7\u00e3o Anual", descricao: "DASN-SIMEI" },
];

const BUCKET = "documentos";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatarTamanho(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatarData(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/* ------------------------------------------------------------------ */
/*  Folder component                                                   */
/* ------------------------------------------------------------------ */

function PastaArquivos({ pasta, userId }) {
  const supabase = createClient();
  const { mostrarToast } = useToast();
  const inputRef = useRef(null);

  const [aberta, setAberta] = useState(false);
  const [arquivos, setArquivos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const caminho = `${userId}/${pasta.id}`;

  const listarArquivos = useCallback(async () => {
    setCarregando(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(caminho, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

      if (error) {
        console.error("Erro ao listar arquivos:", error.message);
        setArquivos([]);
      } else {
        // Filtrar placeholder (.emptyFolderPlaceholder)
        setArquivos((data || []).filter((f) => f.name !== ".emptyFolderPlaceholder"));
      }
    } catch {
      setArquivos([]);
    }
    setCarregando(false);
  }, [caminho]);

  useEffect(() => {
    if (aberta) {
      listarArquivos();
    }
  }, [aberta, listarArquivos]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limite de 10 MB
    if (file.size > 10 * 1024 * 1024) {
      mostrarToast("Arquivo muito grande. Limite de 10 MB.", "error");
      return;
    }

    setEnviando(true);
    try {
      const nomeArquivo = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(`${caminho}/${nomeArquivo}`, file);

      if (error) {
        mostrarToast("Erro ao enviar arquivo. Tente novamente.", "error");
        console.error("Upload error:", error.message);
      } else {
        mostrarToast("Arquivo enviado com sucesso!");
        await listarArquivos();
      }
    } catch {
      mostrarToast("Erro ao enviar arquivo. Verifique sua conex\u00e3o.", "error");
    }
    setEnviando(false);
    // Limpar input
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDownload = async (nomeArquivo) => {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .download(`${caminho}/${nomeArquivo}`);

      if (error) {
        mostrarToast("Erro ao baixar arquivo.", "error");
        return;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      // Remover timestamp prefix do nome ao baixar
      const nomeOriginal = nomeArquivo.replace(/^\d+_/, "");
      a.download = nomeOriginal;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      mostrarToast("Erro ao baixar arquivo.", "error");
    }
  };

  const handleDelete = async (nomeArquivo) => {
    try {
      const { error } = await supabase.storage
        .from(BUCKET)
        .remove([`${caminho}/${nomeArquivo}`]);

      if (error) {
        mostrarToast("Erro ao excluir arquivo.", "error");
        return;
      }

      mostrarToast("Arquivo exclu\u00eddo.");
      setArquivos((prev) => prev.filter((f) => f.name !== nomeArquivo));
    } catch {
      mostrarToast("Erro ao excluir arquivo.", "error");
    }
  };

  const nomeOriginal = (name) => name.replace(/^\d+_/, "");

  return (
    <div
      style={{
        border: "1px solid #E8E3DA",
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#F2EFE9",
      }}
    >
      {/* Folder header - botao toggle */}
      <button
        onClick={() => setAberta(!aberta)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <IconFolder open={aberta} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#2A1F14", margin: 0 }}>
            {pasta.nome}
          </p>
          <p style={{ fontSize: 12, color: "#7A6255", margin: 0 }}>
            {pasta.descricao}
          </p>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#7A6255",
            backgroundColor: "#EDE8E0",
            borderRadius: 99,
            padding: "2px 10px",
            fontFamily: "var(--font-dm-mono)",
          }}
        >
          {arquivos.length}
        </span>
        <IconChevron open={aberta} />
      </button>

      {/* Conteudo expandido */}
      {aberta && (
        <div style={{ borderTop: "1px solid #E8E3DA", padding: "14px 16px" }}>
          {/* Botao de upload */}
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 10,
              backgroundColor: "#D4500A",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 500,
              cursor: enviando ? "wait" : "pointer",
              opacity: enviando ? 0.6 : 1,
              transition: "opacity 0.2s",
              marginBottom: arquivos.length > 0 ? 14 : 0,
            }}
          >
            <IconUpload />
            {enviando ? "Enviando..." : "Enviar arquivo"}
            <input
              ref={inputRef}
              type="file"
              onChange={handleUpload}
              disabled={enviando}
              style={{ display: "none" }}
            />
          </label>

          {/* Loading */}
          {carregando && (
            <div style={{ padding: "12px 0", color: "#7A6255", fontSize: 13 }}>
              Carregando...
            </div>
          )}

          {/* Lista de arquivos */}
          {!carregando && arquivos.length === 0 && (
            <p style={{ color: "#7A6255", fontSize: 13, margin: "10px 0 0 0" }}>
              Nenhum arquivo nesta pasta.
            </p>
          )}

          {!carregando &&
            arquivos.map((arq) => (
              <div
                key={arq.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom: "1px solid #EDE8E0",
                }}
              >
                <IconFile />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#2A1F14",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={nomeOriginal(arq.name)}
                  >
                    {nomeOriginal(arq.name)}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#7A6255",
                      margin: 0,
                      fontFamily: "var(--font-dm-mono)",
                    }}
                  >
                    {arq.metadata?.size ? formatarTamanho(arq.metadata.size) : ""}
                    {arq.metadata?.size && arq.created_at ? " - " : ""}
                    {arq.created_at ? formatarData(arq.created_at) : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(arq.name)}
                  title="Baixar"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 6,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconDownload />
                </button>
                <button
                  onClick={() => handleDelete(arq.name)}
                  title="Excluir"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 6,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconTrash />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal CCMEI (fallback quando CORS bloqueia download direto)        */
/* ------------------------------------------------------------------ */

function ModalCCMEI({ cnpj, onFechar, mostrarToast }) {
  const [copiado, setCopiado] = useState(false);
  const cnpjLimpo = (cnpj || "").replace(/\D/g, "");
  const urlCcmei = `https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/certificado-mei/CCMEI_${cnpjLimpo}.pdf`;

  function copiar() {
    navigator.clipboard.writeText(cnpjLimpo);
    setCopiado(true);
    mostrarToast("CNPJ copiado!");
  }

  return createPortal(
    <>
      <div onClick={onFechar} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999, animation: "fadeIn 0.2s ease-out" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1000, width: "100%", maxWidth: 420, margin: "0 16px", backgroundColor: "#141414", borderRadius: 20, overflow: "hidden", animation: "modalIn 0.3s ease-out" }}>
        <div className="flex items-center justify-between" style={{ padding: "24px 24px 0" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.03em" }}>
              Baixar CCMEI
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Certificado do Microempreendedor Individual
            </p>
          </div>
          <button onClick={onFechar} className="cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l10 10M14 4l-10 10" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px" }} className="flex flex-col gap-4">
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            O CCMEI precisa ser baixado diretamente no gov.br. Copie seu CNPJ abaixo e cole no campo do portal, se necessario.
          </p>

          {/* CNPJ para copiar */}
          <button
            onClick={copiar}
            className="flex items-center justify-between cursor-pointer"
            style={{
              padding: "16px 18px",
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.07)",
              border: copiado ? "1px solid rgba(212,80,10,0.3)" : "1px solid rgba(255,255,255,0.1)",
              width: "100%",
              textAlign: "left",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 18, fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.02em" }}>
              {formatarCnpj(cnpj)}
            </span>
            {copiado ? (
              <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: "#D4500A", fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 7l2.5 2.5L11 4" />
                </svg>
                Copiado
              </span>
            ) : (
              <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="9" height="9" rx="1.5" />
                  <path d="M10 4V2.5A1.5 1.5 0 008.5 1h-6A1.5 1.5 0 001 2.5v6A1.5 1.5 0 002.5 10H4" />
                </svg>
                Copiar CNPJ
              </span>
            )}
          </button>

          <div className="flex flex-col gap-2">
            <a
              href={urlCcmei}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { if (!copiado) copiar(); }}
              className="flex items-center justify-center py-3.5 rounded-xl btn-primary"
              style={{ backgroundColor: "#D4500A", color: "#FFFFFF", fontWeight: 600, fontSize: 15, textDecoration: "none", border: "none" }}
            >
              Ir para o gov.br
            </a>

            <button
              onClick={onFechar}
              className="cursor-pointer"
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 500, padding: 4 }}
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function DocumentosPage() {
  const { perfil, carregando, semCnpj } = useDashboard();
  const { mostrarToast } = useToast();
  const supabase = createClient();

  const [modalCcmei, setModalCcmei] = useState(false);
  const [ccmeiSalvo, setCcmeiSalvo] = useState(null); // { date: string } or null
  const [baixandoCcmei, setBaixandoCcmei] = useState(false);

  // Verificar se o usuario ja tem CCMEI salvo no storage
  useEffect(() => {
    if (!perfil?.id) return;

    async function verificarCcmei() {
      try {
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .list(`${perfil.id}/ccmei`, { limit: 10, sortBy: { column: "created_at", order: "desc" } });

        if (!error && data) {
          const ccmeiFile = data.find((f) => f.name !== ".emptyFolderPlaceholder" && f.name.toLowerCase().includes("ccmei"));
          if (ccmeiFile && ccmeiFile.created_at) {
            setCcmeiSalvo({ date: formatarData(ccmeiFile.created_at) });
          }
        }
      } catch {
        // Silenciar erros de verificacao
      }
    }

    verificarCcmei();
  }, [perfil?.id]);

  // Tentar baixar o CCMEI via fetch, se CORS bloquear abre modal
  async function handleBaixarCcmei() {
    if (!perfil?.cnpj) return;
    const cnpjLimpo = perfil.cnpj.replace(/\D/g, "");
    const urlCcmei = `https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/certificado-mei/CCMEI_${cnpjLimpo}.pdf`;

    setBaixandoCcmei(true);
    try {
      const resp = await fetch(urlCcmei);
      if (!resp.ok) throw new Error("Fetch falhou");

      const blob = await resp.blob();
      // Salvar no Supabase Storage
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(`${perfil.id}/ccmei/CCMEI.pdf`, blob, { upsert: true });

      if (error) {
        mostrarToast("Erro ao salvar CCMEI. Tente novamente.", "error");
      } else {
        const hoje = new Date();
        const dataStr = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;
        setCcmeiSalvo({ date: dataStr });
        mostrarToast("CCMEI salvo com sucesso!");
      }
    } catch {
      // CORS bloqueou ou erro de rede - abrir modal de fallback
      setModalCcmei(true);
    }
    setBaixandoCcmei(false);
  }

  // Download do CCMEI salvo no storage
  async function handleDownloadCcmeiSalvo() {
    if (!perfil?.id) return;
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .download(`${perfil.id}/ccmei/CCMEI.pdf`);

      if (error) {
        mostrarToast("Erro ao baixar CCMEI.", "error");
        return;
      }
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "CCMEI.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      mostrarToast("Erro ao baixar CCMEI.", "error");
    }
  }

  if (carregando) {
    return (
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: "1fr",
        }}
      >
        {/* Skeleton left */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ backgroundColor: "#F2EFE9", border: "1px solid #E8E3DA", borderRadius: 16, height: 160 }}
            />
          ))}
        </div>
      </div>
    );
  }

  const conteudo = (
    <div className="flex flex-col gap-5">
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#2A1F14",
          letterSpacing: "-0.03em",
        }}
      >
        Documentos
      </h1>

      {/* 2 colunas no desktop, 1 no mobile */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: "1fr",
        }}
      >
        {/* Coluna responsiva via media query inline nao funciona, usamos classes */}
        <style>{`
          @media (min-width: 1024px) {
            .documentos-grid {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>

        <div
          className="documentos-grid grid gap-6"
          style={{ gridTemplateColumns: "1fr" }}
        >
          {/* LEFT - Portais do governo */}
          <div className="flex flex-col gap-4">
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#7A6255",
                margin: 0,
              }}
            >
              Portais oficiais
            </p>

            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {DOCUMENTOS.map((doc, i) => {
                const isCcmei = i === 0;

                return (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "#F2EFE9",
                      border: "1px solid #E8E3DA",
                      borderRadius: 16,
                      padding: 24,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            backgroundColor: "#EDE8E0",
                            color: "#2A1F14",
                          }}
                        >
                          {doc.icone}
                        </div>
                        {isCcmei && ccmeiSalvo && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              backgroundColor: "rgba(212,80,10,0.094)",
                              color: "#A83D08",
                              borderRadius: 99,
                              padding: "3px 10px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Atualizado em {ccmeiSalvo.date}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#2A1F14", margin: 0 }}>
                        {doc.titulo}
                      </p>
                      <p style={{ fontSize: 13, color: "#7A6255", marginTop: 4, lineHeight: 1.5, margin: "4px 0 0 0" }}>
                        {doc.descricao}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      {isCcmei && (
                        <>
                          <button
                            onClick={handleBaixarCcmei}
                            disabled={baixandoCcmei}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm cursor-pointer"
                            style={{
                              backgroundColor: "#D4500A",
                              color: "#FFFFFF",
                              fontWeight: 500,
                              border: "none",
                              opacity: baixandoCcmei ? 0.6 : 1,
                              transition: "opacity 0.2s",
                            }}
                          >
                            <IconDownload color="#FFFFFF" />
                            {baixandoCcmei ? "Buscando..." : "Baixar CCMEI"}
                          </button>

                          {ccmeiSalvo && (
                            <button
                              onClick={handleDownloadCcmeiSalvo}
                              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm cursor-pointer transition-opacity hover:opacity-90"
                              style={{
                                backgroundColor: "#EDE8E0",
                                color: "#2A1F14",
                                fontWeight: 500,
                                border: "none",
                              }}
                            >
                              <IconDownload />
                              Ver arquivo salvo
                            </button>
                          )}
                        </>
                      )}

                      <a
                        href={doc.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: "#EDE8E0",
                          color: "#2A1F14",
                          fontWeight: 500,
                          textDecoration: "none",
                        }}
                      >
                        Acessar
                        <IconExternal />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT - Upload de documentos */}
          <div className="flex flex-col gap-4">
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#7A6255",
                margin: 0,
              }}
            >
              Seus arquivos
            </p>

            <div
              style={{
                backgroundColor: "#F2EFE9",
                border: "1px solid #E8E3DA",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div className="flex flex-col gap-3">
                {PASTAS.map((pasta) => (
                  <PastaArquivos
                    key={pasta.id}
                    pasta={pasta}
                    userId={perfil?.id}
                  />
                ))}
              </div>

              <p style={{ fontSize: 12, color: "#7A6255", marginTop: 16, marginBottom: 0 }}>
                Tamanho m\u00e1ximo por arquivo: 10 MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (semCnpj) return <BlurOverlay>{conteudo}</BlurOverlay>;

  return (
    <>
      {conteudo}
      {modalCcmei && (
        <ModalCCMEI
          cnpj={perfil?.cnpj || ""}
          onFechar={() => setModalCcmei(false)}
          mostrarToast={mostrarToast}
        />
      )}
    </>
  );
}
