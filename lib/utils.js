// Remove CNPJ do início do nome empresarial retornado pela BrasilAPI
// Exemplo: "61.470.312 ISAAC RODRIGO" → "ISAAC RODRIGO"
export function extrairNome(nomeEmpresarial) {
  if (!nomeEmpresarial) return "";
  const limpo = nomeEmpresarial.replace(/^[\d.\-\/\s]+/, "").trim();
  return limpo || nomeEmpresarial;
}
