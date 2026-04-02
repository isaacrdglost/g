"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome_completo: nome.trim() },
      },
    });

    if (error) {
      setErro("Erro ao criar conta. Tente novamente.");
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
            Criar sua conta
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="nome"
                className="text-sm"
                style={{ fontWeight: 500, color: "#1C1C1C" }}
              >
                Seu nome
              </label>
              <input
                id="nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como quer ser chamado"
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
              <label
                htmlFor="senha"
                className="text-sm"
                style={{ fontWeight: 500, color: "#1C1C1C" }}
              >
                Senha
              </label>
              <input
                id="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
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
              <label
                htmlFor="confirmar-senha"
                className="text-sm"
                style={{ fontWeight: 500, color: "#1C1C1C" }}
              >
                Confirmar senha
              </label>
              <input
                id="confirmar-senha"
                type="password"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha"
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
              {carregando ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        </div>

        {/* Link para login */}
        <p
          className="text-center mt-5"
          style={{ fontSize: 14, color: "#8A8A8A" }}
        >
          Já tem conta?{" "}
          <Link
            href="/entrar"
            style={{ color: "#1C1C1C", fontWeight: 500, textDecoration: "underline" }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
