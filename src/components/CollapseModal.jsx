import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAudio } from '../hooks/useAudio';
import gsap from 'gsap';

export const CollapseModal = () => {
  const { coins, inventory, recoverFromCollapse, hasCollapsed } = useGameStore();
  const { playSFX } = useAudio();
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!hasCollapsed) return;
    playSFX('error');
    
    gsap.fromTo(overlayRef.current, 
      { backgroundColor: 'rgba(0,0,0,0)' },
      { backgroundColor: 'rgba(15,23,42,0.9)', duration: 0.5 }
    );
    
    gsap.fromTo(contentRef.current,
      { y: 50, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
    );
  }, [playSFX]);

  const hasShield = inventory.includes('emergency_shield');
  const canAffordSherpa = coins >= 50;

  if (!hasCollapsed) return null;

  const handleRecover = (option) => {
    playSFX('thud');
    gsap.to(contentRef.current, { scale: 0.9, opacity: 0, duration: 0.3 });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, onComplete: () => {
      if (option === 'shield') {
        recoverFromCollapse(3, 0, false);
      } else if (option === 'sherpa') {
        recoverFromCollapse(3, 50, false);
      } else if (option === 'reset') {
        // Punishing reset: lose all progress, start at base camp with 5 energy.
        recoverFromCollapse(5, 0, true);
      }
    }});
  };

  return (
    <div 
      ref={overlayRef}
      style={{
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px) grayscale(50%)'
      }}
    >
      <div 
        ref={contentRef}
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: '2px solid #38bdf8',
          borderRadius: '20px',
          padding: '2.5rem',
          maxWidth: '500px',
          width: '90%',
          color: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.3)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🥶</div>
        <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0', fontFamily: "'Rowdies', cursive", color: '#f8fafc' }}>
          You Collapsed!
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '2rem' }}>
          The air is thin and you have run out of Liquidity (Energy). You cannot climb any further without assistance.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {hasShield ? (
            <button 
              onClick={() => handleRecover('shield')}
              style={{
                background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                border: 'none', borderRadius: '12px', padding: '1rem',
                color: 'white', fontWeight: 'bold', fontSize: '1.1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🛡️</span> Use Emergency Shield (Restores 3 ⚡)
            </button>
          ) : (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', color: '#64748b', fontSize: '0.9rem' }}>
              You don't have an Emergency Shield.
            </div>
          )}

          {canAffordSherpa ? (
            <button 
              onClick={() => handleRecover('sherpa')}
              style={{
                background: 'linear-gradient(to right, #eab308, #ca8a04)',
                border: 'none', borderRadius: '12px', padding: '1rem',
                color: 'white', fontWeight: 'bold', fontSize: '1.1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>💰</span> Pay Sherpa Rescue (-50 Coins)
            </button>
          ) : (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', color: '#64748b', fontSize: '0.9rem' }}>
              You don't have enough coins for a Sherpa Rescue (Requires 50).
            </div>
          )}

          {(!hasShield && !canAffordSherpa) && (
            <button 
              onClick={() => handleRecover('reset')}
              style={{
                background: 'linear-gradient(to right, #ef4444, #dc2626)',
                border: 'none', borderRadius: '12px', padding: '1rem',
                color: 'white', fontWeight: 'bold', fontSize: '1.1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                marginTop: '1rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🚑</span> Carried to Base Camp (Lose Progress)
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
