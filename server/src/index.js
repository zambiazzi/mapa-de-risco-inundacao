import { lerNivelANA, lerNivelSimulado } from './services/ana.js';
import { lerAvisosDefesaCivil } from './services/defesaCivilSC.js';
import { COTAS, COD_ESTACAO_ANA, ANA_SIMULADO, INTERVALO_MS } from './config/cotas.js';
import { criarApp, criarAtualizador } from './app.js';

const lerNivel = ANA_SIMULADO ? lerNivelSimulado : () => lerNivelANA(COD_ESTACAO_ANA);

const { atualizarSeVencido, estado } = criarAtualizador({
  lerNivel,
  lerAvisos: lerAvisosDefesaCivil,
  cotas: COTAS,
});

// Lê as fontes no máximo a cada 15 min, sob demanda (compatível com Vercel Functions)
const app = criarApp({ estado, cotas: COTAS, antesDoStatus: () => atualizarSeVencido(INTERVALO_MS) });

// Na Vercel o app é exportado e servido como função; localmente sobe o servidor
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`API em http://localhost:${PORT} (fonte: ${ANA_SIMULADO ? 'simulada' : `ANA ${COD_ESTACAO_ANA}`})`);
  });
}

export default app;
