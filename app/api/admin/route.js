import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const supabase = createAdminClient();

  try {
    if (action === "overview") {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const all = profiles || [];
      const freeCount = all.filter((p) => !p.plano || p.plano === "free").length;
      const proCount = all.filter((p) => p.plano === "pro" || p.plano === "anual").length;

      const todayStr = new Date().toISOString().split("T")[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      let ticketsAbertos = 0;
      try {
        const { count } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true })
          .eq("status", "aberto");
        ticketsAbertos = count || 0;
      } catch {}

      let recentTickets = [];
      try {
        const { data } = await supabase
          .from("tickets")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);
        recentTickets = data || [];
      } catch {}

      // Buscar emails dos usuarios via auth admin
      const usersWithEmail = await Promise.all(
        all.slice(0, 5).map(async (p) => {
          try {
            const { data } = await supabase.auth.admin.getUserById(p.id);
            return { ...p, email: data?.user?.email || "" };
          } catch {
            return { ...p, email: "" };
          }
        })
      );

      return NextResponse.json({
        metrics: {
          total: all.length,
          free: freeCount,
          pro: proCount,
          hoje: all.filter((p) => p.created_at >= todayStr).length,
          semana: all.filter((p) => p.created_at >= weekAgo.toISOString()).length,
          ticketsAbertos,
        },
        usuarios: usersWithEmail,
        tickets: recentTickets,
      });
    }

    if (action === "usuarios") {
      const page = parseInt(searchParams.get("page") || "0");
      const plano = searchParams.get("plano") || "todos";
      const busca = searchParams.get("busca") || "";
      const periodo = searchParams.get("periodo") || "todos";
      const pageSize = 20;

      let query = supabase.from("profiles").select("*", { count: "exact" });

      if (plano === "pro") query = query.in("plano", ["pro", "anual"]);
      else if (plano === "free") query = query.or("plano.eq.free,plano.is.null");

      if (busca) query = query.or(`nome_fantasia.ilike.%${busca}%,cnpj.ilike.%${busca}%`);

      if (periodo !== "todos") {
        const now = new Date();
        if (periodo === "hoje") query = query.gte("created_at", now.toISOString().split("T")[0]);
        else if (periodo === "7d") {
          now.setDate(now.getDate() - 7);
          query = query.gte("created_at", now.toISOString());
        } else {
          now.setDate(now.getDate() - 30);
          query = query.gte("created_at", now.toISOString());
        }
      }

      const { data, count } = await query
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("created_at", { ascending: false });

      // Buscar emails
      const usersWithEmail = await Promise.all(
        (data || []).map(async (p) => {
          try {
            const { data: authData } = await supabase.auth.admin.getUserById(p.id);
            return { ...p, email: authData?.user?.email || "" };
          } catch {
            return { ...p, email: "" };
          }
        })
      );

      return NextResponse.json({ usuarios: usersWithEmail, total: count || 0 });
    }

    if (action === "usuario") {
      const id = searchParams.get("id");
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single();

      let email = "";
      try {
        const { data } = await supabase.auth.admin.getUserById(id);
        email = data?.user?.email || "";
      } catch {}

      const { data: das } = await supabase.from("das_payments").select("*").eq("user_id", id).order("competencia", { ascending: false });
      const { data: fat } = await supabase.from("faturamento").select("*").eq("user_id", id).order("mes", { ascending: false });

      let notas = [];
      try {
        const { data } = await supabase.from("notas_fiscais").select("*").eq("user_id", id).order("created_at", { ascending: false });
        notas = data || [];
      } catch {}

      let tickets = [];
      try {
        const { data } = await supabase.from("tickets").select("*").eq("user_id", id).order("created_at", { ascending: false });
        tickets = data || [];
      } catch {}

      return NextResponse.json({ profile: { ...profile, email }, das: das || [], faturamento: fat || [], notas, tickets });
    }

    if (action === "tickets") {
      const status = searchParams.get("status") || "todos";
      let query = supabase.from("tickets").select("*").order("created_at", { ascending: false });
      if (status !== "todos") query = query.eq("status", status);
      const { data } = await query;

      // Buscar nomes dos usuarios
      const ticketsComUsuario = await Promise.all(
        (data || []).map(async (t) => {
          try {
            const { data: profile } = await supabase.from("profiles").select("nome_fantasia").eq("id", t.user_id).single();
            const { data: authData } = await supabase.auth.admin.getUserById(t.user_id);
            return { ...t, usuario_nome: profile?.nome_fantasia || "", usuario_email: authData?.user?.email || "" };
          } catch {
            return { ...t, usuario_nome: "", usuario_email: "" };
          }
        })
      );

      return NextResponse.json({ tickets: ticketsComUsuario });
    }

    if (action === "ticket") {
      const id = searchParams.get("id");
      const { data: ticket } = await supabase.from("tickets").select("*").eq("id", id).single();

      let usuario = { nome: "", email: "", plano: "" };
      if (ticket?.user_id) {
        try {
          const { data: profile } = await supabase.from("profiles").select("nome_fantasia, plano").eq("id", ticket.user_id).single();
          const { data: authData } = await supabase.auth.admin.getUserById(ticket.user_id);
          usuario = { nome: profile?.nome_fantasia || "", email: authData?.user?.email || "", plano: profile?.plano || "free" };
        } catch {}
      }

      return NextResponse.json({ ticket, usuario });
    }

    if (action === "ticket_update") {
      // POST handled below
      return NextResponse.json({ error: "Use POST" }, { status: 405 });
    }

    if (action === "atualizacoes") {
      const { data } = await supabase.from("atualizacoes").select("*").order("created_at", { ascending: false });
      return NextResponse.json({ atualizacoes: data || [] });
    }

    if (action === "assinaturas") {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const usersWithEmail = await Promise.all(
        (profiles || []).map(async (p) => {
          try {
            const { data: authData } = await supabase.auth.admin.getUserById(p.id);
            return { ...p, email: authData?.user?.email || "" };
          } catch {
            return { ...p, email: "" };
          }
        })
      );
      return NextResponse.json({ profiles: usersWithEmail });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const supabase = createAdminClient();
  const body = await request.json();

  try {
    if (body.action === "ticket_update") {
      const { id, status, prioridade, resposta_admin } = body;
      const updates = { status, prioridade, updated_at: new Date().toISOString() };
      if (resposta_admin) {
        updates.resposta_admin = resposta_admin;
        updates.respondido_em = new Date().toISOString();
      }
      await supabase.from("tickets").update(updates).eq("id", id);
      return NextResponse.json({ success: true });
    }

    if (body.action === "atualizacao_create") {
      const { titulo, conteudo, segmento, publicado } = body;
      await supabase.from("atualizacoes").insert({ titulo, conteudo, segmento, publicado });
      return NextResponse.json({ success: true });
    }

    if (body.action === "atualizacao_toggle") {
      const { id, publicado } = body;
      await supabase.from("atualizacoes").update({ publicado }).eq("id", id);
      return NextResponse.json({ success: true });
    }

    if (body.action === "plano_update") {
      const { userId, plano } = body;
      await supabase.from("profiles").update({ plano }).eq("id", userId);
      return NextResponse.json({ success: true });
    }

    if (body.action === "delete_user") {
      const { userId } = body;
      // Deletar dados do usuario em todas as tabelas
      await supabase.from("das_payments").delete().eq("user_id", userId);
      await supabase.from("faturamento").delete().eq("user_id", userId);
      try { await supabase.from("notas_fiscais").delete().eq("user_id", userId); } catch {}
      try { await supabase.from("tickets").delete().eq("user_id", userId); } catch {}
      try { await supabase.from("obrigacoes").delete().eq("user_id", userId); } catch {}
      await supabase.from("profiles").delete().eq("id", userId);
      // Deletar do auth
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
