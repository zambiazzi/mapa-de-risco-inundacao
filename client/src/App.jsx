import MapaRisco from './components/MapaRisco';
import FaixaAlerta from './components/FaixaAlerta';
import BotaoFonte from './components/BotaoFonte';
import BotaoLigar from './components/BotaoLigar';
import BotaoInstalar from './components/BotaoInstalar';
import areas from './data/areas.json';
import pontosApoio from './data/pontosApoio.json';

export default function App() {
  return (
    <div className="app">
      <FaixaAlerta />
      <main className="mapa">
        <MapaRisco areas={areas} pontosApoio={pontosApoio} />
      </main>
      <nav className="acoes">
        <BotaoLigar />
        <BotaoFonte />
        <BotaoInstalar />
      </nav>
    </div>
  );
}
