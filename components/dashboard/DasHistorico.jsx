const STATUS_STYLES = {
  pendente: {
    label: "Pendente",
    color: "#7A5A00",
    bg: "#FFF3CD",
  },
  pago: {
    label: "Pago",
    color: "#8A8A8A",
    bg: "#F3F3F3",
  },
  atrasado: {
    label: "Atrasado",
    color: "#8B1A1A",
    bg: "#FDF0F0",
  },
};

const MESES_LABEL = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

export default function DasHistorico({ registros = [] }) {
  // Pegar últimos 6 registros ordenados por competência desc
  const historico = registros.slice(0, 6);

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #D6D6D6",
        borderRadius: 12,
        padding: "22px 26px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#8A8A8A",
          }}
        >
          Histórico DAS
        </span>

        <button
          className="text-xs cursor-pointer"
          style={{
            color: "#6B7400",
            fontWeight: 500,
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          Ver todos
        </button>
      </div>

      {/* Lista */}
      <div className="flex flex-col mt-4 gap-0">
        {historico.length === 0 && (
          <p style={{ fontSize: 13, color: "#8A8A8A", padding: "12px 0" }}>
            Nenhum registro de DAS ainda
          </p>
        )}
        {historico.map((item, i) => {
          const estilo = STATUS_STYLES[item.status] || STATUS_STYLES.pendente;
          const data = new Date(item.competencia);
          const mesLabel = MESES_LABEL[data.getMonth()] || "???";
          const ano = data.getFullYear();

          return (
            <div
              key={item.id || i}
              className="flex items-center justify-between py-3"
              style={{
                borderBottom:
                  i < historico.length - 1 ? "1px solid #EBEBEB" : "none",
              }}
            >
              <div className="flex items-center gap-3">
                {/* Ícone do mês */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    backgroundColor: "#F3F3F3",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#1C1C1C",
                    letterSpacing: "0.02em",
                  }}
                >
                  {mesLabel}
                </div>

                <div>
                  <span
                    className="block text-sm"
                    style={{ fontWeight: 500, color: "#1C1C1C" }}
                  >
                    {mesLabel.charAt(0) + mesLabel.slice(1).toLowerCase()}/{ano}
                  </span>
                  <span
                    className="block"
                    style={{
                      fontSize: 12,
                      fontFamily: "var(--font-dm-mono)",
                      color: "#8A8A8A",
                    }}
                  >
                    {Number(item.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>

              {/* Pill de status */}
              <span
                className="flex items-center gap-1.5"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: estilo.color,
                  backgroundColor: estilo.bg,
                  padding: "3px 10px",
                  borderRadius: 99,
                }}
              >
                <span
                  className="inline-block rounded-full"
                  style={{ width: 6, height: 6, backgroundColor: estilo.color, flexShrink: 0 }}
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
