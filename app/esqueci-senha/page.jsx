"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import AuthMapBg from "@/components/AuthMapBg";

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
      className="auth-bg flex items-center justify-center"
      style={{ padding: 16 }}
    >
      <AuthMapBg />
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          padding: "48px 48px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5" style={{ marginBottom: 40 }}>
          <div
            className="flex items-center justify-center font-bold"
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              backgroundColor: "#CCA830",
              color: "#1C1C1C",
              fontSize: 15,
            }}
          >
            G
          </div>
          <span style={{ fontSize: 20, fontWeight: 600, color: "#1C1C1C", letterSpacing: "-0.03em" }}>
            Guiado
          </span>
        </div>

        {enviado ? (
          <div className="text-center">
            <div
              className="flex items-center justify-center mx-auto"
              style={{
                width: 52,
                height: 52,
                borderRadius: 99,
                backgroundColor: "rgba(204,168,48,0.12)",
                marginBottom: 20,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7A5A00" strokeWidth="2" strokeLinecap="round">
                <path d="M6 12l4 4 8-8" />
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1C1C1C", letterSpacing: "-0.03em" }}>
              Email enviado
            </h1>
            <p style={{ fontSize: 14, color: "#8A8A8A", marginTop: 10, lineHeight: 1.5 }}>
              Verifique sua caixa de entrada para redefinir a senha. O link expira em 1 hora.
            </p>
            <Link
              href="/entrar"
              className="inline-flex items-center justify-center w-full py-3.5 rounded-xl text-sm btn-primary"
              style={{
                backgroundColor: "#CCA830",
                color: "#1C1C1C",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                marginTop: 28,
              }}
            >
              Voltar para login
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 32, fontWeight: 600, color: "#1C1C1C", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Recuperar senha
            </h1>
            <p style={{ fontSize: 15, color: "#8A8A8A", marginTop: 8, marginBottom: 32 }}>
              Informe seu email para receber o link de recuperacao.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" style={{ fontSize: 13, fontWeight: 500, color: "#8A8A8A" }}>
                  E-mail
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
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid #EBEBEB",
                    fontSize: 15,
                    color: "#1C1C1C",
                  }}
                />
              </div>

              {erro && (
                <p className="text-sm" style={{ color: "#E05252", backgroundColor: "#FDF0F0", padding: "10px 14px", borderRadius: 10 }}>
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="py-3.5 rounded-xl cursor-pointer btn-primary disabled:opacity-50"
                style={{ backgroundColor: "#CCA830", color: "#1C1C1C", fontWeight: 600, fontSize: 15, border: "none" }}
              >
                {carregando ? "Enviando..." : "Enviar link de recuperacao"}
              </button>
            </form>

            <p className="text-center" style={{ fontSize: 14, color: "#8A8A8A", marginTop: 24 }}>
              <Link href="/entrar" style={{ color: "#1C1C1C", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
                Voltar para login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
