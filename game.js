/* ==========================================
   FLUFFY WANDERER v2 — game.js
   🐤 병아리의 한가로운 여행
   ========================================== */
'use strict';
document.addEventListener('DOMContentLoaded', function() {

/* ---- 동물 종류 (랜덤 해금) ---- */
const ANIMAL_TYPES = [
  { id:'chick',    emoji:'🐤', name:'병아리',     trait:'자유롭게 돌아다녀요',     seedBonus:1.0 },
  { id:'hatching', emoji:'🐣', name:'부화 중 알',  trait:'느긋하게 움직여요',       seedBonus:1.1 },
  { id:'baby',     emoji:'🐥', name:'노란 아기새', trait:'아주 빠르게 뛰어다녀요',  seedBonus:1.2 },
  { id:'duckling', emoji:'🦆', name:'아기 오리',   trait:'물 위를 미끄러져요',      seedBonus:1.3 },
  { id:'rabbit',   emoji:'🐰', name:'토끼',        trait:'깡충깡충 뛰어다녀요',     seedBonus:1.4 },
  { id:'hamster',  emoji:'🐹', name:'햄스터',      trait:'총총총 바쁘게 달려요',    seedBonus:1.5 },
  { id:'cat',      emoji:'🐱', name:'고양이',      trait:'우아하게 거닐어요',       seedBonus:1.6 },
  { id:'dog',      emoji:'🐶', name:'강아지',      trait:'신나게 뛰어다녀요',       seedBonus:1.7 },
  { id:'raccoon',  emoji:'🦝', name:'라쿤',        trait:'요리조리 탐험해요',       seedBonus:1.8 },
  { id:'fox',      emoji:'🦊', name:'여우',        trait:'살금살금 걸어요',         seedBonus:2.0 },
  { id:'frog',     emoji:'🐸', name:'개구리',      trait:'폴짝폴짝 뛰어요',        seedBonus:2.2 },
  { id:'penguin',  emoji:'🐧', name:'펭귄',        trait:'뒤뚱뒤뚱 걸어요',        seedBonus:2.4 },
  { id:'owl',      emoji:'🦉', name:'부엉이',      trait:'천천히 날아다녀요',       seedBonus:2.6 },
  { id:'parrot',   emoji:'🦜', name:'앵무새',      trait:'이리저리 날아다녀요',     seedBonus:2.8 },
  { id:'flamingo', emoji:'🦩', name:'플라밍고',    trait:'우아하게 유영해요',       seedBonus:3.2 },
  { id:'capybara', emoji:'🦫', name:'카피바라',    trait:'여유롭게 거닐어요',       seedBonus:3.5 },
  { id:'panda',    emoji:'🐼', name:'판다',        trait:'뒹굴뒹굴 놀아요',        seedBonus:4.0 },
  { id:'phoenix',  emoji:'🐦‍🔥', name:'불사조',   trait:'불꽃처럼 날아다녀요',     seedBonus:5.0 },
];

const EVOLVE_INTERVAL = 6 * 60; // 6분마다 게이지 1회

const LOCATIONS = [
  { id:'field',  name:'🌾 들판',   emoji:'🌾', unlockSeeds:0,     items:['🌸','🌼','🍀','🌿','🌱','🦋','🌻'], particles:['🍃','✨','🌸'], seedRate:1.0, desc:'따사로운 햇살 아래 넓은 들판' },
  { id:'lake',   name:'💧 연못',   emoji:'💧', unlockSeeds:300,   items:['🪷','🌊','🐟','🐚','🪸','💎'],      particles:['💧','🫧','✨'], seedRate:1.6, desc:'반짝이는 연못가에서 쉬는 시간' },
  { id:'forest', name:'🌲 숲',     emoji:'🌲', unlockSeeds:1200,  items:['🍄','🌰','🍂','🐞','🍁','🌿'],     particles:['🍃','🌿','✨'], seedRate:2.2, desc:'조용하고 신비로운 숲 속' },
  { id:'sunset', name:'🌅 노을',   emoji:'🌅', unlockSeeds:5000,  items:['☁️','🌟','🎑','🌸','✨'],          particles:['✨','🌟','🧡'], seedRate:3.0, desc:'온 세상이 주황빛으로 물드는 시간' },
  { id:'night',  name:'🌙 밤하늘', emoji:'🌙', unlockSeeds:20000, items:['⭐','🌠','🔮','🫧','🌌','💜'],      particles:['⭐','✨','🌙'], seedRate:4.2, desc:'별이 쏟아지는 고요한 밤' },
];

const SHOP_ITEMS = [
  { id:'speedup',      icon:'💨', name:'바람개비',      desc:'동물이 더 활발하게 움직여요',  effect:'이동 속도 +20%',           cost:30,  type:'upgrade', maxOwn:5, action:(s)=>{ s.speedBonus=(s.speedBonus||0)+0.2; } },
  { id:'autoplus',     icon:'⚙️', name:'자동 수확기',   desc:'자동 씨앗 획득 주기 단축',     effect:'씨앗 주기 -15초 (중복가능)',cost:100,  type:'upgrade', maxOwn:5, action:(s)=>{ s.autoBonus=(s.autoBonus||0)+1; } },
  { id:'gauge_boost',  icon:'⚡', name:'게이지 가속제', desc:'동물 해금 게이지 즉시 증가',   effect:'게이지 +10% 즉시',          cost:120, type:'consume',           action:(s)=>{ s.evolveGauge=Math.min(0.99,(s.evolveGauge||0)+0.1); } },
  { id:'lucky_clover', icon:'🍀', name:'네잎클로버',    desc:'수집품 드롭 확률 2배!',        effect:'수집 확률 ×2 (120초)',      cost:160, type:'consume',           action:(s)=>{ s.luckyActive=(s.luckyActive||0)+120; } },
  { id:'magnet',       icon:'🧲', name:'씨앗 자석',     desc:'아이템 터치 보너스 씨앗 추가', effect:'아이템 씨앗 +1',            cost:200, type:'upgrade', maxOwn:5, action:(s)=>{ s.pickBonus=(s.pickBonus||0)+1; } },
  { id:'party_hat',    icon:'🎩', name:'파티 모자',      desc:'씨앗 보너스 10% 증가',        effect:'씨앗 보너스 +10% (영구)',   cost:350, type:'upgrade', maxOwn:3, action:(s)=>{ s.partyBonus=(s.partyBonus||0)+0.1; } },
  { id:'rainbow',      icon:'🌈', name:'무지개 다리',    desc:'특별한 파티클이 생겨요',      effect:'파티클 효과 강화 (영구)',   cost:30, type:'upgrade', maxOwn:1, action:(s)=>{ s.rainbowActive=true; } },
];

const COLLECTIBLES = [
  { id:'daisy',    emoji:'🌼', name:'데이지',     hint:'들판' },
  { id:'clover',   emoji:'🍀', name:'네잎클로버', hint:'들판' },
  { id:'butterfly',emoji:'🦋', name:'나비',       hint:'들판' },
  { id:'lotus',    emoji:'🪷', name:'연꽃',       hint:'연못' },
  { id:'shell',    emoji:'🐚', name:'조개껍질',   hint:'연못' },
  { id:'gem',      emoji:'💎', name:'보석',       hint:'연못' },
  { id:'mushroom', emoji:'🍄', name:'버섯',       hint:'숲' },
  { id:'acorn',    emoji:'🌰', name:'도토리',     hint:'숲' },
  { id:'star',     emoji:'🌟', name:'별',         hint:'노을/밤' },
  { id:'comet',    emoji:'🌠', name:'유성',       hint:'밤하늘' },
  { id:'orb',      emoji:'🔮', name:'신비의 구슬',hint:'밤하늘' },
];
const ITEM_TO_COLLECT = {
  '🌼':'daisy','🍀':'clover','🦋':'butterfly',
  '🪷':'lotus','🐚':'shell','💎':'gem',
  '🍄':'mushroom','🌰':'acorn',
  '🌟':'star','🌠':'comet','🔮':'orb'
};

/* BGM 멜로디 목록 — 장소별 여러 곡 */
const BGM_SONGS = {
  field: [
    { name:'봄날의 산책', notes:[523,587,659,698,784,698,659,587,523,587,659,784,880,784,659,523] },
    { name:'민들레 왈츠', notes:[659,698,659,587,659,698,784,784,698,659,698,659,587,523,523,523] },
    { name:'풀밭 소나타', notes:[523,659,784,1047,784,659,523,392,440,523,659,784,659,523,440,392] },
  ],
  lake: [
    { name:'물결 이야기', notes:[440,494,523,587,523,494,440,392,440,523,587,659,587,523,440,392] },
    { name:'수련 왈츠',   notes:[392,440,523,440,392,349,392,440,523,587,523,440,392,349,330,349] },
    { name:'잔물결',      notes:[523,494,440,392,440,494,523,587,659,587,523,494,440,392,440,523] },
  ],
  forest: [
    { name:'숲의 속삭임', notes:[392,440,494,523,440,392,349,392,440,494,523,587,523,494,440,392] },
    { name:'나뭇잎 춤',   notes:[330,370,392,440,392,370,330,294,330,370,392,440,494,440,392,330] },
    { name:'도토리 노래', notes:[440,392,349,330,349,392,440,494,523,494,440,392,349,330,294,330] },
  ],
  sunset: [
    { name:'노을 세레나데',notes:[349,392,440,523,587,523,440,392,349,440,523,587,659,587,523,440] },
    { name:'황혼의 왈츠', notes:[523,587,659,587,523,440,392,440,523,587,659,698,659,587,523,494] },
    { name:'붉은 하늘',   notes:[392,440,523,587,523,440,392,349,330,392,440,523,587,523,440,392] },
  ],
  night: [
    { name:'별빛 자장가', notes:[262,294,330,349,294,262,247,262,294,330,349,392,349,330,294,262] },
    { name:'달빛 소나타', notes:[220,247,262,294,262,247,220,196,220,247,262,294,330,294,262,247] },
    { name:'은하수 왈츠', notes:[294,330,349,392,349,330,294,262,294,330,349,392,440,392,349,330] },
  ],
};
const BGM_TEMPO = 420;

const DEFAULT_STATE = () => ({
  seeds:0, totalSeeds:0,
  currentLoc:'field', unlockedLocs:['field'],
  collected:{}, shopOwned:{},
  autoBonus:0, speedBonus:0, pickBonus:0, luckyActive:0,
  partyBonus:0, rainbowActive:false,
  unlockedAnimals:['chick'],
  /* 각 씬에 배치된 동물 목록 (id 배열) — 최대 8마리 */
  sceneAnimals:['chick'],
  evolveGauge:0,
  evolveProgress:0,
  currentBgmIdx:0,  // 현재 장소에서 선택된 곡 번호
  stats:{ playTime:0, taps:0, itemsPicked:0, locsVisited:1, autoSeeds:0 },
  soundOn:true, bgmOn:true, songs:0, lastSave:null,
});
let state = DEFAULT_STATE();

const SAVE_KEY = 'fluffyWandererV3';
const $ = id => document.getElementById(id);

/* DOM refs */
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

/* ===================== AUDIO ===================== */
let audioCtx = null;
let bgmInterval = null;
let bgmNoteIdx = 0;

function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
}
function playTone(freq, type, dur, vol) {
  if (!state.soundOn || !audioCtx) return;
  type=type||'sine'; dur=dur||0.18; vol=vol||0.15;
  try {
    var osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type=type; osc.frequency.value=freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+dur);
    osc.start(); osc.stop(audioCtx.currentTime+dur);
  } catch(e) {}
}

