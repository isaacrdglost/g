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
          <img src="/logo-v3-light.svg" alt="Guiado" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <span style={{ fontSize: 20, fontWeight: 600, color: "#2A1F14", fontFamily: "var(--font-dm-sans)", letterSpacing: "-0.03em" }}>
              Guiado
            </span>
        </div>

        <p
          style={{
            fontSize: 80,
            fontWeight: 300,
            color: "#EDE8E0",
            fontFamily: "var(--font-dm-mono)",
            lineHeight: 1,
          }}
        >
          404
        </p>

        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#2A1F14", letterSpacing: "-0.03em", marginTop: 16 }}>
          Pagina nao encontrada
        </h1>
        <p style={{ fontSize: 14, color: "#7A6255", marginTop: 8 }}>
          Essa pagina nao existe ou foi removida.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center w-full mt-8 py-3.5 rounded-xl text-sm btn-primary"
          style={{ backgroundColor: "#D4500A", color: "#FFFFFF", fontWeight: 600, fontSize: 15, textDecoration: "none" }}
        >
          Voltar para o inicio
        </Link>
      </div>
    </div>
  );
}
