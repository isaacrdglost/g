import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enviarEmailLembreteDAS } from "@/lib/email";

const MESES = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function createAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(request) {
  // Verificar autorizacao
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdmin();
  const hoje = new Date();
  const dia = hoje.getDate();
  const diasParaVencimento = 20 - dia;

  // So envia quando faltam exatamente 5 dias (dia 15)
  if (diasParaVencimento !== 5) {
    return NextResponse.json({ message: "Nao e dia de lembrete", diasParaVencimento });
  }

  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const competencia = `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-01`;
  const mesNome = MESES[mesAtual];

  try {
    // Buscar DAS pendentes do mes atual
    const { data: dasPendentes } = await supabase
      .from("das_payments")
      .select("user_id, valor")
      .eq("competencia", competencia)
      .neq("status", "pago");

    if (!dasPendentes || dasPendentes.length === 0) {
      return NextResponse.json({ message: "Nenhum DAS pendente", total: 0 });
    }

    let enviados = 0;
    for (const das of dasPendentes) {
      try {
        const { data: authData } = await supabase.auth.admin.getUserById(das.user_id);
        const { data: perfil } = await supabase.from("profiles").select("nome_completo").eq("id", das.user_id).single();

        if (authData?.user?.email) {
          const valor = Number(das.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
          await enviarEmailLembreteDAS(authData.user.email, perfil?.nome_completo || "", mesNome, valor, 5);
          enviados++;
        }
      } catch {}
    }

    return NextResponse.json({ message: "Lembretes enviados", enviados, total: dasPendentes.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
