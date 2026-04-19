/* ==========================================
   FLUFFY WANDERER — game.js
   병아리의 한가로운 여행 🐤
   ========================================== */

'use strict';

// ============================================================
// CONSTANTS
// ============================================================
const SAVE_KEY = 'fluffyWanderer_save';

const LOCATIONS = [
  {
    id: 'field',
    name: '🌾 들판',
    emoji: '🌾',
    unlockSeeds: 0,
    items: ['🌸','🌼','🍀','🌿','🌱','🦋','🐛','🌻'],
    particles: ['🍃','✨','🌸'],
    seedRate: 1.0,  // seeds per second multiplier
    desc: '따사로운 햇살 아래 넓은 들판'
  },
  {
    id: 'lake',
    name: '💧 연못',
    emoji: '💧',
    unlockSeeds: 40,
    items: ['🐸','🐟','🪷','🌊','🦆','🐚','🪸'],
    particles: ['💧','🫧','✨'],
    seedRate: 1.4,
    desc: '반짝이는 연못가에서 쉬는 시간'
  },
  {
    id: 'forest',
    name: '🌲 숲',
    emoji: '🌲',
    unlockSeeds: 120,
    items: ['🍄','🦔','🐿️','🌰','🍂','🦉','🐞','🕷️'],
    particles: ['🍃','🌿','✨'],
    seedRate: 1.8,
    desc: '조용하고 신비로운 숲 속'
  },
  {
    id: 'sunset',
    name: '🌅 노을',
    emoji: '🌅',
    unlockSeeds: 350,
    items: ['🌅','🌄','☁️','🦅','🌙','🌟','🎑'],
    particles: ['✨','🌟','🧡'],
    seedRate: 2.4,
    desc: '온 세상이 주황빛으로 물드는 시간'
  },
  {
    id: 'night',
    name: '🌙 밤하늘',
    emoji: '🌙',
    unlockSeeds: 900,
    items: ['⭐','🌙','🌠','🦉','🔮','🫧','🌌'],
    particles: ['⭐','✨','🌙'],
    seedRate: 3.2,
    desc: '별이 쏟아지는 고요한 밤'
  }
];

const COLLECTIBLES = [
  { id:'daisy',   emoji:'🌼', name:'데이지',   hint:'들판에서 발견' },
  { id:'clover',  emoji:'🍀', name:'네잎클로버', hint:'들판에서 발견' },
  { id:'butterfly',emoji:'🦋',name:'나비',     hint:'들판에서 발견' },
  { id:'frog',    emoji:'🐸', name:'개구리',   hint:'연못에서 발견' },
  { id:'lotus',   emoji:'🪷', name:'연꽃',     hint:'연못에서 발견' },
  { id:'shell',   emoji:'🐚', name:'조개껍질', hint:'연못에서 발견' },
  { id:'mushroom',emoji:'🍄', name:'버섯',     hint:'숲에서 발견' },
  { id:'hedgehog',emoji:'🦔', name:'고슴도치', hint:'숲에서 발견' },
  { id:'acorn',   emoji:'🌰', name:'도토리',   hint:'숲에서 발견' },
  { id:'eagle',   emoji:'🦅', name:'독수리',   hint:'노을에서 발견' },
  { id:'star',    emoji:'🌟', name:'별',       hint:'노을 또는 밤하늘에서 발견' },
  { id:'comet',   emoji:'🌠', name:'유성',     hint:'밤하늘에서 발견' },
  { id:'orb',     emoji:'🔮', name:'신비의 구슬',hint:'밤하늘에서 발견' },
];

// which items correspond to which collectible
const ITEM_TO_COLLECT = {
  '🌼':'daisy','🍀':'clover','🦋':'butterfly',
  '🐸':'frog','🪷':'lotus','🐚':'shell',
  '🍄':'mushroom','🦔':'hedgehog','🌰':'acorn',
  '🦅':'eagle','🌟':'star','🌠':'comet','🔮':'orb'
};

// ============================================================
// STATE
// ============================================================
let state = {
  seeds: 0,
  totalSeeds: 0,
  currentLoc: 'field',
  unlockedLocs: ['field'],
  collected: {},         // id -> count
  stats: {
    playTime: 0,         // seconds
    taps: 0,
    itemsPicked: 0,
    locsVisited: 1
  },
  lastSave: null,
  soundOn: true,
  songs: 0
};