function currentBgmSong() {
  var songs = BGM_SONGS[state.currentLoc] || BGM_SONGS.field;
  var idx = (state.currentBgmIdx||0) % songs.length;
  return songs[idx];
}
function startBGM() {
  stopBGM();
  if (!state.bgmOn || !audioCtx) return;
  var song = currentBgmSong();
  bgmNoteIdx = 0;
  function playNext() {
    if (!state.bgmOn || !audioCtx) return;
    var freq = song.notes[bgmNoteIdx % song.notes.length];
    try {
      var osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
      var dur=BGM_TEMPO/1000*0.72;
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type='sine'; osc.frequency.value=freq;
      gain.gain.setValueAtTime(0.0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.055, audioCtx.currentTime+0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+dur);
      osc.start(); osc.stop(audioCtx.currentTime+dur);
    } catch(e) {}
    bgmNoteIdx++;
    if (bgmNoteIdx >= song.notes.length) {
      bgmNoteIdx = 0;
      // 곡이 끝나면 자동으로 다음 곡 재생
      var songs = BGM_SONGS[state.currentLoc] || BGM_SONGS.field;
      state.currentBgmIdx = ((state.currentBgmIdx||0) + 1) % songs.length;
      song = currentBgmSong();
      state.songs = (state.songs||0) + 1;
    }
  }
  playNext();
  bgmInterval = setInterval(playNext, BGM_TEMPO);
}
function stopBGM() {
  if (bgmInterval) { clearInterval(bgmInterval); bgmInterval = null; }
}
function playCollect(){ playTone(1047,'triangle',.2,.18); setTimeout(function(){playTone(1319,'triangle',.18,.14);},80); }
function playUnlock() { [523,659,784,1047].forEach(function(f,i){setTimeout(function(){playTone(f,'sine',.3,.17);},i*80);}); }
function playEvolve() { [523,659,784,1047,1319].forEach(function(f,i){setTimeout(function(){playTone(f,'triangle',.35,.2);},i*90);}); }
function playAnimalSound() {
  if (!state.soundOn || !audioCtx) return;
  var notes=[659,698,784,880,988];
  var f=notes[Math.floor(Math.random()*notes.length)];
  playTone(f,'triangle',0.08,0.17);
  setTimeout(function(){playTone(f*1.18,'triangle',0.06,0.11);},65);
}
function playLocMove(){ playTone(440,'triangle',.2,.13); }
function playSave()   { [523,659].forEach(function(f,i){setTimeout(function(){playTone(f,'sine',.2,.13);},i*80);}); }
function playBuy()    { playTone(784,'sine',.18,.15); }

