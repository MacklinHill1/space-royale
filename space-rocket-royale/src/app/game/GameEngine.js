// src/app/game/GameEngine.js

import { applyEquipmentToPlayer } from '../../../systems/EquipmentSystem.js';
import {
  makeEquipmentDrop,
  resetEquipmentDrop,
  spawnBossEquipmentDrops,
  spawnChestEquipmentDrop,
  updateEquipmentDrops,
  renderEquipmentDrops,
} from '../../../systems/EquipmentDropSystem.js';
import { RARITY_COLORS, RARITY_BEAM_HEIGHT, BOSS_DROP_TABLES } from '../../../constants/EquipmentData.js';
import {
  makeAbilityDrop,
  resetAbilityDrop,
  spawnBossAbilityDrops,
  spawnChestAbilityDrop,
  updateAbilityDrops,
  renderAbilityDrops,
} from '../../../systems/AbilityDropSystem.js';
import {
  applyPassiveAbilities,
  updatePassiveAbilities,
  updateActiveEffects,
  activateAbility,
  renderActiveEffects,
  godMachineShoot,
  checkEntropyCollapse,
  voidEchoShot,
  getCooldownMult,
} from '../../../systems/AbilitySystem.js';
import { ENEMY_TYPES } from '../../../systems/EnemyData.js';
import { renderEnemy } from '../../../systems/EnemyRenderer.js';
import { WaveDirector, configureEnemy, updateEnemyAI } from '../../../systems/WaveDirector.js';
import { BOSSES as BOSS_DEFS, selectBoss, scaleBossHp } from '../../../systems/BossData.js';
import { renderBoss } from '../../../systems/BossRenderer.js';
import { MODE_MAP, getModeRules, getModeInitialState, getModeDifficulty } from '../../../constants/GameModes.js';
import { getInitialAbilityLoadout } from '../../../constants/AbilityData.js';
import { ShopManager, computeShopStats } from '../../../systems/ShopSystem.js';
import { rollRubyDrop, rollGemDrop } from '../../../systems/MetaProgression.js';
import { generateChestRewards, BOSS_CHEST_TABLE } from '../../../systems/ChestSystem.js';

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
    this._volume = (() => {
      try { return parseFloat(localStorage.getItem('srr_volume') ?? '0.5'); } catch { return 0.5; }
    })();
  }
  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    this._muted = this._volume === 0;
  }
  _init() {
    if (this._ctx) return;
    try { this._ctx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){}
  }
  _tone(freq, type, dur, vol=0.3, delay=0) {
    if (this._muted || this._volume === 0 || !this._ctx) return;
    vol = vol * this._volume;
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

export const UPGRADES = [
  { id:'dmg1',     name:'Plasma Boost',      desc:'+25% bullet damage',          icon:'🔥', rarity:'common',   cost:80,   category:'offense', apply: p=>{ p.damageMult+=0.25; } },
  { id:'dmg2',     name:'Void Core',          desc:'+60% bullet damage',          icon:'💀', rarity:'rare',      cost:200,   category:'offense', apply: p=>{ p.damageMult+=0.60; } },
  { id:'dmg3',     name:'Galactic Cannon',   desc:'+120% bullet damage',         icon:'⚡', rarity:'epic',      cost:450,   category:'offense', apply: p=>{ p.damageMult+=1.20; } },
  { id:'pen1',     name:'Piercing Shot',     desc:'Bullets pierce 1 extra enemy',icon:'🏹',rarity:'rare',      cost:250,   category:'offense', apply: p=>{ p.pierce+=1; } },
  { id:'multi1',   name:'Split Fire',        desc:'Fire 2 extra bullets',        icon:'🔱', rarity:'epic',      cost:380,   category:'offense', apply: p=>{ p.extraBullets+=2; } },
  { id:'crit1',    name:'Targeting Array',   desc:'+20% crit chance',            icon:'🎯', rarity:'uncommon', cost:150,   category:'offense', apply: p=>{ p.critChance+=0.20; } },
  { id:'fr1',      name:'Overcharge',        desc:'+30% fire rate',              icon:'⚡', rarity:'common',   cost:90,   category:'offense', apply: p=>{ p.fireRateMult+=0.30; } },
  { id:'fr2',      name:'Rapid Pulse',       desc:'+70% fire rate',              icon:'🌀', rarity:'rare',      cost:220,   category:'offense', apply: p=>{ p.fireRateMult+=0.70; } },
  { id:'hp1',      name:'Hull Plating',      desc:'+40 max HP',                  icon:'🛡', rarity:'common',   cost:70,   category:'defense', apply: p=>{ p.maxHp+=40; p.hp+=40; } },
  { id:'hp2',      name:'Void Armor',        desc:'+100 max HP',                 icon:'⚙', rarity:'rare',      cost:210,   category:'defense', apply: p=>{ p.maxHp+=100; p.hp+=100; } },
  { id:'regen1',   name:'Nano-Repair',       desc:'Regen 2 HP/sec',              icon:'💚', rarity:'uncommon', cost:160,   category:'defense', apply: p=>{ p.hpRegen+=2; } },
  { id:'regen2',   name:'Bio-Matrix',        desc:'Regen 6 HP/sec',              icon:'🌿', rarity:'epic',      cost:400,   category:'defense', apply: p=>{ p.hpRegen+=6; } },
  { id:'shield1',  name:'Energy Shield',      desc:'Absorb 30 damage once/10s',  icon:'🔵', rarity:'rare',      cost:280,   category:'defense', apply: p=>{ p.shieldMax+=30; p.shield+=30; } },
  { id:'iframes1', name:'Phase Drive',       desc:'+0.3s invuln after hit',      icon:'👻', rarity:'uncommon', cost:180,   category:'defense', apply: p=>{ p.iFrameBonus+=0.3; } },
  { id:'spd1',     name:'Ion Thrusters',     desc:'+20% movement speed',         icon:'🚀', rarity:'common',   cost:75,   category:'movement',apply: p=>{ p.speedMult+=0.20; } },
  { id:'spd2',     name:'Warp Core',          desc:'+50% movement speed',         icon:'🌠', rarity:'rare',      cost:230,   category:'movement',apply: p=>{ p.speedMult+=0.50; } },
  { id:'dash1',    name:'Quantum Dash',      desc:'Dash distance +50%',          icon:'💨', rarity:'uncommon', cost:140,   category:'movement',apply: p=>{ p.dashDistMult+=0.50; } },
  { id:'mag1',     name:'Gravity Magnet',    desc:'Pull XP/gold from 150px',    icon:'🧲', rarity:'uncommon', cost:130,   category:'utility', apply: p=>{ p.magnetRadius+=150; } },
  { id:'mag2',     name:'Singularity Core',  desc:'Pull XP/gold from 350px',    icon:'🌑', rarity:'epic',      cost:370,   category:'utility', apply: p=>{ p.magnetRadius+=350; } },
  { id:'xpm1',     name:'XP Amplifier',      desc:'+50% XP gain',               icon:'⭐', rarity:'uncommon', cost:120,   category:'utility', apply: p=>{ p.xpMult+=0.50; } },
  { id:'gold1',    name:'Gold Plating',      desc:'+40% gold gain',              icon:'🪙', rarity:'uncommon', cost:110,   category:'utility', apply: p=>{ p.goldMult+=0.40; } },
  { id:'drone1',   name:'Combat Drone',      desc:'Summon auto-targeting drone', icon:'🤖',rarity:'epic',      cost:420,   category:'utility', apply: p=>{ p.drones+=1; } },
  { id:'drone2',   name:'Drone Squadron',    desc:'Summon 2 more drones',        icon:'👾', rarity:'legendary',cost:800,   category:'utility', apply: p=>{ p.drones+=2; } },
  { id:'bomb1',    name:'Void Bomb',          desc:'Bomb ability: AoE 200dmg',   icon:'💣', rarity:'rare',      cost:300,   category:'utility', apply: p=>{ p.bombDmg+=200; } },
  { id:'leg1',     name:'Cosmic Slayer',      desc:'+100% dmg, +50% fire rate',  icon:'🌌', rarity:'legendary',cost:1200, category:'offense', apply: p=>{ p.damageMult+=1.0; p.fireRateMult+=0.50; } },
  { id:'leg2',     name:'Immortal Core',      desc:'+200 HP, regen 10/s, shield 60',icon:'♾',rarity:'legendary',cost:1400,category:'defense', apply: p=>{ p.maxHp+=200;p.hp+=200;p.hpRegen+=10;p.shieldMax+=60;p.shield+=60; } },
  { id:'leg3',     name:'Ghost Protocol',    desc:'+80% speed, +0.6s iframes',  icon:'👁', rarity:'legendary',cost:1100, category:'movement',apply: p=>{ p.speedMult+=0.80; p.iFrameBonus+=0.6; } },
];

export const RARITY_COLOR = { common:'#9ca3af', uncommon:'#4ade80', rare:'#60a5fa', epic:'#c084fc', legendary:'#fbbf24', mythic:'#ff00ff' };
export const RARITY_GLOW  = { common:'rgba(156,163,175,0.3)', uncommon:'rgba(74,222,128,0.3)', rare:'rgba(96,165,250,0.3)', epic:'rgba(192,132,252,0.4)', legendary:'rgba(251,191,36,0.5)', mythic:'rgba(255,0,255,0.6)' };

export const CHEST_TIERS = {
  COMMON_CACHE: { name: 'Common Cache',      color: '#9ca3af', rewards: { coins: [50, 100],    xp: [100, 200],   equipChance: 0.3,  abilityChance: 0.1  } },
  RARE_CRATE:   { name: 'Rare Crate',        color: '#60a5fa', rewards: { coins: [150, 300],   xp: [300, 500],   equipChance: 0.5,  abilityChance: 0.25 } },
  ELITE_ARSENAL:{ name: 'Elite Arsenal',     color: '#c084fc', rewards: { coins: [400, 700],   xp: [600, 1000],  equipChance: 0.7,  abilityChance: 0.4  } },
  MYTHIC_RELIC: { name: 'Mythic Relic',      color: '#fbbf24', rewards: { coins: [800, 1500],  xp: [1200, 2000], equipChance: 0.85, abilityChance: 0.6  } },
  COSMIC_VAULT: { name: 'Cosmic Vault',      color: '#ff00ff', rewards: { coins: [2000, 4000], xp: [3000, 5000], equipChance: 0.95, abilityChance: 0.8  } },
  RAID_CHEST:   { name: 'Raid Chest',        color: '#f43f5e', rewards: { coins: [1000, 2000], xp: [2000, 3500], equipChance: 0.9,  abilityChance: 0.7  } },
};

export const ABILITIES = {
  UFO_TRACTOR: { id: 'ufo_tractor', name: 'UFO Tractor Beam', type: 'active', rarity: 'legendary', cooldown: 45, desc: 'Summons UFO that abducts enemies and explodes them back down', icon: '🛸' },
  MICROWAVE: { id: 'microwave', name: 'Microwave Radiation', type: 'active', rarity: 'epic', cooldown: 30, desc: 'Expanding radiation field with chain explosions', icon: '☢️' },
  TOXIC_TRAIL: { id: 'toxic_trail', name: 'Toxic Exhaust', type: 'passive', rarity: 'rare', cooldown: 0, desc: 'Leave toxic clouds that slow and amplify damage', icon: '☠️' },
  SOLAR_LANCE: { id: 'solar_lance', name: 'Solar Lance', type: 'active', rarity: 'legendary', cooldown: 35, desc: 'Hold to charge massive beam that melts bosses', icon: '☀️' },
  SINGULARITY: { id: 'singularity', name: 'Singularity Collapse', type: 'active', rarity: 'mythic', cooldown: 60, desc: 'Black hole that shreds boss HP', icon: '⚫' },
  ORBITAL_STRIKE: { id: 'orbital_strike', name: 'Orbital Strike', type: 'active', rarity: 'legendary', cooldown: 50, desc: 'Tungsten rod from orbit with massive impact', icon: '🎯' },
  HOLOGRAM_DECOY: { id: 'hologram_decoy', name: 'Hologram Decoys', type: 'active', rarity: 'epic', cooldown: 40, desc: 'Deploy 2 decoys that enemies target', icon: '👥' },
  TEMPORAL_ANCHOR: { id: 'temporal_anchor', name: 'Temporal Anchor', type: 'active', rarity: 'mythic', cooldown: 70, desc: 'Rewind position and HP state', icon: '⏮️' },
  GRAVITY_WELL: { id: 'gravity_well', name: 'Gravity Well', type: 'active', rarity: 'rare', cooldown: 25, desc: 'Pull enemies together for grouping', icon: '🌀' },
  TIME_DILATION: { id: 'time_dilation', name: 'Time Dilation', type: 'active', rarity: 'epic', cooldown: 35, desc: 'Slow enemies and bullets by 80%', icon: '⏱️' },
  EMERGENCY_REPAIR: { id: 'emergency_repair', name: 'Emergency Repair', type: 'active', rarity: 'rare', cooldown: 45, desc: 'Restore 30% HP with invuln bubble', icon: '🔧' },
  CHAIN_LIGHTNING: { id: 'chain_lightning', name: 'Chain Lightning', type: 'active', rarity: 'epic', cooldown: 20, desc: 'Lightning arcs between up to 4 enemies', icon: '⚡' },
  RAILGUN: { id: 'railgun', name: 'Railgun Override', type: 'weapon', rarity: 'legendary', cooldown: 0, desc: 'Slow fire, infinite pierce beam', icon: '━' },
  CLUSTER_MISSILES: { id: 'cluster_missiles', name: 'Cluster Missiles', type: 'weapon', rarity: 'epic', cooldown: 0, desc: 'Explosive spheres that split into homing rockets', icon: '🚀' },
  GUARDIAN_DRONES: { id: 'guardian_drones', name: 'Guardian Drones', type: 'drone', rarity: 'rare', cooldown: 0, desc: 'Intercept enemy bullets', icon: '🛡️' },
  SCAVENGER_DRONE: { id: 'scavenger_drone', name: 'Scavenger Drone', type: 'drone', rarity: 'uncommon', cooldown: 0, desc: 'Auto-collects XP and gold', icon: '🧲' },
  BLOOD_PACT: { id: 'blood_pact', name: 'Blood Pact', type: 'passive', rarity: 'mythic', cooldown: 0, desc: '+1 Max HP per 50 kills', icon: '🩸' },
  OVERCLOCK: { id: 'overclock', name: 'Overclock Module', type: 'passive', rarity: 'legendary', cooldown: 0, desc: '25% cooldown reduction, +1 passive slot', icon: '⚙️' },
};

const createPlayer = (cx, cy) => ({
  pos: {x:cx, y:cy}, vel: V.zero(), angle: -Math.PI/2,
  hp: 100, maxHp: 100, hpRegen: 0, shield: 0, shieldMax: 0, shieldCooldown: 0,
  xp: 0, xpToNext: 100, level: 1, gold: 0, score: 0, kills: 0,
  damageMult: 1.0, fireRateMult: 1.0, speedMult: 1.0, dashDistMult: 1.0,
  pierce: 0, extraBullets: 0, critChance: 0.05, magnetRadius: 80,
  xpMult: 1.0, goldMult: 1.0, drones: 0, bombDmg: 0, iFrameBonus: 0,
  iFrameTimer: 0, fireCooldown: 0, dashCooldown: 0, bombCooldown: 0, magnetCooldown:0,
  dead: false, invuln: false, radius: 12, trail: [], exhaustTimer: 0,
  equippedAbilities: { active1: null, active2: null, passive1: null, passive2: null, weapon: null, drone: null },
  abilityCooldowns: {},
  abilityStates: {},
  killCount: 0,
});

const makeEnemy = () => ({
  pos:{x:0,y:0}, vel:{x:0,y:0}, angle:0, hp:1, maxHp:1, radius:12,
  type:'fighter', tier:'easy', color:'#ef4444', glowColor:'#ef444466',
  speed:1, damage:8, xpDrop:10, goldDrop:5,
  behavior:'chase', active:false, flash:0, spawnFlash:0,
  shootCooldown:0, fireRate:0,
  isElite:false,
  state:'chase', stateTimer:0,
  behaviorState:'idle', behaviorTimer:0,
  dashTarget:null, carrierSpawnTimer:0, shieldTarget:null, warpCooldown:60,
});
const makeBullet = () => ({ pos:{x:0,y:0}, vel:{x:0,y:0}, damage:1, radius:4, color:'#38bdf8', pierce:0, pierceCount:0, active:false, owner:'player', lifetime:0, maxLifetime:90, homing:false, homingTarget:null, trail:[], });
const makeParticle = () => ({ pos:{x:0,y:0}, vel:{x:0,y:0}, color:'#fff', alpha:1, size:2, life:1, maxLife:1, active:false, type:'dot', });
const makeLoot = () => ({ pos:{x:0,y:0}, vel:{x:0,y:0}, type:'xp', value:10, radius:6, color:'#38bdf8', active:false, pulse:0, attracted:false, });
const makeDrone = () => ({ pos:{x:0,y:0}, angle:0, orbitAngle:0, shootCooldown:0, active:false, });
const makeChest = () => ({ pos:{x:0,y:0}, vel:{x:0,y:0}, tier:'COMMON_CACHE', radius:20, active:false, pulse:0, spin:0, opened:false, });


// Boss definitions are now imported from systems/BossData.js as BOSS_DEFS

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

    // Phase 1 + Phase 3 Property Extensions
    this.joystickInput = { x: 0, y: 0 };
    this.isMobileDevice = false;
    this.mobilePerformanceMode = false;
    this.touchAimingActive = false;
    this.touchAimPos = { x: 0, y: 0 };
    this.bossesKilledThisRun = 0;
    this.equipmentBonuses = null;
    this.metaStats        = {};  // from tech tree + pet + prestige + shop, set by page.js
    this.shopManager      = null;
    this.modeRules        = getModeRules('classic');
    this.modeState        = getModeInitialState('classic');
    this.sessionRubies    = 0;   // rubies earned this run
    this.sessionGems      = 0;   // scarce premium currency earned this run (rare boss drops only)
    this.runKillStats     = {    // tracked for missions/achievements
      kills: 0, elites: 0, bosses: 0, crits: 0,
      gold: 0, gear: 0, abilities: 0, shopBuys: 0,
    };
    this.runLootCollected = [];
    this.runLootCount = 0;
    this.waveDirector = new WaveDirector();
    this.usedBossIds  = new Set();
    this.secretRunStats = {
      uniqueBossesKilled: new Set(),
      bossKilledAtLowHP: false,
      lootCollected: 0,
    };

    this.bullets   = new Pool(makeBullet,  b=>{b.active=false;b.trail=[];b.pierceCount=0;b.homing=false;}, 120);
    this.particles = new Pool(makeParticle,p=>{p.active=false;}, 400);
    this.loot      = new Pool(makeLoot,    l=>{l.active=false;l.attracted=false;}, 150);
    this.droneParts= new Pool(makeDrone,   d=>{d.active=false;}, 8);
    this.chests    = new Pool(makeChest,   c=>{c.active=false;c.opened=false;}, 20);
    this.equipDrops   = new Pool(makeEquipmentDrop, resetEquipmentDrop, 30);
    this.abilityDrops = new Pool(makeAbilityDrop,   resetAbilityDrop,   20);
    this.abilityEffects = [];
    this.abilityLoadout = null;

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
    
    this.activeAbilityEffects = [];
    this.toxicClouds = [];
    this.temporalAnchor = null;
    this.scavengerDrone = null;

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
      if (down && key==='KeyE' && !this.gameOver) this._toggleShop();
      if (down && key==='KeyQ') this._useBomb();
      if (down && key==='KeyF') this._useMagnet();
      if (down && (key==='Space'||key==='ShiftLeft')) this._dash();
      if (down && key==='KeyZ') this._activateAbilitySlot('active1');
      if (down && key==='KeyX') this._activateAbilitySlot('active2');
      if (down && key==='KeyR') this._activateAbilitySlot('ultimate');
      if (down && key==='Escape') {
        if (this.shopOpen) this._toggleShop();
        else if (!this.gameOver) this._togglePause();
      }
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

    this._onTouchStart = (e) => {
      if (!this.player || !this.isMobileDevice) return;
      const rect = this.canvas.getBoundingClientRect();
      const sx = this.canvas.width / rect.width;
      const sy = this.canvas.height / rect.height;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.clientX > window.innerWidth / 2) {
          this.touchAimingActive = true;
          const mx = (t.clientX - rect.left) * sx;
          const my = (t.clientY - rect.top) * sy;
          this.touchAimPos = { x: mx, y: my };
          this.mouse.down = true;
          break;
        }
      }
    };

    this._onTouchMove = (e) => {
      if (!this.player || !this.isMobileDevice || !this.touchAimingActive) return;
      const rect = this.canvas.getBoundingClientRect();
      const sx = this.canvas.width / rect.width;
      const sy = this.canvas.height / rect.height;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (t.clientX > window.innerWidth / 2) {
          const mx = (t.clientX - rect.left) * sx;
          const my = (t.clientY - rect.top) * sy;
          this.touchAimPos = { x: mx, y: my };
          break;
        }
      }
    };

    this._onTouchEnd = (e) => {
      if (!this.isMobileDevice) return;
      let rightTouchActive = false;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].clientX > window.innerWidth / 2) { rightTouchActive = true; break; }
      }
      if (!rightTouchActive) { this.touchAimingActive = false; this.mouse.down = false; }
    };

    window.addEventListener('keydown',    this._onKey);
    window.addEventListener('keyup',      this._onKey);
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    this.canvas.addEventListener('mouseup',   this._onMouseUp);
    this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: true });
    this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: true });
    this.canvas.addEventListener('touchend', this._onTouchEnd, { passive: true });
    this.canvas.addEventListener('touchcancel', this._onTouchEnd, { passive: true });
  }

  destroy() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown',    this._onKey);
    window.removeEventListener('keyup',      this._onKey);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    this.canvas.removeEventListener('mouseup',   this._onMouseUp);
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    this.canvas.removeEventListener('touchmove', this._onTouchMove);
    this.canvas.removeEventListener('touchend', this._onTouchEnd);
    this.canvas.removeEventListener('touchcancel', this._onTouchEnd);
  }

  startGame(mode='endless') {
    this.mode         = mode;
    this.player       = createPlayer(0, 0);
    // Wire the equipped ability loadout (set on the engine by page.js before
    // startGame() is called) onto the fresh player object. Without this, the
    // player object has no abilityLoadout and Z/X/R presses silently no-op.
    this.player.abilityLoadout   = this.abilityLoadout || getInitialAbilityLoadout();
    this.player.abilityCooldowns = {};
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
    this.bossesKilledThisRun = 0;
    this.runLootCollected = [];
    this.runAbilityLoot   = [];
    this.runLootCount = 0;
    this.secretRunStats = { uniqueBossesKilled: new Set(), bossKilledAtLowHP: false, lootCollected: 0 };
    this.waveDirector = new WaveDirector();
    this.usedBossIds  = new Set();
    this.activeEvent  = null;
    this.nextEventTime= rand(60,120);
    this.sessionRubies = 0;
    this.sessionGems   = 0;
    this.runKillStats  = { kills: 0, elites: 0, bosses: 0, crits: 0, gold: 0, gear: 0, abilities: 0, shopBuys: 0 };

    // ── Game Mode setup ───────────────────────────────────────────────────
    this.modeRules = getModeRules(mode);
    this.modeState = getModeInitialState(mode);
    // 1-5 rating that scales equipment/ability/chest/boss rarity odds — see
    // constants/DifficultyData.js. Harder modes roll better loot.
    this.difficultyRating = getModeDifficulty(mode);
    const bossInterval = this.modeRules.bossInterval ?? 60; // in seconds (sessionTime is also seconds)
    this.nextBossTime  = bossInterval;

    // ── Shop Manager ────────────────────────────────────────────────────
    if (this.shopManager) {
      this.shopManager.sessionMinutes = 0;
      this.shopManager._refresh();
    } else {
      this.shopManager = new ShopManager({});
    }

    // Apply meta stats (tech tree + pet + prestige) to player
    const ms = this.metaStats || {};
    if (this.player) {
      if (ms.damageMult)         this.player.damageMult        = (this.player.damageMult || 1)        + ms.damageMult;
      if (ms.maxHpBonus)        { this.player.maxHp            += ms.maxHpBonus; this.player.hp = this.player.maxHp; }
      if (ms.shieldCapBonus)     this.player.shieldMax         = (this.player.shieldMax || 0)          + ms.shieldCapBonus;
      if (ms.shieldRegenBonus)   this.player.shieldRegen       = (this.player.shieldRegen || 0)        + ms.shieldRegenBonus;
      if (ms.moveSpeedMult)      this.player.speed             = (this.player.speed || 3)             * (1 + ms.moveSpeedMult);
      if (ms.xpMult)             this.player.xpMult            = (this.player.xpMult || 1)            * (1 + ms.xpMult);
      if (ms.goldMult)           this.player.goldMult          = (this.player.goldMult || 1)           * (1 + ms.goldMult);
      if (ms.critChance)         this.player.critChance        = (this.player.critChance || 0)         + ms.critChance;
      if (ms.critDamageMult)     this.player.critDamageMult    = (this.player.critDamageMult || 1.5)   + ms.critDamageMult;
      if (ms.abilityPowerMult)   this.player.abilityPower      = (this.player.abilityPower || 1)       + ms.abilityPowerMult;
      if (ms.cooldownReduction)  this.player.cooldownReduction = (this.player.cooldownReduction || 0)  + ms.cooldownReduction;
      if (ms.droneDamageMult)    this.player.droneDamageMult   = (this.player.droneDamageMult || 1)    + ms.droneDamageMult;
      if (ms.droneCountBonus)    this.player.drones            = (this.player.drones || 0)             + Math.floor(ms.droneCountBonus);
      // Apply shop stats too
      const ss = this.shopManager.getStats();
      if (ss.damageMult)         this.player.damageMult        = (this.player.damageMult || 1)        + ss.damageMult;
      if (ss.maxHpBonus)        { this.player.maxHp            += ss.maxHpBonus; this.player.hp = Math.min(this.player.hp + ss.maxHpBonus, this.player.maxHp); }
      if (ss.shieldCapBonus)     this.player.shieldMax         = (this.player.shieldMax || 0)          + ss.shieldCapBonus;
    }

    // Apply mode multipliers to player economy
    if (this.modeRules.xpMult   && this.modeRules.xpMult   !== 1) this.player.xpMult   = (this.player.xpMult   || 1) * this.modeRules.xpMult;
    if (this.modeRules.goldMult && this.modeRules.goldMult !== 1) this.player.goldMult  = (this.player.goldMult || 1) * this.modeRules.goldMult;

    // Apply Gear Hangar loadout bonuses to player
    if (this.equipmentBonuses) {
      applyEquipmentToPlayer(this.player, this.equipmentBonuses);
      // Sync drone count from gear
      if (this.player.gearDrones) {
        this.player.drones = (this.player.drones || 0) + this.player.gearDrones;
      }
    }

    // Apply one-time passive ability bonuses (Quantum Magazine, Drone Commander,
    // Treasure Scanner, Boss Hunter, etc.) now that the loadout + equipment are set.
    applyPassiveAbilities(this.player);

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
    this._updateChests(dt);
    this._updateEquipmentDrops(dt);
    this._updateAbilityDrops(dt);
    this._updateAbilities(dt);
    this._updateParticles(dt);
    this._updatePods(dt);
    this._updateSpawning(dt);
    this._updateEvents(dt);
    this._updateWave(dt);
    // Tick shop manager (convert dt frames→seconds: 1 tick ≈ 1/60s)
    if (this.shopManager) {
      const refreshed = this.shopManager.tick(dt / 60, this.sessionTime / 60);
      if (refreshed) this.onStateChange({ shopRefreshed: true });
    }
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
    if (this.isMobileDevice && (this.joystickInput.x !== 0 || this.joystickInput.y !== 0)) {
      acc.x = this.joystickInput.x;
      acc.y = this.joystickInput.y;
    } else {
      if (this.keys['KeyW']||this.keys['ArrowUp'])   acc.y -= 1;
      if (this.keys['KeyS']||this.keys['ArrowDown']) acc.y += 1;
      if (this.keys['KeyA']||this.keys['ArrowLeft']) acc.x -= 1;
      if (this.keys['KeyD']||this.keys['ArrowRight']) acc.x += 1;
    }
    const l = V.len(acc);
    if (l>0) { p.vel = V.lerp(p.vel, V.scale(this.isMobileDevice ? acc : V.norm(acc), speed), 0.18*dt); } else { p.vel = V.lerp(p.vel, V.zero(), 0.15*dt); }
    p.pos = V.add(p.pos, V.scale(p.vel, dt*0.016667));
    
    if (this.isMobileDevice) {
      let targetedEnemy = null;
      let shortestDistance = 400;
      this.enemies.forEach(e => {
        if (!e.active || e.spawnFlash > 0) return;
        const d = V.dist(p.pos, e.pos);
        if (d < shortestDistance) { shortestDistance = d; targetedEnemy = e; }
      });
      if (this.boss && this.boss.active && V.dist(p.pos, this.boss.pos) < shortestDistance) { targetedEnemy = this.boss; }
      
      if (this.touchAimingActive) {
        this.mouse.wx = this.touchAimPos.x - this.W/2 + this.camera.x;
        this.mouse.wy = this.touchAimPos.y - this.H/2 + this.camera.y;
        p.angle = Math.atan2(this.mouse.wy - p.pos.y, this.mouse.wx - p.pos.x);
      } else if (targetedEnemy) {
        p.angle = Math.atan2(targetedEnemy.pos.y - p.pos.y, targetedEnemy.pos.x - p.pos.x);
        this.mouse.down = true;
      } else {
        this.mouse.down = false;
        if (V.len(p.vel) > 0.1) p.angle = Math.atan2(p.vel.y, p.vel.x);
      }
    } else {
      p.angle = Math.atan2(this.mouse.wy - p.pos.y, this.mouse.wx - p.pos.x);
    }

    this.camera.x = lerp(this.camera.x, p.pos.x, 0.1*dt);
    this.camera.y = lerp(this.camera.y, p.pos.y, 0.1*dt);
    if (!this.isMobileDevice) {
      this.mouse.wx = this.mouse.x - this.W/2 + this.camera.x;
      this.mouse.wy = this.mouse.y - this.H/2 + this.camera.y;
    }

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
    const p = this.player; if (!p || p.bombCooldown/60 > 0 || p.bombDmg<=0) return;
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
      } else { d.shootCooldown -= dt; }
    });
  }

  _updateEnemies(dt) {
    const p = this.player; if (!p || p.dead) return;
    this.enemies = this.enemies.filter(e => e.active);
    const sessionMinutes = this.sessionTime / 60;

    this.enemies.forEach(e => {
      if (e.spawnFlash > 0) { e.spawnFlash -= dt; return; }

      updateEnemyAI(
        e, p, dt, this.tick,
        // enemyShootFn: (src, dir, dmg?, spd?, color?, radius?, lifetime?)
        (src, dir, dmg, spd, color, radius, lifetime) => {
          this._enemyShoot(src, dir, dmg, spd, color, radius, lifetime);
        },
        // spawnFighterFn: carrier spawns child drones
        (type, pos) => {
          const child = makeEnemy();
          configureEnemy(child, type, this.wave, p.pos, sessionMinutes);
          child.pos = { x: pos.x, y: pos.y };
          this.enemies.push(child);
        }
      );

      // Swarm separation
      if (e.behavior === 'swarm' && e.active) {
        this.enemies.forEach(o => {
          if (o !== e && o.behavior === 'swarm' && o.active) {
            const sd = V.dist(e.pos, o.pos);
            if (sd < 25 && sd > 0) {
              const sn = V.norm(V.sub(e.pos, o.pos));
              e.vel.x += sn.x * 2 * dt;
              e.vel.y += sn.y * 2 * dt;
            }
          }
        });
      }

      // Contact damage
      if (!p.invuln && V.dist(e.pos, p.pos) < e.radius + p.radius) {
        this._damagePlayer(e.damage);
        this.audio.damage();
        // Dash types detonate on contact
        if (e.behavior === 'chase_fast') {
          this._spawnParticles(e.pos, e.color, 12, 3, 20);
          this._killEnemy(e);
        }
      }

      // Leash: pull runaway enemies back toward the player so they can't escape off-screen
      const leashDist = 1400;
      if (V.dist(e.pos, p.pos) > leashDist) {
        const angle = Math.random() * Math.PI * 2;
        const spawnDist = 600 + Math.random() * 200;
        e.pos = {
          x: p.pos.x + Math.cos(angle) * spawnDist,
          y: p.pos.y + Math.sin(angle) * spawnDist,
        };
        e.vel = { x: 0, y: 0 };
        e.spawnFlash = 15; // brief flash on re-entry
      }
    });
  }

  _enemyShoot(e, dir, damage, speed, color, radius, lifetime) {
    const b = this.bullets.get();
    b.active = true; b.owner = 'enemy';
    b.pos = { x: e.pos.x, y: e.pos.y };
    b.vel = { x: dir.x * (speed || 5), y: dir.y * (speed || 5) };
    b.damage = damage || e.damage || 10;
    b.radius = radius || 5;
    b.color  = color  || '#f87171';
    b.pierce = 0; b.maxLifetime = lifetime || 70; b.lifetime = 0;
    b.trail  = [];
  }

  _killEnemy(e) {
    if (!e.active || !this.player) return;
    e.active = false;
    this.player.kills++;
    this.player.killCount = (this.player.killCount || 0) + 1;
    this.runKillStats.kills++;

    const xpGain   = Math.floor(e.xpDrop   * this.player.xpMult);
    const goldGain  = Math.floor(e.goldDrop  * this.player.goldMult);
    this.runKillStats.gold += goldGain;
    this._spawnLoot(e.pos, xpGain, goldGain);
    this._spawnParticles(e.pos, e.color, 12, 3, 20);
    this.audio.explosion(); this.player.score += e.xpDrop; this._grantXP(xpGain);

    // Ruby drops from elite enemies
    if (e.isElite) {
      this.runKillStats.elites++;
      const rubyMult = (this.modeRules.rubyDropMult || 1) * (1 + (this.metaStats?.rubyDropMult || 0));
      const rubies = rollRubyDrop('elite_boss', rubyMult);
      if (rubies > 0) {
        this.sessionRubies += rubies;
        this.onStateChange({ rubyPickup: rubies });
        setTimeout(() => this.onStateChange({ rubyPickup: null }), 1200);
      }
    }
  }

  _updateBoss(dt) {
    const b = this.boss;
    if (!b || !b.active) {
      if (this.sessionTime >= this.nextBossTime && !this.boss) {
        this._spawnBoss();
        const interval = this.modeRules.bossInterval ?? 60; // seconds
        this.nextBossTime += interval;
      }
      return;
    }
    const p = this.player; if (!p||p.dead) return;
    if (b.flash>0) b.flash-=dt; if (b.spawnFlash>0) { b.spawnFlash-=dt; return; }

    const hpPct = b.hp/b.maxHp; let newPhase = 0;
    for (let i=this.bossData.phases.length-1;i>=0;i--) { if (hpPct <= this.bossData.phases[i].hpThresh) { newPhase=i; break; } }
    if (newPhase > this.bossPhase) {
      this.bossPhase = newPhase;
      this.shake = 12;
      this._spawnParticles(b.pos, this.bossData.accent, 30, 5, 40);
      const phaseData = this.bossData.phases[newPhase];
      if (phaseData?.announceText) {
        this.onStateChange({ bossPhaseAlert: phaseData.announceText });
        setTimeout(() => this.onStateChange({ bossPhaseAlert: null }), 3000);
      }
    }

    const phase = this.bossData.phases[this.bossPhase]; const dx = p.pos.x-b.pos.x, dy=p.pos.y-b.pos.y; const dist = Math.sqrt(dx*dx+dy*dy)||1;
    const nx=dx/dist, ny=dy/dist; const spd = phase.speed;

    b.angle += 0.005*dt*spd;
    if (b.laserAngle !== undefined) b.laserAngle += 0.015 * dt * spd;
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

    // ── NEW boss attack types ─────────────────────────────────────────────────

    } else if (attack === 'spawn_swarm') {
      const sessionMinutes = this.sessionTime / 60;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU;
        const child = makeEnemy();
        configureEnemy(child, 'drone_swarm', this.wave, this.player.pos, sessionMinutes);
        child.pos = { x: b.pos.x + Math.cos(a) * b.radius, y: b.pos.y + Math.sin(a) * b.radius };
        this.enemies.push(child);
      }

    } else if (attack === 'rage_swarm') {
      const sessionMinutes = this.sessionTime / 60;
      for (let i = 0; i < 8; i++) {
        const a = rand(0, TAU);
        const child = makeEnemy();
        configureEnemy(child, 'drone_swarm', this.wave, this.player.pos, sessionMinutes);
        child.pos = { x: b.pos.x + Math.cos(a) * (b.radius + 20), y: b.pos.y + Math.sin(a) * (b.radius + 20) };
        this.enemies.push(child);
      }

    } else if (attack === 'acid_spray') {
      for (let i = 0; i < 8; i++) {
        const bullet = this.bullets.get(); bullet.active = true; bullet.owner = 'boss'; bullet.pos = V.copy(b.pos);
        const a = Math.atan2(ny, nx) + rand(-0.55, 0.55);
        bullet.vel = { x: Math.cos(a) * 6, y: Math.sin(a) * 6 };
        bullet.damage = 18; bullet.radius = 6; bullet.color = '#86efac'; bullet.maxLifetime = 85; bullet.lifetime = 0;
      }

    } else if (attack === 'rotating_laser') {
      if (b.laserAngle === undefined) b.laserAngle = 0;
      for (let i = 0; i < 2; i++) {
        const bullet = this.bullets.get(); bullet.active = true; bullet.owner = 'boss'; bullet.pos = V.copy(b.pos);
        const a = b.laserAngle + i * Math.PI;
        bullet.vel = { x: Math.cos(a) * 10, y: Math.sin(a) * 10 };
        bullet.damage = 20; bullet.radius = 5; bullet.color = '#7dd3fc'; bullet.maxLifetime = 70; bullet.lifetime = 0;
      }

    } else if (attack === 'dual_laser') {
      if (b.laserAngle === undefined) b.laserAngle = 0;
      for (let i = 0; i < 4; i++) {
        const bullet = this.bullets.get(); bullet.active = true; bullet.owner = 'boss'; bullet.pos = V.copy(b.pos);
        const a = b.laserAngle + (i * Math.PI / 2);
        bullet.vel = { x: Math.cos(a) * 11, y: Math.sin(a) * 11 };
        bullet.damage = 22; bullet.radius = 5; bullet.color = '#38bdf8'; bullet.maxLifetime = 65; bullet.lifetime = 0;
      }

    } else if (attack === 'shockwave') {
      for (let i = 0; i < 16; i++) {
        const bullet = this.bullets.get(); bullet.active = true; bullet.owner = 'boss';
        const a = (i / 16) * TAU;
        bullet.pos = { x: b.pos.x + Math.cos(a) * b.radius, y: b.pos.y + Math.sin(a) * b.radius };
        bullet.vel = { x: Math.cos(a) * 8, y: Math.sin(a) * 8 };
        bullet.damage = 25; bullet.radius = 8; bullet.color = '#fbbf24'; bullet.maxLifetime = 60; bullet.lifetime = 0;
      }
      this.shake = 8;

    } else if (attack === 'black_hole_pull') {
      // Pull player toward boss
      const pullDir = V.norm(V.sub(b.pos, p.pos));
      p.vel.x += pullDir.x * 8;
      p.vel.y += pullDir.y * 8;
      // Visualize pull
      this._spawnParticles(b.pos, '#f43f5e', 15, 8, 30);

    } else if (attack === 'projectile_storm') {
      for (let i = 0; i < 20; i++) {
        const bullet = this.bullets.get(); bullet.active = true; bullet.owner = 'boss';
        const a = (i / 20) * TAU + this.tick * 0.02;
        bullet.pos = { x: b.pos.x + Math.cos(a) * b.radius, y: b.pos.y + Math.sin(a) * b.radius };
        bullet.vel = { x: Math.cos(a) * 7, y: Math.sin(a) * 7 };
        bullet.damage = 14; bullet.radius = 4; bullet.color = '#f43f5e'; bullet.maxLifetime = 80; bullet.lifetime = 0;
      }
      this.shake = 6;
    }
  }

  _spawnBoss() {
    const sessionMinutes = this.sessionTime / 60;
    const data = selectBoss(sessionMinutes, this.bossesKilledThisRun, this.usedBossIds);
    const scaledHp = scaleBossHp(data, this.wave, sessionMinutes);
    const angle = rand(0, TAU);
    this.boss = {
      pos: { x: this.player.pos.x + Math.cos(angle) * 500, y: this.player.pos.y + Math.sin(angle) * 500 },
      vel: V.zero(),
      hp: scaledHp, maxHp: scaledHp,
      angle: 0, radius: data.radius,
      flash: 0, active: true, spawnFlash: 60,
      laserAngle: 0, pullStrength: 0,
    };
    this.bossData      = data;
    this.bossPhase     = 0;
    this.bossAttackTimer = 120;
    this.bossAttackIdx   = 0;
    this.usedBossIds.add(data.id);
    this.shake = 15;
    this.audio.bossAppear();
    this._spawnParticles(this.boss.pos, data.accent, 40, 6, 60);
    this.onStateChange({ bossName: data.name, bossAlert: true });
    setTimeout(() => this.onStateChange({ bossAlert: false }), 3500);
  }

  _killBoss() {
    if (!this.boss || !this.bossData) return;
    this.bossesKilledThisRun++;
    const bossPos = { ...this.boss.pos };
    const bossName = this.bossData.name;
    const bossHpWasLow = (this.boss.hp / this.boss.maxHp) < 0.10;

    // Track secret drop conditions
    this.secretRunStats.uniqueBossesKilled.add(bossName);
    if (bossHpWasLow) this.secretRunStats.bossKilledAtLowHP = true;

    this._spawnLoot(bossPos, this.bossData.xpDrop, this.bossData.goldDrop);
    // Raid mode gets upgraded chest; world boss gets cosmic vault
    const chestTierOverride = this.modeRules?.raidMode ? 'RAID_CHEST'
                            : this.modeRules?.worldBossMode ? 'COSMIC_VAULT'
                            : this.bossData.chestTier;
    this._spawnChest(bossPos, chestTierOverride || this.bossData.chestTier);

    // Spawn equipment drops
    const items = spawnBossEquipmentDrops(
      this.equipDrops, bossPos, bossName, this.wave,
      (pos, color, count, speed, life) => this._spawnParticles(pos, color, count, speed, life),
      this.difficultyRating
    );
    if (items.length > 0) {
      this.onStateChange({ bossDropItems: items, bossDropBossName: bossName });
      setTimeout(() => this.onStateChange({ bossDropItems: null }), 4000);
    }

    // Spawn ability drops (always at least 1 per boss kill)
    const hasBossHunter = !!(this.abilityLoadout?.passive1?.effectKey === 'BOSS_HUNTER' ||
                              this.abilityLoadout?.passive2?.effectKey === 'BOSS_HUNTER' ||
                              this.abilityLoadout?.passive3?.effectKey === 'BOSS_HUNTER');
    spawnBossAbilityDrops(
      this.abilityDrops, bossPos, bossName, this.wave, hasBossHunter,
      (pos, color, count, speed, life) => this._spawnParticles(pos, color, count, speed, life),
      this.difficultyRating
    );

    if (this.player) this.player._cosmicBossKills = (this.player._cosmicBossKills || 0) + 1;

    this._spawnParticles(bossPos, this.bossData.accent, 60, 7, 80);
    this._spawnParticles(bossPos, '#fff', 30, 5, 50);
    this.shake = 20;
    this.audio.explosion();
    this.player.score += this.bossData.xpDrop * 5;
    this._grantXP(this.bossData.xpDrop * this.player.xpMult);

    // Ruby drops from boss kill
    this.runKillStats.bosses++;
    const bossRubyType = this.modeRules.raidMode ? 'raid_boss' : 'regular_boss';
    const rubyMult = (this.modeRules.rubyDropMult || 1) * (1 + (this.metaStats?.rubyDropMult || 0));
    const bossRubies = rollRubyDrop(bossRubyType, rubyMult);
    if (bossRubies > 0) {
      this.sessionRubies += bossRubies;
      this.onStateChange({ rubyPickup: bossRubies });
      setTimeout(() => this.onStateChange({ rubyPickup: null }), 2000);
    }

    // Gems — scarce premium currency, only a chance on the hardest boss types
    // (raid bosses / world bosses). Regular bosses never drop gems.
    const bossGemType = this.modeRules.raidMode ? 'raid_boss' : (this.modeRules.huntMode ? 'world_boss' : null);
    if (bossGemType) {
      const bossGems = rollGemDrop(bossGemType);
      if (bossGems > 0) {
        this.sessionGems += bossGems;
        this.onStateChange({ gemPickup: bossGems });
        setTimeout(() => this.onStateChange({ gemPickup: null }), 2200);
      }
    }

    this.boss.active = false;
    this.boss = null;
    this.bossData = null;
    this.onStateChange({ bossName: null });
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
    if (this.player) this.player.dead = true;
    this.gameOver = true;
    this.running  = false;
    const loot        = [...(this.runLootCollected || [])];
    const abilityLoot = [...(this.runAbilityLoot   || [])];
    const sessionMinutes = this.sessionTime / 60;
    // Account XP for this run
    const accountXPEarned =
      this.runKillStats.bosses * 150 +
      this.runKillStats.elites * 30  +
      Math.floor(sessionMinutes * 20)  +
      200; // run completion bonus
    setTimeout(() => {
      this.onStateChange({
        gameOver: true,
        finalScore:        this.player ? this.player.score  : 0,
        finalKills:        this.player ? this.player.kills  : 0,
        finalLevel:        this.player ? this.player.level  : 1,
        finalTime:         this.sessionTime,
        finalWave:         this.wave,
        finalBossesKilled: this.bossesKilledThisRun,
        finalGold:         this.player ? Math.floor(this.player.gold) : 0,
        finalXP:           this.player ? Math.floor(this.player.xp)   : 0,
        runLoot:           loot,
        runAbilityLoot:    abilityLoot,
        // New fields for meta progression
        finalRubies:       this.sessionRubies,
        finalGems:         this.sessionGems,
        finalAccountXP:    accountXPEarned,
        finalMode:         this.mode,
        runKillStats:      { ...this.runKillStats },
        runMinutes:        Math.floor(sessionMinutes),
      });
    }, 500);
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

  _spawnChest(pos, tierKey) {
    const chest = this.chests.get();
    chest.active = true;
    chest.tier = tierKey;
    chest.pos = {x: pos.x + rand(-40, 40), y: pos.y + rand(-40, 40)};
    chest.vel = {x: rand(-1, 1), y: rand(-1, 1)};
    chest.pulse = 0;
    chest.spin = 0;
    chest.opened = false;
    const tierDef = CHEST_TIERS[tierKey] || CHEST_TIERS.RARE_CRATE;
    chest.tier = tierDef === CHEST_TIERS[tierKey] ? tierKey : 'RARE_CRATE';
    this._spawnParticles(chest.pos, tierDef.color, 20, 3, 30);
  }

  // _spawnEquipmentDrop replaced by EquipmentDropSystem.spawnBossEquipmentDrops

  _updateChests(dt) {
    const p = this.player;
    if (!p) return;
    this.chests.forEach(c => {
      if (!c.active || c.opened) return;
      c.pulse += 0.06 * dt;
      c.spin += 0.02 * dt;
      c.vel.x *= 0.95;
      c.vel.y *= 0.95;
      c.pos.x += c.vel.x * dt;
      c.pos.y += c.vel.y * dt;
      
      if (V.dist(c.pos, p.pos) < c.radius + p.radius + 10) {
        this._openChest(c);
      }
    });
  }

  _openChest(chest) {
    if (chest.opened) return;
    chest.opened = true;
    const tier = CHEST_TIERS[chest.tier];
    const rewards = tier.rewards;

    const coins = randInt(rewards.coins[0], rewards.coins[1]);
    const xp    = randInt(rewards.xp[0],   rewards.xp[1]);

    this.player.gold += coins;
    this._grantXP(xp);

    // Ruby drops from chests
    const rubyMult   = (this.modeRules?.rubyDropMult || 1) * (1 + (this.metaStats?.rubyDropMult || 0));
    const lootQual   = (this.player?.lootQuality || 0) + (this.metaStats?.lootQuality || 0);
    const chestId    = chest.chestSystemId || this._tierKeyToChestId(chest.tier);
    const chestRewards = generateChestRewards(chestId, { lootQuality: lootQual, rubyMult, difficultyRating: this.difficultyRating });

    if (chestRewards.rubies > 0) {
      this.sessionRubies += chestRewards.rubies;
      this.onStateChange({ rubyPickup: chestRewards.rubies });
      setTimeout(() => this.onStateChange({ rubyPickup: null }), 2000);
    }

    // Track chest opened for achievements
    this.runKillStats.chests = (this.runKillStats.chests || 0) + 1;

    // Equipment drop
    if (Math.random() < rewards.equipChance) {
      spawnChestEquipmentDrop(
        this.equipDrops, chest.pos, this.wave,
        (pos, color, count, speed, life) => this._spawnParticles(pos, color, count, speed, life),
        this.difficultyRating
      );
    }

    // Ability drop
    if (Math.random() < rewards.abilityChance) {
      spawnChestAbilityDrop(
        this.abilityDrops, chest.pos, this.wave,
        (pos, color, count, speed, life) => this._spawnParticles(pos, color, count, speed, life),
        this.difficultyRating
      );
    }

    // Signal chest opened to UI (for animation screen)
    this.onStateChange({
      chestOpened: {
        type: chestId,
        rewards: { gold: coins, xp, rubies: chestRewards.rubies, items: chestRewards.items },
        id: Date.now(),
      }
    });
    setTimeout(() => this.onStateChange({ chestOpened: null }), 200);

    this._spawnParticles(chest.pos, tier.color, 40, 5, 50);
    this.audio.powerup();
    this.shake = 5;

    setTimeout(() => { this.chests.release(chest); }, 100);
  }

  /** Map internal CHEST_TIERS key → ChestSystem id */
  _tierKeyToChestId(tierKey) {
    const map = {
      COMMON_CACHE:  'common_cache',
      RARE_CRATE:    'rare_crate',
      ELITE_ARSENAL: 'elite_arsenal',
      MYTHIC_RELIC:  'mythic_relic',
      COSMIC_VAULT:  'cosmic_vault',
      RAID_CHEST:    'raid_chest',
    };
    return map[tierKey] ?? 'common_cache';
  }

  _updateEquipmentDrops(dt) {
    const p = this.player;
    if (!p) return;
    updateEquipmentDrops(
      this.equipDrops, p, dt,
      (item) => {
        // Item picked up
        this.runLootCollected.push(item);
        this.runLootCount++;
        this.secretRunStats.lootCollected++;
        this.onStateChange({ equipmentPickup: item });
        this.audio.powerup();
        setTimeout(() => this.onStateChange({ equipmentPickup: null }), 3000);
      },
      (pos, color, count, speed, life) => this._spawnParticles(pos, color, count, speed, life)
    );
  }

  _updateAbilities(dt) {
    const p = this.player;
    if (!p) return;

    // Tick all ability cooldowns (in seconds)
    if (p.abilityCooldowns) {
      Object.keys(p.abilityCooldowns).forEach(id => {
        if (p.abilityCooldowns[id] > 0) {
          p.abilityCooldowns[id] = Math.max(0, p.abilityCooldowns[id] - dt * 0.016667);
        }
      });
    }

    // Last Signal speed boost
    if (p._lastSignalActive) {
      p._effectiveSpeedMult = (p.speedMult || 1) * (p._lastSignalSpeedMult || 1);
    } else {
      p._effectiveSpeedMult = p.speedMult || 1;
    }

    // Apply temporal slow to enemies
    this.enemies.forEach(e => {
      if (e._temporalSlowed) {
        e._temporalSlowTimer = (e._temporalSlowTimer || 0) - dt;
        if (e._temporalSlowTimer <= 0) {
          e._temporalSlowed = false;
          e._speedBeforeSlow = undefined;
        }
      }
    });

    // Per-frame passive processing
    updatePassiveAbilities(p, dt, this._abilityGameContext());

    // Active effect processing (UFO, Singularity, etc.)
    updateActiveEffects(this.abilityEffects, p, dt, this._abilityGameContext());

    // Scavenger drone — auto-attract all loot
    if (p.autoScavenge && this.tick % 60 === 0) {
      this.loot.forEach(l => { if (l.active) l.attracted = true; });
    }

    // Toxic trail (legacy support + new system)
    const hasToxicTrail = p.abilityLoadout && Object.values(p.abilityLoadout)
      .some(a => a && (a.effectKey === 'TOXIC_TRAIL' || a.id === 'toxic_trail'));
    if (hasToxicTrail && V.len(p.vel) > 1 && this.tick % 8 === 0) {
      this.toxicClouds.push({ pos: V.copy(p.pos), radius: 45, life: 480, maxLife: 480 });
    }
    this.toxicClouds = this.toxicClouds.filter(c => { c.life -= dt; return c.life > 0; });
    this.toxicClouds.forEach(cloud => {
      this.enemies.forEach(e => {
        if (e.active && V.dist(e.pos, cloud.pos) < cloud.radius + e.radius) {
          // Slow + amplify damage (tracked via flag)
          e._inToxicCloud = true;
          if (e.speed > 0.1) e.speed *= Math.max(0.5, 1 - 0.015 * dt);
        }
      });
    });
  }

  _updateAbilityDrops(dt) {
    const p = this.player;
    if (!p) return;
    updateAbilityDrops(
      this.abilityDrops, p, dt,
      (ability) => {
        // Ability picked up
        if (!this.runAbilityLoot) this.runAbilityLoot = [];
        this.runAbilityLoot.push(ability);
        this.onStateChange({ abilityPickup: ability });
        this.audio.powerup();
        setTimeout(() => this.onStateChange({ abilityPickup: null }), 3000);
      },
      (pos, color, count, speed, life) => this._spawnParticles(pos, color, count, speed, life)
    );
  }

  _activateAbilitySlot(slotKey) {
    const p = this.player;
    if (!p || p.dead || this.gameOver || this.shopOpen || this.paused) return;
    const ability = p.abilityLoadout && p.abilityLoadout[slotKey];
    if (!ability) return;

    // Temporal Anchor second activation (R pressed again)
    if (ability.effectKey === 'TEMPORAL_ANCHOR' && p._temporalAnchorState === 'recording') {
      activateAbility(ability, p, this._abilityGameContext());
      return;
    }

    const activated = activateAbility(ability, p, this._abilityGameContext());
    if (activated) {
      this.onStateChange({ abilityCooldowns: { ...(p.abilityCooldowns || {}) } });
    }
  }

  // Context object passed to AbilitySystem — dependency injection
  _abilityGameContext() {
    return {
      getEnemies:      () => this.enemies.filter(e => e.active),
      getBoss:         () => (this.boss && this.boss.active) ? this.boss : null,
      killEnemy:       (e) => { if (e.active) this._killEnemy(e); },
      spawnParticles:  (pos, color, count, speed, life) => this._spawnParticles(pos, color, count, speed, life),
      screenShake:     (amt) => { this.shake = Math.max(this.shake, amt); },
      addActiveEffect: (fx) => { this.abilityEffects.push(fx); },
      triggerSupernova:(pos, dmg) => {
        this._spawnParticles(pos, '#fbbf24', 60, 10, 70);
        this._spawnParticles(pos, '#fff', 30, 6, 50);
        this.shake = Math.max(this.shake, 20);
        this.enemies.forEach(e => {
          if (e.active) { e.hp -= dmg; e.flash = 15; if (e.hp <= 0) this._killEnemy(e); }
        });
        if (this.boss && this.boss.active) { this.boss.hp -= dmg * 0.15; this.boss.flash = 12; }
      },
    };
  }

  _killEnemy(e) {
    if (!e.active) return;
    e.active = false;
    const p = this.player;
    if (p) {
      p.score  += e.xpDrop || 10;
      p.kills  = (p.kills  || 0) + 1;
      p.killCount = (p.killCount || 0) + 1;
    }
    this._spawnLoot(e.pos, e.xpDrop || 10, e.goldDrop || 5);
    this._spawnParticles(e.pos, e.color || '#ef4444', 8, 2, 18);
    this.audio.explosion();
  }

  _updateParticles(dt) {
    this.particles.forEach(p => {
      if (!p.active) return; p.life -= dt; if (p.life<=0) { this.particles.release(p); return; }
      p.pos.x += p.vel.x*dt; p.pos.y += p.vel.y*dt; p.vel.x *= 0.93; p.vel.y *= 0.93; p.alpha = p.life/p.maxLife;
    });
  }

  _spawnParticles(pos, color, count, speed, maxLife) {
    const adjustedCount = this.mobilePerformanceMode ? Math.ceil(count * 0.4) : count;
    const maxPoolLimit = this.mobilePerformanceMode ? 120 : 350;
    for (let i=0;i<adjustedCount;i++) {
      if (this.particles.size > maxPoolLimit) return;
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

  _updateWave(dt) {
    this.waveTimer += dt;
    if (this.waveTimer >= 1800) { this.wave++; this.waveTimer = 0; }
  }

  _updateSpawning(dt) {
    if (!this.player) return;
    const sessionMinutes = this.sessionTime / 60;
    const toSpawn = this.waveDirector.update(
      dt, sessionMinutes, this.wave,
      this.enemies.filter(e => e.active).length,
      this.player.pos
    );
    toSpawn.forEach(spawn => {
      const e = makeEnemy();
      configureEnemy(e, spawn.type, this.wave, this.player.pos, sessionMinutes);
      if (spawn.pos) { e.pos = { x: spawn.pos.x, y: spawn.pos.y }; }
      this.enemies.push(e);
    });
  }

  // Used by event system (_triggerEvent) for ad-hoc spawns
  _spawnEnemy(typeOverride) {
    if (!this.player) return;
    const sessionMinutes = this.sessionTime / 60;
    const eventTypes = ['fighter', 'scout', 'interceptor', 'ufo_scout'];
    const type = typeOverride || eventTypes[randInt(0, eventTypes.length - 1)];
    const e = makeEnemy();
    configureEnemy(e, type, this.wave, this.player.pos, sessionMinutes);
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
        const e=makeEnemy();
        const sessionMinutes = this.sessionTime / 60;
        configureEnemy(e, 'interceptor', this.wave, this.player.pos, sessionMinutes);
        // Override position to drop from above
        e.pos = { x: this.player.pos.x + rand(-400, 400), y: this.player.pos.y - 500 };
        e.vel = { x: rand(-1, 1), y: rand(5, 8) };
        e.behavior = 'chase_fast'; // fast direct descent
        e.spawnFlash = 0;
        this.enemies.push(e);
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
  _togglePause() {
    this.paused = !this.paused;
    this.onStateChange({ paused: this.paused });
  }
  pause()  { if (!this.paused) this._togglePause(); }
  resume() { if (this.paused)  this._togglePause(); }
  quitGame() {
    // Called from "Leave Game" in pause menu — run normal end-game flow so loot is awarded
    if (this.paused) { this.paused = false; }
    this._endGame(false);
  }
  applyUpgrade(upgradeId) {
    const upgrade = UPGRADES.find(u=>u.id===upgradeId); if (!upgrade||!this.player||this.player.gold < upgrade.cost) return;
    this.player.gold -= upgrade.cost; upgrade.apply(this.player); this.purchasedItems.push(upgradeId); this.audio.purchase(); this._syncUI();
  }

  _syncUI() {
    if (!this.player) return;
    this.onStateChange({
      hp: Math.max(0,this.player.hp), maxHp: this.player.maxHp, shield: this.player.shield, shieldMax: this.player.shieldMax, xp: this.player.xp, xpToNext: this.player.xpToNext, level: this.player.level, gold: Math.floor(this.player.gold), score: this.player.score, kills: this.player.kills, wave: this.wave, sessionTime: this.sessionTime, bossHp: this.boss ? this.boss.hp : 0, bossMaxHp: this.boss ? this.boss.maxHp : 0, dashReady: this.player.dashCooldown<=0, bombReady: this.player.dashCooldown<=0 && this.player.bombDmg>0, bombDmg: this.player.bombDmg, drones: this.player.drones, purchasedItems: this.purchasedItems, shopOpen: this.shopOpen,
      abilityCooldowns: this.player.abilityCooldowns || {},
      abilityLoadout: this.player.abilityLoadout || {},
      godMachineActive: this.player._godMachineActive || false,
      lastSignalActive: this.player._lastSignalActive || false,
      temporalAnchorReady: this.player._temporalAnchorState === 'recording',
      // Meta / shop
      sessionRubies: this.sessionRubies,
      sessionGems:   this.sessionGems,
      shopTimer:     this.shopManager ? this.shopManager.getTimerDisplay() : 25,
      shopSlots:     this.shopManager ? this.shopManager.getSlots() : [],
      modeId:        this.mode,
    });
  }

  // ── Public API for page.js ─────────────────────────────────────────────────

  /** Inject meta stats before calling startGame(). */
  setMetaStats(metaStats) {
    this.metaStats = metaStats || {};
  }

  /** Inject a pre-configured ShopManager (with persisted ranks). */
  setShopManager(manager) {
    this.shopManager = manager;
  }

  /** Purchase a slot from the in-game upgrade shop. Returns result from ShopManager. */
  purchaseShopUpgrade(slotIndex) {
    if (!this.shopManager || !this.player) return { success: false };
    const result = this.shopManager.purchase(slotIndex, Math.floor(this.player.gold));
    if (result.success) {
      this.player.gold = result.newGold;
      this.runKillStats.shopBuys++;
      // Apply the stat immediately to the player
      const stat = result.stat;
      const gain = result.gainedAmount;
      this._applyShopStatToPlayer(stat, gain);
      this.audio.purchase?.();
      this._syncUI();
    }
    return result;
  }

  _applyShopStatToPlayer(stat, gain) {
    if (!this.player) return;
    const p = this.player;
    switch (stat) {
      case 'damageMult':          p.damageMult          = (p.damageMult          || 1)   + gain; break;
      case 'fireRateMult':        p.fireRateMult        = (p.fireRateMult        || 1)   * (1 + gain); break;
      case 'projectileSpeedMult': p.projectileSpeedMult = (p.projectileSpeedMult || 1)   * (1 + gain); break;
      case 'critChance':          p.critChance          = (p.critChance          || 0)   + gain; break;
      case 'critDamageMult':      p.critDamageMult      = (p.critDamageMult      || 1.5) + gain; break;
      case 'bossDamageMult':      p.bossDamageMult      = (p.bossDamageMult      || 1)   + gain; break;
      case 'eliteDamageMult':     p.eliteDamageMult     = (p.eliteDamageMult     || 1)   + gain; break;
      case 'spreadShots':         p.extraShots          = (p.extraShots          || 0)   + gain; break;
      case 'abilityPowerMult':    p.abilityPower        = (p.abilityPower        || 1)   + gain; break;
      case 'cooldownReduction':   p.cooldownReduction   = (p.cooldownReduction   || 0)   + gain; break;
      case 'maxHpBonus':          p.maxHp += gain; p.hp = Math.min(p.hp + gain, p.maxHp); break;
      case 'shieldCapBonus':      p.shieldMax           = (p.shieldMax           || 0)   + gain; break;
      case 'shieldRegenBonus':    p.shieldRegen         = (p.shieldRegen         || 0)   + gain; break;
      case 'moveSpeedMult':       p.speed               = (p.speed               || 3)   * (1 + gain); break;
      case 'droneDamageMult':     p.droneDamageMult     = (p.droneDamageMult     || 1)   + gain; break;
      case 'droneCountBonus':     p.drones              = (p.drones              || 0)   + Math.floor(gain); break;
      case 'xpMult':              p.xpMult              = (p.xpMult              || 1)   + gain; break;
      case 'goldMult':            p.goldMult            = (p.goldMult            || 1)   + gain; break;
      case 'pickupRadiusBonus':   p.magnetRadius        = (p.magnetRadius        || 80)  + gain; break;
      case 'lootQuality':         p.lootQuality         = (p.lootQuality         || 0)   + gain; break;
      case 'explosionRadiusMult': p.explosionRadiusMult = (p.explosionRadiusMult || 1)   * (1 + gain); break;
      case 'pierceBonus':         p.pierce              = (p.pierce              || 0)   + gain; break;
      case 'homingStrength':      p.homingStrength      = (p.homingStrength      || 0)   + gain; break;
      case 'ricochetBonus':       p.ricochet            = (p.ricochet            || 0)   + gain; break;
      case 'rubyDropMult':        /* tracked via metaStats */                             break;
      case 'chestQuality':        p.chestQuality        = (p.chestQuality        || 0)   + gain; break;
      default: break;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  _render() {
    this.ctx.clearRect(0,0,this.W,this.H);
    this.ctx.fillStyle='#030712';
    this.ctx.fillRect(0,0,this.W,this.H);
    // Background drawn in screen space so it tiles infinitely
    this._renderNebulae();
    this._renderStars();
    this.ctx.save();
    this.ctx.translate(this.W/2+this.shakeX, this.H/2+this.shakeY);
    this.ctx.translate(-this.camera.x, -this.camera.y);
    this._renderPods();
    this._renderLoot();
    this._renderChests();
    this._renderEquipmentDrops();
    this._renderAbilityDrops();
    this._renderToxicClouds();
    this._renderParticles();
    this._renderBullets();
    this._renderEnemies();
    this._renderBoss();
    this._renderPlayer();
    this._renderDrones();
    this.ctx.restore();
  }

  _renderNebulae() {
    if (this.mobilePerformanceMode) return;
    const cx = this.camera.x * 0.15, cy = this.camera.y * 0.15;
    const W = this.W, H = this.H;
    [{x:0.2,y:0.3,r:400,c:'rgba(124,58,237,0.06)'},{x:0.7,y:0.6,r:350,c:'rgba(6,182,212,0.05)'},{x:0.15,y:0.75,r:500,c:'rgba(239,68,68,0.04)'},{x:0.85,y:0.2,r:300,c:'rgba(52,211,153,0.04)'}].forEach(n=>{
      // Anchor nebulae to fractional screen positions, shifted gently by camera
      const gx = n.x*W - (cx % W); const gy = n.y*H - (cy % H);
      const grad=this.ctx.createRadialGradient(gx,gy,0,gx,gy,n.r);
      grad.addColorStop(0,n.c); grad.addColorStop(1,'transparent');
      this.ctx.fillStyle=grad; this.ctx.beginPath(); this.ctx.arc(gx,gy,n.r,0,TAU); this.ctx.fill();
    });
  }

  _renderStars() {
    // Stars are in screen space, tiled so they repeat infinitely as camera moves
    const W = this.W, H = this.H;
    const tile = (v, size, parallax, cam) => {
      const offset = ((v - cam * parallax) % size + size) % size;
      return offset;
    };
    this.stars.forEach(s=>{
      const alpha=s.alpha*(0.7+0.3*Math.sin(this.tick*0.02+s.twinkle));
      // Map star into tiled screen space (tile size = W/H)
      const sx = tile(s.x, W, 0.1, this.camera.x);
      const sy = tile(s.y, H, 0.1, this.camera.y);
      this.ctx.globalAlpha=alpha; this.ctx.fillStyle='#fff';
      this.ctx.beginPath(); this.ctx.arc(sx, sy, s.size, 0, TAU); this.ctx.fill();
    });
    if (!this.mobilePerformanceMode) {
      this.starsNear.forEach(s=>{
        const sx = tile(s.x, W, 0.25, this.camera.x);
        const sy = tile(s.y, H, 0.25, this.camera.y);
        this.ctx.globalAlpha=s.alpha; this.ctx.fillStyle=s.color;
        this.ctx.beginPath(); this.ctx.arc(sx, sy, s.size, 0, TAU); this.ctx.fill();
      });
    }
    this.ctx.globalAlpha=1;
  }

  _renderPods() {
    this.pods.forEach(pod=>{
      if(!pod.active) return;
      const pulse=0.85+0.15*Math.sin(pod.pulse);
      this.ctx.save(); this.ctx.translate(pod.pos.x,pod.pos.y); this.ctx.rotate(pod.spin);
      this.ctx.shadowBlur=this.mobilePerformanceMode ? 0 : 15;
      this.ctx.shadowColor=pod.type==='powerup'?'#fbbf24':'#60a5fa';
      const grad=this.ctx.createRadialGradient(0,0,0,0,0,pod.radius*pulse);
      if(pod.type==='powerup'){ grad.addColorStop(0,'#fef9c3'); grad.addColorStop(0.6,'#fbbf24'); grad.addColorStop(1,'#92400e'); }
      else { grad.addColorStop(0,'#e0f2fe'); grad.addColorStop(0.6,'#60a5fa'); grad.addColorStop(1,'#1e3a5f'); }
      this.ctx.fillStyle=grad; this.ctx.beginPath();
      for(let i=0;i<8;i++){ const a=(i/8)*TAU; const r=pod.radius*(i%2===0?1:0.8)*pulse; if(i===0) this.ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r); else this.ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); }
      this.ctx.closePath(); this.ctx.fill();
      if(pod.hp<pod.maxHp){ this.ctx.shadowBlur=0; this.ctx.fillStyle='rgba(0,0,0,0.5)'; this.ctx.fillRect(-pod.radius,-pod.radius-8,pod.radius*2,4); this.ctx.fillStyle='#ef4444'; this.ctx.fillRect(-pod.radius,-pod.radius-8,pod.radius*2*(pod.hp/pod.maxHp),4); }
      this.ctx.restore();
    });
    this.ctx.shadowBlur=0;
  }

  _renderLoot() {
    this.loot.forEach(l=>{
      if(!l.active) return;
      const pulse=0.8+0.2*Math.sin(l.pulse);
      this.ctx.save(); this.ctx.translate(l.pos.x,l.pos.y);
      this.ctx.shadowBlur=this.mobilePerformanceMode ? 0 : 10;
      this.ctx.shadowColor=l.color; this.ctx.fillStyle=l.color; this.ctx.globalAlpha=0.9+0.1*pulse;
      this.ctx.beginPath();
      if(l.type==='gold'){ this.ctx.arc(0,0,l.radius*pulse,0,TAU); }
      else { this.ctx.moveTo(0,-l.radius*pulse); this.ctx.lineTo(l.radius*0.7*pulse,0); this.ctx.lineTo(0,l.radius*pulse); this.ctx.lineTo(-l.radius*0.7*pulse,0); this.ctx.closePath(); }
      this.ctx.fill(); this.ctx.restore();
    });
    this.ctx.globalAlpha=1; this.ctx.shadowBlur=0;
  }

  _renderParticles() {
    this.ctx.save();
    this.particles.forEach(p=>{
      if(!p.active) return;
      this.ctx.globalAlpha=p.alpha; this.ctx.fillStyle=p.color;
      this.ctx.beginPath(); this.ctx.arc(p.pos.x,p.pos.y,p.size,0,TAU); this.ctx.fill();
    });
    this.ctx.restore(); this.ctx.globalAlpha=1;
  }

  _renderBullets() {
    this.bullets.forEach(b=>{
      if(!b.active) return; this.ctx.save();
      if(b.trail && b.trail.length>1){ this.ctx.globalAlpha=0.35; this.ctx.strokeStyle=b.color; this.ctx.lineWidth=b.radius*0.8; this.ctx.lineCap='round'; this.ctx.beginPath(); this.ctx.moveTo(b.trail[0].x,b.trail[0].y); b.trail.forEach(pt=>this.ctx.lineTo(pt.x,pt.y)); this.ctx.stroke(); }
      this.ctx.globalAlpha=1; this.ctx.shadowBlur=this.mobilePerformanceMode ? 0 : (b.owner==='player'?12:8);
      this.ctx.shadowColor=b.color; this.ctx.fillStyle=b.color;
      this.ctx.beginPath(); this.ctx.arc(b.pos.x,b.pos.y,b.radius,0,TAU); this.ctx.fill();
      this.ctx.restore();
    });
    this.ctx.shadowBlur=0;
  }

  _renderEnemies() {
    this.enemies.forEach(e=>{
      if(!e.active) return;
      renderEnemy(this.ctx, e, this.tick, this.mobilePerformanceMode);
      if(e.hp<e.maxHp){ const bw=e.radius*2.2; this.ctx.fillStyle='rgba(0,0,0,0.6)'; this.ctx.fillRect(e.pos.x-bw/2,e.pos.y-e.radius-9,bw,4); this.ctx.fillStyle=e.hp/e.maxHp>0.5?'#4ade80':'#f87171'; this.ctx.fillRect(e.pos.x-bw/2,e.pos.y-e.radius-9,bw*(e.hp/e.maxHp),4); }
    });
    this.ctx.shadowBlur=0; this.ctx.globalAlpha=1;
  }

  _renderBoss() {
    const b=this.boss; if(!b||!b.active) return;
    renderBoss(this.ctx, b, this.bossData || {}, this.tick, this.mobilePerformanceMode);
    this.ctx.shadowBlur=0;
  }

  _renderPlayer() {
    const p=this.player; if(!p||p.dead) return;
    if(p.trail && p.trail.length>2 && V.len(p.vel)>0.5){
      for(let i=1;i<p.trail.length;i++){
        const t=i/p.trail.length; this.ctx.globalAlpha=t*0.4; this.ctx.strokeStyle=`hsl(${180+this.tick*2},100%,70%)`; this.ctx.lineWidth=(1-t)*p.radius*0.8; this.ctx.lineCap='round'; this.ctx.beginPath(); this.ctx.moveTo(p.trail[i-1].x,p.trail[i-1].y); this.ctx.lineTo(p.trail[i].x,p.trail[i].y); this.ctx.stroke();
      }
      this.ctx.globalAlpha=1;
    }
    this.ctx.save(); this.ctx.translate(p.pos.x,p.pos.y); this.ctx.rotate(p.angle+Math.PI/2);
    if(p.invuln && Math.floor(this.tick/3)%2===0){ this.ctx.restore(); return; }
    if(p.shield>0){ this.ctx.shadowBlur=0; this.ctx.strokeStyle='rgba(96,165,250,0.5)'; this.ctx.lineWidth=2; this.ctx.beginPath(); this.ctx.arc(0,0,p.radius+8+Math.sin(this.tick*0.1)*2,0,TAU); this.ctx.stroke(); }
    this.ctx.shadowBlur=this.mobilePerformanceMode ? 0 : 20; this.ctx.shadowColor='#7c3aed';
    const r=p.radius;
    const grad=this.ctx.createLinearGradient(0,-r,0,r);
    grad.addColorStop(0,'#c4b5fd'); grad.addColorStop(0.5,'#7c3aed'); grad.addColorStop(1,'#4c1d95');
    this.ctx.fillStyle=grad; this.ctx.beginPath();
    this.ctx.moveTo(0,-r*1.2); this.ctx.lineTo(-r*0.8,r*0.6); this.ctx.lineTo(-r*0.35,r*0.2); this.ctx.lineTo(0,r*0.5); this.ctx.lineTo(r*0.35,r*0.2); this.ctx.lineTo(r*0.8,r*0.6); this.ctx.closePath(); this.ctx.fill();
    this.ctx.shadowBlur=this.mobilePerformanceMode ? 0 : 8; this.ctx.shadowColor='#38bdf8'; this.ctx.fillStyle='#bae6fd';
    this.ctx.beginPath(); this.ctx.arc(0,-r*0.3,r*0.28,0,TAU); this.ctx.fill();
    if(V.len(p.vel)>0.3){
      this.ctx.shadowBlur=this.mobilePerformanceMode ? 0 : 12; this.ctx.shadowColor='#fbbf24';
      const exGrad=this.ctx.createLinearGradient(0,r*0.4,0,r*1.4);
      exGrad.addColorStop(0,'#fbbf24aa'); exGrad.addColorStop(1,'transparent');
      this.ctx.fillStyle=exGrad; this.ctx.beginPath();
      this.ctx.moveTo(-r*0.3,r*0.4); this.ctx.lineTo(r*0.3,r*0.4); this.ctx.lineTo((Math.random()-0.5)*r*0.3,r*(1+Math.random()*0.5)); this.ctx.closePath(); this.ctx.fill();
    }
    this.ctx.restore(); this.ctx.shadowBlur=0; this.ctx.globalAlpha=1;
  }

  _renderDrones() {
    this.activeDrones.forEach(d=>{
      if(!d.active) return;
      this.ctx.save(); this.ctx.translate(d.pos.x,d.pos.y); this.ctx.rotate(d.angle);
      this.ctx.shadowBlur=this.mobilePerformanceMode ? 0 : 12; this.ctx.shadowColor='#a5f3fc'; this.ctx.fillStyle='#67e8f9';
      this.ctx.beginPath(); this.ctx.arc(0,0,7,0,TAU); this.ctx.fill();
      this.ctx.fillStyle='#164e63'; this.ctx.beginPath(); this.ctx.arc(0,0,3,0,TAU); this.ctx.fill();
      this.ctx.restore();
    });
    this.ctx.shadowBlur=0;
  }

  _renderChests() {
    this.chests.forEach(c=>{
      if(!c.active||c.opened) return;
      const tier=CHEST_TIERS[c.tier]||{color:'#60a5fa'};
      const pulse=0.9+0.1*Math.sin(c.pulse);
      this.ctx.save(); this.ctx.translate(c.pos.x,c.pos.y); this.ctx.rotate(c.spin);
      this.ctx.shadowBlur=this.mobilePerformanceMode ? 0 : 20; this.ctx.shadowColor=tier.color;
      const grad=this.ctx.createRadialGradient(0,0,0,0,0,c.radius*pulse);
      grad.addColorStop(0,tier.color+'ff'); grad.addColorStop(0.7,tier.color+'aa'); grad.addColorStop(1,tier.color+'00');
      this.ctx.fillStyle=grad; this.ctx.fillRect(-c.radius*pulse,-c.radius*pulse,c.radius*2*pulse,c.radius*2*pulse);
      this.ctx.strokeStyle=tier.color; this.ctx.lineWidth=3; this.ctx.strokeRect(-c.radius*0.8,-c.radius*0.8,c.radius*1.6,c.radius*1.6);
      this.ctx.restore();
    });
    this.ctx.shadowBlur=0;
  }

  _renderEquipmentDrops() {
    renderEquipmentDrops(this.ctx, this.equipDrops, this.tick, this.mobilePerformanceMode);
  }

  _renderAbilityDrops() {
    renderAbilityDrops(this.ctx, this.abilityDrops, this.tick, this.mobilePerformanceMode);
  }

  _renderToxicClouds() {
    if(this.mobilePerformanceMode) return;
    this.toxicClouds.forEach(cloud=>{
      const alpha=cloud.life/cloud.maxLife;
      this.ctx.save(); this.ctx.globalAlpha=alpha*0.4;
      const grad=this.ctx.createRadialGradient(cloud.pos.x,cloud.pos.y,0,cloud.pos.x,cloud.pos.y,cloud.radius);
      grad.addColorStop(0,'#a855f7'); grad.addColorStop(0.5,'#7c3aed'); grad.addColorStop(1,'transparent');
      this.ctx.fillStyle=grad; this.ctx.beginPath(); this.ctx.arc(cloud.pos.x,cloud.pos.y,cloud.radius,0,TAU); this.ctx.fill();
      this.ctx.restore();
    });
    this.ctx.globalAlpha=1;
  }
}
