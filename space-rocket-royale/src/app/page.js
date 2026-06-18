"use client";

import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import { GameEngine, AudioEngine, UPGRADES, RARITY_COLOR, RARITY_GLOW } from './game/GameEngine';
import GearHangarScreen, { LootSummary, PickupNotification } from '../../ui/screens/GearHangarScreen';
import { usePersistence } from '../../hooks/usePersistence';
import { RARITY_COLORS } from '../../constants/EquipmentData';

function HomepageSeoContent() {
  return (
    <article
      id="about-space-rocket-royale"
      className="bg-[#030712] text-slate-300 px-6 py-16 font-[family-name:var(--font-geist-sans)]"
    >
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-widest text-violet-400">
            Free browser space shooter
          </p>
          <h2 className="text-2xl font-bold text-slate-100">
            Survive waves, defeat bosses, and build your ship in Space Rocket Royale
          </h2>
          <p className="leading-relaxed text-slate-400">
            Space Rocket Royale is a free browser-based space shooter with arcade action,
            roguelite progression, and wave survival gameplay. Pilot your rocket through
            endless enemy swarms, level up mid-run, spend gold on powerful upgrades, and
            challenge colossal bosses — no download required.
          </p>
        </header>

        <section aria-labelledby="gameplay-modes">
          <h2 id="gameplay-modes" className="mb-4 text-xl font-semibold text-slate-100">
            Game modes
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            <li className="rounded-lg border border-violet-500/20 bg-slate-900/50 p-4">
              <h3 className="font-semibold text-violet-300">Endless Survival</h3>
              <p className="mt-1 text-sm">Infinite enemy waves with full XP, gold, and upgrade progression.</p>
            </li>
            <li className="rounded-lg border border-red-500/20 bg-slate-900/50 p-4">
              <h3 className="font-semibold text-red-400">Boss Rush</h3>
              <p className="mt-1 text-sm">Face a new boss every 60 seconds in this intense boss rush mode.</p>
            </li>
            <li className="rounded-lg border border-amber-500/20 bg-slate-900/50 p-4">
              <h3 className="font-semibold text-amber-400">Speed Farm</h3>
              <p className="mt-1 text-sm">3× XP and gold for fast roguelite farming runs.</p>
            </li>
            <li className="rounded-lg border border-slate-500/20 bg-slate-900/50 p-4">
              <h3 className="font-semibold text-slate-300">Hardcore &amp; Time Attack</h3>
              <p className="mt-1 text-sm">60 HP hardcore survival or a 10-minute score sprint.</p>
            </li>
          </ul>
        </section>

        <section aria-labelledby="boss-fights">
          <h2 id="boss-fights" className="mb-4 text-xl font-semibold text-slate-100">
            Epic boss fights
          </h2>
          <p className="mb-4 text-slate-400">
            Survive long enough and massive bosses enter the arena with multi-phase attack patterns.
          </p>
          <ul className="space-y-3">
            <li>
              <h3 className="font-semibold text-amber-400">Asteroid Titan</h3>
              <p className="text-sm">Boulder throws, orbiting rocks, and sweeping lasers across three phases.</p>
            </li>
            <li>
              <h3 className="font-semibold text-purple-400">Void Serpent</h3>
              <p className="text-sm">Plasma breath, teleport strikes, and homing projectile bursts.</p>
            </li>
            <li>
              <h3 className="font-semibold text-sky-400">Galactic Destroyer</h3>
              <p className="text-sm">Satellite swarms, rapid fire, laser sweeps, and ram charges.</p>
            </li>
          </ul>
        </section>

        <section aria-labelledby="progression-upgrades">
          <h2 id="progression-upgrades" className="mb-4 text-xl font-semibold text-slate-100">
            Roguelite upgrades &amp; progression
          </h2>
          <p className="leading-relaxed text-slate-400">
            Earn XP to level up, collect gold between waves, and open the in-run upgrade shop for
            damage boosts, piercing shots, shields, drones, bombs, and legendary build-defining items.
            Persistent gear from the Gear Hangar carries bonuses into every run — classic roguelite
            meta-progression in a fast arcade space shooter.
          </p>
        </section>

        <section aria-labelledby="abilities-controls">
          <h2 id="abilities-controls" className="mb-4 text-xl font-semibold text-slate-100">
            Abilities &amp; spaceship combat
          </h2>
          <p className="leading-relaxed text-slate-400">
            Dodge with Quantum Dash, clear crowds with Void Bomb, and vacuum loot with the Gravity
            Magnet. Top-down spaceship combat with auto-aim, combat drones, crit builds, and reactive
            dodging — built for browser play with keyboard and mouse.
          </p>
        </section>

        <section aria-labelledby="faq">
          <h2 id="faq" className="mb-4 text-xl font-semibold text-slate-100">
            Frequently asked questions
          </h2>
          <dl className="space-y-4">
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4">
              <dt className="font-semibold text-slate-200">Is Space Rocket Royale free to play?</dt>
              <dd className="mt-2 text-sm text-slate-400">
                Yes — completely free in your browser. No download, install, or account needed.
              </dd>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4">
              <dt className="font-semibold text-slate-200">How do I control the ship?</dt>
              <dd className="mt-2 text-sm text-slate-400">
                Move with WASD or arrow keys, aim with the mouse, and click to shoot. Use Shift to dash,
                Q for bomb, F for magnet, and E to open the upgrade shop mid-run.
              </dd>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4">
              <dt className="font-semibold text-slate-200">What is Boss Rush mode?</dt>
              <dd className="mt-2 text-sm text-slate-400">
                Boss Rush spawns a new epic boss every 60 seconds. Perfect for players who want
                non-stop boss fights and fast arcade action.
              </dd>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4">
              <dt className="font-semibold text-slate-200">Does progress save?</dt>
              <dd className="mt-2 text-sm text-slate-400">
                Best scores and Gear Hangar equipment persist between sessions in your browser.
                Each run is a fresh roguelite challenge with new upgrade choices.
              </dd>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4">
              <dt className="font-semibold text-slate-200">Can I play on mobile?</dt>
              <dd className="mt-2 text-sm text-slate-400">
                Yes. Touch controls work on mobile browsers, and you can add the game to your home
                screen for one-tap access.
              </dd>
            </div>
          </dl>
        </section>

        <footer className="border-t border-slate-800 pt-8 text-sm text-slate-500">
          <p>
            Play Space Rocket Royale — a free indie browser game combining wave survival,
            boss rush action, and roguelite upgrade builds. Works in modern browsers with no install.
          </p>
        </footer>
      </div>
    </article>
  );
}

