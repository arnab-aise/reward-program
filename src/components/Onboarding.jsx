import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import gsap from 'gsap';

export const Onboarding = () => {
  const { hasCompletedOnboarding, completeOnboarding } = useGameStore();
  const [step, setStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Wait for the mountain cinematic pan to finish (2.5s)
  React.useEffect(() => {
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => setShowContent(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  // Bouncy entrance animation once shown
  React.useEffect(() => {
    if (showContent) {
      gsap.fromTo('.onboarding-container', 
        { scale: 0.3, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 1, ease: "elastic.out(1, 0.5)" }
      );
    }
  }, [showContent]);

  if (hasCompletedOnboarding) return null;

  const handleAnswer = (startingXP) => {
    // Small exit animation before completing
    gsap.to('.onboarding-container', {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      onComplete: () => completeOnboarding(startingXP)
    });
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 400,
      pointerEvents: 'none' // Allow clicks to pass through empty space if needed, though the container should block them
    },
    container: {
      pointerEvents: 'auto', // Re-enable pointer events for the modal itself
      background: 'linear-gradient(to bottom, #78350f, #451a03)', // Wooden texture feel
      border: '6px solid #290f01',
      borderRadius: '24px',
      padding: '25px',
      width: '90%',
      maxWidth: '500px',
      textAlign: 'center',
      boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 4px 10px rgba(255,255,255,0.2)'
    },
    innerPanel: {
      backgroundColor: '#fef3c7', // Parchment feel
      borderRadius: '16px',
      padding: '30px',
      border: '4px solid #92400e',
      color: '#451a03',
      boxShadow: 'inset 0 0 20px rgba(180, 83, 9, 0.3)'
    },
    sherpaIcon: {
      fontSize: '72px',
      marginBottom: '15px',
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
    },
    title: {
      fontSize: '32px',
      fontFamily: "'Rowdies', cursive",
      marginBottom: '15px',
      color: '#92400e',
      textShadow: '0 2px 2px rgba(255,255,255,0.8)',
      textTransform: 'uppercase'
    },
    subtitle: {
      fontSize: '18px',
      color: '#78350f',
      marginBottom: '30px',
      lineHeight: '1.5',
      fontWeight: 'bold'
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    button: {
      background: 'linear-gradient(to bottom, #38bdf8, #0284c7)',
      color: '#fff',
      border: 'none',
      borderBottom: '6px solid #0369a1',
      padding: '18px',
      borderRadius: '18px',
      fontSize: '20px',
      fontFamily: "'Rowdies', cursive",
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      boxShadow: '0 8px 15px rgba(0,0,0,0.4)',
      transition: 'all 0.1s'
    },
    xpBadge: {
      color: '#fef08a',
      textShadow: '0 1px 2px rgba(0,0,0,0.8)'
    }
  };

  return (
    <div style={styles.overlay}>
      {showContent && (
        <div className="onboarding-container" style={styles.container}>
          <div style={styles.innerPanel}>
            <div style={styles.sherpaIcon}>🏔️</div>
            
            {step === 0 && (
              <>
              <div style={styles.title}>Namaste, Climber.</div>
              <div style={styles.subtitle}>
                I am your Sherpa, your guide for this expedition. The True Harbor mountain is steep, but every good financial habit pushes you closer to the summit. 
                <br /><br />
                Before we begin, we must figure out where you are starting from.
              </div>
              <div style={styles.buttonContainer}>
                <button 
                  style={styles.button} 
                  onPointerDown={(e) => e.currentTarget.style.transform = 'translateY(4px)'}
                  onPointerUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  onPointerLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  onClick={() => setStep(1)}
                >
                  Let's get started
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div style={styles.title}>What's your primary goal right now?</div>
              <div style={styles.subtitle}>
                This will help us chart your path and determine your starting camp.
              </div>
              <div style={styles.buttonContainer}>
                <button style={styles.button} onClick={() => handleAnswer(0)}>
                  <span>I'm just starting to save</span>
                  <span style={styles.xpBadge}>Start at Base Camp</span>
                </button>
                <button style={styles.button} onClick={() => handleAnswer(1000)}>
                  <span>I'm paying off debt</span>
                  <span style={styles.xpBadge}>+1000 XP (Camp 2)</span>
                </button>
                <button style={styles.button} onClick={() => handleAnswer(2000)}>
                  <span>I'm actively investing</span>
                  <span style={styles.xpBadge}>+2000 XP (Camp 3)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
