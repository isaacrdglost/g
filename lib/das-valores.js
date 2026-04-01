// Valores do DAS por categoria CNAE (2026)
// Comércio e Indústria: INSS (R$ 66,00) + ICMS (R$ 1,00) = R$ 71,60 (com ajuste)
// Serviços: INSS (R$ 66,00) + ISS (R$ 5,00) = R$ 75,60 (com ajuste)
// Comércio e Serviços: INSS + ICMS + ISS = R$ 76,60 (com ajuste)

const VALOR_PADRAO = 71.60;

// CNAEs que são de serviço (ISS)
const CNAES_SERVICO = [
  "69", "70", "71", "73", "74", "77", "78", "80", "81", "82",
  "85", "86", "87", "88", "90", "93", "95", "96",
];

export function calcularValorDas(cnae) {
  if (!cnae) return VALOR_PADRAO;

  const grupo = cnae.toString().slice(0, 2);
  const ehServico = CNAES_SERVICO.includes(grupo);

  // Verificar se CNAE tem componente de comércio (grupos 45-47)
  const ehComercio = ["45", "46", "47"].includes(grupo);

  if (ehServico && ehComercio) return 76.60;
  if (ehServico) return 75.60;
  return 71.60;
}
