import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGameStore } from '../store/useGameStore';

gsap.registerPlugin(MotionPathPlugin);

export const Avatar = ({ nodeId, cx, cy, routes }) => {
  const { playerState, setPlayerState, inventory } = useGameStore();
  const containerRef = useRef(null);
  const rigRef = useRef(null);
  const prevNodeId = useRef(nodeId);

  useEffect(() => {
    if (prevNodeId.current !== nodeId) {
      const stateToSet = nodeId === 'summit' ? 'climb' : 'walk';
      setPlayerState(stateToSet);
      
      // Explosion effect if clearing the rockslide
      if (nodeId === 'debt_avalanche') {
        gsap.fromTo('.mountain-container', { x: -15 }, { x: 15, yoyo: true, repeat: 7, duration: 0.05, clearProps: 'x' });
      }
      
      const routeKey = `${prevNodeId.current}->${nodeId}`;
      const pathString = routes[routeKey];
      
      if (pathString) {
        // Find approximate direction to flip avatar (left/right)
        // A simple heuristic based on standard mountain progression
        const isMovingLeft = pathString.includes(' 250 ') || pathString.includes(' 200 '); 
        const flipScale = isMovingLeft ? -1 : 1; 
        gsap.to(rigRef.current, { scaleX: flipScale, duration: 0.2 });

        gsap.to(containerRef.current, {
          motionPath: {
            path: pathString,
            alignOrigin: [0.5, 0.5],
            autoRotate: false
          },
          duration: 3,
          ease: 'power1.inOut',
          onComplete: () => {
            setPlayerState('celebrate');
            setTimeout(() => setPlayerState('idle'), 2000);
          }
        });
      } else {
        // Fallback linear if no route string defined (e.g. teleporting back)
        gsap.to(containerRef.current, {
          x: cx, y: cy, duration: 1.5, ease: 'power1.inOut',
          onComplete: () => setPlayerState('idle')
        });
      }
      
      prevNodeId.current = nodeId;
    } else {
      // Initial mount position
      gsap.set(containerRef.current, { x: cx, y: cy });
    }
  }, [nodeId, cx, cy, routes, setPlayerState]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.killTweensOf([rigRef.current]);
      gsap.set([rigRef.current], { clearProps: 'all' });
      
      if (playerState === 'idle') {
        gsap.to(rigRef.current, { y: -5, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      } 
      else if (playerState === 'walk') {
        gsap.to(rigRef.current, { y: -15, rotation: 10, duration: 0.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }
      else if (playerState === 'climb') {
        gsap.to(rigRef.current, { x: -10, rotation: -15, duration: 0.3, repeat: -1, yoyo: true, ease: 'power1.inOut' });
      }
      else if (playerState === 'celebrate') {
        gsap.to(rigRef.current, { y: -30, scale: 1.2, duration: 0.3, repeat: 3, yoyo: true, ease: 'power1.out' });
      }
    }, containerRef);
    return () => ctx.revert();
  }, [playerState]);

  return (
    <g ref={containerRef}>
      <g ref={rigRef} transform="translate(0, -35)">
        {/* Dynamic Gear Overlays */}
        {inventory.includes('golden_backpack') && (
          <ellipse cx="0" cy="5" rx="35" ry="35" fill="none" stroke="#fde047" strokeWidth="4" strokeDasharray="5 5" style={{ filter: 'drop-shadow(0 0 10px #fde047)' }} />
        )}
        
        {/* Token Style Player Avatar using Generated Game Asset */}
        <circle cx="0" cy="0" r="32" fill="#1e293b" />
        <circle cx="0" cy="0" r="30" fill="#fff" stroke="#38bdf8" strokeWidth="4" />
        
        <clipPath id="avatarClip">
          <circle cx="0" cy="0" r="28" />
        </clipPath>
        
        <image 
          href="/sprite_mountaineer.jpg" 
          x="-35" y="-35" height="70" width="70" 
          clipPath="url(#avatarClip)" 
          preserveAspectRatio="xMidYMid slice"
        />

        {/* Tent Overlay */}
        {inventory.includes('reinforced_tent') && (
          <path d="M -15 -35 L 15 -35 L 15 -25 L -15 -25 Z" fill="#065f46" stroke="#fff" strokeWidth="1" rx="5" />
        )}
        
        {/* Climbing Pickaxes (Only visible when climbing to summit) */}
        {playerState === 'climb' && (
          <g>
            <path d="M -45 -10 L -25 -10 L -30 20" stroke="#f8fafc" strokeWidth="3" fill="none" />
            <path d="M 45 -10 L 25 -10 L 30 20" stroke="#f8fafc" strokeWidth="3" fill="none" />
            <text x="-60" y="0" fontSize="24">⛏️</text>
            <text x="35" y="0" fontSize="24">⛏️</text>
          </g>
        )}
        
        {/* Little pointer base / Boots */}
        {inventory.includes('grip_boots') ? (
          <g>
            <path d="M -15 30 L 15 30 L 15 40 L -15 40 Z" fill="#78350f" rx="3" />
            <path d="M -12 40 L -8 45 L -4 40 L 0 45 L 4 40 L 8 45 L 12 40" fill="none" stroke="#d97706" strokeWidth="2" />
          </g>
        ) : (
          <path d="M -10 30 L 0 45 L 10 30 Z" fill="#38bdf8" />
        )}
      </g>
    </g>
  );
};
