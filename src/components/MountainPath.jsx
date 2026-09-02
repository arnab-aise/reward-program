import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Checkpoint } from './Checkpoint';
import { Avatar } from './Avatar';
import { SherpaGuide } from './SherpaGuide';
import { useAudio } from '../hooks/useAudio';
import gsap from 'gsap';

export const MountainPath = () => {
  const { 
    unlockedNodes, completedNodes, activeStageModal, 
    openStageModal, energy, deductEnergy, triggerCollapse,
    setShowShop, inventory, setSherpaMessage
  } = useGameStore();
  const { playSFX } = useAudio();
  const [scrollY, setScrollY] = useState(0);
  const scrollContainerRef = React.useRef(null);

  const checkpoints = {
    base_camp: { id: 'base_camp', label: "Base Camp", cx: 500, cy: 2200 },
    income_valley: { id: 'income_valley', label: "Income Valley", cx: 200, cy: 1900 },
    budget_ridge: { id: 'budget_ridge', label: "Budget Ridge", cx: 750, cy: 1600 },
    aggressive_cliff: { id: 'aggressive_cliff', label: "Aggressive Cliff", cx: 250, cy: 1300 },
    steady_trail: { id: 'steady_trail', label: "Steady Trail", cx: 800, cy: 1300 },
    debt_avalanche: { id: 'debt_avalanche', label: "Debt Avalanche", cx: 500, cy: 1000 },
    savings_camp: { id: 'savings_camp', label: "Savings Camp", cx: 300, cy: 600 },
    summit: { id: 'summit', label: "Summit", cx: 500, cy: 200 },
  };

  const nodeRoutes = {
    'base_camp->income_valley': `M 500 2200 C 500 2050, 200 2100, 200 1900`,
    'income_valley->budget_ridge': `M 200 1900 C 200 1750, 750 1800, 750 1600`,
    'budget_ridge->aggressive_cliff': `M 750 1600 C 750 1450, 250 1450, 250 1300`,
    'budget_ridge->steady_trail': `M 750 1600 C 750 1450, 800 1450, 800 1300`,
    'aggressive_cliff->debt_avalanche': `M 250 1300 C 250 1150, 500 1150, 500 1000`,
    'steady_trail->debt_avalanche': `M 800 1300 C 800 1150, 500 1150, 500 1000`,
    'debt_avalanche->savings_camp': `M 500 1000 C 500 800, 300 800, 300 600`,
    'savings_camp->summit': `M 300 600 C 300 400, 500 400, 500 200`,
  };

  // Find the highest COMPLETED node to place the avatar on.
  // If no nodes are completed, place avatar at base_camp.
  const sortedNodesByAltitude = Object.values(checkpoints).sort((a, b) => a.cy - b.cy); 
  const activeCheckpoint = sortedNodesByAltitude.find(cp => completedNodes.includes(cp.id)) || checkpoints.base_camp;

  const pathRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      // Cinematic Camera Pan
      const targetScroll = activeCheckpoint.cy - (window.innerHeight / 2) + 100;
      gsap.to(scrollContainerRef.current, {
        scrollTop: Math.max(0, targetScroll),
        duration: 2.5,
        ease: "power2.inOut"
      });
    }

    if (scrollContainerRef.current) {
      gsap.to('.path-unlocked', {
        strokeDashoffset: -40,
        duration: 1,
        repeat: -1,
        ease: "none"
      });
    }
  }, [activeCheckpoint.cy]);

  const renderPath = (d, state, key) => {
    if (state === 'locked') {
      return (
        <path key={key} d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeDasharray="5 15" strokeLinecap="round" />
      );
    } else if (state === 'completed') {
      return (
        <g key={key}>
          <path d={d} fill="none" stroke="rgba(74,222,128,0.2)" strokeWidth="12" strokeLinecap="round" />
          <path d={d} fill="none" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #4ade80)' }} />
        </g>
      );
    } else {
      // unlocked / active
      return (
        <g key={key}>
          <path d={d} fill="none" stroke="rgba(253,224,71,0.1)" strokeWidth="12" strokeLinecap="round" />
          <path 
            className="path-unlocked"
            d={d} 
            fill="none" 
            stroke="#fde047" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeDasharray="10 30"
            style={{ filter: 'drop-shadow(0 0 5px #fde047)' }}
          />
        </g>
      );
    }
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="mountain-container" 
      style={{ 
        width: '100%', 
        height: '100vh', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        position: 'relative',
        backgroundColor: '#000'
      }}
      onScroll={(e) => setScrollY(e.target.scrollTop)}
    >
      {/* Parallax Layers */}
      <div 
        style={{
          width: '100%', minWidth: '800px', height: '2400px',
          position: 'absolute', top: 0, left: 0, zIndex: 0,
          backgroundImage: 'url(/bg_mountain.jpg)', backgroundSize: 'cover',
          transform: `translateY(${scrollY * 0.5}px)`,
          filter: 'brightness(0.6) blur(2px)'
        }}
      />
      <div 
        style={{
          width: '100%', minWidth: '800px', height: '2400px',
          position: 'absolute', top: 0, left: 0, zIndex: 1,
          backgroundImage: 'url(/bg_mountain.jpg)', backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          transform: `translateY(${scrollY * 0.2}px)`,
          filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))'
        }}
      />

      {/* Interactive Overlay Layer */}
      <svg 
        viewBox="0 0 1000 2400" 
        style={{ 
          width: '100%', 
          minWidth: '800px', 
          height: '2400px', 
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 10
        }}
      >
        <g>
          {/* Render Paths Based on Status */}
          {Object.entries(nodeRoutes).map(([key, d]) => {
            const [source, target] = key.split('->');
            const isCompleted = completedNodes.includes(target);
            const isUnlocked = unlockedNodes.includes(target);
            const state = isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked';
            return renderPath(d, state, key);
          })}

          {/* Render Obstacles & Difficulties */}
          {/* Black Oval Difficulty (Income Valley -> Budget Ridge) */}
          <g transform="translate(475, 1750)">
            <ellipse cx="0" cy="0" rx="60" ry="25" fill="#0f172a" stroke="#020617" strokeWidth="3" filter="drop-shadow(0 0 15px rgba(0,0,0,0.9))" />
            <ellipse cx="0" cy="0" rx="45" ry="15" fill="#000" />
            {/* Subtle warning particles/swirls could go here, for now keeping it a pure black hole shape */}
          </g>

          {/* Rockslide */}
          {!inventory.includes('emergency_dynamite') && (
            <g transform="translate(500, 1150)">
              <circle cx="-15" cy="0" r="20" fill="#475569" />
              <circle cx="15" cy="5" r="25" fill="#334155" />
              <circle cx="0" cy="-15" r="18" fill="#1e293b" />
              <text x="-12" y="5" fontSize="20">🪨</text>
            </g>
          )}

          {/* Ice Wall */}
          {!inventory.includes('investment_pickaxe') && (
            <g transform="translate(400, 400)">
              <path d="M -50 0 L -30 -40 L 0 -20 L 30 -50 L 60 -10 L 60 20 L -50 20 Z" fill="#38bdf8" opacity="0.8" />
              <path d="M -40 0 L -20 -30 L 10 -10 L 40 -40 L 50 0 Z" fill="#e0f2fe" opacity="0.6" />
              <text x="0" y="5" fontSize="20">🧊</text>
            </g>
          )}

          {/* Render Checkpoints */}
          {Object.values(checkpoints).map((cp) => {
            const isUnlocked = unlockedNodes.includes(cp.id);
            const isCurrent = activeCheckpoint.id === cp.id;
            
            // Allow clicking unlocked or completed nodes
            const handleClick = () => {
              if (completedNodes.includes(cp.id)) {
                // Free to review completed nodes
                openStageModal(cp.id);
              } else if (isUnlocked) {
                // GATING LOGIC
                if (cp.id === 'debt_avalanche' && !inventory.includes('emergency_dynamite')) {
                  playSFX('error');
                  setSherpaMessage("A rockslide blocks the path! You need Emergency Dynamite to clear it.");
                  return;
                }
                if (cp.id === 'summit' && !inventory.includes('investment_pickaxe')) {
                  playSFX('error');
                  setSherpaMessage("An impenetrable ice wall blocks the summit! You need Investment Pickaxes to scale it.");
                  return;
                }

                // Determine energy cost
                const highAltitude = ['debt_avalanche', 'savings_camp', 'summit'].includes(cp.id);
                let cost = highAltitude ? 2 : 1;
                if (highAltitude && inventory.includes('grip_boots')) cost -= 1;
                
                if (energy < cost) {
                  triggerCollapse();
                } else {
                  deductEnergy(cost);
                  openStageModal(cp.id);
                }
              }
            };

            return (
              <g key={cp.id} onClick={handleClick} style={{ cursor: isUnlocked ? 'pointer' : 'default' }}>
                <Checkpoint 
                  cx={cp.cx}
                  cy={cp.cy}
                  label={cp.label}
                  id={cp.id}
                  isCurrent={isCurrent}
                  isUnlocked={isUnlocked || completedNodes.includes(cp.id)}
                />
              </g>
            );
          })}

          {/* Render Avatar */}
          <Avatar 
            nodeId={activeCheckpoint.id} 
            cx={activeCheckpoint.cx} 
            cy={activeCheckpoint.cy} 
            routes={nodeRoutes} 
          />
        </g>
      </svg>

      {/* Floating Shop Button */}
      {(activeCheckpoint.id === 'base_camp' || activeCheckpoint.id === 'savings_camp') && (
        <button
          onClick={() => setShowShop(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'linear-gradient(to right, #0f766e, #0d9488)',
            border: '2px solid #5eead4',
            borderRadius: '50px',
            padding: '1rem 2rem',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            fontFamily: "'Rowdies', cursive",
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 20px rgba(94, 234, 212, 0.4)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>⛺</span> Sherpa Shop
        </button>
      )}
    </div>
  );
};