// ============================================================
// DOM REFS
// ============================================================
const $title     = document.getElementById('screen-title');
const $game      = document.getElementById('screen-game');
const $btnNew    = document.getElementById('btn-new-game');
const $btnCont   = document.getElementById('btn-continue');
const $modalNew  = document.getElementById('modal-newgame');
const $btnNewOk  = document.getElementById('btn-newgame-confirm');
const $btnNewCx  = document.getElementById('btn-newgame-cancel');
const $locName   = document.getElementById('location-name');
const $timeDsp   = document.getElementById('time-display');
const $statSeeds = document.getElementById('stat-seeds');
const $statSongs = document.getElementById('stat-songs');
const $statPlaces= document.getElementById('stat-places');
const $sceneBg   = document.getElementById('scene-bg');
const $sceneMid  = document.getElementById('scene-middle');
const $chickWrap = document.getElementById('chick-wrap');
const $chick     = document.getElementById('chick');
const $sceneItems= document.getElementById('scene-items');
const $particles = document.getElementById('particles');
const $locTabs   = document.getElementById('location-tabs');
const $btnStats  = document.getElementById('btn-stats');
const $btnCollect= document.getElementById('btn-collect');
const $btnSave   = document.getElementById('btn-save');
const $btnMenu   = document.getElementById('btn-menu');
const $btnSound  = document.getElementById('btn-sound');
const $toast     = document.getElementById('toast');
const $backdrop  = document.getElementById('panel-backdrop');
const $panels    = document.querySelectorAll('.side-panel');
const $closeBtns = document.querySelectorAll('.close-btn');
const $statsBody = document.getElementById('stats-body');
const $collectBody=document.getElementById('collect-body');
const $menuSave  = document.getElementById('menu-save');
const $menuTitle = document.getElementById('menu-title');
const $menuReset = document.getElementById('menu-reset');
const $gameScene = document.getElementById('game-scene');

// ============================================================
// AUDIO (Web Audio API — soft chime tones)
// ============================================================
let audioCtx = null;

function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
}

function playTone(freq, type='sine', dur=0.18, vol=0.18) {
  if (!state.soundOn || !audioCtx) return;
  try {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
  } catch(e) {}
}

function playSeed()   { playTone(880, 'sine',     0.14, 0.15); }
function playCollect(){ playTone(1047,'triangle', 0.22, 0.22); setTimeout(()=>playTone(1319,'triangle',0.22,0.18),80); }
function playUnlock() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.3,0.2),i*80)); }
function playTap()    { playTone(660, 'sine',     0.1,  0.12); }
function playLocMove(){ playTone(440, 'triangle', 0.2,  0.15); }
function playSave()   { [523,659].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.2,0.15),i*80)); }

// ============================================================
// SAVE / LOAD
// ============================================================
function saveGame() {
  state.lastSave = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    showToast('💾 저장되었어요!');
    playSave();
  } catch(e) { showToast('❌ 저장 실패'); }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    // merge to ensure new fields exist
    state = Object.assign({}, state, saved);
    state.stats = Object.assign({ playTime:0, taps:0, itemsPicked:0, locsVisited:1 }, saved.stats || {});
    return true;
  } catch(e) { return false; }
}

function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

// ============================================================
// SCREEN TRANSITIONS
// ============================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ============================================================
// LOCATION TABS
// ============================================================
function renderLocTabs() {
  $locTabs.innerHTML = '';
  LOCATIONS.forEach(loc => {
    const btn = document.createElement('button');
    btn.className = 'loc-tab' +
      (state.currentLoc === loc.id ? ' active' : '') +
      (!state.unlockedLocs.includes(loc.id) ? ' locked' : '');
    btn.textContent = loc.emoji + ' ' + loc.name.replace(/^.+\s/,'');
    btn.title = state.unlockedLocs.includes(loc.id)
      ? loc.desc
      : `🔒 씨앗 ${loc.unlockSeeds}개 필요`;

    btn.addEventListener('click', () => {
      if (!state.unlockedLocs.includes(loc.id)) {
        showToast(`🔒 씨앗 ${loc.unlockSeeds}개가 있어야 열려요`);
        return;
      }
      if (state.currentLoc === loc.id) return;
      travelTo(loc.id);
    });
    $locTabs.appendChild(btn);
  });
}

function travelTo(locId) {
  initAudio();
  state.currentLoc = locId;
  if (!state.unlockedLocs.includes(locId)) state.unlockedLocs.push(locId);

  // update visited stat
  const visited = new Set(state.unlockedLocs).size;
  state.stats.locsVisited = visited;

  renderLocTabs();
  applyScene();
  spawnSceneItems();
  spawnParticles();
  playLocMove();

  const loc = LOCATIONS.find(l=>l.id===locId);
  $locName.textContent = loc.name;
  showToast(`${loc.emoji} ${loc.desc}`);
}

