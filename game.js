/* ==========================================
   FLUFFY WANDERER v2 — game.js
   🐤 병아리의 한가로운 여행
   ========================================== */
'use strict';
document.addEventListener('DOMContentLoaded', function() {

const CHICK_TYPES = [
  { id:'chick',    emoji:'🐤', name:'병아리',        trait:'자유롭게 돌아다녀요',     seedBonus:1.0 },
  { id:'hatching', emoji:'🐣', name:'부화 중인 알',   trait:'느긋하게 움직여요',        seedBonus:1.2 },
  { id:'baby',     emoji:'🐥', name:'노란 아기새',    trait:'아주 빠르게 뛰어다녀요',   seedBonus:1.5 },
  { id:'penguin',  emoji:'🐧', name:'펭귄',           trait:'뒤뚱뒤뚱 걸어요',          seedBonus:1.8 },
  { id:'owl',      emoji:'🦉', name:'부엉이',          trait:'빙글빙글 돌아다녀요',      seedBonus:2.2 },
  { id:'parrot',   emoji:'🦜', name:'앵무새',          trait:'8자로 날아다녀요',         seedBonus:2.6 },
  { id:'flamingo', emoji:'🦩', name:'플라밍고',        trait:'우아하게 유영해요',        seedBonus:3.0 },
  { id:'phoenix',  emoji:'🐦', name:'불사조',          trait:'불꽃처럼 날아다녀요',      seedBonus:4.0 },
];

const EVOLVE_INTERVAL = 6 * 60;

const LOCATIONS = [
  { id:'field',  name:'🌾 들판',   emoji:'🌾', unlockSeeds:0,     items:['🌸','🌼','🍀','🌿','🌱','🦋','🐛','🌻'], particles:['🍃','✨','🌸'], seedRate:1.0, moveMode:'wander',  desc:'따사로운 햇살 아래 넓은 들판' },
  { id:'lake',   name:'💧 연못',   emoji:'💧', unlockSeeds:300,   items:['🐸','🐟','🪷','🌊','🦆','🐚','🪸'],       particles:['💧','🫧','✨'], seedRate:1.6, moveMode:'drift',   desc:'반짝이는 연못가에서 쉬는 시간' },
  { id:'forest', name:'🌲 숲',     emoji:'🌲', unlockSeeds:1200,  items:['🍄','🦔','🐿️','🌰','🍂','🦉','🐞'],     particles:['🍃','🌿','✨'], seedRate:2.2, moveMode:'patrol',  desc:'조용하고 신비로운 숲 속' },
  { id:'sunset', name:'🌅 노을',   emoji:'🌅', unlockSeeds:5000,  items:['🌅','🌄','☁️','🦅','🌙','🌟','🎑'],      particles:['✨','🌟','🧡'], seedRate:3.0, moveMode:'circle',  desc:'온 세상이 주황빛으로 물드는 시간' },
  { id:'night',  name:'🌙 밤하늘', emoji:'🌙', unlockSeeds:20000, items:['⭐','🌙','🌠','🦉','🔮','🫧','🌌'],       particles:['⭐','✨','🌙'], seedRate:4.2, moveMode:'figure8', desc:'별이 쏟아지는 고요한 밤' },
];

const SHOP_ITEMS = [
  { id:'feed',        icon:'🌾', name:'씨앗 여물',        desc:'병아리에게 먹이를 줘요',         effect:'+50 씨앗 즉시',              cost:30,   type:'consume',                action:(s)=>{ s.seeds+=50; s.totalSeeds+=50; } },
  { id:'feast',       icon:'🍱', name:'특별 도시락',       desc:'맛있는 도시락으로 기운 충전',     effect:'+300 씨앗 즉시',             cost:150,  type:'consume',                action:(s)=>{ s.seeds+=300; s.totalSeeds+=300; } },
  { id:'autoplus',    icon:'⚙️', name:'자동 수확기',       desc:'자동 씨앗 획득량 증가',           effect:'자동 +1개/3분 (중복가능)',    cost:200,  type:'upgrade', maxOwn:5,      action:(s)=>{ s.autoBonus=(s.autoBonus||0)+1; } },
  { id:'speedup',     icon:'💨', name:'바람개비',           desc:'병아리가 더 활발하게 돌아다녀요', effect:'이동 속도 +20%',             cost:400,  type:'upgrade', maxOwn:3,      action:(s)=>{ s.speedBonus=(s.speedBonus||0)+0.2; } },
  { id:'magnet',      icon:'🧲', name:'씨앗 자석',         desc:'아이템 획득 씨앗 추가',           effect:'아이템 씨앗 +1',             cost:600,  type:'upgrade', maxOwn:5,      action:(s)=>{ s.pickBonus=(s.pickBonus||0)+1; } },
  { id:'gauge_boost', icon:'⚡', name:'게이지 가속제',      desc:'병아리 진화 게이지 즉시 증가',    effect:'게이지 +10% 즉시',           cost:250,  type:'consume',                action:(s)=>{ s.evolveProgress=Math.min(1,(s.evolveProgress||0)+0.1); s.evolveTotal=(s.evolveTotal||0)+EVOLVE_INTERVAL*0.1; } },
  { id:'lucky_clover',icon:'🍀', name:'네잎클로버',         desc:'수집품 드롭 확률 2배',            effect:'수집 확률 ×2 (120초)',       cost:500,  type:'consume',                action:(s)=>{ s.luckyActive=(s.luckyActive||0)+120; } },
];

const COLLECTIBLES = [
  { id:'daisy',    emoji:'🌼', name:'데이지',     hint:'들판' },
  { id:'clover',   emoji:'🍀', name:'네잎클로버', hint:'들판' },
  { id:'butterfly',emoji:'🦋', name:'나비',       hint:'들판' },
  { id:'frog',     emoji:'🐸', name:'개구리',     hint:'연못' },
  { id:'lotus',    emoji:'🪷', name:'연꽃',       hint:'연못' },
  { id:'shell',    emoji:'🐚', name:'조개껍질',   hint:'연못' },
  { id:'mushroom', emoji:'🍄', name:'버섯',       hint:'숲' },
  { id:'hedgehog', emoji:'🦔', name:'고슴도치',   hint:'숲' },
  { id:'acorn',    emoji:'🌰', name:'도토리',     hint:'숲' },
  { id:'eagle',    emoji:'🦅', name:'독수리',     hint:'노을' },
  { id:'star',     emoji:'🌟', name:'별',         hint:'노을/밤' },
  { id:'comet',    emoji:'🌠', name:'유성',       hint:'밤하늘' },
  { id:'orb',      emoji:'🔮', name:'신비의 구슬',hint:'밤하늘' },
];
const ITEM_TO_COLLECT = {
  '🌼':'daisy','🍀':'clover','🦋':'butterfly',
  '🐸':'frog','🪷':'lotus','🐚':'shell',
  '🍄':'mushroom','🦔':'hedgehog','🌰':'acorn',
  '🦅':'eagle','🌟':'star','🌠':'comet','🔮':'orb'
};

const DEFAULT_STATE = () => ({
  seeds:0, totalSeeds:0,
  currentLoc:'field', unlockedLocs:['field'],
  collected:{}, shopOwned:{},
  autoBonus:0, speedBonus:0, pickBonus:0, luckyActive:0,
  unlockedChicks:['chick'], activeChick:'chick',
  evolveProgress:0, evolveTotal:0,
  stats:{ playTime:0, taps:0, itemsPicked:0, locsVisited:1, autoSeeds:0 },
  soundOn:true, songs:0, lastSave:null,
});
let state = DEFAULT_STATE();

const SAVE_KEY = 'fluffyWandererV2';
const $  = id => document.getElementById(id);
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

/* ---- AUDIO ---- */
let audioCtx = null;
function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
}
function playTone(freq, type, dur, vol) {
  type=type||'sine'; dur=dur||0.18; vol=vol||0.16;
  if (!state.soundOn || !audioCtx) return;
  try {
    const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type=type; osc.frequency.value=freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+dur);
    osc.start(); osc.stop(audioCtx.currentTime+dur);
  } catch(e) {}
}
function playCollect(){ playTone(1047,'triangle',.2,.2); setTimeout(function(){playTone(1319,'triangle',.2,.16);},80); }
function playUnlock() { [523,659,784,1047].forEach(function(f,i){setTimeout(function(){playTone(f,'sine',.3,.18);},i*80);}); }
function playEvolve() { [523,659,784,1047,1319].forEach(function(f,i){setTimeout(function(){playTone(f,'triangle',.35,.22);},i*90);}); }
function playTap()    { playTone(660,'sine',.1,.12); }
function playLocMove(){ playTone(440,'triangle',.2,.14); }
function playSave()   { [523,659].forEach(function(f,i){setTimeout(function(){playTone(f,'sine',.2,.14);},i*80);}); }
function playBuy()    { playTone(784,'sine',.18,.16); }

