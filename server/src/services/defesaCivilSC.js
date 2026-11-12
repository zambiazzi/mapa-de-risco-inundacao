import { XMLParser } from 'fast-xml-parser';

const FEED = process.env.DEFESA_CIVIL_FEED_URL || 'https://www.defesacivil.sc.gov.br/feed/';

// Herval d'Oeste e Joaçaba ficam no Meio-Oeste ("Grande Oeste" = Extremo Oeste + Oeste + Meio-Oeste).
// Termos sem acento, minúsculos e com hífen trocado por espaço (ver normalizarTexto).
const TERMOS_REGIAO = [
  'joacaba',
  'herval d',
  'meio oeste',
  'grande oeste',
  'rio do peixe',
  'todo o estado',
  'toda santa catarina',
  'todas as regioes',
  'demais regioes',
  'maior parte do estado',
];

// Só categorias de alerta/aviso; notícias, monitoramento e boletins ficam de fora.
// Validade: alertas falam em "próximas 3–4 horas"; avisos cobrem 1–2 dias.
const VALIDADE_MS = {
  Alerta: 6 * 3600e3,
  Aviso: 48 * 3600e3,
};

const MAX_AVISOS = 3;

export async function lerAvisosDefesaCivil() {
  const res = await fetch(FEED, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Defesa Civil HTTP ${res.status}`);
  return normalizarFeed(await res.text());
}

export function normalizarFeed(xmlTexto, agora = Date.now()) {
  const xml = new XMLParser({
    parseTagValue: false,
    isArray: (nome) => nome === 'item' || nome === 'category',
  }).parse(xmlTexto);

  const canal = xml?.rss?.channel;
  if (!canal) throw new Error('Defesa Civil: formato inesperado do feed');

  return (canal.item ?? [])
    .map((i) => {
      const categorias = (i.category ?? []).map(String);
      const tipo = Object.keys(VALIDADE_MS).find((c) => categorias.includes(c));
      const publicado = new Date(i.pubDate).getTime();
      const texto = normalizarTexto(`${i.title} ${i['content:encoded'] ?? i.description ?? ''}`);
      return { i, tipo, publicado, texto };
    })
    .filter(({ tipo, publicado }) => tipo && Number.isFinite(publicado))
    .filter(({ tipo, publicado }) => agora - publicado >= 0 && agora - publicado <= VALIDADE_MS[tipo])
    .filter(({ texto }) => TERMOS_REGIAO.some((t) => texto.includes(t)))
    .sort((a, b) => b.publicado - a.publicado)
    .slice(0, MAX_AVISOS)
    .map(({ i, tipo, publicado }) => ({
      titulo: decodificarEntidades(String(i.title)).trim(),
      nivel: tipo.toLowerCase(), // 'alerta' | 'aviso'
      publicadoEm: new Date(publicado).toISOString(),
      link: String(i.link ?? '').trim() || null,
    }));
}

export function decodificarEntidades(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function normalizarTexto(s) {
  return decodificarEntidades(s.replace(/<[^>]+>/g, ' '))
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[-–]/g, ' ')
    .replace(/\s+/g, ' ');
}
