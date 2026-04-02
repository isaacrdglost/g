import Link from "next/link";

const STATUS_STYLES = {
  pendente: { label: "Pendente", color: "#7A5A00", bg: "#FFF3CD" },
  pago: { label: "Pago", color: "#8A8A8A", bg: "#F3F3F3" },
  atrasado: { label: "Atrasado", color: "#8B1A1A", bg: "#FDF0F0" },
};

const MESES_LABEL = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

export default function DasHistorico({ registros = [] }) {
  const historico = registros.slice(0, 6);

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EBEBEB",
        borderRadius: 16,
        padding: "24px 24px",
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
          Historico DAS
        </span>

        <Link
          href="/dashboard/das"
          className="text-xs"
          style={{
            color: "#6B7400",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Ver todos
        </Link>
      </div>

      <div className="flex flex-col" style={{ marginTop: 16 }}>
        {historico.length === 0 && (
          <p style={{ fontSize: 13, color: "#D6D6D6", padding: "12px 0" }}>
            Nenhum registro de DAS ainda
          </p>
        )}
        {historico.map((item, i) => {
          const estilo = STATUS_STYLES[item.status] || STATUS_STYLES.pendente;
          // Parsear direto da string pra evitar problemas de fuso
          const [anoStr, mesStr] = (item.competencia || "").split("-");
          const mesIndex = parseInt(mesStr, 10) - 1;
          const mesLabel = MESES_LABEL[mesIndex] || "???";
          const ano = anoStr;

          return (
            <div
              key={item.id || i}
              className="flex items-center justify-between"
              style={{
                padding: "10px 0",
                borderBottom:
                  i < historico.length - 1 ? "1px solid #F3F3F3" : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: "#F7F7F5",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#8A8A8A",
                    letterSpacing: "0.02em",
                  }}
                >
                  {mesLabel}
                </div>

                <div>
                  <span
                    className="block"
                    style={{ fontSize: 13, fontWeight: 500, color: "#1C1C1C" }}
                  >
                    {mesLabel.charAt(0) + mesLabel.slice(1).toLowerCase()}/{ano}
                  </span>
                  <span
                    className="block"
                    style={{
                      fontSize: 12,
                      fontFamily: "var(--font-dm-mono)",
                      color: "#D6D6D6",
                    }}
                  >
                    {Number(item.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>

              <span
                className="flex items-center gap-1.5"
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: estilo.color,
                  backgroundColor: estilo.bg,
                  padding: "3px 10px",
                  borderRadius: 99,
                }}
              >
                <span
                  className="inline-block rounded-full"
                  style={{ width: 5, height: 5, backgroundColor: estilo.color }}
                />
                {estilo.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