/* ===================== SAVE / LOAD ===================== */
function saveGame() {
  state.lastSave = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); showToast('💾 저장됐어요!'); playSave(); }
  catch(e) { showToast('❌ 저장 실패'); }
}
function loadGame() {
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    var s = JSON.parse(raw);
    state = Object.assign(DEFAULT_STATE(), s);
    state.stats = Object.assign(DEFAULT_STATE().stats, s.stats||{});
    if (!state.sceneAnimals || state.sceneAnimals.length === 0)
      state.sceneAnimals = state.unlockedAnimals.slice(0,1);
    return true;
  } catch(e) { return false; }
}
function hasSave()    { return !!localStorage.getItem(SAVE_KEY); }
function deleteSave() { localStorage.removeItem(SAVE_KEY); }

/* ===================== SCREEN ===================== */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}

/* ===================== TOAST ===================== */
var toastTimer = null;
function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.remove('hidden'); $toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){
    $toast.classList.remove('show');
    setTimeout(function(){ $toast.classList.add('hidden'); }, 400);
  }, 2600);
}

/* ===================== FORMAT ===================== */
function fmt(n) {
  n = Math.floor(n);
  if (n>=1e6) return (n/1e6).toFixed(1)+'M';
  if (n>=1000) return (n/1000).toFixed(1)+'K';
  return String(n);
}
function fmtTime(sec) {
  sec = Math.max(0, Math.ceil(sec));
  return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
}

/* ===================== PANELS ===================== */
function openPanel(id) {
  if (id==='panel-shop')    renderShop();
  if (id==='panel-chicks')  renderChicks();
  if (id==='panel-stats')   renderStats();
  if (id==='panel-collect') renderCollect();
  allPanels.forEach(function(p){ p.classList.add('hidden'); });
  document.getElementById(id).classList.remove('hidden');
  $backdrop.classList.remove('hidden');
}
function closeAllPanels() {
  allPanels.forEach(function(p){ p.classList.add('hidden'); });
  $backdrop.classList.add('hidden');
}
closeBtns.forEach(function(b){ b.addEventListener('click', closeAllPanels); });
$backdrop.addEventListener('click', closeAllPanels);

/* ===================== SHOP ===================== */
function renderShop() {
  $shopBody.innerHTML = '';
  var seedInfo = document.createElement('div');
  seedInfo.className = 'shop-section-title';
  seedInfo.textContent = '보유 씨앗: 🌱 ' + fmt(state.seeds);
  $shopBody.appendChild(seedInfo);
  SHOP_ITEMS.forEach(function(item) {
    var owned = state.shopOwned[item.id]||0;
    var maxed = item.maxOwn !== undefined && owned >= item.maxOwn;
    var row=document.createElement('div'); row.className='shop-item';
    var icon=document.createElement('div'); icon.className='shop-item-icon'; icon.textContent=item.icon;
    var info=document.createElement('div'); info.className='shop-item-info';
    info.innerHTML='<div class="shop-item-name">'+item.name+(item.maxOwn?' <span style="font-size:10px;color:var(--text-sub)">('+owned+'/'+item.maxOwn+')</span>':'')+'</div>'
      +'<div class="shop-item-desc">'+item.desc+'</div>'
      +'<div class="shop-item-effect">'+item.effect+'</div>';
    var btn=document.createElement('button'); btn.className='shop-buy-btn';
    btn.disabled = maxed || state.seeds < item.cost;
    btn.textContent = maxed ? '완료' : '🌱'+fmt(item.cost);
    btn.addEventListener('click', function() {
      if (state.seeds < item.cost) { showToast('씨앗이 부족해요 🌱'); return; }
      state.seeds -= item.cost;
      state.shopOwned[item.id] = (state.shopOwned[item.id]||0)+1;
      item.action(state);
      playBuy(); showToast(item.icon+' '+item.name+' 구매!');
      updateSeedDisplay(); renderShop();
    });
    row.appendChild(icon); row.appendChild(info); row.appendChild(btn);
    $shopBody.appendChild(row);
  });
}

