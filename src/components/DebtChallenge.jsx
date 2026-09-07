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

  return (
    <div className="vn-dialogue-container">
      <div className="vn-dialogue-box speaker-sherpa">
        <div className="vn-speaker-badge sherpa">Sherpa</div>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', paddingRight: '10px' }}>
          
          <div className="vn-challenge-header" style={{color: '#fca5a5'}}>Approaching the Avalanche</div>
          <div className="vn-challenge-desc">
            High-interest debt is threatening to collapse on the trail. Choose a strategy to clear it safely.
          </div>

          {strategies.map(strat => (
            <div 
              key={strat.id} 
              id={`strat-${strat.id}`}
              className="vn-challenge-card"
              style={{
                background: selectedStrategy === strat.id ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)',
                border: `2px solid ${selectedStrategy === strat.id ? strat.color : '#475569'}`,
                boxShadow: selectedStrategy === strat.id ? `0 0 15px ${strat.color}40` : 'none'
              }}
              onClick={() => handleSelect(strat)}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{strat.icon}</span> <span style={{color: strat.color}}>{strat.name}</span>
              </div>
              <div style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '8px', lineHeight: '1.4' }}>{strat.desc}</div>
            </div>
          ))}

          <button 
            className="vn-continue-btn"
            style={{ opacity: selectedStrategy ? 1 : 0.5, marginTop: '10px', width: '100%', textAlign: 'center' }} 
            onClick={handleSubmit} 
            disabled={!selectedStrategy}
          >
            Commit to Strategy
          </button>

        </div>
      </div>
    </div>
  );
};