/* ---- SAVE / LOAD ---- */
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
    return true;
  } catch(e) { return false; }
}
function hasSave()    { return !!localStorage.getItem(SAVE_KEY); }
function deleteSave() { localStorage.removeItem(SAVE_KEY); }

/* ---- SCREEN ---- */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}

/* ---- TOAST ---- */
var toastTimer = null;
function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.remove('hidden'); $toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){
    $toast.classList.remove('show');
    setTimeout(function(){ $toast.classList.add('hidden'); }, 400);
  }, 2400);
}

/* ---- FORMAT ---- */
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

/* ---- PANELS ---- */
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

/* ---- SHOP ---- */
function renderShop() {
  $shopBody.innerHTML = '';
  var seedInfo = document.createElement('div');
  seedInfo.className = 'shop-section-title';
  seedInfo.textContent = '보유 씨앗: 🌱 ' + fmt(state.seeds);
  $shopBody.appendChild(seedInfo);

  SHOP_ITEMS.forEach(function(item) {
    var owned = state.shopOwned[item.id]||0;
    var maxed = item.maxOwn !== undefined && owned >= item.maxOwn;
    var row = document.createElement('div'); row.className='shop-item';
    var icon=document.createElement('div'); icon.className='shop-item-icon'; icon.textContent=item.icon;
    var info=document.createElement('div'); info.className='shop-item-info';
    info.innerHTML='<div class="shop-item-name">'+item.name+(item.maxOwn?' <span style="font-size:10px;color:var(--text-sub)">('+owned+'/'+item.maxOwn+')</span>':'')+'</div><div class="shop-item-desc">'+item.desc+'</div><div class="shop-item-effect">'+item.effect+'</div>';
    var btn=document.createElement('button'); btn.className='shop-buy-btn';
    btn.disabled = maxed || state.seeds < item.cost;
    btn.textContent = maxed ? '완료' : '🌱'+fmt(item.cost);
    btn.addEventListener('click', function() {
      if (state.seeds < item.cost) { showToast('씨앗이 부족해요 🌱'); return; }
      state.seeds -= item.cost;
      state.shopOwned[item.id] = (state.shopOwned[item.id]||0)+1;
      item.action(state);
      playBuy();
      showToast(item.icon+' '+item.name+' 구매!');
      updateSeedDisplay();
      renderShop();
    });
    row.appendChild(icon); row.appendChild(info); row.appendChild(btn);
    $shopBody.appendChild(row);
  });
}