/* ===================== CHICKS / ANIMALS PANEL ===================== */
function renderChicks() {
  $chicksBody.innerHTML = '';
  var nextIdx = state.unlockedAnimals.length;
  var pct = Math.floor((state.evolveGauge||0)*100);

  /* 상단: 게이지 정보 */
  var info=document.createElement('div'); info.className='shop-section-title';
  info.textContent = nextIdx < ANIMAL_TYPES.length
    ? '다음 동물까지 게이지: '+pct+'%'
    : '모든 동물을 해금했어요! 🎉';
  $chicksBody.appendChild(info);

  /* BGM 선택 UI */
  var bgmSection = document.createElement('div');
  bgmSection.className='shop-section-title'; bgmSection.style.marginTop='12px';
  bgmSection.textContent='🎵 배경음악';
  $chicksBody.appendChild(bgmSection);

  var bgmWrap = document.createElement('div'); bgmWrap.className='bgm-selector';
  var songs = BGM_SONGS[state.currentLoc] || BGM_SONGS.field;
  songs.forEach(function(song, i) {
    var btn = document.createElement('button');
    btn.className='bgm-btn' + (i===(state.currentBgmIdx||0)?' active':'');
    btn.textContent = (i===(state.currentBgmIdx||0)?'▶ ':'')+song.name;
    btn.addEventListener('click', function() {
      state.currentBgmIdx = i;
      startBGM();
      renderChicks();
    });
    bgmWrap.appendChild(btn);
  });
  $chicksBody.appendChild(bgmWrap);

  /* BGM ON/OFF */
  var bgmToggleWrap = document.createElement('div'); bgmToggleWrap.style.marginTop='8px';
  var bgmToggle = document.createElement('button');
  bgmToggle.className='menu-item';
  bgmToggle.textContent = state.bgmOn ? '🎵 배경음악 끄기' : '🎵 배경음악 켜기';
  bgmToggle.addEventListener('click', function() {
    state.bgmOn = !state.bgmOn;
    if (state.bgmOn) { startBGM(); } else { stopBGM(); }
    renderChicks();
  });
  bgmToggleWrap.appendChild(bgmToggle);
  $chicksBody.appendChild(bgmToggleWrap);

  /* 동물 목록 */
  var animalTitle = document.createElement('div');
  animalTitle.className='shop-section-title'; animalTitle.style.marginTop='12px';
  animalTitle.textContent='🐾 해금된 동물 (' + state.unlockedAnimals.length + '/' + ANIMAL_TYPES.length + ')';
  $chicksBody.appendChild(animalTitle);

  /* 씬에 있는 동물 표시 안내 */
  var sceneNote = document.createElement('div');
  sceneNote.style.cssText='font-size:11px;color:var(--text-sub);margin-bottom:6px;';
  sceneNote.textContent='✅ 표시된 동물이 지금 풍경에 있어요';
  $chicksBody.appendChild(sceneNote);

  ANIMAL_TYPES.forEach(function(at, i) {
    var unlocked = state.unlockedAnimals.indexOf(at.id) >= 0;
    var inScene  = state.sceneAnimals.indexOf(at.id) >= 0;
    var card = document.createElement('div');
    if (unlocked) {
      card.className = 'chick-card' + (inScene ? ' in-scene' : '');
      card.innerHTML = '<div class="chick-card-icon">'+at.emoji+'</div>'
        +'<div class="chick-card-info">'
        +'<div class="chick-card-name">'+at.name+(inScene?' ✅':'')+'</div>'
        +'<div class="chick-card-trait">'+at.trait+'</div>'
        +'<div class="chick-card-trait" style="color:var(--green2)">씨앗 보너스 ×'+at.seedBonus+'</div>'
        +'</div>'
        +'<div class="scene-toggle-btn">'+(inScene?'빼기':'추가')+'</div>';
      card.style.cursor='pointer';
      (function(atInner, inSceneInner) {
        card.addEventListener('click', function() {
          if (inSceneInner) {
            // 씬에서 제거 (최소 1마리 유지)
            if (state.sceneAnimals.length <= 1) { showToast('최소 1마리는 있어야 해요!'); return; }
            state.sceneAnimals = state.sceneAnimals.filter(function(id){ return id !== atInner.id; });
            showToast(atInner.emoji+' '+atInner.name+' 풍경에서 제거했어요');
          } else {
            // 씬에 추가 (최대 8마리)
            if (state.sceneAnimals.length >= 8) { showToast('동물은 최대 8마리까지 배치할 수 있어요'); return; }
            state.sceneAnimals.push(atInner.id);
            showToast(atInner.emoji+' '+atInner.name+' 풍경에 추가했어요!');
          }
          buildAnimals();
          renderChicks();
        });
      })(at, inScene);
    } else {
      card.className = 'chick-card-locked';
      card.innerHTML = '<div class="chick-lock-icon">'+at.emoji+'</div>'
        +'<div class="chick-lock-info">'
        +'<div class="chick-lock-name">???</div>'
        +'<div class="chick-lock-hint">게이지 '+i+'번 채우면 해금</div>'
        +'</div>';
    }
    $chicksBody.appendChild(card);
  });
}

