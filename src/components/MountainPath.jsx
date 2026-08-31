import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Checkpoint } from './Checkpoint';
import { Avatar } from './Avatar';
import { SherpaGuide } from './SherpaGuide';
import gsap from 'gsap';

export const MountainPath = () => {
  const { currentLevel } = useGameStore();
  const [scrollY, setScrollY] = useState(0);
  const scrollContainerRef = React.useRef(null);

  const checkpoints = [
    { level: 0, label: "Base Camp", cx: 500, cy: 1400 },
    { level: 1, label: "Camp 2",    cx: 300, cy: 1100 },
    { level: 2, label: "Camp 3",    cx: 700, cy: 800 },
    { level: 3, label: "Camp 4",    cx: 400, cy: 500 },
    { level: 4, label: "Summit",    cx: 500, cy: 200 },
  ];

  const activeCheckpoint = checkpoints[currentLevel] || checkpoints[0];

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

    if (pathRef.current) {
      gsap.to(pathRef.current, {
        strokeDashoffset: -40,
        duration: 1,
        repeat: -1,
        ease: "none"
      });
    }
  }, [currentLevel, activeCheckpoint.cy]);

  const pathD = `
    M ${checkpoints[0].cx} ${checkpoints[0].cy}
    C 500 1200, 200 1250, ${checkpoints[1].cx} ${checkpoints[1].cy}
    C 200 950, 800 1000, ${checkpoints[2].cx} ${checkpoints[2].cy}
    C 800 650, 300 700, ${checkpoints[3].cx} ${checkpoints[3].cy}
    C 300 350, 500 300, ${checkpoints[4].cx} ${checkpoints[4].cy}
  `;

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
      {/* High-Resolution Painted Background */}
      <img 
        src="/bg_mountain.jpg" 
        alt="Mountain Background" 
        style={{
          width: '100%',
          minWidth: '800px',
          height: '1600px',
          objectFit: 'cover',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0
        }}
      />

      {/* Interactive Overlay Layer */}
      <svg 
        viewBox="0 0 1000 1600" 
        style={{ 
          width: '100%', 
          minWidth: '800px', 
          height: '1600px', 
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 10
        }}
      >
        <g>
          {/* Animated Glowing Path */}
          <path d={pathD} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
          <path 
            ref={pathRef}
            d={pathD} 
            fill="none" 
            stroke="#fde047" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeDasharray="10 30"
            style={{ filter: 'drop-shadow(0 0 5px #fde047)' }}
          />

          {/* Render Checkpoints */}
          {checkpoints.map((cp) => (
            <Checkpoint 
              key={cp.level}
              cx={cp.cx}
              cy={cp.cy}
              label={cp.label}
              level={cp.level}
              isCurrent={currentLevel === cp.level}
              isUnlocked={currentLevel >= cp.level}
            />
          ))}

          {/* The Sherpa waits at the NEXT checkpoint */}
          <SherpaGuide 
            cx={checkpoints[Math.min(currentLevel + 1, 4)].cx + 80} 
            cy={checkpoints[Math.min(currentLevel + 1, 4)].cy} 
          />

          {/* Render Avatar */}
          <Avatar cx={activeCheckpoint.cx} cy={activeCheckpoint.cy} />
        </g>
      </svg>
    </div>
  );
};
