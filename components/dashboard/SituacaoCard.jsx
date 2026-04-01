export default function SituacaoCard({ dadosCnpj, perfil }) {
  const situacao =
    dadosCnpj?.descricao_situacao_cadastral || perfil?.situacao || "Carregando";
  const ativo = situacao.toLowerCase() === "ativa";
  const cnaeDescricao =
    dadosCnpj?.cnae_fiscal_descricao || "";
  const cnaeCodigo =
    dadosCnpj?.cnae_fiscal?.toString() || perfil?.cnae || "";

  // Formatar CNAE para exibição (XX.XX)
  const cnaeFormatado =
    cnaeCodigo.length >= 4
      ? `${cnaeCodigo.slice(0, 2)}.${cnaeCodigo.slice(2, 4)}`
      : cnaeCodigo;

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #D6D6D6",
        borderRadius: 12,
        padding: "22px 26px",
      }}
    >
      {/* Título */}
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#8A8A8A",
        }}
      >
        Situação cadastral
      </span>

      {/* Status */}
      <div className="flex items-center gap-2 mt-2">
        <span
          className="inline-block rounded-full"
          style={{
            width: 8,
            height: 8,
            backgroundColor: ativo ? "#4ADE80" : "#E05252",
          }}
        />
        <span
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#1C1C1C",
            letterSpacing: "-0.03em",
          }}
        >
          {situacao}
        </span>
      </div>

      {/* Detalhes */}
      {cnaeDescricao && (
        <p className="mt-1" style={{ fontSize: 13, color: "#8A8A8A" }}>
          {cnaeDescricao} ·{" "}
          <span style={{ fontFamily: "var(--font-dm-mono)" }}>
            CNAE {cnaeFormatado}
          </span>
        </p>
      )}

      {/* Pill */}
      <span
        className="inline-block mt-3"
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "#6B7400",
          backgroundColor: "rgba(212,230,0,0.12)",
          padding: "3px 10px",
          borderRadius: 99,
        }}
      >
        Receita Federal
      </span>
    </div>
  );
}