/* ===================== STATS ===================== */
function renderStats() {
  var s=state.stats, pm=Math.floor(s.playTime/60);
  $statsBody.innerHTML='';
  var grid=document.createElement('div'); grid.className='stats-grid';
  [
    {icon:'🌱',label:'총 씨앗',     value:fmt(Math.floor(state.totalSeeds))},
    {icon:'⏱️',label:'여행 시간',   value:(pm>=60?(pm/60).toFixed(1)+'h':pm+'m')},
    {icon:'👆',label:'탭 횟수',     value:fmt(s.taps)},
    {icon:'🎁',label:'아이템 수집', value:fmt(s.itemsPicked)},
    {icon:'🗺️',label:'방문 장소',   value:state.unlockedLocs.length+'/'+LOCATIONS.length},
    {icon:'🐾',label:'해금 동물',   value:state.unlockedAnimals.length+'/'+ANIMAL_TYPES.length},
    {icon:'🤖',label:'자동 획득',   value:fmt(Math.floor(s.autoSeeds))},
    {icon:'🎵',label:'들은 노래',   value:(state.songs||0)},
  ].forEach(function(c) {
    var card=document.createElement('div'); card.className='stat-card';
    card.innerHTML='<h3>'+c.icon+' '+c.label+'</h3><div class="stat-value">'+c.value+'</div>';
    grid.appendChild(card);
  });
  $statsBody.appendChild(grid);
}

/* ===================== COLLECT ===================== */
function renderCollect() {
  $collectBody.innerHTML='';
  var grid=document.createElement('div'); grid.className='collect-grid';
  COLLECTIBLES.forEach(function(c) {
    var cnt=state.collected[c.id]||0;
    var div=document.createElement('div');
    div.className='collect-item'+(cnt===0?' locked':'');
    div.innerHTML='<span>'+c.emoji+'</span><span class="collect-label">'+(cnt>0?c.name:'???')+'</span>';
    if (cnt>0) {
      var badge=document.createElement('span');
      badge.className='collect-count'; badge.textContent='x'+cnt;
      div.appendChild(badge);
    }
    div.title=cnt>0?c.hint:'아직 발견 못했어요';
    grid.appendChild(div);
  });
  $collectBody.appendChild(grid);
}

/* ===================== LOCATION TABS ===================== */
function renderLocTabs() {
  $locTabs.innerHTML='';
  LOCATIONS.forEach(function(loc) {
    var locked = state.unlockedLocs.indexOf(loc.id)<0;
    var btn=document.createElement('button');
    btn.className='loc-tab'+(state.currentLoc===loc.id?' active':'')+(locked?' locked':'');
    btn.textContent=loc.emoji+' '+loc.name.replace(/^\S+\s/,'');
    btn.title=locked?'🔒 씨앗 '+fmt(loc.unlockSeeds)+'개 필요':loc.desc;
    btn.addEventListener('click', function() {
      if (locked) { showToast('🔒 씨앗 '+fmt(loc.unlockSeeds)+'개가 필요해요'); return; }
      if (state.currentLoc===loc.id) return;
      travelTo(loc.id);
    });
    $locTabs.appendChild(btn);
  });
}

function travelTo(locId) {
  initAudio();
  state.currentLoc=locId;
  if (state.unlockedLocs.indexOf(locId)<0) {
    state.unlockedLocs.push(locId);
    state.stats.locsVisited=state.unlockedLocs.length;
  }
  state.currentBgmIdx = 0;
  renderLocTabs(); applyScene(); spawnSceneItems(); spawnParticles();
  playLocMove(); resetAllAnimalPaths();
  var loc=LOCATIONS.find(function(l){return l.id===locId;});
  $locName.textContent=loc.name;
  showToast(loc.emoji+' '+loc.desc);
  startBGM();
}

function applyScene() {
  $sceneBg.setAttribute('data-loc', state.currentLoc);
  $sceneMid.setAttribute('data-loc', state.currentLoc);
  var $h=document.getElementById('scene-horizon');
  if($h) $h.setAttribute('data-loc', state.currentLoc);
}

/* ===================== DEPTH / MOVEMENT ===================== */
function randomDepth() {
  var r=Math.random();
  if (r<0.33) return 10+Math.random()*12;
  if (r<0.66) return 22+Math.random()*18;
  return 40+Math.random()*15;
}
function depthToFontSize(b) { return Math.round(80-(b-10)/45*44); }
function depthToZ(b) { return Math.round(100-b); }

var animalEntities = [];
var itemSpawnTimer = null;
var seedTimers = []; // 동물별 자동 씨앗 타이머

/* 장소별 이동 스타일
   field  → wander: 자유롭게 돌아다님, 가끔 멈춤
   lake   → swim:   느린 물결 흐름, 좌우로 부드럽게 미끄러짐
   forest → sneak:  살금살금, 방향전환 많음, 가끔 숨듯이 멈춤
   sunset → drift:  바람에 날리듯 천천히 표류
   night  → float:  유유히 부유, 깊이감 변화 많음
*/

function createAnimalEntity(animalId) {
  var at=ANIMAL_TYPES.find(function(a){return a.id===animalId;})||ANIMAL_TYPES[0];
  var el=document.createElement('div'); el.className='chick-entity move-'+getMoveMode();
  var emojiEl=document.createElement('div'); emojiEl.className='chick-emoji'; emojiEl.textContent=at.emoji;
  var shadowEl=document.createElement('div'); shadowEl.className='chick-shadow-e';
  el.appendChild(emojiEl); el.appendChild(shadowEl);

  var sx=8+Math.random()*75, sb=randomDepth();
  el.style.left=sx+'%'; el.style.bottom=sb+'%';
  el.style.fontSize=depthToFontSize(sb)+'px'; el.style.zIndex=depthToZ(sb);

  var ent={
    el:el, emojiEl:emojiEl, animalId:animalId,
    x:sx, b:sb,
    vx:(Math.random()-.5)*2,    // 속도 x
    vb:(Math.random()-.5)*0.5,  // 속도 depth
    dir:Math.random()>.5?1:-1,
    t:0,
    pauseTimer:0,               // 멈춤 타이머(wander/sneak)
    targetX:sx, targetB:sb,     // 목표 지점
    nextTargetT:0,
    phase:Math.random()*Math.PI*2,
  };

  el.addEventListener('pointerdown', function(e) {
    e.stopPropagation(); initAudio();
    state.stats.taps++;
    playAnimalSound();
    var rect=el.getBoundingClientRect();
    spawnHeart(rect.left+rect.width/2, rect.top);
  });

  $depthStage.appendChild(el);
  animalEntities.push(ent);
  return ent;
}

