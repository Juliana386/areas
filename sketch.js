// Variáveis de estado e jogo
let estado = 0; // 0: Início, 1: Jogando, 2: Acertou, 3: Fim (Perdeu), 4: Fim (Venceu)
let vidas = 3;
let pontuacao = 0;
let questaoAtual = 0;
let questoes = [];
let nomeAluno = "";

// Elementos da Interface (DOM)
let inputNome, btnIniciar, inputResposta, btnResponder, btnDica, btnProxima, btnReiniciar;

// Variáveis auxiliares
let dicaAtual = "";
let mensagemErro = "";
let mensagemAcerto = "";
let ranking = [
  { nome: "Alex", pontos: 800 },
  { nome: "Bia", pontos: 650 },
  { nome: "Carlos", pontos: 400 }
];
let frasesIncentivo = ["Excelente!", "Muito bem!", "Você é incrível!", "Mandou bem!", "Perfeito!", "Gênio da Matemática!"];
let bolhas = [];

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  
  // Criar bolhas animadas para o fundo do jogo
  for(let i = 0; i < 20; i++) {
    bolhas.push({ x: random(width), y: random(height), r: random(20, 60), v: random(0.5, 1.5) });
  }

  // --- ELEMENTOS DA TELA INICIAL ---
  inputNome = createInput('');
  inputNome.position(width / 2 - 100, height / 2);
  inputNome.size(200, 30);
  inputNome.attribute('placeholder', 'Digite seu nome aqui');
  inputNome.style('text-align', 'center');

  btnIniciar = createButton('COMEÇAR JOGO');
  btnIniciar.position(width / 2 - 75, height / 2 + 50);
  btnIniciar.size(150, 40);
  btnIniciar.style('background-color', '#4CAF50');
  btnIniciar.style('color', 'white');
  btnIniciar.style('border-radius', '8px');
  btnIniciar.style('font-weight', 'bold');
  btnIniciar.mousePressed(iniciarJogo);

  // --- ELEMENTOS DA TELA DE JOGO ---
  inputResposta = createInput('');
  inputResposta.position(width / 2 - 50, height / 2 + 100);
  inputResposta.size(100, 30);
  inputResposta.style('text-align', 'center');
  inputResposta.hide();

  btnResponder = createButton('Responder');
  btnResponder.position(width / 2 - 50, height / 2 + 140);
  btnResponder.size(100, 35);
  btnResponder.style('background-color', '#2196F3');
  btnResponder.style('color', 'white');
  btnResponder.style('border-radius', '5px');
  btnResponder.mousePressed(verificarResposta);
  btnResponder.hide();

  btnDica = createButton('Dica da Fórmula');
  btnDica.position(width / 2 - 60, height / 2 + 190);
  btnDica.size(120, 30);
  btnDica.style('background-color', '#FF9800');
  btnDica.style('color', 'white');
  btnDica.style('border-radius', '5px');
  btnDica.mousePressed(mostrarDica);
  btnDica.hide();

  // --- ELEMENTO DA TELA DE ACERTO ---
  btnProxima = createButton('Próxima Questão');
  btnProxima.position(width / 2 - 75, height / 2 + 100);
  btnProxima.size(150, 40);
  btnProxima.style('background-color', '#4CAF50');
  btnProxima.style('color', 'white');
  btnProxima.style('border-radius', '8px');
  btnProxima.mousePressed(proximaQuestao);
  btnProxima.hide();

  // --- ELEMENTO DA TELA FINAL ---
  btnReiniciar = createButton('Jogar Novamente');
  btnReiniciar.position(width / 2 - 75, height - 120);
  btnReiniciar.size(150, 40);
  btnReiniciar.style('background-color', '#E91E63');
  btnReiniciar.style('color', 'white');
  btnReiniciar.style('border-radius', '8px');
  btnReiniciar.mousePressed(reiniciarJogo);
  btnReiniciar.hide();
}

