/* ==========================================
   FLUFFY WANDERER v2 — game.js
   🐤 병아리의 한가로운 여행
   ========================================== */
'use strict';

// ============================================================
// CHICK TYPES — unlocked via evolve gauge
// ============================================================
const CHICK_TYPES = [
  { id:'chick',    emoji:'🐤', name:'병아리',       trait:'자유롭게 돌아다녀요',    seedBonus:1.0 },
  { id:'hatching', emoji:'🐣', name:'부화 중인 알',  trait:'느긋하게 움직여요',       seedBonus:1.2 },
  { id:'baby',     emoji:'🐥', name:'노란 아기새',   trait:'아주 빠르게 뛰어다녀요',  seedBonus:1.5 },
  { id:'penguin',  emoji:'🐧', name:'펭귄',          trait:'뒤뚱뒤뚱 걸어요',         seedBonus:1.8 },
  { id:'owl',      emoji:'🦉', name:'부엉이',         trait:'빙글빙글 돌아다녀요',     seedBonus:2.2 },
  { id:'parrot',   emoji:'🦜', name:'앵무새',         trait:'8자로 날아다녀요',        seedBonus:2.6 },
  { id:'flamingo', emoji:'🦩', name:'플라밍고',       trait:'우아하게 유영해요',       seedBonus:3.0 },
  { id:'phoenix',  emoji:'🐦‍🔥', name:'불사조',     trait:'불꽃처럼 날아다녀요',     seedBonus:4.0 },
];

// Gauge fills every EVOLVE_INTERVAL seconds → new chick type unlocked
const EVOLVE_INTERVAL = 6 * 60; // 6 minutes per chick

// ============================================================
// LOCATIONS — higher unlock cost, unique movement mode
// ============================================================
const LOCATIONS = [
  {
    id:'field',  name:'🌾 들판',  emoji:'🌾',
    unlockSeeds: 0,
    items:['🌸','🌼','🍀','🌿','🌱','🦋','🐛','🌻'],
    particles:['🍃','✨','🌸'],
    seedRate:1.0,
    moveMode:'wander',   // random wander with depth
    desc:'따사로운 햇살 아래 넓은 들판'
  },
  {
    id:'lake',   name:'💧 연못',  emoji:'💧',
    unlockSeeds: 300,
    items:['🐸','🐟','🪷','🌊','🦆','🐚','🪸'],
    particles:['💧','🫧','✨'],
    seedRate:1.6,
    moveMode:'drift',    // slow drift with gentle depth sway
    desc:'반짝이는 연못가에서 쉬는 시간'
  },
  {
    id:'forest', name:'🌲 숲',    emoji:'🌲',
    unlockSeeds: 1200,
    items:['🍄','🦔','🐿️','🌰','🍂','🦉','🐞','🕷️'],
    particles:['🍃','🌿','✨'],
    seedRate:2.2,
    moveMode:'patrol',   // left/right patrol changing depth each pass
    desc:'조용하고 신비로운 숲 속'
  },
  {
    id:'sunset', name:'🌅 노을',  emoji:'🌅',
    unlockSeeds: 5000,
    items:['🌅','🌄','☁️','🦅','🌙','🌟','🎑'],
    particles:['✨','🌟','🧡'],
    seedRate:3.0,
    moveMode:'circle',   // circular path with depth oscillation
    desc:'온 세상이 주황빛으로 물드는 시간'
  },
  {
    id:'night',  name:'🌙 밤하늘', emoji:'🌙',
    unlockSeeds: 20000,
    items:['⭐','🌙','🌠','🦉','🔮','🫧','🌌'],
    particles:['⭐','✨','🌙'],
    seedRate:4.2,
    moveMode:'figure8',  // figure-8 path with full depth usage
    desc:'별이 쏟아지는 고요한 밤'
  }
];

// ============================================================
// SHOP ITEMS — bought with seeds
// ============================================================
const SHOP_ITEMS = [
  {
    id:'feed',       icon:'🌾', name:'씨앗 여물',
    desc:'병아리에게 먹이를 줘요',
    effect:'+50 씨앗 즉시 획득',
    cost:30,  type:'consume',
    action: (st) => { st.seeds += 50; st.totalSeeds += 50; }
  },
  {
    id:'feast',      icon:'🍱', name:'특별 도시락',
    desc:'맛있는 도시락으로 기운 충전',
    effect:'+300 씨앗 즉시 획득',
    cost:150, type:'consume',
    action: (st) => { st.seeds += 300; st.totalSeeds += 300; }
  },
  {
    id:'autoplus',   icon:'⚙️', name:'자동 수확기 Lv.1',
    desc:'자동 씨앗 획득량 +1개/3분',
    effect:'자동 획득 +33% (중복 가능)',
    cost:200, type:'upgrade', maxOwn:5,
    action: (st) => { st.autoBonus = (st.autoBonus || 0) + 1; }
  },
  {
    id:'speedup',    icon:'💨', name:'바람개비',
    desc:'병아리가 더 활발하게 돌아다녀요',
    effect:'이동 속도 +20%',
    cost:400, type:'upgrade', maxOwn:3,
    action: (st) => { st.speedBonus = (st.speedBonus || 0) + 0.2; }
  },
  {
    id:'magnet',     icon:'🧲', name:'씨앗 자석',
    desc:'아이템 획득 씨앗 +1 추가',
    effect:'아이템 씨앗 +1',
    cost:600, type:'upgrade', maxOwn:5,
    action: (st) => { st.pickBonus = (st.pickBonus || 0) + 1; }
  },
  {
    id:'gauge_boost',icon:'⚡', name:'게이지 가속제',
    desc:'병아리 진화 게이지 즉시 +10%',
    effect:'게이지 +10% 즉시',
    cost:250, type:'consume',
    action: (st) => { st.evolveProgress = Math.min(1, (st.evolveProgress || 0) + 0.1); }
  },
  {
    id:'lucky_clover',icon:'🍀', name:'네잎클로버',
    desc:'수집품 드롭 확률 2배',
    effect:'수집 확률 ×2 (1회성)',
    cost:500, type:'consume',
    action: (st) => { st.luckyActive = (st.luckyActive || 0) + 120; } // 120 seconds
  },
];

// ============================================================
// COLLECTIBLES
// ============================================================
const COLLECTIBLES = [
  { id:'daisy',    emoji:'🌼', name:'데이지',       hint:'들판' },
  { id:'clover',   emoji:'🍀', name:'네잎클로버',    hint:'들판' },
  { id:'butterfly',emoji:'🦋', name:'나비',          hint:'들판' },
  { id:'frog',     emoji:'🐸', name:'개구리',        hint:'연못' },
  { id:'lotus',    emoji:'🪷', name:'연꽃',          hint:'연못' },
  { id:'shell',    emoji:'🐚', name:'조개껍질',      hint:'연못' },
  { id:'mushroom', emoji:'🍄', name:'버섯',          hint:'숲' },
  { id:'hedgehog', emoji:'🦔', name:'고슴도치',      hint:'숲' },
  { id:'acorn',    emoji:'🌰', name:'도토리',        hint:'숲' },
  { id:'eagle',    emoji:'🦅', name:'독수리',        hint:'노을' },
  { id:'star',     emoji:'🌟', name:'별',            hint:'노을/밤' },
  { id:'comet',    emoji:'🌠', name:'유성',          hint:'밤하늘' },
  { id:'orb',      emoji:'🔮', name:'신비의 구슬',   hint:'밤하늘' },
];
const ITEM_TO_COLLECT = {
  '🌼':'daisy','🍀':'clover','🦋':'butterfly',
  '🐸':'frog','🪷':'lotus','🐚':'shell',
  '🍄':'mushroom','🦔':'hedgehog','🌰':'acorn',
  '🦅':'eagle','🌟':'star','🌠':'comet','🔮':'orb'
};

