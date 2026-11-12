import { useEffect, useState } from 'react';

export const ESTADOS = {
  normal: { cor: '#27AE60', texto: 'Normal' },
  atencao: { cor: '#F2C94C', texto: 'Atenção' },
  alerta: { cor: '#F2994A', texto: 'Alerta' },
  emergencia: { cor: '#EB5757', texto: 'Emergência' },
};

const API = import.meta.env.VITE_API_URL ?? '';

const hora = (iso) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function FaixaAlerta() {
  const [nivel, setNivel] = useState(null);
  const [avisos, setAvisos] = useState([]);
  const [semConexao, setSemConexao] = useState(false);
  const [carregou, setCarregou] = useState(false);

  useEffect(() => {
    const buscar = () =>
      fetch(`${API}/api/status`)
        .then((r) => r.json())
        .then((d) => {
          setSemConexao(false);
          setCarregou(true);
          if (d?.status) setNivel(d); // 503 sem leitura: mantém o nível que já havia
          if (Array.isArray(d?.avisos)) setAvisos(d.avisos);
        })
        .catch(() => setSemConexao(true)); // mantém o que já está na tela
    buscar();
    const id = setInterval(buscar, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="faixa-wrapper" role="status" aria-live="polite">
      <FaixaNivel nivel={nivel} semConexao={semConexao} carregou={carregou} />
      <ListaAvisos avisos={avisos} />
    </header>
  );
}

function FaixaNivel({ nivel, semConexao, carregou }) {
  if (!nivel?.status) {
    return (
      <div className="faixa faixa-carregando">
        {semConexao
          ? 'Sem conexão com o servidor. Tentando de novo…'
          : carregou
            ? 'Nível do rio indisponível no momento.'
            : 'Carregando nível do rio…'}
      </div>
    );
  }

  const e = ESTADOS[nivel.status];
  return (
    <div className="faixa" style={{ background: e.cor }}>
      <div className="faixa-estado">{e.texto}</div>
      <div>
        Rio do Peixe: <strong>{nivel.nivelCm} cm</strong> · Atualizado às{' '}
        {new Date(nivel.salvoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </div>
      {(nivel.desatualizado || semConexao) && (
        <div className="faixa-aviso">⚠ Dado pode estar desatualizado.</div>
      )}
    </div>
  );
}

function ListaAvisos({ avisos }) {
  if (!avisos.length) return null;
  return (
    <ul className="avisos">
      {avisos.map((a) => (
        <li key={a.link ?? a.titulo} className={`aviso aviso-${a.nivel}`}>
          <span className="aviso-selo">{a.nivel === 'alerta' ? '⚠ Alerta' : 'ℹ Aviso'}</span>
          {a.link ? (
            <a href={a.link} target="_blank" rel="noopener noreferrer">
              {a.titulo}
            </a>
          ) : (
            <span>{a.titulo}</span>
          )}
          <small>Defesa Civil SC · {hora(a.publicadoEm)}</small>
        </li>
      ))}
    </ul>
  );
}
