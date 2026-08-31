import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../store/useGameStore';

export const RewardCard = () => {
  const { unlockedRewards } = useGameStore();
  const [activeReward, setActiveReward] = useState(null);
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  // Track changes to unlockedRewards array length
  const prevRewardsLength = useRef(unlockedRewards.length);

  useEffect(() => {
    if (unlockedRewards.length > prevRewardsLength.current) {
      // New reward unlocked!
      const newReward = unlockedRewards[unlockedRewards.length - 1];
      setActiveReward(newReward);
      prevRewardsLength.current = unlockedRewards.length;
    }
  }, [unlockedRewards]);

  useEffect(() => {
    if (activeReward && containerRef.current && cardRef.current) {
      const ctx = gsap.context(() => {
        // Overlay fade in
        gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
        
        // Card burst animation
        gsap.fromTo(cardRef.current, 
          { scale: 0, rotationY: -180 }, 
          { scale: 1, rotationY: 0, duration: 1, ease: 'back.out(1.5)' }
        );

        // Spin rays
        gsap.to('.reward-rays', {
          rotation: 360,
          duration: 10,
          repeat: -1,
          ease: 'linear'
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, [activeReward]);

  const closeReward = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => setActiveReward(null)
    });
  };

  if (!activeReward) return null;

  const styles = {
    overlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
      perspective: '1000px'
    },
    card: {
      position: 'relative',
      width: '280px',
      height: '400px',
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: '20px',
      border: '2px solid #fbbf24',
      boxShadow: '0 0 30px rgba(251, 191, 36, 0.4)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      cursor: 'pointer'
    },
    rays: {
      position: 'absolute',
      width: '600px',
      height: '600px',
      background: 'conic-gradient(from 0deg, transparent 0%, rgba(251, 191, 36, 0.2) 10%, transparent 20%, rgba(251, 191, 36, 0.2) 30%, transparent 40%, rgba(251, 191, 36, 0.2) 50%, transparent 60%, rgba(251, 191, 36, 0.2) 70%, transparent 80%, rgba(251, 191, 36, 0.2) 90%, transparent 100%)',
      zIndex: -1,
      pointerEvents: 'none'
    },
    title: {
      color: '#fbbf24',
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center'
    },
    text: {
      color: '#fff',
      fontSize: '16px',
      textAlign: 'center'
    }
  };

  return (
    <div ref={containerRef} style={styles.overlay} onClick={closeReward}>
      <div className="reward-rays" style={styles.rays} />
      <div ref={cardRef} style={styles.card}>
        <div style={styles.title}>LOOT UNLOCKED!</div>
        <div style={styles.text}>{activeReward}</div>
        <div style={{ marginTop: '40px', color: '#64748b', fontSize: '12px' }}>(Click to collect)</div>
      </div>
    </div>
  );
};
