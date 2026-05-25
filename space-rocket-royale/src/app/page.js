"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine, AudioEngine, UPGRADES, RARITY_COLOR, RARITY_GLOW } from './game/GameEngine';

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC BACKGROUND SYSTEM (Generated once outside component loops to avoid re-renders)
// ═══════════════════════════════════════════════════════════════════════════════
const MENU_BACKGROUND_STARS = typeof window !== 'undefined' 
  ? Array.from({ length: 80 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2
    }))
  : [];

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

function MainMenu({ onStart, bestScore, stars }) {
  const modes = [
    { id:'endless', label:'ENDLESS SURVIVAL', desc:'Infinite waves, full progression', icon:'🌌', color:'#7c3aed' },
    { id:'boss',    label:'BOSS RUSH',          desc:'Bosses every 60 seconds',          icon:'💀', color:'#dc2626' },
    { id:'speed',   label:'SPEED FARM',          desc:'3× XP/Gold, ultra-fast',           icon:'⚡', color:'#d97706' },
    { id:'hardcore',label:'HARDCORE!',           desc:'60 HP, no second chances',        icon:'☠', color:'#374151' },
    { id:'time',    label:'TIME ATTACK',         desc:'10-minute sprint, max score',     icon:'⏱', color:'#0369a1' },
  ];
  return (
    <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 50% 40%,#0f0728 0%,#030712 70%)',fontFamily:'"Courier New",monospace',padding:'20px' }}>
      {stars.map((s, i) => <div key={i} style={{ position: 'absolute', left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px`, borderRadius: '50%', background: 'white', opacity: s.opacity }} />)}
      <div style={{textAlign:'center',marginBottom:'32px'}}>
        <div style={{fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:'900',letterSpacing:'0.05em',background:'linear-gradient(135deg,#c4b5fd,#38bdf8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>SPACE ROCKET ROYALE</div>
        {bestScore>0 && <div style={{marginTop:'8px',color:'#fbbf24',fontSize:'0.85rem'}}>🏆 Best Score: {bestScore.toLocaleString()}</div>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'12px',maxWidth:'700px',width:'100%',marginBottom:'24px'}}>
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
              <div style={{color:'#6b7280',fontSize:'0.65rem'}}>{label}</div>
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

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APPLICATION ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function SpaceRocketRoyale() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const audioRef = useRef(new AudioEngine());
  
  const [screen, setScreen] = useState('menu');
  const [gameState, setGameState] = useState({});
  const [bestScore, setBestScore] = useState(() => (typeof window !== 'undefined' ? parseInt(localStorage.getItem('srr_best') || '0') : 0));
  const [gameMode, setGameMode] = useState('endless');
  const [engine, setEngine] = useState(null);

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
    setGameState(prev => {
      const next = { ...prev, ...update };
      if (update.gameOver && update.finalScore > bestScore) { 
        setBestScore(update.finalScore); 
        localStorage.setItem('srr_best', update.finalScore.toString()); 
      }
      return next;
    });
    if (update.gameOver) setScreen('gameover');
  }, [bestScore]);

  const startGame = useCallback((mode) => {
    setGameMode(mode); 
    setScreen('game');
    setTimeout(() => {
      if (!canvasRef.current) return;
      const eng = new GameEngine(canvasRef.current, handleStateChange, audioRef.current);
      engineRef.current = eng; 
      setEngine(eng); 
      eng.startGame(mode);
    }, 50);
  }, [handleStateChange]);

  const restartGame = useCallback(() => startGame(gameMode), [gameMode, startGame]);
  const goMenu = useCallback(() => { if (engineRef.current) { engineRef.current.destroy(); engineRef.current = null; } setScreen('menu'); setGameState({}); }, []);

  useEffect(() => () => { if (engineRef.current) engineRef.current.destroy(); }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', background: '#030712', cursor: screen === 'game' ? 'crosshair' : 'default' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      {screen === 'menu' && <MainMenu onStart={startGame} bestScore={bestScore} stars={MENU_BACKGROUND_STARS} />}
      {screen === 'game' && (
        <>
          <HUD state={gameState} engine={engine} />
          {gameState.shopOpen && engine && <ShopModal engine={engine} gold={gameState.gold || 0} purchasedItems={gameState.purchasedItems || []} />}
          {gameState.levelUp && <LevelUpFlash level={gameState.level} />}
          {gameState.bossAlert && gameState.bossName && <BossAlert name={gameState.bossName} />}
        </>
      )}
      {screen === 'gameover' && <GameOverScreen state={gameState} onRestart={restartGame} onMenu={goMenu} />}
    </div>
  );
}