# typeracing

Plataforma web multiplayer de jogos de digitação para salas de aula no formato Kahoot, com lobbies por link, sem cadastro e com sincronização em tempo real via WebSockets.

## Como executar localmente

Requer Node.js 20.19+ (ou 22.12+) e npm.

Em um terminal, instale e inicie o servidor:

```bash
cd server
npm install
npm run dev
```

Em outro terminal, instale e inicie o frontend:

```bash
cd client
npm install
npm run dev
```

Quando o primeiro jogador termina uma corrida, começa uma contagem de 30
segundos para os demais. O dono da sala pode acrescentar 10 segundos por vez.
Quando todos terminam ou o prazo acaba, a classificação é exibida. Ao iniciar
uma corrida, todos veem uma contagem sincronizada de 3 segundos. Na sala de
espera, qualquer participante pode copiar o link de entrada; ao abri-lo, o
código da sala já vem preenchido e basta informar um apelido para entrar.