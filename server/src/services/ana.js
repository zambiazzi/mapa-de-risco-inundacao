import { XMLParser } from 'fast-xml-parser';

const BASE = 'https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos';

// dd/mm/aaaa — formato exigido pelo serviço da ANA
const fmt = (d) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

export async function lerNivelANA(codEstacao) {
  if (!codEstacao || codEstacao === 'PREENCHER') {
    throw new Error('COD_ESTACAO_ANA não configurado');
  }
  const fim = new Date();
  const inicio = new Date(fim.getTime() - 24 * 3600e3);
  const url = `${BASE}?codEstacao=${encodeURIComponent(codEstacao)}&dataInicio=${fmt(inicio)}&dataFim=${fmt(fim)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`ANA HTTP ${res.status}`);
  return normalizarANA(await res.text());
}

// Isolado e testado: mudança de formato da ANA quebrou a faixa na v0.3.0
export function normalizarANA(xmlTexto) {
  const xml = new XMLParser().parse(xmlTexto);
  const linhas = [].concat(
    xml?.DataTable?.['diffgr:diffgram']?.DocumentElement?.DadosHidrometereologicos ?? []
  );
  const validas = linhas
    .filter((l) => l?.Nivel !== undefined && l.Nivel !== '' && Number.isFinite(Number(l.Nivel)))
    .sort((a, b) => String(b.DataHora).localeCompare(String(a.DataHora))); // mais recente primeiro
  const valida = validas[0];
  if (!valida) throw new Error('ANA: formato inesperado ou sem leitura');
  return { nivelCm: Number(valida.Nivel), dataHora: String(valida.DataHora).trim() };
}

// Leitura simulada para desenvolvimento (ANA_SIMULADO=true)
export async function lerNivelSimulado() {
  const minutos = Date.now() / 60000;
  const nivelCm = Math.round(350 + 300 * Math.sin(minutos / 30));
  return { nivelCm, dataHora: new Date().toISOString(), simulado: true };
}
