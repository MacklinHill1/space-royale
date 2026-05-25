// game/GameEngine.js

// ═══════════════════════════════════════════════════════════════════════════════
// MATH UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
export const V = {
  add:    (a,b) => ({x:a.x+b.x, y:a.y+b.y}),
  sub:    (a,b) => ({x:a.x-b.x, y:a.y-b.y}),
  scale:  (v,s) => ({x:v.x*s,   y:v.y*s}),
  len:    (v)   => Math.sqrt(v.x*v.x+v.y*v.y),
  norm:   (v)   => { const l=V.len(v)||1; return {x:v.x/l,y:v.y/l}; },
  dot:    (a,b) => a.x*b.x+a.y*b.y,
  lerp:   (a,b,t) => ({x:a.x+(b.x-a.x)*t, y:a.y+(b.y-a.y)*t}),
  dist:   (a,b) => V.len(V.sub(a,b)),
  angle:  (v)   => Math.atan2(v.y,v.x),
  fromAngle: (a,s=1) => ({x:Math.cos(a)*s, y:Math.sin(a)*s}),
  rotate: (v,a) => ({x:v.x*Math.cos(a)-v.y*Math.sin(a), y:v.x*Math.sin(a)+v.y*Math.cos(a)}),
  clamp:  (v,m) => { const l=V.len(v); return l>m ? V.scale(V.norm(v),m) : v; },
  zero:   ()    => ({x:0,y:0}),
  copy:   (v)   => ({x:v.x,y:v.y}),
};
export const rand    = (min,max) => Math.random()*(max-min)+min;
export const randInt = (min,max) => Math.floor(rand(min,max+1));
export const lerp    = (a,b,t)   => a+(b-a)*t;
export const TAU      = Math.PI*2;

