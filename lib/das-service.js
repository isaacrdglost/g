import { calcularValorDas } from "@/lib/das-valores";

// Gerar array de datas (primeiro dia) dos ultimos N meses + mes atual
function gerarMeses(qtdAnteriores) {
  const hoje = new Date();
  const meses = [];

  for (let i = qtdAnteriores; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
    );
  }

  return meses;
}

// Chamar SOMENTE quando o usuario salva o CNPJ pela primeira vez
// Cria 6 meses anteriores + mes atual = 7 registros
// Usa upsert pra nunca duplicar
export async function inicializarDasUsuario(supabase, userId, cnae) {
  // Verificar se ja tem registros
  const { data: existentes } = await supabase
    .from("das_payments")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (existentes && existentes.length > 0) return;

  const valorDas = calcularValorDas(cnae);
  const meses = gerarMeses(6);

  const registros = meses.map((competencia) => ({
    user_id: userId,
    competencia,
    valor: valorDas,
    status: "pendente",
  }));

  await supabase
    .from("das_payments")
    .upsert(registros, { onConflict: "user_id,competencia", ignoreDuplicates: true });
}

// Atualizar status de DAS pendentes de meses anteriores para "atrasado"
// Chamar UMA VEZ por sessao no dashboard
export async function atualizarStatusDasAtrasados(supabase, userId) {
  // Flag pra nao rodar mais de uma vez por sessao
  if (typeof window !== "undefined") {
    const flag = sessionStorage.getItem("das_status_atualizado");
    if (flag === userId) return;
  }

  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;

  await supabase
    .from("das_payments")
    .update({ status: "atrasado" })
    .eq("user_id", userId)
    .eq("status", "pendente")
    .lt("competencia", mesAtual);

  if (typeof window !== "undefined") {
    sessionStorage.setItem("das_status_atualizado", userId);
  }
}
