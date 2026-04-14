import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request) {
  const supabase = createAdmin();

  // Verificar token
  const token = request.headers.get("x-hubla-token");
  if (token !== process.env.HUBLA_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Idempotencia
  const idempotencyId = request.headers.get("x-hubla-idempotency") || "";
  if (idempotencyId) {
    const { data: existing } = await supabase
      .from("webhook_logs")
      .select("id")
      .eq("id", idempotencyId)
      .single();

    if (existing) {
      return NextResponse.json({ message: "Already processed" });
    }
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const eventType = body?.event;
  const memberEmail = body?.member?.email || body?.data?.member?.email || "";
  const memberId = body?.member?.id || body?.data?.member?.id || "";

  try {
    // Registrar evento
    if (idempotencyId) {
      await supabase.from("webhook_logs").insert({ id: idempotencyId, tipo: eventType }).select();
    }

    if (eventType === "member.granted") {
      // Buscar usuario pelo email
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find((u) => u.email === memberEmail);

      if (user) {
        await supabase.from("profiles").update({
          plano: "pro",
          hubla_member_id: memberId,
          plano_valido_ate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        }).eq("id", user.id);
      } else {
        // Salvar pra ativar quando criar conta
        await supabase.from("hubla_pending_activations").insert({
          email: memberEmail,
          hubla_member_id: memberId,
        });
      }

      return NextResponse.json({ success: true });
    }

    if (eventType === "member.revoked") {
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find((u) => u.email === memberEmail);

      if (user) {
        await supabase.from("profiles").update({ plano: "free" }).eq("id", user.id);
      }

      return NextResponse.json({ success: true });
    }

    if (eventType === "subscription.activated") {
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find((u) => u.email === memberEmail);

      if (user) {
        await supabase.from("profiles").update({ plano: "pro" }).eq("id", user.id);
      }

      return NextResponse.json({ success: true });
    }

    if (eventType === "subscription.deactivated") {
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find((u) => u.email === memberEmail);

      if (user) {
        await supabase.from("profiles").update({ plano: "free" }).eq("id", user.id);
      }

      return NextResponse.json({ success: true });
    }

    if (eventType === "invoice.payment_failed") {
      // Apenas logar - notificacao sera gerada automaticamente pelo useNotificacoes
      return NextResponse.json({ success: true });
    }

    // Evento nao tratado
    return NextResponse.json({ success: true, message: "Event ignored" });

  } catch (err) {
    console.error("Hubla webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
