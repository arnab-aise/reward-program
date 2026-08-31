import React, { useState } from 'react';
import gsap from 'gsap';
import { useAudio } from '../hooks/useAudio';

export const DebtChallenge = ({ onComplete }) => {
  const { playSFX } = useAudio();
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const strategies = [
    {
      id: 'avalanche',
      name: 'The Avalanche Method',
      desc: 'Attack the steepest path first (highest interest rate). Mathematically saves the most resources over time.',
      icon: '🏔️',
      color: '#ef4444'
    },
    {
      id: 'snowball',
      name: 'The Snowball Method',
      desc: 'Clear the smallest boulders first (smallest balances) to build momentum. Good for psychological wins.',
      icon: '⛄',
      color: '#38bdf8'
    },
    {
      id: 'ignore',
      name: 'Ignore It (Risky)',
      desc: 'Just keep climbing and hope it doesn\'t bury you. Very dangerous.',
      icon: '🙈',
      color: '#94a3b8'
    }
  ];

  const handleSelect = (strat) => {
    playSFX('thud');
    setSelectedStrategy(strat.id);
    gsap.fromTo(`#strat-${strat.id}`, 
      { scale: 0.95, borderColor: '#fbbf24' }, 
      { scale: 1, borderColor: strat.color, duration: 0.3 }
    );
  };

  const handleSubmit = () => {
    playSFX('thud');
    if (!selectedStrategy) return;
    gsap.to('.debt-container', { scale: 0.9, opacity: 0, duration: 0.3, onComplete: () => onComplete(selectedStrategy) });
  };

  const styles = {
    wrapper: {
      padding: '20px',
      color: '#fff',
      fontFamily: "'Nunito', sans-serif",
      textAlign: 'left'
    },
    header: {
      fontSize: '22px', fontFamily: "'Rowdies', cursive", color: '#fca5a5',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)', marginBottom: '15px'
    },
    card: (isSelected, color) => ({
      background: isSelected ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)',
      border: `2px solid ${isSelected ? color : '#475569'}`,
      borderRadius: '8px', padding: '15px', marginBottom: '15px',
      cursor: 'pointer', transition: 'all 0.2s',
      boxShadow: isSelected ? `0 0 15px ${color}40` : 'none'
    }),
    cardTitle: {
      fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'
    },
    cardDesc: {
      fontSize: '14px', color: '#cbd5e1', marginTop: '8px', lineHeight: '1.4'
    },
    submitBtn: {
      backgroundImage: 'url(/ui_stone_bar.jpg)', backgroundSize: 'cover',
      color: '#4ade80', border: '2px solid #4ade80',
      padding: '15px', width: '100%', borderRadius: '8px',
      fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px',
      fontFamily: "'Rowdies', cursive",
      opacity: selectedStrategy ? 1 : 0.5
    }
  };

  return (
    <div className="debt-container" style={styles.wrapper}>
      <div style={styles.header}>Approaching the Avalanche</div>
      <p style={{marginBottom: '20px', fontSize: '16px'}}>
        High-interest debt is threatening to collapse on the trail. Choose a strategy to clear it safely.
      </p>

      {strategies.map(strat => (
        <div 
          key={strat.id} 
          id={`strat-${strat.id}`}
          style={styles.card(selectedStrategy === strat.id, strat.color)}
          onClick={() => handleSelect(strat)}
        >
          <div style={styles.cardTitle}>
            <span>{strat.icon}</span> <span style={{color: strat.color}}>{strat.name}</span>
          </div>
          <div style={styles.cardDesc}>{strat.desc}</div>
        </div>
      ))}

      <button style={styles.submitBtn} onClick={handleSubmit} disabled={!selectedStrategy}>
        Commit to Strategy
      </button>
    </div>
  );
};
