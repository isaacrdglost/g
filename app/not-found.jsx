import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F7F7F5" }}
    >
      <div className="text-center" style={{ maxWidth: 400, padding: "0 20px" }}>
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="flex items-center justify-center font-bold text-base"
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              backgroundColor: "#D4E600",
              color: "#1C1C1C",
            }}
          >
            G
          </div>
          <span style={{ fontSize: 20, fontWeight: 600, color: "#1C1C1C", letterSpacing: "-0.03em" }}>
            Guiado
          </span>
        </div>

        <p
          style={{
            fontSize: 72,
            fontWeight: 300,
            color: "#EBEBEB",
            fontFamily: "var(--font-dm-mono)",
            lineHeight: 1,
          }}
        >
          404
        </p>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#1C1C1C",
            letterSpacing: "-0.03em",
            marginTop: 16,
          }}
        >
          Pagina nao encontrada
        </h1>
        <p style={{ fontSize: 14, color: "#8A8A8A", marginTop: 8 }}>
          Essa pagina nao existe ou foi removida.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center mt-6 py-2.5 px-6 rounded-lg text-sm transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#1C1C1C",
            color: "#D4E600",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Voltar para o inicio
        </Link>
      </div>
    </div>
  );
}