function getMoveMode() {
  var modes={field:'wander',lake:'swim',forest:'sneak',sunset:'drift',night:'float'};
  return modes[state.currentLoc]||'wander';
}

function resetAllAnimalPaths() {
  var mode=getMoveMode();
  animalEntities.forEach(function(e) {
    e.el.className='chick-entity move-'+mode;
    e.t=0; e.pauseTimer=0; e.nextTargetT=0;
    e.vx=(Math.random()-.5)*2; e.vb=(Math.random()-.5)*0.5;
    e.phase=Math.random()*Math.PI*2;
  });
}

function moveSpeed() { return 1+(state.speedBonus||0); }

function tickMove(dt) {
  var mode=getMoveMode();
  var spd=moveSpeed();

  animalEntities.forEach(function(ent) {
    ent.t+=dt;
    var nx=ent.x, nb=ent.b;

    if (mode==='wander') {
      /* 들판: 자유 산책, 가끔 새 목표 지점 선택, 가끔 멈춤 */
      if (ent.pauseTimer > 0) {
        ent.pauseTimer -= dt;
      } else {
        if (ent.t >= ent.nextTargetT) {
          ent.targetX = 5+Math.random()*85;
          ent.targetB = randomDepth();
          ent.nextTargetT = ent.t + (2+Math.random()*5)/spd;
          if (Math.random()<0.2) ent.pauseTimer = 0.5+Math.random()*1.5;
        }
        ent.x += (ent.targetX-ent.x)*dt*0.9*spd;
        ent.b += (ent.targetB-ent.b)*dt*0.6*spd;
      }
      nx=ent.x; nb=ent.b;

    } else if (mode==='swim') {
      /* 연못: 수영 — 좌우 부드럽게 흐르고, 깊이(전후)도 물결처럼 */
      ent.x += ent.dir * dt * 5 * spd;
      ent.b += Math.sin(ent.t*0.35+ent.phase) * dt * 2.5 * spd;
      // 벽 반사 시 방향 바꾸고 깊이 새로 선택
      if (ent.x > 88) { ent.x=88; ent.dir=-1; ent.targetB=randomDepth(); }
      if (ent.x < 5)  { ent.x= 5; ent.dir= 1; ent.targetB=randomDepth(); }
      if (ent.targetB !== undefined) {
        ent.b += (ent.targetB-ent.b)*dt*0.3;
        if (Math.abs(ent.b-ent.targetB)<0.8) ent.targetB=undefined;
      }
      ent.b=Math.max(10,Math.min(55,ent.b));
      nx=ent.x; nb=ent.b;

    } else if (mode==='sneak') {
      /* 숲: 살금살금 — 짧게 이동 후 자주 방향 전환, 가끔 멈춤 */
      if (ent.pauseTimer > 0) {
        ent.pauseTimer -= dt;
      } else {
        if (ent.t >= ent.nextTargetT) {
          ent.targetX = Math.max(5, Math.min(88, ent.x + (Math.random()-.5)*30));
          ent.targetB = Math.max(10, Math.min(55, ent.b + (Math.random()-.5)*15));
          ent.nextTargetT = ent.t + (1+Math.random()*3)/spd;
          if (Math.random()<0.35) ent.pauseTimer = 0.8+Math.random()*2.0;
        }
        ent.x += (ent.targetX-ent.x)*dt*1.4*spd;
        ent.b += (ent.targetB-ent.b)*dt*1.0*spd;
      }
      nx=ent.x; nb=ent.b;

    } else if (mode==='drift') {
      /* 노을: 바람에 표류 — 느리고 부드럽게, 깊이도 천천히 변함 */
      ent.vx += (Math.random()-.5)*0.4*spd - ent.vx*0.02;
      ent.vb += (Math.random()-.5)*0.1*spd - ent.vb*0.02;
      ent.vx = Math.max(-6,Math.min(6,ent.vx));
      ent.vb = Math.max(-1.5,Math.min(1.5,ent.vb));
      ent.x += ent.vx*dt*spd;
      ent.b += ent.vb*dt*spd;
      if (ent.x>88){ent.x=88;ent.vx*=-0.6;}
      if (ent.x< 5){ent.x= 5;ent.vx*=-0.6;}
      ent.b=Math.max(10,Math.min(55,ent.b));
      nx=ent.x; nb=ent.b;

    } else if (mode==='float') {
      /* 밤: 유유히 부유 — 깊이감 변화가 크고, 속도 느림 */
      ent.x += Math.sin(ent.t*0.28+ent.phase)*dt*4*spd;
      ent.b += Math.cos(ent.t*0.18+ent.phase*1.3)*dt*3*spd;
      if (ent.x>88){ent.x=88;ent.phase+=Math.PI;}
      if (ent.x< 5){ent.x= 5;ent.phase+=Math.PI;}
      ent.b=Math.max(10,Math.min(55,ent.b));
      nx=ent.x; nb=ent.b;
    }

    var fs=depthToFontSize(nb);
    ent.el.style.left    =nx+'%';
    ent.el.style.bottom  =nb+'%';
    ent.el.style.fontSize=fs+'px';
    ent.el.style.zIndex  =depthToZ(nb);
    /* 이동 방향에 따라 좌우 반전 */
    var goRight = (ent.vx||0) > 0.3 || (ent.dir||1) > 0;
    if (mode==='wander'||mode==='sneak') {
      var dx = ent.targetX - ent.x;
      goRight = dx > 0;
    }
    ent.emojiEl.style.transform = goRight ? 'scaleX(-1)' : 'scaleX(1)';
  });
}

