import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import gsap from 'gsap';
import { DialogueScreen } from './DialogueScreen';
import { BudgetChallenge } from './BudgetChallenge';
import { DebtChallenge } from './DebtChallenge';
import { TypewriterText } from './TypewriterText';
import './ConversationalUI.css';
import { SherpaChat } from './SherpaChat';
import { useAudio } from '../hooks/useAudio';
import { formatCurrency } from '../hooks/useFinancialData';

export const StageModal = () => {
  const { activeStageModal, closeStageModal, completeNode, energy, inventory, addTool, setSherpaMessage, setBudgetCreated, setDebtStrategy, setWeatherState, financialData } = useGameStore();
  const { playSFX } = useAudio();
  const [encounterState, setEncounterState] = useState('dialogue'); // 'dialogue', 'sherpa_chat', 'intro', 'challenge', 'resolution'
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    if (activeStageModal !== null) {
      setEncounterState('dialogue');
    }
  }, [activeStageModal]);

  if (activeStageModal === null) return null;

  // Helper: get data or safe defaults
  const fd = financialData || {};
  const income = fd.income || 0;
  const incomeThisMonth = fd.incomeThisMonth || 0;
  const incomeLastMonth = fd.incomeLastMonth || 0;
  const incomeTrend = fd.incomeTrend || 'stable';
  const tdi = fd.tdi || 0;
  const totalBills = fd.totalAmountDue || 0;
  const overdueBills = fd.overdueBillsCount || 0;
  const budgetHealth = fd.budgetHealth || 'no_budget';
  const totalBudget = fd.totalBudget || 0;
  const totalSpent = fd.totalSpent || 0;
  const salaryBillRatio = fd.salaryBillRatio || 0;
  const hasData = !!financialData;

  // --- Build Dynamic Encounters ---
  const encounters = {
    base_camp: {
      title: "Base Camp: Take Home Snapshot",
      script: [
        { speaker: "Sherpa", text: hasData
          ? `Welcome, climber. Your current income is ${formatCurrency(income)}. Take Home has mapped your financial terrain.`
          : "Welcome to the Financial Ascent. The mountain is treacherous, but the Take Home platform will be your guide." },
        { speaker: "You", text: "I'm ready. Where do we begin?" },
        { speaker: "Sherpa", text: hasData
          ? `Your bills total ${formatCurrency(totalBills)}, leaving you with ${formatCurrency(tdi)} in true discretionary income. Let's start climbing.`
          : "First, you must understand your current position. Take this compass and use Take Home's Wellness Dashboard." }
      ],
      desc: hasData
        ? `Your Take Home snapshot shows ${formatCurrency(income)} income and ${formatCurrency(totalBills)} in bills this period.`
        : "Take Home's Wellness Dashboard takes a complete snapshot of your financial health.",
      options: [
        { text: "Take Financial Snapshot", resultText: hasData ? `Baseline established: ${formatCurrency(tdi)} true disposable income.` : "You have securely established your financial baseline.", reward: 50, toolGained: 'financial_compass', weatherChange: 'sunrise' },
        { text: "Climb without a Dashboard", resultText: "You are climbing blind. The path is confusing.", reward: 10, costEnergy: 1, weatherChange: 'fog' }
      ],
      nextNodes: ['income_valley']
    },

    income_valley: {
      title: "Stage 2: Cash Flow Tracking",
      script: (() => {
        if (hasData && incomeTrend === 'up') {
          return [
            { speaker: "Sherpa", text: `Great news! Your income rose from ${formatCurrency(incomeLastMonth)} to ${formatCurrency(incomeThisMonth)}. The wind is at our back.` },
            { speaker: "You", text: "That's encouraging! How do I keep this momentum?" },
            { speaker: "Sherpa", text: "By tracking every stream in Take Home's Cash Flow tools. Let's secure this advantage." }
          ];
        } else if (hasData && incomeTrend === 'down') {
          return [
            { speaker: "Sherpa", text: `Warning, climber. Your income dropped from ${formatCurrency(incomeLastMonth)} to ${formatCurrency(incomeThisMonth)}. The trail has narrowed.` },
            { speaker: "You", text: "That's concerning. What should I do?" },
            { speaker: "Sherpa", text: "First, understand where each dollar goes. Take Home's Cash Flow tools will help us find the leak." }
          ];
        }
        return [
          { speaker: "Sherpa", text: "A river of income flows here. Take Home's Cash Flow tools help you track every drop." },
          { speaker: "You", text: "How do I make sure none of it slips away?" },
          { speaker: "Sherpa", text: "By linking your accounts in Take Home. Use this Income Rope to bind them securely." }
        ];
      })(),
      desc: hasData
        ? `Your income is ${incomeTrend === 'up' ? '📈 trending up' : incomeTrend === 'down' ? '📉 trending down' : '➡️ stable'} (${formatCurrency(incomeThisMonth)} this period).`
        : "Take Home automatically categorizes and tracks your income streams.",
      options: (() => {
        const opts = [
          { text: "Link Accounts securely (Use Compass)", requires: 'financial_compass', resultText: hasData ? `Take Home is tracking your ${formatCurrency(incomeThisMonth)} income stream.` : "Take Home is now tracking your cash flow beautifully.", reward: incomeTrend === 'up' ? 150 : 100, toolGained: 'income_rope' },
          { text: "Track manually on paper", resultText: "You lost track of several transactions.", reward: 20, costEnergy: 1, weatherChange: 'fog' }
        ];
        if (incomeTrend === 'up') {
          opts[0].resultText += " 🎉 Income growth bonus!";
        }
        return opts;
      })(),
      nextNodes: ['budget_ridge']
    },

    budget_ridge: {
      title: "Stage 3: The 50/30/20 Budget",
      script: (() => {
        if (hasData && budgetHealth === 'over_budget') {
          return [
            { speaker: "Sherpa", text: `Climber, you've spent ${formatCurrency(totalSpent)} against a budget of ${formatCurrency(totalBudget)}. You are over budget!` },
            { speaker: "You", text: "That's not good. How do I fix this?" },
            { speaker: "Sherpa", text: "We must restructure. Take Home uses the 50/30/20 rule to bring you back on track." }
          ];
        } else if (hasData && budgetHealth === 'on_track') {
          return [
            { speaker: "Sherpa", text: `Excellent discipline! You've spent ${formatCurrency(totalSpent)} of your ${formatCurrency(totalBudget)} budget. You're on track.` },
            { speaker: "You", text: "That's great to hear!" },
            { speaker: "Sherpa", text: "Let's refine your 50/30/20 allocation to push even higher." }
          ];
        }
        return [
          { speaker: "Sherpa", text: "The ridge ahead splits. We must allocate our resources wisely." },
          { speaker: "You", text: "What is the best way to structure my finances here?" },
          { speaker: "Sherpa", text: "Take Home uses the 50/30/20 rule. Allocate your monthly income into Needs, Wants, and Savings." }
        ];
      })(),
      desc: hasData
        ? `Budget Status: ${budgetHealth === 'over_budget' ? '🔴 Over Budget' : budgetHealth === 'on_track' ? '🟢 On Track' : budgetHealth === 'warning' ? '🟡 Warning' : '⚪ No Budget Set'}`
        : "Use Take Home's budgeting tool to allocate your monthly income securely.",
      hasChallenge: 'budget',
      nextNodes: ['aggressive_cliff', 'steady_trail']
    },

    aggressive_cliff: {
      title: "Branch A: Avalanche Debt Strategy",
      script: [
        { speaker: "Sherpa", text: hasData && overdueBills > 0
          ? `You have ${overdueBills} overdue bill(s). The cliff is steep with high-interest debt.`
          : "You chose the steep cliff. High risk, high interest." },
        { speaker: "You", text: "How do we clear this high-interest debt quickly?" },
        { speaker: "Sherpa", text: "Take Home recommends the Avalanche Method. Attack the highest interest rates first." }
      ],
      desc: hasData && overdueBills > 0
        ? `⚠️ ${overdueBills} overdue bill(s) detected. Take Home's Debt Planner shows dangerous interest rates.`
        : "Take Home's Debt Planner is showing dangerous interest rates. Do you attack the highest rate?",
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
        { speaker: "Sherpa", text: "Yes. Take Home's Snowball Strategy uses your budget to create an Emergency Shield against unexpected storms." }
      ],
      desc: "Take Home suggests building an Emergency Fund before tackling massive debts.",
      options: [
        { text: "Deploy Emergency Shield", requires: 'budget_planner', resultText: "Take Home's emergency planning deflected the financial storm!", reward: 150, toolGained: 'emergency_shield', weatherChange: 'sunrise' },
        { text: "Ignore the warning", resultText: "An unexpected expense hit you hard.", reward: 0, costEnergy: 2, weatherChange: 'storm' }
      ],
      nextNodes: ['debt_avalanche']
    },

    debt_avalanche: {
      title: "Stage 5: Take Home Debt Planner",
      script: [
        { speaker: "Sherpa", text: hasData && salaryBillRatio > 50
          ? `Your bills consume ${salaryBillRatio.toFixed(0)}% of your income. The avalanche is massive!`
          : "An avalanche of combined debt is roaring toward us!" },
        { speaker: "You", text: "Let's use Take Home's Debt Strategy Planner to survive this." },
        { speaker: "Sherpa", text: "Choose your method in the app. Let the software calculate your path to freedom." }
      ],
      desc: hasData
        ? `Bills-to-Income Ratio: ${salaryBillRatio.toFixed(0)}%. Open Take Home's Debt Planner to formulate your survival strategy.`
        : "Open Take Home's Debt Planner to formulate your survival strategy.",
      hasChallenge: 'debt',
      nextNodes: ['savings_camp']
    },

    savings_camp: {
      title: "Stage 6: Goal Tracking",
      script: (() => {
        if (hasData && tdi > 0) {
          return [
            { speaker: "Sherpa", text: `You have ${formatCurrency(tdi)} in true discretionary income. This is your savings potential!` },
            { speaker: "You", text: "I need to secure investments for retirement." },
            { speaker: "Sherpa", text: "Take Home's Goal Tracking feature will automate your savings. Let's secure your camp." }
          ];
        } else if (hasData && tdi <= 0) {
          return [
            { speaker: "Sherpa", text: `Warning: Your true discretionary income is ${formatCurrency(tdi)}. You're spending more than you earn.` },
            { speaker: "You", text: "This is dangerous. What do I do?" },
            { speaker: "Sherpa", text: "We must cut costs before we can save. Review your bills in Take Home and set up automated savings goals." }
          ];
        }
        return [
          { speaker: "Sherpa", text: "We are high up now. It is time to look to the future." },
          { speaker: "You", text: "I need to secure investments for retirement." },
          { speaker: "Sherpa", text: "Take Home's Goal Tracking feature will automate your savings and secure your camp." }
        ];
      })(),
      desc: hasData
        ? `True Discretionary Income: ${formatCurrency(tdi)}. Set up automated savings goals for your final push.`
        : "Set up automated savings goals in Take Home for your final push.",
      options: [
        { text: "Automate Savings Goals", requires: 'debt_axe', resultText: hasData ? `Automated savings of ${formatCurrency(Math.max(0, tdi * 0.2))} per month set up!` : "Your Take Home goals are set. The summit awaits!", reward: tdi > 0 ? 250 : 200, toolGained: 'savings_beacon' },
        { text: "Save manually when possible", resultText: "You forgot to save this month. Progress is slow.", reward: 50, costEnergy: 1 }
      ],
      nextNodes: ['summit']
    },

    summit: {
      title: "The Summit: True Financial Wellness",
      script: [
        { speaker: "Sherpa", text: "You have done it. You reached the summit of Financial Ascent." },
        { speaker: "You", text: "Take Home made navigating the complexity so much easier." },
        { speaker: "Sherpa", text: hasData
          ? `With ${formatCurrency(income)} income and ${formatCurrency(tdi)} in savings potential, your financial foundation is as solid as this mountain.`
          : "The app is merely the tool; you provided the discipline. Your financial foundation is now as solid as this mountain." }
      ],
      desc: hasData
        ? `Congratulations! Income: ${formatCurrency(income)} | Bills: ${formatCurrency(totalBills)} | Savings Potential: ${formatCurrency(Math.max(0, tdi))}`
        : "Congratulations! You have mastered Take Home and secured your financial future.",
      options: [
        { text: "Claim Summit Reward", resultText: "You are a Take Home Navigator!", reward: 1000 }
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
          if (hasData) {
            setEncounterState('sherpa_chat');
          } else if (currentEncounter.hasChallenge) {
            setEncounterState('challenge');
          } else {
            setEncounterState('intro');
          }
        }} 
      />
    );
  }

  if (encounterState === 'sherpa_chat') {
    return (
      <SherpaChat 
        stageId={activeStageModal}
        onClose={() => {
          if (currentEncounter.hasChallenge) {
            setEncounterState('challenge');
          } else {
            setEncounterState('intro');
          }
      }} />
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
      setOutcome({ resultText: "You successfully built a 50/30/20 Take Home budget!", reward: 150, toolGained: 'budget_planner' });
      setSherpaMessage("A well-planned Take Home budget is a climber's best rope.");
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

  return (
    <div className="vn-overlay stage-modal-overlay">
      
      {encounterState === 'challenge' ? (
        currentEncounter.hasChallenge === 'budget' ? (
          <BudgetChallenge onComplete={(data) => handleChallengeComplete('budget', data)} />
        ) : (
          <DebtChallenge onComplete={(data) => handleChallengeComplete('debt', data)} />
        )
      ) : (
        <>
          <div className="vn-sprites-container">
            <img className="vn-sherpa-sprite sherpa-sprite" src="/sprite_sherpa.png" alt="Sherpa" />
            <div className="vn-player-sprite player-sprite" style={{ filter: 'brightness(0.5)' }}>
              <img src="/sprite_mountaineer.png" alt="Player" className="vn-player-img" />
            </div>
          </div>
          
          <div className="vn-dialogue-container stage-modal-container">
            <button 
              style={{position: 'absolute', top: -15, right: -15, width: 40, height: 40, padding: 0, borderRadius: '50%', background: '#ef4444', border: '3px solid #991b1b', color: 'white', fontWeight: 'bold', cursor: 'pointer', zIndex: 20}} 
              onClick={handleClose}
            >X</button>
            
            <div className="vn-dialogue-box speaker-sherpa">
              <div className="vn-speaker-badge sherpa">Sherpa</div>
              
              {encounterState === 'intro' ? (
                <>
                  <TypewriterText text={currentEncounter.desc} speed={15} />
                  <div className="vn-options-container" style={{ justifyContent: 'center' }}>
                    {currentEncounter.options.map((opt, i) => {
                      const hasTool = !opt.requires || inventory.includes(opt.requires);
                      return (
                        <button 
                          key={i}
                          className="vn-option-btn"
                          disabled={!hasTool}
                          style={{ flex: '1 1 45%', maxWidth: '400px' }}
                          onClick={() => handleChoice(opt)}
                        >
                          {opt.text} {!hasTool && `(Requires: ${opt.requires.replace('_', ' ')})`}
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <>
                  <TypewriterText text={outcome.resultText} speed={15} />
                  
                  <div className="vn-reward-text">Reward: {outcome.reward} 🪙</div>
                  
                  {outcome.toolGained && (
                    <div style={{color: '#38bdf8', marginBottom: '15px', fontWeight: 'bold', fontSize: '20px'}}>
                      Acquired Tool: {outcome.toolGained.replace('_', ' ').toUpperCase()}!
                    </div>
                  )}
                  
                  <button 
                    className="vn-continue-btn"
                    onClick={handleComplete}
                  >
                    Continue Ascent
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
