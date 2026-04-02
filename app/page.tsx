import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "#F7F7F5" }}
    >
      <div className="flex flex-col items-center gap-8" style={{ maxWidth: 420, padding: "0 20px" }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center font-bold"
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              backgroundColor: "#D4E600",
              color: "#1C1C1C",
              fontSize: 20,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            G
          </div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#1C1C1C",
              fontFamily: "var(--font-dm-sans)",
              letterSpacing: "-0.03em",
            }}
          >
            Guiado
          </span>
        </div>

        {/* Texto */}
        <div className="text-center">
          <h1
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#1C1C1C",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Seu MEI sem complicação
          </h1>
          <p className="mt-3" style={{ fontSize: 16, color: "#8A8A8A", lineHeight: 1.6 }}>
            Acompanhe faturamento, DAS e obrigações em um só lugar.
            Como um amigo que entende de negócio.
          </p>
        </div>

        {/* Botões */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/entrar"
            className="flex items-center justify-center py-3 rounded-lg text-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "#1C1C1C",
              color: "#D4E600",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="flex items-center justify-center py-3 rounded-lg text-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#1C1C1C",
              fontWeight: 600,
              border: "1px solid #D6D6D6",
              textDecoration: "none",
            }}
          >
            Criar conta grátis
          </Link>
        </div>
      </div>
    </div>
  );
}
