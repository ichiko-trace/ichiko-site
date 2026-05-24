/* ================================================
   ichiko — v02 immersive
   ================================================ */

'use strict';

// ---- Noise (film grain) ----
const noiseCanvas = document.getElementById('noise');
const nCtx        = noiseCanvas.getContext('2d');
let   lastNoise   = 0;

function resizeNoise() {
  noiseCanvas.width  = window.innerWidth;
  noiseCanvas.height = window.innerHeight;
}

function paintNoise() {
  const w   = noiseCanvas.width;
  const h   = noiseCanvas.height;
  const img = nCtx.createImageData(w, h);
  const d   = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = (Math.random() * 26) | 0;
  }
  nCtx.putImageData(img, 0, 0);
}

// ---- Rain ----
const rainCanvas = document.getElementById('rain');
const rCtx       = rainCanvas.getContext('2d');
let   drops      = [];

function resizeRain() {
  rainCanvas.width  = window.innerWidth;
  rainCanvas.height = window.innerHeight;
  initDrops();
}

function initDrops() {
  drops = Array.from({ length: 65 }, () => ({
    x:   Math.random() * rainCanvas.width,
    y:   Math.random() * rainCanvas.height,
    len: 7 + Math.random() * 13,
    spd: 1.6 + Math.random() * 2.4,
    opa: 0.022 + Math.random() * 0.065,
  }));
}

function paintRain() {
  rCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
  for (const d of drops) {
    rCtx.beginPath();
    rCtx.moveTo(d.x, d.y);
    rCtx.lineTo(d.x - 0.7, d.y + d.len);
    rCtx.strokeStyle = `rgba(190,212,232,${d.opa})`;
    rCtx.lineWidth   = 0.5;
    rCtx.stroke();
    d.y += d.spd;
    d.x -= 0.22;
    if (d.y > rainCanvas.height + d.len) {
      d.y = -d.len;
      d.x = Math.random() * rainCanvas.width;
    }
  }
}

// ---- Audio ----
let actx, masterGain;

function startAudio() {
  if (startAudio.done) return;
  startAudio.done = true;
  actx       = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = actx.createGain();
  masterGain.gain.setValueAtTime(0, actx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.2, actx.currentTime + 5);
  masterGain.connect(actx.destination);
  tryLoadLoop('assets/audio/wind.mp3', 0.75).catch(() => synthWind());
  setTimeout(() => tryLoadLoop('assets/audio/footsteps.mp3', 0.45).catch(() => {}), 4500);
}

function tryLoadLoop(url, vol) {
  return fetch(url)
    .then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
    .then(buf => actx.decodeAudioData(buf))
    .then(decoded => {
      const src = actx.createBufferSource();
      const g   = actx.createGain();
      src.buffer = decoded; src.loop = true;
      g.gain.value = vol;
      src.connect(g); g.connect(masterGain);
      src.start(0);
    });
}

function synthWind() {
  try {
    const sr  = actx.sampleRate;
    const buf = actx.createBuffer(2, sr, sr);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      b0=b1=b2=b3=b4=b5=b6=0;
      for (let i = 0; i < ch.length; i++) {
        const w = Math.random() * 2 - 1;
        b0 =  0.99886*b0 + w*0.0555179;
        b1 =  0.99332*b1 + w*0.0750759;
        b2 =  0.96900*b2 + w*0.1538520;
        b3 =  0.86650*b3 + w*0.3104856;
        b4 =  0.55000*b4 + w*0.5329522;
        b5 = -0.76160*b5 - w*0.0168980;
        ch[i] = (b0+b1+b2+b3+b4+b5+b6 + w*0.5362) * 0.10;
        b6 = w * 0.115926;
      }
    }
    const src = actx.createBufferSource();
    const lp  = actx.createBiquadFilter();
    const g   = actx.createGain();
    src.buffer = buf; src.loop = true;
    lp.type = 'lowpass'; lp.frequency.value = 300; lp.Q.value = 0.3;
    g.gain.value = 0.28;
    src.connect(lp); lp.connect(g); g.connect(masterGain);
    src.start(0);
  } catch (_) {}
}

