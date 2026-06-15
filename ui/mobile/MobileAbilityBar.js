'use client';
import { ABILITIES } from '../../src/app/game/GameEngine';

export default function MobileAbilityBar({ state, engine }) {
  const { dashReady, bombReady, bombDmg, ability1Ready, ability2Ready, ability1, ability2 } = state;

  const buttonStyle = (ready) => ({
    background: ready ? 'rgba(15, 23, 42, 0.95)' : 'rgba(0, 0, 0, 0.6)',
    border: `2px solid ${ready ? 'rgba(139, 92, 246, 0.6)' : 'rgba(55, 65, 81, 0.4)'}`,
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    minWidth: '44px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: ready ? 'pointer' : 'not-allowed',
    opacity: ready ? 1 : 0.5,
    transition: 'all 0.2s',
    boxShadow: ready ? '0 0 15px rgba(139, 92, 246, 0.4)' : 'none',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent'
  });

  const ability1Data = ability1 ? ABILITIES.find(a => a.id === ability1) : null;
  const ability2Data = ability2 ? ABILITIES.find(a => a.id === ability2) : null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 100
    }}>
      {/* Ability 1 */}
      {ability1Data && (
        <button
          onClick={() => engine?.useAbility('active1')}
          style={buttonStyle(ability1Ready)}
          disabled={!ability1Ready}
        >
          <span style={{ fontSize: '24px' }}>{ability1Data.icon}</span>
        </button>
      )}

      {/* Ability 2 */}
      {ability2Data && (
        <button
          onClick={() => engine?.useAbility('active2')}
          style={buttonStyle(ability2Ready)}
          disabled={!ability2Ready}
        >
          <span style={{ fontSize: '24px' }}>{ability2Data.icon}</span>
        </button>
      )}

      {/* Dash */}
      <button
        onClick={() => engine?.dash()}
        style={buttonStyle(dashReady)}
        disabled={!dashReady}
      >
        <span style={{ fontSize: '24px' }}>💨</span>
      </button>

      {/* Bomb */}
      {bombDmg > 0 && (
        <button
          onClick={() => engine?.useBomb()}
          style={buttonStyle(bombReady)}
          disabled={!bombReady}
        >
          <span style={{ fontSize: '24px' }}>💣</span>
        </button>
      )}
    </div>
  );
}