function draw() {
  if (estado === 0) desenharTelaInicial();
  else if (estado === 1) desenharTelaJogo();
  else if (estado === 2) desenharTelaAcerto();
  else if (estado === 3) desenharTelaFim(false); // Perdeu
  else if (estado === 4) desenharTelaFim(true);  // Venceu
}

// ================= TELAS =================

function desenharFundoAnimado() {
  // Degradê azul moderno
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(20, 30, 70), color(30, 144, 255), inter);
    stroke(c);
    line(0, i, width, i);
  }
  // Bolhas subindo
  noStroke();
  fill(255, 255, 255, 25);
  for(let b of bolhas) {
    circle(b.x, b.y, b.r);
    b.y -= b.v;
    if(b.y < -b.r) b.y = height + b.r;
  }
}

function desenharTelaInicial() {
  desenharFundoAnimado();
  fill(255);
  textSize(45);
  textStyle(BOLD);
  text("DESAFIO DAS ÁREAS", width / 2, 120);
  
  textSize(20);
  textStyle(NORMAL);
  text("Calcule a área das figuras para avançar de nível.\nVocê tem 3 vidas. Boa sorte!", width / 2, 190);
  
  textSize(18);
  text("Qual é o seu nome?", width / 2, height / 2 - 20);
}

function desenharTelaJogo() {
  desenharFundoAnimado();
  
  let nivelAtual = floor(questaoAtual / 4) + 1; // 4 questões por nível
  
  // HUD Superior (Corrigido para não cortar na borda)
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text("Aluno: " + nomeAluno, 30, 30);
  text("Pontos: " + pontuacao, 30, 60);
  
  textAlign(RIGHT);
  // Recuado para width - 30 para evitar corte
  text("Vidas: " + "❤️".repeat(vidas), width - 30, 30); 
  text("Nível: " + nivelAtual + " / 3", width - 30, 60);
  text("Questão: " + (questaoAtual + 1) + " / 12", width - 30, 90);

  // Quadro Branco Principal
  fill(255, 255, 255, 240);
  rectMode(CENTER);
  noStroke();
  rect(width / 2, height / 2 - 10, 680, 280, 15);
  
  // Desenhar a figura geométrica
  desenharFigura(questoes[questaoAtual]);

  // Texto da Pergunta
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(22);
  textStyle(BOLD);
  text(questoes[questaoAtual].texto, width / 2, height / 2 + 40);

  // Mensagens
  if (mensagemErro !== "") {
    fill(231, 76, 60);
    textSize(18);
    text(mensagemErro, width / 2, height / 2 + 230);
  }
  if (dicaAtual !== "") {
    fill(255, 200, 0);
    stroke(0);
    strokeWeight(1);
    textSize(18);
    text(dicaAtual, width / 2, height / 2 + 250);
    noStroke();
  }
}

