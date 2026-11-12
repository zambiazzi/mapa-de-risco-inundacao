# Mapa de Risco de Inundação — Herval d'Oeste e Joaçaba (SC)

App web (PWA) para a população acompanhar o risco de enchente do Rio do Peixe.

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

## Testes

```bash
npm test
```
