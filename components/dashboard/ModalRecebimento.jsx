"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import { useToast } from "@/lib/toast-context";

export default function ModalRecebimento({ aberto, onFechar }) {
  const { perfil } = useDashboard();
  const { mostrarToast } = useToast();
  const supabase = createClient();

  const [fase, setFase] = useState(1);
  const [valorDisplay, setValorDisplay] = useState("");
  const [valorCentavos, setValorCentavos] = useState(0);
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().split("T")[0]);
  const [salvando, setSalvando] = useState(false);
  const [valorSalvo, setValorSalvo] = useState("");

  function formatarMoeda(centavos) {
    return (centavos / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function handleValorChange(e) {
    const digits = e.target.value.replace(/\D/g, "");
    const centavos = parseInt(digits || "0", 10);
    setValorCentavos(centavos);
    setValorDisplay(centavos === 0 ? "" : formatarMoeda(centavos));
  }

  function resetar() {
    setFase(1);
    setValorDisplay("");
    setValorCentavos(0);
    setDescricao("");
    setValorSalvo("");
    setData(new Date().toISOString().split("T")[0]);
  }

  function fechar() {
    resetar();
    onFechar();
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (valorCentavos <= 0 || !perfil) return;
    setSalvando(true);

    const [ano, mes] = data.split("-");
    const mesRef = `${ano}-${mes}-01`;

    const { error } = await supabase
      .from("faturamento")
      .insert({
        user_id: perfil.id,
        mes: mesRef,
        valor: valorCentavos / 100,
        descricao: descricao.trim() || null,
      });

    if (error) {
      mostrarToast("Erro ao salvar. Tente novamente.", "error");
      setSalvando(false);
      return;
    }

    setValorSalvo(formatarMoeda(valorCentavos));
    mostrarToast("Recebimento lancado");
    setSalvando(false);
    setFase(2);

    window.dispatchEvent(new CustomEvent("recebimento-salvo"));
  }

  if (!aberto) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={fechar}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 50,
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
          zIndex: 51,
          width: "100%",
          maxWidth: 460,
          margin: "0 16px",
          backgroundColor: "#F2EFE9",
          borderRadius: 20,
          overflow: "hidden",
          animation: "modalIn 0.3s ease-out",
        }}
      >
        {/* Step indicator */}
        <div
          className="flex items-center"
          style={{ padding: "20px 28px 0" }}
        >
          <div className="flex items-center gap-2 flex-1">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 99,
                  backgroundColor: fase >= 1 ? "#1C1C1C" : "#EBEBEB",
                  color: fase >= 1 ? "#FF5C00" : "#8A8A8A",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "var(--font-dm-mono)",
                }}
              >
                {fase > 1 ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M2.5 6l2.5 2.5 4.5-5" />
                  </svg>
                ) : "1"}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: fase >= 1 ? "#1C1C1C" : "#D6D6D6" }}>
                Recebimento
              </span>
            </div>

            {/* Connector */}
            <div
              style={{
                flex: 1,
                height: 1,
                backgroundColor: fase > 1 ? "#1C1C1C" : "#EBEBEB",
                margin: "0 4px",
                transition: "background-color 0.3s ease",
              }}
            />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 99,
                  backgroundColor: fase >= 2 ? "#1C1C1C" : "#EBEBEB",
                  color: fase >= 2 ? "#FF5C00" : "#8A8A8A",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "var(--font-dm-mono)",
                }}
              >
                2
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: fase >= 2 ? "#1C1C1C" : "#D6D6D6" }}>
                Nota fiscal
              </span>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={fechar}
            className="cursor-pointer"
            style={{ background: "none", border: "none", color: "#D6D6D6", padding: 4, marginLeft: 12 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l10 10M14 4l-10 10" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px 28px" }}>
          {fase === 1 ? (
            <>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#1C1C1C",
                  letterSpacing: "-0.03em",
                  marginBottom: 4,
                }}
              >
                Registrar recebimento
              </h2>
              <p style={{ fontSize: 13, color: "#8A8A8A", marginBottom: 24 }}>
                Registre cada venda ou servico. Isso alimenta seu controle de faturamento e a declaracao anual.
              </p>

              <form onSubmit={handleSalvar} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#8A8A8A" }}>
                    Valor recebido
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={valorDisplay}
                    onChange={handleValorChange}
                    placeholder="R$ 0,00"
                    autoFocus
                    className="outline-none"
                    style={{
                      padding: "16px 18px",
                      borderRadius: 14,
                      border: "1px solid #EBEBEB",
                      fontSize: 28,
                      fontFamily: "var(--font-dm-mono)",
                      fontWeight: 700,
                      color: "#1C1C1C",
                      letterSpacing: "-0.02em",
                      backgroundColor: "#FAF8F5",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#8A8A8A" }}>
                    Descricao (opcional)
                  </label>
                  <input
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Servico prestado, venda de produto..."
                    className="outline-none"
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: "1px solid #EBEBEB",
                      fontSize: 14,
                      color: "#1C1C1C",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#8A8A8A" }}>
                    Data do recebimento
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="outline-none"
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: "1px solid #EBEBEB",
                      fontSize: 14,
                      color: "#1C1C1C",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={salvando || valorCentavos <= 0}
                  className="py-3.5 rounded-xl cursor-pointer btn-primary disabled:opacity-40"
                  style={{
                    backgroundColor: "#FF5C00",
                    color: "#1C1C1C",
                    fontWeight: 600,
                    fontSize: 15,
                    border: "none",
                    marginTop: 4,
                  }}
                >
                  {salvando ? "Salvando..." : "Salvar e continuar"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Resumo do que foi salvo */}
              <div
                className="flex items-center gap-4"
                style={{
                  backgroundColor: "#FAF8F5",
                  borderRadius: 14,
                  padding: "16px 18px",
                  marginBottom: 24,
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,92,0,0.12)",
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#CC4400" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 10l3.5 3.5L15 7" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 13, color: "#8A8A8A" }}>Recebimento registrado</p>
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: 20, fontWeight: 700, color: "#1C1C1C", letterSpacing: "-0.02em" }}>
                    {valorSalvo}
                  </p>
                </div>
              </div>

              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#1C1C1C",
                  letterSpacing: "-0.03em",
                  marginBottom: 4,
                }}
              >
                Emitir nota fiscal?
              </h2>
              <p style={{ fontSize: 13, color: "#8A8A8A", marginBottom: 20, lineHeight: 1.5 }}>
                Se voce prestou servico para uma empresa, a nota e obrigatoria. Para pessoa fisica, e opcional.
              </p>

              {/* Opcoes como cards */}
              <div className="flex flex-col gap-3">
                <a
                  href="https://www.nfse.gov.br/EmissorNacional"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 card-hover"
                  style={{
                    padding: "16px 18px",
                    borderRadius: 14,
                    border: "1px solid #EBEBEB",
                    textDecoration: "none",
                    backgroundColor: "#F2EFE9",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: "#1C1C1C",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#FF5C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 1H4a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7l-6-6z" />
                      <path d="M10 1v6h6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1C" }}>
                      Emitir nota agora
                    </p>
                    <p style={{ fontSize: 12, color: "#8A8A8A", marginTop: 2 }}>
                      Abre o Emissor Nacional de NFS-e
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#D6D6D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </a>

                <button
                  onClick={fechar}
                  className="flex items-center gap-4 cursor-pointer card-hover"
                  style={{
                    padding: "16px 18px",
                    borderRadius: 14,
                    border: "1px solid #EBEBEB",
                    backgroundColor: "#F2EFE9",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: "#FAF8F5",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M4 4l10 10M14 4l-10 10" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1C" }}>
                      Agora nao
                    </p>
                    <p style={{ fontSize: 12, color: "#8A8A8A", marginTop: 2 }}>
                      Posso emitir depois, se precisar
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#D6D6D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </button>
              </div>

              <p className="text-center" style={{ fontSize: 11, color: "#D6D6D6", marginTop: 16, lineHeight: 1.5 }}>
                Nem todo recebimento precisa de nota. Consulte seu contador se tiver duvida.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
