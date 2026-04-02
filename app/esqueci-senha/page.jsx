"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      setErro("Erro ao enviar o email. Tente novamente.");
      setCarregando(false);
      return;
    }

    setEnviado(true);
    setCarregando(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F7F7F5" }}
    >
      <div className="w-full" style={{ maxWidth: 400, padding: "0 20px" }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
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
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#1C1C1C",
              letterSpacing: "-0.03em",
            }}
          >
            Guiado
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D6D6D6",
            borderRadius: 12,
            padding: "32px 28px",
          }}
        >
          {enviado ? (
            <div className="text-center">
              <div
                className="flex items-center justify-center mx-auto mb-4"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 99,
                  backgroundColor: "rgba(212,230,0,0.12)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 12l4 4 8-8" />
                </svg>
              </div>
              <h1
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#1C1C1C",
                  letterSpacing: "-0.03em",
                }}
              >
                Email enviado
              </h1>
              <p style={{ fontSize: 14, color: "#8A8A8A", marginTop: 8, lineHeight: 1.5 }}>
                Verifique sua caixa de entrada para redefinir a senha. O link expira em 1 hora.
              </p>
            </div>
          ) : (
            <>
              <h1
                className="text-center mb-2"
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#1C1C1C",
                  letterSpacing: "-0.03em",
                }}
              >
                Recuperar senha
              </h1>
              <p className="text-center mb-6" style={{ fontSize: 14, color: "#8A8A8A" }}>
                Informe seu email para receber o link de recuperacao.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm"
                    style={{ fontWeight: 500, color: "#1C1C1C" }}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="outline-none"
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #D6D6D6",
                      fontSize: 14,
                      color: "#1C1C1C",
                    }}
                  />
                </div>

                {erro && (
                  <p
                    className="text-sm"
                    style={{
                      color: "#E05252",
                      backgroundColor: "#FDF0F0",
                      padding: "8px 12px",
                      borderRadius: 8,
                    }}
                  >
                    {erro}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={carregando}
                  className="py-2.5 rounded-lg text-sm cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: "#1C1C1C",
                    color: "#D4E600",
                    fontWeight: 600,
                    border: "none",
                  }}
                >
                  {carregando ? "Enviando..." : "Enviar link de recuperacao"}
                </button>
              </form>
            </>
          )}
        </div>

        <p
          className="text-center mt-5"
          style={{ fontSize: 14, color: "#8A8A8A" }}
        >
          <Link
            href="/entrar"
            style={{ color: "#1C1C1C", fontWeight: 500, textDecoration: "underline" }}
          >
            Voltar para login
          </Link>
        </p>
      </div>
    </div>
  );
}
