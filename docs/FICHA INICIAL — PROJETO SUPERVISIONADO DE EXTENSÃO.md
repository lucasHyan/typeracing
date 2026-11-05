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
- **Se grupo, integrantes (máx. 5):**
- **Data de preenchimento:**
  05/08/2026

---

### 1. TEMA / TÍTULO PROVISÓRIO DO PROJETO

Plataforma Web Multiplayer para Jogos de Digitação Interativos em Sala de Aula

---

### 2. CLIENTE / COMUNIDADE EXTERNA ATENDIDA

_(Quem é a pessoa ou organização de fora do Infnet? Nome real sempre que possível. Cidade onde o atendimento presencial pode ocorrer.)_

- Cliente/organização: Escola de Programação/Robótica (Ctrl+Play) / Professores da Educação Básica
- Contato do cliente (se já houver): Coordenação Pedagógica Ctrl+Play Vila Ré
- Cidade / bairro: São Paulo / SP
- Já conversou com o cliente?
- [x] Sim
- [ ] Ainda não
- Projeto envolve tratamento de dados pessoais sensíveis ?
- [ ] Sim
- [x] Não

---

### 3. PROBLEMA / NECESSIDADE REAL

Professores e educadores precisam de uma plataforma web de jogos educativos baseada em links compartilháveis e sem necessidade de cadastro (no formato Kahoot).
A Dor/Necessidade:

Atualmente, as ferramentas para o aprendizado e prática de digitação exigem criação de contas, cadastros burocráticos e configurações demoradas. Na rotina escolar, esse processo consome um tempo precioso de aula e desengaja a turma antes mesmo do início da atividade.
A Solução:

A plataforma permitirá que o professor crie um lobby instantâneo e compartilhe o acesso com os alunos por um simples link. Ao entrar, os estudantes personalizam seus nomes e cores para jogar imediatamente. Dessa forma, o professor consegue acompanhar visualmente o progresso de toda a turma em tempo quase real, sem perder o ritmo pedagógico e mantendo os alunos motivados.
O Jogo:

O jogo será baseado inteiramente em navegadores web. Durante a partida, um mesmo parágrafo de texto é apresentado a todos os jogadores simultaneamente. Quem conseguir digitar o texto corretamente mais rápido vence a corrida. A tela exibe em tempo real o progresso da corrida de cada participante, indicando a distância percorrida pelo personagem/carro e métricas como Palavras Por Minuto (PPM).

---

### 4. COMPETÊNCIAS DA GRADUAÇÃO QUE VOU MOBILIZAR

_(O que você já sabe fazer e vai aplicar. Ex.: front-end web,
banco de dados, API, app mobile, IoT/hardware.)_

- Desenvolvimento Front-End Reativo (React.js)
- Desenvolvimento Back-End e Arquitetura de APIs (Node.js/Express)

### 4.1 OUTROS RECURSOS, COMPETÊNCIAS E APOIOS NECESSÁRIOS

_(O que o projeto vai exigir além do que você já domina e já tem em
mãos. Marque o que se aplica e detalhe. Se você não sabe ainda, marque
"a definir" — identificar isso cedo evita travar o projeto no meio.)_

**Infraestrutura e ferramentas**

- [x] Hospedagem / computação em nuvem — qual: ****\_\_\_\_****
- [x] Domínio / e-mail profissional
- [ ] Banco de dados hospedado
- [ ] Serviço ou API de terceiros (pagamento, mapas, envio de mensagens)
- [ ] Licença de software ou ferramenta paga
- [x] Repositório / ferramenta de gestão de tarefas
- [ ] Outro: ****\_\_\_\_****

**Hardware e dispositivos**

- [ ] Dispositivo físico para testes (celular, tablet, impressora)
- [ ] Componentes / placa / sensores (projetos de hardware)
- [ ] Equipamento do cliente ao qual preciso ter acesso
- [ ] Outro: ****\_\_\_\_****

**Conhecimento e apoio externo**

- [ ] Conversa com especialista ou profissional da área — quem: **\_\_\_**
- [ ] Consulta a outro professor do Infnet — quem: ****\_\_\_\_****
- [x] Tecnologia que ainda não domino e preciso estudar — qual: Programação assíncrona e gestão de salas em memória via Socket.io/WebSockets
- [ ] Conhecimento do domínio do cliente (como o negócio funciona)
- [ ] Apoio de colega ou terceiro em parte específica — qual: **\_\_\_**

