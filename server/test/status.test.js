import { describe, it, expect } from 'vitest';
import { classificar } from '../src/services/status.js';

const C = { atencao: 400, alerta: 600, emergencia: 800 };

describe('classificar', () => {
  it.each([
    [0, 'normal'],
    [399, 'normal'],
    [400, 'atencao'],
    [599, 'atencao'],
    [600, 'alerta'],
    [799, 'alerta'],
    [800, 'emergencia'],
    [1200, 'emergencia'],
  ])('%i cm → %s', (nivel, esperado) => {
    expect(classificar(nivel, C)).toBe(esperado);
  });

  it('rejeita nível inválido', () => {
    expect(() => classificar(NaN, C)).toThrow();
  });
});
