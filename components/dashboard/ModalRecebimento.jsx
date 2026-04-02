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

  function formatarMoeda(centavos) {
    return (centavos / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function handleValorChange(e) {
    // Pegar apenas digitos
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

    // Extrair mes da data (primeiro dia do mes)
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

    mostrarToast("Recebimento lancado");
    setSalvando(false);
    setFase(2);

    // Notificar o dashboard pra atualizar os dados
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
          maxWidth: 440,
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: "32px 28px",
          animation: "modalIn 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#1C1C1C",
              letterSpacing: "-0.03em",
            }}
          >
            {fase === 1 ? "Novo recebimento" : "Recebimento salvo"}
          </h2>
          <button
            onClick={fechar}
            className="cursor-pointer"
            style={{ background: "none", border: "none", color: "#D6D6D6", padding: 4 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l10 10M14 4l-10 10" />
            </svg>
          </button>
        </div>

        {fase === 1 ? (
          <form onSubmit={handleSalvar} className="flex flex-col gap-5">
            {/* Valor */}
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: 13, fontWeight: 500, color: "#8A8A8A" }}>
                Valor (R$)
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
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid #EBEBEB",
                  fontSize: 24,
                  fontFamily: "var(--font-dm-mono)",
                  fontWeight: 700,
                  color: "#1C1C1C",
                  letterSpacing: "-0.02em",
                }}
              />
            </div>

            {/* Descricao */}
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

            {/* Data */}
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: 13, fontWeight: 500, color: "#8A8A8A" }}>
                Data
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
              disabled={salvando}
              className="py-3.5 rounded-xl cursor-pointer btn-primary disabled:opacity-50"
              style={{
                backgroundColor: "#1C1C1C",
                color: "#D4E600",
                fontWeight: 600,
                fontSize: 15,
                border: "none",
                marginTop: 4,
              }}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </form>
        ) : (
          /* Fase 2 - Nota fiscal */
          <div>
            {/* Icone sucesso */}
            <div
              className="flex items-center justify-center mx-auto"
              style={{
                width: 52,
                height: 52,
                borderRadius: 99,
                backgroundColor: "rgba(212,230,0,0.12)",
                marginBottom: 20,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7400" strokeWidth="2" strokeLinecap="round">
                <path d="M6 12l4 4 8-8" />
              </svg>
            </div>

            <p className="text-center" style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1C", letterSpacing: "-0.03em" }}>
              Precisa emitir nota fiscal?
            </p>
            <p className="text-center" style={{ fontSize: 13, color: "#8A8A8A", marginTop: 6, lineHeight: 1.5 }}>
              Se voce prestou servico para uma empresa, a nota e obrigatoria. Para pessoa fisica, e opcional.
            </p>

            <div className="flex flex-col gap-3" style={{ marginTop: 24 }}>
              <a
                href="https://www.nfse.gov.br/EmissorNacional"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm btn-primary"
                style={{
                  backgroundColor: "#1C1C1C",
                  color: "#D4E600",
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 8v3.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 11.5v-7A1.5 1.5 0 012.5 3H6M9 1h4v4M6 8L13 1" />
                </svg>
                Emitir nota agora
              </a>

              <button
                onClick={fechar}
                className="py-3 rounded-xl text-sm cursor-pointer btn-primary"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#1C1C1C",
                  fontWeight: 500,
                  fontSize: 14,
                  border: "1px solid #EBEBEB",
                }}
              >
                Agora nao
              </button>
            </div>

            <p className="text-center" style={{ fontSize: 12, color: "#D6D6D6", marginTop: 16, lineHeight: 1.5 }}>
              Nem todo recebimento precisa de nota. Consulte seu contador se tiver duvida.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
