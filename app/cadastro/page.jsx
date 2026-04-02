"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import AuthMapBg from "@/components/AuthMapBg";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
            <div
              className="flex items-center justify-center font-bold"
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                backgroundColor: "#E05E1A",
                color: "#1C1C1C",
                fontSize: 15,
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

          {/* Titulo */}
          <h1
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#1C1C1C",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Criar conta
          </h1>
          <p style={{ fontSize: 15, color: "#8A8A8A", marginTop: 8 }}>
            Ja tem conta?{" "}
            <Link
              href="/entrar"
              style={{ color: "#1C1C1C", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              Entrar
            </Link>
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: 32 }}>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="nome"
                style={{ fontSize: 13, fontWeight: 500, color: "#8A8A8A" }}
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
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid #EBEBEB",
                  fontSize: 15,
                  color: "#1C1C1C",
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                style={{ fontSize: 13, fontWeight: 500, color: "#8A8A8A" }}
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
                  border: "1px solid #EBEBEB",
                  fontSize: 15,
                  color: "#1C1C1C",
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="senha"
                  style={{ fontSize: 13, fontWeight: 500, color: "#8A8A8A" }}
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
                    placeholder="Min. 6 caracteres"
                    className="outline-none w-full"
                    style={{
                      padding: "14px 40px 14px 16px",
                      borderRadius: 12,
                      border: "1px solid #EBEBEB",
                      fontSize: 15,
                      color: "#1C1C1C",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="cursor-pointer"
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#D6D6D6",
                      padding: 2,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" />
                      <circle cx="8" cy="8" r="1.5" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirmar-senha"
                  style={{ fontSize: 13, fontWeight: 500, color: "#8A8A8A" }}
                >
                  Confirmar
                </label>
                <input
                  id="confirmar-senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha"
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
                backgroundColor: "#E05E1A",
                color: "#1C1C1C",
                fontWeight: 600,
                fontSize: 15,
                border: "none",
                marginTop: 4,
              }}
            >
              {carregando ? "Criando conta..." : "Criar conta gratis"}
            </button>
          </form>
        </div>

        {/* Lado direito */}
        <div
          className="hidden lg:flex flex-col justify-between"
          style={{
            width: 420,
            backgroundColor: "#1C1C1C",
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
              top: "30%",
              left: "-10%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(224,94,26,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Top */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <span
              style={{
                fontSize: 11,
                color: "#E05E1A",
                backgroundColor: "rgba(224,94,26,0.12)",
                padding: "4px 10px",
                borderRadius: 99,
                fontWeight: 500,
              }}
            >
              Gratis para sempre
            </span>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-4" style={{ position: "relative", zIndex: 1 }}>
            {[
              { n: "1", t: "Cadastre seu CNPJ", d: "Buscamos seus dados na Receita Federal automaticamente." },
              { n: "2", t: "Acompanhe seu DAS", d: "Valor, vencimento e boleto com 1 clique." },
              { n: "3", t: "Controle tudo", d: "Faturamento, limite anual e obrigacoes em um lugar." },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: i === 0 ? "#E05E1A" : "rgba(255,255,255,0.06)",
                    color: i === 0 ? "#1C1C1C" : "rgba(255,255,255,0.4)",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "var(--font-dm-mono)",
                    flexShrink: 0,
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#F2EFE9" }}>{s.t}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3, lineHeight: 1.4 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-center gap-5" style={{ position: "relative", zIndex: 1 }}>
            {["Dados seguros", "Sem burocracia", "100% gratis"].map((t, i) => (
              <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