// ============================================================
// STATE
// ============================================================
const DEFAULT_STATE = () => ({
  seeds:         0,
  totalSeeds:    0,
  currentLoc:    'field',
  unlockedLocs:  ['field'],
  collected:     {},
  shopOwned:     {},   // itemId -> count
  autoBonus:     0,    // extra auto seeds (stacks of autoplus)
  speedBonus:    0,    // movement speed multiplier extra
  pickBonus:     0,    // extra seeds per item pick
  luckyActive:   0,    // seconds remaining for lucky clover
  unlockedChicks: ['chick'],
  activeChick:    'chick',
  evolveProgress: 0,   // 0..1 within current interval
  evolveTotal:    0,   // total seconds elapsed for gauge
  stats: {
    playTime:    0,
    taps:        0,
    itemsPicked: 0,
    locsVisited: 1,
    autoSeeds:   0,
  },
  soundOn:       true,
  songs:         0,
  lastSave:      null,
});

let state = DEFAULT_STATE();

// ============================================================
// DOM REFS
// ============================================================
const $ = id => document.getElementById(id);
const $screenTitle  = $('screen-title');
const $screenGame   = $('screen-game');
const $btnNew       = $('btn-new-game');
const $btnCont      = $('btn-continue');
const $modalNew     = $('modal-newgame');
const $btnNewOk     = $('btn-newgame-confirm');
const $btnNewCx     = $('btn-newgame-cancel');
const $locName      = $('location-name');
const $timeDisp     = $('time-display');
const $statSeeds    = $('stat-seeds');
const $statChicks   = $('stat-chick-count');
const $statPlaces   = $('stat-places');
const $sceneBg      = $('scene-bg');
const $sceneMid     = $('scene-middle');
const $depthStage   = $('depth-stage');
const $sceneItems   = $('scene-items');
const $particles    = $('particles');
const $locTabs      = $('location-tabs');
const $evolveFill   = $('evolve-fill');
const $evolveTime   = $('evolve-time');
const $evolveLabel  = $('evolve-label');
const $btnShop      = $('btn-shop');
const $btnChicksBtn = $('btn-chicks');
const $btnStats     = $('btn-stats');
const $btnCollect   = $('btn-collect');
const $btnSave      = $('btn-save');
const $btnMenu      = $('btn-menu');
const $btnSound     = $('btn-sound');
const $toast        = $('toast');
const $backdrop     = $('panel-backdrop');
const $gameScene    = $('game-scene');
const $shopBody     = $('shop-body');
const $chicksBody   = $('chicks-body');
const $statsBody    = $('stats-body');
const $collectBody  = $('collect-body');
const $menuSave     = $('menu-save');
const $menuTitle    = $('menu-title');
const $menuReset    = $('menu-reset');
const allPanels     = document.querySelectorAll('.side-panel');
const closeBtns     = document.querySelectorAll('.close-btn');

// ============================================================
// AUDIO
// ============================================================
let audioCtx = null;
function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
}
function playTone(freq, type='sine', dur=0.18, vol=0.16) {
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
function playSeed()    { playTone(880,'sine',.14,.14); }
function playCollect() { playTone(1047,'triangle',.2,.2); setTimeout(()=>playTone(1319,'triangle',.2,.16),80); }
function playUnlock()  { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',.3,.18),i*80)); }
function playEvolve()  { [523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>playTone(f,'triangle',.35,.22),i*90)); }
function playTap()     { playTone(660,'sine',.1,.12); }
function playLocMove() { playTone(440,'triangle',.2,.14); }
function playSave()    { [523,659].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',.2,.14),i*80)); }
function playBuy()     { playTone(784,'sine',.18,.16); }

// ============================================================
// SAVE / LOAD
// ============================================================
const SAVE_KEY = 'fluffyWandererV2';
function saveGame() {
  state.lastSave = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); showToast('💾 저장됐어요!'); playSave(); }
  catch(e) { showToast('❌ 저장 실패'); }
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    state = Object.assign(DEFAULT_STATE(), s);
    state.stats = Object.assign(DEFAULT_STATE().stats, s.stats || {});
    return true;
  } catch(e) { return false; }
}
function hasSave()    { return !!localStorage.getItem(SAVE_KEY); }
function deleteSave() { localStorage.removeItem(SAVE_KEY); }

// ============================================================
// SCREEN
// ============================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ============================================================
// TOAST
// ============================================================
let toastTimer = null;
function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.remove('hidden');
  $toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{
    $toast.classList.remove('show');
    setTimeout(()=>$toast.classList.add('hidden'), 400);
  }, 2400);
}

// ============================================================
// FORMAT
// ============================================================
function fmt(n) {
  n = Math.floor(n);
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1000) return (n/1000).toFixed(1)+'K';
  return String(n);
}
function fmtTime(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const m = Math.floor(sec/60), s = sec%60;
  return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}

