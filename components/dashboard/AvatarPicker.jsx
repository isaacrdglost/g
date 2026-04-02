"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AVATARS } from "@/lib/avatars";

export default function AvatarPicker({ aberto, onFechar, avatarAtual, onSelecionar }) {
  const [selecionado, setSelecionado] = useState(avatarAtual || "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (aberto) {
      setSelecionado(avatarAtual || "");
    }
  }, [aberto, avatarAtual]);

  // Bloquear scroll do body quando aberto
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [aberto]);

  if (!mounted || !aberto) return null;

  function handleConfirmar() {
    if (selecionado) {
      onSelecionar(selecionado);
    }
    onFechar();
  }

  const modal = (
    <div
      onClick={onFechar}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        animation: "fadeIn 0.2s ease-out",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#141414",
          borderRadius: 20,
          maxWidth: 480,
          width: "100%",
          padding: "28px 28px 24px",
          animation: "fadeIn 0.25s ease-out",
        }}
      >
        {/* Header */}
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#FAF8F5",
            fontFamily: "var(--font-dm-sans)",
            marginBottom: 6,
          }}
        >
          Escolha seu avatar
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.5,
            marginBottom: 24,
          }}
        >
          Cada personagem representa um espirito de aventura diferente
        </p>

        {/* Grid de avatares */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {AVATARS.map((avatar) => {
            const isSelected = selecionado === avatar.id;
            return (
              <button
                key={avatar.id}
                onClick={() => setSelecionado(avatar.id)}
                className="cursor-pointer"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: isSelected
                      ? "2px solid #D4500A"
                      : "2px solid transparent",
                    opacity: isSelected ? 1 : 0.7,
                    boxShadow: isSelected
                      ? "0 0 12px rgba(212,80,10,0.3)"
                      : "none",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.border = "2px solid rgba(212,80,10,0.3)";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.opacity = "0.7";
                      e.currentTarget.style.border = "2px solid transparent";
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/avatars/${avatar.id}.svg`}
                    alt={avatar.nome}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.4)",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {avatar.nome}
                </span>
              </button>
            );
          })}
        </div>

        {/* Botao confirmar */}
        <button
          onClick={handleConfirmar}
          disabled={!selecionado}
          className="w-full cursor-pointer"
          style={{
            backgroundColor: "#D4500A",
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 600,
            padding: "12px 0",
            borderRadius: 12,
            border: "none",
            transition: "opacity 0.15s ease",
            opacity: selecionado ? 1 : 0.5,
          }}
          onMouseEnter={(e) => { if (selecionado) e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={(e) => { if (selecionado) e.currentTarget.style.opacity = "1"; }}
        >
          Confirmar
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
