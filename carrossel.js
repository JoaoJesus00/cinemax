// pega a galeria e define ajustes basicos do carrossel
const galeria = document.querySelector('.galeria'); // busca o bloco da galeria no html
const AUTO_DURATION_SECONDS = 20; // define o tempo da animacao automatica
const DRAG_THRESHOLD = 8; // minimo de pixels para contar como arrasto real

// se nao achar a galeria no html, para o script
if (!galeria) { // confere se a galeria existe mesmo
  throw new Error('Elemento .galeria não encontrado.'); // mostra erro para facilitar o debug
} // fim da validacao da galeria

// duplica os cards uma vez para criar efeito infinito sem fim visivel
if (!galeria.dataset.cloned) { // evita duplicar tudo duas vezes
  galeria.innerHTML += galeria.innerHTML; // copia os cards para continuar o loop
  galeria.dataset.cloned = 'true'; // marca que a duplicacao ja foi feita
} // fim da duplicacao inicial

// estados usados no arrasto com mouse
let isDragging = false; // diz se o usuario esta arrastando agora
let startX = 0; // guarda o x inicial do mouse
let startTranslate = 0; // guarda o translate do inicio do arrasto
let currentTranslate = 0; // guarda o translate atual da galeria
let movedDuringDrag = false; // marca se moveu o suficiente para ser arrasto
let suppressNextClick = false; // bloqueia clique acidental depois do arrasto

// calcula quanto o carrossel anda em um ciclo completo
function totalTravel() { // funcao que devolve o tamanho de um ciclo
  return galeria.offsetWidth / 2; // metade da largura porque o conteudo foi duplicado
} // fim da funcao totalTravel

// limite minimo de deslocamento no eixo x
function minTranslate() { // calcula o menor valor de x permitido
  return -totalTravel(); // negativo porque o movimento principal vai para a esquerda
} // fim da funcao minTranslate

// mantem o valor de translate dentro do loop para nao quebrar o efeito infinito
function normalizeTranslate(value) { // recebe um valor e ajusta para ficar no ciclo
  const min = minTranslate(); // pega o limite minimo atual
  if (min === 0) return 0; // evita conta ruim quando largura ainda nao existe

  let v = value; // cria variavel local para ir ajustando
  while (v < min) v -= min; // se passou do limite esquerdo, reposiciona no ciclo
  while (v > 0) v += min; // se passou para a direita, volta para a faixa negativa
  return v; // devolve o valor normalizado
} // fim da funcao normalizeTranslate

// le a posicao x atual quando a animacao css esta rodando
function currentAnimatedTranslate() { // pega o x atual do transform aplicado no css
  const transform = window.getComputedStyle(galeria).transform; // le o transform renderizado
  if (!transform || transform === 'none') return 0; // se nao tiver transform, considera zero
  return new DOMMatrixReadOnly(transform).m41; // extrai so o deslocamento no eixo x
} // fim da funcao currentAnimatedTranslate

// aplica um translate manual na galeria
function applyTranslate(value) { // aplica posicao manual para acompanhar o mouse
  currentTranslate = normalizeTranslate(value); // primeiro normaliza para manter o loop
  galeria.style.transform = `translateX(${currentTranslate}px)`; // depois move visualmente
} // fim da funcao applyTranslate

// pausa a animacao automatica no ponto exato
function pauseAuto() { // usada quando o usuario começa a arrastar
  const x = currentAnimatedTranslate(); // pega o ponto atual da animacao
  galeria.style.animation = 'none'; // desliga animacao css
  galeria.style.animationDelay = '0s'; // limpa o delay
  galeria.style.transition = 'none'; // evita transicao extra no arrasto
  applyTranslate(x); // fixa no mesmo ponto que estava antes de pausar
} // fim da funcao pauseAuto

// volta a animacao automatica sem pular para outro ponto
function resumeAuto() { // usada quando termina o arrasto
  const total = totalTravel(); // pega distancia total de um ciclo
  if (total === 0) return; // se nao der para calcular, sai sem fazer nada

  currentTranslate = normalizeTranslate(currentTranslate); // garante x atual dentro do ciclo
  const progress = Math.abs(currentTranslate) / total; // calcula progresso atual da animacao

  galeria.style.transform = ''; // limpa o transform manual para voltar ao css
  galeria.style.transition = 'none'; // garante sem transicao extra
  galeria.style.animation = `rolar ${AUTO_DURATION_SECONDS}s linear infinite`; // religa animacao
  galeria.style.animationDelay = `-${(progress * AUTO_DURATION_SECONDS).toFixed(3)}s`; // continua do mesmo ponto
} // fim da funcao resumeAuto

// comecou a segurar o mouse na galeria
galeria.addEventListener('mousedown', (e) => { // evento ao pressionar o mouse
  if (e.button !== 0) return; // aceita so botao esquerdo
  isDragging = true; // ativa estado de arrasto
  movedDuringDrag = false; // reseta marcador de movimento
  startX = e.clientX; // guarda posicao inicial do mouse
  pauseAuto(); // pausa animacao automatica
  startTranslate = currentTranslate; // guarda posicao inicial da galeria
  galeria.style.cursor = 'grabbing'; // mostra cursor de arrastando
}); // fim do mousedown

// enquanto move o mouse, arrasta a galeria junto
document.addEventListener('mousemove', (e) => { // evento de mover mouse na pagina
  if (!isDragging) return; // so executa se estiver arrastando
  const diff = e.clientX - startX; // calcula distancia movida no eixo x
  if (Math.abs(diff) > DRAG_THRESHOLD) movedDuringDrag = true; // marca como arrasto de verdade
  applyTranslate(startTranslate + diff); // move a galeria com base no deslocamento
  e.preventDefault(); // evita selecionar texto sem querer
}); // fim do mousemove

// soltou o mouse, para o arrasto e volta animacao automatica
document.addEventListener('mouseup', () => { // evento de soltar o mouse
  if (!isDragging) return; // so executa se havia arrasto ativo
  isDragging = false; // desativa estado de arrasto
  suppressNextClick = movedDuringDrag; // bloqueia clique acidental apos arrastar
  galeria.style.cursor = 'grab'; // volta cursor normal de arrasto
  resumeAuto(); // retoma a animacao automatica
}); // fim do mouseup

// evita abrir link sem querer logo depois de arrastar
galeria.addEventListener( // adiciona listener de clique na galeria
  'click', // tipo do evento escutado
  (e) => { // callback que roda no clique
    if (suppressNextClick) { // so entra se veio de um arrasto
      e.preventDefault(); // cancela acao padrao do clique
      e.stopPropagation(); // impede propagacao para outros listeners
      suppressNextClick = false; // libera cliques seguintes
    } // fim da verificacao de clique acidental
  }, // fim da funcao de clique
  true // usa captura para interceptar antes
); // fim do addEventListener de clique

// desliga o drag padrao do navegador em imagens e links
galeria.addEventListener('dragstart', (e) => e.preventDefault()); // impede drag nativo
galeria.querySelectorAll('img, a').forEach((el) => { // passa por imagens e links da galeria
  el.setAttribute('draggable', 'false'); // desativa draggable nesses elementos
}); // fim do forEach

// estado visual inicial e inicio da animacao
galeria.style.cursor = 'grab'; // cursor inicial de arrastar
galeria.style.userSelect = 'none'; // evita selecao de texto ao arrastar
resumeAuto(); // inicia a animacao automatica ao carregar
