import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import gsap from 'gsap';

export const Checkpoint = ({ cx, cy, label, id, isUnlocked, isCurrent }) => {
  const { openStageModal, nodeStars } = useGameStore();
  const nodeRef = useRef(null);
  const pulseRef = useRef(null);
  const crystalRef = useRef(null);
  
  const stars = nodeStars[id] || 0;
  const isLocked = !isUnlocked && !isCurrent;

  useEffect(() => {
    if (isCurrent) {
      gsap.to(pulseRef.current, {
        scale: 1.8,
        opacity: 0,
        duration: 1.5,
        repeat: -1,
        ease: "sine.out"
      });
      // Floating crystal effect
      gsap.to(crystalRef.current, {
        y: -10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
    
    // Idle bounce for all unlocked nodes
    if (!isLocked && !isCurrent) {
      gsap.to(crystalRef.current, {
        y: -5,
        duration: 1.5 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, [isCurrent, isLocked]);

  const handleClick = () => {
    if (isLocked) return;
    
    gsap.timeline()
      .to(nodeRef.current, { scale: 0.8, duration: 0.1 })
      .to(nodeRef.current, { scale: 1.1, duration: 0.1 })
      .to(nodeRef.current, { scale: 1, duration: 0.1, onComplete: () => openStageModal(id) });
  };

  const colors = {
    locked: { core: '#475569', glow: '#1e293b' },
    unlocked: { core: '#38bdf8', glow: '#0284c7' },
    current: { core: '#fde047', glow: '#d97706' },
    completed: { core: '#4ade80', glow: '#16a34a' }
  };

  let stateColor = colors.locked;
  if (stars > 0) stateColor = colors.completed;
  else if (isCurrent) stateColor = colors.current;
  else if (isUnlocked) stateColor = colors.unlocked;

  return (
    <g 
      transform={`translate(${cx}, ${cy})`} 
      onClick={handleClick}
      style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
    >
      <defs>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="0" cy="20" rx="25" ry="10" fill="rgba(0,0,0,0.6)" filter="blur(2px)" />

      {/* Current Level Pulse */}
      {isCurrent && (
        <circle 
          ref={pulseRef}
          cx="0" cy="0" r="30" 
          fill="none" stroke={stateColor.glow} strokeWidth="6" 
          filter={`url(#glow-${id})`}
        />
      )}

      <g ref={nodeRef}>
        <g ref={crystalRef}>
          {/* Floating Glowing Crystal */}
          {(!isLocked) && (
            <circle cx="0" cy="0" r="35" fill={stateColor.glow} filter={`url(#glow-${id})`} opacity="0.4" />
          )}
          
          {/* Crystal Shape */}
          <path 
            d="M 0 -30 L 20 0 L 0 30 L -20 0 Z" 
            fill={stateColor.core} 
            stroke="#fff" 
            strokeWidth={isCurrent ? "3" : "1"} 
          />
          <path d="M 0 -30 L 20 0 L 0 0 Z" fill="rgba(255,255,255,0.4)" />
          <path d="M -20 0 L 0 0 L 0 30 Z" fill="rgba(0,0,0,0.2)" />
        </g>

        {/* Node Number */}
        <text 
          x="0" y="5" 
          textAnchor="middle" 
          fill={isLocked ? "#94a3b8" : "#fff"} 
          fontSize="18" 
          fontWeight="bold"
          fontFamily="'Rowdies', cursive"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
        >
          {isLocked ? "🔒" : "✦"}
        </text>

        {/* Stars Container (If Completed) */}
        {stars > 0 && (
          <g transform="translate(0, -45)">
            <path d="M-15 0 L-10 10 L0 10 L-7 15 L-5 25 L-15 18 L-25 25 L-23 15 L-30 10 L-20 10 Z" fill={stars >= 1 ? '#fbbf24' : '#475569'} stroke="#000" strokeWidth="1" transform="scale(0.8) translate(-5, 0)" />
            <path d="M-15 0 L-10 10 L0 10 L-7 15 L-5 25 L-15 18 L-25 25 L-23 15 L-30 10 L-20 10 Z" fill={stars >= 2 ? '#fbbf24' : '#475569'} stroke="#000" strokeWidth="1" transform="scale(1) translate(15, -5)" />
            <path d="M-15 0 L-10 10 L0 10 L-7 15 L-5 25 L-15 18 L-25 25 L-23 15 L-30 10 L-20 10 Z" fill={stars >= 3 ? '#fbbf24' : '#475569'} stroke="#000" strokeWidth="1" transform="scale(0.8) translate(35, 0)" />
          </g>
        )}

        {/* Stage Label */}
        <rect x="-60" y="35" width="120" height="26" rx="13" fill="rgba(0,0,0,0.8)" border="1px solid #fff" />
        <text x="0" y="52" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
          {label}
        </text>
      </g>
    </g>
  );
};
