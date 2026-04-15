import { Resend } from "resend";

let _resend = null;
function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) { console.warn("RESEND_API_KEY nao configurada"); return null; }
    _resend = new Resend(key);
  }
  return _resend;
}
const FROM = process.env.RESEND_FROM || "Guiado <nao-responda@seuguiadomei-app.vercel.app>";
const BASE = "https://seuguiadomei-app.vercel.app";

export async function enviarEmailBoasVindas(email, nomeCompleto) {
  const nome = (nomeCompleto || "").trim().split(" ")[0] || "Empreendedor";
  try {
    const r = getResend(); if (!r) return; await r.emails.send({
      from: FROM, to: email, subject: "Bem-vindo ao Guiado",
      html: `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#FAF8F5;color:#2A1F14"><img src="${BASE}/logo-v1-dark.svg" width="40" height="40" style="margin-bottom:24px"/><h1 style="font-size:22px;font-weight:700;margin:0 0 12px">Ola, ${nome}.</h1><p style="font-size:15px;line-height:1.6;margin:0 0 24px;color:#5C4535">Seu MEI esta organizado agora. Acesse o dashboard para ver seu limite anual, DAS do mes e situacao do CNPJ.</p><a href="${BASE}/dashboard" style="display:inline-block;background:#D4500A;color:#FAF8F5;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Acessar meu dashboard</a><p style="font-size:12px;color:#7A6255;margin-top:40px">Guiado - Seu MEI sem complicacao</p></div>`
    });
  } catch (e) { console.error("Email boas-vindas erro:", e); }
}

export async function enviarEmailProAtivado(email, nomeCompleto) {
  const nome = (nomeCompleto || "").trim().split(" ")[0] || "Empreendedor";
  try {
    const r = getResend(); if (!r) return; await r.emails.send({
      from: FROM, to: email, subject: "Seu plano Pro esta ativo",
      html: `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#FAF8F5;color:#2A1F14"><img src="${BASE}/logo-v1-dark.svg" width="40" height="40" style="margin-bottom:24px"/><h1 style="font-size:22px;font-weight:700;margin:0 0 12px">Pro ativo, ${nome}.</h1><p style="font-size:15px;line-height:1.6;margin:0 0 16px;color:#5C4535">Todas as funcionalidades estao liberadas:</p><ul style="font-size:14px;color:#5C4535;line-height:2;padding-left:20px;margin:0 0 24px"><li>Historico completo de DAS</li><li>Lancamentos ilimitados</li><li>Notas fiscais</li><li>Projecao de limite anual</li><li>Alertas inteligentes</li><li>Documentos do CNPJ</li></ul><a href="${BASE}/dashboard" style="display:inline-block;background:#D4500A;color:#FAF8F5;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Acessar meu dashboard</a><p style="font-size:12px;color:#7A6255;margin-top:40px">Guiado - Seu MEI sem complicacao</p></div>`
    });
  } catch (e) { console.error("Email pro-ativado erro:", e); }
}

export async function enviarEmailLembreteDAS(email, nomeCompleto, mes, valor, diasRestantes) {
  const nome = (nomeCompleto || "").trim().split(" ")[0] || "Empreendedor";
  try {
    const r = getResend(); if (!r) return; await r.emails.send({
      from: FROM, to: email, subject: `DAS de ${mes} vence em ${diasRestantes} dias`,
      html: `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#FAF8F5;color:#2A1F14"><img src="${BASE}/logo-v1-dark.svg" width="40" height="40" style="margin-bottom:24px"/><h1 style="font-size:22px;font-weight:700;margin:0 0 12px">${nome}, seu DAS vence em ${diasRestantes} dias.</h1><p style="font-size:15px;line-height:1.6;margin:0 0 8px;color:#5C4535">DAS de ${mes}: <strong style="color:#2A1F14">${valor}</strong></p><p style="font-size:14px;color:#7A6255;margin:0 0 24px">Vence dia 20. Atraso gera multa de 0,33% ao dia + juros Selic.</p><a href="${BASE}/dashboard/das" style="display:inline-block;background:#D4500A;color:#FAF8F5;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Pagar DAS agora</a><p style="font-size:12px;color:#7A6255;margin-top:40px">Guiado - Seu MEI sem complicacao</p></div>`
    });
  } catch (e) { console.error("Email lembrete-das erro:", e); }
}

export async function enviarEmailRespostaTicket(email, nomeCompleto, assunto, resposta) {
  const nome = (nomeCompleto || "").trim().split(" ")[0] || "Empreendedor";
  try {
    const r = getResend(); if (!r) return; await r.emails.send({
      from: FROM, to: email, subject: `Re: ${assunto}`,
      html: `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#FAF8F5;color:#2A1F14"><img src="${BASE}/logo-v1-dark.svg" width="40" height="40" style="margin-bottom:24px"/><h1 style="font-size:22px;font-weight:700;margin:0 0 12px">Ola, ${nome}.</h1><p style="font-size:14px;color:#7A6255;margin:0 0 8px">Seu chamado: <strong style="color:#2A1F14">${assunto}</strong></p><div style="background:#F2EFE9;border-left:3px solid #D4500A;padding:16px;border-radius:0 8px 8px 0;margin:0 0 24px"><p style="font-size:15px;line-height:1.6;margin:0;color:#2A1F14">${resposta}</p></div><a href="${BASE}/dashboard" style="display:inline-block;background:#D4500A;color:#FAF8F5;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Acessar meu dashboard</a><p style="font-size:12px;color:#7A6255;margin-top:40px">Guiado - Seu MEI sem complicacao</p></div>`
    });
  } catch (e) { console.error("Email resposta-ticket erro:", e); }
}
