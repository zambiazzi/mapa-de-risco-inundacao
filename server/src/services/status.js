export const ESTADOS = ['normal', 'atencao', 'alerta', 'emergencia'];

export function classificar(nivelCm, c) {
  if (!Number.isFinite(nivelCm)) throw new Error('Nível inválido');
  if (nivelCm >= c.emergencia) return 'emergencia';
  if (nivelCm >= c.alerta) return 'alerta';
  if (nivelCm >= c.atencao) return 'atencao';
  return 'normal';
}
