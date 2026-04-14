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
  nome_completo?: string;
  plano: string;
  hubla_member_id?: string;
  plano_valido_ate?: string;
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
    if (!dateStr) return "-";
    const parts = dateStr.split("T")[0].split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const totalPro = profiles.filter((p) => p.plano === "pro" || p.plano === "anual").length;
  const totalFree = profiles.filter((p) => !p.plano || p.plano === "free").length;
  const mrrEstimado = totalPro * 39.9;

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#FAF8F5", marginBottom: 4 }}>
          Assinaturas
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          Cobranca via Hubla. Alteracoes manuais aqui sobrescrevem o webhook.
        </p>
      </div>

      {/* Metricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total usuarios", valor: profiles.length },
          { label: "Plano Pro", valor: totalPro },
          { label: "Plano Free", valor: totalFree },
          { label: "MRR estimado", valor: `R$ ${mrrEstimado.toFixed(2).replace(".", ",")}` },
        ].map((m) => (
          <div key={m.label} style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 18px" }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{m.label}</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#FAF8F5", fontFamily: "var(--font-dm-mono)" }}>{m.valor}</span>
          </div>
        ))}
      </div>

      {/* Links Hubla */}
      <div style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 12 }}>Links Hubla</span>
        <div style={{ display: "flex", gap: 12 }}>
          <a
            href="https://app.hub.la/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, color: "#D4500A", textDecoration: "none", padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(212,80,10,0.2)", transition: "background 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(212,80,10,0.08)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
          >
            Dashboard Hubla
          </a>
          <a
            href="https://app.hub.la/user_groups"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Membros
          </a>
          <a
            href={`https://pay.hub.la/${process.env.NEXT_PUBLIC_HUBLA_CHECKOUT_MENSAL?.split("/").pop() || ""}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Checkout mensal
          </a>
          <a
            href={`https://pay.hub.la/${process.env.NEXT_PUBLIC_HUBLA_CHECKOUT_ANUAL?.split("/").pop() || ""}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Checkout anual
          </a>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)" }}>Carregando...</div>
      ) : profiles.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)" }}>Nenhum usuario</div>
      ) : (
        <div style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 140px 80px 90px", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Usuario", "Plano", "Hubla", "Valido ate", "Alterar", ""].map((h) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {profiles.map((p) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 140px 80px 90px", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
              {/* Nome/email */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#FAF8F5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.nome_completo || p.nome_fantasia || "Sem nome"}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.email || "-"}
                </div>
              </div>

              {/* Plano badge */}
              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: `${PLANO_COLORS[p.plano] || "#C8C2B8"}20`, color: PLANO_COLORS[p.plano] || "#C8C2B8", textTransform: "uppercase", display: "inline-block", width: "fit-content" }}>
                {p.plano || "free"}
              </span>

              {/* Hubla ID */}
              <div style={{ fontSize: 11, color: p.hubla_member_id ? "rgba(74,222,128,0.7)" : "rgba(255,255,255,0.2)", fontFamily: "var(--font-dm-mono)" }}>
                {p.hubla_member_id ? "Vinculado" : "Manual"}
              </div>

              {/* Valido ate */}
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-dm-mono)" }}>
                {p.plano_valido_ate ? formatDate(p.plano_valido_ate) : "-"}
              </div>

              {/* Dropdown */}
              <select
                value={p._newPlano || p.plano || "free"}
                onChange={(e) => handlePlanoChange(p.id, e.target.value)}
                style={{ padding: "5px 8px", borderRadius: 6, fontSize: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#FAF8F5", cursor: "pointer" }}
              >
                {PLANO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Save */}
              <button
                onClick={() => handleSave(p.id)}
                disabled={p._saving || p._newPlano === p.plano}
                style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 500, border: "none",
                  background: p._newPlano !== p.plano ? "#D4500A" : "rgba(255,255,255,0.06)",
                  color: p._newPlano !== p.plano ? "#FAF8F5" : "rgba(255,255,255,0.2)",
                  cursor: p._saving || p._newPlano === p.plano ? "not-allowed" : "pointer",
                  opacity: p._saving ? 0.6 : 1,
                }}
              >
                {p._saving ? "..." : "Salvar"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 50, background: toast.type === "success" ? "#1A1A1A" : "rgba(226,75,74,0.15)", color: toast.type === "success" ? "#4ADE80" : "#E24B4A", border: `1px solid ${toast.type === "success" ? "rgba(74,222,128,0.2)" : "rgba(226,75,74,0.3)"}` }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