// ============================================================
// PANELS
// ============================================================
function openPanel(id) {
  if (id==='panel-shop')    renderShop();
  if (id==='panel-chicks')  renderChicks();
  if (id==='panel-stats')   renderStats();
  if (id==='panel-collect') renderCollect();
  allPanels.forEach(p=>p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  $backdrop.classList.remove('hidden');
}
function closeAllPanels() {
  allPanels.forEach(p=>p.classList.add('hidden'));
  $backdrop.classList.add('hidden');
}
closeBtns.forEach(b=>b.addEventListener('click', closeAllPanels));
$backdrop.addEventListener('click', closeAllPanels);

// ============================================================
// SHOP
// ============================================================
function renderShop() {
  $shopBody.innerHTML = '';

  const seedInfo = document.createElement('div');
  seedInfo.className = 'shop-section-title';
  seedInfo.textContent = `보유 씨앗: 🌱 ${fmt(state.seeds)}`;
  $shopBody.appendChild(seedInfo);

  const upgTitle = document.createElement('div');
  upgTitle.className = 'shop-section-title';
  upgTitle.style.marginTop = '8px';
  upgTitle.textContent = '아이템';
  $shopBody.appendChild(upgTitle);

  SHOP_ITEMS.forEach(item => {
    const owned = state.shopOwned[item.id] || 0;
    const maxed  = item.maxOwn !== undefined && owned >= item.maxOwn;

    const row = document.createElement('div');
    row.className = 'shop-item';

    const icon = document.createElement('div');
    icon.className = 'shop-item-icon';
    icon.textContent = item.icon;

    const info = document.createElement('div');
    info.className = 'shop-item-info';
    info.innerHTML =
      `<div class="shop-item-name">${item.name}${item.maxOwn?` <span style="font-size:10px;color:var(--text-sub)">(${owned}/${item.maxOwn})</span>`:''}</div>
       <div class="shop-item-desc">${item.desc}</div>
       <div class="shop-item-effect">${item.effect}</div>`;

    const btn = document.createElement('button');
    btn.className = 'shop-buy-btn';
    btn.disabled = maxed || state.seeds < item.cost;
    btn.textContent = maxed ? '완료' : `🌱${fmt(item.cost)}`;

    btn.addEventListener('click', ()=>{
      if (state.seeds < item.cost) { showToast('씨앗이 부족해요 🌱'); return; }
      state.seeds -= item.cost;
      state.shopOwned[item.id] = (state.shopOwned[item.id] || 0) + 1;
      item.action(state);
      playBuy();
      showToast(`${item.icon} ${item.name} 구매!`);
      updateSeedDisplay();
      renderShop();
    });

    row.appendChild(icon); row.appendChild(info); row.appendChild(btn);
    $shopBody.appendChild(row);
  });
}

// ============================================================
// CHICKS PANEL
// ============================================================
function renderChicks() {
  $chicksBody.innerHTML = '';

  const info = document.createElement('div');
  info.className = 'shop-section-title';
  const nextIdx = state.unlockedChicks.length;
  const pct = Math.floor(state.evolveProgress * 100);
  info.textContent = nextIdx < CHICK_TYPES.length
    ? `다음 병아리까지 게이지: ${pct}%`
    : '모든 병아리를 해금했어요! 🎉';
  $chicksBody.appendChild(info);

  CHICK_TYPES.forEach((ct, i) => {
    const unlocked = state.unlockedChicks.includes(ct.id);
    const card = document.createElement('div');

    if (unlocked) {
      card.className = 'chick-card' + (state.activeChick===ct.id ? ' pulse' : '');
      card.innerHTML =
        `<div class="chick-card-icon">${ct.emoji}</div>
         <div class="chick-card-info">
           <div class="chick-card-name">${ct.name} ${state.activeChick===ct.id?'✅':''}</div>
           <div class="chick-card-trait">${ct.trait}</div>
           <div class="chick-card-trait" style="color:var(--green2)">씨앗 보너스 ×${ct.seedBonus}</div>
         </div>`;
      card.style.cursor = 'pointer';
      card.addEventListener('click', ()=>{
        state.activeChick = ct.id;
        updateChickEmojis();
        showToast(`${ct.emoji} ${ct.name}으로 변경!`);
        renderChicks();
      });
    } else {
      card.className = 'chick-card-locked';
      card.innerHTML =
        `<div class="chick-lock-icon">${ct.emoji}</div>
         <div class="chick-lock-info">
           <div class="chick-lock-name">???</div>
           <div class="chick-lock-hint">게이지 ${i}번 채우면 해금</div>
         </div>`;
    }
    $chicksBody.appendChild(card);
  });
}

// ============================================================
// STATS PANEL
// ============================================================
function renderStats() {
  const s = state.stats;
  const pm = Math.floor(s.playTime/60);
  $statsBody.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'stats-grid';
  [
    { icon:'🌱', label:'총 씨앗',     value:fmt(Math.floor(state.totalSeeds)) },
    { icon:'⏱️', label:'여행 시간',   value:(pm>=60?(pm/60).toFixed(1)+'h':pm+'m') },
    { icon:'👆', label:'탭 횟수',     value:fmt(s.taps) },
    { icon:'🎁', label:'아이템 수집', value:fmt(s.itemsPicked) },
    { icon:'🗺️', label:'방문 장소',   value:state.unlockedLocs.length+'/'+LOCATIONS.length },
    { icon:'🐣', label:'병아리 종류', value:state.unlockedChicks.length+'/'+CHICK_TYPES.length },
    { icon:'🤖', label:'자동 획득',   value:fmt(s.autoSeeds) },
    { icon:'🎵', label:'들은 노래',   value:state.songs },
  ].forEach(c=>{
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `<h3>${c.icon} ${c.label}</h3><div class="stat-value">${c.value}</div>`;
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
  COLLECTIBLES.forEach(c=>{
    const cnt = state.collected[c.id] || 0;
    const div = document.createElement('div');
    div.className = 'collect-item' + (cnt===0?' locked':'');
    div.innerHTML = `<span>${c.emoji}</span><span class="collect-label">${cnt>0?c.name:'???'}</span>`;
    if (cnt>0) {
      const badge = document.createElement('span');
      badge.className = 'collect-count'; badge.textContent = 'x'+cnt;
      div.appendChild(badge);
    }
    div.title = cnt>0 ? c.hint : '아직 발견 못했어요';
    grid.appendChild(div);
  });
  $collectBody.appendChild(grid);
}

// ============================================================
// LOCATION TABS
// ============================================================
function renderLocTabs() {
  $locTabs.innerHTML = '';
  LOCATIONS.forEach(loc=>{
    const btn = document.createElement('button');
    const locked = !state.unlockedLocs.includes(loc.id);
    btn.className = 'loc-tab' +
      (state.currentLoc===loc.id?' active':'') +
      (locked?' locked':'');
    btn.textContent = loc.emoji + ' ' + loc.name.replace(/^\S+\s/,'');
    btn.title = locked
      ? `🔒 씨앗 ${fmt(loc.unlockSeeds)}개 필요`
      : loc.desc;
    btn.addEventListener('click',()=>{
      if (locked) { showToast(`🔒 씨앗 ${fmt(loc.unlockSeeds)}개가 필요해요`); return; }
      if (state.currentLoc===loc.id) return;
      travelTo(loc.id);
    });
    $locTabs.appendChild(btn);
  });
}

function travelTo(locId) {
  initAudio();
  state.currentLoc = locId;
  if (!state.unlockedLocs.includes(locId)) {
    state.unlockedLocs.push(locId);
    state.stats.locsVisited = state.unlockedLocs.length;
  }
  renderLocTabs();
  applyScene();
  spawnSceneItems();
  spawnParticles();
  playLocMove();
  resetAllChickPaths();
  const loc = LOCATIONS.find(l=>l.id===locId);
  $locName.textContent = loc.name;
  showToast(`${loc.emoji} ${loc.desc}`);
}

// ============================================================
// SCENE
// ============================================================
function applyScene() {
  $sceneBg .setAttribute('data-loc', state.currentLoc);
  $sceneMid.setAttribute('data-loc', state.currentLoc);
}

// ============================================================
// DEPTH / XYZ MOVEMENT SYSTEM
// ============================================================
/*
  We represent the scene as a pseudo-3D stage:
    x-axis → left/right (0-100% of scene width)
    z-axis → depth, mapped to bottom% + scale (far = high bottom%, smaller)
    y-axis is NOT used (no up/down movement for chick)

  Depth zones:
    NEAR:  bottom 10-22%  → scale ~1.0 (big, in front)
    MID:   bottom 22-40%  → scale ~0.7
    FAR:   bottom 40-55%  → scale ~0.45 (small, behind)

  Each chick entity has its own path state based on the location's moveMode.
*/

const DEPTH_NEAR = { minB:10, maxB:22, scaleAt:(b)=>1.0 - (b-10)/12*0.3 };  // 0.7..1.0
const DEPTH_MID  = { minB:22, maxB:40, scaleAt:(b)=>0.7 - (b-22)/18*0.25 }; // 0.45..0.7
const DEPTH_FAR  = { minB:40, maxB:55, scaleAt:(b)=>0.45 - (b-40)/15*0.15};  // 0.3..0.45

function randomDepth() {
  const zones = [DEPTH_NEAR, DEPTH_MID, DEPTH_FAR];
  const zone  = zones[Math.floor(Math.random()*zones.length)];
  return zone.minB + Math.random()*(zone.maxB-zone.minB);
}
function depthToScale(bottom) {
  if (bottom < 22) return DEPTH_NEAR.scaleAt(bottom);
  if (bottom < 40) return DEPTH_MID .scaleAt(bottom);
  return DEPTH_FAR.scaleAt(bottom);
}
function depthToFontSize(bottom) {
  // base 52px at bottom=10, 20px at bottom=55
  return Math.round(52 - (bottom - 10) / 45 * 32);
}
// z-index: nearer = higher
function depthToZ(bottom) {
  return Math.round(100 - bottom);
}

// chick entity objects
const chickEntities = [];
let itemSpawnTimer  = null;

function createChickEntity(chickType) {
  const ct    = CHICK_TYPES.find(c=>c.id===chickType) || CHICK_TYPES[0];
  const el    = document.createElement('div');
  el.className= 'chick-entity';

  const emojiEl  = document.createElement('div');
  emojiEl.className = 'chick-emoji';
  emojiEl.textContent = ct.emoji;

  const shadowEl = document.createElement('div');
  shadowEl.className = 'chick-shadow-e';

  el.appendChild(emojiEl);
  el.appendChild(shadowEl);

  // initial position
  const startX = 10 + Math.random()*70;
  const startB = randomDepth();
  const fs     = depthToFontSize(startB);
  el.style.left       = startX + '%';
  el.style.bottom     = startB + '%';
  el.style.fontSize   = fs + 'px';
  el.style.zIndex     = depthToZ(startB);

  const entity = {
    el, emojiEl, shadowEl,
    chickId: chickType,
    x: startX,  // current x %
    b: startB,  // current bottom %
    // path state
    phase:  Math.random() * Math.PI * 2,
    dir:    Math.random() > 0.5 ? 1 : -1,
    angle:  Math.random() * Math.PI * 2,   // for circle/figure8
    t:      0,
  };

  el.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    initAudio();
    state.stats.taps++;
    const ct2 = CHICK_TYPES.find(c=>c.id===entity.chickId) || CHICK_TYPES[0];
    const bonus = Math.ceil(2 * ct2.seedBonus * (1 + (state.speedBonus||0)) * currentLocRate());
    const rect = el.getBoundingClientRect();
    addSeeds(bonus, rect.left + rect.width/2, rect.top);
    playTap();
    spawnHeart(rect.left + rect.width/2, rect.top);
  });

  $depthStage.appendChild(el);
  chickEntities.push(entity);
  return entity;
}

function updateChickEmojis() {
  const ct = CHICK_TYPES.find(c=>c.id===state.activeChick) || CHICK_TYPES[0];
  chickEntities.forEach(e => {
    e.chickId = state.activeChick;
    e.emojiEl.textContent = ct.emoji;
  });
}

function applyMoveMode(entity) {
  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  const mode = loc ? loc.moveMode : 'wander';
  entity.el.classList.remove('move-wander','move-patrol','move-drift','move-circle','move-figure8');
  entity.el.classList.add('move-'+mode);
}

function resetAllChickPaths() {
  chickEntities.forEach(e => {
    e.phase = Math.random()*Math.PI*2;
    e.dir   = Math.random()>.5?1:-1;
    e.angle = Math.random()*Math.PI*2;
    e.t     = 0;
    applyMoveMode(e);
  });
}

function moveSpeed() {
  return 1 + (state.speedBonus||0);
}
function currentLocRate() {
  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  return loc ? loc.seedRate : 1;
}

// ============================================================
// PER-TICK MOVEMENT
// ============================================================
function tickMove(dt) {
  const loc  = LOCATIONS.find(l=>l.id===state.currentLoc);
  const mode = loc ? loc.moveMode : 'wander';
  const spd  = moveSpeed();

  chickEntities.forEach(entity => {
    entity.t += dt * spd;

    let newX = entity.x;
    let newB = entity.b;

    if (mode === 'wander') {
      if (!entity._wanderNext || entity.t >= entity._wanderNext) {
        entity._wanderX = 5 + Math.random()*85;
        entity._wanderB = randomDepth();
        entity._wanderNext = entity.t + (3 + Math.random()*6) / spd;
      }
      entity.x += (entity._wanderX - entity.x) * dt * 0.8 * spd;
      entity.b += (entity._wanderB - entity.b)  * dt * 0.6 * spd;
      newX = entity.x; newB = entity.b;

    } else if (mode === 'drift') {
      entity.x += entity.dir * dt * 6 * spd;
      entity.b += Math.sin(entity.t * 0.4) * dt * 3 * spd;
      if (entity.x > 90) { entity.x=90; entity.dir=-1; entity._driftDepthTarget=randomDepth(); }
      if (entity.x <  5) { entity.x= 5; entity.dir= 1; entity._driftDepthTarget=randomDepth(); }
      if (entity._driftDepthTarget !== undefined) {
        entity.b += (entity._driftDepthTarget - entity.b) * dt * 0.5;
        if (Math.abs(entity.b - entity._driftDepthTarget) < 0.5) entity._driftDepthTarget = undefined;
      }
      entity.b = Math.max(10, Math.min(55, entity.b));
      newX = entity.x; newB = entity.b;

    } else if (mode === 'patrol') {
      entity.x += entity.dir * dt * 14 * spd;
      if (entity.x > 90) { entity.x=90; entity.dir=-1; entity.b=randomDepth(); }
      if (entity.x <  5) { entity.x= 5; entity.dir= 1; entity.b=randomDepth(); }
      entity.b = Math.max(10, Math.min(55, entity.b));
      newX = entity.x; newB = entity.b;

    } else if (mode === 'circle') {
      entity.angle += dt * 0.6 * spd;
      const cx=45, rx=35;
      const depthCenter=32, depthRange=20;
      newX = cx + rx * Math.cos(entity.angle) + (entity.chickId.charCodeAt(0)%5)*3;
      newB = depthCenter + depthRange/2 * Math.sin(entity.angle);
      newB = Math.max(10, Math.min(55, newB));
      entity.x=newX; entity.b=newB;

    } else if (mode === 'figure8') {
      entity.angle += dt * 0.5 * spd;
      const t = entity.angle;
      newX = 45 + 38 * Math.sin(t);
      newB = 32 + 20 * Math.sin(2*t);
      newB = Math.max(10, Math.min(55, newB));
      entity.x=newX; entity.b=newB;
    }

    const fs = depthToFontSize(newB);
    entity.el.style.left     = newX + '%';
    entity.el.style.bottom   = newB + '%';
    entity.el.style.fontSize = fs + 'px';
    entity.el.style.zIndex   = depthToZ(newB);

    const movingRight = (mode==='patrol'||mode==='drift') && entity.dir > 0;
    entity.emojiEl.style.transform = movingRight ? 'scaleX(-1)' : 'scaleX(1)';
  });
}

// ============================================================
// SCENE ITEMS
// ============================================================
function spawnSceneItems() {
  $sceneItems.innerHTML = '';
  if (itemSpawnTimer) clearInterval(itemSpawnTimer);
  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  if (!loc) return;
  for (let i=0;i<4;i++) spawnOneItem(loc);
  itemSpawnTimer = setInterval(()=>{
    if ($sceneItems.children.length < 7) spawnOneItem(loc);
  }, 3500);
}

function spawnOneItem(loc) {
  const emoji = loc.items[Math.floor(Math.random()*loc.items.length)];
  const el = document.createElement('div');
  el.className = 'scene-item';
  el.textContent = emoji;
  el.style.left   = (5 + Math.random()*85) + '%';
  el.style.bottom = (18 + Math.random()*35) + '%';
  el.style.setProperty('--delay', (Math.random()*2)+'s');
  el.addEventListener('pointerdown', e=>{ e.stopPropagation(); collectItem(el, emoji, e); });
  $sceneItems.appendChild(el);
}

function collectItem(el, emoji, evt) {
  initAudio();
  const rect = el.getBoundingClientRect();
  el.remove();
  const loc    = LOCATIONS.find(l=>l.id===state.currentLoc);
  const reward = Math.ceil(1*(loc?loc.seedRate:1)) + (state.pickBonus||0);
  addSeeds(reward, rect.left, rect.top);
  playCollect();
  const cid = ITEM_TO_COLLECT[emoji];
  if (cid) {
    const lucky = (state.luckyActive||0) > 0;
    if (Math.random() < (lucky ? 0.5 : 0.25)) {
      state.collected[cid] = (state.collected[cid]||0)+1;
      if (state.collected[cid]===1) {
        const c = COLLECTIBLES.find(x=>x.id===cid);
        showToast(`${c.emoji} ${c.name} 처음 발견!`);
        playUnlock();
      }
    }
  }
  if (Math.random() < 0.06) { state.songs++; showToast('🎵 새로운 노래를 들었어요!'); }
  state.stats.itemsPicked++;
}

// ============================================================
// PARTICLES
// ============================================================
function spawnParticles() {
  $particles.innerHTML = '';
  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  if (!loc) return;
  for (let i=0;i<10;i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = loc.particles[Math.floor(Math.random()*loc.particles.length)];
    p.style.left   = Math.random()*90+'%';
    p.style.bottom = Math.random()*50+'%';
    p.style.setProperty('--dur',   (3+Math.random()*5)+'s');
    p.style.setProperty('--delay2',(Math.random()*6)+'s');
    p.style.setProperty('--dx',    (-30+Math.random()*60)+'px');
    $particles.appendChild(p);
  }
}

// ============================================================
// SEEDS
// ============================================================
function addSeeds(amount, x, y) {
  state.seeds      += amount;
  state.totalSeeds += amount;
  updateSeedDisplay();
  checkUnlocks();
  if (x !== undefined) {
    const scRect = $gameScene.getBoundingClientRect();
    const pop = document.createElement('div');
    pop.className = 'coin-pop';
    pop.textContent = '+'+amount+'🌱';
    pop.style.left = (x - scRect.left)+'px';
    pop.style.top  = (y - scRect.top - 20)+'px';
    $gameScene.appendChild(pop);
    setTimeout(()=>pop.remove(), 900);
  }
}

function updateSeedDisplay() { $statSeeds.textContent = fmt(state.seeds); }

function spawnHeart(x, y) {
  const hearts=['💛','✨','🌟','🐥'];
  const pop = document.createElement('div');
  pop.className = 'coin-pop';
  pop.textContent = hearts[Math.floor(Math.random()*hearts.length)];
  const scRect = $gameScene.getBoundingClientRect();
  pop.style.left = (x - scRect.left - 10)+'px';
  pop.style.top  = (y - scRect.top  - 10)+'px';
  $gameScene.appendChild(pop);
  setTimeout(()=>pop.remove(), 900);
}

function checkUnlocks() {
  LOCATIONS.forEach(loc=>{
    if (!state.unlockedLocs.includes(loc.id) && state.totalSeeds >= loc.unlockSeeds) {
      state.unlockedLocs.push(loc.id);
      showToast(`🗺️ 새 장소 해금! ${loc.name}`);
      playUnlock();
      renderLocTabs();
      $statPlaces.textContent = state.unlockedLocs.length;
    }
  });
}

// ============================================================
// EVOLVE GAUGE
// ============================================================
function tickEvolve(dt) {
  const nextIdx = state.unlockedChicks.length;
  if (nextIdx >= CHICK_TYPES.length) {
    $evolveLabel.textContent = '🎉 모든 병아리 해금!';
    $evolveFill.style.width = '100%';
    $evolveTime.textContent = '완료!';
    return;
  }
  state.evolveTotal    += dt;
  state.evolveProgress  = (state.evolveTotal % EVOLVE_INTERVAL) / EVOLVE_INTERVAL;
  $evolveFill.style.width = (state.evolveProgress * 100) + '%';
  const remaining = EVOLVE_INTERVAL - (state.evolveTotal % EVOLVE_INTERVAL);
  $evolveTime.textContent = fmtTime(remaining);
  const nextChick = CHICK_TYPES[nextIdx];
  $evolveLabel.textContent = `${nextChick.emoji} 까지`;
  if (state.evolveTotal >= nextIdx * EVOLVE_INTERVAL + EVOLVE_INTERVAL) {
    if (!state.unlockedChicks.includes(nextChick.id)) {
      state.unlockedChicks.push(nextChick.id);
      $statChicks.textContent = state.unlockedChicks.length;
      showToast(`🎉 새 병아리 해금! ${nextChick.emoji} ${nextChick.name}`);
      playEvolve();
      buildChicks();
    }
  }
}

// ============================================================
// AUTO SEED INCOME  (base: 1 seed / 3min = 1/180 per second)
// ============================================================
function autoSeedRate() {
  return (1 + (state.autoBonus||0)) / 180;
}

// ============================================================
// LUCKY CLOVER
// ============================================================
function tickLucky(dt) {
  if ((state.luckyActive||0) > 0) {
    state.luckyActive -= dt;
    if (state.luckyActive <= 0) { state.luckyActive=0; showToast('🍀 네잎클로버 효과 종료'); }
  }
}

// ============================================================
// MAIN TICK LOOP
// ============================================================
let lastTick = Date.now();
let rafId    = null;

function tick() {
  const now = Date.now();
  const dt  = Math.min((now - lastTick)/1000, 0.5);
  lastTick  = now;

  const autoGain = autoSeedRate() * dt;
  state.seeds      += autoGain;
  state.totalSeeds += autoGain;
  state.stats.autoSeeds += autoGain;
  state.stats.playTime  += dt;

  updateSeedDisplay();
  checkUnlocks();
  updateTimeDisplay();
  tickEvolve(dt);
  tickLucky(dt);
  tickMove(dt);

  rafId = requestAnimationFrame(tick);
}

function updateTimeDisplay() {
  const s  = Math.floor(state.stats.playTime);
  const hh = String(Math.floor(s/3600)).padStart(2,'0');
  const mm = String(Math.floor((s%3600)/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  $timeDisp.textContent = `${hh}:${mm}:${ss}`;
}

// ============================================================
// GAME INIT
// ============================================================
function buildChicks() {
  $depthStage.innerHTML = '';
  chickEntities.length = 0;
  const toShow = state.unlockedChicks.slice(0,6);
  toShow.forEach(cid=>{ const e=createChickEntity(cid); applyMoveMode(e); });
  if (!toShow.includes(state.activeChick)) {
    const e=createChickEntity(state.activeChick); applyMoveMode(e);
  }
  $statChicks.textContent = state.unlockedChicks.length;
}

function startNewGame() { state = DEFAULT_STATE(); startGame(); }

function startGame() {
  if (rafId) cancelAnimationFrame(rafId);
  lastTick = Date.now();
  applyScene();
  renderLocTabs();
  spawnSceneItems();
  spawnParticles();
  buildChicks();
  updateSeedDisplay();
  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  $locName.textContent = loc ? loc.name : '';
  $statPlaces.textContent = state.unlockedLocs.length;
  $btnSound.textContent = state.soundOn ? '🔔' : '🔕';
  showScreen('screen-game');
  rafId = requestAnimationFrame(tick);
  showToast('🐤 안녕! 여행을 시작해요~');
}

// ============================================================
// BUTTON WIRING
// ============================================================
$btnShop    .addEventListener('click',()=>{ initAudio(); openPanel('panel-shop'); });
$btnChicksBtn.addEventListener('click',()=>{ initAudio(); openPanel('panel-chicks'); });
$btnStats   .addEventListener('click',()=>{ initAudio(); openPanel('panel-stats'); });
$btnCollect .addEventListener('click',()=>{ initAudio(); openPanel('panel-collect'); });
$btnSave    .addEventListener('click',()=>{ initAudio(); saveGame(); });
$btnMenu    .addEventListener('click',()=>{ initAudio(); openPanel('panel-menu'); });
$btnSound   .addEventListener('click',()=>{
  initAudio();
  state.soundOn = !state.soundOn;
  $btnSound.textContent = state.soundOn ? '🔔' : '🔕';
  showToast(state.soundOn ? '🔔 소리 켜짐' : '🔕 소리 꺼짐');
});
$menuSave .addEventListener('click',()=>{ saveGame(); closeAllPanels(); });
$menuTitle.addEventListener('click',()=>{
  closeAllPanels();
  if (rafId) cancelAnimationFrame(rafId);
  showScreen('screen-title');
  updateTitleButtons();
});
$menuReset.addEventListener('click',()=>{ closeAllPanels(); $modalNew.classList.remove('hidden'); });

$gameScene.addEventListener('pointerdown',()=>{ initAudio(); });

// ============================================================
// TITLE BUTTONS
// ============================================================
function updateTitleButtons() { $btnCont.disabled = !hasSave(); }

$btnNew.addEventListener('click',()=>{
  initAudio();
  hasSave() ? $modalNew.classList.remove('hidden') : startNewGame();
});
$btnCont.addEventListener('click',()=>{ initAudio(); if(loadGame()) startGame(); });
$btnNewOk.addEventListener('click',()=>{ deleteSave(); $modalNew.classList.add('hidden'); startNewGame(); });
$btnNewCx.addEventListener('click',()=>{ $modalNew.classList.add('hidden'); });

// ============================================================
// AUTO SAVE every 30s
// ============================================================
setInterval(()=>{
  if ($screenGame.classList.contains('active')) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e) {}
  }
}, 30000);

document.addEventListener('visibilitychange',()=>{ if(!document.hidden) lastTick=Date.now(); });

// ============================================================
// BOOT
// ============================================================
updateTitleButtons();
showScreen('screen-title');
    const rect = el.getBoundingClientRect();
    addSeeds(bonus, rect.left + rect.width/2, rect.top);
    playTap();
    spawnHeart(rect.left + rect.width/2, rect.top);
  });

  $depthStage.appendChild(el);
  chickEntities.push(entity);
  return entity;
}

