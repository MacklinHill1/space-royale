'use client';

export default function EquipmentPickupNotification({ notifications }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 1000,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '300px'
    }}>
      {notifications.map((notif, idx) => {
        const opacity = Math.min(notif.life / 30, 1);
        const translateY = -idx * 60;
        
        return (
          <div
            key={notif.id}
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: `2px solid ${notif.color}`,
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#f1f5f9',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: `0 4px 12px ${notif.color}44`,
              opacity,
              transform: `translateY(${translateY}px)`,
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(8px)'
            }}
          >
            {notif.message}
          </div>
        );
      })}
    </div>
  );
}
