/**
 * PROHLÍŽEČOVÁ VRSTVA: vstup, pevná herní smyčka, Canvas, zvuk, HUD, lokální rekord.
 * Script není ES module: funguje i přes file://; engine/atlas/animation se načítají před ním.
 * Žádný backend není připojen. Místa AI_HANDOFF_SCORE_* níže jsou integrační orientační body.
 * Viz README.md na GRAFIT; původní balík v10.1 obsahuje i SCORE_API.md a ukázkový klient.
 * DŮLEŽITÉ: g.score = body; best/g.bestX = vzdálenost. Nezaměnit je v databázi.
 */
/* Original environment canvas art and audio; generated Naruto atlas animation. */
'use strict';
const $ = id => document.getElementById(id),
  canvas = $('game'),
  ctx = canvas.getContext('2d', {
    alpha: false
  }),
  g = new NinjaGame();
let W = 960,
  H = 480,
  cam = 0,
  camY = 0,
  lookAhead = 0,
  last = 0,
  acc = 0,
  visual = 0,
  shake = 0,
  freeze = 0,
  flash = 0,
  muted = true,
  audio = null,
  fx = !matchMedia('(prefers-reduced-motion: reduce)').matches,
  best = 0,
  particles = [],
  ghosts = [],
  texts = [],
  lastState = 'ready',
  lastStep = 0,
  rings = [],
  squash = 0,
  stretch = 0,
  warning = 0,
  ghostClock = 0;
// Rekordy v11 se nesměšují s dřívějším farmitelným skóre. Síť není potřeba.
let records={score:0,time:null},tutorialEnabled=true,tutorialStep=-1;
const recordKey='konoha-records-v11';
try {
  const saved=JSON.parse(localStorage.getItem(recordKey)||'null');
  if(saved&&Number.isFinite(saved.score)&&saved.score>=0) records.score=saved.score;
  if(saved&&Number.isFinite(saved.time)&&saved.time>0) records.time=saved.time;
  tutorialEnabled=localStorage.getItem('konoha-tutorial-v11')!=='done';
} catch {} // Zakázané či poškozené localStorage nesmí zabránit hraní.
function formatTime(seconds) {
  const tenths=Math.floor(Math.max(0,seconds)*10+1e-7);
  return Math.floor(tenths/600)+':'+String(Math.floor(tenths/10)%60).padStart(2,'0')+'.'+tenths%10;
}
const medalNames={gold:'ZLATÁ MEDAILE',silver:'STŘÍBRNÁ MEDAILE',bronze:'BRONZOVÁ MEDAILE',finish:'TRÉNINK DOKONČEN'};
function saveResult() {
  records.score=Math.max(records.score,g.score);
  if(g.state==='won') records.time=records.time===null?g.resultTime:Math.min(records.time,g.resultTime);
  try { localStorage.setItem(recordKey,JSON.stringify(records)); } catch {}
}
// Lokální klíč konoha-best ukládá nejlepší VZDÁLENOST V METRECH, nikoli body ani identitu hráče.
try {
  best = Number(localStorage.getItem('konoha-best') || 0);
} catch {}
$('best').textContent = String(best).padStart(4, '0');
$('fx').checked = fx;
// Obrázky jsou relativní k dist/index.html. Žádné vzdálené sprite URL ani načítání přes fetch.
const spriteImage = typeof Image === 'undefined' ? null : new Image();
if (spriteImage) spriteImage.src = 'assets/naruto-actions-v9.png';
const animator = typeof NinjaAnimator === 'undefined' ? null : new NinjaAnimator(globalThis.NINJA_ATLAS,
  spriteImage);
// input = držené pohyby; held = fyzické klávesy; pointerActions = souběžné dotykové prsty.
const input = {
    left: false,
    right: false,
    slide: false
  },
  held = new Set(),
  pointerActions = new Map();
// Responzivní viewport mění velikost canvasu, nikoli světovou geometrii. Resize resetuje Canvas state.
function size() {
  const r = $('stage').getBoundingClientRect();
  W = Math.round(Math.max(480, Math.min(1100, r.width)));
  H = Math.round(W * r.height / r.width);
  canvas.width = W;
  canvas.height = H;
  ctx.imageSmoothingEnabled = false;
}
new ResizeObserver(size).observe($('stage'));
// Zvuk je syntetický Web Audio, bez zvukových souborů. Zapíná se uživatelským gestem.
function tone(freq, duration = .1, type = 'square', volume = .035, end = freq) {
  if (muted) return;
  try {
    audio ??= new(window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    const o = audio.createOscillator(),
      v = audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, audio.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, end), audio.currentTime + duration);
    v.gain.setValueAtTime(volume, audio.currentTime);
    v.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
    o.connect(v);
    v.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + duration);
  } catch {}
}
// Náhodné částice jsou jen dekorace; nepřimíchávat Math.random() do deterministické fyziky.
function burst(x, y, color, n = 12, power = 130) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2,
      sp = Math.random() * power;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 40,
      life: .3 + Math.random() * .4,
      max: .7,
      color,
      size: 2 + Math.random() * 4
    });
  }
}

function ring(x, y, color = '#8af2f1', radius = 35) {
  rings.push({
    x,
    y,
    color,
    radius,
    life: .32
  });
}

function label(text, x, y, color = '#8af2f1') {
  texts.push({
    text,
    x,
    y,
    life: .85,
    color
  });
}
const names = {
  jump: 'SKOK',
  double: 'DVOJSKOK',
  dash: 'CHAKRA DASH',
  wall: 'WALL JUMP',
  slide: 'SKLUZ',
  deflect: 'ODRAŽENO!'
};
/** AI_HANDOFF_SCORE_END: zde se právě jednou zpracovává fronta g.events.
 * Pro integraci reagovat pouze na e.type === 'won' || e.type === 'dead'.
 * Okamžitě vytvořit neměnný snapshot (body už obsahují bonus), pak poslat asynchronně.
 * Nedržet živou referenci na g při await: další START ji resetuje.
 * Události hit/checkpoint/land nejsou konec pokusu. Fronta se na konci vyprázdní.
 * Příklad zapojení a idempotence jsou v SCORE_API.md; samotné komentáře nic neodesílají. */
