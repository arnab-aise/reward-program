import React, { useState } from 'react';
import gsap from 'gsap';
import { useAudio } from '../hooks/useAudio';

export const BudgetChallenge = ({ onComplete }) => {
  const { playSFX } = useAudio();
  const income = 4000;
  const targetNeeds = 2000; // 50% of 4000
  const targetWants = 1200; // 30% of 4000
  const targetSavings = 800; // 20% of 4000
  const [allocated, setAllocated] = useState({ needs: 0, wants: 0, savings: 0 });

  const totalAllocated = allocated.needs + allocated.wants + allocated.savings;
  const remaining = income - totalAllocated;

  const handleAllocate = (category, amount) => {
    playSFX('thud');
    if (allocated[category] + amount < 0) return;
    if (remaining - amount < 0 && amount > 0) return; // Cannot over-allocate
    
    setAllocated(prev => ({ ...prev, [category]: prev[category] + amount }));
    
    // UI Juice
    gsap.fromTo(`.val-${category}`, 
      { scale: 1.3, color: '#fbbf24' }, 
      { scale: 1, color: '#f8fafc', duration: 0.3 }
    );
  };

  const handleSubmit = () => {
    playSFX('thud');
    if (allocated.needs !== targetNeeds) {
      alert(`The 50/30/20 rule requires exactly $${targetNeeds} allocated to Needs!`);
      return;
    }
    if (allocated.wants > targetWants) {
      alert(`The 50/30/20 rule allows a maximum of $${targetWants} for Wants!`);
      return;
    }
    if (allocated.savings < targetSavings) {
      alert(`The 50/30/20 rule requires at least $${targetSavings} allocated to Savings/Debt!`);
      return;
    }
    if (remaining > 0) {
      alert("Allocate all $4000 of your monthly income!");
      return;
    }

    gsap.to('.budget-container', { scale: 0.9, opacity: 0, duration: 0.3, onComplete: () => onComplete(allocated) });
  };

  const styles = {
    wrapper: {
      padding: '20px',
      color: '#fff',
      fontFamily: "'Nunito', sans-serif"
    },
    header: {
      fontSize: '22px', fontFamily: "'Rowdies', cursive", color: '#fde047',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)', marginBottom: '20px'
    },
    supplyBox: {
      background: 'rgba(0,0,0,0.4)', border: '2px solid #64748b',
      borderRadius: '8px', padding: '15px', marginBottom: '20px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    categoryRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(0,0,0,0.5)', padding: '10px 15px',
      borderRadius: '8px', border: '1px solid #475569', marginBottom: '10px'
    },
    btn: {
      background: '#334155', color: '#fff', border: 'none', borderRadius: '4px',
      width: '30px', height: '30px', cursor: 'pointer', fontSize: '18px',
      fontWeight: 'bold'
    },
    submitBtn: {
      backgroundImage: 'url(/ui_stone_bar.jpg)', backgroundSize: 'cover',
      color: '#4ade80', border: '2px solid #4ade80',
      padding: '15px', width: '100%', borderRadius: '8px',
      fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px',
      fontFamily: "'Rowdies', cursive"
    }
  };

  return (
    <div className="budget-container" style={styles.wrapper}>
      <div style={styles.header}>True Harbor: 50/30/20 Planner</div>
      <p style={{marginBottom: '20px'}}>Use True Harbor's framework to budget your $4,000 Monthly Income.</p>
      
      <div style={styles.supplyBox}>
        <span style={{fontSize: '18px'}}>Unallocated Cash:</span>
        <span style={{fontSize: '24px', fontWeight: 'bold', color: remaining === 0 ? '#4ade80' : '#fbbf24'}}>
          ${remaining}
        </span>
      </div>

      <div style={styles.categoryRow}>
        <div>
          <div style={{fontWeight: 'bold', fontSize: '18px'}}>Needs (50%)</div>
          <div style={{fontSize: '12px', color: '#94a3b8'}}>Housing, Groceries, Bills (Target: ${targetNeeds})</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button style={styles.btn} onClick={() => handleAllocate('needs', -100)}>-</button>
          <span className="val-needs" style={{fontSize: '20px', width: '60px', textAlign: 'center'}}>${allocated.needs}</span>
          <button style={styles.btn} onClick={() => handleAllocate('needs', 100)}>+</button>
        </div>
      </div>

      <div style={styles.categoryRow}>
        <div>
          <div style={{fontWeight: 'bold', fontSize: '18px'}}>Wants (30%)</div>
          <div style={{fontSize: '12px', color: '#94a3b8'}}>Entertainment, Dining (Max: ${targetWants})</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button style={styles.btn} onClick={() => handleAllocate('wants', -100)}>-</button>
          <span className="val-wants" style={{fontSize: '20px', width: '60px', textAlign: 'center'}}>${allocated.wants}</span>
          <button style={styles.btn} onClick={() => handleAllocate('wants', 100)}>+</button>
        </div>
      </div>

      <div style={styles.categoryRow}>
        <div>
          <div style={{fontWeight: 'bold', fontSize: '18px'}}>Savings & Debt (20%)</div>
          <div style={{fontSize: '12px', color: '#94a3b8'}}>Emergency Fund, Investments (Target: ${targetSavings})</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button style={styles.btn} onClick={() => handleAllocate('savings', -100)}>-</button>
          <span className="val-savings" style={{fontSize: '20px', width: '60px', textAlign: 'center'}}>${allocated.savings}</span>
          <button style={styles.btn} onClick={() => handleAllocate('savings', 100)}>+</button>
        </div>
      </div>

      <button 
        style={{...styles.submitBtn, opacity: (remaining === 0 && allocated.needs === targetNeeds && allocated.savings >= targetSavings) ? 1 : 0.5}} 
        onClick={handleSubmit}
      >
        Save True Harbor Budget
      </button>
    </div>
  );
};