**Acesso ao cliente e ao contexto**

- [ ] Ainda preciso ENCONTRAR o cliente
- [ ] Preciso de autorização formal do cliente para acessar dados
- [ ] Preciso visitar o local onde a solução será usada
- [ ] Preciso de dados/arquivos que estão com o cliente
- [x] Preciso combinar disponibilidade de agenda com o cliente

**Custos previstos**

- [x] Nenhum — tudo com recursos gratuitos
- [ ] Sim, previstos: ****\_\_\_\_****
- [ ] Quem arca: ( ) Eu ( ) Cliente ( ) A definir

**Do que marquei acima, o que é MAIS CRÍTICO — ou seja, sem isso o
projeto não anda?**

A implementação correta da comunicação em tempo real via WebSockets (Node.js + Socket.io) para sincronizar os participantes sem falhas de conexão.

**Como e até quando pretendo resolver esse item crítico?**

O que vou fazer: Criar um protótipo funcional básico de servidor Node.js com Socket.io simulando a criação de uma sala e a movimentação dos carrinhos.

- Prazo que me dou: 15/08/2026

---

### 5. ESCOPO MÍNIMO DA PRIMEIRA VERSÃO

_(O que ENTRA na primeira entrega e — importante — o que NÃO entra.)_

Entra:

    Jogo de digitação com 1 parágrafo aleatório

    Sistema de criar links de salas

    Sistema visual com pontos coloridos correndo até a chegada

    Tela final com nome e ranking da partida

Não entra (por enquanto):
Biblioteca de textos customizáveis pelo professor

Modo de jogo solo/treinamento sem sala

Sistema de chat ou mensagens entre alunos

Suporte a áudio, efeitos sonoros ou narração

Relatórios pedagógicos ou exportação em PDF/Excel

---

### 6. FORMA DE ATENDIMENTO

_(Como haverá presencialidade com o cliente? Reunião, visita, entrega
presencial, acompanhamento. A extensão exige elementos presenciais.)_

Durante alguns sabados será feito uma visita presencial onde eu vou acompanhar um professor implementar o jogo nos minutos finais de aula.

Mantenho contato com a equipe pedagógica via whatsapp durante todo o período de desenvolvimento

---

### 7. CARÁTER DO PROJETO

- [x] Social / gratuito para a comunidade
- [ ] Remunerado pelo cliente
- [ ] Relacionado à empresa onde estagio/trabalho

### 8. COMO VOU REGISTRAR EVIDÊNCIAS E HORAS

_(Como pretende comprovar o tempo investido: prints, fotos de reunião,
commits, prints de tarefas, atas. Lembre: você registra, o professor
dá anuência e atribui as horas.)_

Desenvolvimento e Código: Histórico de commits e Pull Requests com mensagens descritivas no repositório do GitHub.

Planejamento e Tarefas: Trello demonstrando a evolução e conclusão das atividades.

Sessões e Interações de Campo: Registros fotográficos e atas/anotações das reuniões de alinhamento e do teste piloto presencial em sala de aula.

Diário de Bordo / Registro de Horas: Documento compilado contendo o relatório de horas trabalhadas com datas, horários, descrições detalhadas das atividades e evidências visuais anexadas.

---

### CHECKLIST — MEU PROJETO É DE EXTENSÃO?

_(Marque. Se algum item ficar em branco, converse com o professor.)_

- [x] Atende uma pessoa/organização de FORA do Infnet ^x7ku
- [x] EU (ou meu grupo) sou quem executa o projeto
- [x] Terá orientação do professor ao longo dos encontros
- [x] Aplica competências que já desenvolvi na graduação
- [x] Tem elemento presencial com o cliente/comunidade
- [x] Traz benefício real para quem é atendido

---

### ANUÊNCIA DO PROFESSOR-ORIENTADOR _(preenchimento do professor)_

- [ ] Aprovado para desenvolvimento
- [ ] Aprovado com ajustes (ver observações)
- [ ] Precisa redefinir (ver observações)

**Observações:**

**Data da anuência:**