// ============================================================
// SCENE RENDERING
// ============================================================
function applyScene() {
  $sceneBg.setAttribute('data-loc', state.currentLoc);
  $sceneMid.setAttribute('data-loc', state.currentLoc);
}

let chickX = 40; // percentage

function moveChick() {
  const scene = $gameScene.getBoundingClientRect();
  const min = 8, max = 75;
  const newX = min + Math.random() * (max - min);
  chickX = newX;
  $chickWrap.style.left = chickX + '%';
  // flip direction
  $chick.style.transform = newX > chickX ? 'scaleX(-1)' : 'scaleX(1)';
}

function autoMoveChick() {
  moveChick();
  const next = 4000 + Math.random() * 8000;
  setTimeout(autoMoveChick, next);
}

// ============================================================
// SCENE ITEMS
// ============================================================
const activeItems = [];
let itemSpawnTimer = null;

function spawnSceneItems() {
  // clear existing
  $sceneItems.innerHTML = '';
  activeItems.length = 0;
  if (itemSpawnTimer) clearInterval(itemSpawnTimer);

  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  if (!loc) return;

  // Spawn initial items
  for (let i = 0; i < 4; i++) spawnOneItem(loc);

  // keep spawning
  itemSpawnTimer = setInterval(() => {
    if ($sceneItems.children.length < 7) spawnOneItem(loc);
  }, 3500);
}

function spawnOneItem(loc) {
  const emoji = loc.items[Math.floor(Math.random() * loc.items.length)];
  const el = document.createElement('div');
  el.className = 'scene-item';
  el.textContent = emoji;

  const leftPct  = 5 + Math.random() * 85;
  const bottomPct = 18 + Math.random() * 35;
  el.style.left   = leftPct  + '%';
  el.style.bottom = bottomPct + '%';
  el.style.setProperty('--delay', (Math.random() * 2) + 's');

  el.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    collectItem(el, emoji, e);
  });

  $sceneItems.appendChild(el);
}

function collectItem(el, emoji, evt) {
  initAudio();
  // pop animation
  const rect = el.getBoundingClientRect();
  el.remove();

  // seed reward
  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  const reward = Math.ceil(1 * (loc ? loc.seedRate : 1));
  addSeeds(reward, rect.left, rect.top);
  playCollect();

  // collectible?
  const cid = ITEM_TO_COLLECT[emoji];
  if (cid) {
    state.collected[cid] = (state.collected[cid] || 0) + 1;
    if (state.collected[cid] === 1) {
      const c = COLLECTIBLES.find(x=>x.id===cid);
      showToast(`${c.emoji} ${c.name} 처음 발견!`);
      playUnlock();
    }
  }

  // song chance
  if (Math.random() < 0.08) {
    state.songs++;
    $statSongs.textContent = state.songs;
    showToast('🎵 새로운 노래를 들었어요!');
  }

  state.stats.itemsPicked++;
}

// ============================================================
// PARTICLES
// ============================================================
function spawnParticles() {
  $particles.innerHTML = '';
  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  if (!loc) return;
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = loc.particles[Math.floor(Math.random()*loc.particles.length)];
    p.style.left   = Math.random()*90 + '%';
    p.style.bottom = Math.random()*40 + '%';
    p.style.setProperty('--dur',   (3 + Math.random()*4) + 's');
    p.style.setProperty('--delay2',(Math.random()*5) + 's');
    p.style.setProperty('--dx',    (-30 + Math.random()*60) + 'px');
    $particles.appendChild(p);
  }
}

// ============================================================
// SEEDS / CURRENCY
// ============================================================
function addSeeds(amount, x, y) {
  state.seeds     += amount;
  state.totalSeeds += amount;
  updateSeedDisplay();
  checkUnlocks();

  // floating coin pop
  if (x !== undefined) {
    const pop = document.createElement('div');
    pop.className = 'coin-pop';
    pop.textContent = '+' + amount + '🌱';
    pop.style.left = (x - $gameScene.getBoundingClientRect().left) + 'px';
    pop.style.top  = (y  - $gameScene.getBoundingClientRect().top - 20) + 'px';
    $gameScene.appendChild(pop);
    setTimeout(()=>pop.remove(), 900);
  }
}

function updateSeedDisplay() {
  $statSeeds.textContent = formatNum(state.seeds);
}

