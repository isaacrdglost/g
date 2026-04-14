import { createClient } from "@/lib/supabase";

// Valor DAS por tipo de CNAE
function calcularValorDasPorCnae(cnae) {
  if (!cnae) return 86.05;
  const primeiro = String(cnae).charAt(0);
  // Servicos (6, 7, 8, 9): R$ 81,05 + R$ 5,00 ISS
  if (["6", "7", "8", "9"].includes(primeiro)) return 86.05;
  // Comercio/Industria (1, 2, 3, 4, 5): R$ 81,05 + R$ 1,00 ICMS
  return 82.05;
}

// Media mensal baseada na faixa do quiz
function mediaFaixaQuiz(faixa) {
  switch (faixa) {
    case "ate_2000": return 1500;
    case "2000_4000": return 3000;
    case "4000_6750": return 5375;
    case "acima_6750": return 7000;
    default: return 3000;
  }
}

// Gerar array de meses entre duas datas (YYYY-MM-01)
function gerarMesesEntre(dataAbertura, hoje) {
  const meses = [];
  const [anoIni, mesIni] = dataAbertura.split("-").map(Number);
  const anoFim = hoje.getFullYear();
  const mesFim = hoje.getMonth() + 1;

  let ano = anoIni;
  let mes = mesIni;

  while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
    meses.push(`${ano}-${String(mes).padStart(2, "0")}-01`);
    mes++;
    if (mes > 12) { mes = 1; ano++; }
  }

  return meses;
}

export async function processarOnboarding(userId, dadosCnpj, respostasQuiz) {
  const supabase = createClient();
  const hoje = new Date();

  const cnae = dadosCnpj?.cnae_fiscal?.toString() || "";
  const dataAbertura = dadosCnpj?.data_inicio_atividade || "";
  const valorDas = calcularValorDasPorCnae(cnae);

  // Calcular meses desde abertura
  const meses = dataAbertura ? gerarMesesEntre(dataAbertura, hoje) : [];

  // 2a. Gerar historico de DAS
  if (meses.length > 0) {
    // Verificar DAS ja existentes
    const { data: existentes } = await supabase
      .from("das_payments")
      .select("competencia")
      .eq("user_id", userId);

    const competenciasExistentes = new Set((existentes || []).map((d) => d.competencia));

    const novosDas = meses
      .filter((m) => !competenciasExistentes.has(m))
      .map((m) => ({
        user_id: userId,
        competencia: m,
        valor: valorDas,
        status: "desconhecido",
        origem: "gerado_automatico",
      }));

    if (novosDas.length > 0) {
      await supabase.from("das_payments").insert(novosDas);
    }
  }

  // 2b. Estimar faturamento acumulado
  const mediaMensal = mediaFaixaQuiz(respostasQuiz?.mediaMensal);
  const mesesAtivos = meses.length;

  if (mesesAtivos > 0 && mediaMensal > 0) {
    // Verificar faturamentos ja existentes
    const { data: fatExistentes } = await supabase
      .from("faturamento")
      .select("mes")
      .eq("user_id", userId);

    const mesesFatExistentes = new Set((fatExistentes || []).map((f) => f.mes));

    const novosFat = meses
      .filter((m) => !mesesFatExistentes.has(m))
      .map((m) => ({
        user_id: userId,
        mes: m,
        valor: mediaMensal,
        descricao: "Estimativa baseada no seu perfil",
        origem: "estimativa_onboarding",
        confirmado: false,
      }));

    if (novosFat.length > 0) {
      await supabase.from("faturamento").insert(novosFat);
    }
  }

  // 2c. Calendario fiscal automatico
  const anoAtual = hoje.getFullYear();

  // DASN anual - vence 31 de maio
  await supabase.from("obrigacoes").upsert({
    user_id: userId,
    tipo: "dasn",
    descricao: `Declaracao Anual do MEI ${anoAtual}`,
    data_vencimento: `${anoAtual}-05-31`,
    status: "pendente",
    recorrente: true,
    criado_automaticamente: true,
  }, { onConflict: "user_id, tipo, data_vencimento", ignoreDuplicates: true }).select();

  // Marcar onboarding como completo
  await supabase
    .from("profiles")
    .update({ onboarding_completo: true })
    .eq("id", userId);

  // Inserir na fila de atualizacao manual de DAS (apenas Pro)
  const { data: perfilData } = await supabase
    .from("profiles")
    .select("nome_completo, plano")
    .eq("id", userId)
    .single();

  if (perfilData?.plano === "pro" || perfilData?.plano === "anual") {
    try {
      await supabase.from("das_pendentes_atualizacao").insert({
        user_id: userId,
        cnpj: dadosCnpj?.cnpj?.replace(/\D/g, "") || "",
        nome_completo: perfilData?.nome_completo || "",
        status: "pendente",
      });
    } catch {}
  }

  return {
    dasGerados: meses.length,
    faturamentoEstimado: mediaMensal * mesesAtivos,
    valorDas,
  };
}
