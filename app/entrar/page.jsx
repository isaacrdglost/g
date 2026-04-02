"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

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
      className="min-h-screen flex"
      style={{ backgroundColor: "#F7F7F5" }}
    >
      {/* Lado esquerdo - Formulario */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ padding: "40px 24px" }}
      >
        <div className="w-full" style={{ maxWidth: 420 }}>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-12">
            <div
              className="flex items-center justify-center font-bold"
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                backgroundColor: "#D4E600",
                color: "#1C1C1C",
                fontSize: 16,
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              G
            </div>
            <span
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "#1C1C1C",
                fontFamily: "var(--font-dm-sans)",
                letterSpacing: "-0.03em",
              }}
            >
              Guiado
            </span>
          </div>

          {/* Titulo */}
          <h1
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#1C1C1C",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            Bom te ver de volta!
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#8A8A8A",
              marginTop: 8,
              marginBottom: 36,
            }}
          >
            Entre na sua conta para acompanhar seu MEI.
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
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
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid #D6D6D6",
                  fontSize: 15,
                  color: "#1C1C1C",
                  backgroundColor: "#FFFFFF",
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="senha"
                  className="text-sm"
                  style={{ fontWeight: 500, color: "#1C1C1C" }}
                >
                  Senha
                </label>
                <Link
                  href="/esqueci-senha"
                  className="text-xs"
                  style={{ color: "#8A8A8A", textDecoration: "none" }}
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                id="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                className="outline-none"
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid #D6D6D6",
                  fontSize: 15,
                  color: "#1C1C1C",
                  backgroundColor: "#FFFFFF",
                }}
              />
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
              className="py-3.5 rounded-xl text-sm cursor-pointer btn-primary disabled:opacity-50"
              style={{
                backgroundColor: "#1C1C1C",
                color: "#D4E600",
                fontWeight: 600,
                fontSize: 15,
                border: "none",
                marginTop: 4,
              }}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p
            className="text-center mt-8"
            style={{ fontSize: 14, color: "#8A8A8A" }}
          >
            Ainda nao tem conta?{" "}
            <Link
              href="/cadastro"
              style={{ color: "#1C1C1C", fontWeight: 600, textDecoration: "none" }}
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>

      {/* Lado direito - Visual */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center"
        style={{
          backgroundColor: "#1C1C1C",
          borderRadius: "32px 0 0 32px",
          padding: "60px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow decorativo */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "-10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,230,0,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-5%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,230,0,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 400, width: "100%", position: "relative", zIndex: 1 }}>
          {/* Card mockup do dashboard */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: "28px 24px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Header do card */}
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Limite anual
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#D4E600",
                  backgroundColor: "rgba(212,230,0,0.12)",
                  padding: "3px 8px",
                  borderRadius: 99,
                  fontWeight: 500,
                }}
              >
                Dentro do limite
              </span>
            </div>

            {/* Valor grande */}
            <div className="flex items-baseline gap-2">
              <span
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                59%
              </span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
                utilizado
              </span>
            </div>

            {/* Barra de progresso */}
            <div
              style={{
                height: 8,
                borderRadius: 99,
                backgroundColor: "rgba(255,255,255,0.08)",
                marginTop: 16,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "59%",
                  height: "100%",
                  borderRadius: 99,
                  backgroundColor: "#D4E600",
                }}
              />
            </div>

            <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
              <span
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                R$ 47.800
              </span>
              <span
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                R$ 81.000
              </span>
            </div>
          </div>

          {/* Mini cards */}
          <div className="grid grid-cols-2 gap-3" style={{ marginTop: 16 }}>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "16px 16px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                DAS do mes
              </span>
              <p
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  marginTop: 6,
                }}
              >
                R$ 71,60
              </p>
              <span
                className="inline-flex items-center gap-1 mt-2"
                style={{
                  fontSize: 11,
                  color: "#8A8A8A",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  padding: "2px 6px",
                  borderRadius: 99,
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: 99, backgroundColor: "#8A8A8A", display: "inline-block" }} />
                Pago
              </span>
            </div>

            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "16px 16px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Faturamento
              </span>
              <p
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  marginTop: 6,
                }}
              >
                R$ 6.500
              </p>
              <span
                className="inline-flex items-center gap-1 mt-2"
                style={{
                  fontSize: 11,
                  color: "#D4E600",
                  backgroundColor: "rgba(212,230,0,0.12)",
                  padding: "2px 6px",
                  borderRadius: 99,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#D4E600" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1 7l3-3 2 2 3-4" />
                </svg>
                +12%
              </span>
            </div>
          </div>

          {/* Grafico simplificado */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "16px 16px",
              border: "1px solid rgba(255,255,255,0.08)",
              marginTop: 12,
            }}
          >
            <div className="flex items-end justify-between gap-2" style={{ height: 60 }}>
              {[35, 50, 30, 65, 45, 55, 70, 40, 60, 48, 72, 58].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: 3,
                    backgroundColor: i === 11 ? "#D4E600" : "rgba(255,255,255,0.08)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Tagline */}
          <p
            className="text-center"
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 13,
              marginTop: 28,
              fontWeight: 500,
            }}
          >
            Seu MEI organizado, sem complicacao.
          </p>
        </div>
      </div>
    </div>
  );
}
