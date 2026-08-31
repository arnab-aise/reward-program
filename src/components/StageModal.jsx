import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import gsap from 'gsap';
import { DialogueScreen } from './DialogueScreen';
import { BudgetChallenge } from './BudgetChallenge';
import { DebtChallenge } from './DebtChallenge';
import { useAudio } from '../hooks/useAudio';

export const StageModal = () => {
  const { activeStageModal, closeStageModal, completeNode, energy, inventory, addTool, setSherpaMessage, setBudgetCreated, setDebtStrategy, setWeatherState } = useGameStore();
  const { playSFX } = useAudio();
  const [encounterState, setEncounterState] = useState('dialogue'); // 'dialogue', 'intro', 'challenge', 'resolution'
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    if (activeStageModal !== null) {
      setEncounterState('dialogue');
    }
  }, [activeStageModal]);

  if (activeStageModal === null) return null;

  const encounters = {
    base_camp: {
      title: "Base Camp: True Harbor Snapshot",
      script: [
        { speaker: "Sherpa", text: "Welcome to the Financial Ascent. The mountain is treacherous, but the True Harbor platform will be your guide." },
        { speaker: "You", text: "I'm ready. Where do we begin?" },
        { speaker: "Sherpa", text: "First, you must understand your current position. Take this compass and use True Harbor's Wellness Dashboard." }
      ],
      desc: "True Harbor's Wellness Dashboard takes a complete snapshot of your financial health.",
      options: [
        { text: "Take Financial Snapshot", resultText: "You have securely established your financial baseline.", reward: 50, toolGained: 'financial_compass', weatherChange: 'sunrise' },
        { text: "Climb without a Dashboard", resultText: "You are climbing blind. The path is confusing.", reward: 10, costEnergy: 1, weatherChange: 'fog' }
      ],
      nextNodes: ['income_valley']
    },
    income_valley: {
      title: "Stage 2: Cash Flow Tracking",
      script: [
        { speaker: "Sherpa", text: "A river of income flows here. True Harbor's Cash Flow tools help you track every drop." },
        { speaker: "You", text: "How do I make sure none of it slips away?" },
        { speaker: "Sherpa", text: "By linking your accounts in True Harbor. Use this Income Rope to bind them securely." }
      ],
      desc: "True Harbor automatically categorizes and tracks your income streams.",
      options: [
        { text: "Link Accounts securely (Use Compass)", requires: 'financial_compass', resultText: "True Harbor is now tracking your cash flow beautifully.", reward: 100, toolGained: 'income_rope' },
        { text: "Track manually on paper", resultText: "You lost track of several transactions.", reward: 20, costEnergy: 1, weatherChange: 'fog' }
      ],
      nextNodes: ['budget_ridge']
    },
    budget_ridge: {
      title: "Stage 3: The 50/30/20 Budget",
      script: [
        { speaker: "Sherpa", text: "The ridge ahead splits. We must allocate our resources wisely." },
        { speaker: "You", text: "What is the best way to structure my finances here?" },
        { speaker: "Sherpa", text: "True Harbor uses the 50/30/20 rule. Allocate your monthly income into Needs, Wants, and Savings." }
      ],
      desc: "Use True Harbor's budgeting tool to allocate your monthly income securely.",
      hasChallenge: 'budget',
      nextNodes: ['aggressive_cliff', 'steady_trail'] // Branching paths!
    },
    aggressive_cliff: {
      title: "Branch A: Avalanche Debt Strategy",
      script: [
        { speaker: "Sherpa", text: "You chose the steep cliff. High risk, high interest." },
        { speaker: "You", text: "How do we clear this high-interest debt quickly?" },
        { speaker: "Sherpa", text: "True Harbor recommends the Avalanche Method. Use your Compound Sword to slash the highest interest rates first." }
      ],
      desc: "True Harbor's Debt Planner is showing dangerous interest rates. Do you attack the highest rate?",
      options: [
        { text: "Execute Avalanche Strategy", requires: 'compound_sword', resultText: "You saved thousands in interest by attacking the highest rate first!", reward: 300 },
        { text: "Pay minimums only", resultText: "The debt grew larger while you climbed slowly.", reward: 50, costEnergy: 2, weatherChange: 'storm' }
      ],
      nextNodes: ['debt_avalanche']
    },
    steady_trail: {
      title: "Branch B: Snowball Debt Strategy",
      script: [
        { speaker: "Sherpa", text: "The steady trail. We build momentum by clearing small debts first." },
        { speaker: "You", text: "It feels good to get quick wins." },
        { speaker: "Sherpa", text: "Yes. True Harbor's Snowball Strategy uses your budget to create an Emergency Shield against unexpected storms." }
      ],
      desc: "True Harbor suggests building an Emergency Fund before tackling massive debts.",
      options: [
        { text: "Deploy Emergency Shield", requires: 'budget_planner', resultText: "True Harbor's emergency planning deflected the financial storm!", reward: 150, toolGained: 'emergency_shield', weatherChange: 'sunrise' },
        { text: "Ignore the warning", resultText: "An unexpected expense hit you hard.", reward: 0, costEnergy: 2, weatherChange: 'storm' }
      ],
      nextNodes: ['debt_avalanche']
    },
    debt_avalanche: {
      title: "Stage 5: True Harbor Debt Planner",
      script: [
        { speaker: "Sherpa", text: "An avalanche of combined debt is roaring toward us!" },
        { speaker: "You", text: "Let's use True Harbor's Debt Strategy Planner to survive this." },
        { speaker: "Sherpa", text: "Choose your method in the app. Let the software calculate your path to freedom." }
      ],
      desc: "Open True Harbor's Debt Planner to formulate your survival strategy.",
      hasChallenge: 'debt',
      nextNodes: ['savings_camp']
    },
    savings_camp: {
      title: "Stage 6: Goal Tracking",
      script: [
        { speaker: "Sherpa", text: "We are high up now. It is time to look to the future." },
        { speaker: "You", text: "I need to secure investments for retirement." },
        { speaker: "Sherpa", text: "True Harbor's Goal Tracking feature will automate your savings and secure your camp." }
      ],
      desc: "Set up automated savings goals in True Harbor for your final push.",
      options: [
        { text: "Automate Savings Goals", requires: 'debt_axe', resultText: "Your True Harbor goals are set. The summit awaits!", reward: 200, toolGained: 'savings_beacon' },
        { text: "Save manually when possible", resultText: "You forgot to save this month. Progress is slow.", reward: 50, costEnergy: 1 }
      ],
      nextNodes: ['summit']
    },
    summit: {
      title: "The Summit: True Financial Wellness",
      script: [
        { speaker: "Sherpa", text: "You have done it. You reached the summit of Financial Ascent." },
        { speaker: "You", text: "True Harbor made navigating the complexity so much easier." },
        { speaker: "Sherpa", text: "The app is merely the tool; you provided the discipline. Your financial foundation is now as solid as this mountain." }
      ],
      desc: "Congratulations! You have mastered True Harbor and secured your financial future.",
      options: [
        { text: "Claim Summit Reward", resultText: "You are a True Harbor Navigator!", reward: 1000 }
      ],
      nextNodes: []
    }
  };

  const currentEncounter = encounters[activeStageModal] || encounters['base_camp'];

  if (encounterState === 'dialogue') {
    return (
      <DialogueScreen 
        script={currentEncounter.script} 
        onComplete={() => {
          if (currentEncounter.hasChallenge) {
            setEncounterState('challenge');
          } else {
            setEncounterState('intro');
          }
        }} 
      />
    );
  }

  const handleChoice = (option) => {
    playSFX('thud');
    if (option.requires && !inventory.includes(option.requires)) {
      playSFX('error');
      alert("You don't have the required tool for this!");
      return;
    }
    
    if (option.costEnergy && energy < option.costEnergy) {
      playSFX('error');
      alert("Not enough energy for this reckless action!");
      return;
    }

    setOutcome(option);
    setEncounterState('resolution');
    
    if (option.weatherChange) {
      setWeatherState(option.weatherChange);
    }

    if (option.toolGained) {
      addTool(option.toolGained);
      setSherpaMessage(`Excellent choice. You've acquired the ${option.toolGained.replace('_', ' ')}!`);
    } else {
      setSherpaMessage("Sometimes we learn the hard way.");
    }
  };

  const handleChallengeComplete = (challengeType, data) => {
    if (challengeType === 'budget') {
      setBudgetCreated(true);
      addTool('budget_planner');
      setOutcome({ resultText: "You successfully built a 50/30/20 True Harbor budget!", reward: 150, toolGained: 'budget_planner' });
      setSherpaMessage("A well-planned True Harbor budget is a climber's best rope.");
    } else if (challengeType === 'debt') {
      setDebtStrategy(data);
      addTool('debt_axe');
      setOutcome({ resultText: `You attacked the avalanche with the ${data} strategy!`, reward: 150, toolGained: 'debt_axe' });
      setSherpaMessage("Tackling debt requires a clear path. Good work.");
    }
    setEncounterState('resolution');
  };

  const handleComplete = () => {
    playSFX('chime');
    // Cinematic Shake and Glow for Unlocking
    gsap.to('.stage-modal-container', {
      scale: 1.05,
      boxShadow: '0 0 50px rgba(74, 222, 128, 0.8)',
      yoyo: true,
      repeat: 1,
      duration: 0.2,
      onComplete: () => {
        gsap.to('.stage-modal-container', {
          scale: 0.8,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            completeNode(activeStageModal, outcome.reward > 50 ? 3 : 1, outcome.reward, currentEncounter.nextNodes || []);
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
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 50,
      pointerEvents: 'none' // Allow clicks through empty space
    },
    container: {
      pointerEvents: 'auto', // Re-enable pointer events for the modal itself
      backgroundImage: 'url(/ui_wooden_board.jpg)',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: '20px',
      padding: '50px 60px',
      width: '90%', maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      textAlign: 'center',
      boxShadow: '0 30px 60px rgba(0,0,0,0.9)',
      position: 'relative',
      color: '#fff',
      border: 'none', // The asset has its own border
      boxSizing: 'border-box'
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
        
        {encounterState === 'challenge' ? (
          currentEncounter.hasChallenge === 'budget' ? (
            <BudgetChallenge onComplete={(data) => handleChallengeComplete('budget', data)} />
          ) : (
            <DebtChallenge onComplete={(data) => handleChallengeComplete('debt', data)} />
          )
        ) : encounterState === 'intro' ? (
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