function updateChickEmojis() {
  const ct = CHICK_TYPES.find(c=>c.id===state.activeChick) || CHICK_TYPES[0];
  chickEntities.forEach(e => {
    e.chickId = state.activeChick;
    e.emojiEl.textContent = ct.emoji;
  });
}

function applyMoveMode(entity) {
  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  const mode = loc ? loc.moveMode : 'wander';
  entity.el.classList.remove('move-wander','move-patrol','move-drift','move-circle','move-figure8');
  entity.el.classList.add('move-'+mode);
}

function resetAllChickPaths() {
  chickEntities.forEach(e => {
    e.phase = Math.random()*Math.PI*2;
    e.dir   = Math.random()>.5?1:-1;
    e.angle = Math.random()*Math.PI*2;
    e.t     = 0;
    applyMoveMode(e);
  });
}

// Speed multiplier (1 = normal)
function moveSpeed() {
  return 1 + (state.speedBonus || 0);
}
function currentLocRate() {
  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  return loc ? loc.seedRate : 1;
}

// ============================================================
// PER-TICK MOVEMENT — called in rAF loop
// ============================================================
let lastMoveTick = Date.now();
const MOVE_DT = 1/30; // simulate at 30fps steps

function tickMove(dt) {
  const loc  = LOCATIONS.find(l=>l.id===state.currentLoc);
  const mode = loc ? loc.moveMode : 'wander';
  const spd  = moveSpeed();

  chickEntities.forEach(entity => {
    entity.t += dt * spd;

    let newX = entity.x;
    let newB = entity.b;

    if (mode === 'wander') {
      // Random wander: every few seconds pick new (x,b) target,
      // animate via CSS transition — here we just nudge slowly
      if (!entity._wanderNext || entity.t >= entity._wanderNext) {
        entity._wanderX = 5 + Math.random() * 85;
        entity._wanderB = randomDepth();
        entity._wanderNext = entity.t + (3 + Math.random() * 6) / spd;
      }
      // lerp toward target
      entity.x += (entity._wanderX - entity.x) * dt * 0.8 * spd;
      entity.b += (entity._wanderB - entity.b) * dt * 0.6 * spd;
      newX = entity.x; newB = entity.b;

    } else if (mode === 'drift') {
      // Slow drift: glide across with gentle depth sway
      entity.x += entity.dir * dt * 6 * spd;
      entity.b += Math.sin(entity.t * 0.4) * dt * 3 * spd;
      if (entity.x > 90) { entity.x = 90; entity.dir = -1; entity._driftDepthTarget = randomDepth(); }
      if (entity.x <  5) { entity.x =  5; entity.dir =  1; entity._driftDepthTarget = randomDepth(); }
      if (entity._driftDepthTarget !== undefined) {
        entity.b += (entity._driftDepthTarget - entity.b) * dt * 0.5;
        if (Math.abs(entity.b - entity._driftDepthTarget) < 0.5) entity._driftDepthTarget = undefined;
      }
      entity.b = Math.max(10, Math.min(55, entity.b));
      newX = entity.x; newB = entity.b;

    } else if (mode === 'patrol') {
      // Patrol: march left/right, change depth at each turn
      entity.x += entity.dir * dt * 14 * spd;
      if (entity.x > 90) { entity.x = 90; entity.dir = -1; entity.b = randomDepth(); }
      if (entity.x <  5) { entity.x =  5; entity.dir =  1; entity.b = randomDepth(); }
      entity.b = Math.max(10, Math.min(55, entity.b));
      newX = entity.x; newB = entity.b;

    } else if (mode === 'circle') {
      // Circle: orbit around center with depth oscillation
      entity.angle += dt * 0.6 * spd;
      const cx = 45, rx = 35;
      // depth: oscillates between near and far based on angle
      const depthRange = 20; // total swing in bottom%
      const depthCenter= 32;
      newX = cx + rx * Math.cos(entity.angle) + (entity.chickId.charCodeAt(0)%5)*3;
      newB = depthCenter + depthRange/2 * Math.sin(entity.angle);
      newB = Math.max(10, Math.min(55, newB));
      entity.x = newX; entity.b = newB;

    } else if (mode === 'figure8') {
      // Figure-8: full front/back depth usage
      entity.angle += dt * 0.5 * spd;
      const t = entity.angle;
      // Lissajous-like figure-8
      newX = 45 + 38 * Math.sin(t);
      newB = 32 + 20 * Math.sin(2*t);  // twice the frequency → figure 8 in depth
      newB = Math.max(10, Math.min(55, newB));
      entity.x = newX; entity.b = newB;
    }

    // Apply to DOM
    const fs = depthToFontSize(newB);
    entity.el.style.left     = newX + '%';
    entity.el.style.bottom   = newB + '%';
    entity.el.style.fontSize = fs + 'px';
    entity.el.style.zIndex   = depthToZ(newB);

    // flip emoji horizontally based on x movement direction
    const movingRight = (mode==='patrol'||mode==='drift') && entity.dir > 0;
    entity.emojiEl.style.transform = movingRight ? 'scaleX(-1)' : 'scaleX(1)';
  });
}