function events() {
  for (const e of g.events) {
    animator?.trigger(e.type);
    if (names[e.type]) {
      label(names[e.type], e.x, e.y - 35);
      burst(e.x, e.y, e.type === 'dash' ? '#8bf4ff' : '#f4c985', e.type === 'dash' ? 42 : 18);
      tone(e.type === 'dash' ? 160 : 410, .13, 'square', .025, e.type === 'dash' ? 650 : 850);
      if (e.type === 'dash') {
        shake = fx ? 6 : 0;
        ring(e.x, e.y, '#96faff', 55);
        tone(80, .17, 'sawtooth', .018, 240);
      }
      if (['jump', 'double', 'wall'].includes(e.type)) {
        stretch = .16;
        ring(e.x, e.y + 20, e.type === 'double' ? '#89efff' : '#ffcb85', e.type === 'double' ? 38 : 25);
      }
      $('combo').textContent = names[e.type];
    }
    if (e.type === 'prepare') {
      burst(e.x, e.y, '#ffd19a', 5, 35);
      tone(120, .07, 'triangle', .018, 190);
    }
    if (e.type === 'skid') {
      burst(e.x, e.y, '#ffe0a3', 14, 120);
      for (const p of particles.slice(-14)) p.vx -= g.p.face * 90;
      tone(85, .09, 'sawtooth', .015, 45);
    }
    if (e.type === 'land') {
      squash = .14;
      ring(e.x, e.y + 18, '#c5ded1', 30);
      burst(e.x, e.y + 18, '#c5cfc5', 18, 110);
      shake = fx ? 3 : 0;
      tone(90, .06, 'triangle', .04, 40);
    }
    if (e.type === 'orb') {
      burst(e.x, e.y, '#97f2de', 6, 60);
      tone(900, .07, 'sine', .025, 1400);
    }
    if (e.type === 'near') {
      label('TĚSNĚ!', e.x, e.y - 35, '#ffc985');
      tone(650, .09, 'triangle', .02, 1000);
    }
    if (e.type === 'deflect') {
      ring(e.x, e.y, '#e3ffff', 85);
      burst(e.x, e.y, '#e2ffff', 30, 290);
      shake = fx ? 8 : 0;
      freeze = .055;
      flash = fx ? .12 : 0;
      tone(1400, .18, 'triangle', .04, 280);
    }
    if (e.type === 'warning') {
      // Indikátor je trvale odvozený od skutečné střely; zde pouze zvuk.
      tone(280, .06, 'triangle', .015, 420);
    }
    if (e.type === 'hit') {
      burst(e.x, e.y, '#ff8a66', 35, 230);
      shake = fx ? 10 : 0;
      freeze = .09;
      flash = fx ? .25 : 0;
      tone(130, .3, 'sawtooth', .045, 35);
      label('ZÁSAH / +5 s', e.x, e.y - 40, '#ff886b');
      resetCamera();
    }
    if (e.type === 'checkpoint') {
      label('CHECKPOINT ✓', e.x, e.y - 55);
      tone(600, .2, 'sine', .035, 1200);
    }
    if(e.type==='score') label('+'+e.points,e.x,e.y-52,'#ffe5a0');
    if(e.type==='scroll') { ring(e.x,e.y,'#ffd486',65); tone(1000,.25,'sine',.03,1600); }
    if(e.type==='won'||e.type==='dead') saveResult();
    if (e.type === 'won') {
      burst(e.x, e.y, '#ffca77', 70, 300);
      tone(520, .5, 'triangle', .05, 1040);
    }
  }
  g.events.length = 0;
}
/** AI_HANDOFF_SCORE_START: jediný společný začátek pokusu pro tlačítko, klávesu i touch.
 * Nový runId/nonce vytvořit tady, společně s g.reset(). Při pause/resume jej neměnit.
 * Stará asynchronní odpověď musí aktualizovat jen záznam svého runId, ne nového pokusu. */
