"use client";

import Link from "next/link";

export default function Error({ reset }) {
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

        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#1C1C1C",
            letterSpacing: "-0.03em",
          }}
        >
          Algo deu errado
        </h1>
        <p style={{ fontSize: 14, color: "#8A8A8A", marginTop: 8 }}>
          Tivemos um problema ao carregar esta pagina.
        </p>

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={reset}
            className="py-2.5 px-6 rounded-lg text-sm cursor-pointer transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "#1C1C1C",
              color: "#D4E600",
              fontWeight: 600,
              border: "none",
            }}
          >
            Tentar novamente
          </button>

          <Link
            href="/"
            style={{ fontSize: 14, color: "#8A8A8A", textDecoration: "underline" }}
          >
            Voltar para o inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