/* ---- CHICKS PANEL ---- */
function renderChicks() {
  $chicksBody.innerHTML = '';
  var nextIdx = state.unlockedChicks.length;
  var pct = Math.floor((state.evolveProgress||0)*100);
  var info=document.createElement('div'); info.className='shop-section-title';
  info.textContent = nextIdx < CHICK_TYPES.length
    ? '다음 병아리까지 게이지: '+pct+'%'
    : '모든 병아리를 해금했어요! 🎉';
  $chicksBody.appendChild(info);

  CHICK_TYPES.forEach(function(ct, i) {
    var unlocked = state.unlockedChicks.indexOf(ct.id) >= 0;
    var card = document.createElement('div');
    if (unlocked) {
      card.className = 'chick-card';
      card.innerHTML = '<div class="chick-card-icon">'+ct.emoji+'</div><div class="chick-card-info"><div class="chick-card-name">'+ct.name+(state.activeChick===ct.id?' ✅':'')+'</div><div class="chick-card-trait">'+ct.trait+'</div><div class="chick-card-trait" style="color:var(--green2)">씨앗 보너스 ×'+ct.seedBonus+'</div></div>';
      card.style.cursor='pointer';
      (function(ctInner) {
        card.addEventListener('click', function() {
          state.activeChick = ctInner.id;
          updateChickEmojis();
          showToast(ctInner.emoji+' '+ctInner.name+'으로 변경!');
          renderChicks();
        });
      })(ct);
    } else {
      card.className = 'chick-card-locked';
      card.innerHTML = '<div class="chick-lock-icon">'+ct.emoji+'</div><div class="chick-lock-info"><div class="chick-lock-name">???</div><div class="chick-lock-hint">게이지 '+i+'번 채우면 해금</div></div>';
    }
    $chicksBody.appendChild(card);
  });
}

