// Textos das corridas, por dificuldade.
// - Iniciante: frases curtas e simples (programação + conhecimentos gerais).
// - Intermediário: frases mais longas, com pontuação, acentos e números.
// - Programador: trechos curtos de código real. Quebras de linha viram "Enter"
//   na digitação e a indentação usa espaços (2 em JS/HTML/CSS, 4 em Python).

export const RACE_TEXTS = {
  Iniciante: [
    "O computador segue instruções passo a passo.",
    "Um algoritmo é uma receita para resolver um problema.",
    "Variáveis guardam valores na memória do computador.",
    "Errar faz parte de aprender a programar.",
    "Todo programa começa com uma boa ideia.",
    "Um bit pode valer zero ou um.",
    "A internet conecta computadores do mundo todo.",
    "Senhas fortes protegem as nossas contas.",
    "Antes de clicar em um link, veja se ele é seguro.",
    "Um robô usa sensores para perceber o ambiente.",
    "Praticar digitação melhora a velocidade e a atenção.",
    "Trabalhar em equipe ajuda a vencer desafios.",
    "O Sol é a estrela mais próxima da Terra.",
    "As plantas usam a luz do Sol para produzir alimento.",
    "A água ferve a cem graus ao nível do mar.",
    "O coração bombeia sangue para todo o corpo.",
    "O Brasil tem vinte e seis estados e um Distrito Federal.",
    "Ler um pouco todos os dias deixa a mente mais forte.",
    "A Lua leva cerca de um mês para dar a volta na Terra.",
    "Reciclar o lixo ajuda a cuidar do planeta.",
  ],
  Intermediário: [
    "A programação desenvolve o raciocínio lógico e a resolução de problemas na sala de aula.",
    "Robôs e algoritmos transformam a curiosidade em inovação tecnológica para o futuro.",
    "Estruturas condicionais e laços de repetição organizam os passos de qualquer aplicação.",
    "A criação de jogos digitais estimula o pensamento crítico e o trabalho em equipe.",
    "Desenvolver software exige atenção aos detalhes, testes constantes e persistência.",
    "As funções e componentes em React dividem grandes sistemas em partes simples e reutilizáveis.",
    "Codificar é como construir uma ponte entre a imaginação e a tela do computador.",
    "Ada Lovelace escreveu o primeiro algoritmo da história, em 1843, para a máquina analítica de Charles Babbage.",
    "Um laço de repetição executa o mesmo bloco de código várias vezes, até que uma condição deixe de ser verdadeira.",
    "Depurar um programa é investigar o erro com calma: leia a mensagem, teste hipóteses e corrija uma coisa por vez.",
    "O sistema binário usa apenas dois dígitos, 0 e 1, e é a base de todas as informações dentro de um computador.",
    "O protocolo HTTPS criptografa os dados trocados entre o navegador e o site, protegendo suas informações.",
    "Alan Turing ajudou a decifrar códigos na Segunda Guerra Mundial e é considerado um dos pais da computação.",
    "Funções bem nomeadas deixam o código mais fácil de ler: quem lê deve entender o que ela faz sem adivinhar.",
    "Um banco de dados organiza informações em tabelas, permitindo buscar, filtrar e atualizar registros com rapidez.",
    "Versionar o código com Git permite voltar no tempo, comparar mudanças e trabalhar em equipe sem perder nada.",
    "Pensamento computacional envolve decompor problemas, reconhecer padrões, abstrair detalhes e criar algoritmos.",
    "A inteligência artificial aprende padrões a partir de exemplos, mas depende de pessoas para usá-la com responsabilidade.",
    "A fotossíntese transforma luz, água e gás carbônico em glicose e oxigênio, sustentando quase toda a vida na Terra.",
    "A Amazônia abriga a maior biodiversidade do planeta e influencia as chuvas de grande parte da América do Sul.",
    "O ciclo da água inclui evaporação, condensação e precipitação, renovando rios, lagos e reservatórios.",
    "A luz viaja a cerca de 300 mil quilômetros por segundo; nada no universo é mais rápido do que ela.",
  ],
  Programador: [
    `function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}`,
    `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
    `def fatorial(n):
    if n <= 1:
        return 1
    return n * fatorial(n - 1)`,
    `const soma = (a, b) => a + b;
console.log(soma(2, 3));`,
    `const pares = numeros.filter((n) => n % 2 === 0);`,
    `const dobro = [1, 2, 3].map((n) => n * 2);`,
    `const inverter = (texto) => texto.split("").reverse().join("");`,
    `for (let i = 1; i <= 5; i++) {
  console.log("Volta " + i);
}`,
    `async function carregar(url) {
  const resposta = await fetch(url);
  return resposta.json();
}`,
    `class Carro {
  constructor(cor) {
    this.cor = cor;
  }
  acelerar() {
    return "Vrum!";
  }
}`,
    `document.querySelector("#titulo").textContent = "Oi, turma!";`,
    `quadrados = [x * x for x in range(10)]
print(quadrados)`,
    `def media(valores):
    return sum(valores) / len(valores)`,
    `notas = {"Ana": 9, "Leo": 7}
for nome, nota in notas.items():
    print(f"{nome}: {nota}")`,
    `contagem = 3
while contagem > 0:
    print(contagem)
    contagem -= 1
print("Largada!")`,
    `def eh_primo(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True`,
    `<ul class="linguagens">
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>`,
    `<form>
  <label for="nome">Nome</label>
  <input id="nome" type="text">
  <button>Enviar</button>
</form>`,
    `<a href="https://example.com">
  <img src="logo.png" alt="Logo">
</a>`,
    `.botao {
  color: white;
  background: #ff6b2b;
  border-radius: 8px;
}`,
    `SELECT nome, pontos
FROM jogadores
WHERE pontos >= 70
ORDER BY pontos DESC;`,
  ],
};

export const CUSTOM_DIFFICULTY = "Customizado";
export const DIFFICULTIES = [...Object.keys(RACE_TEXTS), CUSTOM_DIFFICULTY];
export const MAX_RACE_TEXT_LENGTH = 1000;
export const MIN_RACE_TEXT_LENGTH = 10;

// Deixa um texto colado "digitável": quebras de linha Unix, tabs como espaços,
// aspas/travessões tipográficos como ASCII e sem espaços sobrando no fim das linhas.
export function normalizeRaceText(value = "") {
  return String(value)
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "    ")
    .replace(/[   ]/g, " ")
    .replace(/[​-‍﻿]/g, "")
    .replace(/[“”„«»]/g, '"')
    .replace(/[‘’‚]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_RACE_TEXT_LENGTH);
}
