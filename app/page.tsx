"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div style={{ backgroundColor: "#FAF8F5", minHeight: "100vh" }}>

      {/* ========== NAV (Fixed Glass) ========== */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: scrolled ? "rgba(20,16,12,0.88)" : "rgba(20,16,12,0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(212,80,10,0.08)" : "1px solid transparent",
          transition: "all 0.4s ease",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px" }}
        >
          <div className="flex items-center gap-3">
            <img src="/logo-v1-dark.svg" alt="Guiado" style={{ width: 28, height: 28, borderRadius: 7 }} />
            <span style={{ fontSize: 19, fontWeight: 600, color: "#FFFFFF", fontFamily: "var(--font-dm-sans)", letterSpacing: "-0.03em" }}>
              Guiado
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Produto", href: "#features" },
              { label: "Precos", href: "#pricing" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/entrar"
              style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "8px 16px" }}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              style={{
                fontSize: 14, fontWeight: 600, color: "#FFFFFF", backgroundColor: "#D4500A",
                textDecoration: "none", padding: "10px 22px", borderRadius: 10,
                boxShadow: "0 0 20px rgba(212,80,10,0.25)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
            >
              Comecar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO (Dark, Full Viewport) ========== */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "#141414",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Noise texture */}
        <div
          style={{
            position: "absolute", inset: 0, opacity: 0.03,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            pointerEvents: "none",
          }}
        />

        {/* Background glow orbs */}
        <div style={{ position: "absolute", width: 800, height: 800, top: "-20%", left: "-15%", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,80,10,0.15) 0%, transparent 55%)", filter: "blur(100px)", pointerEvents: "none", animation: "orbDrift1 16s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 600, height: 600, bottom: "-10%", right: "10%", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,80,10,0.1) 0%, transparent 55%)", filter: "blur(100px)", pointerEvents: "none", animation: "orbDrift2 20s ease-in-out infinite" }} />

        {/* Map SVG background */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <svg viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <path d="M-50 200 C200 180, 350 350, 500 300 S750 150, 900 280 S1100 400, 1300 250 S1500 180, 1550 300" stroke="rgba(212,80,10,0.12)" strokeWidth="1" fill="none" strokeDasharray="8 6" />
            <path d="M-50 500 C150 480, 300 600, 500 550 S700 400, 850 500 S1050 650, 1250 550 S1400 450, 1550 520" stroke="rgba(212,80,10,0.1)" strokeWidth="1" fill="none" strokeDasharray="8 6" />
            <path d="M-50 750 C200 700, 400 800, 600 720 S850 600, 1000 700 S1200 800, 1550 680" stroke="rgba(212,80,10,0.08)" strokeWidth="1" fill="none" strokeDasharray="6 8" />
            <path d="M100 400 C250 350, 400 420, 550 380 S800 300, 950 380 S1150 480, 1350 400" stroke="rgba(212,80,10,0.18)" strokeWidth="1.5" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset="1" style={{ animation: "drawRoute 6s ease-in-out infinite alternate" }} />
            <circle cx="550" cy="380" r="3" fill="#D4500A" opacity="0.8">
              <animate attributeName="r" values="3;5;3" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="550" cy="380" r="14" stroke="rgba(212,80,10,0.3)" strokeWidth="0.8" fill="none">
              <animate attributeName="r" values="14;22;14" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle r="2" fill="#D4500A" opacity="0.8" style={{ offsetPath: "path('M100 400 C250 350, 400 420, 550 380 S800 300, 950 380 S1150 480, 1350 400')", animation: "travelRoute1 8s linear infinite" }} />
          </svg>
        </div>

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "140px 24px 100px", width: "100%" }}>
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left: Copy */}
            <div style={{ flex: "0 0 55%", maxWidth: 600 }}>
              <h1
                style={{
                  fontSize: "clamp(34px, 4.5vw, 52px)", fontWeight: 700, color: "#FFFFFF",
                  letterSpacing: "-0.035em", lineHeight: 1.1, marginTop: 28,
                  fontFamily: "var(--font-dm-sans)",
                  opacity: 0, animation: "heroFadeUp 0.8s ease forwards", animationDelay: "0.35s",
                }}
              >
                Voce manda bem no que faz. A gente cuida do seu CNPJ.
              </h1>

              <p
                style={{
                  fontSize: "clamp(16px, 1.8vw, 18px)", color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.7, marginTop: 24, maxWidth: 480,
                  opacity: 0, animation: "heroFadeUp 0.8s ease forwards", animationDelay: "0.5s",
                }}
              >
                Limite anual, DAS, notas, obrigacoes. Tudo no lugar certo, sem abrir o gov.br e sem ligar pra contador.
              </p>

              <div
                className="flex flex-col sm:flex-row items-start gap-4"
                style={{ marginTop: 40, opacity: 0, animation: "heroFadeUp 0.8s ease forwards", animationDelay: "0.65s" }}
              >
                <Link
                  href="/cadastro"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "16px 36px", borderRadius: 14, backgroundColor: "#D4500A", color: "#FFFFFF",
                    fontSize: 16, fontWeight: 600, textDecoration: "none",
                    boxShadow: "0 0 40px rgba(212,80,10,0.35), 0 4px 20px rgba(0,0,0,0.3)",
                    animation: "pulseGlow 3s ease-in-out infinite",
                  }}
                >
                  Comecar gratis
                </Link>
                <a
                  href="#walkthrough"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "16px 28px", borderRadius: 14, color: "rgba(255,255,255,0.7)",
                    fontSize: 15, fontWeight: 500, textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.12)", transition: "border-color 0.2s, color 0.2s",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <polygon points="6,3 13,8 6,13" fill="rgba(255,255,255,0.7)" />
                  </svg>
                  Ver como funciona
                </a>
              </div>

              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 20, opacity: 0, animation: "heroFadeUp 0.8s ease forwards", animationDelay: "0.8s" }}>
                Sem cartao. Sem compromisso. Leva 2 minutos.
              </p>
            </div>

            {/* Right: Floating dashboard mockup */}
            <div
              style={{
                flex: "0 0 45%", maxWidth: 520, width: "100%",
                opacity: 0, animation: "heroFadeUp 1s ease forwards 0.6s",
              }}
            >
              <div
                style={{
                  animation: "float 6s ease-in-out infinite",
                  position: "relative",
                }}
              >
                {/* Glow behind mockup */}
                <div style={{
                  position: "absolute", inset: -40, borderRadius: 32,
                  background: "radial-gradient(ellipse at center, rgba(212,80,10,0.2) 0%, transparent 65%)",
                  filter: "blur(40px)", pointerEvents: "none",
                }} />

                {/* Mockup card */}
                <div
                  style={{
                    position: "relative",
                    backgroundColor: "#FAF8F5", borderRadius: 20,
                    border: "1px solid #E8E3DA",
                    padding: 24, overflow: "hidden",
                    boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(212,80,10,0.08)",
                  }}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                    <div className="flex items-center gap-2">
                      <img src="/logo-v1-dark.svg" alt="" style={{ width: 20, height: 20, borderRadius: 5 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#7A6255", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Painel MEI
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: "#C8C2B8", fontFamily: "var(--font-dm-mono)" }}>
                      Abril 2026
                    </span>
                  </div>

                  {/* Limit bar section */}
                  <div style={{ marginBottom: 20 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "#7A6255", fontWeight: 500 }}>
                        Limite anual
                      </span>
                      <span style={{ fontSize: 22, fontWeight: 700, color: "#2A1F14", fontFamily: "var(--font-dm-mono)", letterSpacing: "-0.02em" }}>
                        59%
                      </span>
                    </div>
                    <div style={{ height: 6, backgroundColor: "#E8E3DA", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: "59%", height: "100%", backgroundColor: "#D4500A", borderRadius: 99 }} />
                    </div>
                    <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
                      <span style={{ fontSize: 10, color: "#C8C2B8", fontFamily: "var(--font-dm-mono)" }}>R$ 47.800</span>
                      <span style={{ fontSize: 10, color: "#C8C2B8", fontFamily: "var(--font-dm-mono)" }}>R$ 81.000</span>
                    </div>
                  </div>

                  {/* Two mini cards row */}
                  <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
                    <div style={{ backgroundColor: "#F2EFE9", borderRadius: 12, padding: 14, border: "1px solid #E8E3DA" }}>
                      <span style={{ fontSize: 10, color: "#7A6255", fontWeight: 500, display: "block", marginBottom: 6 }}>DAS Abril</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: "#2A1F14", fontFamily: "var(--font-dm-mono)", letterSpacing: "-0.02em" }}>R$ 71,60</span>
                      <div className="flex items-center gap-1.5" style={{ marginTop: 8 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#EDBA3A" }} />
                        <span style={{ fontSize: 9, color: "#A88B00", fontWeight: 500 }}>Vence em 17 dias</span>
                      </div>
                    </div>
                    <div style={{ backgroundColor: "#F2EFE9", borderRadius: 12, padding: 14, border: "1px solid #E8E3DA" }}>
                      <span style={{ fontSize: 10, color: "#7A6255", fontWeight: 500, display: "block", marginBottom: 6 }}>Faturamento</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: "#2A1F14", fontFamily: "var(--font-dm-mono)", letterSpacing: "-0.02em" }}>R$ 7.200</span>
                      <div className="flex items-center gap-1.5" style={{ marginTop: 8 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1 7L5 3L9 7" stroke="#22863A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontSize: 9, color: "#22863A", fontWeight: 500 }}>+12% vs marco</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini chart bars */}
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "#7A6255", fontWeight: 500, display: "block", marginBottom: 10 }}>Faturamento mensal</span>
                    <div className="flex items-end gap-1.5" style={{ height: 48 }}>
                      {[35, 42, 28, 55, 48, 62, 40, 52, 68, 45, 58, 72].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: `${h}%`,
                            backgroundColor: i === 11 ? "#D4500A" : "#E8E3DA",
                            borderRadius: 3,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
                      <span style={{ fontSize: 8, color: "#C8C2B8", fontFamily: "var(--font-dm-mono)" }}>Mai</span>
                      <span style={{ fontSize: 8, color: "#C8C2B8", fontFamily: "var(--font-dm-mono)" }}>Abr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to bottom, transparent 0%, #141414 100%)", pointerEvents: "none" }} />
      </section>

      {/* ========== BENTO FEATURES (Light) ========== */}
      <section
        id="features"
        data-animate
        style={{
          backgroundColor: "#FAF8F5",
          opacity: isVisible("features") ? 1 : 0,
          transform: isVisible("features") ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 24px" }}>
          <div className="text-center" style={{ marginBottom: 72 }}>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 700, color: "#2A1F14", letterSpacing: "-0.035em", lineHeight: 1.15 }}>
              Voce nao precisa virar contador. Precisa de controle.
            </h2>
          </div>

          {/* Bento Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 16,
            }}
            className="md:!grid-cols-bento"
          >
            {/* LIMITE - tall card */}
            <div
              className="bento-card"
              style={{
                gridRow: "span 2",
                backgroundColor: "#F2EFE9",
                border: "1px solid #E8E3DA",
                borderRadius: 20,
                padding: 32,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 380,
                transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                cursor: "default",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(212,80,10,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: "#2A1F14", marginBottom: 10, letterSpacing: "-0.02em" }}>
                  Sabe aquele medo de estourar o limite?
                </h3>
                <p style={{ fontSize: 15, color: "#7A6255", lineHeight: 1.7 }}>
                  Aqui voce ve exatamente quanto ja faturou, quanto falta e quando precisa desacelerar. Sem planilha, sem achismo.
                </p>
              </div>

              {/* Mini progress mockup */}
              <div style={{ marginTop: 32, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, border: "1px solid #E8E3DA" }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: "#7A6255", fontWeight: 500 }}>Limite 2026</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#2A1F14", fontFamily: "var(--font-dm-mono)", letterSpacing: "-0.02em" }}>59%</span>
                </div>
                <div style={{ height: 8, backgroundColor: "#E8E3DA", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: "59%", height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #D4500A 0%, #E8721F 100%)" }} />
                </div>
                <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: "#7A6255", fontFamily: "var(--font-dm-mono)" }}>R$ 47.800</span>
                  <span style={{ fontSize: 11, color: "#C8C2B8", fontFamily: "var(--font-dm-mono)" }}>R$ 81.000</span>
                </div>
                <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "rgba(212,80,10,0.08)", borderRadius: 99, padding: "4px 12px" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#D4500A" }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#A83D08" }}>R$ 33.200 restantes</span>
                </div>
              </div>
            </div>

            {/* DAS - square card */}
            <div
              className="bento-card"
              style={{
                backgroundColor: "#F2EFE9",
                border: "1px solid #E8E3DA",
                borderRadius: 20,
                padding: 32,
                transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                cursor: "default",
                overflow: "hidden",
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(212,80,10,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#2A1F14", marginBottom: 8, letterSpacing: "-0.02em" }}>
                Dia 20 nunca mais te pega de surpresa
              </h3>
              <p style={{ fontSize: 14, color: "#7A6255", lineHeight: 1.7, marginBottom: 20 }}>
                Aviso antes de vencer, valor exato, link direto pro boleto. Um clique.
              </p>

              {/* Mini calendar mockup */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, border: "1px solid #E8E3DA" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center" }}>
                  {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
                    <span key={i} style={{ fontSize: 9, color: "#C8C2B8", fontWeight: 500 }}>{d}</span>
                  ))}
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <div
                      key={day}
                      style={{
                        fontSize: 10,
                        fontWeight: day === 20 ? 700 : 400,
                        color: day === 20 ? "#FFFFFF" : "#7A6255",
                        backgroundColor: day === 20 ? "#D4500A" : "transparent",
                        borderRadius: 6,
                        padding: "3px 0",
                        fontFamily: "var(--font-dm-mono)",
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* NOTAS - square card */}
            <div
              className="bento-card"
              style={{
                backgroundColor: "#F2EFE9",
                border: "1px solid #E8E3DA",
                borderRadius: 20,
                padding: 32,
                transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                cursor: "default",
                overflow: "hidden",
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(212,80,10,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#2A1F14", marginBottom: 8, letterSpacing: "-0.02em" }}>
                Cliente pediu nota? Pronto em segundos.
              </h3>
              <p style={{ fontSize: 14, color: "#7A6255", lineHeight: 1.7, marginBottom: 20 }}>
                Registra, emite e guarda. Sem perder nota, sem esquecer valor.
              </p>

              {/* Mini document stack mockup */}
              <div style={{ position: "relative", height: 80 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: i * 8,
                      top: i * 6,
                      width: `calc(100% - ${i * 16}px)`,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 10,
                      padding: "10px 14px",
                      border: "1px solid #E8E3DA",
                      zIndex: 3 - i,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    {i === 0 && (
                      <div className="flex items-center justify-between">
                        <div>
                          <span style={{ fontSize: 9, color: "#C8C2B8", display: "block" }}>NFS-e</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#2A1F14", fontFamily: "var(--font-dm-mono)" }}>R$ 3.500,00</span>
                        </div>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#4ADE80" }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* OBRIGACOES - wide card */}
            <div
              className="bento-card"
              style={{
                gridColumn: "1 / -1",
                backgroundColor: "#F2EFE9",
                border: "1px solid #E8E3DA",
                borderRadius: 20,
                padding: 32,
                transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                cursor: "default",
                overflow: "hidden",
              }}
            >
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div style={{ flex: "0 0 40%" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(212,80,10,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 600, color: "#2A1F14", marginBottom: 10, letterSpacing: "-0.02em" }}>
                    Nunca mais descobre obrigacao na ultima hora
                  </h3>
                  <p style={{ fontSize: 15, color: "#7A6255", lineHeight: 1.7 }}>
                    DAS mensal, declaracao anual, situacao do CNPJ. O Guiado te mostra o que precisa ser feito e quando. Voce so confirma.
                  </p>
                </div>

                {/* Timeline mockup */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                  {[
                    { label: "DAS Janeiro", date: "20/01", done: true },
                    { label: "DAS Fevereiro", date: "20/02", done: true },
                    { label: "DAS Marco", date: "20/03", done: true },
                    { label: "DAS Abril", date: "20/04", done: false, pending: true },
                    { label: "DASN 2025", date: "31/05", done: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        backgroundColor: item.done ? "rgba(212,80,10,0.1)" : item.pending ? "#FFF3CD" : "rgba(0,0,0,0.03)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {item.done ? (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8l3.5 3.5L13 5" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: item.pending ? "#EDBA3A" : "#C8C2B8" }} />
                        )}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: item.pending ? 600 : 400, color: item.done ? "#7A6255" : "#141414", flex: 1, textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.6 : 1 }}>{item.label}</span>
                      <span style={{ fontSize: 11, color: "#C8C2B8", fontFamily: "var(--font-dm-mono)" }}>{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PRODUCT WALKTHROUGH (Dark) ========== */}
      <section
        id="walkthrough"
        data-animate
        style={{
          backgroundColor: "#141414",
          position: "relative",
          overflow: "hidden",
          opacity: isVisible("walkthrough") ? 1 : 0,
          transform: isVisible("walkthrough") ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 800, height: 800, transform: "translate(-50%, -50%)", background: "radial-gradient(circle, rgba(212,80,10,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 24px", position: "relative", zIndex: 1 }}>
          <div className="text-center" style={{ marginBottom: 80 }}>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 700, color: "#FAF8F5", letterSpacing: "-0.035em", lineHeight: 1.15 }}>
              Coloca o CNPJ. O resto a gente faz.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ position: "relative" }}>
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block" style={{
              position: "absolute",
              top: 40,
              left: "20%",
              right: "20%",
              height: 1,
              backgroundImage: "repeating-linear-gradient(90deg, rgba(212,80,10,0.25) 0px, rgba(212,80,10,0.25) 6px, transparent 6px, transparent 14px)",
              pointerEvents: "none",
            }} />

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div style={{
                width: 56, height: 56, borderRadius: "50%", backgroundColor: "#D4500A",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28,
                boxShadow: "0 0 30px rgba(212,80,10,0.3)",
                position: "relative", zIndex: 2,
              }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-dm-mono)" }}>1</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#FAF8F5", marginBottom: 8 }}>Cria a conta e coloca o CNPJ</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 24 }}>Sem formulario gigante. Email, senha, CNPJ. Pronto.</p>

              {/* Mini CNPJ input mockup */}
              <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 20, border: "1px solid rgba(255,255,255,0.06)", width: "100%" }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 8 }}>CNPJ</span>
                <div style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-dm-mono)" }}>
                    12.345.678/0001-90
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div style={{
                width: 56, height: 56, borderRadius: "50%", backgroundColor: "#D4500A",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28,
                boxShadow: "0 0 30px rgba(212,80,10,0.3)",
                position: "relative", zIndex: 2,
              }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-dm-mono)" }}>2</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#FAF8F5", marginBottom: 8 }}>A gente busca tudo pra voce</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 24 }}>Nome, CNAE, situacao. Tudo aparece automaticamente.</p>

              {/* Mini loading state mockup */}
              <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 20, border: "1px solid rgba(255,255,255,0.06)", width: "100%" }}>
                <div className="flex flex-col gap-3">
                  {["Razao social", "CNAE", "Situacao"].map((label, i) => (
                    <div key={i}>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", display: "block", marginBottom: 4 }}>{label}</span>
                      <div style={{ height: 12, backgroundColor: "rgba(212,80,10,0.12)", borderRadius: 4, width: i === 0 ? "80%" : i === 1 ? "60%" : "40%" }} />
                    </div>
                  ))}
                  <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#4ADE80" }} />
                    <span style={{ fontSize: 10, color: "#4ADE80", fontWeight: 500 }}>ATIVA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div style={{
                width: 56, height: 56, borderRadius: "50%", backgroundColor: "#D4500A",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28,
                boxShadow: "0 0 30px rgba(212,80,10,0.3)",
                position: "relative", zIndex: 2,
              }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-dm-mono)" }}>3</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#FAF8F5", marginBottom: 8 }}>Pronto. Seu MEI ta no controle.</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 24 }}>Limite, DAS, notas, documentos. Tudo ali.</p>

              {/* Mini dashboard mockup */}
              <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, border: "1px solid rgba(255,255,255,0.06)", width: "100%" }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#D4500A" }} />
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>Dashboard</span>
                </div>
                <div style={{ height: 4, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ width: "59%", height: "100%", backgroundColor: "#D4500A", borderRadius: 99 }} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 8 }}>
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", display: "block" }}>DAS</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#FAF8F5", fontFamily: "var(--font-dm-mono)" }}>R$ 71</span>
                  </div>
                  <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 8 }}>
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", display: "block" }}>Fat.</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#FAF8F5", fontFamily: "var(--font-dm-mono)" }}>R$ 7.2k</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SOCIAL PROOF (Light) ========== */}
      <section
        id="social-proof"
        data-animate
        style={{
          backgroundColor: "#FAF8F5",
          opacity: isVisible("social-proof") ? 1 : 0,
          transform: isVisible("social-proof") ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: "2.500+", label: "MEIs que pararam de improvisar" },
              { value: "R$ 12M+", label: "em faturamento acompanhado" },
              { value: "15.000+", label: "alertas que evitaram multa" },
              { value: "0", label: "vezes que voce precisa entrar no gov.br" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <span
                  style={{
                    fontSize: "clamp(28px, 4vw, 44px)",
                    fontWeight: 700,
                    color: "#2A1F14",
                    fontFamily: "var(--font-dm-mono)",
                    letterSpacing: "-0.03em",
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </span>
                <span style={{ fontSize: 14, color: "#7A6255", marginTop: 8, display: "block" }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========== PRICING (Light) ========== */}
      <section
        id="pricing"
        data-animate
        style={{
          backgroundColor: "#FAF8F5",
          opacity: isVisible("pricing") ? 1 : 0,
          transform: isVisible("pricing") ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 120px" }}>
          <div className="text-center" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 700, color: "#2A1F14", letterSpacing: "-0.035em", lineHeight: 1.15 }}>
              Menos de R$ 1,50 por dia. Menos que o cafe que voce toma enquanto trabalha.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: 1080, margin: "0 auto" }}>
            {/* FREE card */}
            <div
              style={{
                backgroundColor: "#F2EFE9",
                border: "1px solid #E8E3DA",
                borderRadius: 20,
                padding: 32,
                display: "flex",
                flexDirection: "column",
                opacity: isVisible("pricing") ? 1 : 0,
                transform: isVisible("pricing") ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
              }}
            >
              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: "rgba(212,80,10,0.06)", color: "#A83D08", padding: "4px 12px", borderRadius: 8, marginBottom: 20, alignSelf: "flex-start" }}>
                Free
              </span>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: "#2A1F14", fontFamily: "var(--font-dm-mono)", letterSpacing: "-0.02em" }}>R$ 0</span>
              </div>
              <p style={{ fontSize: 13, color: "#7A6255", marginBottom: 28 }}>Pra sair do zero e saber onde voce ta</p>

              <div className="flex flex-col gap-3" style={{ marginBottom: 28, flex: 1 }}>
                {[
                  "Limite anual em tempo real",
                  "DAS do mes com lembrete",
                  "Situacao do CNPJ atualizada",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="#5C4535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 13, color: "#2A1F14" }}>{feat}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/cadastro"
                className="flex items-center justify-center"
                style={{
                  width: "100%", padding: "13px 24px", borderRadius: 14,
                  backgroundColor: "transparent", border: "1px solid #E8E3DA",
                  color: "#2A1F14", fontSize: 14, fontWeight: 600, textDecoration: "none",
                }}
              >
                Comecar gratis
              </Link>
            </div>

            {/* PRO card - HIGHLIGHTED */}
            <div
              style={{
                backgroundColor: "#141414",
                borderRadius: 20,
                padding: 32,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 0 80px rgba(212,80,10,0.12), 0 24px 48px rgba(0,0,0,0.3)",
                border: "1px solid rgba(212,80,10,0.2)",
                opacity: isVisible("pricing") ? 1 : 0,
                transform: isVisible("pricing") ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
              }}
            >
              <div style={{ position: "absolute", top: -60, right: -60, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,80,10,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,80,10,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: "#D4500A", color: "#FFFFFF", padding: "4px 12px", borderRadius: 8, marginBottom: 20, position: "relative", alignSelf: "flex-start" }}>
                Recomendado
              </span>
              <div style={{ marginBottom: 4, position: "relative" }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: "#FAF8F5", fontFamily: "var(--font-dm-mono)", letterSpacing: "-0.02em" }}>R$ 39,90</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 28, position: "relative" }}>Pra nunca mais ser pego de surpresa</p>

              <div className="flex flex-col gap-3" style={{ marginBottom: 28, position: "relative", flex: 1 }}>
                {[
                  "Tudo do Free",
                  "Historico completo de faturamento",
                  "Alertas inteligentes por email",
                  "Documentos do CNPJ em 1 clique",
                  "Projecao de limite anual",
                  "Suporte prioritario",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 13, color: "#FAF8F5" }}>{feat}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/cadastro"
                className="flex items-center justify-center"
                style={{
                  width: "100%", padding: "13px 24px", borderRadius: 14,
                  backgroundColor: "#D4500A", color: "#FFFFFF",
                  fontSize: 14, fontWeight: 600, textDecoration: "none",
                  position: "relative",
                  boxShadow: "0 0 30px rgba(212,80,10,0.3)",
                }}
              >
                Assinar o Pro mensal
              </Link>
            </div>

            {/* ANUAL card */}
            <div
              style={{
                backgroundColor: "#141414",
                borderRadius: 20,
                padding: 32,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(255,255,255,0.06)",
                opacity: isVisible("pricing") ? 1 : 0,
                transform: isVisible("pricing") ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
              }}
            >
              <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
                <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "4px 12px", borderRadius: 8, position: "relative" }}>
                  Pro Anual
                </span>
                <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", background: "linear-gradient(135deg, #D4500A, #FF7A35)", color: "#FFFFFF", padding: "3px 10px", borderRadius: 99, position: "relative" }}>
                  2 meses gratis
                </span>
              </div>
              <div style={{ marginBottom: 4, position: "relative" }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: "#FAF8F5", fontFamily: "var(--font-dm-mono)", letterSpacing: "-0.02em" }}>R$ 399</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 8, position: "relative" }}>/ano (equivale a R$ 33,25/mes)</p>
              <p style={{ fontSize: 12, color: "rgba(212,80,10,0.8)", marginBottom: 28, position: "relative", fontWeight: 500 }}>Economize R$ 79,80 por ano</p>

              <div className="flex flex-col gap-3" style={{ marginBottom: 28, position: "relative", flex: 1 }}>
                {[
                  "Tudo do Pro mensal",
                  "Preco travado por 12 meses",
                  "Prioridade em novos recursos",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 13, color: "#FAF8F5" }}>{feat}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/cadastro"
                className="flex items-center justify-center"
                style={{
                  width: "100%", padding: "13px 24px", borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.08)", color: "#FAF8F5",
                  fontSize: 14, fontWeight: 600, textDecoration: "none",
                  position: "relative",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                Assinar o Pro anual
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA + FOOTER (Dark, Merged) ========== */}
      <footer
        style={{
          backgroundColor: "#141414",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow orb */}
        <div style={{ position: "absolute", top: "0%", left: "50%", width: 600, height: 600, transform: "translateX(-50%)", background: "radial-gradient(circle, rgba(212,80,10,0.08) 0%, transparent 55%)", pointerEvents: "none" }} />

        {/* CTA section */}
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "100px 24px 80px", position: "relative", zIndex: 1, textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, color: "#FAF8F5", letterSpacing: "-0.035em", lineHeight: 1.2, marginBottom: 20 }}>
            Voce ja tem o trabalho mais dificil resolvido. O Guiado cuida do resto.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 40, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Pra nunca mais ter aquela sensacao de que alguma coisa pode estar errada no seu CNPJ.
          </p>
          <Link
            href="/cadastro"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "18px 44px", borderRadius: 14, backgroundColor: "#D4500A", color: "#FFFFFF",
              fontSize: 17, fontWeight: 600, textDecoration: "none",
              boxShadow: "0 0 50px rgba(212,80,10,0.35), 0 4px 20px rgba(0,0,0,0.3)",
              animation: "pulseGlow 3s ease-in-out infinite",
            }}
          >
            Comecar gratis
          </Link>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginTop: 16 }}>
            Gratis pra sempre no plano Free. Sem cartao.
          </p>
        </div>

        {/* Footer links */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px", position: "relative", zIndex: 1 }}>
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28 }}
          >
            <div className="flex items-center gap-2">
              <img src="/logo-v1-dark.svg" alt="Guiado" style={{ width: 22, height: 22, borderRadius: 6 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", letterSpacing: "-0.03em" }}>
                Guiado
              </span>
            </div>

            <div className="flex items-center gap-6">
              {["Termos", "Privacidade", "Contato"].map((label) => (
                <Link key={label} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>2026 Guiado</p>
          </div>
        </div>
      </footer>

      {/* ========== Inline Styles for Bento Hover & Grid ========== */}
      <style jsx>{`
        .bento-card:hover {
          transform: translateY(-2px) scale(1.01);
          border-color: rgba(212, 80, 10, 0.25) !important;
          box-shadow: 0 8px 32px rgba(212, 80, 10, 0.08), 0 2px 12px rgba(0, 0, 0, 0.04);
        }
        @media (min-width: 768px) {
          .md\\:!grid-cols-bento {
            grid-template-columns: 1.2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
