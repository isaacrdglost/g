"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import AuthMapBg from "@/components/AuthMapBg";

type Estado = "carregando" | "confirmado" | "nao-logado";

export default function BemVindoPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("carregando");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setEstado("nao-logado");
        return;
      }

      // Buscar perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("plano")
        .eq("id", user.id)
        .single();

      if (profile?.plano === "pro") {
        setEstado("confirmado");
        return;
      }

      // Webhook pode demorar - poll a cada 2s por ate 30s
      intervalRef.current = setInterval(async () => {
        const { data } = await supabase
          .from("profiles")
          .select("plano")
          .eq("id", user.id)
          .single();

        if (data?.plano === "pro") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setEstado("confirmado");
        }
      }, 2000);

      setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }, 30000);
    }

    verificar();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Estado: nao logado
  if (estado === "nao-logado") {
    return (
      <div className="auth-bg flex items-center justify-center" style={{ padding: 16 }}>
        <AuthMapBg />
        <div
          className="flex flex-col items-center gap-6"
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 440,
            textAlign: "center",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: "48px 40px",
          }}
        >
          <img src="/logo-v1-dark.svg" alt="Guiado" style={{ width: 48, height: 48, borderRadius: 12 }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#FAF8F5", letterSpacing: "-0.03em" }}>
            Sua compra foi confirmada
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            Entre ou crie sua conta para ativar o Pro.
          </p>
          <div className="flex gap-3 w-full">
            <Link
              href="/entrar"
              className="flex-1 flex items-center justify-center"
              style={{
                padding: "14px 24px",
                borderRadius: 12,
                backgroundColor: "#D4500A",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="flex-1 flex items-center justify-center"
              style={{
                padding: "14px 24px",
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#FAF8F5",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Estado: carregando (aguardando confirmacao)
  if (estado === "carregando") {
    return (
      <div className="auth-bg flex items-center justify-center" style={{ padding: 16 }}>
        <AuthMapBg />
        <div
          className="flex flex-col items-center gap-5"
          style={{ position: "relative", zIndex: 1, textAlign: "center" }}
        >
          {/* Spinner */}
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid rgba(255,255,255,0.1)",
              borderTopColor: "#D4500A",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 17, fontWeight: 600, color: "#FAF8F5" }}>
            Confirmando sua assinatura...
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
            Isso pode levar alguns segundos.
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Estado: confirmado - tela de boas-vindas
  const features = [
    "Historico completo de faturamento",
    "Alertas inteligentes",
    "Projecao de limite anual",
    "Documentos do CNPJ em 1 clique",
    "Suporte prioritario",
  ];

  return (
    <div className="auth-bg flex items-center justify-center" style={{ padding: 16 }}>
      <AuthMapBg />
      <div
        className="flex flex-col items-center gap-8"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 480,
          textAlign: "center",
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        {/* Logo */}
        <img src="/logo-v1-dark.svg" alt="Guiado" style={{ width: 56, height: 56, borderRadius: 14 }} />

        {/* Titulo */}
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#FAF8F5", letterSpacing: "-0.03em" }}>
            Bem-vindo ao Pro!
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.6 }}>
            Sua assinatura esta ativa. Veja o que voce desbloqueou:
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-3 w-full" style={{ textAlign: "left", maxWidth: 340, margin: "0 auto" }}>
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  backgroundColor: "rgba(212,80,10,0.15)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7l3 3 5-5" />
                </svg>
              </div>
              <span style={{ fontSize: 15, color: "#FAF8F5", fontWeight: 400 }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Botao */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full cursor-pointer"
          style={{
            maxWidth: 340,
            padding: "16px 32px",
            borderRadius: 14,
            backgroundColor: "#D4500A",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 16,
            border: "none",
            letterSpacing: "-0.01em",
          }}
        >
          Acessar meu dashboard
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