/* ---- STATS PANEL ---- */
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
    {icon:'🐣',label:'병아리 종류', value:state.unlockedChicks.length+'/'+CHICK_TYPES.length},
    {icon:'🤖',label:'자동 획득',   value:fmt(s.autoSeeds)},
    {icon:'🎵',label:'들은 노래',   value:state.songs},
  ].forEach(function(c) {
    var card=document.createElement('div'); card.className='stat-card';
    card.innerHTML='<h3>'+c.icon+' '+c.label+'</h3><div class="stat-value">'+c.value+'</div>';
    grid.appendChild(card);
  });
  $statsBody.appendChild(grid);
}

/* ---- COLLECT PANEL ---- */
function renderCollect() {
  $collectBody.innerHTML='';
  var grid=document.createElement('div'); grid.className='collect-grid';
  COLLECTIBLES.forEach(function(c) {
    var cnt=state.collected[c.id]||0;
    var div=document.createElement('div');
    div.className='collect-item'+(cnt===0?' locked':'');
    div.innerHTML='<span>'+c.emoji+'</span><span class="collect-label">'+(cnt>0?c.name:'???')+'</span>';
    if (cnt>0) { var badge=document.createElement('span'); badge.className='collect-count'; badge.textContent='x'+cnt; div.appendChild(badge); }
    div.title=cnt>0?c.hint:'아직 발견 못했어요';
    grid.appendChild(div);
  });
  $collectBody.appendChild(grid);
}

/* ---- LOCATION TABS ---- */
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
  renderLocTabs();
  applyScene();
  spawnSceneItems();
  spawnParticles();
  playLocMove();
  resetAllChickPaths();
  var loc=LOCATIONS.find(function(l){return l.id===locId;});
  $locName.textContent=loc.name;
  showToast(loc.emoji+' '+loc.desc);
}

function applyScene() {
  $sceneBg.setAttribute('data-loc', state.currentLoc);
  $sceneMid.setAttribute('data-loc', state.currentLoc);
}

/* ============================================================
   DEPTH / XYZ MOVEMENT
   x = left/right (%)
   z = depth → bottom% + fontSize (far = higher bottom%, smaller)
   No up/down (y) for chick body position
   ============================================================ */
function randomDepth() {
  var r=Math.random();
  if (r<0.33) return 10+Math.random()*12;   // near 10-22
  if (r<0.66) return 22+Math.random()*18;   // mid  22-40
  return 40+Math.random()*15;               // far  40-55
}
function depthToFontSize(b) {
  return Math.round(52 - (b-10)/45*32);
}
function depthToZ(b) { return Math.round(100-b); }

var chickEntities=[];
var itemSpawnTimer=null;

