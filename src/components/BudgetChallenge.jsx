import React, { useState } from 'react';
import gsap from 'gsap';
import { useAudio } from '../hooks/useAudio';
import { useGameStore } from '../store/useGameStore';
import { createBudget } from '../services/financeService';

export const BudgetChallenge = ({ onComplete }) => {
  const { playSFX } = useAudio();
  const { employeeId } = useGameStore();
  
  const [formData, setFormData] = useState({
    name: 'Mountain Expedition Fund',
    amount: '500',
    category: 'savings_investments',
    frequency: 'monthly',
    threshold: '80'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playSFX('thud');
    
    if (!formData.name || !formData.amount || !formData.category || !formData.threshold) {
      setError('Please fill out all fields.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    // Auto-calculate start/end of current month for monthly frequency
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const payload = {
      name: formData.name,
      amount: Number(formData.amount),
      category: formData.category,
      frequency: formData.frequency,
      threshold: Number(formData.threshold),
      startDate,
      endDate
    };

    // If no employee ID is present (playing locally/testing without auth), just pass the challenge
    if (!employeeId) {
      setTimeout(() => {
        gsap.to('.budget-container', { scale: 0.9, opacity: 0, duration: 0.3, onComplete: () => onComplete(payload) });
      }, 500);
      return;
    }

    const res = await createBudget(employeeId, payload);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      gsap.to('.budget-container', { scale: 0.9, opacity: 0, duration: 0.3, onComplete: () => onComplete(payload) });
    }
  };

  return (
    <div className="vn-dialogue-container budget-container">
      <div className="vn-dialogue-box speaker-sherpa">
        <div className="vn-speaker-badge sherpa">Sherpa</div>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', paddingRight: '10px' }}>
          
          <div className="vn-challenge-header">Take Home Budget Planner</div>
          <div className="vn-challenge-desc" style={{ marginBottom: '15px' }}>
            Set a goal to protect your ascent. This will securely save a budget in your Take Home account.
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {error && <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{error}</div>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#94a3b8', fontSize: '14px' }}>Budget Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                style={{ padding: '8px', borderRadius: '4px', border: 'none', background: '#334155', color: 'white' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#94a3b8', fontSize: '14px' }}>Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                style={{ padding: '8px', borderRadius: '4px', border: 'none', background: '#334155', color: 'white' }}
              >
                <option value="savings_investments">Savings & Investments</option>
                <option value="housing">Housing</option>
                <option value="food_dining">Food & Dining</option>
                <option value="transportation">Transportation</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                <label style={{ color: '#94a3b8', fontSize: '14px' }}>Amount ($)</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={formData.amount} 
                  onChange={handleChange}
                  min="1"
                  style={{ padding: '8px', borderRadius: '4px', border: 'none', background: '#334155', color: 'white' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                <label style={{ color: '#94a3b8', fontSize: '14px' }}>Alert Threshold (%)</label>
                <input 
                  type="number" 
                  name="threshold" 
                  value={formData.threshold} 
                  onChange={handleChange}
                  min="1" max="100"
                  style={{ padding: '8px', borderRadius: '4px', border: 'none', background: '#334155', color: 'white' }}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="vn-continue-btn"
              disabled={isSubmitting}
              style={{ marginTop: '10px', width: '100%', textAlign: 'center', opacity: isSubmitting ? 0.5 : 1 }} 
            >
              {isSubmitting ? 'Securing rope...' : 'Create Take Home Budget'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
