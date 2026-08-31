import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

export const DialogueScreen = ({ script, onComplete }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const currentLine = script[lineIndex];

  useEffect(() => {
    // Typewriter effect
    if (!currentLine) return;
    
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    
    // Cinematic Visual Novel animations
    const isSherpa = currentLine.speaker === 'Sherpa';
    const activeClass = isSherpa ? '.sherpa-portrait' : '.mountaineer-portrait';
    const inactiveClass = isSherpa ? '.mountaineer-portrait' : '.sherpa-portrait';

    // Bring active speaker to foreground
    gsap.to(activeClass, { 
      filter: 'brightness(1) saturate(1.1) drop-shadow(0 0 20px rgba(0,0,0,0.8))', 
      scale: 1, 
      zIndex: 10,
      opacity: 1,
      duration: 0.4, 
      ease: 'power2.out' 
    });

    // Push inactive speaker to background
    gsap.to(inactiveClass, { 
      filter: 'brightness(0.4) saturate(0.5) blur(2px)', 
      scale: 0.85, 
      zIndex: 5,
      opacity: 0.8,
      duration: 0.4,
      ease: 'power2.inOut'
    });

    const intervalId = setInterval(() => {
      setDisplayedText(currentLine.text.substring(0, i + 1));
      i++;
      if (i >= currentLine.text.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 30);

    return () => clearInterval(intervalId);
  }, [lineIndex, currentLine]);

  const handleNext = () => {
    if (isTyping) {
      // Skip typing
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else {
      if (lineIndex + 1 < script.length) {
        setLineIndex(lineIndex + 1);
      } else {
        // Fade out and complete
        gsap.to('.dialogue-overlay', { opacity: 0, duration: 0.5, onComplete });
      }
    }
  };

  if (!currentLine) return null;

  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'transparent',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'flex-end',
      zIndex: 400,
      cursor: 'pointer'
    },
    fogLayer: {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      backgroundImage: 'url(/weather_fog.png)',
      backgroundSize: 'cover',
      opacity: 0.4,
      animation: 'drift 60s linear infinite',
      pointerEvents: 'none',
      zIndex: 1
    },
    portraitsContainer: {
      position: 'absolute',
      bottom: '15vh', // Sit behind the dialogue box
      left: 0,
      width: '100%',
      height: '80vh',
      display: 'flex',
      justifyContent: 'space-between',
      pointerEvents: 'none'
    },
    portraitWrap: (side) => ({
      position: 'absolute',
      bottom: '-50px',
      [side]: '-5%',
      width: '55%',
      maxWidth: '600px',
      height: '100%',
      transformOrigin: 'bottom center',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
      filter: 'brightness(0.4) saturate(0.5)', // start dimmed
      opacity: 0,
      scale: 0.85
    }),
    portraitImg: (side) => ({
      height: '100%',
      objectFit: 'contain',
      objectPosition: 'bottom',
      transform: side === 'right' ? 'scaleX(-1)' : 'none', // flip mountaineer to face sherpa
      maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%)',
      WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%)'
    }),
    dialogueBox: {
      backgroundImage: 'url(/ui_wooden_board.jpg)',
      backgroundSize: '100% 100%',
      width: '95%',
      maxWidth: '1200px',
      margin: '0 auto 20px auto',
      height: 'auto',
      minHeight: '25vh',
      maxHeight: '40vh',
      padding: '50px 80px',
      boxShadow: '0 -10px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)',
      position: 'relative',
      zIndex: 20,
      boxSizing: 'border-box',
      overflowY: 'auto'
    },
    speakerName: {
      fontSize: 'clamp(24px, 4vw, 36px)',
      fontFamily: "'Rowdies', cursive",
      color: currentLine.speaker === 'Sherpa' ? '#fde047' : '#38bdf8',
      marginBottom: '10px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5)',
      borderBottom: '2px solid rgba(255,255,255,0.1)',
      paddingBottom: '10px'
    },
    dialogueText: {
      fontSize: 'clamp(18px, 3vw, 24px)',
      color: '#f8fafc',
      lineHeight: '1.6',
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
      fontFamily: "'Nunito', sans-serif"
    },
    continueIndicator: {
      position: 'absolute',
      bottom: '15px',
      right: '25px',
      color: '#fbbf24',
      fontSize: '16px',
      fontWeight: 'bold',
      animation: 'pulse 1s infinite'
    }
  };

  return (
    <div className="dialogue-overlay" style={styles.overlay} onClick={handleNext}>
      <div style={styles.fogLayer}></div>
      <style>{`
        @keyframes drift {
          from { background-position: 0 0; }
          to { background-position: 1000px 0; }
        }
      `}</style>
      <div style={styles.portraitsContainer}>
        {/* Sherpa Left */}
        <div className="sherpa-portrait" style={styles.portraitWrap('left')}>
          <img src="/portrait_sherpa.jpg" alt="Sherpa" style={styles.portraitImg('left')} />
        </div>
        
        {/* Mountaineer Right */}
        <div className="mountaineer-portrait" style={styles.portraitWrap('right')}>
          <img src="/portrait_mountaineer.jpg" alt="You" style={styles.portraitImg('right')} />
        </div>
      </div>
      
      <div style={styles.dialogueBox}>
        <div style={styles.speakerName}>{currentLine.speaker}</div>
        <div style={styles.dialogueText}>{displayedText}</div>
        
        {!isTyping && (
          <div style={styles.continueIndicator}>Tap to continue ▼</div>
        )}
      </div>
    </div>
  );
};