function createChickEntity(chickTypeId) {
  var ct=CHICK_TYPES.find(function(c){return c.id===chickTypeId;})||CHICK_TYPES[0];
  var el=document.createElement('div'); el.className='chick-entity';
  var emojiEl=document.createElement('div'); emojiEl.className='chick-emoji'; emojiEl.textContent=ct.emoji;
  var shadowEl=document.createElement('div'); shadowEl.className='chick-shadow-e';
  el.appendChild(emojiEl); el.appendChild(shadowEl);

  var startX=10+Math.random()*70;
  var startB=randomDepth();
  var fs=depthToFontSize(startB);
  el.style.left=startX+'%'; el.style.bottom=startB+'%';
  el.style.fontSize=fs+'px'; el.style.zIndex=depthToZ(startB);

  var entity={
    el:el, emojiEl:emojiEl, shadowEl:shadowEl,
    chickId:chickTypeId,
    x:startX, b:startB,
    phase:Math.random()*Math.PI*2,
    dir:Math.random()>0.5?1:-1,
    angle:Math.random()*Math.PI*2,
    t:0,
    _wanderX:startX, _wanderB:startB, _wanderNext:0,
    _driftDepthTarget:undefined,
  };

  el.addEventListener('pointerdown', function(e) {
    e.stopPropagation();
    initAudio();
    state.stats.taps++;
    var ct2=CHICK_TYPES.find(function(c){return c.id===entity.chickId;})||CHICK_TYPES[0];
    var bonus=Math.ceil(2*ct2.seedBonus*(1+(state.speedBonus||0))*currentLocRate());
    var rect=el.getBoundingClientRect();
    addSeeds(bonus, rect.left+rect.width/2, rect.top);
    playTap();
    spawnHeart(rect.left+rect.width/2, rect.top);
  });

  $depthStage.appendChild(el);
  chickEntities.push(entity);
  return entity;
}

function updateChickEmojis() {
  var ct=CHICK_TYPES.find(function(c){return c.id===state.activeChick;})||CHICK_TYPES[0];
  chickEntities.forEach(function(e){ e.chickId=state.activeChick; e.emojiEl.textContent=ct.emoji; });
}

function applyMoveMode(entity) {
  var loc=LOCATIONS.find(function(l){return l.id===state.currentLoc;});
  var mode=loc?loc.moveMode:'wander';
  entity.el.classList.remove('move-wander','move-patrol','move-drift','move-circle','move-figure8');
  entity.el.classList.add('move-'+mode);
}

function resetAllChickPaths() {
  chickEntities.forEach(function(e) {
    e.phase=Math.random()*Math.PI*2; e.dir=Math.random()>.5?1:-1;
    e.angle=Math.random()*Math.PI*2; e.t=0; e._wanderNext=0;
    applyMoveMode(e);
  });
}

function moveSpeed() { return 1+(state.speedBonus||0); }

function currentLocRate() {
  var loc=LOCATIONS.find(function(l){return l.id===state.currentLoc;});
  return loc?loc.seedRate:1;
}

function tickMove(dt) {
  var loc=LOCATIONS.find(function(l){return l.id===state.currentLoc;});
  var mode=loc?loc.moveMode:'wander';
  var spd=moveSpeed();

  chickEntities.forEach(function(entity) {
    entity.t+=dt*spd;
    var newX=entity.x, newB=entity.b;

    if (mode==='wander') {
      if (entity.t>=entity._wanderNext) {
        entity._wanderX=5+Math.random()*85;
        entity._wanderB=randomDepth();
        entity._wanderNext=entity.t+(3+Math.random()*6)/spd;
      }
      entity.x+=(entity._wanderX-entity.x)*dt*0.8*spd;
      entity.b+=(entity._wanderB-entity.b)*dt*0.6*spd;
      newX=entity.x; newB=entity.b;

    } else if (mode==='drift') {
      entity.x+=entity.dir*dt*6*spd;
      entity.b+=Math.sin(entity.t*0.4)*dt*3*spd;
      if (entity.x>90){entity.x=90;entity.dir=-1;entity._driftDepthTarget=randomDepth();}
      if (entity.x< 5){entity.x= 5;entity.dir= 1;entity._driftDepthTarget=randomDepth();}
      if (entity._driftDepthTarget!==undefined) {
        entity.b+=(entity._driftDepthTarget-entity.b)*dt*0.5;
        if (Math.abs(entity.b-entity._driftDepthTarget)<0.5) entity._driftDepthTarget=undefined;
      }
      entity.b=Math.max(10,Math.min(55,entity.b));
      newX=entity.x; newB=entity.b;

    } else if (mode==='patrol') {
      entity.x+=entity.dir*dt*14*spd;
      if (entity.x>90){entity.x=90;entity.dir=-1;entity.b=randomDepth();}
      if (entity.x< 5){entity.x= 5;entity.dir= 1;entity.b=randomDepth();}
      entity.b=Math.max(10,Math.min(55,entity.b));
      newX=entity.x; newB=entity.b;

    } else if (mode==='circle') {
      entity.angle+=dt*0.6*spd;
      newX=45+35*Math.cos(entity.angle)+(entity.chickId.charCodeAt(0)%5)*3;
      newB=32+20*Math.sin(entity.angle);
      newB=Math.max(10,Math.min(55,newB));
      entity.x=newX; entity.b=newB;

    } else if (mode==='figure8') {
      entity.angle+=dt*0.5*spd;
      newX=45+38*Math.sin(entity.angle);
      newB=32+20*Math.sin(2*entity.angle);
      newB=Math.max(10,Math.min(55,newB));
      entity.x=newX; entity.b=newB;
    }

    var fs=depthToFontSize(newB);
    entity.el.style.left    =newX+'%';
    entity.el.style.bottom  =newB+'%';
    entity.el.style.fontSize=fs+'px';
    entity.el.style.zIndex  =depthToZ(newB);
    var movingRight=(mode==='patrol'||mode==='drift')&&entity.dir>0;
    entity.emojiEl.style.transform=movingRight?'scaleX(-1)':'scaleX(1)';
  });
}

