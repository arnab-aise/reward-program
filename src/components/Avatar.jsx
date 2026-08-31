import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../store/useGameStore';

export const Avatar = ({ cx, cy }) => {
  const { playerState, setPlayerState } = useGameStore();
  const containerRef = useRef(null);
  const rigRef = useRef(null);
  const prevPos = useRef({ cx, cy });

  useEffect(() => {
    if (prevPos.current.cx !== cx || prevPos.current.cy !== cy) {
      setPlayerState('walk');
      
      const flipScale = prevPos.current.cx > cx ? -1 : 1; 
      gsap.to(rigRef.current, { scaleX: flipScale, duration: 0.2 });

      gsap.to(containerRef.current, {
        x: cx,
        y: cy,
        duration: 1.5,
        ease: 'power1.inOut',
        onComplete: () => {
          setPlayerState('celebrate');
          setTimeout(() => setPlayerState('idle'), 2000);
        }
      });
      prevPos.current = { cx, cy };
    } else {
      gsap.set(containerRef.current, { x: cx, y: cy });
    }
  }, [cx, cy, setPlayerState]);

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
      else if (playerState === 'celebrate') {
        gsap.to(rigRef.current, { y: -30, scale: 1.2, duration: 0.3, repeat: 3, yoyo: true, ease: 'power1.out' });
      }
    }, containerRef);
    return () => ctx.revert();
  }, [playerState]);

  return (
    <g ref={containerRef}>
      <g ref={rigRef} transform="translate(0, -35)">
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
        {/* Little pointer base */}
        <path d="M -10 30 L 0 45 L 10 30 Z" fill="#38bdf8" />
      </g>
    </g>
  );
};
