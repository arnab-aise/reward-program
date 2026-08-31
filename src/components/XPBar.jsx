import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../store/useGameStore';

export const XPBar = () => {
  const { currentXP } = useGameStore();
  const barRef = useRef(null);
  const textRef = useRef(null);
  const [displayXP, setDisplayXP] = useState(0);

  // We define a max XP for a visual scale (e.g. 5000 XP max for the entire mountain)
  const MAX_XP = 5000;

  useEffect(() => {
    const targetWidth = Math.min(100, (currentXP / MAX_XP) * 100);
    
    // Animate the physical bar width
    gsap.to(barRef.current, {
      width: `${targetWidth}%`,
      duration: 1.5,
      ease: 'power3.out'
    });

    // Animate the number counting up
    const dummyObj = { val: displayXP };
    gsap.to(dummyObj, {
      val: currentXP,
      duration: 1.5,
      ease: 'power3.out',
      onUpdate: () => {
        setDisplayXP(Math.round(dummyObj.val));
      }
    });
  }, [currentXP]);

  const styles = {
    container: {
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80%',
      maxWidth: '600px',
      backgroundColor: 'rgba(30, 41, 59, 0.8)',
      borderRadius: '20px',
      padding: '8px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
      zIndex: 50,
      backdropFilter: 'blur(10px)',
      border: '1px solid #334155'
    },
    barBackground: {
      position: 'relative',
      height: '12px',
      backgroundColor: '#0f172a',
      borderRadius: '10px',
      overflow: 'hidden',
    },
    barFill: {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: '0%', // Start at 0, let GSAP handle it
      background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
      borderRadius: '10px',
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '6px',
      padding: '0 5px'
    },
    title: {
      color: '#94a3b8',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    value: {
      color: '#fff',
      fontSize: '14px',
      fontWeight: '900',
      fontFamily: 'monospace'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Climber XP</span>
        <span style={styles.value} ref={textRef}>{displayXP} / {MAX_XP}</span>
      </div>
      <div style={styles.barBackground}>
        <div ref={barRef} style={styles.barFill}></div>
      </div>
    </div>
  );
};
