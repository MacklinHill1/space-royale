// ui/screens/InventoryScreen.jsx
"use client";

import React, { useState, useMemo } from 'react';
import { useEquipment } from '../../hooks/useEquipment';
import { EQUIP_SLOTS, RARITY_COLORS } from '../../constants/EquipmentData';

export default function InventoryScreen({ profile, onProfileUpdate, onBack }) {
  const { inventory, equipped, equipItem, unequipItem, salvageItem } = useEquipment(profile, onProfileUpdate);
  const [hoveredItem, setHoveredItem] = useState(null);

  const slotLabels = useMemo(() => ({
    [EQUIP_SLOTS.WEAPON]: 'PRIMARY WEAPON',
    [EQUIP_SLOTS.ARMOR]: 'HULL PLATING CORE',
    [EQUIP_SLOTS.UTILITY]: 'AUXILIARY SYSTEMS',
    [EQUIP_SLOTS.MOD1]: 'MOD INTEGRATION L1',
    [EQUIP_SLOTS.MOD2]: 'MOD INTEGRATION L2',
  }), []);

  const formatStatLabel = (key, val) => {
    const displayVal = key.toLowerCase().includes('bonus') || key === 'critChance'
      ? `+${(val * 100).toFixed(1)}%`
      : `+${val}`;
    return `${key.replace('Bonus', '').replace(/([A-Z])/g, ' $1').toUpperCase()}: ${displayVal}`;
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 20%, #090b16 0%, #02040a 100%)', fontFamily: '"Courier New", monospace', color: '#e2e8f0', display: 'flex', padding: '30px', gap: '24px', zIndex: 150 }}>
      
      {/* LEFT SECTION: LOADOUT MANAGMENT PANEL */}
      <div style={{ width: '340px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, color: '#a78bfa', fontSize: '1.2rem', fontWeight: 'bold' }}>PILOT SYSTEM LOADOUT</h3>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '6px 14px', cursor: 'pointer', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', fontFamily: 'inherit' }}>◀ DEPLOY</button>
        </div>

        {Object.entries(slotLabels).map(([slotKey, label]) => {
          const activeItem = equipped[slotKey];
          return (
            <div key={slotKey} style={{ background: 'rgba(10, 15, 30, 0.6)', border: `1px solid ${activeItem ? RARITY_COLORS[activeItem.rarity] : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '1.8rem', background: 'rgba(0,0,0,0.3)', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyOrigin: 'center', justifyContent: 'center', borderRadius: '8px', border: `1px dashed ${activeItem ? 'transparent' : 'rgba(255,255,255,0.15)'}` }}>
                  {activeItem ? activeItem.icon : '⬡'}
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: activeItem ? RARITY_COLORS[activeItem.rarity] : '#64748b', fontWeight: 'bold', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontSize: '0.85rem', color: activeItem ? '#f8fafc' : '#334155', fontWeight: activeItem ? 'bold' : 'normal', marginTop: '2px' }}>{activeItem ? activeItem.name.split(' ').slice(1).join(' ') : 'EMPTY NODE'}</div>
                </div>
              </div>
              {activeItem && (
                <button onClick={() => unequipItem(slotKey)} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}>[STRIP]</button>
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT SECTION: CARGO STORAGE AND DETAILS CONTAINER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'rgba(10, 15, 30, 0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'bold' }}>CARGO INVENTORY SLOTS ({inventory.length} / 40)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: '10px', overflowY: 'auto', flex: 1, alignContent: 'start', paddingRight: '4px' }}>
            {Array.from({ length: 40 }).map((_, idx) => {
              const item = inventory[idx];
              return (
                <div 
                  key={idx} 
                  onMouseEnter={() => item && setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    aspectRatio: '1', background: item ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${item ? RARITY_COLORS[item.rarity] : 'rgba(255,255,255,0.04)'}`,
                    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', cursor: item ? 'pointer' : 'default', position: 'relative', transition: 'transform 0.1s'
                  }}
                >
                  {item && (
                    <>
                      <span>{item.icon}</span>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexWrap: 'wrap', gap: '2px', opacity: 0, hover: { opacity: 1 }, background: 'rgba(0,0,0,0.85)', borderRadius: '9px', alignItems: 'center', justifyContent: 'center' }} className="item-actions">
                        {item.type === 'mod' ? (
                          <>
                            <button onClick={() => equipItem(item, EQUIP_SLOTS.MOD1)} style={{ background: '#0284c7', border: 'none', color: '#fff', fontSize: '0.55rem', padding: '3px 4px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>M1</button>
                            <button onClick={() => equipItem(item, EQUIP_SLOTS.MOD2)} style={{ background: '#0369a1', border: 'none', color: '#fff', fontSize: '0.55rem', padding: '3px 4px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>M2</button>
                          </>
                        ) : (
                          <button onClick={() => equipItem(item, item.type)} style={{ background: '#10b981', border: 'none', color: '#fff', fontSize: '0.6rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>FIT</button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM DOCK: PREVIEW OVERLAYS */}
        <div style={{ height: '110px', background: 'rgba(5, 7, 15, 0.8)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center' }}>
          {hoveredItem ? (
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: RARITY_COLORS[hoveredItem.rarity] }}>{hoveredItem.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>Classification: {hoveredItem.type} module</div>
              </div>
              <div style={{ display: 'flex', gap: '16px', background: 'rgba(0,0,0,0.3)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                {Object.entries(hoveredItem.stats).map(([key, val]) => (
                  <div key={key} style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 'bold' }}>
                    {formatStatLabel(key, val)}
                  </div>
                ))}
              </div>
              <button onClick={() => salvageItem(hoveredItem)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', padding: '8px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}>MELT CORE (+🪙100)</button>
            </div>
          ) : (
            <div style={{ color: '#475569', fontSize: '0.85rem', fontStyle: 'italic', width: '100%', textAlign: 'center', letterSpacing: '0.05em' }}>SCANNING SATELLITE ARRAY INTERFACE HOVER CORES FOR SPECIFICATION SHEETS...</div>
          )}
        </div>
      </div>

      <style jsx global>{`
        div:hover > .item-actions { opacity: 1 !important; }
      `}</style>
    </div>
  );
}