function start() {
  g.reset();
  animator?.reset();
  particles = [];
  ghosts = [];
  texts = [];
  rings = [];
  squash = stretch = warning = ghostClock = lastStep = 0;
  resetCamera();
  acc = 0;
  tutorialStep = -1;
  lastState = 'playing';
  freeze = 0;
  held.clear();
  clearInput();
  $('overlay').hidden = true;
  $('status').textContent = 'TRÉNINK PROBÍHÁ';
  canvas.focus();
  tone(400, .18, 'triangle', .04, 800);
  updateHud();
  syncOverlay();
}
// Ztráta fokusu nesmí nechat aktivní pohyb ani vyvolat skok na následném keyup.
function clearInput() {
  g.cancelJump();
  input.left = input.right = input.slide = false;
  pointerActions.clear();
  document.querySelectorAll('.held').forEach(b => b.classList.remove('held'));
}
// Pauza zastaví fyziku; cancelJump ruší přípravu i buffer. Resume není nový pokus.
function pause() {
  if (g.state === 'playing') {
    g.state = 'paused';
    clearInput();
    held.clear();
  } else if (g.state === 'paused') {
    g.state = 'playing';
    canvas.focus();
  }
  syncOverlay();
}
// Pouze prezentace a lokální vzdálenost. Nepoužívat jako jednorázový síťový submit:
// tato funkce může být zavolána opakovaně. Submit navázat na events() a runId.
function syncOverlay() {
  if (g.state === 'playing') {
    $('overlay').hidden = true;
    $('status').textContent = 'TRÉNINK PROBÍHÁ';
    $('pause').textContent = 'Ⅱ';
    $('pause').setAttribute('aria-label', 'Pozastavit hru');
    return;
  }
  if (g.state === 'ready') return;
  const won = g.state === 'won',
    paused = g.state === 'paused';
  $('overlay').hidden = false;
  $('badge').textContent = paused ? 'ODDECH NA STŘEŠE' : won ? medalNames[g.medal()] :
    'KAŽDÝ HOKAGE NĚKDY SPADL';
  $('badge').dataset.medal=won?g.medal():'';
  $('overlayTitle').innerHTML = paused ? 'CHVÍLE NA<br><em>RAMEN.</em>' : won ?
    'TRÉNINK<br><em>SPLNĚN!</em>' : 'JEŠTĚ JEDEN<br><em>POKUS.</em>';
  $('overlayText').textContent = paused ? 'Nadechni se. Tvůj běh tu počká.' :
    `${g.score} bodů · čas ${formatTime(g.resultTime)} (penalizace +${g.penalty} s) · svitek ${g.scroll.taken?'1/1':'0/1'}`;
  $('overlayHint').textContent = paused ? 'P nebo Escape pro pokračování' : won ?
    `${medalNames[g.medal()]} · osobní čas ${formatTime(records.time??g.resultTime)}` : 'Tip: dash odrazí shuriken a obnoví vzdušný skok.';
  $('overlayHint').dataset.medal=won?g.medal():'';
  $('start').innerHTML = paused ? 'POKRAČOVAT <span>↗</span>' : 'ZNOVU VYBĚHNOUT <span>↗</span>';
  $('status').textContent = paused ? 'PAUZA' : won ? 'TRÉNINK SPLNĚN' : 'KONEC POKUSU';
  $('pause').textContent = '▶';
  $('pause').setAttribute('aria-label', 'Pokračovat ve hře');
  if (!paused) {
    best = Math.max(best, Math.floor(g.bestX / 10));
    try {
      localStorage.setItem('konoha-best', best);
    } catch {}
    $('best').textContent = String(best).padStart(4, '0');
  }
}
$('start').onclick = () => g.state === 'paused' ? pause() : start();
$('pause').onclick = pause;
$('sound').onclick = () => {
  muted = !muted;
  $('sound').textContent = muted ? 'ZVUK OFF' : 'ZVUK ON';
  $('sound').setAttribute('aria-pressed', String(!muted));
  tone(650, .12, 'sine');
};
$('fx').onchange = () => fx = $('fx').checked;
// První akce z ready/dead/won může spustit hru. Stisk skoku přitom zachová přípravu na keyup.
function action(name) {
  if (g.state === 'ready' || g.state === 'dead' || g.state === 'won') {
    start();
    if (name !== 'jump') return;
  }
  if (name === 'jump') g.pressJump();
  if (name === 'dash') g.dash();
}
// Všechny klávesové aliasy sdílejí logiku engine.pressJump/releaseJump.
const keyAction = {
  Space: 'jump',
  KeyW: 'jump',
  ArrowUp: 'jump',
  ShiftLeft: 'dash',
  ShiftRight: 'dash',
  KeyX: 'dash',
  KeyS: 'slide',
  ArrowDown: 'slide',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right'
};
// Key repeat ignorujeme: dlouhé držení skoku nesmí znovu provádět dvojskok.
document.addEventListener('keydown', e => {
  if (e.target instanceof HTMLInputElement || e.target.tagName === 'SUMMARY') return;
  if (e.code === 'Tab') return;
  const a = keyAction[e.code];
  if (a || ['KeyP', 'Escape', 'KeyR', 'KeyF'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  held.add(e.code);
  if (a === 'left' || a === 'right' || a === 'slide') input[a] = true;
  else if (a) {
    action(a);
    held.add(e.code);
  }
  if (e.code === 'KeyP' || e.code === 'Escape') pause();
  if (e.code === 'KeyR') start();
  if (e.code === 'KeyF') {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.querySelector('.arcade').requestFullscreen?.().catch(() => {});
  }
});
document.addEventListener('keyup', e => {
  const armed = held.has(e.code);
  held.delete(e.code);
  const a = keyAction[e.code];
  if (a === 'jump' && armed) g.releaseJump();
  if (a in input) input[a] = [...held].some(k => keyAction[k] === a) || [...pointerActions.values()]
    .includes(a);
});
// Vícedotyk: pohybové tlačítko zůstává aktivní, pokud jej drží jiný prst nebo klávesa.
document.querySelectorAll('[data-action]').forEach(b => {
  b.addEventListener('pointerdown', e => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    const a = b.dataset.action;
    if (g.state !== 'playing' && g.state !== 'paused') start();
    pointerActions.set(e.pointerId, a);
    b.classList.add('held');
    if (a in input) input[a] = true;
    else action(a);
  });
  const release = e => {
    const a = pointerActions.get(e.pointerId);
    pointerActions.delete(e.pointerId);
    b.classList.remove('held');
    if (a === 'jump') {
      if (e.type === 'pointerup') g.releaseJump();
      else g.cancelJump();
    }
    if (a in input) input[a] = [...pointerActions.values()].includes(a) || [...held].some(k =>
      keyAction[k] === a);
  };
  b.addEventListener('pointerup', release);
  b.addEventListener('pointercancel', release);
  b.addEventListener('lostpointercapture', release);
});
window.addEventListener('blur', () => {
  clearInput();
  held.clear();
  if (g.state === 'playing') pause();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && g.state === 'playing') pause();
});

function rect(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h));
}

function poly(points, c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  ctx.closePath();
  ctx.fill();
}

function text(s, x, y, size = 10, c = '#c8dedc', align = 'left') {
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = align;
  ctx.fillStyle = c;
  ctx.fillText(s, Math.round(x), Math.round(y));
}
// Four carved portraits: a pixel-art interpretation of the early-era Hokage monument.
function hokageFace(x, y, kind) {
  ctx.save();
  ctx.translate(x, y);
  const shadow = '#83654f',
    mid = '#b08c68',
    stone = '#d2ac7d',
    light = '#e8c494';
  poly([
    [-31, 17],
    [-27, -18],
    [-18, -34],
    [19, -34],
    [30, -15],
    [29, 26],
    [17, 49],
    [-16, 48]
  ], shadow);
  poly([
    [-24, -15],
    [-16, -28],
    [17, -28],
    [25, -9],
    [20, 26],
    [11, 39],
    [-11, 38],
    [-23, 24]
  ], stone);
  poly([
    [6, -25],
    [24, -12],
    [20, 27],
    [10, 38],
    [4, 20],
    [12, 8]
  ], mid);
  // Raised brow, deep eye sockets, angled nose and cut mouth.
  rect(-20, -4, 14, 4, shadow);
  rect(7, -4, 14, 4, shadow);
  rect(-18, 1, 10, 3, '#765b49');
  rect(8, 1, 10, 3, '#765b49');
  rect(-15, 1, 5, 1, light);
  rect(9, 1, 5, 1, light);
  poly([
    [-2, -2],
    [-7, 17],
    [0, 20],
    [8, 15],
    [4, 13],
    [2, -2]
  ], mid);
  rect(-5, 17, 10, 3, shadow);
  rect(-10, 27, 19, 3, shadow);
  rect(-7, 31, 13, 2, light);
  rect(-17, 10, 3, 11, mid);
  if (kind === 0) { // Hashirama: long straight hair and broad forehead protector.
    poly([
      [-30, -18],
      [-22, -41],
      [20, -41],
      [30, -18],
      [30, 45],
      [19, 39],
      [24, -19]
    ], shadow);
    rect(-30, -21, 9, 64, shadow);
    rect(-27, -14, 3, 50, mid);
    rect(23, -20, 9, 62, shadow);
    rect(26, -10, 2, 40, mid);
    rect(-23, -23, 47, 12, light);
    rect(-21, -12, 43, 3, shadow);
    rect(-7, -20, 14, 7, mid);
    rect(-2, -19, 5, 4, shadow);
  } else if (kind === 1) { // Tobirama: pointed hair, head protector and cheek markings.
    poly([
      [-29, -15],
      [-35, -30],
      [-22, -27],
      [-24, -42],
      [-11, -35],
      [-4, -49],
      [4, -36],
      [17, -46],
      [19, -32],
      [31, -36],
      [26, -19]
    ], light);
    rect(-25, -23, 50, 12, mid);
    rect(-17, -22, 35, 9, light);
    rect(-4, -20, 9, 5, shadow);
    rect(-18, 7, 3, 14, shadow);
    rect(15, 7, 3, 14, shadow);
    rect(-2, 30, 3, 9, shadow);
    poly([
      [-25, 33],
      [-38, 48],
      [-29, 46],
      [-34, 59],
      [-14, 48],
      [0, 54],
      [17, 48],
      [32, 58],
      [28, 44],
      [37, 45],
      [25, 31],
      [15, 43],
      [-14, 43]
    ], light);
  } else if (kind === 2) { // Hiruzen: older features and a close-fitting ninja headpiece.
    poly([
      [-27, -18],
      [-24, -34],
      [-10, -41],
      [15, -40],
      [28, -29],
      [31, -15]
    ], mid);
    rect(-24, -20, 51, 10, light);
    rect(-7, -18, 15, 6, mid);
    rect(-1, -17, 5, 3, shadow);
    rect(-23, 5, 12, 2, mid);
    rect(12, 6, 11, 2, shadow);
    rect(-21, 12, 8, 2, shadow);
    rect(14, 13, 8, 2, shadow);
    rect(-14, 22, 5, 2, shadow);
    rect(10, 22, 5, 2, shadow);
    rect(-6, 34, 12, 3, mid);
    rect(-3, 36, 7, 8, shadow);
  } else { // Minato: broad spiky hair silhouette framing the face.
    poly([
      [-29, -3],
      [-39, -20],
      [-26, -19],
      [-35, -35],
      [-17, -29],
      [-18, -49],
      [-4, -36],
      [6, -54],
      [13, -35],
      [28, -47],
      [27, -29],
      [42, -28],
      [30, -14],
      [36, 2],
      [22, -5],
      [17, -22],
      [7, -16],
      [-1, -28],
      [-12, -15],
      [-22, -18]
    ], light);
    poly([
      [-26, -17],
      [-34, 7],
      [-24, 23],
      [-20, 10],
      [-17, -6]
    ], mid);
    poly([
      [24, -11],
      [33, 7],
      [25, 24],
      [19, 9]
    ], mid);
    rect(-14, -13, 31, 5, mid);
  }
  // Chisel facets and neck relief merge the portrait back into the cliff.
  poly([
    [-13, 39],
    [-13, 48],
    [-31, 60],
    [32, 60],
    [13, 46],
    [12, 38],
    [2, 44]
  ], mid);
  rect(-18, -7, 6, 1, light);
  rect(12, 22, 5, 2, light);
  rect(-7, 46, 16, 3, shadow);
  ctx.restore();
}