/* ---- SCENE ITEMS ---- */
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
  el.style.left  =(5+Math.random()*85)+'%';
  el.style.bottom=(18+Math.random()*35)+'%';
  el.style.setProperty('--delay',(Math.random()*2)+'s');
  el.addEventListener('pointerdown',function(e){ e.stopPropagation(); collectItem(el,emoji,e); });
  $sceneItems.appendChild(el);
}

function collectItem(el, emoji, evt) {
  initAudio();
  var rect=el.getBoundingClientRect(); el.remove();
  var loc=LOCATIONS.find(function(l){return l.id===state.currentLoc;});
  var reward=Math.ceil(1*(loc?loc.seedRate:1))+(state.pickBonus||0);
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
  if (Math.random()<0.06){ state.songs++; showToast('🎵 새로운 노래를 들었어요!'); }
  state.stats.itemsPicked++;
}

/* ---- PARTICLES ---- */
function spawnParticles() {
  $particles.innerHTML='';
  var loc=LOCATIONS.find(function(l){return l.id===state.currentLoc;});
  if (!loc) return;
  for (var i=0;i<10;i++){
    var p=document.createElement('div'); p.className='particle';
    p.textContent=loc.particles[Math.floor(Math.random()*loc.particles.length)];
    p.style.left=Math.random()*90+'%'; p.style.bottom=Math.random()*50+'%';
    p.style.setProperty('--dur',(3+Math.random()*5)+'s');
    p.style.setProperty('--delay2',(Math.random()*6)+'s');
    p.style.setProperty('--dx',(-30+Math.random()*60)+'px');
    $particles.appendChild(p);
  }
}

/* ---- SEEDS ---- */
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
  var hearts=['💛','✨','🌟','🐥'];
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

/* ---- EVOLVE GAUGE ---- */
function tickEvolve(dt){
  var nextIdx=state.unlockedChicks.length;
  if (nextIdx>=CHICK_TYPES.length){
    $evolveLabel.textContent='🎉 모든 병아리 해금!';
    $evolveFill.style.width='100%'; $evolveTime.textContent='완료!'; return;
  }
  state.evolveTotal+=dt;
  var cycle=state.evolveTotal%EVOLVE_INTERVAL;
  state.evolveProgress=cycle/EVOLVE_INTERVAL;
  $evolveFill.style.width=(state.evolveProgress*100)+'%';
  $evolveTime.textContent=fmtTime(EVOLVE_INTERVAL-cycle);
  var nextChick=CHICK_TYPES[nextIdx];
  $evolveLabel.textContent=nextChick.emoji+' 까지';
  if (state.evolveTotal>=nextIdx*EVOLVE_INTERVAL+EVOLVE_INTERVAL){
    if (state.unlockedChicks.indexOf(nextChick.id)<0){
      state.unlockedChicks.push(nextChick.id);
      $statChicks.textContent=state.unlockedChicks.length;
      showToast('🎉 새 병아리 해금! '+nextChick.emoji+' '+nextChick.name);
      playEvolve(); buildChicks();
    }
  }
}

