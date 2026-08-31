import { useEffect, useRef } from 'react';

// Singleton AudioContext to avoid creating multiple contexts
let audioCtx = null;
const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const useAudio = () => {
  const ambientNodesRef = useRef(null); // { source, gain }
  
  const playSFX = (type) => {
    try {
      const ctx = getAudioCtx();
      
      if (type === 'coin') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
      else if (type === 'thud') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.8, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
      else if (type === 'chime') {
        const createTone = (freq, delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 1);
        };
        createTone(440, 0); // A4
        createTone(554.37, 0.1); // C#5
        createTone(659.25, 0.2); // E5
      }
      else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      console.warn('SFX synthesis failed:', e);
    }
  };

  const playAmbient = (type) => {
    try {
      const ctx = getAudioCtx();
      stopAmbient(); // stop previous
      
      // Simple white noise generator for ambient effects
      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
      
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      
      if (type === 'wind') {
        filter.type = 'lowpass';
        filter.frequency.value = 400; // Muffled wind
        gain.gain.value = 0.1;
      } else if (type === 'storm') {
        filter.type = 'bandpass';
        filter.frequency.value = 1000; // Harsher howling
        gain.gain.value = 0.2;
      } else if (type === 'fire') {
        filter.type = 'lowpass';
        filter.frequency.value = 200; // Low rumble
        gain.gain.value = 0.05;
      } else {
        return;
      }

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noiseSource.start();
      
      ambientNodesRef.current = { source: noiseSource, gain };
    } catch(e) {
      console.warn('Ambient synthesis failed:', e);
    }
  };

  const stopAmbient = () => {
    if (ambientNodesRef.current) {
      try {
        ambientNodesRef.current.source.stop();
        ambientNodesRef.current.source.disconnect();
        ambientNodesRef.current.gain.disconnect();
      } catch(e) {}
      ambientNodesRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopAmbient();
  }, []);

  return { playSFX, playAmbient, stopAmbient };
};
