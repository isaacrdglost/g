"use client";

import { useState } from "react";
import ModalTicket from "./ModalTicket";

export default function BotaoSuporte() {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      {/* Botao flutuante */}
      <button
        onClick={() => setAberto(true)}
        className="cursor-pointer"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: "#D4500A",
          border: "none",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(212,80,10,0.35), 0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 40,
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 28px rgba(212,80,10,0.45), 0 2px 8px rgba(0,0,0,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(212,80,10,0.35), 0 2px 8px rgba(0,0,0,0.15)";
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </button>

      <ModalTicket aberto={aberto} onFechar={() => setAberto(false)} />
    </>
  );
}
