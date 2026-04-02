import Link from "next/link";

export default function Home() {
  return (
    <div style={{ backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      {/* ========== NAV ========== */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "rgba(250,248,245,0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #E8E3DA",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "16px 24px",
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
                color: "#2A1F14",
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
                color: "#2A1F14",
                textDecoration: "none",
                padding: "8px 16px",
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
                color: "#FFFFFF",
                backgroundColor: "#D4500A",
                textDecoration: "none",
                padding: "12px 24px",
                borderRadius: 12,
              }}
            >
              Comecar gratis
            </Link>
          </div>
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
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Hero text */}
          <div className="flex-1" style={{ maxWidth: 560 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#D4500A",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Para MEIs que trabalham no digital
            </span>
            <h1
              style={{
                fontSize: 44,
                fontWeight: 600,
                color: "#2A1F14",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginTop: 16,
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Voce trabalha no digital. Sabe entregar resultado pro cliente.
            </h1>
            <p
              style={{
                fontSize: 18,
                color: "#5C4535",
                lineHeight: 1.7,
                marginTop: 20,
              }}
            >
              Mas quando o assunto e o seu proprio CNPJ, bate aquela sensacao de que alguma coisa pode estar errada e voce nem sabe.
            </p>
            <p
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#D4500A",
                marginTop: 20,
              }}
            >
              O Guiado resolve isso.
            </p>
            <p
              style={{
                fontSize: 16,
                color: "#7A6255",
                lineHeight: 1.7,
                marginTop: 12,
              }}
            >
              Seu MEI organizado, seu limite monitorado, suas obrigacoes em dia. Tudo num lugar so, sem precisar de contador e sem precisar entrar no gov.br.
            </p>
            <Link
              href="/cadastro"
              className="transition-opacity hover:opacity-90"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 32px",
                borderRadius: 12,
                backgroundColor: "#D4500A",
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: 600,
                textDecoration: "none",
                marginTop: 32,
              }}
            >
              Comecar gratis
            </Link>
          </div>

          {/* Dashboard mockup */}
          <div className="flex-1" style={{ maxWidth: 520, width: "100%" }}>
            <div
              style={{
                backgroundColor: "#2A1F14",
                borderRadius: 16,
                padding: 24,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle glow */}
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(212,80,10,0.15) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              {/* Mockup header */}
              <div className="flex items-center gap-2" style={{ marginBottom: 20, position: "relative" }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    backgroundColor: "#D4500A",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#FFFFFF",
                  }}
                >
                  G
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(250,248,245,0.7)" }}>
                  Dashboard
                </span>
              </div>

              {/* Limit bar */}
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  position: "relative",
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Limite anual</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.6)",
                      fontFamily: "var(--font-dm-mono)",
                    }}
                  >
                    R$ 47.800 / R$ 81.000
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "59%",
                      height: "100%",
                      backgroundColor: "#D4500A",
                      borderRadius: 4,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.35)",
                    marginTop: 6,
                    display: "block",
                    fontFamily: "var(--font-dm-mono)",
                  }}
                >
                  59% utilizado
                </span>
              </div>

              {/* Two cards */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  style={{
                    backgroundColor: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", display: "block" }}>
                    DAS deste mes
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#FAF8F5",
                      fontFamily: "var(--font-dm-mono)",
                      display: "block",
                      marginTop: 4,
                    }}
                  >
                    R$ 71,60
                  </span>
                  <span style={{ fontSize: 10, color: "#D4500A", fontWeight: 500, marginTop: 6, display: "block" }}>
                    Vence em 8 dias
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", display: "block" }}>
                    Faturamento do mes
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#FAF8F5",
                      fontFamily: "var(--font-dm-mono)",
                      display: "block",
                      marginTop: 4,
                    }}
                  >
                    R$ 4.200
                  </span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 6, display: "block" }}>
                    3 lancamentos
                  </span>
                </div>
              </div>

              {/* Mini chart bars */}
              <div style={{ marginTop: 16, display: "flex", alignItems: "flex-end", gap: 6, height: 48 }}>
                {[32, 45, 28, 52, 40, 60, 38, 55, 44, 68, 50, 72].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      backgroundColor: i === 11 ? "#D4500A" : "rgba(255,255,255,0.1)",
                      borderRadius: 3,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BLOCO 1 - Nomear a dor ========== */}
      <section style={{ backgroundColor: "#F2EFE9" }}>
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
              fontSize: 32,
              fontWeight: 600,
              color: "#2A1F14",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: 48,
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
            ].map((item) => (
              <div
                key={item.num}
                className="flex items-start gap-4"
                style={{
                  backgroundColor: "#FAF8F5",
                  border: "1px solid #E8E3DA",
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(212,80,10,0.1)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#D4500A",
                      fontFamily: "var(--font-dm-mono)",
                    }}
                  >
                    {item.num}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 15,
                    color: "#2A1F14",
                    lineHeight: 1.6,
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
              marginTop: 40,
            }}
          >
            Se qualquer um desses aconteceu com voce, o Guiado foi feito pra voce.
          </p>
        </div>
      </section>

      {/* ========== BLOCO 2 - O que esta em jogo ========== */}
      <section style={{ backgroundColor: "#2A1F14" }}>
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "100px 24px",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Item 1 */}
            <div className="flex flex-col items-center text-center">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: "rgba(212,80,10,0.15)",
                  marginBottom: 20,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#FAF8F5",
                  marginBottom: 8,
                }}
              >
                Limite estourado
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                Estourar o limite do MEI sem perceber gera imposto retroativo sobre o ano inteiro.
              </p>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col items-center text-center">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: "rgba(212,80,10,0.15)",
                  marginBottom: 20,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                  <line x1="4" y1="4" x2="20" y2="20" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#FAF8F5",
                  marginBottom: 8,
                }}
              >
                Multa silenciosa
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                DAS atrasado acumula multa de 0,33% ao dia mais juros Selic. Silenciosamente, todo mes.
              </p>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col items-center text-center">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: "rgba(212,80,10,0.15)",
                  marginBottom: 20,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="8" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#FAF8F5",
                  marginBottom: 8,
                }}
              >
                CNPJ irregular
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                CNPJ irregular aparece na hora errada. Na hora de fechar o contrato que mais importa.
              </p>
            </div>
          </div>

          <p
            className="text-center"
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.5)",
              marginTop: 48,
              lineHeight: 1.6,
            }}
          >
            Nao e burocracia por burocracia. E o seu dinheiro e a sua reputacao profissional.
          </p>
        </div>
      </section>

      {/* ========== BLOCO 3 - A solucao ========== */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "#2A1F14",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            marginBottom: 56,
            maxWidth: 640,
          }}
        >
          O Guiado cuida do que voce nao deveria precisar se preocupar
        </h2>

        <div className="flex flex-col gap-12">
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
              className={`flex flex-col md:flex-row items-start gap-6 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
            >
              <div className="shrink-0">
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 300,
                    color: "rgba(212,80,10,0.2)",
                    fontFamily: "var(--font-dm-mono)",
                    lineHeight: 1,
                  }}
                >
                  {item.num}
                </span>
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#2A1F14",
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 15,
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
            marginTop: 48,
            lineHeight: 1.7,
            maxWidth: 640,
          }}
        >
          Nao substitui um contador pra quem precisa de um. Resolve tudo que o MEI digital consegue resolver sozinho, que e quase tudo.
        </p>
      </section>

      {/* ========== BLOCO 4 - Analogia ========== */}
      <section style={{ backgroundColor: "#F2EFE9" }}>
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
              fontSize: 24,
              fontWeight: 500,
              color: "#2A1F14",
              lineHeight: 1.5,
            }}
          >
            Voce nao terceiriza o Notion, o Figma ou o seu banco. Nao terceiriza porque sao ferramentas que te dao controle, nao dependencia.
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#D4500A",
              marginTop: 16,
            }}
          >
            O Guiado e isso pro seu CNPJ.
          </p>
        </div>
      </section>

      {/* ========== BLOCO 5 - Planos ========== */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <h2
          className="text-center"
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "#2A1F14",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            marginBottom: 48,
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
              borderRadius: 16,
              padding: 32,
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
                padding: "4px 10px",
                borderRadius: 6,
                marginBottom: 20,
              }}
            >
              Gratis
            </span>
            <div style={{ marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#2A1F14",
                  fontFamily: "var(--font-dm-mono)",
                }}
              >
                R$ 0
              </span>
            </div>
            <p style={{ fontSize: 14, color: "#7A6255", marginBottom: 24 }}>
              /mes, para sempre
            </p>

            <div className="flex flex-col gap-3" style={{ marginBottom: 28 }}>
              {[
                "Dashboard com limite anual",
                "DAS do mes atual",
                "Situacao cadastral",
                "Saia do zero e entenda onde esta",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="#5C4535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 14, color: "#2A1F14" }}>{feat}</span>
                </div>
              ))}
            </div>

            <Link
              href="/cadastro"
              className="flex items-center justify-center transition-opacity hover:opacity-90"
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
              borderRadius: 16,
              padding: 32,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle glow */}
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(212,80,10,0.2) 0%, transparent 70%)",
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
                padding: "4px 10px",
                borderRadius: 6,
                marginBottom: 20,
                position: "relative",
              }}
            >
              Recomendado
            </span>
            <div style={{ marginBottom: 4, position: "relative" }}>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#FAF8F5",
                  fontFamily: "var(--font-dm-mono)",
                }}
              >
                R$ 39,90
              </span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24, position: "relative" }}>
              /mes - cancele quando quiser
            </p>

            <div className="flex flex-col gap-3" style={{ marginBottom: 24, position: "relative" }}>
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
                    <path d="M3 8l3.5 3.5L13 5" stroke="#D4500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 14, color: "#FAF8F5" }}>{feat}</span>
                </div>
              ))}
            </div>

            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 20,
                lineHeight: 1.5,
                position: "relative",
              }}
            >
              Menos de R$ 1,50 por dia. Menos que o cafe que voce toma enquanto trabalha.
            </p>

            <Link
              href="/cadastro"
              className="flex items-center justify-center transition-opacity hover:opacity-90"
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
              }}
            >
              Assinar o Pro
            </Link>
          </div>
        </div>
      </section>

      {/* ========== BLOCO 6 - Remover friccao ========== */}
      <section>
        <div
          className="flex flex-col items-center text-center"
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "100px 24px",
          }}
        >
          <h2
            style={{
              fontSize: 28,
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
              marginBottom: 32,
            }}
          >
            Voce coloca o CNPJ, a gente busca seus dados na Receita Federal automaticamente e em dois minutos voce ja sabe como esta seu MEI.
          </p>
          <Link
            href="/cadastro"
            className="transition-opacity hover:opacity-90"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 32px",
              borderRadius: 12,
              backgroundColor: "#D4500A",
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Comecar agora
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={{ backgroundColor: "#2A1F14" }}>
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "64px 24px",
          }}
        >
          <p
            className="text-center"
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "#FAF8F5",
              lineHeight: 1.5,
              marginBottom: 48,
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
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 24,
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
                    color: "rgba(255,255,255,0.4)",
                    textDecoration: "none",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              2026 Guiado
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