function checkUnlocks() {
  LOCATIONS.forEach(loc => {
    if (!state.unlockedLocs.includes(loc.id) && state.totalSeeds >= loc.unlockSeeds) {
      state.unlockedLocs.push(loc.id);
      showToast(`🗺️ 새 장소 해금! ${loc.name}`);
      playUnlock();
      renderLocTabs();
      $statPlaces.textContent = state.unlockedLocs.length;
      // pulse the new tab
      const tabs = $locTabs.querySelectorAll('.loc-tab');
      tabs.forEach(t => {
        if (t.textContent.includes(loc.emoji)) t.classList.add('pulse');
      });
    }
  });
}

// ============================================================
// IDLE SEED INCOME
// ============================================================
let lastTick = Date.now();

function tickIncome() {
  const now = Date.now();
  const dt = (now - lastTick) / 1000;
  lastTick = now;

  state.stats.playTime += dt;

  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  const rate = (loc ? loc.seedRate : 1) * 0.3;  // 0.3 seeds/sec base
  state.seeds      += rate * dt;
  state.totalSeeds += rate * dt;
  state.seeds = Math.floor(state.seeds * 100) / 100;

  updateSeedDisplay();
  checkUnlocks();
  updateTimeDisplay();
  requestAnimationFrame(tickIncome);
}

// ============================================================
// TIME DISPLAY
// ============================================================
function updateTimeDisplay() {
  const s = Math.floor(state.stats.playTime);
  const hh = String(Math.floor(s/3600)).padStart(2,'0');
  const mm = String(Math.floor((s%3600)/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  $timeDsp.textContent = `${hh}:${mm}:${ss}`;
}

// ============================================================
// STATS PANEL
// ============================================================
function renderStats() {
  const s = state.stats;
  const playMin = Math.floor(s.playTime / 60);
  $statsBody.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'stats-grid';

  const cards = [
    { icon:'🌱', label:'모은 씨앗',    value: formatNum(Math.floor(state.totalSeeds)), unit:'' },
    { icon:'⏱️', label:'여행 시간',    value: playMin >= 60 ? (playMin/60).toFixed(1) : playMin, unit: playMin>=60?'시간':'분' },
    { icon:'👆', label:'탭 횟수',      value: formatNum(s.taps),        unit:'' },
    { icon:'🎁', label:'아이템 수집',  value: formatNum(s.itemsPicked), unit:'' },
    { icon:'🗺️', label:'방문 장소',    value: state.unlockedLocs.length, unit:'/'+LOCATIONS.length },
    { icon:'🎵', label:'들은 노래',    value: state.songs,              unit:'' },
  ];

  cards.forEach(c => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `<h3>${c.icon} ${c.label}</h3>
      <div class="stat-value">${c.value}<span class="stat-unit">${c.unit}</span></div>`;
    grid.appendChild(card);
  });

  $statsBody.appendChild(grid);
}

// ============================================================
// COLLECT PANEL
// ============================================================
function renderCollect() {
  $collectBody.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'collect-grid';

  COLLECTIBLES.forEach(c => {
    const count = state.collected[c.id] || 0;
    const div = document.createElement('div');
    div.className = 'collect-item' + (count===0?' locked':'');
    div.innerHTML = `<span>${c.emoji}</span>
      <span class="collect-label">${count>0?c.name:'???'}</span>`;
    if (count > 0) {
      const badge = document.createElement('span');
      badge.className = 'collect-count';
      badge.textContent = 'x'+count;
      div.appendChild(badge);
    }
    div.title = count>0 ? c.hint : '아직 발견 못했어요';
    grid.appendChild(div);
  });

  $collectBody.appendChild(grid);
}

// ============================================================
// PANEL MANAGEMENT
// ============================================================
function openPanel(id) {
  if (id === 'panel-stats')   renderStats();
  if (id === 'panel-collect') renderCollect();
  $panels.forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  $backdrop.classList.remove('hidden');
}

function closeAllPanels() {
  $panels.forEach(p => p.classList.add('hidden'));
  $backdrop.classList.add('hidden');
}

$closeBtns.forEach(btn => {
  btn.addEventListener('click', closeAllPanels);
});
$backdrop.addEventListener('click', closeAllPanels);

// ============================================================
// TOAST
// ============================================================
let toastTimer = null;
function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.remove('hidden');
  $toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    $toast.classList.remove('show');
    setTimeout(() => $toast.classList.add('hidden'), 400);
  }, 2200);
}

// ============================================================
// FORMAT
// ============================================================
function formatNum(n) {
  n = Math.floor(n);
  if (n >= 1000000) return (n/1000000).toFixed(1)+'M';
  if (n >= 1000)    return (n/1000).toFixed(1)+'K';
  return String(n);
}

