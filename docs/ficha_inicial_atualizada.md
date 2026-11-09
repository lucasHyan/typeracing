## Desenvolvimento de Software, Apps, Sites ou Hardware

> Preencha os campos 1 a 5 até o Encontro 2. Os campos 6 a 8 podem
> ser refinados ao longo da orientação. Este documento é a base do
> seu projeto e do seu registro de horas.

---

### IDENTIFICAÇÃO

- **Nome completo:** Lucas Hyan Monteiro Dos Santos
- **Curso de graduação:** Análise e Desenvolvimento de Sistemas
- **E-mail / contato:** lucas.hyan@outlook.com | (11) 95445-1968
- **Projeto individual ou em grupo:** (X) Individual ( ) Grupo
- **Se grupo, integrantes (máx. 5):** N/A
- **Data de preenchimento:** 05/08/2026 (Atualizado em: 09/11/2026)

---

### 1. TEMA / TÍTULO PROVISÓRIO DO PROJETO

Plataforma Web Multiplayer para Jogos de Digitação Interativos em Sala de Aula

---

### 2. CLIENTE / COMUNIDADE EXTERNA ATENDIDA

- **Cliente/organização:** Escola de Programação e Robótica Ctrl+Play (Unidade Vila Ré) / Professores da Educação Básica que atuam na unidade
- **Contato do cliente:** Coordenação Pedagógica / Professor Parceiro (Telefone/WhatsApp: 11 97072-0124)
- **Cidade / bairro:** São Paulo / SP — Bairro Vila Ré
- **Já conversou com o cliente?**
  - [x] Sim
  - [ ] Ainda não
- **Projeto envolve tratamento de dados pessoais sensíveis?**
  - [ ] Sim
  - [x] Não _(O sistema funciona exclusivamente com apelidos temporários na sala, sem cadastro, login ou persistência de dados sensíveis de menores)_

---

### 3. PROBLEMA / NECESSIDADE REAL

Professores e educadores precisam de uma plataforma web de jogos educativos baseada em links compartilháveis e sem necessidade de cadastro (no formato Kahoot).

**A Dor/Necessidade:**  
Atualmente, as ferramentas para o aprendizado e prática de digitação exigem criação de contas, cadastros burocráticos e configurações demoradas. Na rotina escolar, esse processo consome um tempo precioso de aula e desengaja a turma antes mesmo do início da atividade.

**A Solução:**  
A plataforma permitirá que o professor crie um lobby instantâneo e compartilhe o acesso com os alunos por um simples link. Ao entrar, os estudantes personalizam seus nomes e cores para jogar imediatamente. Dessa forma, o professor consegue acompanhar visualmente o progresso de toda a turma em tempo quase real, sem perder o ritmo pedagógico e mantendo os alunos motivados.

**O Jogo:**  
O jogo será baseado inteiramente em navegadores web. Durante a partida, um mesmo parágrafo de texto é apresentado a todos os jogadores simultaneamente. Quem conseguir digitar o texto corretamente mais rápido vence a corrida. A tela exibe em tempo real o progresso da corrida de cada participante, indicando a distância percorrida pelo personagem/carro e métricas como Palavras Por Minuto (PPM).

---

### 4. COMPETÊNCIAS DA GRADUAÇÃO QUE VOU MOBILIZAR

- Desenvolvimento Front-End Reativo (React.js)
- Desenvolvimento Back-End e Arquitetura de APIs (Node.js/Express)

### 4.1 OUTROS RECURSOS, COMPETÊNCIAS E APOIOS NECESSÁRIOS

**Infraestrutura e ferramentas**

- [x] Hospedagem / computação em nuvem — qual: Render.com / Railway (Back-end) e Vercel (Front-end) em planos gratuitos
- [ ] Domínio / e-mail profissional
- [ ] Banco de dados hospedado
- [ ] Serviço ou API de terceiros (pagamento, mapas, envio de mensagens)
- [ ] Licença de software ou ferramenta paga
- [x] Repositório / ferramenta de gestão de tarefas — qual: GitHub e Trello
- [ ] Outro: **\*\*\*\***\_\_\_\_**\*\*\*\***

**Hardware e dispositivos**

- [x] Dispositivo físico para testes (celular, tablet, impressora) — qual: Smartphones e notebooks para testes de concorrência e simulação simultânea
- [ ] Componentes / placa / sensores (projetos de hardware)
- [ ] Equipamento do cliente ao qual preciso ter acesso
- [ ] Outro: **\*\*\*\***\_\_\_\_**\*\*\*\***

**Conhecimento e apoio externo**

- [ ] Conversa com especialista ou profissional da área — quem: **\*\*\*\***\_\_\_\_**\*\*\*\***
- [ ] Consulta a outro professor do Infnet — quem: **\*\*\*\***\_\_\_\_**\*\*\*\***
- [x] Tecnologia que ainda não domino e preciso estudar — qual: Programação assíncrona e gestão de salas em memória via Socket.io/WebSockets
- [x] Conhecimento do domínio do cliente (como o negócio funciona): Dinâmica pedagógica de digitação e gestão de tempo em sala de aula infantil/juvenil
- [ ] Apoio de colega ou terceiro em parte específica — qual: **\*\*\*\***\_\_\_\_**\*\*\*\***