// ============================================================
// SCENE ITEMS
// ============================================================
function spawnSceneItems() {
  $sceneItems.innerHTML = '';
  if (itemSpawnTimer) clearInterval(itemSpawnTimer);
  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  if (!loc) return;
  for (let i=0;i<4;i++) spawnOneItem(loc);
  itemSpawnTimer = setInterval(()=>{
    if ($sceneItems.children.length < 7) spawnOneItem(loc);
  }, 3500);
}

function spawnOneItem(loc) {
  const emoji = loc.items[Math.floor(Math.random()*loc.items.length)];
  const el = document.createElement('div');
  el.className = 'scene-item';
  el.textContent = emoji;
  el.style.left   = (5 + Math.random()*85) + '%';
  el.style.bottom = (18 + Math.random()*35) + '%';
  el.style.setProperty('--delay', (Math.random()*2)+'s');
  el.addEventListener('pointerdown', e => { e.stopPropagation(); collectItem(el, emoji, e); });
  $sceneItems.appendChild(el);
}

function collectItem(el, emoji, evt) {
  initAudio();
  const rect = el.getBoundingClientRect();
  el.remove();

  const loc    = LOCATIONS.find(l=>l.id===state.currentLoc);
  const reward = Math.ceil(1 * (loc?loc.seedRate:1)) + (state.pickBonus||0);
  addSeeds(reward, rect.left, rect.top);
  playCollect();

  const cid = ITEM_TO_COLLECT[emoji];
  if (cid) {
    const lucky = (state.luckyActive||0) > 0;
    const chance = lucky ? 0.5 : 0.25;
    if (Math.random() < chance) {
      state.collected[cid] = (state.collected[cid]||0)+1;
      if (state.collected[cid]===1) {
        const c = COLLECTIBLES.find(x=>x.id===cid);
        showToast(`${c.emoji} ${c.name} 처음 발견!`);
        playUnlock();
      }
    }
  }
  if (Math.random() < 0.06) {
    state.songs++;
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
  for (let i=0;i<10;i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = loc.particles[Math.floor(Math.random()*loc.particles.length)];
    p.style.left   = Math.random()*90+'%';
    p.style.bottom = Math.random()*50+'%';
    p.style.setProperty('--dur',   (3+Math.random()*5)+'s');
    p.style.setProperty('--delay2',(Math.random()*6)+'s');
    p.style.setProperty('--dx',    (-30+Math.random()*60)+'px');
    $particles.appendChild(p);
  }
}

// ============================================================
// SEEDS
// ============================================================
function addSeeds(amount, x, y) {
  state.seeds      += amount;
  state.totalSeeds += amount;
  updateSeedDisplay();
  checkUnlocks();
  if (x !== undefined) {
    const scRect = $gameScene.getBoundingClientRect();
    const pop = document.createElement('div');
    pop.className = 'coin-pop';
    pop.textContent = '+' + amount + '🌱';
    pop.style.left = (x - scRect.left) + 'px';
    pop.style.top  = (y - scRect.top - 20) + 'px';
    $gameScene.appendChild(pop);
    setTimeout(()=>pop.remove(), 900);
  }
}

function updateSeedDisplay() {
  $statSeeds.textContent = fmt(state.seeds);
}

function spawnHeart(x, y) {
  const hearts=['💛','✨','🌟','🐥'];
  const pop = document.createElement('div');
  pop.className = 'coin-pop';
  pop.textContent = hearts[Math.floor(Math.random()*hearts.length)];
  const scRect = $gameScene.getBoundingClientRect();
  pop.style.left = (x - scRect.left - 10) + 'px';
  pop.style.top  = (y - scRect.top  - 10) + 'px';
  $gameScene.appendChild(pop);
  setTimeout(()=>pop.remove(), 900);
}

function checkUnlocks() {
  LOCATIONS.forEach(loc=>{
    if (!state.unlockedLocs.includes(loc.id) && state.totalSeeds >= loc.unlockSeeds) {
      state.unlockedLocs.push(loc.id);
      showToast(`🗺️ 새 장소 해금! ${loc.name}`);
      playUnlock();
      renderLocTabs();
      $statPlaces.textContent = state.unlockedLocs.length;
    }
  });
}

// ============================================================
// EVOLVE GAUGE
// ============================================================
function tickEvolve(dt) {
  const nextIdx = state.unlockedChicks.length;
  if (nextIdx >= CHICK_TYPES.length) {
    $evolveLabel.textContent = '🎉 모든 병아리 해금!';
    $evolveFill.style.width = '100%';
    $evolveTime.textContent = '완료!';
    return;
  }

  state.evolveTotal     += dt;
  state.evolveProgress  = (state.evolveTotal % EVOLVE_INTERVAL) / EVOLVE_INTERVAL;

  // update UI
  $evolveFill.style.width = (state.evolveProgress * 100) + '%';
  const remaining = EVOLVE_INTERVAL - (state.evolveTotal % EVOLVE_INTERVAL);
  $evolveTime.textContent = fmtTime(remaining);

  const nextChick = CHICK_TYPES[nextIdx];
  $evolveLabel.textContent = `${nextChick.emoji} 까지`;

  // Check threshold
  if (state.evolveTotal >= nextIdx * EVOLVE_INTERVAL) {
    const already = state.unlockedChicks.includes(nextChick.id);
    if (!already) {
      state.unlockedChicks.push(nextChick.id);
      $statChicks.textContent = state.unlockedChicks.length;
      showToast(`🎉 새 병아리 해금! ${nextChick.emoji} ${nextChick.name}`);
      playEvolve();
    }
  }
}

// ============================================================
// AUTO SEED INCOME
// ============================================================
/*
  Base: 1 seed per 3 minutes = 1/180 per second ≈ 0.00556/s
  Each autoplus upgrade adds +1 to autoBonus → doubles effectively adds stacks
  So total auto rate = (1 + autoBonus) / 180 seeds/sec
*/
function autoSeedRate() {
  return (1 + (state.autoBonus||0)) / 180;
}

// ============================================================
// LUCKY CLOVER TIMER
// ============================================================
function tickLucky(dt) {
  if ((state.luckyActive||0) > 0) {
    state.luckyActive -= dt;
    if (state.luckyActive <= 0) {
      state.luckyActive = 0;
      showToast('🍀 네잎클로버 효과 종료');
    }
  }
}

// ============================================================
// MAIN TICK LOOP
// ============================================================
let lastTick = Date.now();
let rafId    = null;

function tick() {
  const now = Date.now();
  const dt  = Math.min((now - lastTick) / 1000, 0.5); // cap at 0.5s
  lastTick  = now;

  // Auto seeds
  const autoGain = autoSeedRate() * dt;
  state.seeds      += autoGain;
  state.totalSeeds += autoGain;
  state.stats.autoSeeds += autoGain;
  state.stats.playTime  += dt;

  updateSeedDisplay();
  checkUnlocks();
  updateTimeDisplay();
  tickEvolve(dt);
  tickLucky(dt);
  tickMove(dt);

  rafId = requestAnimationFrame(tick);
}

function updateTimeDisplay() {
  const s  = Math.floor(state.stats.playTime);
  const hh = String(Math.floor(s/3600)).padStart(2,'0');
  const mm = String(Math.floor((s%3600)/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  $timeDisp.textContent = `${hh}:${mm}:${ss}`;
}

// ============================================================
// GAME INIT
// ============================================================
function buildChicks() {
  $depthStage.innerHTML = '';
  chickEntities.length = 0;
  // One entity per unlocked chick type, but cap at 6 for performance
  const toShow = state.unlockedChicks.slice(0, 6);
  toShow.forEach(cid => {
    const entity = createChickEntity(cid);
    applyMoveMode(entity);
  });
  // active chick always present
  if (!toShow.includes(state.activeChick)) {
    const entity = createChickEntity(state.activeChick);
    applyMoveMode(entity);
  }
  $statChicks.textContent = state.unlockedChicks.length;
}

function startNewGame() {
  state = DEFAULT_STATE();
  startGame();
}

function startGame() {
  if (rafId) cancelAnimationFrame(rafId);
  lastTick = Date.now();

  applyScene();
  renderLocTabs();
  spawnSceneItems();
  spawnParticles();
  buildChicks();
  updateSeedDisplay();

  const loc = LOCATIONS.find(l=>l.id===state.currentLoc);
  $locName.textContent = loc ? loc.name : '';
  $statPlaces.textContent = state.unlockedLocs.length;
  $btnSound.textContent = state.soundOn ? '🔔' : '🔕';

  showScreen('screen-game');
  rafId = requestAnimationFrame(tick);
  showToast('🐤 안녕! 여행을 시작해요~');
}

// ============================================================
// BUTTON WIRING
// ============================================================
$btnShop    .addEventListener('click',()=>{ initAudio(); openPanel('panel-shop'); });
$btnChicksBtn.addEventListener('click',()=>{ initAudio(); openPanel('panel-chicks'); });
$btnStats   .addEventListener('click',()=>{ initAudio(); openPanel('panel-stats'); });
$btnCollect .addEventListener('click',()=>{ initAudio(); openPanel('panel-collect'); });
$btnSave    .addEventListener('click',()=>{ initAudio(); saveGame(); });
$btnMenu    .addEventListener('click',()=>{ initAudio(); openPanel('panel-menu'); });
$btnSound   .addEventListener('click',()=>{
  initAudio();
  state.soundOn = !state.soundOn;
  $btnSound.textContent = state.soundOn ? '🔔' : '🔕';
  showToast(state.soundOn ? '🔔 소리 켜짐' : '🔕 소리 꺼짐');
});
$menuSave .addEventListener('click',()=>{ saveGame(); closeAllPanels(); });
$menuTitle.addEventListener('click',()=>{
  closeAllPanels();
  if (rafId) cancelAnimationFrame(rafId);
  showScreen('screen-title');
  updateTitleButtons();
});
$menuReset.addEventListener('click',()=>{ closeAllPanels(); $modalNew.classList.remove('hidden'); });

// Scene tap → nudge all chicks
$gameScene.addEventListener('pointerdown',()=>{ initAudio(); });

// ============================================================
// TITLE BUTTONS
// ============================================================
function updateTitleButtons() { $btnCont.disabled = !hasSave(); }

$btnNew.addEventListener('click',()=>{
  initAudio();
  hasSave() ? $modalNew.classList.remove('hidden') : startNewGame();
});
$btnCont.addEventListener('click',()=>{
  initAudio();
  if (loadGame()) startGame();
});
$btnNewOk.addEventListener('click',()=>{
  deleteSave(); $modalNew.classList.add('hidden'); startNewGame();
});
$btnNewCx.addEventListener('click',()=>{ $modalNew.classList.add('hidden'); });

// ============================================================
// AUTO SAVE every 30s
// ============================================================
setInterval(()=>{
  if ($screenGame.classList.contains('active')) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e) {}
  }
}, 30000);

// ============================================================
// VISIBILITY CHANGE
// ============================================================
document.addEventListener('visibilitychange',()=>{
  if (!document.hidden) lastTick = Date.now();
});

// ============================================================
// BOOT
// ============================================================
updateTitleButtons();
showScreen('screen-title');
