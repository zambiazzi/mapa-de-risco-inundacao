import { describe, it, expect } from 'vitest';
import { normalizarANA } from '../src/services/ana.js';

const envelope = (linhas) => `<?xml version="1.0" encoding="utf-8"?>
<DataTable xmlns="http://MRCS/">
  <diffgr:diffgram xmlns:msdata="urn:schemas-microsoft-com:xml-msdata" xmlns:diffgr="urn:schemas-microsoft-com:xml-diffgram-v1">
    <DocumentElement xmlns="">${linhas}</DocumentElement>
  </diffgr:diffgram>
</DataTable>`;

const linha = (dataHora, nivel) => `
  <DadosHidrometereologicos diffgr:id="x" msdata:rowOrder="0">
    <CodEstacao>00000000</CodEstacao>
    <DataHora>${dataHora}</DataHora>
    <Vazao />
    <Nivel>${nivel}</Nivel>
    <Chuva>0.00</Chuva>
  </DadosHidrometereologicos>`;

describe('normalizarANA', () => {
  it('lê o nível mais recente de um XML válido', () => {
    const xml = envelope(
      linha('2026-11-11 14:00:00', '310.00') + linha('2026-11-11 15:00:00', '325.00')
    );
    expect(normalizarANA(xml)).toEqual({ nivelCm: 325, dataHora: '2026-11-11 15:00:00' });
  });

  it('ignora leituras sem nível', () => {
    const xml = envelope(linha('2026-11-11 15:00:00', '') + linha('2026-11-11 14:45:00', '300'));
    expect(normalizarANA(xml).nivelCm).toBe(300);
  });

  it('aceita uma única linha (objeto, não array)', () => {
    expect(normalizarANA(envelope(linha('2026-11-11 15:00:00', '120'))).nivelCm).toBe(120);
  });

  it('lança erro com XML vazio', () => {
    expect(() => normalizarANA(envelope(''))).toThrow(/formato inesperado/);
  });

  it('lança erro quando o formato muda', () => {
    const xml = '<DataTable><Resultado><Leitura><Altura>300</Altura></Leitura></Resultado></DataTable>';
    expect(() => normalizarANA(xml)).toThrow(/formato inesperado/);
  });
});
