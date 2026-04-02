export default function ResumoCard({ label, valor, cor, mono }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #D6D6D6",
        borderRadius: 12,
        padding: "18px 20px",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#8A8A8A",
        }}
      >
        {label}
      </span>
      <p
        className="mt-1.5"
        style={{
          fontSize: mono ? 18 : 24,
          fontWeight: mono ? 700 : 600,
          color: cor || "#1C1C1C",
          fontFamily: mono ? "var(--font-dm-mono)" : "var(--font-dm-sans)",
          letterSpacing: mono ? 0 : "-0.03em",
        }}
      >
        {valor}
      </p>
    </div>
  );
}
