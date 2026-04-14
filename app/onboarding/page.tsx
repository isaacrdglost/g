"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { processarOnboarding } from "@/lib/onboarding-service";
import AuthMapBg from "@/components/AuthMapBg";
import Image from "next/image";

// Mascara CNPJ: XX.XXX.XXX/XXXX-XX
function aplicarMascaraCnpj(valor: string): string {
  const nums = valor.replace(/\D/g, "").slice(0, 14);
  if (nums.length <= 2) return nums;
  if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
  if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
  if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
  return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
}

function extrairDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

// Perguntas do quiz
const perguntas = [
  {
    texto: "Voce tem clientes fixos todo mes?",
    chave: "clientesFixos",
    opcoes: [
      { label: "Sim, tenho contratos fixos", valor: "fixos" },
      { label: "As vezes, varia bastante", valor: "variavel" },
      { label: "Ainda estou comecando", valor: "comecando" },
    ],
  },
  {
    texto: "Qual sua media mensal aproximada?",
    chave: "mediaMensal",
    opcoes: [
      { label: "Ate R$ 2.000", valor: "ate_2000" },
      { label: "R$ 2.000 a R$ 4.000", valor: "2000_4000" },
      { label: "R$ 4.000 a R$ 6.750", valor: "4000_6750" },
      { label: "Acima de R$ 6.750", valor: "acima_6750" },
    ],
  },
  {
    texto: "Ha quantos meses voce fatura como MEI?",
    chave: "tempoMei",
    opcoes: [
      { label: "Menos de 6 meses", valor: "menos_6" },
      { label: "6 a 12 meses", valor: "6_12" },
      { label: "Mais de 1 ano", valor: "mais_1_ano" },
    ],
  },
];

