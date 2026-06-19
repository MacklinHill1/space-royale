'use client';
// ui/screens/MetaHubScreen.jsx
// Tabbed meta-progression hub: Achievements, Daily Missions, Tech Tree, Pets, Shop.

import { useState, useMemo } from 'react';
import {
  ACHIEVEMENTS, ACHIEVEMENT_MAP, computeAccountLevel, xpNeededForNextLevel,
  TECH_BRANCHES, TECH_NODE_MAP, canUnlockNode, isBranchComplete,
  PET_TYPES, PET_MAP, PRESTIGE_UPGRADES, computePrestigeStats,
  generateHourlyShop, getHourlyShopSeed, HOURLY_SHOP_INTERVAL,
} from '../../systems/MetaProgression.js';

const TABS = ['ACHIEVEMENTS', 'MISSIONS', 'TECH TREE', 'PETS', 'SHOP', 'PRESTIGE'];
const TAB_ICONS = ['🏆', '📋', '🔬', '🐾', '🛍', '⭐'];

const RARITY_COLORS = {
  common:    '#94a3b8',
  uncommon:  '#22c55e',
  rare:      '#3b82f6',
  epic:      '#a855f7',
  legendary: '#f59e0b',
  mythic:    '#ef4444',
  secret:    '#e879f9',
};

function RubyIcon() {
  return <span style={{ color: '#e879f9' }}>💎</span>;
}

