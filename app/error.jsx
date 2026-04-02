"use client";

import Link from "next/link";

export default function Error({ reset }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#E8E8E4", padding: 16 }}
    >
      <div
        className="text-center"
        style={{
          maxWidth: 420,
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          padding: "56px 48px",
        }}
      >
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div
            className="flex items-center justify-center font-bold"
            style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: "#D4E600", color: "#1C1C1C", fontSize: 15 }}
          >
            G
          </div>
          <span style={{ fontSize: 20, fontWeight: 600, color: "#1C1C1C", letterSpacing: "-0.03em" }}>
            Guiado
          </span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1C1C1C", letterSpacing: "-0.03em" }}>
          Algo deu errado
        </h1>
        <p style={{ fontSize: 14, color: "#8A8A8A", marginTop: 8 }}>
          Tivemos um problema ao carregar esta pagina.
        </p>

        <div className="flex flex-col gap-3 mt-8">
          <button
            onClick={reset}
            className="py-3.5 rounded-xl cursor-pointer btn-primary"
            style={{ backgroundColor: "#1C1C1C", color: "#D4E600", fontWeight: 600, fontSize: 15, border: "none" }}
          >
            Tentar novamente
          </button>
          <Link href="/" style={{ fontSize: 14, color: "#8A8A8A", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Voltar para o inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
