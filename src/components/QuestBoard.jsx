import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';

export const QuestBoard = () => {
  const { addXP, hasCompletedOnboarding } = useGameStore();
  const [completedQuests, setCompletedQuests] = useState([]);

  // Don't render until onboarding is finished
  if (!hasCompletedOnboarding) return null;

  const quests = [
    { id: 'q1', title: "Link your primary bank account", reward: 1000, icon: "🏦" },
    { id: 'q2', title: "Set a monthly budget", reward: 500, icon: "📊" },
    { id: 'q3', title: "Read: 'The Magic of Compound Interest'", reward: 200, icon: "📚" }
  ];

  const handleComplete = (questId, reward) => {
    if (completedQuests.includes(questId)) return;
    
    // Mark as completed
    setCompletedQuests(prev => [...prev, questId]);
    
    // Award real game XP
    addXP(reward);
  };

  const styles = {
    container: {
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '600px',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
      zIndex: 40,
      border: '1px solid #475569',
      color: '#fff'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#fbbf24'
    },
    questList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    questItem: (isCompleted) => ({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isCompleted ? 'rgba(71, 85, 105, 0.3)' : '#334155',
      padding: '12px 15px',
      borderRadius: '12px',
      opacity: isCompleted ? 0.6 : 1,
      transition: 'all 0.3s'
    }),
    questInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    button: (isCompleted) => ({
      backgroundColor: isCompleted ? 'transparent' : '#3b82f6',
      color: isCompleted ? '#4ade80' : '#fff',
      border: isCompleted ? '1px solid #4ade80' : 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: isCompleted ? 'default' : 'pointer',
      opacity: isCompleted ? 1 : 0.9
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Daily Quests</div>
        <div style={{ fontSize: '14px', color: '#94a3b8' }}>
          {completedQuests.length} / {quests.length} Completed
        </div>
      </div>
      
      <div style={styles.questList}>
        {quests.map(quest => {
          const isCompleted = completedQuests.includes(quest.id);
          return (
            <div key={quest.id} style={styles.questItem(isCompleted)}>
              <div style={styles.questInfo}>
                <span style={{ fontSize: '24px' }}>{quest.icon}</span>
                <span style={{ fontSize: '14px' }}>{quest.title}</span>
              </div>
              <button 
                style={styles.button(isCompleted)}
                onClick={() => handleComplete(quest.id, quest.reward)}
                disabled={isCompleted}
              >
                {isCompleted ? 'Done' : `+${quest.reward} XP`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
