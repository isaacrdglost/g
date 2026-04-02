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
      {/* ========== NAV ========== */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: scrolled ? "rgba(26,19,16,0.85)" : "rgba(26,19,16,0.4)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: scrolled ? "1px solid rgba(212,80,10,0.1)" : "1px solid transparent",
          transition: "all 0.4s ease",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "14px 24px",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center font-bold"
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                backgroundColor: "#D4500A",
                color: "#FFFFFF",
                fontSize: 16,
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              G
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#FFFFFF",
                fontFamily: "var(--font-dm-sans)",
                letterSpacing: "-0.03em",
              }}
            >
              Guiado
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/entrar"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                padding: "8px 16px",
                transition: "color 0.2s ease",
              }}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="btn-primary"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#FFFFFF",
                backgroundColor: "#D4500A",
                textDecoration: "none",
                padding: "10px 22px",
                borderRadius: 10,
                boxShadow: "0 0 20px rgba(212,80,10,0.3)",
              }}
            >
              Comecar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO (DARK) ========== */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "#1A1310",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Noise texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.035,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            pointerEvents: "none",
          }}
        />

        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            top: "-15%",
            left: "-10%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,80,10,0.18) 0%, rgba(212,80,10,0.05) 35%, transparent 60%)",
            filter: "blur(80px)",
            pointerEvents: "none",
            animation: "orbDrift1 16s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            bottom: "-10%",
            right: "-5%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,80,10,0.14) 0%, rgba(212,80,10,0.04) 35%, transparent 60%)",
            filter: "blur(90px)",
            pointerEvents: "none",
            animation: "orbDrift2 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 350,
            height: 350,
            top: "50%",
            left: "50%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,80,10,0.08) 0%, transparent 50%)",
            filter: "blur(100px)",
            pointerEvents: "none",
            animation: "orbDrift3 24s ease-in-out infinite",
          }}
        />

        {/* Map SVG background */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <svg
            viewBox="0 0 1440 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            {/* Route paths */}
            <path
              d="M-50 200 C200 180, 350 350, 500 300 S750 150, 900 280 S1100 400, 1300 250 S1500 180, 1550 300"
              stroke="rgba(212,80,10,0.08)"
              strokeWidth="1"
              fill="none"
              strokeDasharray="8 6"
            />
            <path
              d="M-50 500 C150 480, 300 600, 500 550 S700 400, 850 500 S1050 650, 1250 550 S1400 450, 1550 520"
              stroke="rgba(212,80,10,0.06)"
              strokeWidth="1"
              fill="none"
              strokeDasharray="8 6"
            />
            <path
              d="M-50 750 C200 700, 400 800, 600 720 S850 600, 1000 700 S1200 800, 1550 680"
              stroke="rgba(212,80,10,0.05)"
              strokeWidth="1"
              fill="none"
              strokeDasharray="6 8"
            />

            {/* Secondary connector routes */}
            <path
              d="M500 300 C520 380, 480 450, 500 550"
              stroke="rgba(212,80,10,0.06)"
              strokeWidth="0.8"
              fill="none"
              strokeDasharray="4 6"
            />
            <path
              d="M900 280 C920 340, 870 420, 850 500"
              stroke="rgba(212,80,10,0.06)"
              strokeWidth="0.8"
              fill="none"
              strokeDasharray="4 6"
            />

            {/* Animated main route */}
            <path
              d="M100 400 C250 350, 400 420, 550 380 S800 300, 950 380 S1150 480, 1350 400"
              stroke="rgba(212,80,10,0.12)"
              strokeWidth="1.5"
              fill="none"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              style={{ animation: "drawRoute 6s ease-in-out infinite alternate" }}
            />

            {/* Waypoints with pulse */}
            <circle cx="100" cy="400" r="3" fill="#D4500A" opacity="0.9">
              <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy="400" r="12" stroke="rgba(212,80,10,0.2)" strokeWidth="0.5" fill="none">
              <animate attributeName="r" values="12;18;12" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
            </circle>

            <circle cx="500" cy="300" r="2.5" fill="#D4500A" opacity="0.7">
              <animate attributeName="r" values="2.5;4;2.5" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="500" cy="300" r="10" stroke="rgba(212,80,10,0.15)" strokeWidth="0.5" fill="none">
              <animate attributeName="r" values="10;16;10" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0;0.2" dur="4s" repeatCount="indefinite" />
            </circle>

            <circle cx="900" cy="280" r="2" fill="#D4500A" opacity="0.6">
              <animate attributeName="r" values="2;3.5;2" dur="3.5s" repeatCount="indefinite" />
            </circle>

            <circle cx="550" cy="380" r="3.5" fill="#D4500A" opacity="0.8">
              <animate attributeName="r" values="3.5;5.5;3.5" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="550" cy="380" r="14" stroke="rgba(212,80,10,0.25)" strokeWidth="0.5" fill="none">
              <animate attributeName="r" values="14;22;14" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
            </circle>

            <circle cx="1350" cy="400" r="2.5" fill="#D4500A" opacity="0.7">
              <animate attributeName="r" values="2.5;4;2.5" dur="3s" repeatCount="indefinite" />
            </circle>

            <circle cx="850" cy="500" r="2" fill="#D4500A" opacity="0.5">
              <animate attributeName="r" values="2;3.5;2" dur="3.8s" repeatCount="indefinite" />
            </circle>

            <circle cx="1000" cy="700" r="2" fill="#D4500A" opacity="0.4">
              <animate attributeName="r" values="2;3;2" dur="5s" repeatCount="indefinite" />
            </circle>

            {/* Small reference waypoints */}
            <circle cx="250" cy="190" r="1.5" fill="rgba(212,80,10,0.3)" />
            <circle cx="700" cy="160" r="1" fill="rgba(212,80,10,0.2)" />
            <circle cx="1100" cy="380" r="1.5" fill="rgba(212,80,10,0.25)" />
            <circle cx="350" cy="620" r="1" fill="rgba(212,80,10,0.2)" />
            <circle cx="680" cy="730" r="1.5" fill="rgba(212,80,10,0.2)" />

            {/* Traveling particles */}
            <circle
              r="2"
              fill="#D4500A"
              opacity="0.9"
              style={{
                offsetPath:
                  "path('M100 400 C250 350, 400 420, 550 380 S800 300, 950 380 S1150 480, 1350 400')",
                animation: "travelRoute1 8s linear infinite",
              }}
            />
            <circle
              r="1.5"
              fill="#D4500A"
              opacity="0.7"
              style={{
                offsetPath:
                  "path('M100 400 C250 350, 400 420, 550 380 S800 300, 950 380 S1150 480, 1350 400')",
                animation: "travelRoute1 8s linear infinite",
                animationDelay: "-3s",
              }}
            />
            <circle
              r="1.5"
              fill="#D4500A"
              opacity="0.6"
              style={{
                offsetPath:
                  "path('M-50 200 C200 180, 350 350, 500 300 S750 150, 900 280 S1100 400, 1300 250 S1500 180, 1550 300')",
                animation: "travelRoute2 12s linear infinite",
              }}
            />

            {/* Coordinate labels */}
            <text x="108" y="395" fill="rgba(212,80,10,0.15)" fontSize="7" fontFamily="var(--font-dm-mono)">
              01
            </text>
            <text x="558" y="375" fill="rgba(212,80,10,0.12)" fontSize="7" fontFamily="var(--font-dm-mono)">
              02
            </text>
            <text x="908" y="275" fill="rgba(212,80,10,0.1)" fontSize="6" fontFamily="var(--font-dm-mono)">
              03
            </text>
          </svg>
        </div>

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 800,
            margin: "0 auto",
            padding: "140px 24px 100px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 600,
              color: "#D4500A",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              opacity: 0,
              animation: "heroFadeUp 0.8s ease forwards",
              animationDelay: "0.2s",
            }}
          >
            Para MEIs que trabalham no digital
          </span>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 600,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginTop: 24,
              fontFamily: "var(--font-dm-sans)",
              opacity: 0,
              animation: "heroFadeUp 0.8s ease forwards",
              animationDelay: "0.35s",
            }}
          >
            Voce trabalha no digital. Sabe entregar resultado pro cliente.
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 18px)",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7,
              marginTop: 24,
              opacity: 0,
              animation: "heroFadeUp 0.8s ease forwards",
              animationDelay: "0.5s",
            }}
          >
            Mas quando o assunto e o seu proprio CNPJ, bate aquela sensacao de que alguma coisa pode estar errada e voce nem sabe.
          </p>

          <p
            style={{
              fontSize: "clamp(18px, 2.5vw, 22px)",
              fontWeight: 600,
              color: "#D4500A",
              marginTop: 24,
              opacity: 0,
              animation: "heroFadeUp 0.8s ease forwards",
              animationDelay: "0.65s",
            }}
          >
            O Guiado resolve isso.
          </p>

          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.7,
              marginTop: 16,
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
              opacity: 0,
              animation: "heroFadeUp 0.8s ease forwards",
              animationDelay: "0.8s",
            }}
          >
            Seu MEI organizado, seu limite monitorado, suas obrigacoes em dia. Tudo num lugar so, sem precisar de contador e sem precisar entrar no gov.br.
          </p>

          <div
            style={{
              marginTop: 40,
              opacity: 0,
              animation: "heroFadeUp 0.8s ease forwards",
              animationDelay: "0.95s",
            }}
          >
            <Link
              href="/cadastro"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "18px 40px",
                borderRadius: 14,
                backgroundColor: "#D4500A",
                color: "#FFFFFF",
                fontSize: 17,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 0 40px rgba(212,80,10,0.35), 0 4px 20px rgba(0,0,0,0.3)",
                animation: "pulseGlow 3s ease-in-out infinite",
              }}
            >
              Comecar gratis
            </Link>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.35)",
                marginTop: 16,
              }}
            >
              Sem cartao de credito - comece em 2 minutos
            </p>
          </div>
        </div>

        {/* Bottom fade to light */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            background: "linear-gradient(to bottom, transparent, #FAF8F5)",
            pointerEvents: "none",
          }}
        />
      </section>

      {/* ========== BLOCO 1 - Pain Points ========== */}
      <section
        id="pain-points"
        data-animate
        style={{
          backgroundColor: "#FAF8F5",
          opacity: isVisible("pain-points") ? 1 : 0,
          transform: isVisible("pain-points") ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "100px 24px",
          }}
        >
          <h2
            className="text-center"
            style={{
              fontSize: "clamp(26px, 3.5vw, 32px)",
              fontWeight: 600,
              color: "#2A1F14",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: 56,
            }}
          >
            Voce ja passou por algum desses momentos?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                num: "01",
                text: "Chegou o dia 20 e voce so foi lembrar do DAS porque alguem comentou no grupo.",
              },
              {
                num: "02",
                text: "Um cliente novo pediu seu CNPJ e comprovante de regularidade antes de assinar o contrato. Voce passou meia hora tentando achar o documento certo no portal do governo.",
              },
              {
                num: "03",
                text: "Abriu uma planilha pra tentar calcular quanto faturou no ano. Desistiu na metade.",
              },
              {
                num: "04",
                text: "Descobriu que existe uma declaracao anual obrigatoria. Em abril. Com vencimento em maio. Pela primeira vez.",
              },
            ].map((item, i) => (
              <div
                key={item.num}
                style={{
                  backgroundColor: "#F2EFE9",
                  border: "1px solid #E8E3DA",
                  borderRadius: 16,
                  padding: 28,
                  position: "relative",
                  overflow: "hidden",
                  opacity: isVisible("pain-points") ? 1 : 0,
                  transform: isVisible("pain-points") ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s, border-color 0.2s ease, box-shadow 0.2s ease`,
                  cursor: "default",
                }}
                className="card-hover"
              >
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 16,
                    fontSize: 48,
                    fontWeight: 700,
                    color: "rgba(212,80,10,0.08)",
                    fontFamily: "var(--font-dm-mono)",
                    lineHeight: 1,
                    pointerEvents: "none",
                  }}
                >
                  {item.num}
                </span>
                <p
                  style={{
                    fontSize: 15,
                    color: "#2A1F14",
                    lineHeight: 1.7,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <p
            className="text-center"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#D4500A",
              marginTop: 48,
            }}
          >
            Se qualquer um desses aconteceu com voce, o Guiado foi feito pra voce.
          </p>
        </div>
      </section>

      {/* ========== BLOCO 2 - Stakes (dark) ========== */}
      <section
        id="stakes"
        data-animate
        style={{
          backgroundColor: "#2A1F14",
          position: "relative",
          overflow: "hidden",
          opacity: isVisible("stakes") ? 1 : 0,
          transform: isVisible("stakes") ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Radial glow center */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 600,
            height: 600,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(212,80,10,0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "100px 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Limite estourado",
                desc: "Estourar o limite do MEI sem perceber gera imposto retroativo sobre o ano inteiro.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                ),
              },
              {
                title: "Multa silenciosa",
                desc: "DAS atrasado acumula multa de 0,33% ao dia mais juros Selic. Silenciosamente, todo mes.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                ),
              },
              {
                title: "CNPJ irregular",
                desc: "CNPJ irregular aparece na hora errada. Na hora de fechar o contrato que mais importa.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <line x1="8" y1="11" x2="16" y2="11" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: 32,
                  backdropFilter: "blur(8px)",
                  opacity: isVisible("stakes") ? 1 : 0,
                  transform: isVisible("stakes") ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    backgroundColor: "rgba(212,80,10,0.12)",
                    marginBottom: 24,
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#FAF8F5",
                    marginBottom: 10,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <p
            className="text-center"
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.45)",
              marginTop: 56,
              lineHeight: 1.6,
            }}
          >
            Nao e burocracia por burocracia. E o seu dinheiro e a sua reputacao profissional.
          </p>
        </div>
      </section>

      {/* ========== BLOCO 3 - Solution ========== */}
      <section
        id="solution"
        data-animate
        style={{
          opacity: isVisible("solution") ? 1 : 0,
          transform: isVisible("solution") ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "100px 24px",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 32px)",
              fontWeight: 600,
              color: "#2A1F14",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: 64,
              maxWidth: 640,
            }}
          >
            O Guiado cuida do que voce nao deveria precisar se preocupar
          </h2>

          <div className="flex flex-col gap-16">
            {[
              {
                num: "01",
                title: "Acompanha seu faturamento",
                desc: "Acompanha seu faturamento e te avisa quando voce esta se aproximando do limite, com tempo de agir.",
              },
              {
                num: "02",
                title: "Lembra do DAS",
                desc: "Te lembra do DAS antes do vencimento, com o link direto pra pagar.",
              },
              {
                num: "03",
                title: "Situacao cadastral atualizada",
                desc: "Mantem sua situacao cadastral atualizada e te entrega os documentos do CNPJ quando voce precisar, em segundos.",
              },
              {
                num: "04",
                title: "Historico organizado",
                desc: "Organiza seu historico de notas e pagamentos pra quando chegar a epoca da declaracao, voce ja ter tudo na mao.",
              },
            ].map((item, i) => (
              <div
                key={item.num}
                id={`feature-${item.num}`}
                data-animate
                className={`flex flex-col md:flex-row items-start gap-8 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                style={{
                  opacity: isVisible(`feature-${item.num}`) ? 1 : 0,
                  transform: isVisible(`feature-${item.num}`) ? "translateY(0)" : "translateY(30px)",
                  transition: "opacity 0.7s ease, transform 0.7s ease",
                }}
              >
                <div className="shrink-0">
                  <span
                    style={{
                      fontSize: 72,
                      fontWeight: 700,
                      color: "rgba(212,80,10,0.1)",
                      fontFamily: "var(--font-dm-mono)",
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {item.num}
                  </span>
                </div>
                <div style={{ paddingTop: 8 }}>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#2A1F14",
                      marginBottom: 10,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 16,
                      color: "#7A6255",
                      lineHeight: 1.7,
                      maxWidth: 480,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 14,
              color: "#7A6255",
              fontStyle: "italic",
              marginTop: 56,
              lineHeight: 1.7,
              maxWidth: 640,
            }}
          >
            Nao substitui um contador pra quem precisa de um. Resolve tudo que o MEI digital consegue resolver sozinho, que e quase tudo.
          </p>
        </div>
      </section>

      {/* ========== BLOCO 4 - Analogy ========== */}
      <section
        id="analogy"
        data-animate
        style={{
          backgroundColor: "#F2EFE9",
          opacity: isVisible("analogy") ? 1 : 0,
          transform: isVisible("analogy") ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        <div
          className="flex flex-col items-center text-center"
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "100px 24px",
          }}
        >
          <p
            style={{
              fontSize: "clamp(20px, 2.5vw, 26px)",
              fontWeight: 500,
              color: "#2A1F14",
              lineHeight: 1.5,
            }}
          >
            Voce nao terceiriza o Notion, o Figma ou o seu banco. Nao terceiriza porque sao ferramentas que te dao controle, nao dependencia.
          </p>
          <p
            style={{
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 600,
              color: "#D4500A",
              marginTop: 20,
              letterSpacing: "-0.02em",
            }}
          >
            O Guiado e isso pro seu CNPJ.
          </p>
        </div>
      </section>

      {/* ========== BLOCO 5 - Plans ========== */}
      <section
        id="plans"
        data-animate
        style={{
          opacity: isVisible("plans") ? 1 : 0,
          transform: isVisible("plans") ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "100px 24px",
          }}
        >
          <h2
            className="text-center"
            style={{
              fontSize: "clamp(26px, 3.5vw, 32px)",
              fontWeight: 600,
              color: "#2A1F14",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: 56,
            }}
          >
            Gratis pra comecar. Pro pra quem leva a serio.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 800, margin: "0 auto" }}>
            {/* FREE card */}
            <div
              style={{
                backgroundColor: "#F2EFE9",
                border: "1px solid #E8E3DA",
                borderRadius: 20,
                padding: 36,
                opacity: isVisible("plans") ? 1 : 0,
                transform: isVisible("plans") ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  backgroundColor: "rgba(212,80,10,0.06)",
                  color: "#A83D08",
                  padding: "4px 12px",
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                Gratis
              </span>
              <div style={{ marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: "#2A1F14",
                    fontFamily: "var(--font-dm-mono)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  R$ 0
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#7A6255", marginBottom: 28 }}>/mes, para sempre</p>

              <div className="flex flex-col gap-4" style={{ marginBottom: 32 }}>
                {[
                  "Dashboard com limite anual",
                  "DAS do mes atual",
                  "Situacao cadastral",
                  "Saia do zero e entenda onde esta",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8l3.5 3.5L13 5"
                        stroke="#5C4535"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span style={{ fontSize: 14, color: "#2A1F14" }}>{feat}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/cadastro"
                className="flex items-center justify-center btn-primary"
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: 12,
                  backgroundColor: "transparent",
                  border: "1px solid #E8E3DA",
                  color: "#2A1F14",
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Comecar gratis
              </Link>
            </div>

            {/* PRO card */}
            <div
              style={{
                backgroundColor: "#2A1F14",
                borderRadius: 20,
                padding: 36,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 0 60px rgba(212,80,10,0.15), 0 20px 40px rgba(0,0,0,0.3)",
                opacity: isVisible("plans") ? 1 : 0,
                transform: isVisible("plans") ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
              }}
            >
              {/* Corner glow */}
              <div
                style={{
                  position: "absolute",
                  top: -60,
                  right: -60,
                  width: 250,
                  height: 250,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(212,80,10,0.2) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -40,
                  left: -40,
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(212,80,10,0.1) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              <span
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  backgroundColor: "#D4500A",
                  color: "#FFFFFF",
                  padding: "4px 12px",
                  borderRadius: 8,
                  marginBottom: 24,
                  position: "relative",
                }}
              >
                Recomendado
              </span>
              <div style={{ marginBottom: 4, position: "relative" }}>
                <span
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: "#FAF8F5",
                    fontFamily: "var(--font-dm-mono)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  R$ 39,90
                </span>
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 28, position: "relative" }}>
                /mes - cancele quando quiser
              </p>

              <div className="flex flex-col gap-4" style={{ marginBottom: 28, position: "relative" }}>
                {[
                  "Tudo do Free",
                  "Historico completo de faturamento",
                  "Alertas inteligentes por email",
                  "Documentos do CNPJ em 1 clique",
                  "Projecao de limite anual",
                  "Suporte prioritario",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8l3.5 3.5L13 5"
                        stroke="#D4500A"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span style={{ fontSize: 14, color: "#FAF8F5" }}>{feat}</span>
                  </div>
                ))}
              </div>

              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 24,
                  lineHeight: 1.5,
                  position: "relative",
                }}
              >
                Menos de R$ 1,50 por dia. Menos que o cafe que voce toma enquanto trabalha.
              </p>

              <Link
                href="/cadastro"
                className="flex items-center justify-center btn-primary"
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: 12,
                  backgroundColor: "#D4500A",
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  position: "relative",
                  boxShadow: "0 0 24px rgba(212,80,10,0.3)",
                }}
              >
                Assinar o Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BLOCO 6 - Remove friction ========== */}
      <section
        id="friction"
        data-animate
        style={{
          opacity: isVisible("friction") ? 1 : 0,
          transform: isVisible("friction") ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        <div
          className="flex flex-col items-center text-center"
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "80px 24px 100px",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(24px, 3vw, 28px)",
              fontWeight: 600,
              color: "#2A1F14",
              letterSpacing: "-0.03em",
              lineHeight: 1.3,
              marginBottom: 16,
            }}
          >
            Sem contrato. Sem fidelidade. Sem precisar falar com ninguem pra comecar.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#7A6255",
              lineHeight: 1.7,
              marginBottom: 36,
            }}
          >
            Voce coloca o CNPJ, a gente busca seus dados na Receita Federal automaticamente e em dois minutos voce ja sabe como esta seu MEI.
          </p>
          <Link
            href="/cadastro"
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "18px 40px",
              borderRadius: 14,
              backgroundColor: "#D4500A",
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 0 30px rgba(212,80,10,0.2), 0 4px 16px rgba(0,0,0,0.1)",
            }}
          >
            Comecar agora
          </Link>
        </div>
      </section>

      {/* ========== FOOTER (dark) ========== */}
      <footer
        style={{
          backgroundColor: "#1A1310",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glow */}
        <div
          style={{
            position: "absolute",
            top: "-50%",
            left: "50%",
            width: 500,
            height: 500,
            transform: "translateX(-50%)",
            background: "radial-gradient(circle, rgba(212,80,10,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "72px 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <p
            className="text-center"
            style={{
              fontSize: "clamp(18px, 2.5vw, 22px)",
              fontWeight: 500,
              color: "rgba(250,248,245,0.8)",
              lineHeight: 1.5,
              marginBottom: 56,
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Voce ja tem o trabalho mais dificil resolvido. O Guiado cuida do resto.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 28,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center font-bold"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  backgroundColor: "#D4500A",
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                G
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#FAF8F5",
                  fontFamily: "var(--font-dm-sans)",
                  letterSpacing: "-0.03em",
                }}
              >
                Guiado
              </span>
            </div>

            <div className="flex items-center gap-6">
              {["Termos", "Privacidade", "Contato"].map((label) => (
                <Link
                  key={label}
                  href="#"
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.35)",
                    textDecoration: "none",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>2026 Guiado</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
