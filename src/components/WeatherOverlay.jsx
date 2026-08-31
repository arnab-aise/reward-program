import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../store/useGameStore';

export const WeatherOverlay = () => {
  const { currentLevel } = useGameStore();
  const canvasRef = useRef(null);
  const [weatherType, setWeatherType] = useState('sunrise'); // 'sunrise', 'fog', 'blizzard'

  useEffect(() => {
    if (currentLevel <= 1) setWeatherType('sunrise');
    else if (currentLevel <= 3) setWeatherType('fog');
    else setWeatherType('blizzard');
  }, [currentLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Particle System
    const particles = [];
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 3 + 1,
        opacity: Math.random()
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (weatherType === 'sunrise') {
        // Sunrise: glowing motes
        particles.forEach(p => {
          ctx.fillStyle = `rgba(253, 230, 138, ${p.opacity * 0.5})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          
          p.y -= p.speedY * 0.2;
          p.x += Math.sin(p.y * 0.05);
          if (p.y < 0) p.y = canvas.height;
        });
      } 
      else if (weatherType === 'fog') {
        // Fog: Slow horizontal moving mist particles
        particles.forEach(p => {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.2})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
          
          p.x += 1;
          if (p.x > canvas.width) p.x = 0;
        });
      }
      else if (weatherType === 'blizzard') {
        // Blizzard: Fast diagonal snow
        particles.forEach(p => {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          
          p.y += p.speedY * 3;
          p.x += p.speedY * 1.5; // Wind blowing right
          if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
          }
        });
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    // GSAP Transitions for global tint
    const tintColors = {
      sunrise: 'rgba(252, 211, 77, 0.1)',
      fog: 'rgba(148, 163, 184, 0.4)',
      blizzard: 'rgba(15, 23, 42, 0.6)'
    };

    gsap.to('.weather-tint', {
      backgroundColor: tintColors[weatherType],
      duration: 2
    });

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [weatherType]);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          pointerEvents: 'none',
          zIndex: 150 // Above background, below UI
        }}
      />
      <div 
        className="weather-tint"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          pointerEvents: 'none',
          zIndex: 5
        }}
      />
    </>
  );
};
