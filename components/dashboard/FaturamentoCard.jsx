import { LIMITE_ANUAL } from "@/lib/constants";

export default function FaturamentoCard({ valorMes = 0, totalAnual = 0 }) {
  const percentual = Math.round((totalAnual / LIMITE_ANUAL) * 100);
  const dentroDoLimite = percentual < 90;

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
        Faturamento do mês
      </span>

      {/* Valor */}
      <div className="mt-2">
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: 26,
            fontWeight: 700,
            color: "#1C1C1C",
          }}
        >
          {valorMes.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      </div>

      {/* Pill */}
      <span
        className="inline-block mt-3"
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: dentroDoLimite ? "#6B7400" : "#8B1A1A",
          backgroundColor: dentroDoLimite
            ? "rgba(212,230,0,0.12)"
            : "#FDF0F0",
          padding: "3px 10px",
          borderRadius: 99,
        }}
      >
        {dentroDoLimite ? "Dentro do limite" : "Próximo do limite"}
      </span>
    </div>
  );
}
