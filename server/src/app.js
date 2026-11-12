import express from 'express';
import cors from 'cors';
import { classificar } from './services/status.js';
import { salvar, obter } from './services/cache.js';

// Nível (ANA) e avisos (Defesa Civil SC) atualizam de forma independente:
// a falha de uma fonte não congela a outra. Em falha, mantém a última leitura válida [DOC].
export function criarAtualizador({ lerNivel, lerAvisos, cotas }) {
  const estado = { desatualizado: true, avisosDesatualizados: true };
  let ultimaAtualizacao = 0;
  let emAndamento = null;

  async function atualizarNivel() {
    try {
      const nivel = await lerNivel();
      salvar('nivel', { ...nivel, status: classificar(nivel.nivelCm, cotas) });
      estado.desatualizado = false;
    } catch (e) {
      console.error('Falha ao ler nível:', e.message);
      estado.desatualizado = true;
    }
  }

  async function atualizarAvisos() {
    try {
      salvar('avisos', { lista: await lerAvisos() });
      estado.avisosDesatualizados = false;
    } catch (e) {
      console.error('Falha ao ler avisos:', e.message);
      estado.avisosDesatualizados = true;
    }
  }

  const atualizar = () => {
    emAndamento ??= Promise.all([atualizarNivel(), atualizarAvisos()]).finally(() => {
      ultimaAtualizacao = Date.now();
      emAndamento = null;
    });
    return emAndamento;
  };

  // Atualização sob demanda: em ambiente serverless (Vercel) não há processo
  // contínuo para um setInterval, então a leitura é refeita na requisição
  // quando a última tem mais de `intervaloMs`.
  const atualizarSeVencido = (intervaloMs) =>
    Date.now() - ultimaAtualizacao >= intervaloMs ? atualizar() : Promise.resolve();

  return { atualizar, atualizarSeVencido, estado };
}

export function criarApp({ estado, cotas, antesDoStatus = async () => {} }) {
  const app = express();
  app.use(cors());

  app.get('/api/status', async (_req, res) => {
    await antesDoStatus();
    const nivel = obter('nivel');
    const avisos = {
      avisos: obter('avisos')?.lista ?? [],
      avisosDesatualizados: estado.avisosDesatualizados,
    };
    if (!nivel) {
      return res
        .status(503)
        .json({ erro: 'Sem leitura do nível disponível', desatualizado: true, ...avisos });
    }
    res.json({ ...nivel, cotas, desatualizado: estado.desatualizado, ...avisos });
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  return app;
}
