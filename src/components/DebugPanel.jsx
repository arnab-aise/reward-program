import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const DebugPanel = ({ onClose }) => {
  const { 
    coins,
    energy,
    weatherState,
    recommendedBranch,
    unlockedRewards, 
    financialHealthScore, 
    inventory,
    activeStageModal,
    unlockReward,
    setWeatherState,
    setRecommendedBranch,
    setSherpaMessage,
    setFinancialData,
    computeStageWeather,
    addCoins,
    deductEnergy,
    resetGame
  } = useGameStore();

  const styles = {
    panel: {
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: '#00ff00',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      width: '320px',
      maxHeight: '70vh',
      overflowY: 'auto',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    },
    header: {
      margin: '0 0 10px 0',
      paddingBottom: '5px',
      borderBottom: '1px solid #333',
      color: '#fff',
    },
    sectionTitle: {
      margin: '10px 0 5px 0',
      color: '#fbbf24',
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    section: {
      marginBottom: '8px',
    },
    button: {
      backgroundColor: '#333',
      color: '#fff',
      border: '1px solid #555',
      padding: '4px 8px',
      margin: '2px',
      cursor: 'pointer',
      borderRadius: '4px',
      fontSize: '11px',
    },
    activeButton: {
      backgroundColor: '#16a34a',
      color: '#fff',
      border: '1px solid #4ade80',
      padding: '4px 8px',
      margin: '2px',
      cursor: 'pointer',
      borderRadius: '4px',
      fontSize: '11px',
    },
    label: {
      display: 'inline-block',
      width: '130px',
      color: '#aaa',
    },
    value: {
      color: '#fff',
      fontWeight: 'bold',
    }
  };

  return (
    <div style={styles.panel}>
      <div style={{ ...styles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>🔧 Dev Debug Panel</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', padding: '0 4px' }}>✕</button>
      </div>
      
      {/* --- Weather Testing --- */}
      <div style={styles.sectionTitle}>☁️ Weather (Per-Stage)</div>
      <div style={styles.section}>
        <div><span style={styles.label}>Current:</span> <span style={styles.value}>{weatherState === 'sunrise' ? '☀️ Sunrise' : weatherState === 'fog' ? '🌫️ Fog' : '⛈️ Storm'}</span></div>
        <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '5px' }}>Weather changes automatically when you open each stage. Manual override below:</div>
        <button style={weatherState === 'sunrise' ? styles.activeButton : styles.button} onClick={() => { setWeatherState('sunrise'); setSherpaMessage('☀️ [Override] Clear skies! Your finances are healthy for this stage.'); }}>☀️ Sunrise</button>
        <button style={weatherState === 'fog' ? styles.activeButton : styles.button} onClick={() => { setWeatherState('fog'); setSherpaMessage('🌫️ [Override] Fog — some financial metrics need attention at this stage. Extra energy needed at high altitude.'); }}>🌫️ Fog</button>
        <button style={weatherState === 'storm' ? styles.activeButton : styles.button} onClick={() => { setWeatherState('storm'); setSherpaMessage('⛈️ [Override] Storm! Financial conditions are dangerous here. Visit the Sherpa Shop or improve your finances in Take Home.'); }}>⛈️ Storm</button>
      </div>

      {/* --- Branch Testing --- */}
      <div style={styles.sectionTitle}>🔀 Branch Recommendation</div>
      <div style={styles.section}>
        <div><span style={styles.label}>Recommended:</span> <span style={styles.value}>{recommendedBranch === 'aggressive_cliff' ? '⚔️ Aggressive Cliff' : recommendedBranch === 'steady_trail' ? '🛡️ Steady Trail' : '— None'}</span></div>
        <button style={recommendedBranch === 'aggressive_cliff' ? styles.activeButton : styles.button} onClick={() => setRecommendedBranch('aggressive_cliff')}>⚔️ Debt-Heavy</button>
        <button style={recommendedBranch === 'steady_trail' ? styles.activeButton : styles.button} onClick={() => setRecommendedBranch('steady_trail')}>🛡️ Savings-Focused</button>
        <button style={!recommendedBranch ? styles.activeButton : styles.button} onClick={() => setRecommendedBranch(null)}>❌ None</button>
      </div>

      {/* --- Simulate Financial Profiles --- */}
      <div style={styles.sectionTitle}>📊 Simulate Financial Profile</div>
      <div style={styles.section}>
        <button style={styles.button} onClick={() => {
          const healthyMetrics = { tdi: 500, income: 4000, overdueBillsCount: 0, salaryBillRatio: 30, budgetHealth: 'on_track' };
          setFinancialData(healthyMetrics, { tdi: '500' });
          setRecommendedBranch('steady_trail');
          if (activeStageModal) computeStageWeather(activeStageModal, healthyMetrics, inventory);
          else { setWeatherState('sunrise'); setSherpaMessage('☀️ [Simulated Profile] Healthy finances loaded. Click a node to see specific weather!'); }
        }}>✅ Healthy (Sunrise + Steady)</button>
        <button style={styles.button} onClick={() => {
          const riskMetrics = { tdi: 100, income: 4000, overdueBillsCount: 1, salaryBillRatio: 55, budgetHealth: 'warning' };
          setFinancialData(riskMetrics, { tdi: '100' });
          setRecommendedBranch('aggressive_cliff');
          if (activeStageModal) computeStageWeather(activeStageModal, riskMetrics, inventory);
          else { setWeatherState('fog'); setSherpaMessage('🌫️ [Simulated Profile] At Risk finances loaded. Click a node to see specific weather!'); }
        }}>⚠️ At Risk (Fog + Aggressive)</button>
        <button style={styles.button} onClick={() => {
          const troubleMetrics = { tdi: -200, income: 4000, overdueBillsCount: 3, salaryBillRatio: 75, budgetHealth: 'over_budget' };
          setFinancialData(troubleMetrics, { tdi: '-200' });
          setRecommendedBranch('aggressive_cliff');
          if (activeStageModal) computeStageWeather(activeStageModal, troubleMetrics, inventory);
          else { setWeatherState('storm'); setSherpaMessage('⛈️ [Simulated Profile] In Trouble finances loaded. Click a node to see specific weather!'); }
        }}>🔴 In Trouble (Storm + Aggressive)</button>
      </div>

      {/* --- Resources --- */}
      <div style={styles.sectionTitle}>💰 Resources</div>
      <div style={styles.section}>
        <div><span style={styles.label}>Coins:</span> <span style={styles.value}>{coins}</span></div>
        <div><span style={styles.label}>Energy:</span> <span style={styles.value}>{energy}</span></div>
        <button style={styles.button} onClick={() => addCoins(100)}>+100 Coins</button>
        <button style={styles.button} onClick={() => addCoins(500)}>+500 Coins</button>
      </div>

      <div style={styles.section}>
        <div><span style={styles.label}>Health Score:</span> <span style={styles.value}>{financialHealthScore}</span></div>
        <div><span style={styles.label}>Rewards:</span> <span style={styles.value}>{unlockedRewards.length} unlocked</span></div>
        <button style={styles.button} onClick={() => unlockReward(`reward_${Date.now().toString().slice(-4)}`)}>Unlock Random</button>
      </div>

      <div style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '10px' }}>
        <button style={{...styles.button, backgroundColor: '#600', width: '100%'}} onClick={resetGame}>Reset Game State</button>
      </div>
    </div>
  );
};