// ================= DESENHO DAS FIGURAS =================
function desenharFigura(q) {
  push();
  translate(width / 2, height / 2 - 70); // Posiciona no topo do quadro branco
  stroke(0);
  strokeWeight(2);
  fill(135, 206, 250); // Azul claro para as figuras
  textSize(16);
  textStyle(NORMAL);
  noStroke();

  if (q.tipo === 'quadrado') {
    stroke(0); rect(0, 0, 80, 80);
    noStroke(); fill(0); text(q.rotulos[0], 0, 55);
  } 
  else if (q.tipo === 'retangulo') {
    stroke(0); rect(0, 0, 120, 70);
    noStroke(); fill(0); text(q.rotulos[0], 0, 50); // Base
    text(q.rotulos[1], 80, 0); // Altura
  } 
  else if (q.tipo === 'triangulo') {
    stroke(0); triangle(-50, 40, 50, 40, 0, -40);
    // Linha da altura
    drawingContext.setLineDash([5, 5]);
    line(0, 40, 0, -40);
    drawingContext.setLineDash([]);
    noStroke(); fill(0);
    text(q.rotulos[0], 0, 55); // Base
    text("h=" + q.rotulos[1], 25, 0); // Altura
  } 
  else if (q.tipo === 'paralelogramo') {
    stroke(0); quad(-60, 35, 40, 35, 60, -35, -40, -35);
    drawingContext.setLineDash([5, 5]);
    line(40, 35, 40, -35);
    drawingContext.setLineDash([]);
    noStroke(); fill(0);
    text(q.rotulos[0], -10, 50);
    text("h=" + q.rotulos[1], 65, 0);
  } 
  else if (q.tipo === 'losango') {
    stroke(0); quad(0, -50, 40, 0, 0, 50, -40, 0);
    drawingContext.setLineDash([5, 5]);
    line(-40, 0, 40, 0); line(0, -50, 0, 50);
    drawingContext.setLineDash([]);
    noStroke(); fill(0);
    text(q.rotulos[0], -20, -20);
    text(q.rotulos[1], 20, 20);
  } 
  else if (q.tipo === 'trapezio') {
    stroke(0); quad(-60, 40, 60, 40, 30, -30, -30, -30);
    drawingContext.setLineDash([5, 5]);
    line(30, 40, 30, -30);
    drawingContext.setLineDash([]);
    noStroke(); fill(0);
    text("B=" + q.rotulos[0], 0, 55);
    text("b=" + q.rotulos[1], 0, -45);
    text("h=" + q.rotulos[2], 55, 5);
  }
  else if (q.tipo === 'aplicacao') {
    // Desenha uma parede com grid para simular azulejos
    stroke(100); fill(220); rect(0, 0, 140, 80);
    for(let i = -70; i <= 70; i+=20) line(i, -40, i, 40);
    for(let j = -40; j <= 40; j+=20) line(-70, j, 70, j);
    noStroke(); fill(0);
    text(q.rotulos[0], 0, -55);
    // Pequeno azulejo do lado
    stroke(0); fill(255, 100, 100); rect(100, 0, 25, 25);
    noStroke(); fill(0); text(q.rotulos[1], 100, 25);
  }
  pop();
}

function desenharTelaAcerto() {
  background(46, 204, 113); 
  fill(255);
  textSize(50);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(mensagemAcerto, width / 2, height / 2 - 50);
  textSize(24);
  text("Você ganhou +100 pontos!", width / 2, height / 2 + 20);
}

function desenharTelaFim(venceu) {
  desenharFundoAnimado();
  
  if (venceu) {
    fill(255, 215, 0); textSize(45); textStyle(BOLD);
    text("PARABÉNS, " + nomeAluno.toUpperCase() + "!", width / 2, 80);
    fill(255); textSize(25); text("VOCÊ COMPLETOU OS 3 NÍVEIS!", width / 2, 130);
  } else {
    fill(231, 76, 60); textSize(45); textStyle(BOLD);
    text("FIM DE JOGO, " + nomeAluno.toUpperCase(), width / 2, 80);
    fill(255); textSize(25); text("Suas vidas acabaram.", width / 2, 130);
  }

  // Ranking
  fill(255, 255, 255, 240);
  rectMode(CENTER);
  rect(width / 2, 330, 400, 250, 15);
  
  fill(0);
  textSize(28);
  text("🏆 RANKING FINAL 🏆", width / 2, 240);
  
  textSize(22);
  textAlign(LEFT);
  let rankingAtual = [...ranking];
  rankingAtual.sort((a, b) => b.pontos - a.pontos);
  
  for (let i = 0; i < min(4, rankingAtual.length); i++) {
    let p = rankingAtual[i];
    let y = 290 + (i * 35);
    if (p.nome === nomeAluno && p.pontos === pontuacao) {
      fill(220, 20, 60); textStyle(BOLD);
    } else {
      fill(50); textStyle(NORMAL);
    }
    text((i + 1) + "º - " + p.nome, width / 2 - 150, y);
    text(p.pontos + " pts", width / 2 + 80, y);
  }
  textAlign(CENTER);
}

// ================= LÓGICA =================

