import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../store/useGameStore';

export const SherpaGuide = ({ cx, cy }) => {
  const { sherpaMessage } = useGameStore();
  const rigRef = useRef(null);
  const bubbleRef = useRef(null);
  const containerRef = useRef(null);
  
  const [displayedMessage, setDisplayedMessage] = useState("");

  // Typewriter effect
  useEffect(() => {
    setDisplayedMessage("");
    let i = 0;
    
    gsap.fromTo(bubbleRef.current, 
      { scale: 0, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
    );
    
    const talkAnim = gsap.to(rigRef.current, {
      scale: 1.05, duration: 0.2, repeat: -1, yoyo: true
    });

    const intervalId = setInterval(() => {
      setDisplayedMessage(sherpaMessage.substring(0, i + 1));
      i++;
      if (i >= sherpaMessage.length) {
        clearInterval(intervalId);
        talkAnim.kill(); 
        gsap.to(rigRef.current, { scale: 1, duration: 0.2 });
      }
    }, 40);

    return () => {
      clearInterval(intervalId);
      talkAnim.kill();
    };
  }, [sherpaMessage]);

  // Idle Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(rigRef.current, { y: -5, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <g ref={containerRef} transform={`translate(${cx}, ${cy})`}>
      
      {/* Dialogue Bubble */}
      <foreignObject x="-200" y="-200" width="220" height="150" ref={bubbleRef} style={{ overflow: 'visible' }}>
        <div style={{
          backgroundColor: 'rgba(254, 243, 199, 0.95)',
          border: '3px solid #b45309',
          borderRadius: '16px 16px 16px 0',
          padding: '10px 15px',
          color: '#451a03',
          fontSize: '14px',
          fontWeight: 'bold',
          lineHeight: '1.4',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          position: 'absolute',
          bottom: '20px',
          right: '10px',
          width: 'max-content',
          maxWidth: '200px'
        }}>
          {displayedMessage}
          <div style={{
            position: 'absolute',
            bottom: '-12px',
            right: '20px',
            width: '0', height: '0',
            borderTop: '15px solid #b45309',
            borderRight: '15px solid transparent',
          }}>
            <div style={{
              position: 'absolute', top: '-15px', left: '3px',
              width: '0', height: '0',
              borderTop: '10px solid rgba(254, 243, 199, 1)',
              borderRight: '10px solid transparent',
            }}></div>
          </div>
        </div>
      </foreignObject>

      {/* Sherpa Sprite Token */}
      <g ref={rigRef} transform="translate(0, -35)">
        <circle cx="0" cy="0" r="32" fill="#1e293b" />
        <circle cx="0" cy="0" r="30" fill="#fff" stroke="#f59e0b" strokeWidth="4" />
        <clipPath id="sherpaClip">
          <circle cx="0" cy="0" r="28" />
        </clipPath>
        <image 
          href="/sprite_sherpa.jpg" 
          x="-35" y="-35" height="70" width="70" 
          clipPath="url(#sherpaClip)" 
          preserveAspectRatio="xMidYMid slice"
        />
        {/* Glow behind the Sherpa */}
        <circle cx="0" cy="0" r="40" fill="rgba(245, 158, 11, 0.2)" filter="blur(5px)" style={{ pointerEvents: 'none' }} />
      </g>

      {/* Campfire (Right of Sherpa) */}
      <g transform="translate(60, -10)">
        {/* Campfire glow */}
        <circle cx="0" cy="0" r="25" fill="rgba(251, 146, 60, 0.4)" filter="blur(8px)">
          <animate attributeName="r" values="25;28;24;26;25" dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.6;0.3;0.5;0.4" dur="0.8s" repeatCount="indefinite" />
        </circle>
        
        {/* Logs */}
        <path d="M-12 5 L12 -5" stroke="#451a03" strokeWidth="6" strokeLinecap="round" />
        <path d="M-10 -5 L10 5" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
        
        {/* Flames */}
        <path d="M-5 0 Q -10 -15 0 -25 Q 5 -10 -5 0" fill="#ef4444">
          <animate attributeName="d" values="M-5 0 Q -10 -15 0 -25 Q 5 -10 -5 0; M-5 0 Q -5 -15 0 -30 Q 10 -10 -5 0; M-5 0 Q -10 -15 0 -25 Q 5 -10 -5 0" dur="0.4s" repeatCount="indefinite" />
        </path>
        <path d="M0 2 Q 5 -10 10 -15 Q 12 -5 0 2" fill="#f59e0b">
          <animate attributeName="d" values="M0 2 Q 5 -10 10 -15 Q 12 -5 0 2; M0 2 Q 10 -10 15 -20 Q 10 -5 0 2; M0 2 Q 5 -10 10 -15 Q 12 -5 0 2" dur="0.3s" repeatCount="indefinite" />
        </path>
        <path d="M-5 2 Q -8 -8 -12 -12 Q -5 -5 -5 2" fill="#fbbf24">
          <animate attributeName="d" values="M-5 2 Q -8 -8 -12 -12 Q -5 -5 -5 2; M-5 2 Q -12 -10 -15 -18 Q -8 -5 -5 2; M-5 2 Q -8 -8 -12 -12 Q -5 -5 -5 2" dur="0.5s" repeatCount="indefinite" />
        </path>
      </g>
    </g>
  );
};
