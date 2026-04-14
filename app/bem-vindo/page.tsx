"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import AuthMapBg from "@/components/AuthMapBg";

type Estado = "carregando" | "confirmado" | "nao-logado" | "timeout";

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

      // Verificar pending activations (comprou antes de ter conta)
      try {
        const { data: pending } = await supabase
          .from("hubla_pending_activations")
          .select("id, hubla_member_id")
          .eq("email", user.email)
          .limit(1);

        if (pending && pending.length > 0) {
          // Ativar Pro
          await supabase.from("profiles").update({
            plano: "pro",
            hubla_member_id: pending[0].hubla_member_id,
          }).eq("id", user.id);
          // Remover da fila
          await supabase.from("hubla_pending_activations").delete().eq("id", pending[0].id);
          setEstado("confirmado");
          return;
        }
      } catch {}

      // Buscar perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("plano")
        .eq("id", user.id)
        .single();

      if (profile?.plano === "pro" || profile?.plano === "anual") {
        setEstado("confirmado");
        return;
      }

      // Webhook pode demorar - poll a cada 2s por ate 60s
      let elapsed = 0;
      intervalRef.current = setInterval(async () => {
        elapsed += 2000;
        const { data } = await supabase
          .from("profiles")
          .select("plano")
          .eq("id", user.id)
          .single();

        if (data?.plano === "pro" || data?.plano === "anual") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setEstado("confirmado");
        } else if (elapsed >= 60000) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setEstado("timeout");
        }
      }, 2000);
    }

    verificar();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Nao logado
  if (estado === "nao-logado") {
    return (
      <div className="auth-bg flex items-center justify-center" style={{ padding: 16 }}>
        <AuthMapBg />
        <div
          className="flex flex-col items-center gap-6"
          style={{
            position: "relative", zIndex: 1, maxWidth: 440, textAlign: "center",
            backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24, padding: "48px 40px",
          }}
        >
          <img src="/logo-v1-dark.svg" alt="Guiado" style={{ width: 48, height: 48, borderRadius: 12 }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#FAF8F5", letterSpacing: "-0.03em" }}>
            Sua compra foi confirmada
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            Entre ou crie sua conta para ativar o Pro. Use o mesmo email que voce usou na compra.
          </p>
          <div className="flex gap-3 w-full">
            <Link
              href="/entrar"
              className="flex-1 flex items-center justify-center"
              style={{ padding: "14px 24px", borderRadius: 12, backgroundColor: "#D4500A", color: "#FFFFFF", fontWeight: 600, fontSize: 15, textDecoration: "none" }}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="flex-1 flex items-center justify-center"
              style={{ padding: "14px 24px", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#FAF8F5", fontWeight: 600, fontSize: 15, textDecoration: "none" }}
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Carregando
  if (estado === "carregando") {
    return (
      <div className="auth-bg flex items-center justify-center" style={{ padding: 16 }}>
        <AuthMapBg />
        <div className="flex flex-col items-center gap-5" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#D4500A", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 17, fontWeight: 600, color: "#FAF8F5" }}>Confirmando sua assinatura...</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Isso pode levar alguns segundos.</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Timeout - compra nao confirmada em 60s
  if (estado === "timeout") {
    return (
      <div className="auth-bg flex items-center justify-center" style={{ padding: 16 }}>
        <AuthMapBg />
        <div
          className="flex flex-col items-center gap-6"
          style={{ position: "relative", zIndex: 1, maxWidth: 480, textAlign: "center",
            backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24, padding: "48px 40px",
          }}
        >
          <img src="/logo-v1-dark.svg" alt="Guiado" style={{ width: 48, height: 48, borderRadius: 12 }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FAF8F5", letterSpacing: "-0.03em" }}>
            Sua compra esta sendo processada
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            Assim que confirmar, seu Pro sera ativado automaticamente. Pode levar alguns minutos.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full cursor-pointer"
            style={{ maxWidth: 340, padding: "14px 32px", borderRadius: 14, backgroundColor: "#D4500A", color: "#FFFFFF", fontWeight: 600, fontSize: 15, border: "none" }}
          >
            Acessar dashboard mesmo assim
          </button>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
            Se demorar mais de 1 hora,{" "}
            <Link href="/dashboard/conta?aba=suporte" style={{ color: "#D4500A", textDecoration: "none", fontWeight: 600 }}>
              abra um chamado de suporte
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Confirmado
  const features = [
    "Historico completo de DAS automatico",
    "Lancamentos ilimitados",
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
        style={{ position: "relative", zIndex: 1, maxWidth: 480, textAlign: "center", animation: "fadeIn 0.5s ease-out" }}
      >
        <img src="/logo-v1-dark.svg" alt="Guiado" style={{ width: 56, height: 56, borderRadius: 14 }} />
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#FAF8F5", letterSpacing: "-0.03em" }}>
            Bem-vindo ao Pro!
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.6 }}>
            Sua assinatura esta ativa. Veja o que voce desbloqueou:
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full" style={{ textAlign: "left", maxWidth: 340, margin: "0 auto" }}>
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: "rgba(212,80,10,0.15)" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7l3 3 5-5" />
                </svg>
              </div>
              <span style={{ fontSize: 15, color: "#FAF8F5" }}>{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full cursor-pointer"
          style={{ maxWidth: 340, padding: "16px 32px", borderRadius: 14, backgroundColor: "#D4500A", color: "#FFFFFF", fontWeight: 600, fontSize: 16, border: "none" }}
        >
          Acessar meu dashboard
        </button>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
