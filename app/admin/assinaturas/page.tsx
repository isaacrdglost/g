"use client";

import { useEffect, useState } from "react";

const PLANO_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
];

const PLANO_COLORS: Record<string, string> = {
  free: "#C8C2B8",
  pro: "#D4500A",
  anual: "#D4500A",
};

interface Profile {
  id: string;
  email?: string;
  nome_fantasia?: string;
  plano: string;
  created_at: string;
  _newPlano?: string;
  _saving?: boolean;
}

export default function AdminAssinaturas() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    const res = await fetch("/api/admin?action=assinaturas");
    const data = await res.json();
    setProfiles(
      (data.profiles || []).map((p: any) => ({
        ...p,
        _newPlano: p.plano || "free",
        _saving: false,
      }))
    );
    setLoading(false);
  }

  function handlePlanoChange(id: string, newPlano: string) {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, _newPlano: newPlano } : p))
    );
  }

  async function handleSave(id: string) {
    const profile = profiles.find((p) => p.id === id);
    if (!profile || !profile._newPlano) return;

    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, _saving: true } : p))
    );

    let hasError = false;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "plano_update",
          userId: id,
          plano: profile._newPlano,
        }),
      });
      const data = await res.json();

      if (data.error) {
        hasError = true;
        showToast("Erro ao atualizar plano", "error");
      } else {
        showToast("Plano atualizado com sucesso", "success");
      }
    } catch {
      hasError = true;
      showToast("Erro ao atualizar plano", "error");
    }

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, plano: hasError ? p.plano : p._newPlano!, _saving: false }
          : p
      )
    );
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
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#FAF8F5", marginBottom: 4 }}>
            Assinaturas
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
            Gerencie os planos dos usuarios manualmente
          </p>
        </div>

        {/* Note banner */}
        <div
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <svg width="16" height="16" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="7" />
            <line x1="8" y1="5" x2="8" y2="8" />
            <line x1="8" y1="11" x2="8.01" y2="11" />
          </svg>
          <span style={{ fontSize: 13, color: "#F59E0B" }}>
            Integracao com Stripe em breve. Por enquanto, altere os planos manualmente.
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)" }}>
            Carregando usuarios...
          </div>
        ) : profiles.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)" }}>
            Nenhum usuario encontrado
          </div>
        ) : (
          <div
            style={{
              background: "#1A1A1A",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 140px 80px 100px",
                gap: 16,
                padding: "12px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Usuario
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Plano atual
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Alterar para
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Acao
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Cadastro
              </span>
            </div>

            {/* Table rows */}
            {profiles.map((profile) => (
              <div
                key={profile.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 140px 80px 100px",
                  gap: 16,
                  padding: "14px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  alignItems: "center",
                }}
              >
                {/* User */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#FAF8F5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {profile.nome_fantasia || "Sem nome"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {profile.email || "Sem email"}
                  </div>
                </div>

                {/* Plano atual badge */}
                <div>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 500,
                      background: `${PLANO_COLORS[profile.plano] || "#C8C2B8"}20`,
                      color: PLANO_COLORS[profile.plano] || "#C8C2B8",
                      textTransform: "uppercase",
                    }}
                  >
                    {profile.plano || "free"}
                  </span>
                </div>

                {/* Dropdown */}
                <div>
                  <select
                    value={profile._newPlano || profile.plano || "free"}
                    onChange={(e) => handlePlanoChange(profile.id, e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      fontSize: 13,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#FAF8F5",
                      cursor: "pointer",
                    }}
                  >
                    {PLANO_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Save button */}
                <div>
                  <button
                    onClick={() => handleSave(profile.id)}
                    disabled={profile._saving || profile._newPlano === profile.plano}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      background: profile._newPlano !== profile.plano ? "#D4500A" : "rgba(255,255,255,0.06)",
                      color: profile._newPlano !== profile.plano ? "#FAF8F5" : "rgba(255,255,255,0.2)",
                      border: "none",
                      cursor: profile._saving || profile._newPlano === profile.plano ? "not-allowed" : "pointer",
                      opacity: profile._saving ? 0.6 : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    {profile._saving ? "..." : "Salvar"}
                  </button>
                </div>

                {/* Date */}
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                  {formatDate(profile.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
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
