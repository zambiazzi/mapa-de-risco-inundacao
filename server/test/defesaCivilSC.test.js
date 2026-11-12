import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { normalizarFeed, decodificarEntidades } from '../src/services/defesaCivilSC.js';

const FEED = readFileSync(new URL('./fixtures/feed-defesa-civil.xml', import.meta.url), 'utf8');
const AGORA = Date.parse('2026-11-11T19:00:00Z');

describe('normalizarFeed', () => {
  const avisos = normalizarFeed(FEED, AGORA);
  const links = avisos.map((a) => a.link.split('/').at(-2));

  it('retorna só alertas/avisos do Meio-Oeste, mais recentes primeiro, no máximo 3', () => {
    expect(links).toEqual([
      'observacao-11-11-1543', // Alerta, cita Meio-Oeste no corpo
      'observacao-meteorologica-11-11-1015', // Aviso, cita Meio-Oeste
      'observacao-meteorologica-10-11-1500', // Aviso, "demais regiões"
    ]);
  });

  it('ignora notícias e monitoramento mesmo citando a região', () => {
    expect(links).not.toContain('defesa-civil-lanca-aplicativo');
    expect(links).not.toContain('monitoramento-11-11-1140');
  });

  it('ignora alertas de outras regiões/municípios', () => {
    expect(links).not.toContain('observacao-11-11-1335');
    expect(links).not.toContain('observacao-meteorologica-11-11-0945');
  });

  it('ignora alerta vencido (mais de 6h)', () => {
    expect(links).not.toContain('observacao-11-11-0217');
  });

  it('decodifica entidades e preenche os campos do contrato', () => {
    expect(avisos[0]).toEqual({
      titulo: expect.stringMatching(/^OBSERVAÇÃO – 11\/11 15:43 – TEMPORAIS/),
      nivel: 'alerta',
      publicadoEm: '2026-11-11T18:46:38.000Z',
      link: 'https://www.defesacivil.sc.gov.br/2026/11/11/observacao-11-11-1543/',
    });
    expect(avisos[1].nivel).toBe('aviso');
  });

  it('aceita feed sem itens', () => {
    expect(normalizarFeed('<rss><channel><title>x</title></channel></rss>', AGORA)).toEqual([]);
  });

  it('lança erro se o formato mudar', () => {
    expect(() => normalizarFeed('<html><body>manutenção</body></html>', AGORA)).toThrow(/formato inesperado/);
  });
});

describe('decodificarEntidades', () => {
  it('decodifica numéricas e nomeadas', () => {
    expect(decodificarEntidades('a &#8211; b &#x2026; &amp; &nbsp;c')).toBe('a – b … &  c');
  });
});