function iniciarJogo() {
  nomeAluno = inputNome.value().trim();
  if (nomeAluno === "") nomeAluno = "Estudante";
  
  esconderTudo();
  gerarQuestoes(); // Gera as 12 perguntas exatas
  vidas = 3;
  pontuacao = 0;
  questaoAtual = 0;
  
  inputResposta.show();
  btnResponder.show();
  btnDica.show();
  estado = 1;
}

function verificarResposta() {
  let resposta = parseFloat(inputResposta.value().replace(',', '.'));
  let correta = questoes[questaoAtual].resposta;
  
  if (resposta === correta) {
    pontuacao += 100;
    mensagemAcerto = random(frasesIncentivo);
    esconderTudo();
    btnProxima.show();
    estado = 2;
  } else {
    vidas--;
    pontuacao = max(0, pontuacao - 20);
    inputResposta.value('');
    if (vidas <= 0) finalizarJogo(false);
    else {
      mensagemErro = "Resposta incorreta! Perdeu 1 vida ❤️";
      setTimeout(() => { mensagemErro = ""; }, 2500);
    }
  }
}

function proximaQuestao() {
  questaoAtual++;
  if (questaoAtual >= 12) finalizarJogo(true);
  else {
    inputResposta.value('');
    dicaAtual = "";
    esconderTudo();
    inputResposta.show();
    btnResponder.show();
    btnDica.show();
    estado = 1;
  }
}

function mostrarDica() {
  dicaAtual = questoes[questaoAtual].dica;
  pontuacao = max(0, pontuacao - 10);
}

function finalizarJogo(venceu) {
  esconderTudo();
  ranking.push({ nome: nomeAluno, pontos: pontuacao });
  btnReiniciar.show();
  estado = venceu ? 4 : 3;
}

function reiniciarJogo() {
  esconderTudo();
  inputNome.value('');
  inputNome.show();
  btnIniciar.show();
  ranking.pop(); 
  estado = 0;
}

function esconderTudo() {
  inputNome.hide(); btnIniciar.hide();
  inputResposta.hide(); btnResponder.hide();
  btnDica.hide(); btnProxima.hide(); btnReiniciar.hide();
  mensagemErro = ""; dicaAtual = "";
}