/* ===================== SCENE ITEMS ===================== */
function spawnSceneItems() {
  $sceneItems.innerHTML='';
  if (itemSpawnTimer) clearInterval(itemSpawnTimer);
  var loc=LOCATIONS.find(function(l){return l.id===state.currentLoc;});
  if (!loc) return;
  for (var i=0;i<4;i++) spawnOneItem(loc);
  itemSpawnTimer=setInterval(function(){
    if ($sceneItems.children.length<7) spawnOneItem(loc);
  },3500);
}
function spawnOneItem(loc) {
  var emoji=loc.items[Math.floor(Math.random()*loc.items.length)];
  var el=document.createElement('div'); el.className='scene-item'; el.textContent=emoji;
  el.style.left=(5+Math.random()*85)+'%';
  el.style.bottom=(18+Math.random()*35)+'%';
  el.style.setProperty('--delay',(Math.random()*2)+'s');
  el.addEventListener('pointerdown',function(e){ e.stopPropagation(); collectItem(el,emoji); });
  $sceneItems.appendChild(el);
}
function collectItem(el, emoji) {
  initAudio();
  var rect=el.getBoundingClientRect(); el.remove();
  var loc=LOCATIONS.find(function(l){return l.id===state.currentLoc;});
  var partyMul=1+(state.partyBonus||0);
  var reward=Math.ceil((loc?loc.seedRate:1)*partyMul)+(state.pickBonus||0);
  addSeeds(reward, rect.left, rect.top);
  playCollect();
  var cid=ITEM_TO_COLLECT[emoji];
  if (cid) {
    var lucky=(state.luckyActive||0)>0;
    if (Math.random()<(lucky?0.5:0.25)) {
      state.collected[cid]=(state.collected[cid]||0)+1;
      if (state.collected[cid]===1) {
        var c=COLLECTIBLES.find(function(x){return x.id===cid;});
        showToast(c.emoji+' '+c.name+' 처음 발견!'); playUnlock();
      }
    }
  }
  state.stats.itemsPicked++;
}

/* ===================== PARTICLES ===================== */
function spawnParticles() {
  $particles.innerHTML='';
  var loc=LOCATIONS.find(function(l){return l.id===state.currentLoc;});
  if (!loc) return;
  var count=state.rainbowActive?18:10;
  for (var i=0;i<count;i++){
    var p=document.createElement('div'); p.className='particle';
    var ptypes=state.rainbowActive?['🌈','✨','🌟','💫','🎵','🌸'].concat(loc.particles):loc.particles;
    p.textContent=ptypes[Math.floor(Math.random()*ptypes.length)];
    p.style.left=Math.random()*90+'%'; p.style.bottom=Math.random()*50+'%';
    p.style.setProperty('--dur',(3+Math.random()*5)+'s');
    p.style.setProperty('--delay2',(Math.random()*6)+'s');
    p.style.setProperty('--dx',(-30+Math.random()*60)+'px');
    $particles.appendChild(p);
  }
}

/* ===================== SEEDS ===================== */
function addSeeds(amount, x, y) {
  state.seeds+=amount; state.totalSeeds+=amount;
  updateSeedDisplay(); checkUnlocks();
  if (x!==undefined){
    var scRect=$gameScene.getBoundingClientRect();
    var pop=document.createElement('div'); pop.className='coin-pop';
    pop.textContent='+'+Math.floor(amount)+'🌱';
    pop.style.left=(x-scRect.left)+'px'; pop.style.top=(y-scRect.top-20)+'px';
    $gameScene.appendChild(pop);
    setTimeout(function(){pop.remove();},900);
  }
}
function updateSeedDisplay(){ $statSeeds.textContent=fmt(state.seeds); }

function spawnHeart(x,y){
  var hearts=['💛','✨','🌟','💕','🎵','🍀'];
  var pop=document.createElement('div'); pop.className='coin-pop';
  pop.textContent=hearts[Math.floor(Math.random()*hearts.length)];
  var scRect=$gameScene.getBoundingClientRect();
  pop.style.left=(x-scRect.left-10)+'px'; pop.style.top=(y-scRect.top-10)+'px';
  $gameScene.appendChild(pop);
  setTimeout(function(){pop.remove();},900);
}

function checkUnlocks(){
  LOCATIONS.forEach(function(loc){
    if (state.unlockedLocs.indexOf(loc.id)<0 && state.totalSeeds>=loc.unlockSeeds){
      state.unlockedLocs.push(loc.id);
      showToast('🗺️ 새 장소 해금! '+loc.name); playUnlock();
      renderLocTabs(); $statPlaces.textContent=state.unlockedLocs.length;
    }
  });
}

/* ===================== AUTO SEED (동물별 독립 타이머) =====================
   병아리 1마리당 2~3분(120~180초)에 씨앗 1개
   마리 수가 많아도 1마리당 주기는 동일
   ====================================================================== */
function seedInterval(){
  var base=120+Math.random()*60; // 120~180초 (2~3분)
  return Math.max(60, base-(state.autoBonus||0)*15);
}
function initSeedTimers(){
  var count=state.sceneAnimals.length;
  seedTimers=[];
  for(var i=0;i<count;i++){
    seedTimers.push(seedInterval()*(0.3+Math.random()*0.7));
  }
}
function tickSeedTimers(dt){
  var count=animalEntities.length;
  while(seedTimers.length<count) seedTimers.push(seedInterval()*(0.5+Math.random()*0.5));
  seedTimers=seedTimers.slice(0,count);
  for(var i=0;i<seedTimers.length;i++){
    seedTimers[i]-=dt;
    if(seedTimers[i]<=0){
      seedTimers[i]=seedInterval();
      var partyMul=1+(state.partyBonus||0);
      var amount=Math.ceil(1*partyMul);
      state.seeds+=amount; state.totalSeeds+=amount;
      state.stats.autoSeeds+=amount;
      updateSeedDisplay(); checkUnlocks();
      if(animalEntities[i]){
        var el=animalEntities[i].el;
        var scRect=$gameScene.getBoundingClientRect();
        var eRect=el.getBoundingClientRect();
        var pop=document.createElement('div'); pop.className='coin-pop';
        pop.textContent='+1🌱';
        pop.style.left=(eRect.left+eRect.width/2-scRect.left-10)+'px';
        pop.style.top=(eRect.top-scRect.top-8)+'px';
        $gameScene.appendChild(pop);
        setTimeout(function(){pop.remove();},900);
      }
    }
  }
}

