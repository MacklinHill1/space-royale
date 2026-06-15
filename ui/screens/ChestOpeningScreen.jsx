'use client';
import { useState } from 'react';

export default function ChestOpeningScreen({ chest, onClose, onTakeItem }) {
  const [selectedItems, setSelectedItems] = useState([]);

  if (!chest) return null;

  const rarityColors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
  };

  const toggleItem = (item) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleTakeSelected = () => {
    selectedItems.forEach(item => onTakeItem(item));
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '2px solid #fbbf24',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 0 40px rgba(251, 191, 36, 0.3)'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#fbbf24',
          marginBottom: '24px',
          textAlign: 'center',
          textShadow: '0 0 20px rgba(251, 191, 36, 0.5)'
        }}>
          🎁 Treasure Chest
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {chest.contents.map((item) => {
            const isSelected = selectedItems.find(i => i.id === item.id);
            const color = rarityColors[item.rarity];
            
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item)}
                style={{
                  background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                  border: `2px solid ${isSelected ? '#8b5cf6' : color}`,
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  boxShadow: isSelected ? `0 0 20px ${color}66` : 'none',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div style={{
                  fontSize: '32px',
                  marginBottom: '8px'
                }}>
                  {item.rarity === 'legendary' ? '👑' : 
                   item.rarity === 'epic' ? '💎' :
                   item.rarity === 'rare' ? '⭐' : '📦'}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color,
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}>
                  {item.rarity}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#e2e8f0'
                }}>
                  {item.name}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleTakeSelected}
            disabled={selectedItems.length === 0}
            style={{
              padding: '12px 32px',
              background: selectedItems.length > 0 
                ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                : '#374151',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              opacity: selectedItems.length > 0 ? 1 : 0.5
            }}
          >
            Take Selected ({selectedItems.length})
          </button>
          
          <button
            onClick={onClose}
            style={{
              padding: '12px 32px',
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
    </div>
  );
}