**Acesso ao cliente e ao contexto**

- [ ] Ainda preciso ENCONTRAR o cliente
- [ ] Preciso de autorização formal do cliente para acessar dados
- [x] Preciso visitar o local onde a solução será usada: Ctrl+Play Vila Ré para teste de campo e medição de latência real
- [ ] Preciso de dados/arquivos que estão com o cliente
- [x] Preciso combinar disponibilidade de agenda com o cliente: Alinhamento de calendário com a grade de aulas aos sábados

**Custos previstos**

- [x] Nenhum — tudo com recursos gratuitos
- [ ] Sim, previstos: **\*\*\*\***\_\_\_\_**\*\*\*\***
- [ ] Quem arca: ( ) Eu ( ) Cliente ( ) A definir

**Do que marquei acima, o que é MAIS CRÍTICO — ou seja, sem isso o projeto não anda?**  
A implementação correta da comunicação em tempo real via WebSockets (Node.js + Socket.io) para sincronizar os participantes sem falhas de conexão.

**Como e até quando pretendo resolver esse item crítico?**

- **O que vou fazer:** Criar um protótipo funcional básico de servidor Node.js com Socket.io simulando a criação de uma sala e a movimentação dos carrinhos.
- **Prazo que me dou:** 15/08/2026 (Protótipo base planejado; integração e finalização do servidor até 16/11/2026 para a Rodada 2)

---

### 5. ESCOPO MÍNIMO DA PRIMEIRA VERSÃO

**Entra:**

- Jogo de digitação com 1 parágrafo aleatório
- Sistema de criar links de salas
- Sistema visual com pontos coloridos correndo até a chegada
- Tela final com nome e ranking da partida

**Não entra (por enquanto):**

- Biblioteca de textos customizáveis pelo professor
- Modo de jogo solo/treinamento sem sala
- Sistema de chat ou mensagens entre alunos
- Suporte a áudio, efeitos sonoros ou narração
- Relatórios pedagógicos ou exportação em PDF/Excel

---

### 6. FORMA DE ATENDIMENTO

- **Primeiro Encontro Síncrono / Presencial Datado:** Em conversas para o possivel agendamento ao fim do mês, na unidade da Ctrl+Play Vila Ré.
- **Formato da Presencialidade:** Visita presencial para acompanhar a turma em aula real, aplicando o teste piloto do protótipo com 3 a 5 alunos nos 15 minutos finais da aula. A sessão terá como foco observar o fluxo de usabilidade dos estudantes, colher feedbacks pedagógicos com o professor parceiro e realizar a medição da latência real na rede Wi-Fi local da escola.
- **Acompanhamento Contínuo:** Alinhamentos e validações assíncronas semanais via WhatsApp com a coordenação pedagógica da unidade ao longo do desenvolvimento.

---

### 7. CARÁTER DO PROJETO

- [x] Social / gratuito para a comunidade
- [ ] Remunerado pelo cliente
- [ ] Relacionado à empresa onde estagio/trabalho

---

### 8. COMO VOU REGISTRAR EVIDÊNCIAS E HORAS

- **Desenvolvimento e Código:** Histórico de commits e Pull Requests com mensagens descritivas no repositório do GitHub.
- **Planejamento e Tarefas:** Trello demonstrando a evolução e conclusão das atividades através de quadro Kanban.
- **Sessões e Interações de Campo:** Registros fotográficos e anotações/atas dos alinhamentos virtuais e do teste piloto presencial em sala de aula.
- **Diário de Bordo / Registro de Horas:** Documento compilado contendo o relatório de horas trabalhadas com datas, horários, descrições detalhadas das atividades e evidências visuais anexadas.

---

### CHECKLIST — MEU PROJETO É DE EXTENSÃO?

- [x] Atende uma pessoa/organização de FORA do Infnet
- [x] EU (ou meu grupo) sou quem executa o projeto
- [x] Terá orientação do professor ao longo dos encontros
- [x] Aplica competências que já desenvolvi na graduação
- [x] Tem elemento presencial com o cliente/comunidade
- [x] Traz benefício real para quem é atendido

---

### ANUÊNCIA DO PROFESSOR-ORIENTADOR _(preenchimento do professor)_

- [x] Aprovado para desenvolvimento
- [ ] Aprovado com ajustes (ver observações)
- [ ] Precisa redefinir (ver observações)

**Observações:**  
Ficha avaliada e aprovada com deliberação de anuência em 07/08/2026. Adequações de contato institucional do cliente e datação formal do primeiro encontro presencial atendidas conforme orientações para o acompanhamento formal.

**Data da anuência:** 07/08/2026 (Atualização de acompanhamento submetida em 09/11/2026)
