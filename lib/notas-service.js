import { createClient } from "@/lib/supabase";

const supabase = createClient();

export async function criarRascunho(userId, dados) {
  const { data, error } = await supabase
    .from("notas_fiscais")
    .insert({
      user_id: userId,
      tomador_nome: dados.tomadorNome,
      tomador_documento: dados.tomadorDocumento || null,
      descricao: dados.descricao,
      valor: dados.valor,
      competencia: dados.competencia,
      status: "rascunho",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listarNotas(userId) {
  const { data, error } = await supabase
    .from("notas_fiscais")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function confirmarEmissao(notaId, numeroNota, dataEmissao, temPdf) {
  const { data, error } = await supabase
    .from("notas_fiscais")
    .update({
      status: temPdf ? "emitida" : "aguardando_confirmacao",
      numero_nota: numeroNota,
      data_emissao: dataEmissao,
      updated_at: new Date().toISOString(),
    })
    .eq("id", notaId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadPdf(userId, notaId, file) {
  const path = `${userId}/notas/${notaId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("documentos")
    .getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("notas_fiscais")
    .update({
      pdf_url: urlData.publicUrl,
      status: "emitida",
      updated_at: new Date().toISOString(),
    })
    .eq("id", notaId);

  if (updateError) throw updateError;
  return urlData.publicUrl;
}

export async function cancelarNota(notaId) {
  const { error } = await supabase
    .from("notas_fiscais")
    .update({
      status: "cancelada",
      updated_at: new Date().toISOString(),
    })
    .eq("id", notaId);

  if (error) throw error;
}

export async function criarLancamentoAutomatico(userId, nota) {
  // Verificar se ja existe lancamento com mesmo valor e competencia
  const { data: existente } = await supabase
    .from("faturamento")
    .select("id")
    .eq("user_id", userId)
    .eq("valor", nota.valor)
    .eq("mes", nota.competencia)
    .limit(1);

  if (existente && existente.length > 0) return null;

  const { data, error } = await supabase
    .from("faturamento")
    .insert({
      user_id: userId,
      valor: nota.valor,
      mes: nota.competencia,
      descricao: `Nota fiscal no ${nota.numero_nota} - ${nota.tomador_nome}`,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
