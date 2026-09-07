import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import { generateLinkToken, exchangePublicToken, fetchSnapshot } from '../services/financeService';
import { usePlaidLink } from 'react-plaid-link';
import gsap from 'gsap';
import { TypewriterText } from './TypewriterText';
import './ConversationalUI.css';

export const Onboarding = () => {
  const { hasCompletedOnboarding, completeOnboarding, isFinanceLoading, hasNoData, employeeId, setFinancialData, setFinanceStatus } = useGameStore();
  const [showContent, setShowContent] = useState(false);
  const [linkToken, setLinkToken] = useState(null);
  const [isLinking, setIsLinking] = useState(false);
  
  // Plaid integration
  useEffect(() => {
    if (hasNoData && employeeId && !linkToken) {
      generateLinkToken(employeeId).then(token => setLinkToken(token)).catch(err => console.error("Plaid token error:", err));
    }
  }, [hasNoData, employeeId, linkToken]);

  const onSuccess = useCallback(
    async (publicToken) => {
      setIsLinking(true);
      try {
        await exchangePublicToken(employeeId, publicToken);
        // Data is now ready! Let's re-fetch the snapshot
        setFinanceStatus(true, false);
        const result = await fetchSnapshot(employeeId);
        if (result.data) {
          // Force a reload so useFinancialData in App can pick up the new snapshot and metrics
          window.location.reload(); 
        }
      } catch (err) {
        console.error("Exchange token failed:", err);
      } finally {
        setIsLinking(false);
      }
    },
    [employeeId, setFinanceStatus]
  );

  const { open: openPlaid, ready: isPlaidReady } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  // Wait for the mountain cinematic pan to finish (2.5s)
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => setShowContent(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  // Bouncy entrance animation once shown
  useEffect(() => {
    if (showContent) {
      gsap.fromTo('.onboarding-container', 
        { scale: 0.3, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 1, ease: "elastic.out(1, 0.5)" }
      );
    }
  }, [showContent, isFinanceLoading]);

  if (hasCompletedOnboarding) return null;

  const handleAnswer = (startingXP) => {
    gsap.to('.onboarding-container', {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      onComplete: () => completeOnboarding(startingXP)
    });
  };

  return (
    <div className="vn-overlay">
      {showContent && (
        <>
          <div className="vn-sprites-container">
            <img className="vn-sherpa-sprite sherpa-sprite" src="/sprite_sherpa.png" alt="Sherpa" />
            <div className="vn-player-sprite player-sprite" style={{ filter: 'brightness(0.5)' }}>
              <img src="/sprite_mountaineer.png" alt="Player" className="vn-player-img" />
            </div>
          </div>

          <div className="vn-dialogue-container onboarding-container">
            <div className="vn-dialogue-box speaker-sherpa">
              <div className="vn-speaker-badge sherpa">Sherpa</div>
              
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0, overflow: 'hidden' }}>
                {isFinanceLoading || isLinking ? (
                  <div className="vn-message-text">Gathering Gear... Checking your financial snapshot. The Sherpa is preparing the map... <span style={{animation: 'pulse 1s infinite'}}>...</span></div>
                ) : hasNoData ? (
                  <>
                    <TypewriterText text="The mountain is too treacherous to climb blind. You must securely link your bank account to Take Home so I can guide you." speed={20} />
                    <div className="vn-options-container" style={{ marginTop: 'auto' }}>
                      <button className="vn-option-btn" disabled={!isPlaidReady} onClick={() => openPlaid()}>
                        {isPlaidReady ? 'Link with Plaid' : 'Preparing Link...'}
                      </button>
                      <button className="vn-option-btn" style={{ background: '#475569', borderColor: '#334155', color: '#cbd5e1' }} onClick={() => handleAnswer(0)}>
                        Climb Without Data (Demo)
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <TypewriterText text="Welcome to the Climb. I'm your guide. Your financial journey is a mountain, and every good habit pushes you closer to the summit. Let's figure out where you are starting from." speed={20} />
                    <div className="vn-options-container" style={{ marginTop: 'auto' }}>
                      <button 
                        className="vn-continue-btn"
                        onClick={() => handleAnswer(500)}
                      >
                        Let's get started
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
