import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import gsap from 'gsap';
import { DialogueScreen } from './DialogueScreen';

export const StageModal = () => {
  const { activeStageModal, closeStageModal, completeStage, energy, inventory, addTool, setSherpaMessage, financialHealthScore } = useGameStore();
  const [encounterState, setEncounterState] = useState('dialogue'); // 'dialogue', 'intro', 'resolution'
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    if (activeStageModal !== null) {
      setEncounterState('dialogue');
    }
  }, [activeStageModal]);

  if (activeStageModal === null) return null;

  const encounters = [
    {
      title: "Base Camp: The First Step",
      script: [
        { speaker: "Sherpa", text: "Welcome to the Financial Ascent. The mountain is treacherous, but I will guide you." },
        { speaker: "You", text: "I'm ready. Where do we begin?" },
        { speaker: "Sherpa", text: "We begin with protection. A fierce wind threatens to blow your tent away." }
      ],
      desc: "You arrive at the base of the mountain, but a fierce wind threatens to blow your tent away. How do you secure it?",
      options: [
        { text: "Use the Budget Planner Rope (Safe)", requires: 'budget_planner', resultText: "You securely tied down your finances. You are safe.", reward: 50, toolGained: 'emergency_shield' },
        { text: "Ignore it and sleep (Risky)", requires: null, resultText: "The wind tore your tent! You lost energy.", reward: 10, costEnergy: 2 }
      ]
    },
    {
      title: "Camp 2: The Avalanche of Debt",
      script: [
        { speaker: "Sherpa", text: "Look above! The snow is loose. An avalanche of high-interest debt is coming." },
        { speaker: "You", text: "Debt? How do we survive that?" },
        { speaker: "Sherpa", text: "With an Emergency Fund. It acts as a shield against sudden disasters." }
      ],
      desc: "A massive avalanche of high-interest debt is roaring down the cliff face!",
      options: [
        { text: "Deploy Emergency Shield", requires: 'emergency_shield', resultText: "The shield deflects the debt avalanche effortlessly!", reward: 100, toolGained: 'compound_sword' },
        { text: "Run away (Panic)", requires: null, resultText: "You barely escaped, dropping coins along the way.", reward: 0, costEnergy: 1 }
      ]
    },
    {
      title: "Camp 3: The Golden Goose",
      script: [
        { speaker: "Sherpa", text: "Ah, you found a golden egg in the ice. A rare opportunity." },
        { speaker: "You", text: "Should I consume it for immediate energy?" },
        { speaker: "Sherpa", text: "If you plant it and wait, compound interest will grow it into a massive tree. Patience is the ultimate tool." }
      ],
      desc: "You find a mysterious golden egg frozen in the ice. Do you consume it now or plant it?",
      options: [
        { text: "Plant it (Compound Interest)", requires: 'compound_sword', resultText: "The egg thaws and grows into a massive tree of wealth!", reward: 200, toolGained: 'diversification_map' },
        { text: "Eat it now", requires: null, resultText: "It tasted okay, but you feel you missed a greater opportunity.", reward: 50 }
      ]
    }
  ];

  const currentEncounter = encounters[activeStageModal] || encounters[0];

  if (encounterState === 'dialogue') {
    return (
      <DialogueScreen 
        script={currentEncounter.script} 
        onComplete={() => setEncounterState('intro')} 
      />
    );
  }

  const handleChoice = (option) => {
    if (option.requires && !inventory.includes(option.requires)) {
      alert("You don't have the required tool for this!");
      return;
    }
    
    if (option.costEnergy && energy < option.costEnergy) {
      alert("Not enough energy for this reckless action!");
      return;
    }

    setOutcome(option);
    setEncounterState('resolution');
    
    if (option.toolGained) {
      addTool(option.toolGained);
      setSherpaMessage(`Excellent choice. You've acquired the ${option.toolGained.replace('_', ' ')}!`);
    } else {
      setSherpaMessage("Sometimes we learn the hard way.");
    }
  };

  const handleComplete = () => {
    // Cinematic Shake
    gsap.to('.stage-modal-container', {
      scale: 1.05,
      yoyo: true,
      repeat: 1,
      duration: 0.15,
      onComplete: () => {
        gsap.to('.stage-modal-container', {
          scale: 0.8,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            completeStage(activeStageModal, outcome.reward > 50 ? 3 : 1, outcome.reward);
          }
        });
      }
    });
  };

  const handleClose = () => {
    gsap.to('.stage-modal-container', { scale: 0.8, opacity: 0, duration: 0.3, onComplete: closeStageModal });
  };

  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 300, backdropFilter: 'blur(8px)'
    },
    container: {
      backgroundImage: 'url(/ui_wooden_board.jpg)',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: '20px',
      padding: '40px 30px',
      width: '90%', maxWidth: '500px',
      textAlign: 'center',
      boxShadow: '0 30px 60px rgba(0,0,0,0.9)',
      position: 'relative',
      color: '#fff',
      border: 'none' // The asset has its own border
    },
    title: {
      fontSize: '28px', fontFamily: "'Rowdies', cursive",
      color: '#fef3c7', marginBottom: '15px',
      textShadow: '0 4px 6px rgba(0,0,0,0.8)'
    },
    desc: {
      fontSize: '18px', marginBottom: '25px', lineHeight: '1.5'
    },
    optionBtn: (isLocked) => ({
      backgroundImage: isLocked ? 'none' : 'url(/ui_stone_bar.jpg)',
      backgroundSize: 'cover',
      backgroundColor: isLocked ? 'rgba(0,0,0,0.5)' : 'transparent',
      color: isLocked ? '#64748b' : '#f8fafc',
      border: isLocked ? '2px solid #334155' : '2px solid #cbd5e1',
      borderRadius: '8px',
      padding: '15px',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: "'Nunito', sans-serif",
      cursor: isLocked ? 'not-allowed' : 'pointer',
      width: '100%',
      marginBottom: '15px',
      transition: 'transform 0.1s',
      boxShadow: isLocked ? 'none' : '0 8px 15px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.2)',
      textShadow: isLocked ? 'none' : '2px 2px 4px rgba(0,0,0,0.9)'
    }),
    rewardText: {
      color: '#fbbf24', fontSize: '24px', fontWeight: 'bold', margin: '20px 0',
      textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontFamily: "'Rowdies', cursive"
    },
    continueBtn: {
      backgroundImage: 'url(/ui_stone_bar.jpg)',
      backgroundSize: 'cover',
      color: '#4ade80', border: '2px solid #4ade80',
      padding: '15px 30px',
      borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer',
      boxShadow: '0 8px 15px rgba(0,0,0,0.8)',
      textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
      fontFamily: "'Rowdies', cursive"
    }
  };

  return (
    <div style={styles.overlay}>
      <div className="stage-modal-container" style={styles.container}>
        <button style={{...styles.optionBtn(false), position: 'absolute', top: -15, right: -15, width: 40, height: 40, padding: 0, borderRadius: '50%', background: '#ef4444', borderBottom: '4px solid #991b1b'}} onClick={handleClose}>X</button>
        
        <div style={styles.title}>{currentEncounter.title}</div>
        
        {encounterState === 'intro' ? (
          <>
            <div style={styles.desc}>{currentEncounter.desc}</div>
            
            {currentEncounter.options.map((opt, i) => {
              const hasTool = !opt.requires || inventory.includes(opt.requires);
              return (
                <button 
                  key={i}
                  style={styles.optionBtn(!hasTool)}
                  onClick={() => handleChoice(opt)}
                  onPointerDown={(e) => { if(hasTool) e.currentTarget.style.transform = 'translateY(4px)'}}
                  onPointerUp={(e) => { if(hasTool) e.currentTarget.style.transform = 'translateY(0)'}}
                >
                  {opt.text} {!hasTool && `(Requires: ${opt.requires.replace('_', ' ')})`}
                </button>
              )
            })}
          </>
        ) : (
          <>
            <div style={styles.desc}>{outcome.resultText}</div>
            <div style={styles.rewardText}>Reward: {outcome.reward} 🪙</div>
            {outcome.toolGained && (
              <div style={{color: '#38bdf8', marginBottom: '20px', fontWeight: 'bold'}}>
                Acquired Tool: {outcome.toolGained.replace('_', ' ').toUpperCase()}!
              </div>
            )}
            <button style={styles.continueBtn} onClick={handleComplete}>Continue Ascent</button>
          </>
        )}
      </div>
    </div>
  );
};
