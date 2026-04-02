"use client";

import { CNAE_MAP } from "@/lib/cnae-data";
import InfoTooltip from "./InfoTooltip";

export default function AtividadeCard({ dadosCnpj, perfil }) {
  const cnaeRaw = dadosCnpj?.cnae_fiscal?.toString() || perfil?.cnae || "";
  const cnaeClean = cnaeRaw.replace(/[.\-\/]/g, "");
  const dados = CNAE_MAP[cnaeClean] || null;

  // Formatar CNAE para exibicao (ex: 6201500 -> 62.01)
  const cnaeDisplay = cnaeClean.length >= 4
    ? `${cnaeClean.slice(0, 2)}.${cnaeClean.slice(2, 4)}`
    : cnaeClean;

  const nomeAtividade = dados?.nome
    || dadosCnpj?.cnae_fiscal_descricao
    || "Atividade nao identificada";

  return (
    <div
      style={{
        backgroundColor: "#F2EFE9",
        border: "1px solid #E8E3DA",
        borderRadius: 16,
        padding: 24,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#7A6255",
          }}
        >
          Sua atividade
        </span>
        <InfoTooltip texto="Informacoes sobre o que voce pode fazer com seu CNAE como MEI" />
      </div>

      {/* Nome da atividade */}
      <p
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#2A1F14",
          letterSpacing: "-0.03em",
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {nomeAtividade}
      </p>

      {/* CNAE code */}
      {cnaeClean && (
        <p
          className="font-mono"
          style={{
            fontSize: 12,
            color: "#7A6255",
            margin: "4px 0 0 0",
          }}
        >
          CNAE {cnaeDisplay}
        </p>
      )}

      {dados ? (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
          {/* Permitido */}
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#7A6255",
                margin: "0 0 8px 0",
              }}
            >
              O que voce pode fazer:
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
              {dados.permitido.map((item, i) => (
                <li key={i} style={{ fontSize: 13, color: "#2A1F14", display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#D4E600", flexShrink: 0, marginTop: 5 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Atencao */}
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#A83D08",
                margin: "0 0 8px 0",
              }}
            >
              Fique atento:
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
              {dados.atencao.map((item, i) => (
                <li key={i} style={{ fontSize: 13, color: "#2A1F14", display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#A83D08", flexShrink: 0 }}>⚠</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ fontSize: 13, color: "#7A6255", margin: 0 }}>
            Nao encontramos detalhes para o seu CNAE. Consulte o Portal do Empreendedor para saber o que voce pode fazer.
          </p>
        </div>
      )}

      {/* Link */}
      <a
        href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#D4500A",
          textDecoration: "none",
          marginTop: 16,
        }}
      >
        Ver todas as regras →
      </a>
    </div>
  );
}
