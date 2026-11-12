# Mapa de Risco de Inundação — Herval d'Oeste e Joaçaba (SC)

App web (PWA) para a população acompanhar o risco de enchente do Rio do Peixe.

<img width="1463" height="761" alt="Screenshot 2026-11-12 at 09 23 35" src="https://github.com/user-attachments/assets/e0e252af-b191-4a46-9fc5-2b5660d1b9e0" />

## O que faz

- Mostra no mapa as **áreas de risco de inundação**, classificadas em risco baixo, médio e alto
- Exibe o **nível do rio** em tempo quase real, a partir da estação telemétrica da ANA
- Classifica a situação do rio como **normal, atenção, alerta ou emergência**
- Mostra os **avisos da Defesa Civil de SC** para a região
- Lista os **pontos de apoio** (Defesa Civil e escolas), com link "Como chegar"
- Tem um botão para **ligar para a Defesa Civil (199)**
- Tem um botão para **aumentar a fonte**
- Pode ser **instalado no celular** e funciona com conexão instável

## Rodar localmente

Requer **Node.js 22+**.

```bash
npm install
cp server/.env.example server/.env
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:3000

Por padrão o nível do rio é **simulado** (`ANA_SIMULADO=true` em `server/.env`). Para usar os dados reais da ANA, preencha `COD_ESTACAO_ANA` e defina `ANA_SIMULADO=false`.

## Deploy na Vercel

O projeto usa [Vercel Services](https://vercel.com/docs/services): `client` (Vite) e `server` (Express) no mesmo projeto, configurados em `vercel.json`. Rotas `/api/*` vão para o server e o resto para o client.

1. Importe o repositório na Vercel (raiz do projeto como *Root Directory*)
2. Configure as variáveis de ambiente de `server/.env.example` no projeto
3. Faça o deploy

## Testes

```bash
npm test
```

## Licença

[MIT](LICENSE)
