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
    
    // Slight bounce for the active speaker
    const speakerClass = currentLine.speaker === 'Sherpa' ? '.sherpa-portrait' : '.mountaineer-portrait';
    gsap.fromTo(speakerClass, 
      { y: 10 }, 
      { y: 0, duration: 0.3, ease: 'power2.out' }
    );
    
    // Dim the non-speaker
    const nonSpeakerClass = currentLine.speaker === 'Sherpa' ? '.mountaineer-portrait' : '.sherpa-portrait';
    gsap.to(nonSpeakerClass, { filter: 'brightness(0.5)', duration: 0.3 });
    gsap.to(speakerClass, { filter: 'brightness(1)', duration: 0.3 });

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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'flex-end',
      zIndex: 400,
      cursor: 'pointer'
    },
    portraitsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '0 20px',
      height: '60vh'
    },
    portraitWrap: {
      width: '45%',
      maxWidth: '350px',
      border: '6px solid #b45309',
      borderRadius: '20px 20px 0 0',
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
      borderBottom: 'none'
    },
    portraitImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    },
    dialogueBox: {
      backgroundImage: 'url(/ui_wooden_board.jpg)',
      backgroundSize: '100% 100%',
      width: '100%',
      height: '35vh',
      padding: '40px 60px',
      borderTop: '6px solid #92400e',
      boxShadow: '0 -20px 50px rgba(0,0,0,0.9)',
      position: 'relative'
    },
    speakerName: {
      fontSize: '28px',
      fontFamily: "'Rowdies', cursive",
      color: currentLine.speaker === 'Sherpa' ? '#fde047' : '#38bdf8',
      marginBottom: '15px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
    },
    dialogueText: {
      fontSize: '22px',
      color: '#f8fafc',
      lineHeight: '1.6',
      fontWeight: 'bold',
      textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
    },
    continueIndicator: {
      position: 'absolute',
      bottom: '20px',
      right: '40px',
      color: '#fbbf24',
      fontSize: '18px',
      animation: 'pulse 1s infinite'
    }
  };

  return (
    <div className="dialogue-overlay" style={styles.overlay} onClick={handleNext}>
      <div style={styles.portraitsContainer}>
        {/* Sherpa Left */}
        <div className="sherpa-portrait" style={styles.portraitWrap}>
          <img src="/portrait_sherpa.jpg" alt="Sherpa" style={styles.portraitImg} />
        </div>
        
        {/* Mountaineer Right */}
        <div className="mountaineer-portrait" style={styles.portraitWrap}>
          <img src="/portrait_mountaineer.jpg" alt="You" style={styles.portraitImg} />
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
