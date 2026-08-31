import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const DebugPanel = () => {
  const { 
    currentXP, 
    currentLevel, 
    unlockedRewards, 
    financialHealthScore, 
    loginStreak,
    addXP,
    setLevel,
    unlockReward,
    setHealthScore,
    incrementStreak,
    resetGame
  } = useGameStore();

  const styles = {
    panel: {
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#00ff00',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      width: '300px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    },
    header: {
      margin: '0 0 10px 0',
      paddingBottom: '5px',
      borderBottom: '1px solid #333',
      color: '#fff',
    },
    section: {
      marginBottom: '10px',
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
    label: {
      display: 'inline-block',
      width: '120px',
      color: '#aaa',
    },
    value: {
      color: '#fff',
      fontWeight: 'bold',
    }
  };

  return (
    <div style={styles.panel}>
      <h3 style={styles.header}>🔧 Dev Debug Panel</h3>
      
      <div style={styles.section}>
        <div><span style={styles.label}>XP:</span> <span style={styles.value}>{currentXP}</span></div>
        <button style={styles.button} onClick={() => addXP(100)}>+100 XP</button>
        <button style={styles.button} onClick={() => addXP(500)}>+500 XP</button>
      </div>

      <div style={styles.section}>
        <div><span style={styles.label}>Level:</span> <span style={styles.value}>{currentLevel}</span></div>
        <button style={styles.button} onClick={() => setLevel(Math.max(0, currentLevel - 1))}>-1 Lvl</button>
        <button style={styles.button} onClick={() => setLevel(Math.min(4, currentLevel + 1))}>+1 Lvl</button>
      </div>

      <div style={styles.section}>
        <div><span style={styles.label}>Health Score:</span> <span style={styles.value}>{financialHealthScore}</span></div>
        <button style={styles.button} onClick={() => setHealthScore(100)}>Good (100)</button>
        <button style={styles.button} onClick={() => setHealthScore(50)}>Avg (50)</button>
        <button style={styles.button} onClick={() => setHealthScore(10)}>Bad (10)</button>
      </div>

      <div style={styles.section}>
        <div><span style={styles.label}>Streak:</span> <span style={styles.value}>{loginStreak} days</span></div>
        <button style={styles.button} onClick={incrementStreak}>+1 Day</button>
      </div>

      <div style={styles.section}>
        <div><span style={styles.label}>Rewards:</span> <span style={styles.value}>{unlockedRewards.length} unlocked</span></div>
        <button style={styles.button} onClick={() => unlockReward(`reward_${Date.now().toString().slice(-4)}`)}>Unlock Random</button>
      </div>

      <div style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '10px' }}>
        <button style={{...styles.button, backgroundColor: '#600', width: '100%'}} onClick={resetGame}>Reset State</button>
      </div>
    </div>
  );
};
