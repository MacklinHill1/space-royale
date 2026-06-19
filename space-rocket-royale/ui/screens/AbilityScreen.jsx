// ui/screens/AbilityScreen.jsx
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useAbilities } from '../../hooks/useAbilities.js';
import {
  ABILITY_SLOT_LABELS, ABILITY_SLOT_ICONS, ABILITY_SLOT_HOTKEYS, ABILITY_SLOT_TYPES,
  ABILITY_RARITY_COLORS, ABILITY_RARITY_GLOW, ABILITY_RARITIES, ABILITY_RARITY_ORDER,
  ABILITY_SALVAGE_VALUE, ABILITY_DB, getInitialAbilityLoadout,
} from '../../constants/AbilityData.js';

const SLOT_KEYS = ['active1','active2','ultimate','passive1','passive2','passive3','drone'];

// ─── RARITY BADGE ────────────────────────────────────────────────────────────
function RarityBadge({ rarity }) {
  const color = ABILITY_RARITY_COLORS[rarity] || '#9ca3af';
  return (
    <span style={{
      background: color + '22',
      border: `1px solid ${color}`,
      borderRadius: 5,
      color,
      fontSize: '0.6rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
      padding: '1px 6px',
      textTransform: 'uppercase',
    }}>
      {rarity}
    </span>
  );
}

// ─── ABILITY TOOLTIP ─────────────────────────────────────────────────────────
function AbilityTooltip({ ability, anchor }) {
  if (!ability) return null;
  const color   = ABILITY_RARITY_COLORS[ability.rarity] || '#9ca3af';
  const glow    = ABILITY_RARITY_GLOW[ability.rarity]   || 'transparent';
  const def     = ABILITY_DB[ability.id] || {};
  const salvage = ABILITY_SALVAGE_VALUE[ability.rarity] || 50;

  return (
    <div style={{
      position: 'fixed',
      left: anchor ? Math.min(anchor.x + 10, window.innerWidth - 330) : '50%',
      top:  anchor ? Math.min(anchor.y - 10, window.innerHeight - 400) : '20%',
      width: 310,
      background: 'rgba(8,10,22,0.99)',
      border: `2px solid ${color}`,
      borderRadius: 14,
      padding: 20,
      zIndex: 999,
      boxShadow: `0 0 40px ${glow}, 0 8px 30px rgba(0,0,0,0.6)`,
      fontFamily: '"Courier New", monospace',
      pointerEvents: 'none',
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <span style={{ fontSize:'2rem' }}>{ability.icon}</span>
        <div>
          <div style={{ color, fontWeight:900, fontSize:'1rem' }}>{ability.name}</div>
          <div style={{ display:'flex', gap:6, marginTop:2, flexWrap:'wrap' }}>
            <RarityBadge rarity={ability.rarity} />
            <span style={{ background:'rgba(255,255,255,0.06)', borderRadius:5, color:'#94a3b8', fontSize:'0.6rem', padding:'1px 6px', textTransform:'uppercase' }}>
              {ability.type}
            </span>
          </div>
        </div>
      </div>

      {/* Cooldown / Duration */}
      {ability.cooldown > 0 && (
        <div style={{ display:'flex', gap:12, marginBottom:10 }}>
          <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'4px 10px', color:'#60a5fa', fontSize:'0.75rem' }}>
            ⏱ CD: {ability.cooldown}s
          </div>
          {ability.duration > 0 && (
            <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'4px 10px', color:'#4ade80', fontSize:'0.75rem' }}>
              ⚡ {ability.duration}s
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div style={{ color:'#cbd5e1', fontSize:'0.78rem', lineHeight:1.55, marginBottom:10 }}>
        {ability.desc}
      </div>

      {/* Flavor */}
      {ability.flavorText && (
        <div style={{ color:'#475569', fontStyle:'italic', fontSize:'0.7rem', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:8, marginBottom:8 }}>
          {ability.flavorText}
        </div>
      )}

      {/* Source */}
      {def.source && (
        <div style={{ background:'rgba(255,215,0,0.07)', border:'1px solid rgba(255,215,0,0.2)', borderRadius:8, padding:'6px 10px', marginBottom:8 }}>
          <span style={{ color:'#fbbf24', fontSize:'0.65rem', fontWeight:700 }}>🔒 UNLOCK: </span>
          <span style={{ color:'#94a3b8', fontSize:'0.65rem' }}>{def.source}</span>
        </div>
      )}

      {/* Salvage */}
      <div style={{ color:'#64748b', fontSize:'0.68rem', marginTop:6 }}>
        🪙 Salvage: {salvage.toLocaleString()} coins
        {ability.source && <span style={{marginLeft:10}}>📦 {ability.source}</span>}
      </div>
    </div>
  );
}

// ─── ABILITY SLOT ─────────────────────────────────────────────────────────────
function AbilitySlot({ slotKey, ability, onUnequip, onClick, selected }) {
  const color   = ability ? (ABILITY_RARITY_COLORS[ability.rarity] || '#9ca3af') : 'rgba(255,255,255,0.1)';
  const hotkey  = ABILITY_SLOT_HOTKEYS[slotKey];
  const typeKey = ABILITY_SLOT_TYPES[slotKey];
  const isEmpty = !ability;

  return (
    <div
      style={{
        background: ability
          ? `linear-gradient(135deg,${color}22,rgba(8,10,22,0.9))`
          : 'rgba(255,255,255,0.03)',
        border: `2px solid ${selected ? '#fff' : (ability ? color + '88' : 'rgba(255,255,255,0.08)')}`,
        borderRadius: 12,
        padding: '10px 14px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: ability && !selected ? `0 0 12px ${color}44` : undefined,
      }}
      onClick={onClick}
    >
      <div style={{ color:'#475569', fontSize:'0.6rem', letterSpacing:'0.1em', marginBottom:4 }}>
        {ABILITY_SLOT_ICONS[slotKey]} {ABILITY_SLOT_LABELS[slotKey]}
        {hotkey && <span style={{ marginLeft:6, color:'#334155', background:'rgba(255,255,255,0.06)', padding:'1px 5px', borderRadius:3 }}>[{hotkey}]</span>}
      </div>
      {ability ? (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'1.3rem' }}>{ability.icon}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color, fontWeight:700, fontSize:'0.78rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {ability.name}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:1 }}>
              <RarityBadge rarity={ability.rarity} />
              {ability.cooldown > 0 && <span style={{ color:'#475569', fontSize:'0.6rem' }}>⏱{ability.cooldown}s</span>}
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onUnequip(slotKey); }}
            style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:6, color:'#f87171', fontSize:'0.65rem', padding:'2px 7px', cursor:'pointer', whiteSpace:'nowrap' }}
          >
            ✕
          </button>
        </div>
      ) : (
        <div style={{ color:'#1e293b', fontSize:'0.72rem', padding:'4px 0' }}>Empty — click to equip</div>
      )}
    </div>
  );
}

