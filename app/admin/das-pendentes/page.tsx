"use client";

import { useEffect, useState } from "react";

const MESES_LABEL = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const STATUS_COLORS: Record<string, string> = {
  pendente: "#E24B4A",
  em_andamento: "#F59E0B",
  concluido: "#4ADE80",
};

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluido: "Concluido",
};

function formatCnpj(cnpj: string): string {
  if (!cnpj) return "";
  const raw = cnpj.replace(/\D/g, "");
  if (raw.length !== 14) return cnpj;
  return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12)}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("T")[0].split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatCompetencia(comp: string): string {
  if (!comp) return "";
  const parts = comp.split("-");
  const mesIdx = parseInt(parts[1], 10) - 1;
  return `${MESES_LABEL[mesIdx] || parts[1]} ${parts[0]}`;
}

interface Pendente {
  id: string;
  user_id: string;
  nome_completo: string;
  cnpj: string;
  status: string;
  created_at: string;
}

interface DasRecord {
  id: string;
  user_id: string;
  competencia: string;
  valor: number;
  status: string;
  data_pagamento: string | null;
}

interface DasUpdate {
  id: string;
  status: string;
  valor: number;
  data_pagamento: string;
}

export default function DasPendentesPage() {
  const [pendentes, setPendentes] = useState<Pendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Panel state
  const [selectedUser, setSelectedUser] = useState<Pendente | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [dasRecords, setDasRecords] = useState<DasRecord[]>([]);
  const [dasUpdates, setDasUpdates] = useState<DasUpdate[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPendentes();
  }, []);

  async function fetchPendentes() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?action=das_pendentes");
      const { pendentes: data } = await res.json();
      setPendentes(data || []);
    } catch {
      // ignore
    }
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleAbrirPGMEI(cnpj: string) {
    const raw = cnpj.replace(/\D/g, "");
    try {
      await navigator.clipboard.writeText(raw);
      showToast("CNPJ copiado");
    } catch {
      showToast("Erro ao copiar");
    }
    window.open(
      "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao",
      "_blank"
    );
  }

  async function handleOpenPanel(pendente: Pendente) {
    setSelectedUser(pendente);
    setPanelOpen(true);
    setPanelLoading(true);
    try {
      const res = await fetch(`/api/admin?action=usuario_das&userId=${pendente.user_id}`);
      const { das } = await res.json();
      setDasRecords(das || []);
      setDasUpdates(
        (das || []).map((d: DasRecord) => ({
          id: d.id,
          status: d.status,
          valor: d.valor,
          data_pagamento: d.data_pagamento || "",
        }))
      );
    } catch {
      setDasRecords([]);
      setDasUpdates([]);
    }
    setPanelLoading(false);
  }

  function handleClosePanel() {
    setPanelOpen(false);
    setSelectedUser(null);
    setDasRecords([]);
    setDasUpdates([]);
  }

  function updateDasField(idx: number, field: keyof DasUpdate, value: string | number) {
    setDasUpdates((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  async function handleMarcarEmAndamento() {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "das_atualizar_status",
          pendentId: selectedUser.id,
          status: "em_andamento",
        }),
      });
      setPendentes((prev) =>
        prev.map((p) => (p.id === selectedUser.id ? { ...p, status: "em_andamento" } : p))
      );
      setSelectedUser((prev) => (prev ? { ...prev, status: "em_andamento" } : prev));
      showToast("Marcado como em andamento");
    } catch {
      showToast("Erro ao atualizar");
    }
    setSaving(false);
  }

  async function handleSalvarTudo() {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "das_salvar_batch",
          pendentId: selectedUser.id,
          updates: dasUpdates,
        }),
      });
      setPendentes((prev) => prev.filter((p) => p.id !== selectedUser.id));
      handleClosePanel();
      showToast("DAS atualizado e removido da lista");
    } catch {
      showToast("Erro ao salvar");
    }
    setSaving(false);
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#FAF8F5",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          DAS Pendentes
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
          Usuarios que precisam de atualizacao manual no DAS
        </p>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#1A1A1A",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
            Carregando...
          </div>
        ) : pendentes.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
            Nenhum DAS pendente de atualizacao
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Nome", "CNPJ", "Cadastro", "Status", "Acoes"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontSize: 11,
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "rgba(255,255,255,0.35)",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendentes.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#FAF8F5" }}>
                    {p.nome_completo || "-"}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.6)",
                      fontFamily: "var(--font-dm-mono), monospace",
                    }}
                  >
                    {formatCnpj(p.cnpj)}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {formatDate(p.created_at)}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 500,
                        padding: "3px 10px",
                        borderRadius: 99,
                        background: `${STATUS_COLORS[p.status] || "#8A8A8A"}20`,
                        color: STATUS_COLORS[p.status] || "#8A8A8A",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: STATUS_COLORS[p.status] || "#8A8A8A",
                        }}
                      />
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleAbrirPGMEI(p.cnpj)}
                        style={{
                          padding: "6px 12px",
                          fontSize: 12,
                          fontWeight: 500,
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "transparent",
                          color: "rgba(255,255,255,0.7)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Abrir PGMEI
                      </button>
                      <button
                        onClick={() => handleOpenPanel(p)}
                        style={{
                          padding: "6px 12px",
                          fontSize: 12,
                          fontWeight: 500,
                          borderRadius: 8,
                          border: "none",
                          background: "#D4500A",
                          color: "#fff",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Atualizar DAS
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-in Panel Overlay */}
      {panelOpen && (
        <div
          onClick={handleClosePanel}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 99,
          }}
        />
      )}

      {/* Slide-in Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: 400,
          background: "#1A1A1A",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          zIndex: 100,
          transform: panelOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedUser && (
          <>
            {/* Panel Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#FAF8F5" }}>
                  {selectedUser.nome_completo || "Sem nome"}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "var(--font-dm-mono), monospace",
                    marginTop: 2,
                  }}
                >
                  {formatCnpj(selectedUser.cnpj)}
                </div>
              </div>
              <button
                onClick={handleClosePanel}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  fontSize: 20,
                  padding: "4px 8px",
                }}
              >
                &#x2715;
              </button>
            </div>

            {/* Panel Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {panelLoading ? (
                <div
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Carregando DAS...
                </div>
              ) : dasRecords.length === 0 ? (
                <div
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Nenhum registro DAS encontrado
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {dasRecords.map((d, idx) => (
                    <div
                      key={d.id}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#FAF8F5",
                          marginBottom: 10,
                        }}
                      >
                        {formatCompetencia(d.competencia)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {/* Status select */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <label
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.4)",
                              width: 60,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            Status
                          </label>
                          <select
                            value={dasUpdates[idx]?.status || d.status}
                            onChange={(e) => updateDasField(idx, "status", e.target.value)}
                            style={{
                              flex: 1,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: 6,
                              padding: "6px 8px",
                              fontSize: 13,
                              color: "#FAF8F5",
                              outline: "none",
                            }}
                          >
                            <option value="pago">Pago</option>
                            <option value="pendente">Pendente</option>
                            <option value="atrasado">Atrasado</option>
                            <option value="desconhecido">Nao gerado</option>
                          </select>
                        </div>

                        {/* Valor input */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <label
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.4)",
                              width: 60,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            Valor
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={dasUpdates[idx]?.valor ?? d.valor ?? ""}
                            onChange={(e) =>
                              updateDasField(idx, "valor", parseFloat(e.target.value) || 0)
                            }
                            style={{
                              flex: 1,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: 6,
                              padding: "6px 8px",
                              fontSize: 13,
                              color: "#FAF8F5",
                              fontFamily: "var(--font-dm-mono), monospace",
                              outline: "none",
                            }}
                          />
                        </div>

                        {/* Data pagamento (only when pago) */}
                        {(dasUpdates[idx]?.status || d.status) === "pago" && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <label
                              style={{
                                fontSize: 11,
                                color: "rgba(255,255,255,0.4)",
                                width: 60,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                              }}
                            >
                              Pago em
                            </label>
                            <input
                              type="date"
                              value={dasUpdates[idx]?.data_pagamento || ""}
                              onChange={(e) =>
                                updateDasField(idx, "data_pagamento", e.target.value)
                              }
                              style={{
                                flex: 1,
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 6,
                                padding: "6px 8px",
                                fontSize: 13,
                                color: "#FAF8F5",
                                outline: "none",
                                colorScheme: "dark",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: 10,
              }}
            >
              <button
                onClick={handleMarcarEmAndamento}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "#F59E0B",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.5 : 1,
                }}
              >
                Marcar em andamento
              </button>
              <button
                onClick={handleSalvarTudo}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: "none",
                  background: "#D4500A",
                  color: "#fff",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.5 : 1,
                }}
              >
                Salvar tudo
              </button>
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#141414",
            color: "#D4500A",
            padding: "10px 20px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            zIndex: 200,
            animation: "toastIn 0.3s ease-out",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
