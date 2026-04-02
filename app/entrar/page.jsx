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
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            G
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#1C1C1C",
              fontFamily: "var(--font-dm-sans)",
              letterSpacing: "-0.03em",
            }}
          >
            Guiado
          </span>
        </div>

        {/* Card do formulário */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D6D6D6",
            borderRadius: 12,
            padding: "32px 28px",
          }}
        >
          <h1
            className="text-center mb-6"
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#1C1C1C",
              letterSpacing: "-0.03em",
            }}
          >
            Entrar na sua conta
          </h1>

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
                  backgroundColor: "#FFFFFF",
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
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
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #D6D6D6",
                  fontSize: 14,
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
                marginTop: 4,
              }}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Link para cadastro */}
        <p
          className="text-center mt-5"
          style={{ fontSize: 14, color: "#8A8A8A" }}
        >
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            style={{ color: "#1C1C1C", fontWeight: 500, textDecoration: "underline" }}
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
