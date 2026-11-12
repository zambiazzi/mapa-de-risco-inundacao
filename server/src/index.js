import { lerNivelANA, lerNivelSimulado } from './services/ana.js';
import { lerAvisosDefesaCivil } from './services/defesaCivilSC.js';
import { COTAS, COD_ESTACAO_ANA, ANA_SIMULADO, INTERVALO_MS } from './config/cotas.js';
import { criarApp, criarAtualizador } from './app.js';

const lerNivel = ANA_SIMULADO ? lerNivelSimulado : () => lerNivelANA(COD_ESTACAO_ANA);

const { atualizar, estado } = criarAtualizador({
  lerNivel,
  lerAvisos: lerAvisosDefesaCivil,
  cotas: COTAS,
});

const app = criarApp({ estado, cotas: COTAS });

atualizar();
setInterval(atualizar, INTERVALO_MS);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API em http://localhost:${PORT} (fonte: ${ANA_SIMULADO ? 'simulada' : `ANA ${COD_ESTACAO_ANA}`})`);
});
