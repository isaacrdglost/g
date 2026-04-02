import Link from "next/link";

export default function Home() {
  return (
    <div style={{ backgroundColor: "#F7F7F5", minHeight: "100vh" }}>
      {/* ========== NAV ========== */}
      <nav
        className="flex items-center justify-between"
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "24px 24px",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center font-bold"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: "#D4E600",
              color: "#1C1C1C",
              fontSize: 18,
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
        <div className="flex items-center gap-3">
          <Link
            href="/entrar"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#1C1C1C",
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: 8,
            }}
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="transition-opacity hover:opacity-90"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#D4E600",
              backgroundColor: "#1C1C1C",
              textDecoration: "none",
              padding: "8px 20px",
              borderRadius: 8,
            }}
          >
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "80px 24px 100px",
        }}
      >
        <div
          className="flex flex-col lg:flex-row items-center gap-16"
        >
          {/* Hero text */}
          <div className="flex-1" style={{ maxWidth: 520 }}>
            <h1
              style={{
                fontSize: 52,
                fontWeight: 600,
                color: "#1C1C1C",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Seu MEI organizado, sem complicação
            </h1>
            <p
              style={{
                fontSize: 18,
                color: "#8A8A8A",
                lineHeight: 1.6,
                marginTop: 24,
              }}
            >
              Acompanhe faturamento, DAS e obrigações do seu MEI em um só lugar.
              Tudo simples, direto e feito pra quem não tem tempo pra burocracia.
            </p>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 36 }}>
              <Link
                href="/cadastro"
                className="transition-opacity hover:opacity-90"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 32px",
                  borderRadius: 8,
                  backgroundColor: "#1C1C1C",
                  color: "#D4E600",
                  fontSize: 16,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Começar grátis
              </Link>
              <Link
                href="/entrar"
                className="transition-opacity hover:opacity-90"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 32px",
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  color: "#1C1C1C",
                  fontSize: 16,
                  fontWeight: 600,
                  border: "1px solid #D6D6D6",
                  textDecoration: "none",
                }}
              >
                Já tenho conta
              </Link>
            </div>
          </div>

          {/* Dashboard preview mockup */}
          <div className="flex-1" style={{ maxWidth: 520, width: "100%" }}>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D6D6D6",
                borderRadius: 12,
                padding: 24,
              }}
            >
              {/* Mockup header */}
              <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    backgroundColor: "#D4E600",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1C1C1C",
                  }}
                >
                  G
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1C" }}>
                  Dashboard
                </span>
              </div>

              {/* Limit bar mockup */}
              <div style={{ marginBottom: 20 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#8A8A8A" }}>Limite anual</span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#1C1C1C",
                      fontFamily: "var(--font-dm-mono)",
                      fontWeight: 500,
                    }}
                  >
                    R$ 47.800 / R$ 81.000
                  </span>
                </div>
                <div
                  style={{
                    height: 10,
                    backgroundColor: "#F3F3F3",
                    borderRadius: 5,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "59%",
                      height: "100%",
                      backgroundColor: "#D4E600",
                      borderRadius: 5,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: "#8A8A8A",
                    marginTop: 4,
                    display: "block",
                    fontFamily: "var(--font-dm-mono)",
                  }}
                >
                  59% utilizado
                </span>
              </div>

              {/* Two cards row */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  style={{
                    backgroundColor: "#F7F7F5",
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <span style={{ fontSize: 11, color: "#8A8A8A", display: "block" }}>
                    DAS deste mês
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#1C1C1C",
                      fontFamily: "var(--font-dm-mono)",
                      display: "block",
                      marginTop: 4,
                    }}
                  >
                    R$ 71,60
                  </span>
                  <span style={{ fontSize: 11, color: "#D4E600", fontWeight: 500, marginTop: 4, display: "block" }}>
                    Vence em 8 dias
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: "#F7F7F5",
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <span style={{ fontSize: 11, color: "#8A8A8A", display: "block" }}>
                    Faturamento do mês
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#1C1C1C",
                      fontFamily: "var(--font-dm-mono)",
                      display: "block",
                      marginTop: 4,
                    }}
                  >
                    R$ 4.200
                  </span>
                  <span style={{ fontSize: 11, color: "#8A8A8A", marginTop: 4, display: "block" }}>
                    3 lançamentos
                  </span>
                </div>
              </div>

              {/* Mini chart mockup */}
              <div style={{ marginTop: 16, display: "flex", alignItems: "flex-end", gap: 6, height: 48 }}>
                {[32, 45, 28, 52, 40, 60, 38, 55, 44, 68, 50, 72].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      backgroundColor: i === 11 ? "#D4E600" : "#EBEBEB",
                      borderRadius: 3,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <div className="text-center" style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#1C1C1C",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Tudo que seu MEI precisa
          </h2>
          <p style={{ fontSize: 16, color: "#8A8A8A", marginTop: 12, lineHeight: 1.6 }}>
            Simples, direto e sem linguagem complicada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D6D6D6",
              borderRadius: 12,
              padding: 28,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                backgroundColor: "rgba(212,230,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-4" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#1C1C1C",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Controle de faturamento
            </h3>
            <p style={{ fontSize: 14, color: "#8A8A8A", lineHeight: 1.6 }}>
              Veja quanto já faturou no ano e quanto falta para o limite de R$ 81 mil.
              Receba alertas antes de estourar.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D6D6D6",
              borderRadius: 12,
              padding: 28,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                backgroundColor: "rgba(212,230,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M8 14h.01" />
                <path d="M12 14h.01" />
                <path d="M16 14h.01" />
                <path d="M8 18h.01" />
                <path d="M12 18h.01" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#1C1C1C",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              DAS em dia
            </h3>
            <p style={{ fontSize: 14, color: "#8A8A8A", lineHeight: 1.6 }}>
              Saiba exatamente quando seu DAS vence e gere o boleto no PGMEI com 1 clique.
              Sem esquecer, sem multa.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D6D6D6",
              borderRadius: 12,
              padding: 28,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                backgroundColor: "rgba(212,230,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#1C1C1C",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Situação do CNPJ
            </h3>
            <p style={{ fontSize: 14, color: "#8A8A8A", lineHeight: 1.6 }}>
              Consulte a situação cadastral do seu CNPJ direto da Receita Federal.
              CNAE, nome fantasia e status sempre atualizados.
            </p>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <div className="text-center" style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#1C1C1C",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Como funciona
          </h2>
          <p style={{ fontSize: 16, color: "#8A8A8A", marginTop: 12, lineHeight: 1.6 }}>
            Três passos e você já está no controle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12" style={{ position: "relative" }}>
          {/* Connecting line - visible on md+ */}
          <div
            className="hidden md:block"
            style={{
              position: "absolute",
              top: 28,
              left: "calc(16.67% + 28px)",
              right: "calc(16.67% + 28px)",
              height: 2,
              backgroundColor: "#EBEBEB",
              zIndex: 0,
            }}
          />

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center" style={{ position: "relative", zIndex: 1 }}>
            <div
              className="flex items-center justify-center"
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#D4E600",
                color: "#1C1C1C",
                fontSize: 22,
                fontWeight: 600,
                fontFamily: "var(--font-dm-mono)",
                marginBottom: 20,
              }}
            >
              1
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#1C1C1C",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Cadastre seu CNPJ
            </h3>
            <p style={{ fontSize: 14, color: "#8A8A8A", lineHeight: 1.6 }}>
              Crie sua conta e informe o CNPJ do seu MEI. Leva menos de 1 minuto.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center" style={{ position: "relative", zIndex: 1 }}>
            <div
              className="flex items-center justify-center"
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#D4E600",
                color: "#1C1C1C",
                fontSize: 22,
                fontWeight: 600,
                fontFamily: "var(--font-dm-mono)",
                marginBottom: 20,
              }}
            >
              2
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#1C1C1C",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Seus dados aparecem automaticamente
            </h3>
            <p style={{ fontSize: 14, color: "#8A8A8A", lineHeight: 1.6 }}>
              Buscamos seus dados na Receita Federal e montamos seu painel completo.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center" style={{ position: "relative", zIndex: 1 }}>
            <div
              className="flex items-center justify-center"
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#D4E600",
                color: "#1C1C1C",
                fontSize: 22,
                fontWeight: 600,
                fontFamily: "var(--font-dm-mono)",
                marginBottom: 20,
              }}
            >
              3
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#1C1C1C",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Acompanhe tudo em um lugar só
            </h3>
            <p style={{ fontSize: 14, color: "#8A8A8A", lineHeight: 1.6 }}>
              Faturamento, DAS, obrigações e situação cadastral. Tudo num painel só.
            </p>
          </div>
        </div>
      </section>

      {/* ========== TRUST / SECURITY ========== */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <div className="text-center" style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#1C1C1C",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Seus dados seguros
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trust 1 */}
          <div
            className="flex flex-col items-center text-center"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D6D6D6",
              borderRadius: 12,
              padding: 32,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                backgroundColor: "rgba(212,230,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1C1C1C",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Dados da Receita Federal
            </h3>
            <p style={{ fontSize: 14, color: "#8A8A8A", lineHeight: 1.6 }}>
              Todas as informações vêm direto da base oficial da Receita, sempre atualizadas.
            </p>
          </div>

          {/* Trust 2 */}
          <div
            className="flex flex-col items-center text-center"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D6D6D6",
              borderRadius: 12,
              padding: 32,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                backgroundColor: "rgba(212,230,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1C1C1C",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Grátis para sempre no plano Free
            </h3>
            <p style={{ fontSize: 14, color: "#8A8A8A", lineHeight: 1.6 }}>
              O plano gratuito já inclui dashboard, barra de limite e DAS do mês. Sem prazo.
            </p>
          </div>

          {/* Trust 3 */}
          <div
            className="flex flex-col items-center text-center"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D6D6D6",
              borderRadius: 12,
              padding: 32,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                backgroundColor: "rgba(212,230,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1C1C1C",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Sem acesso às suas senhas bancárias
            </h3>
            <p style={{ fontSize: 14, color: "#8A8A8A", lineHeight: 1.6 }}>
              O Guiado organiza e direciona. Seus dados bancários ficam com você.
            </p>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "80px 24px 100px",
        }}
      >
        <div
          className="flex flex-col items-center text-center"
          style={{
            backgroundColor: "#1C1C1C",
            borderRadius: 12,
            padding: "64px 32px",
          }}
        >
          <h2
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Comece agora, é grátis
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#8A8A8A",
              marginTop: 12,
              lineHeight: 1.6,
            }}
          >
            Organize seu MEI em menos de 1 minuto.
          </p>
          <Link
            href="/cadastro"
            className="transition-opacity hover:opacity-90"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 36px",
              borderRadius: 8,
              backgroundColor: "#D4E600",
              color: "#1C1C1C",
              fontSize: 16,
              fontWeight: 600,
              textDecoration: "none",
              marginTop: 28,
            }}
          >
            Criar conta grátis
          </Link>
          <p
            style={{
              fontSize: 13,
              color: "#8A8A8A",
              marginTop: 12,
            }}
          >
            Sem cartão de crédito
          </p>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "32px 24px 48px",
          borderTop: "1px solid #EBEBEB",
        }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center font-bold"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#D4E600",
                color: "#1C1C1C",
                fontSize: 14,
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              G
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1C1C1C",
                fontFamily: "var(--font-dm-sans)",
                letterSpacing: "-0.03em",
              }}
            >
              Guiado
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#8A8A8A" }}>
            © 2026 Guiado. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
