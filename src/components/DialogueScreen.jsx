import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import { TypewriterText } from './TypewriterText';
import './ConversationalUI.css';

export const DialogueScreen = ({ script, onComplete }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const currentLine = script[lineIndex];

  useEffect(() => {
    if (!currentLine) return;
    setIsTyping(true);
    
    // Cinematic Visual Novel animations
    const isSherpa = currentLine.speaker === 'Sherpa';

    if (isSherpa) {
      gsap.to('.sherpa-sprite', { scale: 1.05, filter: 'brightness(1)', opacity: 1, duration: 0.3 });
      gsap.to('.player-sprite', { scale: 0.95, filter: 'brightness(0.5)', opacity: 0.7, duration: 0.3 });
    } else {
      gsap.to('.player-sprite', { scale: 1.05, filter: 'brightness(1)', opacity: 1, duration: 0.3 });
      gsap.to('.sherpa-sprite', { scale: 0.95, filter: 'brightness(0.5)', opacity: 0.7, duration: 0.3 });
    }
  }, [lineIndex, currentLine]);

  const handleNext = () => {
    if (!isTyping) {
      if (lineIndex + 1 < script.length) {
        setLineIndex(lineIndex + 1);
      } else {
        // Fade out and complete
        gsap.to('.dialogue-overlay', { opacity: 0, duration: 0.5, onComplete });
      }
    }
  };

  if (!currentLine) return null;

  // Entrance animation
  useEffect(() => {
    gsap.fromTo('.dialogue-overlay', { opacity: 0 }, { opacity: 1, duration: 0.5 });
    gsap.fromTo('.sherpa-sprite', { x: -100 }, { x: 0, duration: 0.5, delay: 0.2 });
    gsap.fromTo('.player-sprite', { x: 100 }, { x: 0, duration: 0.5, delay: 0.3 });
    gsap.fromTo('.dialogue-box-container', { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.4 });
  }, []);

  return (
    <div className="vn-overlay dialogue-overlay">
      
      <div className="vn-sprites-container">
        <img className="vn-sherpa-sprite sherpa-sprite" src="/sprite_sherpa.png" alt="Sherpa" />
        <div className="vn-player-sprite player-sprite" style={{ opacity: 0.7, filter: 'brightness(0.5)' }}>
          <img src="/sprite_mountaineer.png" alt="Player" className="vn-player-img" />
        </div>
      </div>
      
      <div className="vn-dialogue-container dialogue-box-container">
        <div 
          className={`vn-dialogue-box speaker-${currentLine.speaker === 'Sherpa' ? 'sherpa' : 'player'}`} 
          onClick={handleNext}
          style={{ cursor: isTyping ? 'default' : 'pointer' }}
        >
          
          <div className={`vn-speaker-badge ${currentLine.speaker === 'Sherpa' ? 'sherpa' : 'player'}`}>
            {currentLine.speaker}
          </div>
          
          {/* Note: TypewriterText handles its own skipping when clicked, which triggers onComplete to set isTyping to false */}
          <TypewriterText 
            key={lineIndex} 
            text={currentLine.text} 
            speed={25} 
            onComplete={() => setIsTyping(false)} 
          />

          {!isTyping && (
            <div className="vn-continue-indicator">▼</div>
          )}
          
        </div>
      </div>
    </div>
  );
};