function monument() {
  const scale = Math.min(1.15, W / 720),
    x = W * .62 - Math.min(55, cam * .009),
    y = H * .24;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  poly([
    [-340, 250],
    [-326, 120],
    [-286, 119],
    [-267, 29],
    [-222, 28],
    [-202, -25],
    [-151, -33],
    [-126, -54],
    [-79, -43],
    [-40, -59],
    [12, -48],
    [38, -64],
    [93, -43],
    [140, -51],
    [179, -21],
    [221, -15],
    [244, 36],
    [277, 53],
    [301, 136],
    [343, 157],
    [355, 270]
  ], '#b18b6d');
  poly([
    [-287, 120],
    [-264, 34],
    [-211, 34],
    [-183, -17],
    [-123, -42],
    [-79, -31],
    [-33, -47],
    [34, -40],
    [92, -31],
    [138, -38],
    [175, -9],
    [217, 1],
    [239, 52],
    [271, 66],
    [292, 158],
    [311, 241],
    [-300, 241]
  ], '#c9a078');
  poly([
    [-280, 128],
    [-212, 84],
    [-163, 115],
    [-109, 73],
    [-54, 109],
    [9, 70],
    [67, 107],
    [127, 80],
    [188, 112],
    [244, 83],
    [288, 154],
    [301, 230],
    [-285, 230]
  ], '#a67e5f');
  for (let i = 0; i < 18; i++) {
    let xx = -263 + i * 31;
    rect(xx, 102 + (i * 17) % 47, 2, 35 + (i * 13) % 47, '#926e55');
    rect(xx + 6, 157 + (i * 11) % 29, 22, 3, '#be956e');
  }
  [-135, -45, 45, 135].forEach((xx, i) => hokageFace(xx, 7 + (i % 2) * 5, i));
  poly([
    [-310, 214],
    [-270, 182],
    [-237, 198],
    [-193, 178],
    [-158, 202],
    [-115, 186],
    [-82, 214],
    [-20, 185],
    [29, 199],
    [84, 177],
    [123, 204],
    [174, 188],
    [217, 208],
    [264, 183],
    [314, 219],
    [337, 270],
    [-327, 270]
  ], '#677d55');
  ctx.restore();
}

function background() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#cda18e');
  sky.addColorStop(.55, '#efc38e');
  sky.addColorStop(1, '#f8ddb0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  const sx = W * .19 - cam * .008,
    sy = H * .18;
  rect(sx - 24, sy - 31, 48, 62, '#ffe3a8');
  rect(sx - 31, sy - 24, 62, 48, '#ffe3a8');
  for (let i = 0; i < 6; i++) {
    let x = ((i * 240 - cam * .035) % (W + 300) + W + 300) % (W + 300) - 150,
      y = 36 + i % 3 * 24;
    rect(x, y, 104, 7, '#f8dcaf');
    rect(x + 19, y - 7, 65, 7, '#f8dcaf');
    rect(x + 38, y - 12, 25, 5, '#f8dcaf');
  }
  monument();
  const base = H - 120;
  for (let layer = 0; layer < 3; layer++) {
    let step = layer === 2 ? 115 : 165,
      speed = [.12, .23, .43][layer];
    for (let i = -2; i < W / step + 3; i++) {
      let pos = Math.floor(cam * speed / step) + i,
        x = pos * step - cam * speed,
        h = 55 + ((pos * 73 + layer * 39) % 95 + 95) % 95,
        y = base - h + layer * 22,
        col = ['#bca782', '#b49b75', '#c9ad7d'][layer];
      rect(x, y, step - 9, H - y, col);
      rect(x + step - 22, y, 13, H - y, ['#a08c70', '#97876a', '#a48b66'][layer]);
      poly([
        [x - 10, y + 5],
        [x + 12, y - 8],
        [x + step / 2, y - 24],
        [x + step - 10, y - 5],
        [x + step + 4, y + 5]
      ], ['#b8815c', '#bc704b', '#cf7545'][layer]);
      rect(x - 10, y + 5, step + 15, 4, '#f1b26b');
      rect(x - 7, y + 9, step + 9, 4, '#785c49');
      for (let tx = 8; tx < step - 10; tx += 17) {
        rect(x + tx, y + 1, 12, 2, '#e49b5c');
        rect(x + tx + 5, y - 5, 9, 2, '#e0a46c');
      }
      for (let wx = 14; wx < step - 18; wx += 28)
        for (let wy = 20; wy < h - 12; wy += 30) {
          rect(x + wx, y + wy, 11, 15, '#686956');
          rect(x + wx + 2, y + wy + 2, 7, 10, '#c8cfac');
          rect(x + wx + 5, y + wy + 2, 1, 11, '#8d8c68');
        }
      if (layer === 2 && pos % 3 === 0) {
        rect(x + 29, y - 46, 38, 30, '#cfb98c');
        rect(x + 25, y - 48, 47, 5, '#ba673e');
        rect(x + 45, y - 57, 7, 9, '#b58b62');
      }
      if (layer === 2 && pos % 4 === 0) {
        rect(x + step - 25, y + 25, 16, 39, '#b65c40');
        text('木', x + step - 17, y + 45, 12, '#f7d49d', 'center');
      }
    }
  }
  const shift = cam * .5 % 300;
  for (let x = -shift; x < W + 300; x += 300) {
    rect(x, base - 90, 4, 170, '#6d6951');
    ctx.strokeStyle = '#756c50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, base - 75);
    ctx.quadraticCurveTo(x + 150, base - 30, x + 300, base - 75);
    ctx.stroke();
    rect(x + 142, base - 53, 2, 18, '#826846');
    rect(x + 136, base - 36, 14, 20, '#c36b45');
    rect(x + 139, base - 33, 8, 14, '#f8bb70');
  }
}

