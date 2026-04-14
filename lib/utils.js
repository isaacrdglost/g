// Remove CNPJ do inicio do nome empresarial retornado pela BrasilAPI
// Exemplo: "61.470.312 ISAAC RODRIGO" -> "ISAAC RODRIGO"
export function extrairNome(nomeEmpresarial) {
  if (!nomeEmpresarial) return "";
  const limpo = nomeEmpresarial.replace(/^[\d.\-\/\s]+/, "").trim();
  return limpo || nomeEmpresarial;
}

// Extrair primeiro nome
export function primeiroNome(nomeCompleto) {
  if (!nomeCompleto) return "";
  return nomeCompleto.trim().split(" ")[0];
}

// Formatar CNPJ para exibicao com mascara
// Exemplo: "12345678000199" -> "12.345.678/0001-99"
export function formatarCnpj(cnpj) {
  if (!cnpj) return "";
  const n = cnpj.replace(/\D/g, "");
  if (n.length <= 2) return n;
  if (n.length <= 5) return `${n.slice(0, 2)}.${n.slice(2)}`;
  if (n.length <= 8)
    return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5)}`;
  if (n.length <= 12)
    return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5, 8)}/${n.slice(8)}`;
  return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5, 8)}/${n.slice(8, 12)}-${n.slice(12)}`;
}
