# typeracing

Plataforma web multiplayer de jogos de digitação para salas de aula no formato Kahoot, com lobbies por link, sem cadastro e com sincronização em tempo real via WebSockets.

## Estrutura

- `client/src/components/`: telas e componentes visuais reutilizáveis
- `client/src/components/lobby/`: formulário inicial, sala de espera e personalização
- `client/src/utils/`: utilitários compartilhados de apresentação da partida
- `client/src/services/`: conexão Socket.IO
- `server/`: servidor Socket.IO e regras multiplayer
- `docs/`: documentação acadêmica e registros do projeto

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

Abra o endereço exibido pelo Vite. O professor cria a sala e compartilha o
código; os alunos informam esse código para entrar. A corrida só começa quando
o professor seleciona **Iniciar Corrida**. Quando todos os jogadores conectados
terminam, todos veem a classificação; somente o professor pode iniciar a
próxima partida.

As salas ficam em memória e são encerradas quando o servidor reinicia ou o
professor desconecta. Para permitir que alunos usem outros dispositivos na
mesma rede, configure `VITE_SOCKET_URL` com o endereço de rede do computador
que executa o servidor (por exemplo, `http://192.168.1.20:4000`) antes de
iniciar o Vite. O servidor usa a porta `4000` por padrão e aceita a variável
`PORT` para alterá-la.

## Objetivo

Criar uma experiência de jogo de digitação em navegador, com sala compartilhada por link e acompanhamento em tempo real da turma.

## Documentação

Os documentos do projeto acadêmico ficam em `docs/` e incluem:

- ficha inicial
- registro de horas
- resposta/relatório do orientador