// ═══════════════════════════════════════════════════════════════════════════════
// OBJECT POOL
// ═══════════════════════════════════════════════════════════════════════════════
class Pool {
  constructor(factory, reset, initSize=20) {
    this._free = [];
    this._active = new Set();
    this._factory = factory;
    this._reset = reset;
    for (let i=0;i<initSize;i++) this._free.push(factory());
  }
  get() {
    const obj = this._free.length ? this._free.pop() : this._factory();
    this._active.add(obj);
    return obj;
  }
  release(obj) {
    if (!this._active.has(obj)) return;
    this._active.delete(obj);
    this._reset(obj);
    this._free.push(obj);
  }
  forEach(fn) { this._active.forEach(fn); }
  get size()  { return this._active.size; }
  get all()   { return this._active; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEB AUDIO ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
export class AudioEngine {
  constructor() {
    this._ctx = null;
    this._muted = false;
  }
  _init() {
    if (this._ctx) return;
    try { this._ctx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){}
  }
  _tone(freq, type, dur, vol=0.3, delay=0) {
    if (this._muted || !this._ctx) return;
    try {
      const o = this._ctx.createOscillator();
      const g = this._ctx.createGain();
      o.connect(g); g.connect(this._ctx.destination);
      o.type = type; o.frequency.value = freq;
      const t = this._ctx.currentTime + delay;
      g.gain.setValueAtTime(vol,t);
      g.gain.exponentialRampToValueAtTime(0.001,t+dur);
      o.start(t); o.stop(t+dur+0.01);
    } catch(e){}
  }
  shoot()     { this._init(); this._tone(440,'square',0.08,0.15); }
  hit()       { this._init(); this._tone(180,'sawtooth',0.12,0.2); }
  explosion() { this._init(); this._tone(80,'sawtooth',0.3,0.35); this._tone(120,'square',0.2,0.2,0.05); }
  powerup()   { this._init(); [523,659,784].forEach((f,i)=>this._tone(f,'sine',0.15,0.25,i*0.1)); }
  levelup()   { this._init(); [523,659,784,1047].forEach((f,i)=>this._tone(f,'sine',0.2,0.3,i*0.08)); }
  bossAppear(){ this._init(); [110,87,73].forEach((f,i)=>this._tone(f,'sawtooth',0.5,0.4,i*0.15)); }
  purchase()  { this._init(); this._tone(660,'sine',0.15,0.25); this._tone(880,'sine',0.1,0.2,0.1); }
  damage()    { this._init(); this._tone(150,'square',0.1,0.3); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPGRADE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
export const UPGRADES = [
  { id:'dmg1',     name:'Plasma Boost',      desc:'+25% bullet damage',          icon:'🔥', rarity:'common',   cost:80,   category:'offense', apply: p=>{ p.damageMult+=0.25; } },
  { id:'dmg2',     name:'Void Core',          desc:'+60% bullet damage',          icon:'💀', rarity:'rare',      cost:200,  category:'offense', apply: p=>{ p.damageMult+=0.60; } },
  { id:'dmg3',     name:'Galactic Cannon',   desc:'+120% bullet damage',         icon:'⚡', rarity:'epic',      cost:450,  category:'offense', apply: p=>{ p.damageMult+=1.20; } },
  { id:'pen1',     name:'Piercing Shot',     desc:'Bullets pierce 1 extra enemy',icon:'🏹',rarity:'rare',      cost:250,  category:'offense', apply: p=>{ p.pierce+=1; } },
  { id:'multi1',   name:'Split Fire',        desc:'Fire 2 extra bullets',        icon:'🔱', rarity:'epic',      cost:380,  category:'offense', apply: p=>{ p.extraBullets+=2; } },
  { id:'crit1',    name:'Targeting Array',   desc:'+20% crit chance',            icon:'🎯', rarity:'uncommon', cost:150,  category:'offense', apply: p=>{ p.critChance+=0.20; } },
  { id:'fr1',      name:'Overcharge',        desc:'+30% fire rate',              icon:'⚡', rarity:'common',   cost:90,   category:'offense', apply: p=>{ p.fireRateMult+=0.30; } },
  { id:'fr2',      name:'Rapid Pulse',       desc:'+70% fire rate',              icon:'🌀', rarity:'rare',      cost:220,  category:'offense', apply: p=>{ p.fireRateMult+=0.70; } },
  { id:'hp1',      name:'Hull Plating',      desc:'+40 max HP',                  icon:'🛡', rarity:'common',   cost:70,   category:'defense', apply: p=>{ p.maxHp+=40; p.hp+=40; } },
  { id:'hp2',      name:'Void Armor',        desc:'+100 max HP',                 icon:'⚙', rarity:'rare',      cost:210,  category:'defense', apply: p=>{ p.maxHp+=100; p.hp+=100; } },
  { id:'regen1',   name:'Nano-Repair',       desc:'Regen 2 HP/sec',              icon:'💚', rarity:'uncommon', cost:160,  category:'defense', apply: p=>{ p.hpRegen+=2; } },
  { id:'regen2',   name:'Bio-Matrix',        desc:'Regen 6 HP/sec',              icon:'🌿', rarity:'epic',      cost:400,  category:'defense', apply: p=>{ p.hpRegen+=6; } },
  { id:'shield1',  name:'Energy Shield',      desc:'Absorb 30 damage once/10s',  icon:'🔵', rarity:'rare',      cost:280,  category:'defense', apply: p=>{ p.shieldMax+=30; p.shield+=30; } },
  { id:'iframes1', name:'Phase Drive',       desc:'+0.3s invuln after hit',      icon:'👻', rarity:'uncommon', cost:180,  category:'defense', apply: p=>{ p.iFrameBonus+=0.3; } },
  { id:'spd1',     name:'Ion Thrusters',     desc:'+20% movement speed',         icon:'🚀', rarity:'common',   cost:75,   category:'movement',apply: p=>{ p.speedMult+=0.20; } },
  { id:'spd2',     name:'Warp Core',          desc:'+50% movement speed',         icon:'🌠', rarity:'rare',      cost:230,  category:'movement',apply: p=>{ p.speedMult+=0.50; } },
  { id:'dash1',    name:'Quantum Dash',      desc:'Dash distance +50%',          icon:'💨', rarity:'uncommon', cost:140,  category:'movement',apply: p=>{ p.dashDistMult+=0.50; } },
  { id:'mag1',     name:'Gravity Magnet',    desc:'Pull XP/gold from 150px',    icon:'🧲', rarity:'uncommon', cost:130,  category:'utility', apply: p=>{ p.magnetRadius+=150; } },
  { id:'mag2',     name:'Singularity Core',  desc:'Pull XP/gold from 350px',    icon:'🌑', rarity:'epic',      cost:370,  category:'utility', apply: p=>{ p.magnetRadius+=350; } },
  { id:'xpm1',     name:'XP Amplifier',      desc:'+50% XP gain',               icon:'⭐', rarity:'uncommon', cost:120,  category:'utility', apply: p=>{ p.xpMult+=0.50; } },
  { id:'gold1',    name:'Gold Plating',      desc:'+40% gold gain',              icon:'🪙', rarity:'uncommon', cost:110,  category:'utility', apply: p=>{ p.goldMult+=0.40; } },
  { id:'drone1',   name:'Combat Drone',      desc:'Summon auto-targeting drone', icon:'🤖',rarity:'epic',      cost:420,  category:'utility', apply: p=>{ p.drones+=1; } },
  { id:'drone2',   name:'Drone Squadron',    desc:'Summon 2 more drones',       icon:'👾', rarity:'legendary',cost:800,  category:'utility', apply: p=>{ p.drones+=2; } },
  { id:'bomb1',    name:'Void Bomb',          desc:'Bomb ability: AoE 200dmg',   icon:'💣', rarity:'rare',      cost:300,  category:'utility', apply: p=>{ p.bombDmg+=200; } },
  { id:'leg1',     name:'Cosmic Slayer',      desc:'+100% dmg, +50% fire rate',  icon:'🌌', rarity:'legendary',cost:1200, category:'offense', apply: p=>{ p.damageMult+=1.0; p.fireRateMult+=0.50; } },
  { id:'leg2',     name:'Immortal Core',      desc:'+200 HP, regen 10/s, shield 60',icon:'♾',rarity:'legendary',cost:1400,category:'defense', apply: p=>{ p.maxHp+=200;p.hp+=200;p.hpRegen+=10;p.shieldMax+=60;p.shield+=60; } },
  { id:'leg3',     name:'Ghost Protocol',    desc:'+80% speed, +0.6s iframes',  icon:'👁', rarity:'legendary',cost:1100, category:'movement',apply: p=>{ p.speedMult+=0.80; p.iFrameBonus+=0.6; } },
];

export const RARITY_COLOR = { common:'#9ca3af', uncommon:'#4ade80', rare:'#60a5fa', epic:'#c084fc', legendary:'#fbbf24' };
export const RARITY_GLOW  = { common:'rgba(156,163,175,0.3)', uncommon:'rgba(74,222,128,0.3)', rare:'rgba(96,165,250,0.3)', epic:'rgba(192,132,252,0.4)', legendary:'rgba(251,191,36,0.5)' };

// ═══════════════════════════════════════════════════════════════════════════════
// STATE STATE FACTORY & DATA CONFIGS
// ═══════════════════════════════════════════════════════════════════════════════
const createPlayer = (cx, cy) => ({
  pos: {x:cx, y:cy}, vel: V.zero(), angle: -Math.PI/2,
  hp: 100, maxHp: 100, hpRegen: 0, shield: 0, shieldMax: 0, shieldCooldown: 0,
  xp: 0, xpToNext: 100, level: 1, gold: 0, score: 0, kills: 0,
  damageMult: 1.0, fireRateMult: 1.0, speedMult: 1.0, dashDistMult: 1.0,
  pierce: 0, extraBullets: 0, critChance: 0.05, magnetRadius: 80,
  xpMult: 1.0, goldMult: 1.0, drones: 0, bombDmg: 0, iFrameBonus: 0,
  iFrameTimer: 0, fireCooldown: 0, dashCooldown: 0, bombCooldown: 0, magnetCooldown:0,
  dead: false, invuln: false, radius: 12, trail: [], exhaustTimer: 0,
});

const makeEnemy = () => ({
  pos:{x:0,y:0}, vel:{x:0,y:0}, angle:0, hp:1, maxHp:1, radius:12,
  type:'drone', color:'#ef4444', glowColor:'#ef444466', speed:1, damage:8, xpDrop:10, goldDrop:5,
  state:'chase', stateTimer:0, shootCooldown:0, fireRate:0, active:false, flash:0, phase:1, spawnFlash:0,
});
const makeBullet = () => ({ pos:{x:0,y:0}, vel:{x:0,y:0}, damage:1, radius:4, color:'#38bdf8', pierce:0, pierceCount:0, active:false, owner:'player', lifetime:0, maxLifetime:90, homing:false, homingTarget:null, trail:[], });
const makeParticle = () => ({ pos:{x:0,y:0}, vel:{x:0,y:0}, color:'#fff', alpha:1, size:2, life:1, maxLife:1, active:false, type:'dot', });
const makeLoot = () => ({ pos:{x:0,y:0}, vel:{x:0,y:0}, type:'xp', value:10, radius:6, color:'#38bdf8', active:false, pulse:0, attracted:false, });
const makeDrone = () => ({ pos:{x:0,y:0}, angle:0, orbitAngle:0, shootCooldown:0, active:false, });

const BOSSES = [
  { name:'Asteroid Titan', color:'#92400e', accent:'#fbbf24', radius:55, hpBase:800, xpDrop:500, goldDrop:300, phases:[ { hpThresh:1.0, attacks:['boulder_throw','orbit_rocks'],  speed:1.2, fireRate:90  }, { hpThresh:0.5, attacks:['boulder_throw','laser_sweep'],  speed:1.8, fireRate:60  }, { hpThresh:0.2, attacks:['rapid_fire','laser_sweep'],     speed:2.2, fireRate:35  } ] },
  { name:'Void Serpent', color:'#4c1d95', accent:'#a855f7', radius:45, hpBase:650, xpDrop:600, goldDrop:350, phases:[ { hpThresh:1.0, attacks:['plasma_breath','teleport'],      speed:2.0, fireRate:75  }, { hpThresh:0.4, attacks:['plasma_breath','homing_burst'], speed:2.8, fireRate:45  } ] },
  { name:'Galactic Destroyer', color:'#1e3a5f', accent:'#38bdf8', radius:65, hpBase:1200, xpDrop:700, goldDrop:500, phases:[ { hpThresh:1.0, attacks:['satellite_swarm','laser_sweep'], speed:1.0, fireRate:100 }, { hpThresh:0.6, attacks:['rapid_fire','laser_sweep'],       speed:1.5, fireRate:55  }, { hpThresh:0.25,attacks:['rapid_fire','ram_charge'],       speed:2.5, fireRate:30  } ] },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CORE GAME ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════
export class GameEngine {
  constructor(canvas, onStateChange, audio) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.W       = canvas.width;
    this.H       = canvas.height;
    this.onStateChange = onStateChange;
    this.audio   = audio;
    this.running = false;
    this.raf     = null;
    this.lastTime= 0;
    this.tick    = 0;

    this.keys    = {};
    this.mouse   = {x:0,y:0,down:false,wx:0,wy:0};

    this.bullets   = new Pool(makeBullet,  b=>{b.active=false;b.trail=[];b.pierceCount=0;b.homing=false;}, 120);
    this.particles = new Pool(makeParticle,p=>{p.active=false;}, 400);
    this.loot      = new Pool(makeLoot,    l=>{l.active=false;l.attracted=false;}, 150);
    this.droneParts= new Pool(makeDrone,   d=>{d.active=false;}, 8);

    this.player       = null;
    this.enemies      = [];
    this.enemyBullets = [];
    this.activeDrones = [];
    this.boss         = null;
    this.bossData      = null;
    this.bossPhase    = 0;
    this.bossAttackTimer = 0;
    this.bossAttackIdx   = 0;

    this.stars       = [];
    this.starsNear   = [];
    this.pods        = [];
    this.camera      = {x:0,y:0};

    this.sessionTime    = 0;
    this.nextBossTime   = 300;
    this.waveTimer      = 0;
    this.wave           = 1;
    this.spawnTimer     = 0;
    this.spawnInterval  = 120;
    this.purchasedItems = [];
    this.mode           = 'endless';

    this.activeEvent    = null;
    this.eventTimer      = 0;
    this.nextEventTime  = rand(60,120);

    this.shake      = 0;
    this.shakeX     = 0;
    this.shakeY     = 0;

    this.uiState    = {};
    this.shopOpen   = false;
    this.gameOver   = false;
    this.paused     = false;

    this._initStars();
    this._initPods();
    this._bindInput();
  }

  _initStars() {
    for (let i=0;i<200;i++) this.stars.push({ x:rand(-3000,3000),y:rand(-3000,3000), size:rand(0.5,2.5),alpha:rand(0.3,1), twinkle:rand(0,TAU), });
    for (let i=0;i<80;i++) this.starsNear.push({ x:rand(-2000,2000),y:rand(-2000,2000), size:rand(1,4),alpha:rand(0.5,1), color:['#a5b4fc','#93c5fd','#86efac','#fde68a'][randInt(0,3)], });
  }

  _initPods() {
    for (let i=0;i<50;i++) {
      const angle = rand(0,TAU);
      const dist  = rand(200,2000);
      this.pods.push({ pos:{x:Math.cos(angle)*dist,y:Math.sin(angle)*dist}, hp:3, maxHp:3, radius:18, type: Math.random()<0.8 ? 'resource' : 'powerup', spin:rand(0,TAU), spinSpeed:rand(-0.01,0.01), pulse:rand(0,TAU), active:true, });
    }
  }

  _bindInput() {
    this._onKey = (e) => {
      const key = e.code || e.key;
      const down = e.type==='keydown';
      this.keys[key] = down;
      if (down && key==='KeyE' && !this.gameOver && !this.shopOpen) this._toggleShop();
      if (down && key==='KeyQ') this._useBomb();
      if (down && key==='KeyF') this._useMagnet();
      if (down && (key==='Space'||key==='ShiftLeft')) this._dash();
      if (down && key==='Escape') this._toggleShop();
    };
    this._onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const sx = this.canvas.width  / rect.width;
      const sy = this.canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * sx;
      this.mouse.y = (e.clientY - rect.top)  * sy;
      if (this.player) {
        this.mouse.wx = this.mouse.x - this.W/2 + this.camera.x;
        this.mouse.wy = this.mouse.y - this.H/2 + this.camera.y;
      }
    };
    this._onMouseDown = (e) => { if (e.button===0) this.mouse.down = true; };
    this._onMouseUp   = (e) => { if (e.button===0) this.mouse.down = false; };
    window.addEventListener('keydown',    this._onKey);
    window.addEventListener('keyup',      this._onKey);
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    this.canvas.addEventListener('mouseup',   this._onMouseUp);
  }

  destroy() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown',    this._onKey);
    window.removeEventListener('keyup',      this._onKey);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    this.canvas.removeEventListener('mouseup',   this._onMouseUp);
  }

  startGame(mode='endless') {
    this.mode         = mode;
    this.player       = createPlayer(0, 0);
    this.enemies      = [];
    this.activeDrones = [];
    this.boss         = null;
    this.sessionTime  = 0;
    this.wave         = 1;
    this.waveTimer    = 0;
    this.spawnTimer   = 0;
    this.spawnInterval= 120;
    this.purchasedItems = [];
    this.gameOver     = false;
    this.shopOpen     = false;
    this.bossAttackTimer = 0;
    this.activeEvent  = null;
    this.nextEventTime= rand(60,120);
    if (mode==='speed')    { this.player.xpMult=3; this.player.goldMult=3; this.spawnInterval=60; }
    if (mode==='hardcore') { this.player.maxHp=60; this.player.hp=60; }
    if (mode==='boss')     { this.nextBossTime=30; }
    this.nextBossTime = mode==='boss' ? 30 : 300;
    this.pods = [];
    this._initPods();
    this._syncUI();
    this.running = true;
    this.lastTime = performance.now();
    this._loop(this.lastTime);
  }

  _loop(now) {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime)/16.667, 3);
    this.lastTime = now;
    if (!this.paused && !this.shopOpen && !this.gameOver) { this._update(dt); }
    this._render();
    this.raf = requestAnimationFrame(t=>this._loop(t));
  }

