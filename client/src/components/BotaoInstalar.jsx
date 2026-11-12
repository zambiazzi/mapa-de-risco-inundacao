import { useEffect, useState } from 'react';

// RF12: oferece "adicionar à tela inicial" quando o navegador permite.
export default function BotaoInstalar() {
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    const guardar = (e) => {
      e.preventDefault();
      setEvento(e);
    };
    const instalado = () => setEvento(null);
    window.addEventListener('beforeinstallprompt', guardar);
    window.addEventListener('appinstalled', instalado);
    return () => {
      window.removeEventListener('beforeinstallprompt', guardar);
      window.removeEventListener('appinstalled', instalado);
    };
  }, []);

  if (!evento) return null;

  const instalar = async () => {
    evento.prompt();
    await evento.userChoice;
    setEvento(null);
  };

  return (
    <button type="button" className="botao-grande" onClick={instalar}>
      📲 Instalar
    </button>
  );
}
