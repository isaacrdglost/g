import { LIMITE_ANUAL } from "@/lib/constants";

export default function FaturamentoCard({ valorMes = 0, valorMesAnterior = 0, totalAnual = 0 }) {
  const percentual = Math.round((totalAnual / LIMITE_ANUAL) * 100);
  const dentroDoLimite = percentual < 90;

  const variacao = valorMesAnterior > 0
    ? Math.round(((valorMes - valorMesAnterior) / valorMesAnterior) * 100)
    : 0;

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EBEBEB",
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
            color: "#8A8A8A",
          }}
        >
          Faturamento do mes
        </span>
        {variacao !== 0 && (
          <span
            className="inline-flex items-center gap-1"
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: variacao > 0 ? "#6B7400" : "#8B1A1A",
              backgroundColor: variacao > 0 ? "rgba(212,230,0,0.12)" : "#FDF0F0",
              padding: "3px 8px",
              borderRadius: 99,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {variacao > 0 ? <path d="M1 7l3-3 2 2 3-4" /> : <path d="M1 3l3 3 2-2 3 4" />}
            </svg>
            {variacao > 0 ? "+" : ""}{variacao}%
          </span>
        )}
      </div>

      <p
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: 32,
          fontWeight: 700,
          color: "#1C1C1C",
          marginTop: 12,
          letterSpacing: "-0.02em",
        }}
      >
        {valorMes.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>

      <span
        className="inline-block"
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: dentroDoLimite ? "#6B7400" : "#8B1A1A",
          backgroundColor: dentroDoLimite ? "rgba(212,230,0,0.12)" : "#FDF0F0",
          padding: "3px 10px",
          borderRadius: 99,
          marginTop: 8,
        }}
      >
        {dentroDoLimite ? "Dentro do limite" : "Proximo do limite"}
      </span>
    </div>
  );
}
