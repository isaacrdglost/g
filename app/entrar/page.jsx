"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import AuthMapBg from "@/components/AuthMapBg";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("Email ou senha incorretos. Tente novamente.");
      setCarregando(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div
      className="auth-bg flex items-center justify-center"
      style={{ padding: 16 }}
    >
      <AuthMapBg />
      <div
        className="flex w-full overflow-hidden"
        style={{
          maxWidth: 1000,
          height: 660,
          borderRadius: 24,
          backgroundColor: "#F2EFE9",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Lado esquerdo - Formulario */}
        <div
          className="flex-1 flex flex-col justify-center"
          style={{ padding: "48px 56px" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5" style={{ marginBottom: 48 }}>
            <img src="/logo-icon-dark.svg" alt="Guiado" style={{ width: 34, height: 34, borderRadius: 9 }} />
            <span style={{ fontSize: 20, fontWeight: 600, color: "#2A1F14", fontFamily: "var(--font-dm-sans)", letterSpacing: "-0.03em" }}>
              Guiado
            </span>
          </div>

          {/* Titulo */}
          <h1
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#2A1F14",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Entrar
          </h1>
          <p style={{ fontSize: 15, color: "#7A6255", marginTop: 8 }}>
            Ainda nao tem conta?{" "}
            <Link
              href="/cadastro"
              style={{ color: "#2A1F14", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              Cadastre-se
            </Link>
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" style={{ marginTop: 36 }}>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                style={{ fontSize: 13, fontWeight: 500, color: "#7A6255" }}
              >
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
                  border: "1px solid #E8E3DA",
                  fontSize: 15,
                  color: "#2A1F14",
                  backgroundColor: "#F2EFE9",
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="senha"
                style={{ fontSize: 13, fontWeight: 500, color: "#7A6255" }}
              >
                Senha
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="outline-none w-full"
                  style={{
                    padding: "14px 48px 14px 16px",
                    borderRadius: 12,
                    border: "1px solid #E8E3DA",
                    fontSize: 15,
                    color: "#2A1F14",
                    backgroundColor: "#F2EFE9",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="cursor-pointer"
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#C8C2B8",
                    padding: 4,
                  }}
                >
                  {mostrarSenha ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 2l14 14M7.6 7.6a2 2 0 002.8 2.8" />
                      <path d="M3.5 5.5C2.2 6.8 1.2 8.5 1 9c.7 1.5 3.5 6 8 6 1.2 0 2.3-.3 3.2-.8M14.5 12.5C15.8 11.2 16.8 9.5 17 9c-.7-1.5-3.5-6-8-6-.8 0-1.6.1-2.3.4" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 9s3.5-6 8-6 8 6 8 6-3.5 6-8 6-8-6-8-6z" />
                      <circle cx="9" cy="9" r="2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 13, color: "#7A6255" }}>
                <input
                  type="checkbox"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    accentColor: "#D4500A",
                  }}
                />
                Lembrar de mim
              </label>
              <Link
                href="/esqueci-senha"
                style={{ fontSize: 13, color: "#2A1F14", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                Esqueceu a senha?
              </Link>
            </div>

            {erro && (
              <p
                className="text-sm"
                style={{
                  color: "#E05252",
                  backgroundColor: "#FDF0F0",
                  padding: "10px 14px",
                  borderRadius: 10,
                }}
              >
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="py-3.5 rounded-xl cursor-pointer btn-primary disabled:opacity-50"
              style={{
                backgroundColor: "#D4500A",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 15,
                border: "none",
              }}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Lado direito - Visual escuro */}
        <div
          className="hidden lg:flex flex-col justify-between"
          style={{
            width: 420,
            backgroundColor: "#2A1F14",
            borderRadius: "20px",
            margin: 12,
            padding: "36px 32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              top: "-10%",
              right: "-20%",
              width: 350,
              height: 350,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,80,10,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "5%",
              left: "-15%",
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,80,10,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Top - Support link */}
          <div className="flex justify-end" style={{ position: "relative", zIndex: 1 }}>
            <span
              className="flex items-center gap-1.5"
              style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7" cy="7" r="6" />
                <path d="M5.5 5.5a1.5 1.5 0 013 0c0 1-1.5 1-1.5 2M7 10h.01" />
              </svg>
              Ajuda
            </span>
          </div>

          {/* Card central */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Card promo */}
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "24px 22px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#F2EFE9",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                Seu MEI organizado com seguranca
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.5 }}>
                Acompanhe faturamento, DAS e obrigacoes. Dados direto da Receita Federal, tudo em um lugar.
              </p>
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-1.5 mt-4"
                style={{
                  fontSize: 13,
                  color: "#2A1F14",
                  backgroundColor: "#D4500A",
                  padding: "8px 16px",
                  borderRadius: 99,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Conhecer
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 6h8M7 3l3 3-3 3" />
                </svg>
              </Link>
            </div>

            {/* Mini stat flutuante */}
            <div
              className="flex items-center gap-3"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "12px 16px",
                border: "1px solid rgba(255,255,255,0.08)",
                marginTop: 12,
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: "rgba(212,80,10,0.15)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#D4500A" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 12l4-4 3 3 5-7" />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Faturamento
                </span>
                <p
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#F2EFE9",
                    marginTop: 1,
                  }}
                >
                  R$ 47.800
                </p>
              </div>
            </div>
          </div>

          {/* Bottom - Features */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <p
              className="text-center"
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#F2EFE9",
                marginBottom: 6,
              }}
            >
              Tudo que o seu MEI precisa
            </p>
            <p
              className="text-center"
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                lineHeight: 1.5,
              }}
            >
              Controle de faturamento, DAS em dia e situacao cadastral atualizados automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
