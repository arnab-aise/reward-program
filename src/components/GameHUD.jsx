import React from 'react';
import { useGameStore } from '../store/useGameStore';
import gsap from 'gsap';

export const GameHUD = () => {
  const { coins, energy, currentLevel, inventory } = useGameStore();

  const toolImages = {
    emergency_shield: '/icon_shield.jpg',
    compound_sword: '/icon_sword.jpg',
    budget_planner: '/icon_rope.jpg',
    diversification_map: '/icon_map.jpg'
  };

  const styles = {
    container: {
      position: 'absolute',
      top: '10px',
      left: '10px',
      right: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100,
      backgroundImage: 'url(/ui_stone_bar.jpg)',
      backgroundSize: '100% 100%',
      padding: '10px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.8)'
    },
    profileBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    avatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      border: '3px solid #cbd5e1',
      boxShadow: '0 0 10px rgba(0,0,0,0.8)',
      backgroundImage: 'url(/portrait_mountaineer.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'top center'
    },
    levelText: {
      color: '#f8fafc',
      fontFamily: "'Rowdies', cursive",
      fontSize: '22px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.9)'
    },
    inventoryContainer: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    inventorySlot: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      backgroundColor: 'rgba(0,0,0,0.5)',
      border: '2px solid #475569',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    },
    inventoryIcon: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    statsContainer: {
      display: 'flex',
      gap: '15px',
    },
    statPill: {
      display: 'flex',
      alignItems: 'center',
      color: '#fff',
      fontFamily: "'Rowdies', cursive",
      fontSize: '22px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.9)'
    },
    icon: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      marginRight: '8px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.8)'
    }
  };

  const prevCoins = React.useRef(coins);
  const coinIconRef = React.useRef(null);
  const [floatText, setFloatText] = React.useState(null);

  React.useEffect(() => {
    if (coins > prevCoins.current) {
      const diff = coins - prevCoins.current;
      setFloatText(`+${diff}`);
      
      if (coinIconRef.current) {
        gsap.fromTo(coinIconRef.current, 
          { scale: 1.8, rotation: -30 }, 
          { scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" }
        );
      }
      
      setTimeout(() => setFloatText(null), 1500);
    }
    prevCoins.current = coins;
  }, [coins]);

  const inventorySlots = [0, 1, 2, 3].map(i => inventory[i]);

  return (
    <div style={styles.container}>
      <div style={styles.profileBadge}>
        <div style={styles.avatar}></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={styles.levelText}>LVL {currentLevel + 1}</div>
          <div style={{
            color: '#94a3b8',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {currentLevel === 0 && '15,000 ft'}
            {currentLevel === 1 && '18,000 ft'}
            {currentLevel === 2 && '21,000 ft'}
            {currentLevel === 3 && '25,000 ft'}
            {currentLevel === 4 && '29,029 ft'}
          </div>
        </div>
      </div>
      
      <div style={styles.inventoryContainer}>
        {inventorySlots.map((item, index) => (
          <div key={index} style={styles.inventorySlot}>
            {item && <img src={toolImages[item]} alt={item} style={styles.inventoryIcon} />}
          </div>
        ))}
      </div>

      <div style={styles.statsContainer}>
        <div style={{ ...styles.statPill, color: '#38bdf8' }}>
          <img src="/icon_energy.jpg" alt="Energy" style={styles.icon} /> 
          {energy}/5
        </div>
        <div style={{ ...styles.statPill, color: '#fbbf24', position: 'relative' }}>
          <img ref={coinIconRef} src="/icon_coin.jpg" alt="Coins" style={styles.icon} /> 
          {coins}
          
          {/* Floating Reward Text */}
          {floatText && (
            <div style={{
              position: 'absolute',
              top: '-30px',
              left: '10px',
              color: '#fbbf24',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: '0 2px 5px rgba(0,0,0,1)',
              animation: 'floatUpAndFade 1.5s forwards'
            }}>
              {floatText}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes floatUpAndFade {
          0% { opacity: 0; transform: translateY(10px) scale(0.5); }
          20% { opacity: 1; transform: translateY(-10px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-40px) scale(1); }
        }
      `}</style>
    </div>
  );
};
