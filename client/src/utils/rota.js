// RF11 — abre a rota no app de mapas do celular.
// Com coordenada aproximada, usa o endereço: o app de mapas acha o número da casa melhor que o OSM.
export const linkRota = (p) => {
  const destino = p.localAproximado && p.endereco ? encodeURIComponent(p.endereco) : `${p.lat},${p.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destino}`;
};
