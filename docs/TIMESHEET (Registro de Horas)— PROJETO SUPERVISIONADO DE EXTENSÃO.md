**Aluno:** Lucas Hyan Monteiro dos Santos  **Projeto:** Plataforma Web Multiplayer para Jogos de Digitação Interativos em Sala de Aula

> Registre à medida que trabalha, não no final. Cada linha precisa de
> uma evidência correspondente no índice do relatório.

| Etapa | Data Início | Data Fim | Horas | Atividade realizada | Encontro c/ cliente? | Evidências (link) | Responsável | Comentários |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Requisitos | 28/07/2026 | 28/07/2026 | 5,5 | Benchmarking de ferramentas de digitação (Typer.io, TypeRush, Nitro Type) e elaboração técnica da Ficha Inicial de Extensão com definição do escopo MVP sem cadastro | N | https://drive.google.com/open?id=1CG80nqmzPF2YY1_6Y0RrMI8T8-4Ziuf3 | Lucas Hyan | Sessão dedicada à análise de concorrentes, decisão de adotar textos em português sobre tecnologia para a Ctrl+Play e estruturação do escopo aprovado pelo orientador. |
| Planejamento/design | 28/07/2026 | 28/07/2026 | 3,5 | Estudo e modelagem da arquitetura de comunicação em tempo real: comparação entre abordagens de WebSockets (Node.js/Socket.io vs alternativas) e estrutura de salas em memória RAM | N | https://www.youtube.com/watch?v=T4unNrKogSA | Lucas Hyan | Definição da arquitetura técnica orientada a eventos e planejamento do modelo de servidor autoritativo para evitar manipulação de progresso no cliente. |
| Planejamento/design | 05/11/2026 | 05/11/2026 | 1,8 | Configuração do repositório GitHub (licença MIT, .gitignore Node), estruturação do quadro Kanban no Trello e preparação do ambiente local com Vite/React | N | https://trello.com/invite/b/69e8f85fbd5b1e6133420b4f/ATTI2f11729442f5dd28207a891f37ca0d5e77651701/typeracing | Lucas Hyan | Sessão das 13:00 às 14:50. Setup inicial de ferramentas e ambiente de desenvolvimento. Quadro no Trello com backlog e pendências. |
| Desenvolvimento | 05/11/2026 | 05/11/2026 | 1,0 | Estudo técnico de lógica de digitação em React, instalação de dependências e implementação base do componente typing.jsx a partir de referência técnica | N | https://www.youtube.com/watch?v=J0vyTNxptZY | Lucas Hyan | Sessão das 21:00 às 22:00. Estudo do fluxo de cálculo de PPM/input controlado no tutorial e setup inicial de dependências do MVP local. |
| Desenvolvimento | 07/11/2026 | 07/11/2026 | 1,0 | Resolução de ambiente/scripts do Vite e implementação da Parte 1 do MVP: estrutura do componente Typing.jsx com exibição do texto alvo e captura de input controlado | N | https://github.com/lucasHyan/typeracing/commit/0efe528 | Lucas Hyan | Sessão das 13:52 às 14:57. Resolução de dependências no client e implementação do componente funcional de digitação com contador de caracteres. |
| Desenvolvimento | 07/11/2026 | 07/11/2026 | 4,0 | Implementação da Parte 2 e 3 do MVP: comparador caractere a caractere (verde/vermelho), cálculo de PPM em tempo real, pista de corrida com avatar e modularização de componentes | N | https://github.com/lucasHyan/typeracing/commit/f2ed970 | Lucas Hyan | Sessão das 15:00 às 19:00. Construção da validação visual instantânea, cronômetro de PPM em tempo real, renderização responsiva do carrinho na pista e extração de submódulos. |
| Desenvolvimento | 08/11/2026 | 08/11/2026 | 2,5 | Criação do repositório de frases educativas em JSON (paragrafos.json) com conteúdos de lógica e programação para a Ctrl+Play e rotina de sorteio aleatório | N | https://github.com/lucasHyan/typeracing/commit/da50ff5 | Lucas Hyan | Bloco 1 (13:20 às 15:50). Estruturação do banco local de frases contextualizadas em português e seleção dinâmica ao iniciar ou reiniciar cada partida. |
| Desenvolvimento | 08/11/2026 | 08/11/2026 | 2,7 | Finalização do modo Single Player: calibração do PPM, trava flexível de erro na palavra, animação de tremor (shake) e refatoração modular para Clean Code | N | https://github.com/lucasHyan/typeracing/commit/ba6a42b | Lucas Hyan | Bloco 2 (17:40 às 20:22). Isolamento das regras de validação em typingUtils.js e animações em animations.js, padronizando o código em inglês técnico e mantendo a interface em português. |
| Requisitos | 09/11/2026 | 09/11/2026 | 1,0 | Alinhamento pedagógico e operacional com a coordenação da Ctrl+Play Vila Ré via WhatsApp para validação temática e agendamento do teste piloto presencial | S | https://docs.google.com/document/d/1yURsbpE2Qp9_54O5V9HYyZbhOFmqY8k209iaQLL8r5I/edit?tab=t.e0wndrjicr3w | Lucas Hyan | Sessão das 17:00 às 18:00. Apresentação dos avanços do MVP Single Player e confirmação do primeiro encontro presencial para 21/11/2026 às 10h30. |
| Desenvolvimento | 10/11/2026 | 10/11/2026 | 2,0 | Inicialização do projeto backend em Node.js (`/server`), instalação das dependências Express, Socket.io e CORS e configuração da instância cliente `socket.io-client` | N | https://github.com/lucasHyan/typeracing/tree/main/server | Lucas Hyan | Bloco 1 (18:30 às 20:30). Preparação da arquitetura servidor/cliente em inglês técnico e configuração de conexão WebSocket na porta 4000. |
| Desenvolvimento | 10/11/2026 | 11/11/2026 | 3,5 | Implementação do servidor autoritativo em memória RAM (`server/index.js`) com eventos de sala e preparação inicial do lobby multiplayer | N | https://github.com/lucasHyan/typeracing/commit/93ffebd | Lucas Hyan | Bloco 2 noturno/madrugada (21:00 de 10/11 às 00:30 de 11/11). Desenvolvimento dos eventos `create_room`, `join_room`, `start_race`, `send_progress` e `disconnect`. |
| Desenvolvimento | 11/11/2026 | 12/11/2026 | 4,0 | Refatoração e organização modular dos componentes e estilos do multiplayer: divisão do Lobby em subcomponentes menores e centralização dos utilitários de apresentação da corrida | N | https://github.com/lucasHyan/typeracing/commit/83d76d5 | Lucas Hyan | Sessão noturna/madrugada (21:13 de 11/11 às 01:13 de 12/11). Padronização visual da interface, remoção de estilos legados do template e manutenção do fluxo multiplayer. |
| Requisitos | 12/11/2026 | 12/11/2026 | 1,0 | Gravação de vídeo de demonstração (4 min) do MVP multiplayer para a coordenação e alinhamento operacional com a equipe docente da Ctrl+Play Vila Ré | S | https://docs.google.com/document/d/1yURsbpE2Qp9_54O5V9HYyZbhOFmqY8k209iaQLL8r5I/edit?tab=t.0 | Lucas Hyan | Sessão das 18:30 às 19:30. Envio do vídeo de apresentação do funcionamento em sala para validação prévia do coordenador e organização da agenda presencial. |

**TOTAL DE HORAS DECLARADAS:** 33,5 h

### Resumo por etapa
| Etapa | Horas | % do total |
| :--- | :--- | :--- |
| Prospecção | 0 | 0% |
| Requisitos | 7,5 | 22,4% |
| Planejamento/design | 5,3 | 15,8% |
| Desenvolvimento | 20,7 | 61,8% |
| Testes | 0 | 0% |
| Entrega/implantação | 0 | 0% |
| Treinamento | 0 | 0% |
| Documentação | 0 | 0% |
| **Total** | **33,5** | **100%** |

### Resumo de encontros com o cliente (presenciais ou síncronos)
- **Horas em encontros com o cliente:** 2,0 h
- **Nº de encontros com o cliente:** 2

### Orientações de preenchimento
1. Uma linha por sessão (datas × atividade). Sessões abaixo de 15 min não precisam entrar.
2. Para a hora ser contabilizada, todo registro precisa de evidência: commit, print, foto, ata, declaração, e-mail.
3. Casos de dúvida (tempo de estudo, deslocamento, retrabalho) devem ser conversados com o professor antes de registrar.