function roof(s) {
  let x = s.x - cam,
    y = s.y + (H - 480 + camY);
  if (x + s.w < 0 || x > W) return;
  if (s.type === 'roof') {
    rect(x, y + 12, s.w, s.h, '#b39469');
    rect(x, y + 17, s.w, 5, '#6a503d');
    for (let bx = Math.floor(Math.max(0, -x) / 40) * 40; bx < s.w && x + bx < W; bx += 40) {
      rect(x + bx, y + 33, 37, 1, '#967b56');
      rect(x + bx + 19, y + 34, 1, 24, '#967b56');
      rect(x + bx, y + 58, 40, 1, '#967b56');
      if (bx % 120 === 0) {
        rect(x + bx + 10, y + 85, 25, 42, '#675c43');
        rect(x + bx + 13, y + 88, 19, 35, '#dfc38c');
        rect(x + bx + 21, y + 88, 3, 36, '#8b714f');
      }
    }
    rect(x - 5, y, s.w + 10, 12, '#c86c38');
    rect(x - 5, y, s.w + 10, 3, '#ffd18a');
    for (let tx = 0; tx < s.w; tx += 24) {
      rect(x + tx, y + 4, 21, 2, '#ed9d52');
      rect(x + tx + 22, y + 3, 2, 8, '#974c32');
    }
    rect(x - 8, y + 11, s.w + 16, 5, '#703e2e');
  } else if (s.type === 'crate') {
    rect(x, y, s.w, s.h, '#503c31');
    rect(x + 3, y + 3, s.w - 6, s.h - 6, '#946a51');
    rect(x + 7, y + 7, s.w - 14, s.h - 14, '#5a4c45');
    rect(x + 3, y + 3, s.w - 6, 4, '#d29d67');
    poly([
      [x + 6, y + 10],
      [x + 11, y + 8],
      [x + s.w - 5, y + s.h - 10],
      [x + s.w - 11, y + s.h - 6]
    ], '#a67d5b');
    rect(x + 2, y + s.h - 7, s.w - 4, 4, '#c6976c');
  } else if (s.type === 'beam') {
    rect(x, y, s.w, s.h, '#21313c');
    rect(x, y, s.w, 5, '#bc8570');
    rect(x + 5, y + 6, s.w - 10, s.h - 12, '#745451');
    for (let row = 25; row < s.h - 12; row += 26) {
      rect(x + 6, y + row, s.w - 12, 2, '#a87d5d');
      rect(x + 6, y + row + 2, s.w - 12, 2, '#4e4039');
    }
    rect(x + 12, y + 7, 5, s.h - 20, '#b58e62');
    rect(x + s.w - 17, y + 7, 5, s.h - 20, '#b58e62');
    for (let i = 0; i < s.w; i += 22) {
      rect(x + i, y + s.h - 9, 11, 6, '#f4ad71');
      rect(x + i + 11, y + s.h - 9, 11, 6, '#3c4042');
    }
    text('低', x + s.w / 2, y + 39, 24, '#e2af85', 'center');
    rect(x + 8, y - 70, 4, 70, '#233841');
    rect(x + s.w - 12, y - 70, 4, 70, '#233841');
  } else if (s.type === 'wall') {
    rect(x, y, s.w, s.h, '#796c55');
    rect(x, y, 5, s.h, '#f2c78b');
    for (let j = 8; j < s.h; j += 19) {
      rect(x + 7, y + j, s.w - 10, 3, '#a4916e');
      rect(x + 15 + (j % 2) * 10, y + j + 3, 2, 16, '#5b5140');
    }
    rect(x - 4, y - 3, s.w + 8, 5, '#ecd6a8');
  } else {
    rect(x, y, s.w, s.h, '#947b59');
    rect(x, y, s.w, 3, '#efd5a0');
    rect(x + 10, y + s.h, 4, 18, '#695a43');
    rect(x + s.w - 14, y + s.h, 4, 18, '#695a43');
  }
}
// Původní ručně kreslený fallback; normálně se používá NinjaAnimator a generovaný atlas.
function ninja(x, y, phase, slide = false, dash = false, face = 1, alpha = 1, bodyScale = 1, lean = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(Math.round(x + 11), Math.round(y + 40));
  ctx.scale(face * (bodyScale < 1 ? 1 + (1 - bodyScale) * .55 : 1 / bodyScale), bodyScale);
  ctx.rotate(lean);
  let run = Math.sin(phase * 18),
    leg = Math.round(run * 6);
  if (slide) {
    ctx.translate(0, 1);
    ctx.rotate(-.65);
    ctx.scale(1.1, .7);
  } else if (dash) {
    ctx.rotate(.22);
    ctx.scale(1.12, .88);
  } else {
    ctx.translate(0, Math.abs(run) * -1);
  }
  // Headband ribbons, spiky blond hair, whiskers, orange jacket and sandals.
  poly([
    [-4, -33],
    [-19, -31],
    [-31, -37],
    [-20, -35],
    [-7, -37]
  ], '#142a40');
  poly([
    [-8, -32],
    [-24, -25],
    [-33, -28],
    [-21, -29]
  ], '#213f55');
  rect(-8, -18, 8, 12, '#ee793d');
  rect(1, -19, 8, 12, '#ff9d42');
  rect(-8, -8, 7, 8 + Math.max(0, leg), '#e77d38');
  rect(2, -8, 7, 8 + Math.max(0, -leg), '#ff9c44');
  rect(-10, -2 + Math.max(0, leg), 10, 5, '#163047');
  rect(2, -2 + Math.max(0, -leg), 11, 5, '#163047');
  rect(-8, -25, 17, 12, '#172c41');
  rect(-8, -20, 17, 9, '#f08a3d');
  rect(0, -22, 2, 11, '#fac68a');
  rect(-10, -26, 8, 7, '#eaa35e');
  rect(-6, -38, 16, 13, '#ffca8d');
  rect(8, -34, 4, 7, '#ffca8d');
  rect(6, -34, 3, 3, '#26405a');
  rect(7, -29, 4, 1, '#b2775d');
  rect(5, -27, 4, 1, '#b2775d');
  rect(-8, -40, 20, 5, '#172b41');
  rect(-2, -40, 11, 4, '#a8c8ca');
  rect(2, -39, 3, 2, '#39566b');
  rect(-9, -45, 20, 6, '#f7bf48');
  poly([
    [-10, -44],
    [-13, -50],
    [-6, -47],
    [-3, -53],
    [1, -48],
    [6, -52],
    [8, -47],
    [14, -49],
    [12, -42]
  ], '#ffdb67');
  poly([
    [-7, -23],
    [-16, -18],
    [-25, -23],
    [-27, -19],
    [-15, -12],
    [-4, -18]
  ], '#20374d');
  rect(-29, -23, 5, 5, '#f8bc86');
  if (dash) {
    rect(8, -23, 14, 5, '#ffb05d');
    rect(20, -24, 5, 7, '#f8cc8f');
  }
  ctx.restore();
}

