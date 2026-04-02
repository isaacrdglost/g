import Link from "next/link";
import AuthMapBg from "@/components/AuthMapBg";

export default function NotFound() {
  return (
    <div
      className="auth-bg flex items-center justify-center"
      style={{ padding: 16 }}
    >
      <AuthMapBg />
      <div
        className="text-center"
        style={{
          maxWidth: 420,
          backgroundColor: "#F2EFE9",
          borderRadius: 24,
          padding: "56px 48px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div
            className="flex items-center justify-center font-bold"
            style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: "#FF5C00", color: "#1C1C1C", fontSize: 15 }}
          >
            G
          </div>
          <span style={{ fontSize: 20, fontWeight: 600, color: "#1C1C1C", letterSpacing: "-0.03em" }}>
            Guiado
          </span>
        </div>

        <p
          style={{
            fontSize: 80,
            fontWeight: 300,
            color: "#F3F3F3",
            fontFamily: "var(--font-dm-mono)",
            lineHeight: 1,
          }}
        >
          404
        </p>

        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1C1C1C", letterSpacing: "-0.03em", marginTop: 16 }}>
          Pagina nao encontrada
        </h1>
        <p style={{ fontSize: 14, color: "#8A8A8A", marginTop: 8 }}>
          Essa pagina nao existe ou foi removida.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center w-full mt-8 py-3.5 rounded-xl text-sm btn-primary"
          style={{ backgroundColor: "#FF5C00", color: "#1C1C1C", fontWeight: 600, fontSize: 15, textDecoration: "none" }}
        >
          Voltar para o inicio
        </Link>
      </div>
    </div>
  );
}