// ============================================================
// CHICK TAP
// ============================================================
$chick.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  initAudio();
  state.stats.taps++;
  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  const bonus = Math.ceil(2 * (loc?loc.seedRate:1));
  const rect = $chick.getBoundingClientRect();
  addSeeds(bonus, rect.left + rect.width/2, rect.top);
  playTap();
  // hearts or sparkle on tap
  const hearts = ['💛','✨','🌟','🐥'];
  const pop = document.createElement('div');
  pop.className = 'coin-pop';
  pop.textContent = hearts[Math.floor(Math.random()*hearts.length)];
  pop.style.left = (rect.left - $gameScene.getBoundingClientRect().left + rect.width/2 - 10) + 'px';
  pop.style.top  = (rect.top  - $gameScene.getBoundingClientRect().top - 10) + 'px';
  $gameScene.appendChild(pop);
  setTimeout(()=>pop.remove(),900);
});

// Scene tap -> move chick
$gameScene.addEventListener('pointerdown', () => {
  initAudio();
  moveChick();
});

// ============================================================
// BUTTON WIRING
// ============================================================
$btnStats  .addEventListener('click', () => { initAudio(); openPanel('panel-stats');   });
$btnCollect.addEventListener('click', () => { initAudio(); openPanel('panel-collect'); });
$btnSave   .addEventListener('click', () => { initAudio(); saveGame(); });
$btnMenu   .addEventListener('click', () => { initAudio(); openPanel('panel-menu');    });

$menuSave .addEventListener('click', () => { saveGame(); closeAllPanels(); });
$menuTitle.addEventListener('click', () => {
  closeAllPanels();
  showScreen('screen-title');
  updateTitleButtons();
});
$menuReset.addEventListener('click', () => {
  closeAllPanels();
  $modalNew.classList.remove('hidden');
});

$btnSound.addEventListener('click', () => {
  initAudio();
  state.soundOn = !state.soundOn;
  $btnSound.textContent = state.soundOn ? '🔔' : '🔕';
  showToast(state.soundOn ? '🔔 소리 켜짐' : '🔕 소리 꺼짐');
});

// ============================================================
// TITLE BUTTONS
// ============================================================
function updateTitleButtons() {
  $btnCont.disabled = !hasSave();
}

$btnNew.addEventListener('click', () => {
  initAudio();
  if (hasSave()) {
    $modalNew.classList.remove('hidden');
  } else {
    startNewGame();
  }
});

$btnCont.addEventListener('click', () => {
  initAudio();
  if (loadGame()) {
    startGame();
  }
});

$btnNewOk.addEventListener('click', () => {
  deleteSave();
  $modalNew.classList.add('hidden');
  startNewGame();
});

$btnNewCx.addEventListener('click', () => {
  $modalNew.classList.add('hidden');
});

// ============================================================
// GAME INIT
// ============================================================
function startNewGame() {
  state = {
    seeds: 0,
    totalSeeds: 0,
    currentLoc: 'field',
    unlockedLocs: ['field'],
    collected: {},
    stats: { playTime:0, taps:0, itemsPicked:0, locsVisited:1 },
    lastSave: null,
    soundOn: true,
    songs: 0
  };
  startGame();
}

function startGame() {
  // reset lastTick
  lastTick = Date.now();

  // apply scene
  applyScene();
  $locName.textContent = LOCATIONS.find(l=>l.id===state.currentLoc)?.name || '';
  $statSeeds.textContent = formatNum(state.seeds);
  $statSongs.textContent = state.songs;
  $statPlaces.textContent = state.unlockedLocs.length;
  $btnSound.textContent = state.soundOn ? '🔔' : '🔕';

  // chick start position
  chickX = 40;
  $chickWrap.style.left = chickX + '%';

  renderLocTabs();
  spawnSceneItems();
  spawnParticles();
  autoMoveChick();
  requestAnimationFrame(tickIncome);

  showScreen('screen-game');
  showToast('🐤 안녕! 여행을 시작해요~');
}

// ============================================================
// AUTO SAVE
// ============================================================
setInterval(() => {
  if (document.getElementById('screen-game').classList.contains('active')) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e){}
  }
}, 30000); // every 30s

// ============================================================
// VISIBILITY CHANGE — pause time tracking
// ============================================================
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    lastTick = Date.now(); // reset so we don't get huge skip
  }
});

// ============================================================
// BOOT
// ============================================================
updateTitleButtons();
showScreen('screen-title');
