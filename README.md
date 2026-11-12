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

## API

O `server` busca os dados em duas fontes públicas e entrega tudo pronto para o app:

- **ANA**: nível do Rio do Peixe na estação telemétrica de Joaçaba
- **Defesa Civil SC**: avisos do feed RSS, filtrados para a região

O nível é comparado com as cotas (`COTA_ATENCAO`, `COTA_ALERTA`, `COTA_EMERGENCIA`) para definir a situação do rio. As fontes são consultadas no máximo a cada 15 minutos. Se uma delas falhar, a API continua respondendo com a última leitura válida e avisa que o dado pode estar desatualizado.

### `GET /api/status`

```json
{
  "nivelCm": 512,
  "dataHora": "2026-11-12T14:00:00.000Z",
  "status": "atencao",
  "cotas": { "atencao": 400, "alerta": 600, "emergencia": 800 },
  "desatualizado": false,
  "avisos": [
    { "titulo": "Alerta para chuva intensa", "nivel": "alerta", "publicadoEm": "2026-11-12T12:00:00.000Z", "link": "https://..." }
  ],
  "avisosDesatualizados": false
}
```

- `status`: `normal`, `atencao`, `alerta` ou `emergencia`
- `desatualizado` / `avisosDesatualizados`: `true` quando a última consulta à fonte falhou
- Retorna `503` enquanto ainda não houver nenhuma leitura do nível

### `GET /api/health`

Verifica se a API está no ar: `{ "ok": true }`

## Testes

```bash
npm test
```

## Licença

[MIT](LICENSE)
