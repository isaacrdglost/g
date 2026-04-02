export default function SituacaoCard({ dadosCnpj, perfil }) {
  const situacao =
    dadosCnpj?.descricao_situacao_cadastral || perfil?.situacao || "Carregando";
  const ativo = situacao.toLowerCase() === "ativa";
  const cnaeDescricao = dadosCnpj?.cnae_fiscal_descricao || "";
  const cnaeCodigo =
    dadosCnpj?.cnae_fiscal?.toString() || perfil?.cnae || "";

  const cnaeFormatado =
    cnaeCodigo.length >= 4
      ? `${cnaeCodigo.slice(0, 2)}.${cnaeCodigo.slice(2, 4)}`
      : cnaeCodigo;

  return (
    <div
      style={{
        backgroundColor: "#F2EFE9",
        border: "1px solid #E8E3DA",
        borderRadius: 16,
        padding: "24px 24px",
        height: "100%",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#7A6255",
          }}
        >
          Situacao cadastral
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#A83D08",
            backgroundColor: "rgba(212,80,10,0.12)",
            padding: "3px 10px",
            borderRadius: 99,
          }}
        >
          Receita Federal
        </span>
      </div>

      <div className="flex items-center gap-2.5" style={{ marginTop: 12 }}>
        <span
          className="inline-block rounded-full"
          style={{
            width: 10,
            height: 10,
            backgroundColor: ativo ? "#4ADE80" : "#E05252",
          }}
        />
        <span
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#2A1F14",
            letterSpacing: "-0.03em",
          }}
        >
          {situacao}
        </span>
      </div>

      {cnaeDescricao && (
        <p style={{ fontSize: 13, color: "#7A6255", marginTop: 8, lineHeight: 1.5 }}>
          {cnaeDescricao}
          {cnaeFormatado && (
            <span style={{ fontFamily: "var(--font-dm-mono)", marginLeft: 4 }}>
              · CNAE {cnaeFormatado}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