// Mensagens de processamento
const mensagensProcessamento = [
  "Calculando seu limite anual...",
  "Gerando historico de DAS desde sua abertura...",
  "Montando seu calendario fiscal...",
  "Seu dashboard esta pronto.",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cnpjInput, setCnpjInput] = useState("");
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const [erroCnpj, setErroCnpj] = useState("");
  const [dadosCnpj, setDadosCnpj] = useState<any>(null);

  // Quiz
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostasQuiz, setRespostasQuiz] = useState<Record<string, string>>({});

  // Processamento
  const [mensagemIdx, setMensagemIdx] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [resultadoOnboarding, setResultadoOnboarding] = useState<any>(null);

  // Pular onboarding
  const [mostrarAvisoPular, setMostrarAvisoPular] = useState(false);

  // Usuario
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
      else router.push("/entrar");
    });
  }, [router]);

  // Buscar CNPJ automaticamente quando atingir 14 digitos
  const jaFezBusca = useRef(false);
  useEffect(() => {
    const raw = extrairDigitos(cnpjInput);
    if (raw.length === 14 && !jaFezBusca.current) {
      jaFezBusca.current = true;
      buscarCnpj(raw);
    }
    if (raw.length < 14) {
      jaFezBusca.current = false;
    }
  }, [cnpjInput]);

  async function buscarCnpj(cnpj: string) {
    setBuscandoCnpj(true);
    setErroCnpj("");
    setDadosCnpj(null);

    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!res.ok) throw new Error("CNPJ nao encontrado");
      const data = await res.json();
      setDadosCnpj(data);
    } catch {
      setErroCnpj("Nao foi possivel encontrar esse CNPJ. Verifique o numero e tente novamente.");
    } finally {
      setBuscandoCnpj(false);
    }
  }

  // Selecionar resposta do quiz
  function selecionarResposta(chave: string, valor: string) {
    const novas = { ...respostasQuiz, [chave]: valor };
    setRespostasQuiz(novas);

    if (perguntaAtual < perguntas.length - 1) {
      setTimeout(() => setPerguntaAtual(perguntaAtual + 1), 300);
    } else {
      // Ultima pergunta respondida, avancar para processamento
      setTimeout(() => {
        setStep(3);
        executarProcessamento(novas);
      }, 300);
    }
  }

  // Processamento step 3
  async function executarProcessamento(respostas: Record<string, string>) {
    // Animar mensagens
    const intervalo = setInterval(() => {
      setMensagemIdx((prev) => {
        if (prev < mensagensProcessamento.length - 1) return prev + 1;
        clearInterval(intervalo);
        return prev;
      });
    }, 750);

    // Animar progresso
    setProgresso(0);
    requestAnimationFrame(() => setProgresso(100));

    // Executar processamento real
    try {
      const supabase = createClient();
      const rawCnpj = extrairDigitos(cnpjInput);

      await supabase
        .from("profiles")
        .update({
          cnpj: rawCnpj,
          nome_fantasia: dadosCnpj.nome_fantasia,
          cnae: dadosCnpj.cnae_fiscal?.toString(),
          situacao: dadosCnpj.descricao_situacao_cadastral,
        })
        .eq("id", user.id);

      const resultado = await processarOnboarding(user.id, dadosCnpj, respostas);
      setResultadoOnboarding(resultado);
    } catch (err) {
      console.error("Erro no processamento:", err);
    }

    // Garantir pelo menos 3s de animacao
    setTimeout(() => {
      setStep(4);
    }, 3000);
  }

  // Calcular estimativa de percentual do limite
  function calcularPercentual(): number {
    if (!resultadoOnboarding) return 0;
    const limite = 81000;
    const faturado = resultadoOnboarding.faturamentoEstimado || 0;
    return Math.min(Math.round((faturado / limite) * 100), 100);
  }

  // Step indicator
  function renderStepIndicator() {
    return (
      <div className="flex items-center justify-center gap-0" style={{ marginBottom: 40 }}>
        {[1, 2, 3, 4].map((s, i) => (
          <div key={s} className="flex items-center">
            {/* Circulo */}
            <div
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: step > s ? "#D4500A" : step === s ? "#D4500A" : "rgba(255,255,255,0.08)",
                border: step >= s ? "none" : "1px solid rgba(255,255,255,0.15)",
                transition: "all 0.3s ease",
              }}
            >
              {step > s ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7L6 10L11 4" stroke="#FAF8F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: step === s ? "#FAF8F5" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {s}
                </span>
              )}
            </div>
            {/* Linha conectora */}
            {i < 3 && (
              <div
                style={{
                  width: 48,
                  height: 2,
                  backgroundColor: step > s ? "#D4500A" : "rgba(255,255,255,0.1)",
                  transition: "background-color 0.3s ease",
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // STEP 1 - CNPJ
  function renderStep1() {
    return (
      <div style={{ animation: "fadeIn 0.4s ease-out" }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#FAF8F5",
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          Qual o CNPJ do seu MEI?
        </h1>
        <p style={{ fontSize: 15, color: "#7A6255", marginBottom: 32, lineHeight: 1.6 }}>
          A gente busca seus dados automaticamente.
        </p>

        <input
          type="text"
          value={cnpjInput}
          onChange={(e) => setCnpjInput(aplicarMascaraCnpj(e.target.value))}
          placeholder="00.000.000/0000-00"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(255,255,255,0.05)",
            color: "#FAF8F5",
            fontSize: 18,
            fontFamily: "var(--font-dm-mono)",
            letterSpacing: "0.02em",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#D4500A";
            e.target.style.boxShadow = "0 0 0 3px rgba(212,80,10,0.15)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,255,255,0.1)";
            e.target.style.boxShadow = "none";
          }}
          autoFocus
        />

        {buscandoCnpj && (
          <div
            className="flex items-center gap-3"
            style={{ marginTop: 24, animation: "fadeIn 0.3s ease-out" }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                border: "2px solid rgba(212,80,10,0.3)",
                borderTopColor: "#D4500A",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: 14, color: "#7A6255" }}>
              Buscando seu MEI na Receita Federal...
            </span>
          </div>
        )}

        {erroCnpj && (
          <div
            style={{
              marginTop: 20,
              padding: "14px 16px",
              borderRadius: 12,
              backgroundColor: "rgba(224,82,82,0.1)",
              border: "1px solid rgba(224,82,82,0.2)",
              color: "#E05252",
              fontSize: 14,
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            {erroCnpj}
          </div>
        )}

        {dadosCnpj && (
          <div style={{ marginTop: 24, animation: "fadeIn 0.4s ease-out" }}>
            <div
              style={{
                padding: 20,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
                DADOS DO SEU MEI
              </p>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#FAF8F5", marginBottom: 8 }}>
                {dadosCnpj.nome_fantasia || dadosCnpj.razao_social}
              </p>
              <div className="flex flex-col gap-2" style={{ marginTop: 12 }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Situacao:</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: dadosCnpj.descricao_situacao_cadastral === "ATIVA" ? "#4CAF50" : "#E05252",
                    }}
                  >
                    {dadosCnpj.descricao_situacao_cadastral}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>CNAE:</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    {dadosCnpj.cnae_fiscal_descricao}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Municipio:</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    {dadosCnpj.municipio}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Abertura:</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-dm-mono)" }}>
                    {dadosCnpj.data_inicio_atividade}
                  </span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: "#7A6255", marginTop: 16 }}>
              Encontramos seu MEI. Essas informacoes vieram direto da Receita Federal.
            </p>

            <button
              onClick={() => setStep(2)}
              style={{
                width: "100%",
                marginTop: 20,
                padding: "14px 24px",
                borderRadius: 12,
                backgroundColor: "#D4500A",
                color: "#FAF8F5",
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-0.5px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(0.5px)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-0.5px)")}
            >
              Esse sou eu, continuar
            </button>
          </div>
        )}
      </div>
    );
  }

  // STEP 2 - Quiz
  function renderStep2() {
    const pergunta = perguntas[perguntaAtual];
    return (
      <div key={perguntaAtual} style={{ animation: "fadeIn 0.4s ease-out" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            marginBottom: 12,
          }}
        >
          PERGUNTA {perguntaAtual + 1} DE {perguntas.length}
        </p>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#FAF8F5",
            letterSpacing: "-0.03em",
            marginBottom: 28,
          }}
        >
          {pergunta.texto}
        </h2>

        <div className="flex flex-col gap-3">
          {pergunta.opcoes.map((opcao) => {
            const selecionado = respostasQuiz[pergunta.chave] === opcao.valor;
            return (
              <button
                key={opcao.valor}
                onClick={() => selecionarResposta(pergunta.chave, opcao.valor)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  borderRadius: 14,
                  backgroundColor: selecionado ? "#D4500A" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selecionado ? "#D4500A" : "rgba(255,255,255,0.08)"}`,
                  color: selecionado ? "#FFFFFF" : "#FAF8F5",
                  fontSize: 15,
                  fontWeight: 500,
                  textAlign: "left" as const,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!selecionado) {
                    e.currentTarget.style.borderColor = "#D4500A";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selecionado) {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }
                }}
              >
                {opcao.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // STEP 3 - Processamento
  function renderStep3() {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ minHeight: 280, animation: "fadeIn 0.4s ease-out" }}
      >
        <div className="flex flex-col items-center gap-6" style={{ width: "100%" }}>
          {/* Mensagens */}
          <div className="flex flex-col items-center gap-3" style={{ minHeight: 80 }}>
            {mensagensProcessamento.map((msg, i) => (
              <p
                key={i}
                style={{
                  fontSize: 15,
                  color: i === mensagemIdx ? "#FAF8F5" : "rgba(255,255,255,0.2)",
                  fontWeight: i === mensagemIdx ? 500 : 400,
                  transition: "all 0.4s ease",
                  opacity: i <= mensagemIdx ? 1 : 0,
                  transform: i <= mensagemIdx ? "translateY(0)" : "translateY(8px)",
                  display: i <= mensagemIdx ? "block" : "none",
                }}
              >
                {i < mensagemIdx && (
                  <span style={{ color: "#D4500A", marginRight: 8 }}>&#10003;</span>
                )}
                {msg}
              </p>
            ))}
          </div>

          {/* Barra de progresso */}
          <div
            style={{
              width: "100%",
              height: 4,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.08)",
              overflow: "hidden",
              marginTop: 16,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progresso}%`,
                backgroundColor: "#D4500A",
                borderRadius: 2,
                transition: "width 3s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // STEP 4 - Preview e CTA
  function renderStep4() {
    const percentual = calcularPercentual();
    const dasGerados = resultadoOnboarding?.dasGerados || 0;
    const faturamentoEstimado = resultadoOnboarding?.faturamentoEstimado || 0;

    return (
      <div style={{ animation: "fadeIn 0.5s ease-out" }}>
        <div className="text-center" style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#FAF8F5",
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          >
            Tudo organizado e esperando por voce.
          </h1>
          <p style={{ fontSize: 15, color: "#7A6255", lineHeight: 1.6 }}>
            Seu MEI agora tem controle de verdade.
          </p>
        </div>

        {/* Mini dashboard preview */}
        <div
          style={{
            padding: 24,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 24,
          }}
        >
          {/* Barra de limite */}
          <div style={{ marginBottom: 20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                LIMITE ANUAL
              </span>
              <span
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#FAF8F5",
                  letterSpacing: "-0.02em",
                }}
              >
                {percentual}%
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${percentual}%`,
                  backgroundColor: percentual >= 90 ? "#E05252" : percentual >= 75 ? "#F5A623" : "#D4500A",
                  borderRadius: 4,
                  transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
                DAS GERADOS
              </p>
              <p
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#FAF8F5",
                  letterSpacing: "-0.02em",
                }}
              >
                {dasGerados}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>meses</p>
            </div>
            <div
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
                FATURAMENTO EST.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#FAF8F5",
                  letterSpacing: "-0.02em",
                }}
              >
                {faturamentoEstimado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          style={{
            width: "100%",
            padding: "16px 24px",
            borderRadius: 12,
            backgroundColor: "#D4500A",
            color: "#FAF8F5",
            fontSize: 16,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-0.5px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(0.5px)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-0.5px)")}
        >
          Acessar meu dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      className="auth-bg flex items-center justify-center"
      style={{ padding: 16, minHeight: "100vh" }}
    >
      <AuthMapBg />

      <div
        className="flex flex-col w-full"
        style={{
          maxWidth: 600,
          borderRadius: 24,
          padding: 40,
          backgroundColor: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div className="flex justify-center" style={{ marginBottom: 32 }}>
          <Image
            src="/logo-v1-dark.svg"
            alt="Guiado"
            width={32}
            height={32}
          />
        </div>

        {/* Step indicator */}
        {renderStepIndicator()}

        {/* Conteudo do step */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* Popup de pular */}
        {mostrarAvisoPular && (
          <>
            <div onClick={() => setMostrarAvisoPular(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 100 }} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 101, width: "100%", maxWidth: 360, backgroundColor: "#141414", borderRadius: 20, padding: "28px 24px", textAlign: "center", boxShadow: "0 12px 48px rgba(0,0,0,0.5)", animation: "fadeIn 0.2s ease-out" }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#FAF8F5", marginBottom: 10 }}>Pular cadastro?</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 24 }}>
                Seus dados sao importantes pra ativar o controle do seu MEI. Sem eles, a plataforma fica limitada.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setMostrarAvisoPular(false)}
                  className="cursor-pointer"
                  style={{ width: "100%", padding: "12px", borderRadius: 12, backgroundColor: "#D4500A", color: "#FFFFFF", fontWeight: 600, fontSize: 14, border: "none" }}
                >
                  Continuar cadastro
                </button>
                <button
                  onClick={async () => {
                    if (user) {
                      const supabase = createClient();
                      await supabase.from("profiles").update({ onboarding_completo: false }).eq("id", user.id);
                    }
                    router.push("/dashboard");
                  }}
                  className="cursor-pointer"
                  style={{ width: "100%", padding: "10px", borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 500, border: "none" }}
                >
                  Pular mesmo assim
                </button>
              </div>
            </div>
          </>
        )}

        {/* Botao pular - discreto */}
        {step < 3 && !mostrarAvisoPular && (
          <button
            onClick={() => setMostrarAvisoPular(true)}
            className="cursor-pointer"
            style={{ marginTop: 24, background: "none", border: "none", color: "rgba(255,255,255,0.15)", fontSize: 12, padding: 0, textAlign: "center", width: "100%", transition: "color 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.15)"; }}
          >
            Pular por enquanto
          </button>
        )}
      </div>

      {/* Animacoes inline */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
