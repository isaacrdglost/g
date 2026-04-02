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
      setErro("As senhas nao coincidem.");
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
            Comece agora, e gratis
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#8A8A8A",
              marginTop: 8,
              marginBottom: 36,
            }}
          >
            Crie sua conta e organize seu MEI em minutos.
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
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
                  placeholder="Min. 6 caracteres"
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
                <label
                  htmlFor="confirmar-senha"
                  className="text-sm"
                  style={{ fontWeight: 500, color: "#1C1C1C" }}
                >
                  Confirmar
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
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "1px solid #D6D6D6",
                    fontSize: 15,
                    color: "#1C1C1C",
                    backgroundColor: "#FFFFFF",
                  }}
                />
              </div>
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
              {carregando ? "Criando conta..." : "Criar conta gratis"}
            </button>
          </form>

          <p
            className="text-center mt-8"
            style={{ fontSize: 14, color: "#8A8A8A" }}
          >
            Ja tem conta?{" "}
            <Link
              href="/entrar"
              style={{ color: "#1C1C1C", fontWeight: 600, textDecoration: "none" }}
            >
              Entrar
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
            top: "15%",
            left: "10%",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,230,0,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 380, width: "100%", position: "relative", zIndex: 1 }}>
          {/* Steps visuais */}
          <div className="flex flex-col gap-5">
            {[
              { step: "1", titulo: "Cadastre seu CNPJ", desc: "Buscamos seus dados automaticamente na Receita Federal." },
              { step: "2", titulo: "Acompanhe seu DAS", desc: "Saiba o valor, o vencimento e gere o boleto com 1 clique." },
              { step: "3", titulo: "Controle o faturamento", desc: "Lance suas entradas e acompanhe o limite de R$ 81.000." },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  padding: "20px 20px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: i === 0 ? "#D4E600" : "rgba(255,255,255,0.08)",
                    color: i === 0 ? "#1C1C1C" : "rgba(255,255,255,0.5)",
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                    fontFamily: "var(--font-dm-mono)",
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>
                    {item.titulo}
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-10">
            {[
              { icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="10" height="7" rx="1.5" />
                  <path d="M4 6V4a3 3 0 016 0v2" />
                </svg>
              ), texto: "Dados seguros" },
              { icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 1l2 4h4l-3.5 3 1.5 4L7 9.5 3 12l1.5-4L1 5h4l2-4z" />
                </svg>
              ), texto: "100% gratis" },
              { icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="7" r="6" />
                  <path d="M5 7l1.5 1.5L9 5.5" />
                </svg>
              ), texto: "Sem burocracia" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {item.icon}
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
                  {item.texto}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