// ---- Image list (flashback) ----
const FLASH_SRCS = [
  'コンクリートの壁と後ろ姿.jpg', 'ネオンの歩道橋.jpg',
  '夕映えの水面と素足.jpg',       '夕暮れのうなじ.jpg',
  '夕暮れの手のひら.jpg',         '夕焼けに伸ばす手.jpg',
  '夕焼けに伸ばす手_02.jpg',      '夕焼けのシルエットの手.jpg',
  '夜の水辺の素足.jpg',           '月に伸ばす手.jpg',
  '月光と水面に触れる素足.jpg',   '月夜の水面と素足_01.jpg',
  '月夜の水面と素足_02.jpg',      '月明かりの手.jpg',
  '桜の橋を渡る後ろ姿.jpg',       '桜の花びらと手_01.jpg',
  '桜の花びらと手_02.jpg',        '石畳を歩く影.jpg',
  '紫の光る駅で佇む.jpg',         '美術館の絵の前で.jpg',
  '赤い薔薇に触れる横顔.jpg',     '赤い薔薇を見つめる横顔.jpg',
  '都市を歩くシルエット.jpg',     '雨の公園と傘.jpg',
  '雪に伸ばす手.jpg',             '雪の中の手_01.jpg',
  '雪の中の手_02.jpg',            '駅のホームで風に吹かれて.jpg',
  '駅のホームと手紙.jpg',         '高架下の後ろ姿.jpg',
  '黒い薔薇に触れる手.jpg',       '黒い薔薇に触れる手_02.jpg',
].map(n => `assets/images/${encodeURIComponent(n)}`);

const shuffled = [...FLASH_SRCS].sort(() => Math.random() - 0.5);

// ---- Elements ----
const sceneEl  = document.getElementById('scene');
const ichikoEl = document.getElementById('ichiko');
const flashEl  = document.getElementById('flashback');
const wordsEl  = document.getElementById('words');

// ---- Timeline ----
setTimeout(emerge,      5000);
setTimeout(startZoom,   7000);
setTimeout(startFlash, 15000);
setTimeout(endFlash,   25000);

// ---- Phase functions ----

function emerge() {
  ichikoEl.classList.add('visible');
  rainCanvas.classList.add('active');
}

function startZoom() {
  sceneEl.classList.add('zooming');
}

let flashTimeout = null;
let flashIndex   = 0;

function startFlash() {
  flashEl.classList.add('active');
  burstFlash(8);
  scheduleFlash();
}

function scheduleFlash() {
  const delay = 350 + Math.random() * 500;
  flashTimeout = setTimeout(() => {
    burstFlash(3 + Math.floor(Math.random() * 4));
    scheduleFlash();
  }, delay);
}

function burstFlash(count) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => spawnFlashFrag(), i * 55);
  }
}

function spawnFlashFrag() {
  const img = new Image();
  img.src       = shuffled[flashIndex % shuffled.length];
  img.className = 'flash-frag';
  img.onerror   = () => img.remove();
  flashIndex++;

  const dur = (0.35 + Math.random() * 0.55).toFixed(2);
  img.style.setProperty('--dur', `${dur}s`);

  img.style.left = `${10 + Math.random() * 80}vw`;
  img.style.top  = `${10 + Math.random() * 80}vh`;

  img.addEventListener('animationend', () => img.remove());
  flashEl.appendChild(img);
}

function endFlash() {
  clearTimeout(flashTimeout);

  flashEl.style.transition = 'opacity 0.8s ease';
  flashEl.style.opacity    = '0';
  setTimeout(() => {
    flashEl.classList.remove('active');
    flashEl.style.transition = '';
    flashEl.style.opacity    = '';
    flashEl.innerHTML        = '';
  }, 900);

  sceneEl.style.transform = 'scale(1.35)';
  sceneEl.classList.remove('zooming');
  void sceneEl.offsetWidth;
  sceneEl.style.transform = '';
  sceneEl.classList.add('zooming-out');

  setTimeout(darken,     17000);
  setTimeout(showWords,  19500);
}

function darken() {
  sceneEl.style.transition    = 'opacity 2.5s ease';
  sceneEl.style.opacity       = '0';
  rainCanvas.style.transition = 'opacity 2.5s ease';
  rainCanvas.style.opacity    = '0';
}

function showWords() {
  wordsEl.classList.add('active');
  [
    { text: 'ichiko',          cls: 'word word-ichiko' },
    { text: 'AI',              cls: 'word word-ai'     },
    { text: '対話　構造　物語', cls: 'word word-sub'   },
  ].forEach(({ text, cls }, i) => {
    setTimeout(() => {
      const span = document.createElement('span');
      span.className   = cls;
      span.textContent = text;
      wordsEl.appendChild(span);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        span.classList.add('visible');
      }));
    }, i * 2000);
  });
}

// ---- First touch → audio ----
function onFirstTouch() {
  startAudio();
  document.removeEventListener('click',      onFirstTouch);
  document.removeEventListener('touchstart', onFirstTouch);
}
document.addEventListener('click',      onFirstTouch);
document.addEventListener('touchstart', onFirstTouch, { passive: true });

// ---- Resize ----
window.addEventListener('resize', () => {
  resizeNoise();
  resizeRain();
});

// ---- Main loop ----
function loop(ts) {
  if (ts - lastNoise > 80) { paintNoise(); lastNoise = ts; }
  paintRain();
  requestAnimationFrame(loop);
}

// ---- Boot ----
resizeNoise();
resizeRain();
requestAnimationFrame(loop);
