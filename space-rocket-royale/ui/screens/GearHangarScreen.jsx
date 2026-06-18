// ui/screens/GearHangarScreen.jsx  — Full Gear Hangar with 9 slots, filter, sort, tooltips
"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  EQUIP_SLOTS, SLOT_LABELS, SLOT_ICONS,
  CATEGORY_SLOT_MAP, RARITY_COLORS, RARITY_GLOW,
  RARITY_ORDER, RARITY_SALVAGE_VALUE,
  FLAT_STATS, STAT_LABELS, GEAR_CATEGORIES,
} from '../../constants/EquipmentData.js';
import { isItemValidForSlot, sortItemsByRarity, computeEquipmentStats } from '../../systems/EquipmentSystem.js';
import { formatStat } from '../../systems/EquipmentGenerator.js';

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function ItemTooltip({ item, style }) {
  if (!item) return null;
  const color = RARITY_COLORS[item.rarity] || '#9ca3af';

  return (
    <div style={{
      position: 'absolute',
      background: 'rgba(5,8,20,0.98)',
      border: `1px solid ${color}`,
      borderRadius: 12,
      padding: '14px 16px',
      width: 260,
      zIndex: 999,
      pointerEvents: 'none',
      boxShadow: `0 0 24px ${RARITY_GLOW[item.rarity] || 'rgba(0,0,0,0.3)'}`,
      fontFamily: '"Courier New", monospace',
      ...style,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
        <div>
          <div style={{ color, fontWeight: 'bold', fontSize: '0.85rem', lineHeight: 1.2 }}>{item.name}</div>
          <div style={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase' }}>
            {item.rarity.toUpperCase()} {item.category.toUpperCase()} · iLvl {item.itemLevel || '?'}
          </div>
        </div>
      </div>

      {/* Stats */}
      {Object.entries(item.stats || {}).map(([stat, val]) => (
        <div key={stat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 3 }}>
          <span style={{ color: '#94a3b8' }}>{STAT_LABELS[stat] || stat}</span>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{formatStat(stat, val)}</span>
        </div>
      ))}

      {/* Affixes */}
      {item.affixes && item.affixes.length > 0 && (
        <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {item.affixes.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 2 }}>
              <span style={{ color: color }}>[{a.name}]</span>
              <span style={{ color: '#a5f3fc' }}>{a.desc || formatStat(a.stat, a.value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mythic effect */}
      {item.mythicEffect && (
        <div style={{ marginTop: 8, background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 6, padding: '6px 8px' }}>
          <div style={{ color: '#ff6b35', fontSize: '0.7rem', fontWeight: 'bold' }}>⚡ MYTHIC EFFECT</div>
          <div style={{ color: '#fcd34d', fontSize: '0.72rem', marginTop: 2 }}>{item.mythicEffect.name}: {item.mythicEffect.desc}</div>
        </div>
      )}

      {/* Special effect */}
      {item.specialEffect && (
        <div style={{ marginTop: 6, background: 'rgba(255,0,255,0.10)', border: '1px solid rgba(255,0,255,0.25)', borderRadius: 6, padding: '4px 8px' }}>
          <div style={{ color: '#f0abfc', fontSize: '0.7rem' }}>✨ {item.specialEffect.replace(/_/g, ' ')}</div>
        </div>
      )}

      {/* Flavor text */}
      {item.flavorText && (
        <div style={{ marginTop: 8, color: '#475569', fontSize: '0.7rem', fontStyle: 'italic', lineHeight: 1.4 }}>
          {item.flavorText}
        </div>
      )}

      {/* Source + value */}
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', color: '#374151', fontSize: '0.65rem' }}>
        <span>Source: {item.source || 'unknown'}</span>
        <span>Salvage: 🪙{item.value || 0}</span>
      </div>
    </div>
  );
}

// ─── GEAR SLOT ────────────────────────────────────────────────────────────────
function GearSlot({ slotKey, item, onUnequip, onHover, onHoverEnd }) {
  const color = item ? RARITY_COLORS[item.rarity] : 'rgba(255,255,255,0.08)';
  const label = SLOT_LABELS[slotKey] || slotKey;
  const slotIcon = SLOT_ICONS[slotKey] || '⬡';

  return (
    <div
      onMouseEnter={() => item && onHover && onHover(item)}
      onMouseLeave={() => onHoverEnd && onHoverEnd()}
      style={{
        background: item ? `radial-gradient(circle at 30% 30%, ${RARITY_GLOW[item.rarity]}, rgba(5,8,20,0.9))` : 'rgba(5,8,20,0.5)',
        border: `1px solid ${color}`,
        borderRadius: 10,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: item ? 'default' : 'default',
        transition: 'all 0.15s',
        minHeight: 58,
      }}
    >
      <div style={{
        fontSize: '1.5rem',
        width: 38, height: 38,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
        border: `1px dashed ${item ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
        flexShrink: 0,
      }}>
        {item ? item.icon : slotIcon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: item ? RARITY_COLORS[item.rarity] : '#334155', fontSize: '0.62rem', fontWeight: 'bold', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ color: item ? '#f8fafc' : '#1e293b', fontSize: '0.8rem', fontWeight: item ? 'bold' : 'normal', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item ? item.name : 'EMPTY'}
        </div>
        {item && (
          <div style={{ color: '#64748b', fontSize: '0.62rem', marginTop: 1 }}>
            iLvl {item.itemLevel || '?'} · {Object.keys(item.stats || {}).length + (item.affixes || []).length} mods
          </div>
        )}
      </div>
      {item && (
        <button
          onClick={() => onUnequip(slotKey)}
          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'inherit', padding: '2px 6px', flexShrink: 0 }}
        >
          STRIP
        </button>
      )}
    </div>
  );
}

// ─── INVENTORY ITEM CARD ──────────────────────────────────────────────────────
function InventoryCard({ item, onEquip, onSalvage, onHover, onHoverEnd, isSelected, onClick }) {
  const color = RARITY_COLORS[item.rarity] || '#9ca3af';

  return (
    <div
      onMouseEnter={() => onHover && onHover(item)}
      onMouseLeave={() => onHoverEnd && onHoverEnd()}
      onClick={() => onClick && onClick(item)}
      style={{
        background: isSelected
          ? `radial-gradient(circle, ${RARITY_GLOW[item.rarity]}, rgba(5,8,20,0.95))`
          : 'rgba(5,8,20,0.7)',
        border: `1px solid ${isSelected ? color : color + '55'}`,
        borderRadius: 10,
        padding: '10px',
        cursor: 'pointer',
        transition: 'all 0.12s',
        position: 'relative',
        boxShadow: isSelected ? `0 0 12px ${RARITY_GLOW[item.rarity]}` : 'none',
      }}
    >
      {/* Rarity indicator strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color, borderRadius: '10px 10px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color, fontSize: '0.62rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{item.rarity}</div>
          <div style={{ color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
        </div>
        <div style={{ color: '#475569', fontSize: '0.62rem', flexShrink: 0 }}>iLvl {item.itemLevel || '?'}</div>
      </div>

      {/* Top stats preview */}
      {Object.entries(item.stats || {}).slice(0, 2).map(([stat, val]) => (
        <div key={stat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: 1 }}>
          <span style={{ color: '#64748b' }}>{STAT_LABELS[stat] || stat}</span>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{formatStat(stat, val)}</span>
        </div>
      ))}

      {/* Affix chips */}
      {item.affixes && item.affixes.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 5 }}>
          {item.affixes.map(a => (
            <span key={a.id} style={{ background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 4, padding: '1px 5px', color, fontSize: '0.6rem', fontWeight: 'bold' }}>
              {a.name}
            </span>
          ))}
        </div>
      )}

      {/* Actions row */}
      {isSelected && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {(CATEGORY_SLOT_MAP[item.category] || []).map(slot => (
            <button
              key={slot}
              onClick={(e) => { e.stopPropagation(); onEquip(item, slot); }}
              style={{
                flex: 1,
                background: `${color}22`,
                border: `1px solid ${color}66`,
                borderRadius: 5,
                color,
                fontSize: '0.62rem',
                fontWeight: 'bold',
                padding: '4px 4px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              EQUIP {SLOT_LABELS[slot]?.split(' ')[0]}
            </button>
          ))}
          <button
            onClick={(e) => { e.stopPropagation(); onSalvage(item); }}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 5,
              color: '#ef4444',
              fontSize: '0.6rem',
              fontWeight: 'bold',
              padding: '4px 8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            🪙{item.value}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── POST-GAME LOOT SUMMARY ───────────────────────────────────────────────────
export function LootSummary({ lootItems, xpEarned, coinsEarned, bossesDefeated, onClose }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed < (lootItems || []).length) {
      const t = setTimeout(() => setRevealed(r => r + 1), 200);
      return () => clearTimeout(t);
    }
  }, [revealed, lootItems]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(3,7,18,0.96)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
      fontFamily: '"Courier New", monospace',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.99), rgba(30,10,60,0.99))',
        border: '1px solid rgba(139,92,246,0.4)',
        borderRadius: 20,
        padding: '32px',
        maxWidth: 600,
        width: '90%',
        maxHeight: '85vh',
        overflowY: 'auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#c4b5fd', marginBottom: 4 }}>RUN COMPLETE</div>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Equipment collected this run</div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
          {[['XP EARNED', xpEarned?.toLocaleString() || '0'], ['COINS', coinsEarned?.toLocaleString() || '0'], ['BOSSES', bossesDefeated || '0']].map(([l, v]) => (
            <div key={l} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(55,65,81,0.5)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '0.62rem', letterSpacing: '0.05em' }}>{l}</div>
              <div style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Loot list */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: 10, letterSpacing: '0.1em' }}>
            LOOT OBTAINED ({(lootItems || []).length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(lootItems || []).slice(0, revealed).map((item, i) => {
              const color = RARITY_COLORS[item.rarity] || '#9ca3af';
              return (
                <div key={item.instanceId || i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: `${RARITY_GLOW[item.rarity] || 'rgba(0,0,0,0.3)'}`,
                  border: `1px solid ${color}44`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  animation: 'fadeIn 0.3s ease',
                }}>
                  <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color, fontWeight: 'bold', fontSize: '0.8rem' }}>{item.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.65rem' }}>
                      {item.rarity.toUpperCase()} · iLvl {item.itemLevel || '?'} · {item.source}
                    </div>
                  </div>
                  <div style={{ color, fontSize: '0.65rem', fontWeight: 'bold', textAlign: 'right' }}>
                    {Object.entries(item.stats || {}).slice(0, 2).map(([s, v]) => (
                      <div key={s}>{STAT_LABELS[s]}: {formatStat(s, v)}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: 'none',
            borderRadius: 10,
            padding: '14px',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '1rem',
            letterSpacing: '0.05em',
          }}
        >
          SAVE TO GEAR HANGAR
        </button>
      </div>
    </div>
  );
}

// ─── PICKUP NOTIFICATION ──────────────────────────────────────────────────────
export function PickupNotification({ item }) {
  if (!item) return null;
  const color = RARITY_COLORS[item.rarity] || '#9ca3af';

  return (
    <div style={{
      position: 'fixed',
      bottom: 120,
      right: 20,
      background: `rgba(5,8,20,0.95)`,
      border: `1px solid ${color}`,
      borderRadius: 10,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: '"Courier New", monospace',
      boxShadow: `0 0 20px ${RARITY_GLOW[item.rarity] || 'transparent'}`,
      animation: 'slideInRight 0.3s ease',
      zIndex: 300,
      minWidth: 200,
      maxWidth: 300,
      pointerEvents: 'none',
    }}>
      <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
      <div>
        <div style={{ color, fontWeight: 'bold', fontSize: '0.8rem' }}>{item.name}</div>
        <div style={{ color: '#64748b', fontSize: '0.65rem' }}>
          {item.rarity.toUpperCase()} · {item.category}
        </div>
        {Object.entries(item.stats || {}).slice(0, 1).map(([s, v]) => (
          <div key={s} style={{ color: '#38bdf8', fontSize: '0.65rem', fontWeight: 'bold' }}>
            {STAT_LABELS[s]}: {formatStat(s, v)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN GEAR HANGAR SCREEN ──────────────────────────────────────────────────
const SORT_OPTIONS = [
  { id: 'rarity_desc', label: 'Rarity ↓' },
  { id: 'rarity_asc',  label: 'Rarity ↑' },
  { id: 'ilvl_desc',   label: 'Item Level ↓' },
  { id: 'ilvl_asc',    label: 'Item Level ↑' },
  { id: 'name_asc',    label: 'Name A-Z' },
];

const ALL_CATEGORIES = ['all', 'weapon', 'armor', 'engine', 'reactor', 'shield', 'drone', 'module'];
const ALL_RARITIES   = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'secret'];

export default function GearHangarScreen({ profile, onProfileUpdate, onBack }) {
  const [hoveredItem, setHoveredItem]     = useState(null);
  const [selectedItem, setSelectedItem]   = useState(null);
  const [tooltipPos, setTooltipPos]       = useState({ x: 0, y: 0 });
  const [sortBy, setSortBy]               = useState('rarity_desc');
  const [filterCategory, setFilterCat]    = useState('all');
  const [filterRarity, setFilterRarity]   = useState('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const containerRef = useRef(null);

  const gearInventory  = useMemo(() => profile?.gearInventory || [], [profile]);
  const loadout        = useMemo(() => profile?.gearLoadout || {}, [profile]);

  const updateProfile = useCallback((nextInventory, nextLoadout) => {
    const updated = {
      ...profile,
      gearInventory: nextInventory,
      gearLoadout: nextLoadout,
    };
    setTimeout(() => onProfileUpdate(updated), 0);
  }, [profile, onProfileUpdate]);

  // ── Equip ────────────────────────────────────────────────────────────────
  const equipItem = useCallback((item, slotKey) => {
    if (!isItemValidForSlot(item, slotKey)) return;

    const currentInSlot = loadout[slotKey];
    let nextInventory = gearInventory.filter(i => i.instanceId !== item.instanceId);
    if (currentInSlot) nextInventory = [...nextInventory, currentInSlot];

    const nextLoadout = { ...loadout, [slotKey]: item };
    setSelectedItem(null);
    updateProfile(nextInventory, nextLoadout);
  }, [gearInventory, loadout, updateProfile]);

  // ── Unequip ──────────────────────────────────────────────────────────────
  const unequipItem = useCallback((slotKey) => {
    const item = loadout[slotKey];
    if (!item) return;

    const nextInventory = [...gearInventory, item];
    const nextLoadout   = { ...loadout, [slotKey]: null };
    updateProfile(nextInventory, nextLoadout);
  }, [gearInventory, loadout, updateProfile]);

  // ── Salvage ──────────────────────────────────────────────────────────────
  const salvageItem = useCallback((item) => {
    const nextInventory = gearInventory.filter(i => i.instanceId !== item.instanceId);
    const salvageValue  = item.value || RARITY_SALVAGE_VALUE[item.rarity] || 50;
    const updated = {
      ...profile,
      gearInventory: nextInventory,
      gold: (profile.gold || 0) + salvageValue,
    };
    setSelectedItem(null);
    setTimeout(() => onProfileUpdate(updated), 0);
  }, [gearInventory, profile, onProfileUpdate]);

  // ── Filtered + Sorted inventory ──────────────────────────────────────────
  const displayedItems = useMemo(() => {
    let items = [...gearInventory];

    if (filterCategory !== 'all') items = items.filter(i => i.category === filterCategory);
    if (filterRarity !== 'all')   items = items.filter(i => i.rarity === filterRarity);
    if (searchQuery.trim())       items = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    switch (sortBy) {
      case 'rarity_desc': items.sort((a, b) => (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0)); break;
      case 'rarity_asc':  items.sort((a, b) => (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0)); break;
      case 'ilvl_desc':   items.sort((a, b) => (b.itemLevel || 0) - (a.itemLevel || 0)); break;
      case 'ilvl_asc':    items.sort((a, b) => (a.itemLevel || 0) - (b.itemLevel || 0)); break;
      case 'name_asc':    items.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    return items;
  }, [gearInventory, filterCategory, filterRarity, searchQuery, sortBy]);

  // ── Equipped stat totals ─────────────────────────────────────────────────
  const equippedStats = useMemo(() => computeEquipmentStats(loadout), [loadout]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 20% 20%, #0d0521 0%, #020408 100%)',
        fontFamily: '"Courier New", monospace',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 150,
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {/* ── TOP BAR ───────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(139,92,246,0.2)',
        background: 'rgba(0,0,0,0.4)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <h2 style={{ margin: 0, color: '#a78bfa', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.1em' }}>⚙ GEAR HANGAR</h2>
          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{gearInventory.length} items in storage</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {profile?.gold > 0 && (
            <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '0.9rem' }}>🪙 {(profile.gold || 0).toLocaleString()}</div>
          )}
          <button
            onClick={onBack}
            style={{
              background: 'rgba(139,92,246,0.2)',
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: 8,
              padding: '8px 18px',
              color: '#c4b5fd',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'inherit',
              fontSize: '0.85rem',
            }}
          >
            ◀ BACK
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: Loadout Slots */}
        <div style={{
          width: 300,
          borderRight: '1px solid rgba(255,255,255,0.05)',
          padding: '16px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: 4 }}>LOADOUT SLOTS</div>

          {Object.values(EQUIP_SLOTS).map(slotKey => (
            <GearSlot
              key={slotKey}
              slotKey={slotKey}
              item={loadout[slotKey] || null}
              onUnequip={unequipItem}
              onHover={setHoveredItem}
              onHoverEnd={() => setHoveredItem(null)}
            />
          ))}

          {/* Equipped stats summary */}
          {Object.keys(equippedStats).length > 0 && (
            <div style={{ marginTop: 12, background: 'rgba(5,8,20,0.6)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 10, padding: '12px' }}>
              <div style={{ color: '#7c3aed', fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '0.08em', marginBottom: 8 }}>TOTAL BONUSES</div>
              {Object.entries(equippedStats).map(([stat, val]) => (
                <div key={stat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: 3 }}>
                  <span style={{ color: '#64748b' }}>{STAT_LABELS[stat] || stat}</span>
                  <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>{formatStat(stat, val)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Inventory */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Filter / Sort bar */}
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.25)',
            flexShrink: 0,
          }}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 6,
                padding: '6px 10px',
                color: '#e2e8f0',
                fontFamily: 'inherit',
                fontSize: '0.78rem',
                width: 160,
                outline: 'none',
              }}
            />

            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={e => setFilterCat(e.target.value)}
              style={{ background: 'rgba(5,8,20,0.9)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 6, padding: '6px 8px', color: '#94a3b8', fontFamily: 'inherit', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Types' : c.toUpperCase()}</option>)}
            </select>

            {/* Rarity filter */}
            <select
              value={filterRarity}
              onChange={e => setFilterRarity(e.target.value)}
              style={{ background: 'rgba(5,8,20,0.9)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 6, padding: '6px 8px', color: filterRarity !== 'all' ? RARITY_COLORS[filterRarity] : '#94a3b8', fontFamily: 'inherit', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              {ALL_RARITIES.map(r => <option key={r} value={r} style={{ color: r !== 'all' ? RARITY_COLORS[r] : undefined }}>{r === 'all' ? 'All Rarities' : r.toUpperCase()}</option>)}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ background: 'rgba(5,8,20,0.9)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 6, padding: '6px 8px', color: '#94a3b8', fontFamily: 'inherit', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>

            <div style={{ marginLeft: 'auto', color: '#374151', fontSize: '0.7rem' }}>{displayedItems.length} items</div>
          </div>

          {/* Inventory grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            {displayedItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#374151', fontSize: '0.9rem', marginTop: 60 }}>
                {gearInventory.length === 0 ? 'No gear collected yet.\nDefeat bosses to earn equipment drops!' : 'No items match your filters.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, alignContent: 'start' }}>
                {displayedItems.map(item => (
                  <InventoryCard
                    key={item.instanceId}
                    item={item}
                    isSelected={selectedItem?.instanceId === item.instanceId}
                    onClick={i => setSelectedItem(prev => prev?.instanceId === i.instanceId ? null : i)}
                    onEquip={equipItem}
                    onSalvage={salvageItem}
                    onHover={() => {}}
                    onHoverEnd={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredItem && (
        <ItemTooltip
          item={hoveredItem}
          style={{
            left: Math.min(tooltipPos.x + 14, (containerRef.current?.offsetWidth || 1000) - 280),
            top: Math.max(0, Math.min(tooltipPos.y - 20, (containerRef.current?.offsetHeight || 800) - 400)),
          }}
        />
      )}
    </div>
  );
}
