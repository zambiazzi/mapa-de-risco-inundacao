import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { linkRota } from '../utils/rota';

export const CORES = { baixo: '#F2C94C', medio: '#F2994A', alto: '#EB5757' };
const NOME_RISCO = { baixo: 'Risco baixo', medio: 'Risco médio', alto: 'Risco alto' };

const TIPOS = {
  defesa_civil: { icone: '🚨', nome: 'Defesa Civil' },
  abrigo: { icone: '🏠', nome: 'Abrigo' },
  escola: { icone: '🏫', nome: 'Escola' },
  saude: { icone: '🏥', nome: 'Saúde' },
};

const icone = (tipo) =>
  L.divIcon({
    className: 'marcador',
    html: `<span>${TIPOS[tipo]?.icone ?? '📍'}</span>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  });

const soDigitos = (tel) => tel.replace(/\D/g, '');

export default function MapaRisco({ areas, pontosApoio }) {
  const tiposPresentes = [...new Set(pontosApoio.map((p) => p.tipo))].filter((t) => TIPOS[t]);

  return (
    <MapContainer center={[-27.17, -51.5]} zoom={14} className="mapa-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {areas.map((a) => (
        <Polygon
          key={a.id}
          positions={a.coordenadas}
          pathOptions={{ color: CORES[a.risco], fillOpacity: 0.4 }}
        >
          <Popup>
            <strong>{NOME_RISCO[a.risco]}</strong>
            <br />
            {a.nome}
          </Popup>
        </Polygon>
      ))}
      {pontosApoio.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={icone(p.tipo)}>
          <Popup>
            <small className="popup-tipo">{TIPOS[p.tipo]?.nome}</small>
            <br />
            <strong>{p.nome}</strong>
            <br />
            {p.endereco}
            {p.localAproximado && (
              <>
                <br />
                <small className="popup-aviso">📍 Posição no mapa aproximada</small>
              </>
            )}
            <div className="popup-acoes">
              <a className="link-rota" href={linkRota(p)} target="_blank" rel="noopener noreferrer">
                Como chegar
              </a>
              {p.telefone && (
                <a className="link-rota link-tel" href={`tel:${soDigitos(p.telefone)}`}>
                  📞 {p.telefone}
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      <Legenda tipos={tiposPresentes} />
    </MapContainer>
  );
}

function Legenda({ tipos }) {
  return (
    <div className="legenda" aria-label="Legenda do mapa">
      {Object.entries(NOME_RISCO)
        .reverse()
        .map(([k, txt]) => (
          <div key={k}>
            <i style={{ background: CORES[k] }} /> {txt}
          </div>
        ))}
      {tipos.map((t) => (
        <div key={t}>
          {TIPOS[t].icone} {TIPOS[t].nome}
        </div>
      ))}
    </div>
  );
}
