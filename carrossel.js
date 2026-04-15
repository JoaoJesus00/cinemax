const galeria = document.querySelector('.galeria');
const AUTO_DURATION_SECONDS = 20;
const DRAG_THRESHOLD = 8;

if (!galeria) {
  throw new Error('Elemento .galeria não encontrado.');
}

if (!galeria.dataset.cloned) {
  galeria.innerHTML += galeria.innerHTML;
  galeria.dataset.cloned = 'true';
}

let isDragging = false;
let startX = 0;
let startTranslate = 0;
let currentTranslate = 0;
let movedDuringDrag = false;
let suppressNextClick = false;

function totalTravel() {
  return galeria.offsetWidth / 2;
}

function minTranslate() {
  return -totalTravel();
}

function normalizeTranslate(value) {
  const min = minTranslate();
  if (min === 0) return 0;

  let v = value;
  while (v < min) v -= min;
  while (v > 0) v += min;
  return v;
}

function currentAnimatedTranslate() {
  const transform = window.getComputedStyle(galeria).transform;
  if (!transform || transform === 'none') return 0;
  return new DOMMatrixReadOnly(transform).m41;
}

function applyTranslate(value) {
  currentTranslate = normalizeTranslate(value);
  galeria.style.transform = `translateX(${currentTranslate}px)`;
}

function pauseAuto() {
  const x = currentAnimatedTranslate();
  galeria.style.animation = 'none';
  galeria.style.animationDelay = '0s';
  galeria.style.transition = 'none';
  applyTranslate(x);
}

function resumeAuto() {
  const total = totalTravel();
  if (total === 0) return;

  currentTranslate = normalizeTranslate(currentTranslate);
  const progress = Math.abs(currentTranslate) / total;

  galeria.style.transform = '';
  galeria.style.transition = 'none';
  galeria.style.animation = `rolar ${AUTO_DURATION_SECONDS}s linear infinite`;
  galeria.style.animationDelay = `-${(progress * AUTO_DURATION_SECONDS).toFixed(3)}s`;
}

galeria.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  isDragging = true;
  movedDuringDrag = false;
  startX = e.clientX;
  pauseAuto();
  startTranslate = currentTranslate;
  galeria.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const diff = e.clientX - startX;
  if (Math.abs(diff) > DRAG_THRESHOLD) movedDuringDrag = true;
  applyTranslate(startTranslate + diff);
  e.preventDefault();
});

document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  suppressNextClick = movedDuringDrag;
  galeria.style.cursor = 'grab';
  resumeAuto();
});

galeria.addEventListener(
  'click',
  (e) => {
    if (suppressNextClick) {
      e.preventDefault();
      e.stopPropagation();
      suppressNextClick = false;
    }
  },
  true
);

galeria.addEventListener('dragstart', (e) => e.preventDefault());
galeria.querySelectorAll('img, a').forEach((el) => {
  el.setAttribute('draggable', 'false');
});

galeria.style.cursor = 'grab';
galeria.style.userSelect = 'none';
resumeAuto();