const SHARE_TEXT =
  "Play Space Rocket Royale — a free browser space shooter with boss fights, wave survival, and roguelite upgrades!";

function ShareButton() {
  const [status, setStatus] = useState(null);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus(null), 2500);
  }, []);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "Space Rocket Royale",
      text: SHARE_TEXT,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setStatus("shared");
        setTimeout(() => setStatus(null), 2500);
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }
    copyLink();
  }, [copyLink]);

  const label =
    status === "copied" ? "LINK COPIED!" :
    status === "shared" ? "SHARED!" :
    status === "error" ? "COPY FAILED" :
    "SHARE GAME";

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share Space Rocket Royale with friends"
      style={{
        background: status ? "rgba(34, 197, 94, 0.2)" : "rgba(56, 189, 248, 0.15)",
        border: `2px solid ${status ? "#22c55e" : "#38bdf8"}`,
        borderRadius: "12px",
        padding: "14px 28px",
        cursor: "pointer",
        color: status ? "#4ade80" : "#7dd3fc",
        fontWeight: "bold",
        letterSpacing: "0.05em",
        fontFamily: '"Courier New", monospace',
        fontSize: "1rem",
        boxShadow: status ? "0 0 15px rgba(34,197,94,0.3)" : "0 0 15px rgba(56,189,248,0.25)",
        transition: "all 0.2s",
      }}
    >
      {status === "copied" || status === "shared" ? "✓ " : "🔗 "}{label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI COMPONENT SUB-MODULES
// ═══════════════════════════════════════════════════════════════════════════════
function ShopModal({ engine, gold, purchasedItems }) {
  const [stock] = useState(() => {
    const all = [...UPGRADES];
    const shuffled = all.sort(() => Math.random() - 0.5);
    const counts = {};
    purchasedItems.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
    return shuffled.filter(u => (counts[u.id] || 0) < 3).slice(0, 5);
  });

  return (
    <div style={{ position:'absolute',inset:0,background:'rgba(3,7,18,0.92)',backdropFilter:'blur(12px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:50,fontFamily:'"Courier New",monospace' }}>
      <div style={{ background:'linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,10,60,0.98))',border:'1px solid rgba(139,92,246,0.3)',borderRadius:'20px',padding:'32px',maxWidth:'680px',width:'90%',boxShadow:'0 0 60px rgba(139,92,246,0.2)' }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
          <div>
            <div style={{fontSize:'1.5rem',fontWeight:'700',color:'#c4b5fd',letterSpacing:'0.1em'}}>⚙ UPGRADE SHOP</div>
            <div style={{color:'#64748b',fontSize:'0.8rem',marginTop:'2px'}}>Press E or ESC to close</div>
          </div>
          <div style={{ background:'rgba(251,191,36,0.15)',border:'1px solid rgba(251,191,36,0.3)',borderRadius:'10px',padding:'8px 16px',color:'#fbbf24',fontWeight:'700',fontSize:'1.1rem' }}>🪙 {Math.floor(gold)}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'12px'}}>
          {stock.map(item => {
            const canAfford = gold >= item.cost;
            return (
              <button key={item.id} onClick={() => { if(canAfford){engine.applyUpgrade(item.id);} }}
                style={{
                  background:canAfford ? `radial-gradient(circle at 30% 30%,${RARITY_GLOW[item.rarity]},rgba(15,23,42,0.9))` : 'rgba(15,23,42,0.5)',
                  border:`1px solid ${canAfford ? RARITY_COLOR[item.rarity] : 'rgba(55,65,81,0.5)'}`,
                  borderRadius:'12px',padding:'16px',textAlign:'left',cursor:canAfford ? 'pointer' : 'not-allowed',opacity:canAfford ? 1 : 0.5,transition:'transform 0.1s',boxShadow:canAfford ? `0 0 15px ${RARITY_GLOW[item.rarity]}` : 'none'
                }}
              >
                <div style={{fontSize:'1.8rem',marginBottom:'6px'}}>{item.icon}</div>
                <div style={{color:RARITY_COLOR[item.rarity],fontSize:'0.65rem',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:'4px'}}>{item.rarity}</div>
                <div style={{color:'#e2e8f0',fontWeight:'700',fontSize:'0.9rem',marginBottom:'6px'}}>{item.name}</div>
                <div style={{color:'#94a3b8',fontSize:'0.75rem',lineHeight:'1.4',marginBottom:'10px'}}>{item.desc}</div>
                <div style={{color:canAfford ? '#fbbf24' : '#6b7280',fontWeight:'700',fontSize:'0.9rem',display:'flex',alignItems:'center',gap:'4px'}}>🪙 {item.cost}</div>
              </button>
            );
          })}
        </div>
        <div style={{marginTop:'20px',textAlign:'center',color:'#374151',fontSize:'0.75rem'}}>Game paused while shop is open • New stock each visit</div>
      </div>
    </div>
  );
}

function HUD({ state, engine }) {
  const { hp,maxHp,shield,shieldMax,xp,xpToNext,level,gold,score,kills,wave,sessionTime,bossHp,bossMaxHp,bossName,dashReady,bombReady,bombDmg,drones,worldEvent } = state;
  const barW = (val,max) => `${Math.max(0,Math.min(100,(val/Math.max(1,max))*100))}%`;
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',fontFamily:'"Courier New",monospace',userSelect:'none'}}>
      <div style={{position:'absolute',top:16,left:16,width:'220px'}}>
        <div style={{marginBottom:'6px'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
            <span style={{color:'#f87171',fontSize:'0.7rem',letterSpacing:'0.1em'}}>HULL</span>
            <span style={{color:'#e2e8f0',fontSize:'0.7rem'}}>{Math.ceil(Math.max(0,hp))}/{maxHp}</span>
          </div>
          <div style={{height:'8px',background:'rgba(0,0,0,0.5)',borderRadius:'4px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)'}}>
            <div style={{height:'100%',width:barW(hp,maxHp),background:`linear-gradient(90deg,#ef4444,#f97316)`,boxShadow:'0 0 8px #ef4444'}}/>
          </div>
        </div>
        {shieldMax > 0 && (
          <div style={{marginBottom:'6px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
              <span style={{color:'#60a5fa',fontSize:'0.7rem',letterSpacing:'0.1em'}}>SHIELD</span>
              <span style={{color:'#e2e8f0',fontSize:'0.7rem'}}>{Math.ceil(shield)}/{shieldMax}</span>
            </div>
            <div style={{height:'6px',background:'rgba(0,0,0,0.5)',borderRadius:'4px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)'}}>
              <div style={{height:'100%',width:barW(shield,shieldMax),background:'linear-gradient(90deg,#3b82f6,#60a5fa)',boxShadow:'0 0 8px #3b82f6'}}/>
            </div>
          </div>
        )}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
            <span style={{color:'#7c3aed',fontSize:'0.7rem',letterSpacing:'0.1em'}}>LVL {level}</span>
            <span style={{color:'#94a3b8',fontSize:'0.65rem'}}>{Math.floor(xp)}/{Math.floor(xpToNext)}</span>
          </div>
          <div style={{height:'5px',background:'rgba(0,0,0,0.5)',borderRadius:'3px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.08)'}}>
            <div style={{height:'100%',width:barW(xp,xpToNext),background:'linear-gradient(90deg,#7c3aed,#a855f7)',boxShadow:'0 0 6px #7c3aed'}}/>
          </div>
        </div>
      </div>
      <div style={{position:'absolute',top:16,right:16,textAlign:'right'}}>
        <div style={{color:'#fbbf24',fontSize:'1.1rem',fontWeight:'700'}}>🪙 {gold?.toLocaleString()}</div>
        <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>Score {score?.toLocaleString()}</div>
        <div style={{color:'#6b7280',fontSize:'0.75rem'}}>Kills {kills} · Wave {wave}</div>
        <div style={{color:'#374151',fontSize:'0.7rem'}}>{Math.floor((sessionTime||0)/60)}:{String(Math.floor((sessionTime||0)%60)).padStart(2,'0')}</div>
      </div>
      <div style={{position:'absolute',bottom:20,left:'50%',transform:'translateX(-50%)',display:'flex',gap:'10px',pointerEvents:'auto'}}>
        {[
          {key:'DASH',icon:'💨',ready:dashReady,hotkey:'SHIFT', action:() => engine._dash()},
          {key:'BOMB',icon:'💣',ready:bombReady,hotkey:'Q',hidden:!bombDmg, action:() => engine._useBomb()},
          {key:'MAGNET',icon:'🧲',ready:true,hotkey:'F', action:() => engine._useMagnet()},
        ].filter(a => !a.hidden).map(a => (
          <button key={a.key} onClick={a.action} style={{ background:a.ready ? 'rgba(15,23,42,0.9)' : 'rgba(0,0,0,0.5)',border:`1px solid ${a.ready ? 'rgba(139,92,246,0.5)' : 'rgba(55,65,81,0.3)'}`,borderRadius:'10px',width:'44px',height:'56px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',color:'#fff',cursor:a.ready ? 'pointer' : 'not-allowed' }}>
            <span>{a.icon}</span><span style={{fontSize:'0.5rem',color:'#64748b'}}>{a.hotkey}</span>
          </button>
        ))}
        <button onClick={() => engine._toggleShop()} style={{ background:'rgba(15,23,42,0.9)',border:'1px solid rgba(139,92,246,0.5)',borderRadius:'10px',padding:'0 12px',height:'56px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',color:'#c4b5fd',cursor:'pointer' }}>
          <span>🛒</span><span style={{fontSize:'0.5rem',color:'#64748b'}}>E</span>
        </button>
      </div>
      {bossHp > 0 && bossName && (
        <div style={{position:'absolute',bottom:90,left:'50%',transform:'translateX(-50%)',width:'400px',maxWidth:'80vw'}}>
          <div style={{textAlign:'center',marginBottom:'6px',color:'#f87171',fontSize:'0.85rem',fontWeight:'700'}}>⚠ {bossName}</div>
          <div style={{height:'12px',background:'rgba(0,0,0,0.6)',borderRadius:'6px',overflow:'hidden',border:'1px solid rgba(239,68,68,0.3)'}}>
            <div style={{height:'100%',width:barW(bossHp,bossMaxHp),background:'linear-gradient(90deg,#991b1b,#ef4444)'}}/>
          </div>
        </div>
      )}
      {worldEvent && <div style={{ position:'absolute',top:'40%',left:'50%',transform:'translate(-50%,-50%)',background:'rgba(0,0,0,0.85)',border:'1px solid #fbbf24',borderRadius:'12px',padding:'14px 28px',color:'#fbbf24',fontWeight:'700',letterSpacing:'0.1em' }}>{worldEvent.replace('_',' ').toUpperCase()}</div>}
    </div>
  );
}

function MainMenu({ onStart, bestScore }) {
  const modes = [
    { id:'endless', label:'ENDLESS SURVIVAL', desc:'Infinite waves, full progression', icon:'🌌', color:'#7c3aed' },
    { id:'boss',    label:'BOSS RUSH',          desc:'Bosses every 60 seconds',          icon:'💀', color:'#dc2626' },
    { id:'speed',   label:'SPEED FARM',          desc:'3× XP/Gold, ultra-fast',           icon:'⚡', color:'#d97706' },
    { id:'hardcore',label:'HARDCORE!',           desc:'60 HP, no second chances',        icon:'☠', color:'#374151' },
    { id:'time',    label:'TIME ATTACK',         desc:'10-minute sprint, max score',     icon:'⏱', color:'#0369a1' },
  ];

  return (
    <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 50% 40%,#0f0728 0%,#030712 70%)',fontFamily:'"Courier New",monospace',padding:'20px' }}>
      
      {/* ─── PURE CSS STAR OVERLAY: ZERO JAVASCRIPT STATE, ZERO LOOPS ─── */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        opacity: 0.2, 
        backgroundImage: 'radial-gradient(white 1px, transparent 0), radial-gradient(white 1.5px, transparent 0)', 
        backgroundSize: '32px 32px, 64px 64px', 
        backgroundPosition: '0 0, 16px 16px', 
        pointerEvents: 'none' 
      }} />
      
      <div style={{textAlign:'center',marginBottom:'24px', zIndex: 2}}>
        <h1 style={{fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:'900',letterSpacing:'0.05em',background:'linear-gradient(135deg,#c4b5fd,#38bdf8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:0}}>SPACE ROCKET ROYALE</h1>
        {bestScore > 0 && <div style={{marginTop:'8px',color:'#fbbf24',fontSize:'0.85rem'}}>🏆 Best Score: {bestScore.toLocaleString()}</div>}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '32px', zIndex: 2 }}>
        <button 
          onClick={() => onStart('inventory_view')} 
          style={{ background: 'rgba(139, 92, 246, 0.25)', border: '2px solid #7c3aed', borderRadius: '12px', padding: '14px 28px', cursor: 'pointer', color: '#c4b5fd', fontWeight: 'bold', letterSpacing: '0.05em', fontFamily: '"Courier New", monospace', transition: 'all 0.2s', fontSize: '1rem', boxShadow: '0 0 15px rgba(124,58,237,0.3)' }}
        >
          ⚙️ OPEN GEAR HANGAR
        </button>
        <ShareButton />
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'12px',maxWidth:'700px',width:'100%',marginBottom:'24px', zIndex: 2}}>
        {modes.map(m => (
          <button key={m.id} onClick={() => onStart(m.id)} style={{ background:`rgba(15,23,42,0.85)`,border:`1px solid ${m.color}66`,borderRadius:'12px',padding:'16px',cursor:'pointer',textAlign:'left' }}>
            <div style={{fontSize:'1.5rem',marginBottom:'6px'}}>{m.icon}</div>
            <div style={{color:m.color,fontSize:'0.75rem',fontWeight:'700'}}>{m.label}</div>
            <div style={{color:'#6b7280',fontSize:'0.75rem'}}>{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function GameOverScreen({ state, onRestart, onMenu }) {
  const { finalScore, finalKills, finalLevel, finalTime, finalWave } = state;
  return (
    <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(3,7,18,0.95)',backdropFilter:'blur(12px)',fontFamily:'"Courier New",monospace',zIndex:100 }}>
      <div style={{ background:'rgba(15,23,42,0.98)',border:'1px solid #f87171',borderRadius:'20px',padding:'40px',maxWidth:'440px',width:'90%',textAlign:'center' }}>
        <div style={{fontSize:'1.8rem',fontWeight:'900',color:'#f87171',marginBottom:'12px'}}>MISSION FAILED</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'28px'}}>
          {[['SCORE',finalScore?.toLocaleString()],['KILLS',finalKills],['LEVEL',finalLevel],['WAVE',finalWave]].map(([label,val]) => (
            <div key={label} style={{ background:'rgba(0,0,0,0.4)',border:'1px solid rgba(55,65,81,0.5)',borderRadius:'10px',padding:'12px' }}>
              <div style={{color:'#6b7280',fontSize:'0.65rem',letterSpacing:'0.05em'}}>{label}</div>
              <div style={{color:'#e2e8f0',fontSize:'1.3rem',fontWeight:'700'}}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
          <button onClick={onRestart} style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)',border:'none',borderRadius:'10px',padding:'12px 28px',color:'white',fontWeight:'700',cursor:'pointer' }}>↺ RETRY</button>
          <button onClick={onMenu} style={{ background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',padding:'12px 24px',color:'#94a3b8',cursor:'pointer' }}>MENU</button>
        </div>
      </div>
    </div>
  );
}

function LevelUpFlash({ level }) { return <div style={{ position:'absolute',top:'30%',left:'50%',transform:'translateX(-50%)',textAlign:'center',zIndex:40,color:'#fbbf24',fontWeight:'700',fontFamily:'"Courier New",monospace' }}>⭐ LEVEL UP! (Lvl {level}) ⭐</div>; }
function BossAlert({ name }) { return <div style={{ position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',textAlign:'center',zIndex:45,color:'#ef4444',fontWeight:'900',fontFamily:'"Courier New",monospace' }}>⚠ BOSS APPROACHING: {name?.toUpperCase()} ⚠</div>; }


function BossDropBanner({ items, bossName }) {
  if (!items || items.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(5,8,20,0.97)',
        border: '1px solid rgba(251,191,36,0.6)',
        borderRadius: 14,
        padding: '14px 24px',
        fontFamily: '"Courier New", monospace',
        zIndex: 60,
        textAlign: 'center',
        boxShadow: '0 0 40px rgba(251,191,36,0.3)',
        pointerEvents: 'none',
        minWidth: 320,
      }}
    >
      <div
        style={{
          color: '#fbbf24',
          fontWeight: 900,
          fontSize: '0.85rem',
          marginBottom: 8,
          letterSpacing: '0.1em',
        }}
      >
        ⚔ {bossName ? bossName.toUpperCase() : 'BOSS'} DEFEATED — LOOT DROPPED
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {items.map((item, i) => {
          const color =
            {
              common: '#9ca3af',
              uncommon: '#4ade80',
              rare: '#60a5fa',
              epic: '#c084fc',
              legendary: '#fbbf24',
              mythic: '#ff6b35',
              secret: '#ff00ff',
            }[item.rarity] || '#9ca3af';

          return (
            <div
              key={item.instanceId || i}
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: `1px solid ${color}66`,
                borderRadius: 8,
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>

              <div>
                <div
                  style={{
                    color,
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                  }}
                >
                  {item.rarity.toUpperCase()}
                </div>

                <div
                  style={{
                    color: '#e2e8f0',
                    fontSize: '0.72rem',
                  }}
                >
                  {item.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SpaceRocketRoyale() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const audioRef = useRef(new AudioEngine());
  
  const [screen, setScreen] = useState('menu');
  const [gameState, setGameState] = useState({});
  const [gameMode, setGameMode] = useState('endless');
  const [engine, setEngine] = useState(null);

  const { save, getBestScore, recordRunResult, addRunLootToProfile, forceManualSync } = usePersistence();
  const bestScore = getBestScore(gameMode);
  const [pickupItem, setPickupItem] = useState(null);
  const [lootSummary, setLootSummary] = useState(null); // { items, xp, coins, bosses }
  const pickupTimerRef = useRef(null);

  const containerRef = useRef(null);
  useEffect(() => {
    const resize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = Math.floor(width); 
      canvasRef.current.height = Math.floor(height);
      if (engineRef.current) { engineRef.current.W = canvasRef.current.width; engineRef.current.H = canvasRef.current.height; }
    };
    resize(); 
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleStateChange = useCallback((update) => {
    setGameState(prev => ({ ...prev, ...update }));

    if (update.gameOver) {
      recordRunResult({
        mode: gameMode,
        score: update.finalScore,
        kills: update.finalKills,
        level: update.finalLevel,
        wave: update.finalWave,
        sessionTime: update.finalTime,
      });
      // Show loot summary before game over screen
      if (update.runLoot && update.runLoot.length > 0) {
        setLootSummary({
          items:   update.runLoot,
          xp:      update.finalXP,
          coins:   update.finalGold,
          bosses:  update.finalBossesKilled,
        });
      } else {
        setScreen('gameover');
      }
    }

    // Pickup notification
    if (update.equipmentPickup) {
      setPickupItem(update.equipmentPickup);
      if (pickupTimerRef.current) clearTimeout(pickupTimerRef.current);
      pickupTimerRef.current = setTimeout(() => setPickupItem(null), 3200);
    }
    if (update.equipmentPickup === null) {
      setPickupItem(null);
    }
  }, [gameMode, recordRunResult]);

  const startGame = useCallback((mode) => {
    setGameMode(mode); 
    setScreen('game');
    setTimeout(() => {
      if (!canvasRef.current) return;
      const eng = new GameEngine(canvasRef.current, handleStateChange, audioRef.current);
      eng.equipmentBonuses = save?.gearLoadout || null;
      engineRef.current = eng; 
      setEngine(eng); 
      eng.startGame(mode);
    }, 50);
  }, [handleStateChange, save?.equippedItems]);

  const restartGame = useCallback(() => startGame(gameMode), [gameMode, startGame]);
  const goMenu = useCallback(() => { if (engineRef.current) { engineRef.current.destroy(); engineRef.current = null; } setScreen('menu'); setGameState({}); }, []);

  const handleProfileUpdate = useCallback((updatedSave) => {
    try { localStorage.setItem('srr_save', JSON.stringify(updatedSave)); } catch(e){}
    forceManualSync(updatedSave);
  }, [forceManualSync]);

  // Called from LootSummary "Save to Gear Hangar" button
  const handleSaveLoot = useCallback(() => {
    if (!lootSummary?.items?.length) { setLootSummary(null); setScreen('gameover'); return; }
    addRunLootToProfile(lootSummary.items);
    setLootSummary(null);
    setScreen('gameover');
  }, [lootSummary, addRunLootToProfile]);

  useEffect(() => () => { if (engineRef.current) engineRef.current.destroy(); }, []);

  return (
    <>
      <main aria-label="Space Rocket Royale game">
        <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', background: '#030712', cursor: screen === 'game' ? 'crosshair' : 'default' }}>
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

          <Suspense fallback={null}>
            {screen === 'menu' && (
              <MainMenu
                onStart={(mode) => {
                  if (mode === 'inventory_view') {
                    setScreen('inventory');
                  } else {
                    startGame(mode);
                  }
                }}
                bestScore={bestScore}
              />
            )}

            {screen === 'inventory' && (
              <GearHangarScreen
                profile={save}
                onProfileUpdate={handleProfileUpdate}
                onBack={goMenu}
              />
            )}

            {screen === 'game' && (
              <>
                <HUD state={gameState} engine={engine} />
                {gameState.shopOpen && engine && <ShopModal engine={engine} gold={gameState.gold || 0} purchasedItems={gameState.purchasedItems || []} />}
                {gameState.levelUp && <LevelUpFlash level={gameState.level} />}
                {gameState.bossAlert && gameState.bossName && <BossAlert name={gameState.bossName} />}
                {gameState.bossDropItems && gameState.bossDropItems.length > 0 && (
                  <BossDropBanner items={gameState.bossDropItems} bossName={gameState.bossDropBossName} />
                )}
                {pickupItem && <PickupNotification item={pickupItem} />}
              </>
            )}

            {lootSummary && (
              <LootSummary
                lootItems={lootSummary.items}
                xpEarned={lootSummary.xp}
                coinsEarned={lootSummary.coins}
                bossesDefeated={lootSummary.bosses}
                onClose={handleSaveLoot}
              />
            )}

            {screen === 'gameover' && <GameOverScreen state={gameState} onRestart={restartGame} onMenu={goMenu} />}
          </Suspense>
        </div>
      </main>
      <HomepageSeoContent />
    </>
  );
}