/* ---- AUTO SEED INCOME  (base: 1 seed / 3min) ---- */
function autoSeedRate(){ return (1+(state.autoBonus||0))/180; }

/* ---- LUCKY CLOVER ---- */
function tickLucky(dt){
  if ((state.luckyActive||0)>0){
    state.luckyActive-=dt;
    if (state.luckyActive<=0){ state.luckyActive=0; showToast('🍀 네잎클로버 효과 종료'); }
  }
}

/* ---- MAIN TICK ---- */
var lastTick=Date.now(), rafId=null;

function tick(){
  var now=Date.now(), dt=Math.min((now-lastTick)/1000,0.5); lastTick=now;
  var ag=autoSeedRate()*dt;
  state.seeds+=ag; state.totalSeeds+=ag;
  state.stats.autoSeeds+=ag; state.stats.playTime+=dt;
  updateSeedDisplay(); checkUnlocks(); updateTimeDisplay();
  tickEvolve(dt); tickLucky(dt); tickMove(dt);
  rafId=requestAnimationFrame(tick);
}

function updateTimeDisplay(){
  var s=Math.floor(state.stats.playTime);
  $timeDisp.textContent=String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor((s%3600)/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
}

/* ---- BUILD CHICKS ---- */
function buildChicks(){
  $depthStage.innerHTML=''; chickEntities.length=0;
  var toShow=state.unlockedChicks.slice(0,6);
  toShow.forEach(function(cid){ var e=createChickEntity(cid); applyMoveMode(e); });
  if (toShow.indexOf(state.activeChick)<0){ var e2=createChickEntity(state.activeChick); applyMoveMode(e2); }
  $statChicks.textContent=state.unlockedChicks.length;
}

/* ---- GAME INIT ---- */
function startNewGame(){ state=DEFAULT_STATE(); startGame(); }

function startGame(){
  if (rafId) cancelAnimationFrame(rafId);
  lastTick=Date.now();
  applyScene(); renderLocTabs(); spawnSceneItems(); spawnParticles(); buildChicks();
  updateSeedDisplay();
  var loc=LOCATIONS.find(function(l){return l.id===state.currentLoc;});
  $locName.textContent=loc?loc.name:'';
  $statPlaces.textContent=state.unlockedLocs.length;
  $btnSound.textContent=state.soundOn?'🔔':'🔕';
  showScreen('screen-game');
  rafId=requestAnimationFrame(tick);
  showToast('🐤 안녕! 여행을 시작해요~');
}

/* ---- BUTTON WIRING ---- */
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
});
$menuSave .addEventListener('click',function(){ saveGame(); closeAllPanels(); });
$menuTitle.addEventListener('click',function(){
  closeAllPanels();
  if(rafId) cancelAnimationFrame(rafId);
  showScreen('screen-title'); updateTitleButtons();
});
$menuReset.addEventListener('click',function(){ closeAllPanels(); $modalNew.classList.remove('hidden'); });
$gameScene.addEventListener('pointerdown',function(){ initAudio(); });

/* ---- TITLE BUTTONS ---- */
function updateTitleButtons(){ $btnCont.disabled=!hasSave(); }

$btnNew.addEventListener('click',function(){
  initAudio();
  hasSave()?$modalNew.classList.remove('hidden'):startNewGame();
});
$btnCont.addEventListener('click',function(){ initAudio(); if(loadGame()) startGame(); });
$btnNewOk.addEventListener('click',function(){ deleteSave(); $modalNew.classList.add('hidden'); startNewGame(); });
$btnNewCx.addEventListener('click',function(){ $modalNew.classList.add('hidden'); });

/* ---- AUTO SAVE ---- */
setInterval(function(){
  if ($screenGame.classList.contains('active')){
    try{ localStorage.setItem(SAVE_KEY,JSON.stringify(state)); }catch(e){}
  }
},30000);

document.addEventListener('visibilitychange',function(){ if(!document.hidden) lastTick=Date.now(); });

/* ---- BOOT ---- */
updateTitleButtons();
showScreen('screen-title');

}); // end DOMContentLoaded
