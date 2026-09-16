/**
 * SherpaChat - Interactive chatbot-powered financial guide.
 * Visual Novel Style UI.
 */
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../store/useGameStore';
import { askSherpa } from '../services/financeService';
import { useAudio } from '../hooks/useAudio';
import { TypewriterText } from './TypewriterText';
import './ConversationalUI.css';



export const SherpaChat = ({ onClose, stageId }) => {
  const { employeeId, financialData } = useGameStore();
  const { playSFX } = useAudio();
  
  const [activeSpeaker, setActiveSpeaker] = useState('sherpa');
  const [activeMessage, setActiveMessage] = useState(() => {
    switch (stageId) {
      case 'base_camp': return "We are at Base Camp. The mountain is large, but we have your snapshot. What would you like to know?";
      case 'income_valley': return "Let's analyze the river of your income. What should we focus on?";
      case 'budget_ridge': return "A budget is your harness. Let's see how secure yours is.";
      case 'aggressive_cliff':
      case 'steady_trail':
      case 'debt_avalanche': return "The path is steep here. We must manage your debt carefully.";
      case 'savings_camp': return "The summit is in sight. Let's secure your future.";
      default: return "What would you like to focus on before we tackle this stage, climber?";
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);

  // Animate character highlights on speaker change
  useEffect(() => {
    if (activeSpeaker === 'sherpa') {
      gsap.to('.sherpa-sprite', { scale: 1.05, filter: 'brightness(1)', opacity: 1, duration: 0.3 });
      gsap.to('.player-sprite', { scale: 0.95, filter: 'brightness(0.5)', opacity: 0.7, duration: 0.3 });
    } else {
      gsap.to('.player-sprite', { scale: 1.05, filter: 'brightness(1)', opacity: 1, duration: 0.3 });
      gsap.to('.sherpa-sprite', { scale: 0.95, filter: 'brightness(0.5)', opacity: 0.7, duration: 0.3 });
    }
  }, [activeSpeaker]);

  // Entrance animation
  useEffect(() => {
    gsap.fromTo('.vn-overlay', { opacity: 0 }, { opacity: 1, duration: 0.5 });
    
    // Animate position, but explicitly ensure opacity hits the correct state
    gsap.fromTo('.sherpa-sprite', { x: -100 }, { x: 0, duration: 0.5, delay: 0.2 });
    gsap.fromTo('.player-sprite', { x: 100 }, { x: 0, duration: 0.5, delay: 0.3 });
    
    gsap.fromTo('.dialogue-box-container', { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.4 });
  }, []);

  // Generate dynamic options based on the user's current stage context
  const getOptions = () => {
    if (hasAskedQuestion) {
      return [{
        label: '🏔️ Continue climbing',
        question: null,
      }];
    }

    let options = [];
    
    switch (stageId) {
      case 'snapshot_summary':
        options = [
          { 
            label: '📷 Snapshot summary', 
            playerText: "I'd like to understand my overall financial snapshot.",
            question: 'Give me a summary of my financial snapshot. Make sure to explicitly list my total current month bills (and mention that this includes bills I have already paid).' 
          },
          { 
            label: '⚠️ Biggest risk', 
            playerText: "Can you tell me what my biggest financial risk is right now?",
            question: 'What is my biggest financial risk right now?' 
          }
        ];
        break;
      case 'income_valley': // Fallback if Income Valley still exists somewhere
        options = [
          { 
            label: '📈 Income trends', 
            playerText: "I want to know how my income this month compares to last month.",
            question: 'How much income do I have this month compared to last?' 
          },
          { 
            label: '💡 Diversify income', 
            playerText: "What are some ways I could diversify or increase my income?",
            question: 'How can I diversify or increase my income streams?' 
          }
        ];
        break;
      case 'budget_ridge':
        options = [
          { 
            label: '🔍 Check overspending', 
            playerText: "I want to know more about my spending. Am I going over budget anywhere?",
            question: 'Am I overspending in any specific category?' 
          },
          { 
            label: '⚖️ 50/30/20 Rule', 
            playerText: "Could you explain how I should apply the 50/30/20 rule to my budget?",
            question: 'How do I apply the 50/30/20 rule to my income?' 
          }
        ];
        break;
      case 'aggressive_cliff':
      case 'steady_trail':
      case 'debt_avalanche':
        options = [
          { 
            label: '🚨 Overdue bills', 
            playerText: "I'm worried about my bills. Which ones are overdue or have high interest?",
            question: 'What are my current overdue or high-interest bills?' 
          },
          { 
            label: '❄️ Avalanche vs Snowball', 
            playerText: "Can you help me understand the difference between the Avalanche and Snowball methods?",
            question: 'Explain the Avalanche vs. Snowball method for paying debt.' 
          }
        ];
        break;
      case 'savings_camp':
        options = [
          { 
            label: '💰 Discretionary income', 
            playerText: "I want to focus on saving. How much true discretionary income do I have available?",
            question: 'How much true discretionary income do I have to save?' 
          },
          { 
            label: '🛡️ Emergency fund', 
            playerText: "What should be my target for an emergency fund right now?",
            question: 'What is an ideal emergency fund size for my situation?' 
          }
        ];
        break;
      default:
        options = [
          { 
            label: '📊 Understand my income', 
            playerText: "I'd like to understand my income situation better.",
            question: 'How much income do I have this month and how does it compare to last month?' 
          },
          { 
            label: '💰 Improve my savings', 
            playerText: "Can you give me some advice on how to improve my savings?",
            question: 'How can I save more money based on my current financial situation?' 
          },
        ];
        break;
    }

    options.push({
      label: '🏔️ Continue climbing',
      question: null, // Special case: close the chat
    });

    return options;
  };

  const handleOptionClick = async (option) => {
    playSFX('thud');
    if (!option.question) {
      // "Continue climbing" option
      gsap.to('.vn-overlay', { opacity: 0, duration: 0.3, onComplete: onClose });
      return;
    }

    // Switch to Player speaking
    setShowOptions(false);
    setActiveSpeaker('player');
    
    // Use the custom conversational text if provided, otherwise fallback to stripping the emoji from the label
    setActiveMessage(option.playerText || option.label.replace(/^[^\s]+\s/, ''));
    
    setHasAskedQuestion(true);
    
    // Add a slight delay before calling API to let user read their own question
    setTimeout(async () => {
      setIsLoading(true);
      setActiveSpeaker('sherpa');
      setActiveMessage("Hmm... let me check my map...");
      
      const response = await askSherpa(option.question, employeeId);
      
      setIsLoading(false);
      setActiveMessage(response.botResponse);
    }, 1500);
  };

  return (
    <div className="vn-overlay">
      
      {/* Character Sprites */}
      <div className="vn-sprites-container">
        <img className="vn-sherpa-sprite sherpa-sprite" src="/sprite_sherpa.png" alt="Sherpa" />
        <div className="vn-player-sprite player-sprite">
          <img src="/sprite_mountaineer.png" alt="Player" className="vn-player-img" />
        </div>
      </div>

      {/* Main Dialogue Area */}
      <div className="vn-dialogue-container dialogue-box-container">
        
        {/* Options Menu (shows when it's time to choose) */}
        {showOptions && activeSpeaker === 'sherpa' && !isLoading && (
          <div className="vn-options-container" style={{ position: 'absolute', bottom: '100%', marginBottom: '25px', left: 0, right: 0, justifyContent: 'center', zIndex: 12 }}>
            {getOptions().map((opt, i) => (
              <button
                key={i}
                className="vn-option-btn"
                style={{ flex: '1 1 45%', maxWidth: '400px' }}
                onClick={() => handleOptionClick(opt)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Class for Chat Tails */}
        <div className={`vn-dialogue-box speaker-${activeSpeaker}`}>
          
          <div className={`vn-speaker-badge ${activeSpeaker}`}>
            {activeSpeaker === 'sherpa' ? 'Sherpa' : 'You'}
          </div>
          
          {isLoading ? (
            <div className="vn-message-text">
              {activeMessage}
              <span style={{marginLeft: '10px', animation: 'pulse 1s infinite'}}>...</span>
            </div>
          ) : (
            <TypewriterText 
              text={activeMessage} 
              speed={20} 
              isMarkdown={true} 
              onComplete={() => {
                if (activeSpeaker === 'sherpa') {
                  setShowOptions(true);
                }
              }}
            />
          )}
          
        </div>
      </div>
      
    </div>
  );
};