/* ===================== EVOLVE GAUGE ===================== */
function tickEvolve(dt){
  var nextIdx=state.unlockedAnimals.length;
  if (nextIdx>=ANIMAL_TYPES.length){
    $evolveLabel.textContent='🎉 모든 동물 해금!';
    $evolveFill.style.width='100%'; $evolveTime.textContent='완료!'; return;
  }
  var nextAnimal=ANIMAL_TYPES[nextIdx];
  $evolveLabel.textContent=nextAnimal.emoji+' 까지';
  state.evolveGauge=(state.evolveGauge||0)+dt/EVOLVE_INTERVAL;
  if(state.evolveGauge>=1){
    state.evolveGauge=0;
    if(state.unlockedAnimals.indexOf(nextAnimal.id)<0){
      state.unlockedAnimals.push(nextAnimal.id);
      $statChicks.textContent=state.unlockedAnimals.length;
      showToast('🎉 새 동물 해금! '+nextAnimal.emoji+' '+nextAnimal.name);
      playEvolve();
    }
  }
  $evolveFill.style.width=(Math.min(state.evolveGauge,1)*100)+'%';
  $evolveTime.textContent=fmtTime(EVOLVE_INTERVAL*(1-Math.min(state.evolveGauge,1)));
}

/* ===================== LUCKY CLOVER ===================== */
function tickLucky(dt){
  if((state.luckyActive||0)>0){
    state.luckyActive-=dt;
    if(state.luckyActive<=0){state.luckyActive=0;showToast('🍀 네잎클로버 효과 종료');}
  }
}

/* ===================== MAIN TICK ===================== */
var lastTick=Date.now(), rafId=null;
function tick(){
  var now=Date.now(), dt=Math.min((now-lastTick)/1000,0.5); lastTick=now;
  state.stats.playTime+=dt;
  updateTimeDisplay();
  tickEvolve(dt); tickLucky(dt); tickMove(dt); tickSeedTimers(dt);
  rafId=requestAnimationFrame(tick);
}
function updateTimeDisplay(){
  var s=Math.floor(state.stats.playTime);
  $timeDisp.textContent=String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor((s%3600)/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
}

/* ===================== BUILD ANIMALS ===================== */
function buildAnimals(){
  $depthStage.innerHTML=''; animalEntities.length=0;
  var toShow=state.sceneAnimals.slice(0,8);
  var mode=getMoveMode();
  toShow.forEach(function(id){
    var e=createAnimalEntity(id);
    e.el.className='chick-entity move-'+mode;
  });
  $statChicks.textContent=state.unlockedAnimals.length;
  initSeedTimers();
}

/* ===================== GAME INIT ===================== */
function startNewGame(){ state=DEFAULT_STATE(); startGame(); }
function startGame(){
  if(rafId) cancelAnimationFrame(rafId);
  lastTick=Date.now();
  applyScene(); renderLocTabs(); spawnSceneItems(); spawnParticles(); buildAnimals();
  updateSeedDisplay();
  var loc=LOCATIONS.find(function(l){return l.id===state.currentLoc;});
  $locName.textContent=loc?loc.name:'';
  $statPlaces.textContent=state.unlockedLocs.length;
  $btnSound.textContent=state.soundOn?'🔔':'🔕';
  showScreen('screen-game');
  rafId=requestAnimationFrame(tick);
  showToast('🐤 안녕! 여행을 시작해요~');
  setTimeout(function(){ if(audioCtx) startBGM(); },300);
}

/* ===================== BUTTONS ===================== */
$btnShop    .addEventListener('click',function(){ initAudio(); openPanel('panel-shop'); });
$btnChicksBtn.addEventListener('click',function(){ initAudio(); openPanel('panel-chicks'); });
$btnStats   .addEventListener('click',function(){ initAudio(); openPanel('panel-stats'); });
$btnCollect .addEventListener('click',function(){ initAudio(); openPanel('panel-collect'); });
$btnSave    .addEventListener('click',function(){ initAudio(); saveGame(); });
$btnMenu    .addEventListener('click',function(){ initAudio(); openPanel('panel-menu'); });
$btnSound   .addEventListener('click',function(){
  initAudio(); state.soundOn=!state.soundOn;
  $btnSound.textContent=state.soundOn?'🔔':'🔕';
  showToast(state.soundOn?'🔔 소리 켜짐':'🔕 소리 꺼짐');
  if(state.soundOn){ if(state.bgmOn) startBGM(); } else { stopBGM(); }
});
$menuSave .addEventListener('click',function(){ saveGame(); closeAllPanels(); });
$menuTitle.addEventListener('click',function(){
  closeAllPanels(); stopBGM();
  if(rafId) cancelAnimationFrame(rafId);
  showScreen('screen-title'); updateTitleButtons();
});
$menuReset.addEventListener('click',function(){ closeAllPanels(); $modalNew.classList.remove('hidden'); });
$gameScene.addEventListener('pointerdown',function(){ initAudio(); });

/* ===================== TITLE ===================== */
function updateTitleButtons(){ $btnCont.disabled=!hasSave(); }
$btnNew.addEventListener('click',function(){
  initAudio();
  hasSave()?$modalNew.classList.remove('hidden'):startNewGame();
});
$btnCont.addEventListener('click',function(){ initAudio(); if(loadGame()) startGame(); });
$btnNewOk.addEventListener('click',function(){ deleteSave(); $modalNew.classList.add('hidden'); startNewGame(); });
$btnNewCx.addEventListener('click',function(){ $modalNew.classList.add('hidden'); });

/* ===================== AUTO SAVE ===================== */
setInterval(function(){
  if($screenGame.classList.contains('active')){
    try{ localStorage.setItem(SAVE_KEY,JSON.stringify(state)); }catch(e){}
  }
},30000);
document.addEventListener('visibilitychange',function(){ if(!document.hidden) lastTick=Date.now(); });

/* ===================== BOOT ===================== */
updateTitleButtons();
showScreen('screen-title');

}); // end DOMContentLoaded
