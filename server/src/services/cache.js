// Última leitura válida de cada fonte ('nivel', 'avisos'), independentes entre si.
const dados = new Map();
export const salvar = (chave, dado) => {
  dados.set(chave, { ...dado, salvoEm: new Date().toISOString() });
};
export const obter = (chave) => dados.get(chave) ?? null;
export const limpar = () => dados.clear();
