export default function ResumoCard({ label, valor, cor, mono }) {
  return (
    <div
      className="card-hover"
      style={{
        backgroundColor: "#F2EFE9",
        border: "1px solid #C8C2B8",
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
          color: "#7A6255",
        }}
      >
        {label}
      </span>
      <p
        className="mt-1.5"
        style={{
          fontSize: mono ? 18 : 24,
          fontWeight: mono ? 700 : 600,
          color: cor || "#2A1F14",
          fontFamily: mono ? "var(--font-dm-mono)" : "var(--font-dm-sans)",
          letterSpacing: mono ? 0 : "-0.03em",
        }}
      >
        {valor}
      </p>
    </div>
  );
}