  _update(dt) {
    this.tick++;
    this.sessionTime += dt * 0.016667;
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt*0.5);
      this.shakeX = rand(-this.shake,this.shake);
      this.shakeY = rand(-this.shake,this.shake);
    }
    this._updatePlayer(dt);
    this._updateDrones(dt);
    this._updateEnemies(dt);
    this._updateBoss(dt);
    this._updateBullets(dt);
    this._updateLoot(dt);
    this._updateParticles(dt);
    this._updatePods(dt);
    this._updateSpawning(dt);
    this._updateEvents(dt);
    this._updateWave(dt);
    this._syncUI();
  }

  _updatePlayer(dt) {
    const p = this.player; if (!p || p.dead) return;
    if (p.fireCooldown > 0)  p.fireCooldown  -= dt;
    if (p.dashCooldown > 0)  p.dashCooldown  -= dt;
    if (p.bombCooldown > 0)  p.bombCooldown  -= dt;
    if (p.iFrameTimer  > 0)  { p.iFrameTimer -= dt; p.invuln = p.iFrameTimer > 0; }
    if (p.shieldCooldown>0)  p.shieldCooldown -= dt;
    if (p.shieldMax>0 && p.shield<p.shieldMax && p.shieldCooldown<=0) { p.shield = Math.min(p.shieldMax, p.shield + dt*0.5); }
    if (p.hpRegen > 0) p.hp = Math.min(p.maxHp, p.hp + p.hpRegen*dt*0.016667);

    const speed = 220 * p.speedMult; const acc = {x:0,y:0};
    if (this.keys['KeyW']||this.keys['ArrowUp'])    acc.y -= 1;
    if (this.keys['KeyS']||this.keys['ArrowDown'])  acc.y += 1;
    if (this.keys['KeyA']||this.keys['ArrowLeft'])  acc.x -= 1;
    if (this.keys['KeyD']||this.keys['ArrowRight']) acc.x += 1;
    const l = V.len(acc);
    if (l>0) { p.vel = V.lerp(p.vel, V.scale(V.norm(acc), speed), 0.18*dt); } else { p.vel = V.lerp(p.vel, V.zero(), 0.15*dt); }
    p.pos = V.add(p.pos, V.scale(p.vel, dt*0.016667));
    p.angle = Math.atan2(this.mouse.wy - p.pos.y, this.mouse.wx - p.pos.x);

    this.camera.x = lerp(this.camera.x, p.pos.x, 0.1*dt);
    this.camera.y = lerp(this.camera.y, p.pos.y, 0.1*dt);
    this.mouse.wx = this.mouse.x - this.W/2 + this.camera.x;
    this.mouse.wy = this.mouse.y - this.H/2 + this.camera.y;

    p.trail.push(V.copy(p.pos)); if (p.trail.length > 14) p.trail.shift();

    if ((this.mouse.down || this.keys['Space']) && p.fireCooldown<=0) {
      this._playerShoot(); p.fireCooldown = 12 / p.fireRateMult;
    }
    if (p.magnetRadius > 0) {
      this.loot.forEach(l => { if (l.active && V.dist(l.pos, p.pos) < p.magnetRadius) l.attracted = true; });
    }
  }

  _playerShoot() {
    const p = this.player; const angles = [0];
    if (p.extraBullets>=2) angles.push(-0.2, 0.2);
    if (p.extraBullets>=4) angles.push(-0.35, 0.35);
    angles.forEach(offset => {
      const b = this.bullets.get(); b.active = true; b.owner = 'player'; b.pos = V.copy(p.pos);
      const isCrit = Math.random() < p.critChance; b.damage = (10 * p.damageMult) * (isCrit ? 2.2 : 1);
      b.pierce = p.pierce; b.pierceCount = 0; b.maxLifetime = 75; b.lifetime = 0;
      const spd = 700; const a = p.angle + offset; b.vel = {x:Math.cos(a)*spd/60, y:Math.sin(a)*spd/60};
      b.radius = isCrit ? 6 : 4; b.color = isCrit ? '#fbbf24' : '#38bdf8';
      if (isCrit) this._spawnParticles(b.pos, '#fbbf24', 3, 1.5, 12);
    });
    this.audio.shoot();
  }

  _dash() {
    const p = this.player; if (!p || p.dashCooldown > 0) return;
    const dx = this.keys['KeyA']||this.keys['ArrowLeft'] ? -1 : this.keys['KeyD']||this.keys['ArrowRight']? 1 : Math.cos(p.angle);
    const dy = this.keys['KeyW']||this.keys['ArrowUp']   ? -1 : this.keys['KeyS']||this.keys['ArrowDown'] ? 1 : Math.sin(p.angle);
    p.vel = V.scale(V.norm({x:dx,y:dy}), 110 * (1 + p.dashDistMult));
    p.iFrameTimer = 0.35; p.invuln = true; p.dashCooldown = 90;
    this._spawnParticles(p.pos, '#a5f3fc', 10, 3, 18);
  }

  _useBomb() {
    const p = this.player; if (!p || p.bombCooldown>0 || p.bombDmg<=0) return;
    this._spawnParticles(p.pos, '#fbbf24', 30, 5, 40); this._spawnParticles(p.pos, '#ef4444', 20, 4, 30);
    this.shake = 8; this.audio.explosion();
    this.enemies.forEach(e => {
      if (V.dist(e.pos, p.pos) < 200+e.radius) { e.hp -= p.bombDmg * p.damageMult; e.flash = 8; if (e.hp<=0) this._killEnemy(e); }
    });
    if (this.boss && V.dist(this.boss.pos, p.pos) < 200+this.boss.radius) { this.boss.hp -= p.bombDmg*0.5; this.boss.flash = 10; }
    p.bombCooldown = 300;
  }

  _useMagnet() {
    if (!this.player) return;
    this.loot.forEach(l => { if (l.active) l.attracted = true; });
    this._spawnParticles(this.player.pos, '#818cf8', 15, 3, 25);
    this.player.magnetCooldown = 180;
  }

  _updateDrones(dt) {
    const p = this.player; if (!p) return;
    while (this.activeDrones.length < p.drones) {
      const d = this.droneParts.get(); d.active = true; d.pos = V.copy(p.pos);
      d.orbitAngle = (TAU/p.drones)*this.activeDrones.length; d.shootCooldown = 30; this.activeDrones.push(d);
    }
    while (this.activeDrones.length > p.drones) { this.droneParts.release(this.activeDrones.pop()); }
    this.activeDrones.forEach((d) => {
      d.orbitAngle += 0.025*dt;
      d.pos = V.lerp(d.pos, { x: p.pos.x + Math.cos(d.orbitAngle)*55, y: p.pos.y + Math.sin(d.orbitAngle)*55 }, 0.25*dt);
      d.shootCooldown -= dt;
      if (d.shootCooldown <= 0) {
        let nearestEnemy = null, nearestDist = 300;
        this.enemies.forEach(e => { const dist = V.dist(d.pos, e.pos); if (dist < nearestDist) { nearestDist=dist; nearestEnemy=e; } });
        if (this.boss && V.dist(d.pos,this.boss.pos)<350) nearestEnemy=this.boss;
        if (nearestEnemy) {
          const b = this.bullets.get(); b.active=true; b.owner='player'; b.pos=V.copy(d.pos); b.vel=V.scale(V.norm(V.sub(nearestEnemy.pos, d.pos)),8);
          b.damage=8*p.damageMult; b.radius=3; b.color='#a5f3fc'; b.pierce=0; b.maxLifetime=50; b.lifetime=0; d.shootCooldown = 20;
        } else { d.shootCooldown = 15; }
      }
    });
  }

  _updateEnemies(dt) {
    const p = this.player; if (!p || p.dead) return;
    this.enemies = this.enemies.filter(e => e.active);
    this.enemies.forEach(e => {
      if (e.spawnFlash>0) { e.spawnFlash-=dt; return; }
      const dx = p.pos.x - e.pos.x; const dy = p.pos.y - e.pos.y; const dist = Math.sqrt(dx*dx+dy*dy)||1;
      e.angle = Math.atan2(dy,dx); if (e.flash>0) e.flash-=dt;
      const nx = dx/dist; const ny = dy/dist;

      if (e.type === 'drone') {
        e.vel.x = (e.vel.x + nx*e.speed*0.3*dt)*0.9; e.vel.y = (e.vel.y + ny*e.speed*0.3*dt)*0.9;
        if (e.shootCooldown<=0 && dist<250) { this._enemyShoot(e, {x:nx,y:ny}, 5, 4); e.shootCooldown = e.fireRate; } else { e.shootCooldown-=dt; }
      } else if (e.type === 'kamikaze') {
        e.vel.x = (e.vel.x + nx*e.speed*0.5*dt)*0.95; e.vel.y = (e.vel.y + ny*e.speed*0.5*dt)*0.95;
      } else if (e.type === 'tank') {
        e.vel.x = (e.vel.x + nx*e.speed*0.15*dt)*0.88; e.vel.y = (e.vel.y + ny*e.speed*0.15*dt)*0.88;
        if (e.shootCooldown<=0 && dist<400) { this._enemyShoot(e, {x:nx,y:ny}, 18, 3); e.shootCooldown = e.fireRate; } else { e.shootCooldown-=dt; }
      } else if (e.type === 'sniper') {
        const factor = dist > 300 ? 0.2 : -0.1; e.vel.x = (e.vel.x + nx*e.speed*factor*dt)*0.92; e.vel.y = (e.vel.y + ny*e.speed*factor*dt)*0.92;
        if (e.shootCooldown<=0 && dist<500) { this._enemyShoot(e, {x:nx,y:ny}, 25, 6); e.shootCooldown = e.fireRate; } else { e.shootCooldown-=dt; }
      } else if (e.type === 'swarm') {
        e.vel.x = (e.vel.x + nx*e.speed*0.45*dt)*0.92; e.vel.y = (e.vel.y + ny*e.speed*0.45*dt)*0.92;
        this.enemies.forEach(o=>{
          if(o!==e && o.type==='swarm') {
            const sd=V.dist(e.pos,o.pos);
            if(sd<25&&sd>0){ const sn=V.norm(V.sub(e.pos,o.pos)); e.vel.x+=sn.x*2*dt; e.vel.y+=sn.y*2*dt; }
          }
        });
      }
      e.pos.x += e.vel.x*dt; e.pos.y += e.vel.y*dt;
      if (dist < e.radius + p.radius && !p.invuln) {
        this._damagePlayer(e.damage); this.audio.damage();
        if (e.type==='kamikaze') { this._spawnParticles(e.pos, e.color, 12, 3, 20); this._killEnemy(e); }
      }
    });
  }

  _enemyShoot(e, dir, damage, speed) {
    const b = this.bullets.get(); b.active=true; b.owner='enemy'; b.pos={x:e.pos.x,y:e.pos.y};
    b.vel={x:dir.x*speed, y:dir.y*speed}; b.damage=damage; b.radius=5; b.color='#f87171'; b.pierce=0; b.maxLifetime=70; b.lifetime=0;
  }

  _killEnemy(e) {
    if (!e.active || !this.player) return;
    e.active = false; this.player.kills++;
    const xpGain = Math.floor(e.xpDrop * this.player.xpMult);
    const goldGain = Math.floor(e.goldDrop * this.player.goldMult);
    this._spawnLoot(e.pos, xpGain, goldGain);
    this._spawnParticles(e.pos, e.color, 12, 3, 20);
    this.audio.explosion(); this.player.score += e.xpDrop; this._grantXP(xpGain);
  }

  _updateBoss(dt) {
    const b = this.boss;
    if (!b || !b.active) {
      if (this.sessionTime >= this.nextBossTime && !this.boss) {
        this._spawnBoss(); this.nextBossTime += this.mode==='boss' ? 60 : 300;
      }
      return;
    }
    const p = this.player; if (!p||p.dead) return;
    if (b.flash>0) b.flash-=dt; if (b.spawnFlash>0) { b.spawnFlash-=dt; return; }

    const hpPct = b.hp/b.maxHp; let newPhase = 0;
    for (let i=this.bossData.phases.length-1;i>=0;i--) { if (hpPct <= this.bossData.phases[i].hpThresh) { newPhase=i; break; } }
    if (newPhase>this.bossPhase) { this.bossPhase = newPhase; this.shake = 12; this._spawnParticles(b.pos, this.bossData.accent, 30, 5, 40); }

    const phase = this.bossData.phases[this.bossPhase]; const dx = p.pos.x-b.pos.x, dy=p.pos.y-b.pos.y; const dist = Math.sqrt(dx*dx+dy*dy)||1;
    const nx=dx/dist, ny=dy/dist; const spd = phase.speed;

    b.angle += 0.005*dt*spd;
    if (dist > 310) { b.vel.x += nx*spd*0.3*dt; b.vel.y += ny*spd*0.3*dt; }
    else if (dist < 250) { b.vel.x -= nx*spd*0.2*dt; b.vel.y -= ny*spd*0.2*dt; }
    else { b.vel.x += Math.cos(b.angle)*spd*0.2*dt; b.vel.y += Math.sin(b.angle)*spd*0.2*dt; }
    b.vel.x *= 0.92; b.vel.y *= 0.92; b.pos.x += b.vel.x*dt; b.pos.y += b.vel.y*dt;

    this.bossAttackTimer -= dt;
    if (this.bossAttackTimer <= 0) {
      this._doBossAttack(b, phase.attacks[this.bossAttackIdx % phase.attacks.length], nx, ny, p);
      this.bossAttackIdx++; this.bossAttackTimer = phase.fireRate;
    }
    if (dist < b.radius + p.radius && !p.invuln) { this._damagePlayer(20); }
    if (b.hp <= 0) { this._killBoss(); }
  }

  _doBossAttack(b, attack, nx, ny, p) {
    if (attack === 'boulder_throw') {
      for (let i=0;i<5;i++) {
        const bullet = this.bullets.get(); bullet.active=true; bullet.owner='boss'; bullet.pos=V.copy(b.pos);
        const a = Math.atan2(ny,nx) + (i-2)*0.25; bullet.vel={x:Math.cos(a)*5, y:Math.sin(a)*5};
        bullet.damage=22; bullet.radius=9; bullet.color='#92400e'; bullet.maxLifetime=100; bullet.lifetime=0;
      }
      this.audio.explosion();
    } else if (attack === 'laser_sweep') {
      for (let i=0;i<8;i++) {
        const bullet = this.bullets.get(); bullet.active=true; bullet.owner='boss'; bullet.pos=V.copy(b.pos);
        const a = (i/8)*TAU + b.angle; bullet.vel={x:Math.cos(a)*7, y:Math.sin(a)*7};
        bullet.damage=15; bullet.radius=5; bullet.color='#ef4444'; bullet.maxLifetime=80; bullet.lifetime=0;
      }
      this.shake=6;
    } else if (attack === 'rapid_fire') {
      for(let i=0;i<3;i++) {
        const bullet = this.bullets.get(); bullet.active=true; bullet.owner='boss'; bullet.pos=V.copy(b.pos);
        const a=Math.atan2(ny,nx)+rand(-0.15,0.15); bullet.vel={x:Math.cos(a)*9, y:Math.sin(a)*9};
        bullet.damage=12; bullet.radius=5; bullet.color='#f97316'; bullet.maxLifetime=65; bullet.lifetime=0;
      }
    } else if (attack === 'homing_burst') {
      for(let i=0;i<4;i++) {
        const bullet = this.bullets.get(); bullet.active=true; bullet.owner='boss'; const a=(i/4)*TAU;
        bullet.pos={x:b.pos.x+Math.cos(a)*b.radius, y:b.pos.y+Math.sin(a)*b.radius}; bullet.vel={x:Math.cos(a)*4, y:Math.sin(a)*4};
        bullet.damage=18; bullet.radius=6; bullet.color='#a855f7'; bullet.homing=true; bullet.homingTarget=p; bullet.maxLifetime=120; bullet.lifetime=0;
      }
    } else if (attack === 'satellite_swarm') {
      for(let i=0;i<12;i++) {
        const bullet = this.bullets.get(); bullet.active=true; bullet.owner='boss'; const a=(i/12)*TAU;
        bullet.pos={x:b.pos.x+Math.cos(a)*b.radius, y:b.pos.y+Math.sin(a)*b.radius}; bullet.vel={x:Math.cos(a)*5, y:Math.sin(a)*5};
        bullet.damage=10; bullet.radius=4; bullet.color='#38bdf8'; bullet.maxLifetime=90; bullet.lifetime=0;
      }
    } else if (attack === 'plasma_breath') {
      for(let i=0;i<6;i++) {
        const bullet = this.bullets.get(); bullet.active=true; bullet.owner='boss'; bullet.pos=V.copy(b.pos);
        const a=Math.atan2(ny,nx)+rand(-0.3,0.3); bullet.vel={x:Math.cos(a)*8, y:Math.sin(a)*8};
        bullet.damage=20; bullet.radius=7; bullet.color='#6d28d9'; bullet.maxLifetime=70; bullet.lifetime=0;
      }
    } else if (attack === 'ram_charge') {
      b.vel.x=nx*12; b.vel.y=ny*12; this.shake=5;
    } else if (attack === 'teleport') {
      b.pos=V.add(p.pos, V.fromAngle(rand(0,TAU), rand(150,300))); this._spawnParticles(b.pos, '#a855f7', 25, 4, 30); b.vel=V.zero();
    } else if (attack === 'orbit_rocks') {
      for(let i=0;i<6;i++) {
        const bullet = this.bullets.get(); bullet.active=true; bullet.owner='boss'; const a=(i/6)*TAU+b.angle;
        bullet.pos={x:b.pos.x+Math.cos(a)*(b.radius+30), y:b.pos.y+Math.sin(a)*(b.radius+30)}; const tangent = a+Math.PI/2;
        bullet.vel={x:Math.cos(tangent)*3, y:Math.sin(tangent)*3}; bullet.damage=14; bullet.radius=7; bullet.color='#78716c'; bullet.maxLifetime=110; bullet.lifetime=0;
      }
    }
  }

  _spawnBoss() {
    const data = BOSSES[randInt(0, BOSSES.length-1)]; const angle= rand(0,TAU); const waveScale = 1 + (this.wave-1)*0.15;
    this.boss = {
      pos: {x:this.player.pos.x+Math.cos(angle)*500, y:this.player.pos.y+Math.sin(angle)*500}, vel: V.zero(),
      hp: data.hpBase * waveScale, maxHp: data.hpBase * waveScale, angle: 0, radius: data.radius, flash: 0, active: true, spawnFlash: 60,
    };
    this.bossData = data; this.bossPhase = 0; this.bossAttackTimer = 120; this.bossAttackIdx = 0; this.shake = 15;
    this.audio.bossAppear(); this._spawnParticles(this.boss.pos, data.accent, 40, 6, 60);
    this.onStateChange({bossName: data.name, bossAlert: true}); setTimeout(()=>this.onStateChange({bossAlert:false}), 3000);
  }

  _killBoss() {
    if (!this.boss || !this.bossData) return;
    this._spawnLoot(this.boss.pos, this.bossData.xpDrop, this.bossData.goldDrop);
    this._spawnParticles(this.boss.pos, this.bossData.accent, 60, 7, 80); this._spawnParticles(this.boss.pos, '#fff', 30, 5, 50);
    this.shake=20; this.audio.explosion(); this.player.score += this.bossData.xpDrop*5; this._grantXP(this.bossData.xpDrop * this.player.xpMult);
    this.boss.active=false; this.boss=null; this.bossData=null; this.onStateChange({bossName:null});
  }

  _updateBullets(dt) {
    this.bullets.forEach(b => {
      if (!b.active) return;
      b.lifetime += dt; if (b.lifetime >= b.maxLifetime) { this.bullets.release(b); return; }
      if (b.homing && b.homingTarget) {
        const tgt = b.homingTarget.pos || b.homingTarget;
        if (tgt) { const dir = V.norm(V.sub(tgt, b.pos)); b.vel.x = lerp(b.vel.x, dir.x*6, 0.05*dt); b.vel.y = lerp(b.vel.y, dir.y*6, 0.05*dt); }
      }
      b.pos.x += b.vel.x*dt; b.pos.y += b.vel.y*dt; b.trail.push({x:b.pos.x,y:b.pos.y}); if (b.trail.length>5) b.trail.shift();

      if (b.owner==='player') {
        this.enemies.forEach(e => {
          if (!e.active || b.pierceCount>b.pierce) return;
          if (V.dist(b.pos,e.pos) < b.radius+e.radius) {
            e.hp -= b.damage; e.flash = 8; b.pierceCount++; this._spawnParticles(b.pos, '#fbbf24', 4, 1.5, 10);
            this.audio.hit(); if (e.hp<=0) this._killEnemy(e); if (b.pierceCount>b.pierce) { this.bullets.release(b); return; }
          }
        });
        if (this.boss && this.boss.active && b.active && V.dist(b.pos,this.boss.pos) < b.radius+this.boss.radius) {
          this.boss.hp -= b.damage; this.boss.flash=5; this._spawnParticles(b.pos, this.bossData.accent, 5, 2, 12);
          this.audio.hit(); if(b.active) this.bullets.release(b);
        }
      } else {
        if (this.player && !this.player.invuln && V.dist(b.pos,this.player.pos) < b.radius+this.player.radius) {
          this._damagePlayer(b.damage); this.audio.damage(); this.bullets.release(b);
        }
      }
    });
  }

  _damagePlayer(dmg) {
    const p = this.player; if (!p||p.invuln||p.dead) return;
    if (p.shield>0) { const absorbed = Math.min(p.shield, dmg); p.shield -= absorbed; dmg -= absorbed; p.shieldCooldown = 600; if (dmg<=0) return; }
    p.hp -= dmg; p.iFrameTimer = 0.4 + p.iFrameBonus; p.invuln = true; this.shake = 6; if (p.hp <= 0) this._endGame(true);
  }

  _endGame(died) {
    if (this.player) this.player.dead=true;
    this.gameOver=true; this.running=false;
    setTimeout(()=>{
      this.onStateChange({
        gameOver:true, finalScore: this.player?this.player.score:0, finalKills: this.player?this.player.kills:0, finalLevel: this.player?this.player.level:1, finalTime: this.sessionTime, finalWave: this.wave,
      });
    },500);
  }

  _updateLoot(dt) {
    const p = this.player; if (!p) return;
    this.loot.forEach(l => {
      if (!l.active) return; l.pulse += 0.08*dt;
      if (l.attracted) {
        const dir = V.norm(V.sub(p.pos, l.pos)); l.vel.x = (l.vel.x + dir.x*4*dt)*0.88; l.vel.y = (l.vel.y + dir.y*4*dt)*0.88;
      } else {
        l.vel.x *= 0.96; l.vel.y *= 0.96; if (V.dist(l.pos, p.pos) < 60) l.attracted=true;
      }
      l.pos.x += l.vel.x*dt; l.pos.y += l.vel.y*dt;
      if (V.dist(l.pos,p.pos) < l.radius+p.radius+4) {
        if (l.type==='xp') { this._grantXP(l.value * p.xpMult); } else if (l.type==='gold') { p.gold += Math.floor(l.value * p.goldMult); }
        this._spawnParticles(l.pos, l.color, 4, 1.5, 8); this.loot.release(l);
      }
    });
  }

  _spawnLoot(pos, xp, gold) {
    const xpOrbs  = Math.min(xp, 6); const goldOrbs= Math.min(Math.ceil(gold/5), 4);
    for (let i=0;i<xpOrbs;i++) {
      const l=this.loot.get(); l.active=true; l.type='xp'; l.value=Math.ceil(xp/xpOrbs); l.pos={x:pos.x+rand(-20,20),y:pos.y+rand(-20,20)}; l.vel={x:rand(-2,2),y:rand(-2,2)}; l.color='#38bdf8'; l.radius=5; l.attracted=false;
    }
    for (let i=0;i<goldOrbs;i++) {
      const l=this.loot.get(); l.active=true; l.type='gold'; l.value=Math.ceil(gold*5/goldOrbs); l.pos={x:pos.x+rand(-20,20),y:pos.y+rand(-20,20)}; l.vel={x:rand(-2,2),y:rand(-2,2)}; l.color='#fbbf24'; l.radius=5; l.attracted=false;
    }
  }

  _updateParticles(dt) {
    this.particles.forEach(p => {
      if (!p.active) return; p.life -= dt; if (p.life<=0) { this.particles.release(p); return; }
      p.pos.x += p.vel.x*dt; p.pos.y += p.vel.y*dt; p.vel.x *= 0.93; p.vel.y *= 0.93; p.alpha = p.life/p.maxLife;
    });
  }

  _spawnParticles(pos, color, count, speed, maxLife) {
    for (let i=0;i<count;i++) {
      if (this.particles.size > 350) return;
      const pt = this.particles.get(); pt.active=true; pt.color=color; pt.pos={x:pos.x,y:pos.y}; const a=rand(0,TAU);
      pt.vel={x:Math.cos(a)*rand(0.5,speed), y:Math.sin(a)*rand(0.5,speed)}; pt.life=rand(maxLife*0.5,maxLife); pt.maxLife=pt.life; pt.size=rand(1.5,4); pt.alpha=1;
    }
  }

  _updatePods(dt) {
    if (!this.player) return;
    this.pods.forEach(pod=>{ if(pod.active) { pod.spin += pod.spinSpeed*dt; pod.pulse += 0.05*dt; } });
    this.bullets.forEach(b => {
      if (!b.active||b.owner!=='player') return;
      this.pods.forEach(pod => {
        if (pod.active && V.dist(b.pos,pod.pos)<b.radius+pod.radius) {
          pod.hp--; this._spawnParticles(b.pos,'#6b7280',5,2,15);
          if (pod.hp<=0) { pod.active=false; this._spawnLoot(pod.pos, randInt(8,25), randInt(5,20)); this._spawnParticles(pod.pos,'#9ca3af',20,3,25); if (pod.type==='powerup') this.audio.powerup(); }
          if (b.pierce===0||b.pierceCount>=b.pierce) { this.bullets.release(b); }
        }
      });
    });
    if (this.tick % 600 === 0 && this.pods.length < 80) {
      const dead = this.pods.filter(p=>!p.active);
      if (dead.length > 0) {
        const angle=rand(0,TAU); const dist=rand(300,1500);
        this.pods.push({ pos: V.add(this.player.pos,{x:Math.cos(angle)*dist,y:Math.sin(angle)*dist}), hp:3, maxHp:3, radius:18, type:Math.random()<0.8?'resource':'powerup', spin:rand(0,TAU), spinSpeed:rand(-0.01,0.01), pulse:0, active:true, });
      }
    }
  }

  _updateWave(dt) { this.waveTimer += dt; if (this.waveTimer >= 1800) { this.wave++; this.waveTimer=0; this.spawnInterval = Math.max(40, 120 - this.wave*8); } }
  _updateSpawning(dt) { this.spawnTimer += dt; if (this.spawnTimer >= this.spawnInterval) { this.spawnTimer=0; const count = 1 + Math.floor(this.wave/3); for (let i=0;i<count;i++) this._spawnEnemy(); } }

  _spawnEnemy() {
    if (!this.player) return; const waveScale = 1 + (this.wave-1)*0.12; const angle = rand(0,TAU); const dist = rand(400,600);
    const pos = {x:this.player.pos.x+Math.cos(angle)*dist, y:this.player.pos.y+Math.sin(angle)*dist};
    let types=['drone']; if (this.wave>=2) types.push('drone','kamikaze'); if (this.wave>=3) types.push('drone','tank'); if (this.wave>=4) types.push('sniper'); if (this.wave>=5) types.push('swarm','swarm');
    const type=types[randInt(0,types.length-1)];

    const configs = {
      drone:    { hp:20,  radius:12, speed:1.5, damage:8,  xpDrop:10, goldDrop:5,  color:'#ef4444', glowColor:'#ef444466', fireRate:90  },
      kamikaze: { hp:12,  radius:10, speed:2.8, damage:18, xpDrop:15, goldDrop:8,  color:'#f97316', glowColor:'#f9731666', fireRate:0   },
      tank:     { hp:80,  radius:20, speed:0.8, damage:15, xpDrop:40, goldDrop:25, color:'#6b7280', glowColor:'#6b728066', fireRate:75  },
      sniper:   { hp:30,  radius:13, speed:1.2, damage:28, xpDrop:30, goldDrop:15, color:'#8b5cf6', glowColor:'#8b5cf666', fireRate:130 },
      swarm:    { hp:8,   radius:8,  speed:2.2, damage:5,  xpDrop:6,  goldDrop:3,  color:'#facc15', glowColor:'#facc1566', fireRate:0   },
    };
    const cfg = configs[type]; const e = makeEnemy();
    Object.assign(e, { pos, vel:{x:0,y:0}, angle:0, hp: cfg.hp * waveScale, maxHp: cfg.hp * waveScale, radius:cfg.radius, type, color:cfg.color, glowColor:cfg.glowColor, speed:cfg.speed, damage:cfg.damage*(0.8+this.wave*0.1), xpDrop:cfg.xpDrop, goldDrop:cfg.goldDrop, fireRate:cfg.fireRate, shootCooldown:cfg.fireRate, active:true, flash:0, spawnFlash:30, });
    this.enemies.push(e);
  }

  _updateEvents(dt) {
    this.nextEventTime -= dt * 0.016667;
    if (this.activeEvent) { this.eventTimer -= dt; if (this.eventTimer <= 0) { this.activeEvent=null; this.onStateChange({worldEvent:null}); } }
    if (this.nextEventTime <= 0 && !this.activeEvent) { this._triggerEvent(); this.nextEventTime = rand(90,180); }
  }

  _triggerEvent() {
    const evt = ['meteor_shower','gold_rush','emp_pulse','alien_invasion'][randInt(0,3)]; this.activeEvent = evt; this.eventTimer = 60; this.onStateChange({worldEvent:evt});
    if (evt === 'meteor_shower') {
      for (let i=0;i<8;i++) setTimeout(()=>{
        if (!this.player||this.player.dead) return;
        const e=makeEnemy(); Object.assign(e,{pos:{x:this.player.pos.x+rand(-400,400),y:this.player.pos.y-500}, vel:{x:rand(-1,1),y:rand(5,8)},hp:30,maxHp:30,radius:15,type:'kamikaze',color:'#9ca3af',glowColor:'#9ca3af66',speed:0,damage:20,xpDrop:20,goldDrop:12,fireRate:0,shootCooldown:999,active:true,flash:0,spawnFlash:0}); this.enemies.push(e);
      },i*500);
    } else if (evt === 'gold_rush' && this.player) {
      this.player.goldMult *= 2; setTimeout(()=>{ if(this.player) this.player.goldMult /= 2; }, 60000);
    } else if (evt === 'emp_pulse') {
      this.enemies.forEach(e=>{ e.vel={x:0,y:0}; e.shootCooldown=(e.fireRate||90)*3; }); this._spawnParticles(this.player.pos,'#818cf8',40,6,50);
    } else if (evt === 'alien_invasion') { for(let i=0;i<10;i++) this._spawnEnemy(); }
  }

  _grantXP(amount) {
    const p = this.player; if (!p) return; p.xp += amount;
    if (p.xp >= p.xpToNext) {
      p.xp -= p.xpToNext; p.level++; p.xpToNext = Math.floor(p.xpToNext * 1.35); p.gold += 50 * p.level; this.audio.levelup();
      this._spawnParticles(p.pos,'#fbbf24',25,4,40); this._spawnParticles(p.pos,'#c4b5fd',15,3,30); this.shake = 5;
      this.onStateChange({levelUp:true, level:p.level}); setTimeout(()=>this.onStateChange({levelUp:false}),1500);
    }
  }

  _toggleShop() { this.shopOpen = !this.shopOpen; this.onStateChange({shopOpen:this.shopOpen}); }
  applyUpgrade(upgradeId) {
    const upgrade = UPGRADES.find(u=>u.id===upgradeId); if (!upgrade||!this.player||this.player.gold < upgrade.cost) return;
    this.player.gold -= upgrade.cost; upgrade.apply(this.player); this.purchasedItems.push(upgradeId); this.audio.purchase(); this._syncUI();
  }

  _syncUI() {
    if (!this.player) return;
    this.onStateChange({
      hp: Math.max(0,this.player.hp), maxHp: this.player.maxHp, shield: this.player.shield, shieldMax: this.player.shieldMax, xp: this.player.xp, xpToNext: this.player.xpToNext, level: this.player.level, gold: Math.floor(this.player.gold), score: this.player.score, kills: this.player.kills, wave: this.wave, sessionTime: this.sessionTime, bossHp: this.boss ? this.boss.hp : 0, bossMaxHp: this.boss ? this.boss.maxHp : 0, dashReady: this.player.dashCooldown<=0, bombReady: this.player.bombCooldown<=0 && this.player.bombDmg>0, bombDmg: this.player.bombDmg, drones: this.player.drones, purchasedItems: this.purchasedItems, shopOpen: this.shopOpen
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // RESTORED RENDERING PIPELINE METHODS
  // ═══════════════════════════════════════════════════════════════════════════════
  _render() {
    this.ctx.clearRect(0,0,this.W,this.H); this.ctx.fillStyle='#030712'; this.ctx.fillRect(0,0,this.W,this.H);
    this.ctx.save(); this.ctx.translate(this.W/2+this.shakeX, this.H/2+this.shakeY); this.ctx.translate(-this.camera.x, -this.camera.y);
    this._renderNebulae();
    this._renderStars();
    this._renderPods();
    this._renderLoot();
    this._renderParticles();
    this._renderBullets();
    this._renderEnemies();
    this._renderBoss();
    this._renderPlayer();
    this._renderDrones();
    this.ctx.restore();
  }

  _renderNebulae() {
    const cx = this.camera.x, cy=this.camera.y;
    [{x:-300,y:-200,r:400,c:'rgba(124,58,237,0.06)'},{x:500,y:300,r:350,c:'rgba(6,182,212,0.05)'},{x:-100,y:500,r:500,c:'rgba(239,68,68,0.04)'},{x:800,y:-400,r:300,c:'rgba(52,211,153,0.04)'}].forEach(n=>{
      const gx=n.x-(cx*0.3); const gy=n.y-(cy*0.3); const grad=this.ctx.createRadialGradient(gx,gy,0,gx,gy,n.r);
      grad.addColorStop(0,n.c); grad.addColorStop(1,'transparent'); this.ctx.fillStyle=grad; this.ctx.beginPath(); this.ctx.arc(gx,gy,n.r,0,TAU); this.ctx.fill();
    });
  }

  _renderStars() {
    this.stars.forEach(s=>{
      const alpha=s.alpha*(0.7+0.3*Math.sin(this.tick*0.02+s.twinkle)); this.ctx.globalAlpha=alpha; this.ctx.fillStyle='#fff'; this.ctx.beginPath(); this.ctx.arc(s.x-(this.camera.x*0.1),s.y-(this.camera.y*0.1),s.size,0,TAU); this.ctx.fill();
    });
    this.starsNear.forEach(s=>{ this.ctx.globalAlpha=s.alpha; this.ctx.fillStyle=s.color; this.ctx.beginPath(); this.ctx.arc(s.x-(this.camera.x*0.4),s.y-(this.camera.y*0.4),s.size,0,TAU); this.ctx.fill(); });
    this.ctx.globalAlpha=1;
  }

  _renderPods() {
    this.pods.forEach(pod=>{
      if(!pod.active) return; const pulse=0.85+0.15*Math.sin(pod.pulse); this.ctx.save(); this.ctx.translate(pod.pos.x,pod.pos.y); this.ctx.rotate(pod.spin); this.ctx.shadowBlur=15; this.ctx.shadowColor=pod.type==='powerup'?'#fbbf24':'#60a5fa';
      const grad=this.ctx.createRadialGradient(0,0,0,0,0,pod.radius*pulse);
      if (pod.type==='powerup') { grad.addColorStop(0,'#fef9c3'); grad.addColorStop(0.6,'#fbbf24'); grad.addColorStop(1,'#92400e'); } else { grad.addColorStop(0,'#e0f2fe'); grad.addColorStop(0.6,'#60a5fa'); grad.addColorStop(1,'#1e3a5f'); }
      this.ctx.fillStyle=grad; this.ctx.beginPath();
      for(let i=0;i<8;i++) { const a=(i/8)*TAU; const r=pod.radius*(i%2===0?1:0.8)*pulse; if(i===0) this.ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r); else this.ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); }
      this.ctx.closePath(); this.ctx.fill();
      if(pod.hp<pod.maxHp) { this.ctx.shadowBlur=0; this.ctx.fillStyle='rgba(0,0,0,0.5)'; this.ctx.fillRect(-pod.radius,-pod.radius-8,pod.radius*2,4); this.ctx.fillStyle='#ef4444'; this.ctx.fillRect(-pod.radius,-pod.radius-8,pod.radius*2*(pod.hp/pod.maxHp),4); }
      this.ctx.restore();
    });
    this.ctx.shadowBlur=0;
  }

  _renderLoot() {
    this.loot.forEach(l=>{
      if(!l.active) return; const pulse=0.8+0.2*Math.sin(l.pulse); this.ctx.save(); this.ctx.translate(l.pos.x,l.pos.y); this.ctx.shadowBlur=10; this.ctx.shadowColor=l.color; this.ctx.fillStyle=l.color; this.ctx.globalAlpha=0.9+0.1*pulse; this.ctx.beginPath();
      if(l.type==='gold') { this.ctx.arc(0,0,l.radius*pulse,0,TAU); } else { this.ctx.moveTo(0,-l.radius*pulse); this.ctx.lineTo(l.radius*0.7*pulse,0); this.ctx.lineTo(0,l.radius*pulse); this.ctx.lineTo(-l.radius*0.7*pulse,0); this.ctx.closePath(); }
      this.ctx.fill(); this.ctx.restore();
    });
    this.ctx.globalAlpha=1; this.ctx.shadowBlur=0;
  }

  _renderParticles() {
    this.ctx.save();
    this.particles.forEach(p => {
      if (!p.active) return;
      this.ctx.globalAlpha = p.alpha; this.ctx.fillStyle = p.color;
      this.ctx.beginPath(); this.ctx.arc(p.pos.x, p.pos.y, p.size, 0, TAU); this.ctx.fill();
    });
    this.ctx.restore(); this.ctx.globalAlpha = 1;
  }

  _renderBullets() {
    this.bullets.forEach(b=>{
      if(!b.active) return; this.ctx.save();
      if(b.trail.length>1) { this.ctx.globalAlpha=0.35; this.ctx.strokeStyle=b.color; this.ctx.lineWidth=b.radius*0.8; this.ctx.lineCap='round'; this.ctx.beginPath(); this.ctx.moveTo(b.trail[0].x,b.trail[0].y); b.trail.forEach(pt=>this.ctx.lineTo(pt.x,pt.y)); this.ctx.stroke(); }
      this.ctx.globalAlpha=1; this.ctx.shadowBlur=b.owner==='player'?12:8; this.ctx.shadowColor=b.color; this.ctx.fillStyle=b.color; this.ctx.beginPath(); this.ctx.arc(b.pos.x,b.pos.y,b.radius,0,TAU); this.ctx.fill(); this.ctx.restore();
    });
    this.ctx.shadowBlur=0;
  }

  _renderEnemies() {
    this.enemies.forEach(e=>{
      if(!e.active) return; this.ctx.save(); this.ctx.translate(e.pos.x,e.pos.y); this.ctx.rotate(e.angle+Math.PI/2);
      if(e.spawnFlash>0) this.ctx.globalAlpha=1-(e.spawnFlash/30);
      this.ctx.shadowBlur=e.flash>0?20:12; this.ctx.shadowColor=e.flash>0?'#fff':e.glowColor; this.ctx.fillStyle=e.flash>0?'#fff':e.color;
      const r=e.radius;
      if(e.type === 'drone') { this.ctx.beginPath(); this.ctx.moveTo(0,-r); this.ctx.lineTo(-r*0.7,r*0.8); this.ctx.lineTo(0,r*0.4); this.ctx.lineTo(r*0.7,r*0.8); this.ctx.closePath(); this.ctx.fill(); }
      else if(e.type === 'kamikaze') { this.ctx.beginPath(); this.ctx.moveTo(0,-r*1.2); this.ctx.lineTo(-r,r); this.ctx.lineTo(r,r); this.ctx.closePath(); this.ctx.fill(); }
      else if(e.type === 'tank') { this.ctx.fillRect(-r,-r,r*2,r*2); this.ctx.fillStyle=e.flash>0?'#fff':'#374151'; this.ctx.fillRect(-r*0.5,-r*0.5,r,r); }
      else if(e.type === 'sniper') { this.ctx.beginPath(); for(let i=0;i<6;i++){ const a=(i/6)*TAU; const rr=i%2===0?r:r*0.5; if(i===0) this.ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr); else this.ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } this.ctx.closePath(); this.ctx.fill(); }
      else if(e.type === 'swarm') { this.ctx.beginPath(); this.ctx.arc(0,0,r,0,TAU); this.ctx.fill(); }
      this.ctx.restore();
      if(e.hp<e.maxHp) { const bw=e.radius*2.2; this.ctx.fillStyle='rgba(0,0,0,0.6)'; this.ctx.fillRect(e.pos.x-bw/2,e.pos.y-e.radius-9,bw,4); this.ctx.fillStyle=e.hp/e.maxHp>0.5?'#4ade80':'#f87171'; this.ctx.fillRect(e.pos.x-bw/2,e.pos.y-e.radius-9,bw*(e.hp/e.maxHp),4); }
    });
    this.ctx.shadowBlur=0; this.ctx.globalAlpha=1;
  }

  _renderBoss() {
    const b=this.boss; if(!b||!b.active) return; this.ctx.save(); this.ctx.translate(b.pos.x,b.pos.y);
    if(b.spawnFlash>0) this.ctx.globalAlpha=1-(b.spawnFlash/60);
    this.ctx.shadowBlur=b.flash>0?40:25; this.ctx.shadowColor=b.flash>0?'#fff':this.bossData.accent;
    this.ctx.strokeStyle=this.bossData.accent; this.ctx.lineWidth=3; this.ctx.globalAlpha=(this.ctx.globalAlpha||1)*0.4; this.ctx.beginPath(); this.ctx.arc(0,0,b.radius+12+Math.sin(this.tick*0.05)*5,0,TAU); this.ctx.stroke();
    this.ctx.globalAlpha=b.spawnFlash>0?(1-b.spawnFlash/60):1;
    const grad=this.ctx.createRadialGradient(0,0,0,0,0,b.radius); grad.addColorStop(0,this.bossData.accent+'cc'); grad.addColorStop(0.5,this.bossData.color+'ee'); grad.addColorStop(1,'#00000000'); this.ctx.fillStyle=grad; this.ctx.rotate(b.angle*0.5); this.ctx.beginPath();
    for(let i=0;i<8;i++){ const a=(i/8)*TAU; const bulge=i%2===0?b.radius:b.radius*0.75; if(i===0) this.ctx.moveTo(Math.cos(a)*bulge,Math.sin(a)*bulge); else this.ctx.lineTo(Math.cos(a)*bulge,Math.sin(a)*bulge); }
    this.ctx.closePath(); this.ctx.fill(); if(b.flash>0){ this.ctx.fillStyle='#ffffff44'; this.ctx.fill(); } this.ctx.restore(); this.ctx.shadowBlur=0;
  }

  _renderPlayer() {
    const p=this.player; if(!p||p.dead) return;
    if(p.trail.length>2 && V.len(p.vel)>0.5){
      for(let i=1;i<p.trail.length;i++){
        const t=i/p.trail.length; this.ctx.globalAlpha=t*0.4; this.ctx.strokeStyle=`hsl(${180+this.tick*2},100%,70%)`; this.ctx.lineWidth=(1-t)*p.radius*0.8; this.ctx.lineCap='round'; this.ctx.beginPath(); this.ctx.moveTo(p.trail[i-1].x,p.trail[i-1].y); this.ctx.lineTo(p.trail[i].x,p.trail[i].y); this.ctx.stroke();
      }
      this.ctx.globalAlpha=1;
    }
    this.ctx.save(); this.ctx.translate(p.pos.x,p.pos.y); this.ctx.rotate(p.angle+Math.PI/2);
    if(p.invuln && Math.floor(this.tick/3)%2===0) { this.ctx.restore(); return; }
    if(p.shield>0) { this.ctx.shadowBlur=0; this.ctx.strokeStyle='rgba(96,165,250,0.5)'; this.ctx.lineWidth=2; this.ctx.beginPath(); this.ctx.arc(0,0,p.radius+8+Math.sin(this.tick*0.1)*2,0,TAU); this.ctx.stroke(); }
    this.ctx.shadowBlur=20; this.ctx.shadowColor='#7c3aed'; const r=p.radius; const grad=this.ctx.createLinearGradient(0,-r,0,r); grad.addColorStop(0,'#c4b5fd'); grad.addColorStop(0.5,'#7c3aed'); grad.addColorStop(1,'#4c1d95'); this.ctx.fillStyle=grad; this.ctx.beginPath(); this.ctx.moveTo(0,-r*1.2); this.ctx.lineTo(-r*0.8,r*0.6); this.ctx.lineTo(-r*0.35,r*0.2); this.ctx.lineTo(0,r*0.5); this.ctx.lineTo(r*0.35,r*0.2); this.ctx.lineTo(r*0.8,r*0.6); this.ctx.closePath(); this.ctx.fill();
    this.ctx.shadowBlur=8; this.ctx.shadowColor='#38bdf8'; this.ctx.fillStyle='#bae6fd'; this.ctx.beginPath(); this.ctx.arc(0,-r*0.3,r*0.28,0,TAU); this.ctx.fill();
    if(V.len(p.vel)>0.3){
      this.ctx.shadowBlur=12; this.ctx.shadowColor='#fbbf24'; const exGrad=this.ctx.createLinearGradient(0,r*0.4,0,r*1.4); exGrad.addColorStop(0,'#fbbf24aa'); exGrad.addColorStop(1,'transparent'); this.ctx.fillStyle=exGrad; this.ctx.beginPath(); this.ctx.moveTo(-r*0.3,r*0.4); this.ctx.lineTo(r*0.3,r*0.4); this.ctx.lineTo((Math.random()-0.5)*r*0.3,r*(1+Math.random()*0.5)); this.ctx.closePath(); this.ctx.fill();
    }
    this.ctx.restore(); this.ctx.shadowBlur=0; this.ctx.globalAlpha=1;
  }

  _renderDrones() {
    this.activeDrones.forEach(d=>{ if(d.active) { this.ctx.save(); this.ctx.translate(d.pos.x,d.pos.y); this.ctx.rotate(d.angle); this.ctx.shadowBlur=12; this.ctx.shadowColor='#a5f3fc'; this.ctx.fillStyle='#67e8f9'; this.ctx.beginPath(); this.ctx.arc(0,0,7,0,TAU); this.ctx.fill(); this.ctx.fillStyle='#164e63'; this.ctx.beginPath(); this.ctx.arc(0,0,3,0,TAU); this.ctx.fill(); this.ctx.restore(); } });
    this.ctx.shadowBlur=0;
  }
}