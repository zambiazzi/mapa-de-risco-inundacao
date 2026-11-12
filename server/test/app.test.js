import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { criarApp, criarAtualizador } from '../src/app.js';
import { limpar } from '../src/services/cache.js';

const COTAS = { atencao: 400, alerta: 600, emergencia: 800 };

async function subir(app) {
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { server, get: (p) => fetch(base + p) };
}

describe('/api/status', () => {
  let ctx;
  beforeEach(() => {
    limpar();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    ctx?.server.close();
    vi.restoreAllMocks();
  });

  it('retorna 503 antes da primeira leitura', async () => {
    const { estado } = criarAtualizador({ lerNivel: vi.fn(), lerAvisos: vi.fn(), cotas: COTAS });
    ctx = await subir(criarApp({ estado, cotas: COTAS }));
    const r = await ctx.get('/api/status');
    expect(r.status).toBe(503);
  });

  it('retorna status classificado quando a fonte responde', async () => {
    const { atualizar, estado } = criarAtualizador({
      lerNivel: async () => ({ nivelCm: 650, dataHora: '2026-11-11 15:00:00' }),
      lerAvisos: async () => [],
      cotas: COTAS,
    });
    await atualizar();
    ctx = await subir(criarApp({ estado, cotas: COTAS }));
    const body = await (await ctx.get('/api/status')).json();
    expect(body).toMatchObject({ nivelCm: 650, status: 'alerta', desatualizado: false });
    expect(body.salvoEm).toBeTruthy();
  });

  it('mantém a última leitura e marca desatualizado: true quando a fonte falha', async () => {
    const lerNivel = vi
      .fn()
      .mockResolvedValueOnce({ nivelCm: 200, dataHora: '2026-11-11 15:00:00' })
      .mockRejectedValueOnce(new Error('ANA fora do ar'));
    const { atualizar, estado } = criarAtualizador({ lerNivel, lerAvisos: async () => [], cotas: COTAS });
    await atualizar();
    await atualizar();
    ctx = await subir(criarApp({ estado, cotas: COTAS }));
    const body = await (await ctx.get('/api/status')).json();
    expect(body).toMatchObject({ nivelCm: 200, status: 'normal', desatualizado: true });
  });

  it('falha nos avisos da Defesa Civil não derruba a leitura do nível', async () => {
    const { atualizar, estado } = criarAtualizador({
      lerNivel: async () => ({ nivelCm: 900, dataHora: 'x' }),
      lerAvisos: async () => {
        throw new Error('fora');
      },
      cotas: COTAS,
    });
    await atualizar();
    ctx = await subir(criarApp({ estado, cotas: COTAS }));
    const body = await (await ctx.get('/api/status')).json();
    expect(body).toMatchObject({
      status: 'emergencia',
      avisos: [],
      desatualizado: false,
      avisosDesatualizados: true,
    });
  });

  it('avisos continuam atualizando mesmo com a ANA fora do ar', async () => {
    const aviso = { titulo: 'Alerta', nivel: 'alerta', publicadoEm: 'x', link: null };
    const { atualizar, estado } = criarAtualizador({
      lerNivel: async () => {
        throw new Error('ANA fora');
      },
      lerAvisos: async () => [aviso],
      cotas: COTAS,
    });
    await atualizar();
    ctx = await subir(criarApp({ estado, cotas: COTAS }));
    const r = await ctx.get('/api/status');
    expect(r.status).toBe(503);
    expect(await r.json()).toMatchObject({ avisos: [aviso], avisosDesatualizados: false });
  });

  it('mantém os últimos avisos válidos quando o feed falha', async () => {
    const aviso = { titulo: 'Aviso', nivel: 'aviso', publicadoEm: 'x', link: null };
    const lerAvisos = vi.fn().mockResolvedValueOnce([aviso]).mockRejectedValueOnce(new Error('feed fora'));
    const { atualizar, estado } = criarAtualizador({
      lerNivel: async () => ({ nivelCm: 100, dataHora: 'x' }),
      lerAvisos,
      cotas: COTAS,
    });
    await atualizar();
    await atualizar();
    ctx = await subir(criarApp({ estado, cotas: COTAS }));
    const body = await (await ctx.get('/api/status')).json();
    expect(body).toMatchObject({ avisos: [aviso], avisosDesatualizados: true });
  });

  it('atualiza sob demanda na primeira requisição e respeita o intervalo', async () => {
    const lerNivel = vi.fn(async () => ({ nivelCm: 650, dataHora: 'x' }));
    const { atualizarSeVencido, estado } = criarAtualizador({ lerNivel, lerAvisos: async () => [], cotas: COTAS });
    ctx = await subir(
      criarApp({ estado, cotas: COTAS, antesDoStatus: () => atualizarSeVencido(15 * 60 * 1000) })
    );
    const [a, b] = await Promise.all([ctx.get('/api/status'), ctx.get('/api/status')]);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    await ctx.get('/api/status');
    expect(lerNivel).toHaveBeenCalledTimes(1);
  });
});
