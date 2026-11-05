
Instituto Infnet — Projetos supervisionados desenvolvimento de software, apps, sites ou hardware [26E3-26E4]
Lucas Hyan Monteiro dos Santos
Ficha recebida e avaliada: https://drive.google.com/open?id=1CG80nqmzPF2YY1_6Y0RrMI8T8-4Ziuf3
DELIBERAÇÃO DE ANUÊNCIA: APROVADO PARA DESENVOLVIMENTO
1. Enquadramento
Plataforma web multiplayer de jogos de digitação para uso em sala de aula, no formato de sala por link compartilhável e sem cadastro, para a Ctrl+Play da Vila Ré, em São Paulo, e para os professores de educação básica que atuam com ela. O aluno entra pelo link, escolhe nome e cor, e o educador acompanha o progresso da turma em tempo quase real.
2. Qualifica como extensão?
QUALIFICA. Cliente externo nomeado, conversa já realizada, presencialidade concreta e datável, com visitas aos sábados acompanhando um professor usar o jogo nos minutos finais da aula, e contato contínuo com a coordenação pedagógica. Caráter social e gratuito, benefício real, checklist inteiramente coerente com o corpo da ficha. O plano de evidências é detalhado.
3. Escopo
Bem cortado, e o corte está no lugar certo. Quatro itens na primeira versão, todos verificáveis, e a lista do que não entra é honesta e específica. Deixar biblioteca de textos, modo solo e relatórios pedagógicos de fora foi a decisão acertada: são exatamente os itens que parecem pequenos e se deixar, podem consumir o semestre inteiro.
4. Recurso crítico / risco nº 1
Você identificou corretamente o item crítico, que é a comunicação em tempo real via WebSockets, e se deu um prazo curto para provar isso, o que é o movimento certo. O risco que a ficha não capta é de sala de aula real: vinte alunos numa rede escolar, em máquinas heterogêneas, com Wi-Fi disputado. O protótipo funcionar na sua máquina não é suficiente, o teste que importa é o da Vila Ré.
5. Orientação
Uma sugestão de arquitetura: mantenha o servidor como única autoridade sobre o progresso da corrida. Se o cliente informar quantos caracteres já digitou, um aluno com o console aberto pode facilmente vencer a corrida, numa turma de escola de programação isso pode acontecer logo nas primeiras semanas. Considere enviar as teclas para o servidor e calcular lá a posição e o PPM. Sobre reconexão, vale considerar guardar o estado da sala em memória com um identificador de jogador persistido no navegador, para que uma eventual instabilidade na rede devolva o aluno à corrida em vez de eliminá-lo. Vale aproveitar a primeira visita para medir a latência real na rede da escola antes de fechar a taxa de atualização da tela. Sobre dados, o formato sem cadastro que você escolheu já é a melhor proteção possível, considerando que quem digita são crianças, e eu manteria essa decisão mesmo quando surgir a tentação de guardar ranking histórico.
6. Próximos passos
Agendar e datar a primeira visita à Ctrl+Play da Vila Ré, e levar o protótipo de sala para rodar na rede da escola, ainda que só com dois ou três participantes.



CRONOGRAMA/TIMESHEET: Use o modelo existente em https://gist.github.com/kndrio/d5b488a0fa3e5e04d8676124a36ff67a#file-timesheet-registro-de-horas-projeto-supervisionado-de-extensao-md para preenchimento e envio em formulário próprio que será liberado em breve. O prazo combinado é até 19/08. Esta primeira entrega PODE vir sem evidências sendo só uma proposta com as estimativas de etapas e horas. Caso sejam horas de atividades já realizadas (iniciadas a partir da primeira aula em 22/07) que você queira contabilizar, precisam vir acompanhadas de evidências.
DELIBERAÇÃO DE ANUÊNCIA:
APROVADO PARA DESENVOLVIMENTO.

Nota do Orientador: A contagem de horas válidas de extensão iniciou em 22/07, porém o cômputo formal está condicionado ao atendimento das adequações solicitadas nesta ficha e à comprovação no Timesheet.