// ================= GERADOR DE 12 QUESTÕES =================
function gerarQuestoes() {
  questoes = [];
  
  // -- NÍVEL 1 (Questões 1 a 4) --
  let l1 = floor(random(5, 12));
  questoes.push({ texto: `Qual é a área de um QUADRADO\ncom lado de ${l1} cm?`, resposta: l1 * l1, dica: "Fórmula: Lado × Lado", tipo: 'quadrado', rotulos: [l1 + ' cm'] });

  let b2 = floor(random(6, 15)); let h2 = floor(random(4, 9));
  questoes.push({ texto: `Calcule a área do RETÂNGULO\ncom base de ${b2} m e altura de ${h2} m.`, resposta: b2 * h2, dica: "Fórmula: Base × Altura", tipo: 'retangulo', rotulos: [b2 + ' m', h2 + ' m'] });

  let b3 = floor(random(5, 10))*2; let h3 = floor(random(6, 12));
  questoes.push({ texto: `Qual a área de um TRIÂNGULO\ncom base ${b3} cm e altura ${h3} cm?`, resposta: (b3 * h3)/2, dica: "Fórmula: (Base × Altura) ÷ 2", tipo: 'triangulo', rotulos: [b3 + ' cm', h3 + ' cm'] });

  let l4 = floor(random(15, 25));
  questoes.push({ texto: `Qual é a área de um QUADRADO maior\ncom lado de ${l4} cm?`, resposta: l4 * l4, dica: "Fórmula: Lado × Lado", tipo: 'quadrado', rotulos: [l4 + ' cm'] });

  // -- NÍVEL 2 (Questões 5 a 8) --
  let b5 = floor(random(10, 20)); let h5 = floor(random(5, 12));
  questoes.push({ texto: `Calcule a área do PARALELOGRAMO\n(base ${b5} cm, altura ${h5} cm).`, resposta: b5 * h5, dica: "Fórmula: Base × Altura", tipo: 'paralelogramo', rotulos: [b5 + ' cm', h5 + ' cm'] });

  let D6 = floor(random(10, 18))*2; let d6 = floor(random(6, 12))*2;
  questoes.push({ texto: `Um LOSANGO possui diagonal maior ${D6} m\ne menor ${d6} m. Qual a sua área?`, resposta: (D6 * d6)/2, dica: "Fórmula: (Diagonal Maior × Diagonal Menor) ÷ 2", tipo: 'losango', rotulos: ['D=' + D6, 'd=' + d6] });

  let B7 = floor(random(15, 25)); let b7 = floor(random(5, 12)); let h7 = floor(random(4, 10))*2;
  questoes.push({ texto: `Qual a área de um TRAPÉZIO com base maior ${B7} cm,\nbase menor ${b7} cm e altura ${h7} cm?`, resposta: ((B7 + b7)*h7)/2, dica: "Fórmula: ((Base Maior + Base Menor) × Altura) ÷ 2", tipo: 'trapezio', rotulos: [B7, b7, h7] });

  let b8 = floor(random(15, 25)); let h8 = floor(random(10, 20));
  questoes.push({ texto: `Qual é a área de um PARALELOGRAMO\ncom base de ${b8} m e altura de ${h8} m?`, resposta: b8 * h8, dica: "Fórmula: Base × Altura", tipo: 'paralelogramo', rotulos: [b8 + ' m', h8 + ' m'] });

  // -- NÍVEL 3 (Questões 9 a 12 - Aplicação) --
  let larg9 = floor(random(3, 5)); let alt9 = floor(random(2, 4)); let lAz9 = 50;
  questoes.push({ texto: `Uma parede tem ${larg9}m por ${alt9}m. Quantos azulejos\nquadrados de ${lAz9}cm de lado são necessários?`, resposta: ((larg9*100)*(alt9*100))/(lAz9*lAz9), dica: "Transforme a parede para cm, ache a área e divida pela área de 1 azulejo.", tipo: 'aplicacao', rotulos: [`${larg9}m x ${alt9}m`, `${lAz9}cm`] });

  let comp10 = floor(random(4, 7)); let larg10 = floor(random(3, 5)); let bCer10 = 50; let hCer10 = 20;
  questoes.push({ texto: `Um piso mede ${comp10}m x ${larg10}m. Quantas cerâmicas\nretangulares (${bCer10}cm x ${hCer10}cm) o cobrirão?`, resposta: ((comp10*100)*(larg10*100))/(bCer10*hCer10), dica: "Converta o piso para cm, calcule a área e divida pela área da cerâmica.", tipo: 'aplicacao', rotulos: [`${comp10}m x ${larg10}m`, `${bCer10}x${hCer10}cm`] });

  let comp11 = floor(random(2, 4)); let larg11 = floor(random(2, 3)); let bTri11 = 40; let hTri11 = 20;
  questoes.push({ texto: `Um painel de ${comp11}m x ${larg11}m receberá pastilhas\ntriangulares (base ${bTri11}cm, alt ${hTri11}cm). Quantas serão?`, resposta: ((comp11*100)*(larg11*100))/((bTri11*hTri11)/2), dica: "Converta o painel para cm. Divida a área dele pela área da pastilha (triângulo).", tipo: 'aplicacao', rotulos: [`${comp11}m x ${larg11}m`, `Triâng.`] });

  let larg12 = floor(random(5, 7)); let alt12 = floor(random(3, 5)); let lAz12 = 25;
  questoes.push({ texto: `Uma parede enorme de ${larg12}m x ${alt12}m. Quantos\nazulejos pequenos (${lAz12}cm de lado) cobrem ela?`, resposta: ((larg12*100)*(alt12*100))/(lAz12*lAz12), dica: "Converta tudo para cm, ache a área total e divida pela área do azulejinho.", tipo: 'aplicacao', rotulos: [`${larg12}m x ${alt12}m`, `${lAz12}cm`] });
}