function shuriken(s) {
  for (let i = 1; i <= 4; i++) {
    ctx.globalAlpha = (1 - i / 5) * .4;
    rect(s.x - cam + 8 + i * 9, s.y + (H - 480 + camY) + 6, 12 - i * 2, 3, '#acd9df');
  }
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.translate(s.x - cam + 8, s.y + (H - 480 + camY) + 8);
  ctx.rotate(s.spin);
  poly([
    [0, -13],
    [4, -4],
    [13, -2],
    [5, 3],
    [2, 13],
    [-3, 5],
    [-13, 1],
    [-4, -4]
  ], '#d3e4df');
  poly([
    [0, -13],
    [0, 0],
    [13, -2],
    [0, 0],
    [2, 13],
    [0, 0],
    [-13, 1],
    [0, 0]
  ], '#729ca9');
  rect(-2, -2, 4, 4, '#1c3442');
  ctx.restore();
}
/** Render může používat proměnný dt, ale nesmí posouvat simulační stav.
 * Světová X -> obrazovka: x-cam; světová Y -> obrazovka: y+(H-480).
 * Kamera jen sleduje hráče. Částice, rings, ghost trail a hitstop jsou vizuální efekty. */
function render(dt) {
  visual += dt;
  background();
  ctx.save();
  if (shake > 0 && fx) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
  const oy = (H - 480 + camY);
  for (const s of g.solids) roof(s);
  // Checkpoint flags.
  for (const c of g.checkpoints.slice(1)) {
    let x = c.x - cam,
      y = c.y + oy;
    if (x < -30 || x > W + 30) continue;
    rect(x, y - 70, 3, 70, '#b1b8a4');
    poly([
      [x + 3, y - 69],
      [x + 33, y - 64],
      [x + 25, y - 48],
      [x + 3, y - 53]
    ], g.checkpoint >= c.x ? '#7bd4c0' : '#ec9561');
  }
  for (const o of g.orbs) {
    if (o.taken || o.x < cam - 20 || o.x > cam + W + 20) continue;
    let x = o.x - cam,
      y = o.y + oy + Math.sin(visual * 3 + o.x) * 3;
    ctx.globalAlpha = .13;
    rect(x - 10, y - 10, 20, 20, '#99ffe1');
    ctx.globalAlpha = 1;
    poly([
      [x, y - 6],
      [x + 5, y],
      [x, y + 6],
      [x - 5, y]
    ], '#b3ffdc');
    rect(x - 1, y - 2, 2, 4, '#fff2bd');
  }
  for (const s of g.signs) {
    if (s.x < cam - 180 || s.x > cam + W) continue;
    ctx.fillStyle = '#493e32b8';
    ctx.fillRect(Math.round(s.x - cam - 4), Math.round(s.y + oy - 11), s.text.length * 5.5 + 8, 16);
    text(s.text, s.x - cam, s.y + oy, 9, '#fff0cd');
  }
  // Bonusový svitek leží pouze na horní větvi; sebrání má vlastní jednorázové ID.
  if(!g.scroll.taken) {
    const sx=g.scroll.x-cam, sy=g.scroll.y+oy;
    rect(sx-10,sy-10,20,20,'#fff0bd');
    rect(sx-14,sy-13,7,26,'#dc7448'); rect(sx+7,sy-13,7,26,'#dc7448');
    text('忍',sx,sy+5,13,'#6c4931','center');
  }
  // Finish torii gate.
  let gate = g.finish - cam;
  rect(gate, 246 + oy, 14, 154, '#be6350');
  rect(gate + 120, 246 + oy, 14, 154, '#be6350');
  rect(gate - 22, 242 + oy, 180, 12, '#172f3c');
  rect(gate - 15, 257 + oy, 165, 12, '#ec8960');
  rect(gate - 5, 285 + oy, 145, 8, '#db7b58');
  rect(gate + 49, 251 + oy, 32, 40, '#253d4b');
  text('木', gate + 65, 279 + oy, 23, '#edbb79', 'center');
  for (const h of ghosts) {
    if (!animator?.draw(ctx, h.x - cam + 11, h.y + oy + 40, h.face, h.life / .23 * .35, h.pose)) ninja(h.x -
      cam, h.y + oy, visual, h.slide, true, h.face, h.life / .23 * .35);
    h.life -= dt;
  }
  ghosts = ghosts.filter(h => h.life > 0);
  let p = g.p;
  const feet = p.y + p.h;
  let clearance = Infinity;
  for (const s of g.solids) {
    const bottom = s.y + s.h;
    if (p.x + p.w > s.x && p.x < s.x + s.w && bottom <= p.y + 1) clearance = Math.min(clearance, feet -
      bottom - 2);
  }
  animator?.update(dt, p, g.state, clearance);
  ghostClock -= dt;
  if ((p.dash > 0 || Math.abs(p.vx) > 380) && g.state === 'playing' && ghostClock <= 0) {
    ghostClock = .022;
    ghosts.push({
      x: p.x,
      y: p.y - (40 - p.h),
      life: .23,
      slide: p.slide,
      face: p.face,
      pose: animator?.pose()
    });
  }
  if ((p.inv <= 0 || Math.floor(visual * 15) % 2 === 0 || g.state === 'ready') && !animator?.draw(ctx, p.x -
      cam + 11, p.y + p.h + oy, p.wall && !p.ground && p.vy >= 0 ? p.wall : p.face)) ninja(p.x - cam, p.y +
    oy - (40 - p.h), g.state === 'playing' && Math.abs(p.vx) > 15 && !(p.jumpHeld && p.ground) && p.skid <=
    0 ? g.time : 0, p.slide, p.dash > 0, p.face, 1, p.jumpHeld && p.ground ? .62 : p.skid > 0 ? .84 :
    squash > 0 ? 1 - squash * 1.5 : stretch > 0 ? 1 + stretch * 1.3 : 1, p.skid > 0 ? .23 : p.jumpHeld && p
    .ground ? .1 : 0);
  if (p.jumpHeld && p.ground && !p.slide) {
    const foot = p.y + p.h + oy;
    ctx.strokeStyle = '#ffe3a5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(p.x - cam + 11, foot, 19 + Math.sin(visual * 8) * 2, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    text('PUSŤ = SKOK', p.x - cam + 11, foot - 42, 8, '#fff1bc', 'center');
  }
  if (p.dash > 0) {
    ctx.strokeStyle = '#b7ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(p.x - cam + 12, p.y + oy + 20, 34, 24, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const r of rings) {
    r.life -= dt;
    ctx.globalAlpha = Math.max(0, r.life / .32);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(r.x - cam, r.y + oy, r.radius * (1 - r.life / .32) + 3, Math.max(3, r.radius * (1 - r.life /
      .32) * .4), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  rings = rings.filter(r => r.life > 0);
  const landing = g.solids.find(s => s.type === 'roof' && s.x > g.p.x && s.x > cam + W - 40);
  const currentRoof = g.solids.find(s => s.type === 'roof' && g.p.x >= s.x && g.p.x < s.x + s.w);
  if (landing && (!currentRoof || currentRoof.x + currentRoof.w - g.p.x < 100) && landing.x - g.p.x < 520) {
    text('STŘECHA →', W - 14, landing.y + oy - 30, 10, '#fff0cd', 'right');
    rect(W - 42, landing.y + oy - 20, 28, 3, '#ffb76b');
  }
  for (const s of g.shots) if(!(s.windup>0)) shuriken(s);
  for (const p of particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 200 * dt;
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    rect(p.x - cam, p.y + oy, p.size, p.size, p.color);
  }
  ctx.globalAlpha = 1;
  particles = particles.filter(p => p.life > 0);
  for (const t of texts) {
    t.life -= dt;
    t.y -= 25 * dt;
    ctx.globalAlpha = Math.min(1, t.life * 3);
    text(t.text, t.x - cam, t.y + oy, 11, t.color, 'center');
  }
  ctx.globalAlpha = 1;
  texts = texts.filter(t => t.life > 0);
  // Wind, drifting leaves and dash streaks.
  for (let i = 0; i < 14; i++) {
    let x = ((i * 109 - visual * (20 + i % 3 * 9) - cam * .6) % (W + 30) + W + 30) % (W + 30),
      y = (i * 57 + Math.sin(visual + i) * 9) % (H - 30);
    rect(x, y, 4, 2, i % 2 ? '#f3b57777' : '#b8d6a566');
  }
  if (p.dash > 0)
    for (let i = 0; i < 12; i++) rect((i * 91 + visual * 300) % W, (i * 47) % H, 30 + i % 3 * 20, 1,
      '#91e0e590');
  ctx.restore();
  if (flash > 0 && fx) {
    ctx.globalAlpha = flash * .6;
    rect(0, 0, W, H, '#ffc3a0');
    ctx.globalAlpha = 1;
  }
  drawWarnings();
  squash = Math.max(0, squash - dt);
  stretch = Math.max(0, stretch - dt);
  shake = Math.max(0, shake - dt * 25);
  flash = Math.max(0, flash - dt);
}
// HUD čte stav, ale nepřidává body. Rekord v patičce je historická vzdálenost lokálního prohlížeče.
function updateHud() {
  $('score').textContent=g.score.toLocaleString('cs-CZ');
  $('timer').textContent=formatTime(g.resultTime);
  $('timePenalty').textContent=g.penalty?'včetně +'+g.penalty+' s':'';
  $('recordTime').textContent=records.time===null?'—':formatTime(records.time);
  $('recordScore').textContent=records.score.toLocaleString('cs-CZ');
  $('medalTarget').textContent=g.resultTime<=70?'CÍL: ZLATO ≤ 1:10':g.resultTime<=100?'CÍL: STŘÍBRO ≤ 1:40':g.resultTime<=150?'CÍL: BRONZ ≤ 2:30':'CÍL: DOKONČIT TRÉNINK';
  if(g.combo>0) $('combo').textContent=g.combo+'× FLOW · '+Math.ceil(g.comboTimer)+' s';
  updateTutorial();
  $('distance').innerHTML = String(Math.floor(g.bestX / 10)).padStart(4, '0') + ' <small>m</small>';
  $('charge').style.width = (1 - Math.min(1, g.p.cool / .85)) * 100 + '%';
  $('dashLabel').textContent = g.p.cool > 0 ? 'DOBÍJENÍ' : 'PŘIPRAVEN';
  $('lives').textContent = '◆ '.repeat(g.hp) + '◇ '.repeat(3 - g.hp);
  $('lives').setAttribute('aria-label', g.hp + ' životy');
  $('progress').style.width = Math.min(100, g.bestX / g.finish * 100) + '%';
  $('zone').textContent = g.zones[g.zoneIndex].name;
  if (g.combo === 0) $('combo').textContent = g.zones[g.zoneIndex].hint;
}
/** Kamera používá rychlost, nikoli směr sprite: při otočení nehází obrazem.
 * Lookahead se tlumí samostatně; hard clamp drží hráče v bezpečné části viewportu
 * i při dashi. Svislá mrtvá zóna zpřístupňuje horní větev také v landscape.
 * Kamera NIKDY nemění simulaci, spawn ani zásahové boxy. */
function resetCamera() {
  lookAhead=0;
  cam=Math.max(0,g.p.x-W*.35);
  camY=0;
  updateCamera(1);
}
function updateCamera(dt) {
  const p=g.p;
  const target=Math.max(-W*.22,Math.min(W*.25,p.vx*.24));
  lookAhead+=(target-lookAhead)*(1-Math.exp(-dt*5));
  const desired=Math.max(0,p.x+11-W*.42+lookAhead);
  cam+=(desired-cam)*(1-Math.exp(-dt*12));
  cam=Math.max(0,Math.min(p.x-W*.14,Math.max(p.x-W*.78,cam)));
  const screenY=p.y+p.h/2+H-480+camY;
  const low=H*.32, high=H*.73;
  const correction=screenY<low?low-screenY:screenY>high?high-screenY:0;
  camY+=correction*(1-Math.exp(-dt*9));
  // Pojistka při respawnu/změně rozměrů; pozvolné běžné sledování zůstává výše.
  camY=Math.max(32-(p.y+H-480),Math.min(H-38-(p.y+p.h+H-480),camY));
}
/** Výška indikátoru odpovídá dráze střely. Při ořezu se přidá ↑/↓.
 * Windup a offscreen varování trvají podle existence střely, ne pevného UI timeru.
 * Čas do kontaktu bere v úvahu běh/dash hráče; slouží pouze pro barvu varování. */
function shotIndicator(s) {
  if(s.dead) return null;
  const dx=s.x-g.p.x;
  if(dx<-25||dx>950) return null;
  const x=s.x-cam+8, rawY=s.y+H-480+camY+8;
  const ahead=x>W-22||x<22;
  const clipped=rawY<32||rawY>H-38;
  if(!s.windup&&!ahead&&!clipped) return null;
  const closing=Math.max(1,g.p.vx-s.vx);
  return {x:Math.max(22,Math.min(W-22,x)),y:Math.max(32,Math.min(H-38,rawY)),
    edge:x>W-22?'right':x<22?'left':'inside',vertical:rawY<32?'↑':rawY>H-38?'↓':'',
    urgent:!s.windup&&dx/closing<.7,preparing:s.windup>0};
}
function drawWarnings() {
  if(g.state!=='playing'&&g.state!=='paused') return;
  for(const s of g.shots) {
    const i=shotIndicator(s); if(!i) continue;
    const right=i.edge==='right',left=i.edge==='left';
    const label=(i.preparing?'PŘÍPRAVA':'SHURIKEN')+' '+i.vertical;
    const x=right?W-12:left?12:Math.max(72,Math.min(W-72,i.x));
    const color=i.urgent?'#ff8872':'#ffe0a4';
    rect(right?x-112:left?x-4:x-60,i.y-14,116,26,'#302c29ee');
    text((right?'◀ ':left?'▶ ':'! ')+label,x,i.y+3,10,color,right?'right':left?'left':'center');
    // Krátká linka v přesné výšce neplete výstrahu s dekorací pozadí.
    rect(right?W-45:left?0:i.x-16,i.y+10,right||left?45:32,2,color);
  }
}
const lessons=[
  {done:()=>g.bestX>135,title:'1/6 · ROZBĚH',text:'Drž D / → (nebo pravé dotykové tlačítko). Pohyb řídíš ty.'},
  {done:()=>g.stats.jump>0,title:'2/6 · PRVNÍ SKOK',text:'Stiskni SPACE / SKOK: přikrčení. PUSŤ: odraz přes bednu.'},
  {done:()=>g.solids.some(s=>s.type==='beam'&&s.x<600&&g.awarded.has(s.id)),title:'3/6 · POD TRÁMEM',text:'Drž S / ↓ / SKLUZ a projeď nízkým průchodem. Dash si do skluzu podrží rychlost.'},
  {done:()=>g.stats.double>0,title:'4/6 · DRUHÝ SKOK',text:'Ve vzduchu znovu STISKNI SPACE / SKOK. Dvojskok reaguje hned, bez čekání na puštění.'},
  {done:()=>g.stats.dash>0,title:'5/6 · CHAKRA DASH',text:'Stiskni SHIFT / X / DASH. Ve vzduchu pak můžeš ještě jednou skočit.'},
  {done:()=>g.stats.wall>0,title:'6/6 · ODRAZ OD STĚNY',text:'U zdi drž ↑ / SPACE / SKOK: na sekundu zpomalíš pád. PUSŤ pro odraz.'}
];
function endTutorial() {
  tutorialEnabled=false;
  try {localStorage.setItem('konoha-tutorial-v11','done');} catch {}
  $('tutorial').hidden=true;
}
function updateTutorial() {
  $('tutorial').hidden=!tutorialEnabled||g.state!=='playing';
  if(!tutorialEnabled||g.state!=='playing') return;
  const index=lessons.findIndex(l=>!l.done());
  if(index<0) {endTutorial();label('TRÉNINK ZÁKLADŮ ✓',g.p.x,g.p.y-60);return;}
  // Minutý trám nesmí zablokovat zbytek tutorialu: zobraz nejbližší další dovednost.
  const next=index===2&&g.bestX>700?lessons.findIndex((l,i)=>i>2&&!l.done()):index;
  if(next<0||g.bestX>1700) {endTutorial();return;}
  if(next!==tutorialStep) {
    tutorialStep=next;
    $('tutorialTitle').textContent=lessons[next].title;
    $('tutorialText').textContent=lessons[next].text;
  }
}
$('tutorialSkip').onclick=endTutorial;
$('tutorialReplay').onclick=()=>{tutorialEnabled=true;start();};
/** requestAnimationFrame čas je v ms. Převod na sekundy + accumulator řídí update(1/120).
 * Dlouhý render krok se omezí na 0.05 s; hitstop freeze záměrně zastavuje i simulaci.
 * API volání nesmí blokovat tuto funkci; g.time je čas SIMULACE, ne čas serveru. */
function frame(t) {
  let dt = Math.min(.05, (t - last) / 1000 || 0);
  last = t;
  if (freeze > 0) {
    freeze -= dt;
  } else {
    acc += dt;
    while (acc >= 1 / 120) {
      g.update(1 / 120, input);
      acc -= 1 / 120;
    }
    events();
  }
  if(g.state==='playing') updateCamera(dt);
  if(g.state==='ready') resetCamera();
  if (g.state === 'playing' && g.p.ground && Math.abs(g.p.vx) > 30 && g.time - lastStep > (g.p.skid > 0 ?
      .035 : g.p.slide ? .055 : .13)) {
    lastStep = g.time;
    burst(g.p.x, g.p.y + g.p.h, g.p.slide || g.p.skid > 0 ? '#ffce8a' : '#b9bdae', g.p.skid > 0 ? 7 : g.p
      .slide ? 5 : 3, g.p.skid > 0 ? 130 : g.p.slide ? 100 : 45);
  }
  render(dt);
  updateHud();
  if (g.state !== lastState) {
    syncOverlay();
    lastState = g.state;
  }
  requestAnimationFrame(frame);
}
size();
requestAnimationFrame(frame);
