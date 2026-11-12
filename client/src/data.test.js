import { describe, it, expect } from 'vitest';
import areas from './data/areas.json';
import pontosApoio from './data/pontosApoio.json';
import { linkRota } from './utils/rota.js';

const ehCoord = ([lat, lng]) => lat > -28 && lat < -27 && lng > -52 && lng < -51;

describe('dados do mapa', () => {
  it('tem 14 áreas de risco válidas', () => {
    expect(areas).toHaveLength(14);
    for (const a of areas) {
      expect(['baixo', 'medio', 'alto']).toContain(a.risco);
      expect(a.coordenadas.length).toBeGreaterThanOrEqual(3);
      expect(a.coordenadas.every(ehCoord)).toBe(true);
    }
    expect(new Set(areas.map((a) => a.id)).size).toBe(14);
  });

  it('tem pontos de apoio válidos', () => {
    expect(pontosApoio.length).toBeGreaterThan(0);
    expect(new Set(pontosApoio.map((p) => p.id)).size).toBe(pontosApoio.length);
    for (const p of pontosApoio) {
      expect(['abrigo', 'escola', 'saude', 'defesa_civil']).toContain(p.tipo);
      expect(p.nome && p.endereco).toBeTruthy();
      expect(ehCoord([p.lat, p.lng])).toBe(true);
    }
  });

  it('tem ao menos uma sede da Defesa Civil', () => {
    expect(pontosApoio.some((p) => p.tipo === 'defesa_civil')).toBe(true);
  });

  it('rota usa coordenada quando a posição é exata', () => {
    expect(linkRota({ lat: -27.17, lng: -51.5 })).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=-27.17,-51.5'
    );
  });

  it('rota usa o endereço quando a posição é aproximada', () => {
    expect(
      linkRota({ lat: -27.17, lng: -51.5, localAproximado: true, endereco: "Rua Nereu Ramos, 389 – Herval d'Oeste" })
    ).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=Rua%20Nereu%20Ramos%2C%20389%20%E2%80%93%20Herval%20d'Oeste"
    );
  });
});
