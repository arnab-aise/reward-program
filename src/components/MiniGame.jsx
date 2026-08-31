import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export const MiniGame = ({ onWin }) => {
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState([]);
  const containerRef = useRef(null);
  
  const targetScore = 10;

  // Spawner
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prev => [...prev, { id: Date.now(), x: Math.random() * 80 + 10 }]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Check Win Condition
  useEffect(() => {
    if (score >= targetScore) {
      setTimeout(onWin, 500); // slight delay before closing
    }
  }, [score, onWin]);

  const catchCoin = (id, e) => {
    e.stopPropagation();
    
    // Play particle effect
    const btn = e.currentTarget;
    gsap.to(btn, { scale: 0, opacity: 0, duration: 0.2 });
    
    setScore(prev => prev + 1);
    
    // Remove coin from state after animation
    setTimeout(() => {
      setCoins(prev => prev.filter(c => c.id !== id));
    }, 200);
  };

  const styles = {
    container: {
      width: '100%',
      height: '300px',
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      border: '4px inset #334155',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'crosshair',
      boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.8)'
    },
    header: {
      position: 'absolute',
      top: '10px',
      left: '10px',
      color: '#fff',
      fontFamily: "'Rowdies', cursive",
      fontSize: '20px',
      zIndex: 10,
      textShadow: '0 2px 4px rgba(0,0,0,0.8)'
    },
    coin: {
      position: 'absolute',
      top: '-40px',
      width: '40px',
      height: '40px',
      backgroundColor: '#fbbf24',
      border: '4px solid #b45309',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '20px',
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
      userSelect: 'none'
    }
  };

  return (
    <div style={styles.container} ref={containerRef}>
      <div style={styles.header}>
        Saved: {score} / {targetScore} 🪙
      </div>
      
      {coins.map(coin => (
        <Coin 
          key={coin.id} 
          x={coin.x} 
          onCatch={(e) => catchCoin(coin.id, e)} 
        />
      ))}
    </div>
  );
};

// Extracted Coin component to handle its own falling animation
const Coin = ({ x, onCatch }) => {
  const coinRef = useRef(null);
  
  useEffect(() => {
    // Fall animation
    gsap.to(coinRef.current, {
      y: 350,
      duration: 2.5 + Math.random(),
      ease: "power1.in",
      onComplete: () => {
        // Coin missed
        if (coinRef.current) {
          gsap.set(coinRef.current, { display: 'none' });
        }
      }
    });
    
    // Spin animation
    gsap.to(coinRef.current, {
      rotationY: 360,
      duration: 0.5,
      repeat: -1,
      ease: "linear"
    });
  }, []);

  return (
    <div 
      ref={coinRef}
      onPointerDown={onCatch}
      style={{
        position: 'absolute',
        top: '-40px',
        left: `${x}%`,
        width: '45px',
        height: '45px',
        backgroundColor: '#fbbf24',
        border: '3px solid #d97706',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.6)',
        userSelect: 'none',
        zIndex: 5
      }}
    >
      $
    </div>
  );
};
