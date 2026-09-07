import React, { useState } from 'react';
import gsap from 'gsap';
import { useAudio } from '../hooks/useAudio';
import { useGameStore } from '../store/useGameStore';

export const BudgetChallenge = ({ onComplete }) => {
  const { playSFX } = useAudio();
  const { financialData } = useGameStore();
  
  // Get real income, default to 4000 if not available
  const realIncome = financialData?.income || 4000;
  
  // Round to nearest 100 for the mini-game mechanics
  const income = Math.max(1000, Math.round(realIncome / 100) * 100);
  
  const targetNeeds = income * 0.50; // 50%
  const targetWants = income * 0.30; // 30%
  const targetSavings = income * 0.20; // 20%
  
  const [allocated, setAllocated] = useState({ needs: 0, wants: 0, savings: 0 });
  const stepAmount = Math.round(income * 0.05); // 5% of income ensures 50%, 30%, and 20% are always perfectly reachable (10, 6, and 4 clicks respectively)

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
      alert(`Allocate all $${income} of your monthly income!`);
      return;
    }

    gsap.to('.budget-container', { scale: 0.9, opacity: 0, duration: 0.3, onComplete: () => onComplete(allocated) });
  };

  return (
    <div className="vn-dialogue-container">
      <div className="vn-dialogue-box speaker-sherpa">
        <div className="vn-speaker-badge sherpa">Sherpa</div>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', paddingRight: '10px' }}>
          
          <div className="vn-challenge-header">True Harbor: 50/30/20 Planner</div>
          <div className="vn-challenge-desc">Use True Harbor's framework to budget your ${income} Monthly Income.</div>
          
          <div className="vn-challenge-row">
            <span style={{fontSize: '18px'}}>Unallocated Cash:</span>
            <span style={{fontSize: '24px', fontWeight: 'bold', color: remaining === 0 ? '#4ade80' : '#fbbf24'}}>
              ${remaining}
            </span>
          </div>

          <div className="vn-challenge-row">
            <div>
              <div style={{fontWeight: 'bold', fontSize: '18px', color: '#fff'}}>Needs (50%)</div>
              <div style={{fontSize: '12px', color: '#94a3b8'}}>Housing, Groceries, Bills (Target: ${targetNeeds})</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
              <button style={{background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'}} onClick={() => handleAllocate('needs', -stepAmount)}>-</button>
              <span className="val-needs" style={{fontSize: '20px', width: '60px', textAlign: 'center', color: '#fff'}}>${allocated.needs}</span>
              <button style={{background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'}} onClick={() => handleAllocate('needs', stepAmount)}>+</button>
            </div>
          </div>

          <div className="vn-challenge-row">
            <div>
              <div style={{fontWeight: 'bold', fontSize: '18px', color: '#fff'}}>Wants (30%)</div>
              <div style={{fontSize: '12px', color: '#94a3b8'}}>Entertainment, Dining (Max: ${targetWants})</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
              <button style={{background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'}} onClick={() => handleAllocate('wants', -stepAmount)}>-</button>
              <span className="val-wants" style={{fontSize: '20px', width: '60px', textAlign: 'center', color: '#fff'}}>${allocated.wants}</span>
              <button style={{background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'}} onClick={() => handleAllocate('wants', stepAmount)}>+</button>
            </div>
          </div>

          <div className="vn-challenge-row">
            <div>
              <div style={{fontWeight: 'bold', fontSize: '18px', color: '#fff'}}>Savings & Debt (20%)</div>
              <div style={{fontSize: '12px', color: '#94a3b8'}}>Emergency Fund, Investments (Target: ${targetSavings})</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
              <button style={{background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'}} onClick={() => handleAllocate('savings', -stepAmount)}>-</button>
              <span className="val-savings" style={{fontSize: '20px', width: '60px', textAlign: 'center', color: '#fff'}}>${allocated.savings}</span>
              <button style={{background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'}} onClick={() => handleAllocate('savings', stepAmount)}>+</button>
            </div>
          </div>

          <button 
            className="vn-continue-btn"
            style={{ opacity: (remaining === 0 && allocated.needs === targetNeeds && allocated.savings >= targetSavings) ? 1 : 0.5, marginTop: '20px', width: '100%', textAlign: 'center' }} 
            onClick={handleSubmit}
          >
            Save True Harbor Budget
          </button>

        </div>
      </div>
    </div>
  );
};