export function MetaHubScreen({ save, onBack, onUnlockTech, onBuyPrestige, onSetPet, onBuyHourlyItem, onClaimMission, initialTab = 0 }) {
  const [tab, setTab] = useState(initialTab);
  const [hoveredNode, setHoveredNode] = useState(null);

  const acct = useMemo(() => computeAccountLevel(save.accountXP || 0), [save.accountXP]);
  const techSet = useMemo(() => new Set(save.techUnlocked || []), [save.techUnlocked]);
  const unlockedAchs = useMemo(() => new Set(save.unlockedAchievements || []), [save.unlockedAchievements]);
  const hourlyShop = useMemo(() => generateHourlyShop(getHourlyShopSeed()), []);

  // Minutes until hourly shop refreshes
  const hourlyRefreshMin = useMemo(() => {
    const d = new Date();
    return 60 - d.getMinutes();
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0a15 60%, #000 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Courier New', monospace", color: '#e2e8f0',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '8px 16px', color: '#94a3b8', fontSize: 12,
          cursor: 'pointer', letterSpacing: 2, fontFamily: 'inherit',
        }}>← BACK</button>

        {/* Account level bar */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#7c3aed', letterSpacing: 3, marginBottom: 2 }}>ACCOUNT LEVEL {acct.level}</div>
          <div style={{ width: 200, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
            <div style={{
              width: `${(acct.xpIntoLevel / acct.xpForNext) * 100}%`,
              height: '100%', background: 'linear-gradient(90deg, #7c3aed, #c4b5fd)',
              borderRadius: 3, transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
            {acct.xpIntoLevel.toLocaleString()} / {acct.xpForNext.toLocaleString()} XP
          </div>
        </div>

        {/* Currency display */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 2 }}>RUBIES</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e879f9' }}>
              💎 {(save.rubies || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 2 }}>RESEARCH</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#a855f7' }}>
              🔬 {(save.researchPoints || 0).toLocaleString()}
            </div>
          </div>
          {(save.cosmicShards || 0) > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 2 }}>SHARDS</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>
                ⭐ {(save.cosmicShards || 0).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 2, padding: '8px 24px 0',
        borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
      }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            background: tab === i ? 'rgba(124,58,237,0.2)' : 'transparent',
            border: 'none',
            borderBottom: tab === i ? '2px solid #7c3aed' : '2px solid transparent',
            padding: '8px 16px', color: tab === i ? '#c4b5fd' : '#64748b',
            cursor: 'pointer', fontSize: 11, letterSpacing: 1.5,
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}>
            {TAB_ICONS[i]} {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 0 && <AchievementsTab achievements={ACHIEVEMENTS} unlocked={unlockedAchs} stats={save.achievementStats || {}} />}
        {tab === 1 && <MissionsTab missions={save.dailyMissions || []} onClaim={onClaimMission} />}
        {tab === 2 && <TechTreeTab save={save} techSet={techSet} onUnlock={onUnlockTech} hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} />}
        {tab === 3 && <PetsTab save={save} onSetPet={onSetPet} />}
        {tab === 4 && <HourlyShopTab shop={hourlyShop} save={save} refreshMin={hourlyRefreshMin} onBuy={onBuyHourlyItem} />}
        {tab === 5 && <PrestigeTab save={save} onBuy={onBuyPrestige} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS TAB
// ─────────────────────────────────────────────────────────────────────────────

function AchievementsTab({ achievements, unlocked, stats }) {
  const [filterCat, setFilterCat] = useState('All');
  const cats = ['All', ...new Set(achievements.map(a => a.cat))];
  const baseFiltered = filterCat === 'All' ? achievements : achievements.filter(a => a.cat === filterCat);
  // Sort: incomplete first, completed to bottom
  const filtered = [...baseFiltered].sort((a, b) => {
    const aDone = unlocked.has(a.id) ? 1 : 0;
    const bDone = unlocked.has(b.id) ? 1 : 0;
    return aDone - bDone;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 24px', flexShrink: 0, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{
            background: filterCat === c ? '#7c3aed' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '4px 12px',
            color: filterCat === c ? '#fff' : '#64748b',
            fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
          }}>{c}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b', alignSelf: 'center' }}>
          {unlocked.size} / {achievements.length} unlocked
        </span>
      </div>

      {/* Achievement list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, alignContent: 'start' }}>
        {filtered.map(a => {
          const done    = unlocked.has(a.id);
          const current = Array.isArray(stats[a.stat]) ? stats[a.stat].length : (stats[a.stat] ?? 0);
          const pct     = Math.min(100, (current / a.goal) * 100);
          return (
            <div key={a.id} style={{
              background: done ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${done ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 10, padding: 14, position: 'relative',
            }}>
              {done && <div style={{ position: 'absolute', top: 8, right: 8, color: '#4ade80', fontSize: 14 }}>✓</div>}
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 2 }}>{a.cat}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: done ? '#4ade80' : '#e2e8f0', marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>{a.desc}</div>
              {/* Progress bar */}
              <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: done ? '#4ade80' : '#7c3aed', borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 10, color: done ? '#4ade80' : '#475569', marginTop: 4, fontWeight: done ? 700 : 400 }}>
                {current.toLocaleString()} / {a.goal.toLocaleString()}{done ? ' ✓ COMPLETE' : ''}
              </div>
              {/* Reward */}
              <div style={{ marginTop: 8, fontSize: 10, color: '#64748b' }}>
                Reward: {a.reward.rubies && <span style={{ color: '#e879f9' }}>💎 {a.reward.rubies}</span>}
                {a.reward.researchPoints && <span style={{ color: '#a855f7', marginLeft: 6 }}>🔬 {a.reward.researchPoints}</span>}
                {a.reward.title && <span style={{ color: '#f59e0b', marginLeft: 6 }}>🏅 "{a.reward.title}"</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MISSIONS TAB
// ─────────────────────────────────────────────────────────────────────────────

function MissionsTab({ missions, onClaim }) {
  // Sort: active first, completed-but-unclaimed second, claimed last
  const sorted = [...(missions || [])].sort((a, b) => {
    const rankA = a.rewardClaimed ? 2 : a.completed ? 1 : 0;
    const rankB = b.rewardClaimed ? 2 : b.completed ? 1 : 0;
    return rankA - rankB;
  });
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', height: '100%' }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: '#64748b', marginBottom: 4 }}>
        DAILY MISSIONS — refreshes at midnight
      </div>
      {sorted.length === 0 && (
        <div style={{ color: '#475569', fontSize: 13 }}>No missions available. Check back tomorrow!</div>
      )}
      {sorted.map(m => {
        const pct = Math.min(100, (m.progress / m.goal) * 100);
        return (
          <div key={m.id} style={{
            background: m.completed ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${m.completed ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 12, padding: 16,
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>{m.desc}</div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: m.completed ? '#4ade80' : '#7c3aed', borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 10, color: m.completed ? '#4ade80' : '#475569', marginTop: 4, fontWeight: m.completed ? 700 : 400 }}>
                {m.progress.toLocaleString()} / {m.goal.toLocaleString()}{m.completed ? ' ✓ COMPLETE' : ''}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>
                Reward: <span style={{ color: '#e879f9' }}>💎 {m.reward.rubies}</span>
                {m.reward.chest > 0 && <span style={{ color: '#f59e0b', marginLeft: 8 }}>📦 ×{m.reward.chest} chest</span>}
              </div>
            </div>
            {m.completed && !m.rewardClaimed && (
              <button onClick={() => onClaim?.(m.id)} style={{
                background: 'linear-gradient(135deg, #16a34a, #4ade80)',
                border: 'none', borderRadius: 8, padding: '8px 16px',
                color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', letterSpacing: 1, fontFamily: 'inherit',
                flexShrink: 0,
              }}>CLAIM</button>
            )}
            {m.rewardClaimed && (
              <div style={{ color: '#4ade80', fontSize: 12, letterSpacing: 1, alignSelf: 'center' }}>✓ CLAIMED</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TECH TREE TAB
// ─────────────────────────────────────────────────────────────────────────────

function TechTreeTab({ save, techSet, onUnlock, hoveredNode, setHoveredNode }) {
  const rp = save.researchPoints || 0;

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {Object.entries(TECH_BRANCHES).map(([branchId, branch]) => (
        <div key={branchId} style={{
          flex: '1 1 280px',
          background: 'rgba(10,10,25,0.6)',
          border: `1px solid ${branch.color}30`,
          borderRadius: 14, padding: 16,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: branch.color, marginBottom: 4 }}>
            {branch.icon} {branch.name}
          </div>
          {isBranchComplete(branchId, techSet) && (
            <div style={{ fontSize: 10, color: '#4ade80', letterSpacing: 2 }}>✓ BRANCH COMPLETE</div>
          )}
          {branch.nodes.map(node => {
            const unlocked = techSet.has(node.id);
            const available = !unlocked && canUnlockNode(node.id, techSet);
            const canAfford = rp >= node.cost;
            return (
              <div key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  background: unlocked
                    ? `${branch.color}20`
                    : available
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${unlocked ? branch.color : available ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: 8, padding: '10px 12px',
                  opacity: unlocked ? 1 : available ? 1 : 0.4,
                  transition: 'all 0.15s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: unlocked ? '#e2e8f0' : available ? '#94a3b8' : '#475569' }}>
                    {unlocked ? '✓ ' : ''}{node.name}
                  </span>
                  {!unlocked && (
                    <span style={{ fontSize: 10, color: canAfford && available ? branch.color : '#475569' }}>
                      🔬 {node.cost}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{node.desc}</div>
                {node.requires?.length > 0 && !unlocked && (
                  <div style={{ fontSize: 9, color: '#374151', marginTop: 4 }}>
                    Requires: {node.requires.join(', ')}
                  </div>
                )}
                {available && !unlocked && (
                  <button
                    onClick={() => canAfford && onUnlock?.(node.id, node.cost)}
                    disabled={!canAfford}
                    style={{
                      marginTop: 8, width: '100%',
                      background: canAfford ? `linear-gradient(135deg, ${branch.color}, ${branch.color}80)` : 'rgba(255,255,255,0.05)',
                      border: 'none', borderRadius: 6, padding: '6px 0',
                      color: canAfford ? '#fff' : '#374151',
                      fontSize: 10, fontWeight: 700, cursor: canAfford ? 'pointer' : 'not-allowed',
                      letterSpacing: 1, fontFamily: 'inherit',
                    }}
                  >
                    {canAfford ? 'UNLOCK' : `NEED ${node.cost - rp} MORE`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PETS TAB
// ─────────────────────────────────────────────────────────────────────────────

function PetsTab({ save, onSetPet }) {
  const owned   = new Set(save.petInventory || []);
  const active  = save.activePetId;

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, alignContent: 'start' }}>
      {PET_TYPES.map(pet => {
        const isOwned  = owned.has(pet.id);
        const isActive = active === pet.id;
        const color    = RARITY_COLORS[pet.rarity] || '#fff';
        return (
          <div key={pet.id} style={{
            background: isOwned ? `${color}12` : 'rgba(255,255,255,0.02)',
            border: `2px solid ${isActive ? color : isOwned ? `${color}50` : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 12, padding: 16,
            opacity: isOwned ? 1 : 0.4,
            transition: 'all 0.15s',
            boxShadow: isActive ? `0 0 16px ${color}40` : 'none',
          }}>
            <div style={{ fontSize: 36, marginBottom: 6, filter: isOwned ? 'none' : 'grayscale(1)' }}>{pet.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: isOwned ? '#e2e8f0' : '#475569', marginBottom: 2 }}>{pet.name}</div>
            <div style={{ fontSize: 10, color: color, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>{pet.rarity}</div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 10, lineHeight: 1.5 }}>{pet.desc}</div>
            {pet.bonuses.map((b, i) => (
              <div key={i} style={{ fontSize: 10, color: '#4ade80', marginBottom: 2 }}>+ {b.label}</div>
            ))}
            {isOwned && (
              <button onClick={() => onSetPet?.(isActive ? null : pet.id)} style={{
                marginTop: 10, width: '100%',
                background: isActive ? '#ef4444' : `linear-gradient(135deg, ${color}, ${color}80)`,
                border: 'none', borderRadius: 6, padding: '6px 0',
                color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                letterSpacing: 1, fontFamily: 'inherit',
              }}>
                {isActive ? 'UNEQUIP' : 'EQUIP'}
              </button>
            )}
            {!isOwned && (
              <div style={{ marginTop: 10, fontSize: 10, color: '#374151', textAlign: 'center' }}>
                Drop from: {pet.dropSource.replace(/_/g, ' ')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOURLY SHOP TAB
// ─────────────────────────────────────────────────────────────────────────────

function HourlyShopTab({ shop, save, refreshMin, onBuy }) {
  const rubies    = save.rubies || 0;
  const purchased = new Set(Object.keys(save.hourlyShopPurchased || {}));

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>HOURLY SHOP</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Next refresh in: <span style={{ color: '#f59e0b' }}>{refreshMin}m</span></div>
        </div>
        <div style={{ fontSize: 16, color: '#e879f9', fontWeight: 700 }}>💎 {rubies.toLocaleString()}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {shop.map((item, i) => {
          const isBought  = purchased.has(item.type + '_' + i);
          const canAfford = rubies >= item.cost;
          const color     = RARITY_COLORS[item.rarity] || '#fff';
          return (
            <div key={i} style={{
              background: `${color}10`,
              border: `2px solid ${color}40`,
              borderRadius: 12, padding: 14,
              opacity: isBought ? 0.5 : 1,
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{item.name}</div>
              <div style={{ fontSize: 10, color, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{item.rarity}</div>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 12 }}>{item.desc}</div>
              <button
                disabled={isBought || !canAfford}
                onClick={() => !isBought && canAfford && onBuy?.(item, i)}
                style={{
                  width: '100%', borderRadius: 6, padding: '7px 0',
                  background: isBought ? 'rgba(255,255,255,0.05)' : canAfford ? `linear-gradient(135deg, ${color}, ${color}60)` : 'rgba(255,255,255,0.05)',
                  border: 'none', color: isBought ? '#475569' : canAfford ? '#fff' : '#475569',
                  fontSize: 11, fontWeight: 700, cursor: isBought || !canAfford ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', letterSpacing: 1,
                }}>
                {isBought ? 'PURCHASED' : `💎 ${item.cost}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESTIGE TAB
// ─────────────────────────────────────────────────────────────────────────────

function PrestigeTab({ save, onBuy }) {
  const shards    = save.cosmicShards || 0;
  const purchased = new Set(save.prestigePurchased || []);

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>PRESTIGE UPGRADES</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
          Permanent bonuses purchased with Cosmic Shards. You have{' '}
          <span style={{ color: '#f59e0b' }}>⭐ {shards.toLocaleString()}</span> shards.
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
          Prestige Level: <span style={{ color: '#f59e0b' }}>{save.prestigeLevel || 0}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {PRESTIGE_UPGRADES.map(u => {
          const isBought  = purchased.has(u.id);
          const canAfford = shards >= u.cost;
          return (
            <div key={u.id} style={{
              background: isBought ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isBought ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 12, padding: 14,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: isBought ? '#f59e0b' : '#e2e8f0', marginBottom: 4 }}>
                {isBought ? '✓ ' : ''}{u.name}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>{u.desc}</div>
              <button
                disabled={isBought || !canAfford}
                onClick={() => !isBought && canAfford && onBuy?.(u.id, u.cost)}
                style={{
                  background: isBought ? 'rgba(245,158,11,0.2)' : canAfford ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isBought ? '#f59e0b' : canAfford ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8, padding: '6px 14px',
                  color: isBought ? '#f59e0b' : canAfford ? '#fbbf24' : '#475569',
                  fontSize: 11, fontWeight: 700, cursor: isBought || !canAfford ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', letterSpacing: 1,
                  opacity: isBought || !canAfford ? 0.5 : 1,
                }}
              >
                {isBought ? '✓ OWNED' : `⭐ ${u.cost.toLocaleString()} SHARDS`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MetaHubScreen;