// ─── ABILITY CARD ─────────────────────────────────────────────────────────────
function AbilityCard({ ability, selected, onSelect, onEquip, onSalvage, loadout }) {
  const color = ABILITY_RARITY_COLORS[ability.rarity] || '#9ca3af';

  const equippedInSlot = useMemo(() => {
    return Object.entries(loadout || {}).find(([, a]) => a && a.instanceId === ability.instanceId)?.[0] || null;
  }, [loadout, ability.instanceId]);

  return (
    <div
      onClick={() => onSelect(ability)}
      style={{
        background: selected
          ? `linear-gradient(135deg,${color}33,rgba(8,10,22,0.95))`
          : 'rgba(255,255,255,0.03)',
        border: `2px solid ${selected ? color : color + '44'}`,
        borderRadius: 12,
        padding: 12,
        cursor: 'pointer',
        transition: 'all 0.12s',
        boxShadow: selected ? `0 0 20px ${color}55` : undefined,
      }}
    >
      {/* Top row */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
        <span style={{ fontSize:'1.5rem' }}>{ability.icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color, fontWeight:700, fontSize:'0.8rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {ability.name}
          </div>
          <div style={{ display:'flex', gap:4, marginTop:2, flexWrap:'wrap' }}>
            <RarityBadge rarity={ability.rarity} />
            <span style={{ color:'#475569', fontSize:'0.6rem', textTransform:'uppercase' }}>{ability.type}</span>
          </div>
        </div>
        {equippedInSlot && (
          <span style={{ color:'#4ade80', fontSize:'0.6rem', background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:4, padding:'1px 5px' }}>
            ✓ {ABILITY_SLOT_LABELS[equippedInSlot]?.split(' ')[0]}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
        {ability.cooldown > 0 && (
          <span style={{ color:'#60a5fa', fontSize:'0.65rem', background:'rgba(96,165,250,0.1)', borderRadius:5, padding:'1px 7px' }}>
            ⏱ {ability.cooldown}s CD
          </span>
        )}
        {ability.duration > 0 && (
          <span style={{ color:'#4ade80', fontSize:'0.65rem', background:'rgba(74,222,128,0.1)', borderRadius:5, padding:'1px 7px' }}>
            ⚡ {ability.duration}s
          </span>
        )}
      </div>

      {/* Description */}
      <div style={{ color:'#64748b', fontSize:'0.68rem', lineHeight:1.4, marginBottom:8,
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
        {ability.desc}
      </div>

      {/* Actions — only visible when selected */}
      {selected && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {SLOT_KEYS.filter(k => {
            const t = ABILITY_SLOT_TYPES[k];
            if (ability.type === 'active') return t === 'active';
            if (ability.type === 'ultimate') return t === 'ultimate' || t === 'active';
            if (ability.type === 'passive') return t === 'passive';
            if (ability.type === 'drone') return t === 'drone';
            return false;
          }).map(slotKey => (
            <button
              key={slotKey}
              onClick={e => { e.stopPropagation(); onEquip(ability, slotKey); }}
              style={{
                background: 'rgba(139,92,246,0.2)',
                border: '1px solid rgba(139,92,246,0.4)',
                borderRadius: 7,
                color: '#c4b5fd',
                fontSize: '0.65rem',
                padding: '3px 9px',
                cursor: 'pointer',
              }}
            >
              → {ABILITY_SLOT_LABELS[slotKey]}
            </button>
          ))}
          <button
            onClick={e => { e.stopPropagation(); onSalvage(ability); }}
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 7,
              color: '#f87171',
              fontSize: '0.65rem',
              padding: '3px 9px',
              cursor: 'pointer',
            }}
          >
            🪙 Salvage ({(ABILITY_SALVAGE_VALUE[ability.rarity] || 50).toLocaleString()})
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ABILITY PICKUP NOTIFICATION ─────────────────────────────────────────────
export function AbilityPickupNotification({ ability }) {
  if (!ability) return null;
  const color = ABILITY_RARITY_COLORS[ability.rarity] || '#9ca3af';
  return (
    <div style={{
      position: 'absolute',
      top: 90,
      right: 16,
      background: 'rgba(8,10,22,0.97)',
      border: `2px solid ${color}`,
      borderRadius: 14,
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: `0 0 30px ${color}55`,
      fontFamily: '"Courier New", monospace',
      zIndex: 70,
      animation: 'slideInRight 0.3s ease-out',
      minWidth: 220,
      maxWidth: 280,
    }}>
      <span style={{ fontSize:'1.8rem' }}>{ability.icon}</span>
      <div>
        <div style={{ color:'#94a3b8', fontSize:'0.6rem', letterSpacing:'0.1em', marginBottom:2 }}>
          ⚡ ABILITY ACQUIRED
        </div>
        <div style={{ color, fontWeight:700, fontSize:'0.82rem' }}>{ability.name}</div>
        <div style={{ display:'flex', gap:4, marginTop:2 }}>
          <RarityBadge rarity={ability.rarity} />
          {ability.cooldown > 0 && <span style={{ color:'#475569', fontSize:'0.6rem' }}>⏱{ability.cooldown}s</span>}
        </div>
      </div>
    </div>
  );
}

// ─── ABILITY LOOT SUMMARY ─────────────────────────────────────────────────────
export function AbilityLootSummary({ abilities, onSave }) {
  const [revealed, setRevealed] = useState(0);
  React.useEffect(() => {
    if (revealed < abilities.length) {
      const t = setTimeout(() => setRevealed(r => r + 1), 250);
      return () => clearTimeout(t);
    }
  }, [revealed, abilities.length]);

  if (!abilities || abilities.length === 0) return null;

  return (
    <div style={{
      position:'absolute', inset:0, background:'rgba(3,7,18,0.95)', backdropFilter:'blur(12px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:200, fontFamily:'"Courier New",monospace',
    }}>
      <div style={{
        background:'rgba(8,10,22,0.99)', border:'1px solid rgba(139,92,246,0.4)',
        borderRadius:20, padding:32, maxWidth:600, width:'90%',
        boxShadow:'0 0 60px rgba(139,92,246,0.2)',
      }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:'1.5rem', fontWeight:900, color:'#c4b5fd', letterSpacing:'0.1em' }}>
            ⚡ ABILITIES COLLECTED
          </div>
          <div style={{ color:'#475569', fontSize:'0.8rem', marginTop:4 }}>
            {abilities.length} ability{abilities.length > 1 ? ' shards' : ' shard'} found this run
          </div>
        </div>
        <div style={{ display:'grid', gap:10, marginBottom:24, maxHeight:300, overflowY:'auto' }}>
          {abilities.slice(0, revealed).map((ab, i) => {
            const color = ABILITY_RARITY_COLORS[ab.rarity] || '#9ca3af';
            return (
              <div key={ab.instanceId || i} style={{
                background:`linear-gradient(90deg,${color}15,transparent)`,
                border:`1px solid ${color}44`,
                borderRadius:10,
                padding:'10px 16px',
                display:'flex', alignItems:'center', gap:12,
                animation:'fadeIn 0.3s ease-out',
              }}>
                <span style={{ fontSize:'1.6rem' }}>{ab.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ color, fontWeight:700, fontSize:'0.85rem' }}>{ab.name}</div>
                  <div style={{ display:'flex', gap:6, marginTop:2 }}>
                    <RarityBadge rarity={ab.rarity} />
                    <span style={{ color:'#475569', fontSize:'0.65rem', textTransform:'uppercase' }}>{ab.type}</span>
                    {ab.cooldown > 0 && <span style={{ color:'#475569', fontSize:'0.65rem' }}>⏱{ab.cooldown}s</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {revealed >= abilities.length && (
          <div style={{ textAlign:'center' }}>
            <button onClick={onSave} style={{
              background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
              border:'none', borderRadius:12, padding:'14px 40px',
              color:'white', fontWeight:900, fontSize:'1rem', cursor:'pointer',
              fontFamily:'"Courier New",monospace', letterSpacing:'0.05em',
              boxShadow:'0 0 20px rgba(124,58,237,0.4)',
            }}>
              ⚡ SAVE TO ABILITY VAULT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ABILITY SCREEN ──────────────────────────────────────────────────────
export default function AbilityScreen({ profile, onProfileUpdate, onBack }) {
  const {
    abilityInventory,
    abilityLoadout,
    equipAbility,
    unequipAbility,
    salvageAbility,
    isInventoryFull,
  } = useAbilities(profile, onProfileUpdate);

  const [selected,       setSelected]       = useState(null);
  const [tooltipAnchor,  setTooltipAnchor]  = useState(null);
  const [search,         setSearch]         = useState('');
  const [filterType,     setFilterType]     = useState('all');
  const [filterRarity,   setFilterRarity]   = useState('all');
  const [sortBy,         setSortBy]         = useState('rarity');
  const [confirmSalvage, setConfirmSalvage] = useState(null);

  // Filtered + sorted inventory
  const displayedInventory = useMemo(() => {
    let items = abilityInventory;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(a => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q));
    }
    if (filterType !== 'all')   items = items.filter(a => a.type === filterType);
    if (filterRarity !== 'all') items = items.filter(a => a.rarity === filterRarity);
    if (sortBy === 'rarity') {
      items = [...items].sort((a,b) => (ABILITY_RARITY_ORDER[b.rarity]||0) - (ABILITY_RARITY_ORDER[a.rarity]||0));
    } else if (sortBy === 'type') {
      items = [...items].sort((a,b) => a.type.localeCompare(b.type));
    } else if (sortBy === 'name') {
      items = [...items].sort((a,b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'cooldown') {
      items = [...items].sort((a,b) => (a.cooldown||0) - (b.cooldown||0));
    }
    return items;
  }, [abilityInventory, search, filterType, filterRarity, sortBy]);

  // Total cooldown reduction summary
  const loadoutSummary = useMemo(() => {
    const slots = Object.values(abilityLoadout || {}).filter(Boolean);
    return {
      cdReduction: slots.filter(a => a.effectKey === 'TACTICAL_PROCESSOR' || a.effectKey === 'OVERCLOCK').length > 0,
      passiveCount: slots.filter(a => a.type === 'passive').length,
      activeCount: slots.filter(a => a.type === 'active' || a.type === 'ultimate').length,
    };
  }, [abilityLoadout]);

  const handleSalvage = useCallback((ability) => {
    salvageAbility(ability);
    if (selected?.instanceId === ability.instanceId) setSelected(null);
    setConfirmSalvage(null);
  }, [salvageAbility, selected]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 30% 20%,#0c0520 0%,#030712 70%)',
      fontFamily: '"Courier New", monospace',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', color: '#e2e8f0',
    }}>
      {/* ── HEADER ── */}
      <div style={{
        display:'flex', alignItems:'center', gap:16, padding:'16px 20px',
        borderBottom:'1px solid rgba(139,92,246,0.15)',
        background:'rgba(0,0,0,0.3)',
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background:'transparent', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8,
          color:'#94a3b8', fontSize:'0.8rem', padding:'6px 14px', cursor:'pointer',
        }}>
          ← BACK
        </button>
        <div>
          <div style={{ fontSize:'1.2rem', fontWeight:900, color:'#c4b5fd', letterSpacing:'0.08em' }}>
            ⚡ ABILITY VAULT
          </div>
          <div style={{ color:'#475569', fontSize:'0.7rem', marginTop:1 }}>
            {abilityInventory.length} abilities · {Object.values(abilityLoadout||{}).filter(Boolean).length} equipped
          </div>
        </div>
        <div style={{ flex:1 }} />
        {/* Quick loadout stats */}
        <div style={{ display:'flex', gap:8 }}>
          {loadoutSummary.cdReduction && (
            <span style={{ background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)',
              borderRadius:8, color:'#c4b5fd', fontSize:'0.65rem', padding:'3px 10px' }}>
              ⚡ 25% CD Reduction
            </span>
          )}
        </div>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* ── LEFT: LOADOUT SLOTS ── */}
        <div style={{
          width: 300, padding:16, borderRight:'1px solid rgba(255,255,255,0.06)',
          overflowY:'auto', flexShrink:0,
          background:'rgba(0,0,0,0.2)',
        }}>
          <div style={{ color:'#475569', fontSize:'0.65rem', letterSpacing:'0.1em', marginBottom:12, fontWeight:700 }}>
            EQUIPPED LOADOUT
          </div>

          {/* Active slots */}
          <div style={{ color:'#334155', fontSize:'0.6rem', marginBottom:6 }}>ACTIVE</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
            {['active1','active2'].map(slotKey => (
              <AbilitySlot
                key={slotKey}
                slotKey={slotKey}
                ability={abilityLoadout[slotKey]}
                onUnequip={unequipAbility}
                selected={false}
                onClick={() => {}}
              />
            ))}
          </div>

          {/* Ultimate */}
          <div style={{ color:'#334155', fontSize:'0.6rem', marginBottom:6 }}>ULTIMATE</div>
          <div style={{ marginBottom:14 }}>
            <AbilitySlot
              slotKey="ultimate"
              ability={abilityLoadout.ultimate}
              onUnequip={unequipAbility}
              selected={false}
              onClick={() => {}}
            />
          </div>

          {/* Passive slots */}
          <div style={{ color:'#334155', fontSize:'0.6rem', marginBottom:6 }}>PASSIVE</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
            {['passive1','passive2','passive3'].map(slotKey => (
              <AbilitySlot
                key={slotKey}
                slotKey={slotKey}
                ability={abilityLoadout[slotKey]}
                onUnequip={unequipAbility}
                selected={false}
                onClick={() => {}}
              />
            ))}
          </div>

          {/* Drone */}
          <div style={{ color:'#334155', fontSize:'0.6rem', marginBottom:6 }}>DRONE MODULE</div>
          <AbilitySlot
            slotKey="drone"
            ability={abilityLoadout.drone}
            onUnequip={unequipAbility}
            selected={false}
            onClick={() => {}}
          />

          {/* Keybind info */}
          <div style={{ marginTop:20, background:'rgba(255,255,255,0.03)', borderRadius:10, padding:12 }}>
            <div style={{ color:'#334155', fontSize:'0.6rem', marginBottom:8 }}>IN-GAME HOTKEYS</div>
            {[['Z','Active Slot A'],['X','Active Slot B'],['R','Ultimate']].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ background:'rgba(255,255,255,0.08)', borderRadius:4, padding:'1px 7px', fontSize:'0.65rem', color:'#94a3b8' }}>{k}</span>
                <span style={{ color:'#475569', fontSize:'0.65rem' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: INVENTORY ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Filters toolbar */}
          <div style={{
            display:'flex', gap:8, padding:'12px 16px', flexShrink:0,
            borderBottom:'1px solid rgba(255,255,255,0.06)',
            flexWrap:'wrap', alignItems:'center',
          }}>
            <input
              type="text"
              placeholder="Search abilities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:8, color:'#e2e8f0', fontSize:'0.78rem', padding:'6px 12px',
                outline:'none', width:160, fontFamily:'inherit',
              }}
            />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={{ background:'rgba(15,23,42,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#e2e8f0', fontSize:'0.75rem', padding:'6px 10px' }}
            >
              <option value="all">All Types</option>
              <option value="active">Active</option>
              <option value="ultimate">Ultimate</option>
              <option value="passive">Passive</option>
              <option value="drone">Drone</option>
            </select>
            <select
              value={filterRarity}
              onChange={e => setFilterRarity(e.target.value)}
              style={{ background:'rgba(15,23,42,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#e2e8f0', fontSize:'0.75rem', padding:'6px 10px' }}
            >
              <option value="all">All Rarities</option>
              {ABILITY_RARITIES.map(r => (
                <option key={r} value={r} style={{ color: ABILITY_RARITY_COLORS[r] }}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ background:'rgba(15,23,42,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#e2e8f0', fontSize:'0.75rem', padding:'6px 10px' }}
            >
              <option value="rarity">Sort: Rarity</option>
              <option value="type">Sort: Type</option>
              <option value="name">Sort: Name</option>
              <option value="cooldown">Sort: Cooldown</option>
            </select>
            <div style={{ marginLeft:'auto', color:'#475569', fontSize:'0.7rem' }}>
              {displayedInventory.length} / {abilityInventory.length}
            </div>
          </div>

          {/* Grid */}
          <div style={{ flex:1, overflowY:'auto', padding:16 }}>
            {displayedInventory.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:'#1e293b' }}>
                <div style={{ fontSize:'3rem', marginBottom:12 }}>⚡</div>
                <div style={{ fontSize:'0.9rem' }}>No abilities found.</div>
                <div style={{ fontSize:'0.75rem', marginTop:8, color:'#0f172a' }}>
                  Defeat bosses and open chests to collect abilities.
                </div>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:10 }}>
                {displayedInventory.map(ability => (
                  <AbilityCard
                    key={ability.instanceId}
                    ability={ability}
                    selected={selected?.instanceId === ability.instanceId}
                    onSelect={setSelected}
                    onEquip={equipAbility}
                    onSalvage={a => setConfirmSalvage(a)}
                    loadout={abilityLoadout}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TOOLTIP ── */}
      {selected && (
        <AbilityTooltip ability={selected} anchor={null} />
      )}

      {/* ── SALVAGE CONFIRM ── */}
      {confirmSalvage && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:999,
        }}>
          <div style={{
            background:'rgba(8,10,22,0.99)', border:'1px solid rgba(239,68,68,0.4)',
            borderRadius:16, padding:28, maxWidth:340, width:'90%', textAlign:'center',
            fontFamily:'"Courier New",monospace',
          }}>
            <div style={{ fontSize:'1rem', color:'#f87171', fontWeight:700, marginBottom:12 }}>
              SALVAGE {confirmSalvage.name}?
            </div>
            <div style={{ color:'#64748b', fontSize:'0.8rem', marginBottom:20 }}>
              You will receive 🪙 {(ABILITY_SALVAGE_VALUE[confirmSalvage.rarity]||50).toLocaleString()} coins. This cannot be undone.
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={() => handleSalvage(confirmSalvage)} style={{
                background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.5)',
                borderRadius:8, color:'#f87171', padding:'8px 20px', cursor:'pointer', fontFamily:'inherit',
              }}>
                SALVAGE
              </button>
              <button onClick={() => setConfirmSalvage(null)} style={{
                background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:8, color:'#94a3b8', padding:'8px 20px', cursor:'pointer', fontFamily:'inherit',
              }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
