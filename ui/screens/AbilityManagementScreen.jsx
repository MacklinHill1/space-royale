'use client';
import { useState } from 'react';
import { ABILITIES } from '../../src/app/game/GameEngine';

export default function AbilityManagementScreen({ player, onEquipAbility, onBack }) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!player) return null;

  const equippedAbilities = player.abilities || { active1: null, active2: null };
  const availableAbilities = ABILITIES.filter(a => a.type === 'active');

  const handleEquip = (abilityId) => {
    if (selectedSlot) {
      onEquipAbility(selectedSlot, abilityId);
      setSelectedSlot(null);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '2px solid #8b5cf6',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '800px',
        width: '100%',
        boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#8b5cf6',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          ⚡ Ability Management
        </h2>

        {/* Equipped Slots */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#e2e8f0',
            marginBottom: '16px'
          }}>
            Equipped Abilities
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {['active1', 'active2'].map((slot) => {
              const abilityId = equippedAbilities[slot];
              const ability = abilityId ? ABILITIES.find(a => a.id === abilityId) : null;
              const isSelected = selectedSlot === slot;
              
              return (
                <div
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    background: isSelected ? 'rgba(139, 92, 246, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                    border: `2px solid ${isSelected ? '#8b5cf6' : '#475569'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    {slot === 'active1' ? 'Slot 1 (Q)' : 'Slot 2 (E)'}
                  </div>
                  
                  {ability ? (
                    <>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                        {ability.icon}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#e2e8f0',
                        marginBottom: '4px'
                      }}>
                        {ability.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        textAlign: 'center'
                      }}>
                        {ability.desc}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#64748b',
                        marginTop: '8px'
                      }}>
                        Cooldown: {ability.cooldown}s
                      </div>
                    </>
                  ) : (
                    <div style={{
                      fontSize: '14px',
                      color: '#64748b',
                      fontStyle: 'italic'
                    }}>
                      Empty Slot
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Abilities */}
        {selectedSlot && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#e2e8f0',
              marginBottom: '16px'
            }}>
              Available Abilities (Click to Equip)
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}>
              {availableAbilities.map((ability) => (
                <div
                  key={ability.id}
                  onClick={() => handleEquip(ability.id)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '2px solid #475569',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#8b5cf6';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#475569';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                    {ability.icon}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#e2e8f0',
                    marginBottom: '4px'
                  }}>
                    {ability.name}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    marginBottom: '8px'
                  }}>
                    {ability.desc}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#64748b'
                  }}>
                    CD: {ability.cooldown}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onBack}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
