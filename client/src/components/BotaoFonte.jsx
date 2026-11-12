import { useEffect, useState } from 'react';

const CHAVE = 'fonte-grande';
const ler = () => {
  try {
    return localStorage.getItem(CHAVE) === '1';
  } catch {
    return false;
  }
};

export default function BotaoFonte() {
  const [grande, setGrande] = useState(ler);

  useEffect(() => {
    document.documentElement.style.fontSize = grande ? '125%' : '100%';
    try {
      localStorage.setItem(CHAVE, grande ? '1' : '0');
    } catch {
      /* armazenamento indisponível */
    }
  }, [grande]);

  return (
    <button
      type="button"
      className="botao-grande"
      onClick={() => setGrande(!grande)}
      aria-pressed={grande}
      aria-label={grande ? 'Diminuir texto' : 'Aumentar texto'}
    >
      {grande ? 'A−' : 'A+'}
    </button>
  );
}
