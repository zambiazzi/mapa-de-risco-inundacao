// Cotas em cm (régua da estação ANA).
// ATENÇÃO: valores PROVISÓRIOS — substituir pelas cotas oficiais da Defesa Civil
// de Herval d'Oeste (pendência #3 do plano). Podem ser sobrescritos por variáveis de ambiente.
const num = (v, padrao) => (v !== undefined && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : padrao);

export const COTAS = {
  atencao: num(process.env.COTA_ATENCAO, 400),
  alerta: num(process.env.COTA_ALERTA, 600),
  emergencia: num(process.env.COTA_EMERGENCIA, 800),
};

// Estação telemétrica Rio do Peixe – Joaçaba (pendência #1 do plano).
export const COD_ESTACAO_ANA = process.env.COD_ESTACAO_ANA || 'PREENCHER';

// Quando "true", usa leitura simulada (desenvolvimento / enquanto a estação não é confirmada).
export const ANA_SIMULADO = process.env.ANA_SIMULADO === 'true';

export const INTERVALO_MS = 15 * 60 * 1000; // 15 minutos [DOC]
