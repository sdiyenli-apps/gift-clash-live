// Sound Effects Manager using Web Audio API
import { useRef, useCallback, useEffect } from 'react';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  attack?: number;
  decay?: number;
}

const SOUND_CONFIGS: Record<string, SoundConfig> = {
  shoot: { frequency: 800, duration: 0.08, type: 'sawtooth', volume: 0.15, attack: 0.01 },
  shootUltra: { frequency: 1200, duration: 0.12, type: 'square', volume: 0.2, attack: 0.01 },
  explosion: { frequency: 80, duration: 0.3, type: 'sawtooth', volume: 0.25, attack: 0.01, decay: 0.2 },
  hit: { frequency: 200, duration: 0.1, type: 'square', volume: 0.15 },
  hurt: { frequency: 150, duration: 0.15, type: 'sawtooth', volume: 0.2, decay: 0.1 },
  heal: { frequency: 600, duration: 0.2, type: 'sine', volume: 0.15, attack: 0.05 },
  armor: { frequency: 400, duration: 0.15, type: 'triangle', volume: 0.2 },
  dash: { frequency: 300, duration: 0.25, type: 'sine', volume: 0.15, attack: 0.02 },
  enemyDeath: { frequency: 100, duration: 0.4, type: 'sawtooth', volume: 0.2, decay: 0.3 },
  bossTaunt: { frequency: 60, duration: 0.5, type: 'square', volume: 0.25, attack: 0.1 },
  bossFireball: { frequency: 120, duration: 0.3, type: 'sawtooth', volume: 0.3, attack: 0.02 },
  bossMegaAttack: { frequency: 40, duration: 1.0, type: 'sawtooth', volume: 0.4, attack: 0.1, decay: 0.8 },
  chicken: { frequency: 1500, duration: 0.1, type: 'sine', volume: 0.1 },
  gift: { frequency: 900, duration: 0.15, type: 'triangle', volume: 0.15, attack: 0.02 },
  victory: { frequency: 523.25, duration: 0.5, type: 'sine', volume: 0.2, attack: 0.05 },
  gameOver: { frequency: 200, duration: 0.8, type: 'sawtooth', volume: 0.25, decay: 0.7 },
  magicFlash: { frequency: 1000, duration: 0.2, type: 'sine', volume: 0.2, attack: 0.01 },
  spawn: { frequency: 250, duration: 0.2, type: 'triangle', volume: 0.15 },
};

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const musicOscillatorRef = useRef<OscillatorNode | null>(null);
  const isMusicPlayingRef = useRef(false);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSound = useCallback((soundName: keyof typeof SOUND_CONFIGS) => {
    if (!audioContextRef.current) return;
    
    const config = SOUND_CONFIGS[soundName];
    if (!config) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = config.type;
    oscillator.frequency.value = config.frequency;
    
    const now = ctx.currentTime;
    const attack = config.attack || 0.01;
    const decay = config.decay || config.duration * 0.8;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(config.volume, now + attack);
    gainNode.gain.linearRampToValueAtTime(0, now + config.duration);
    
    // Add frequency sweep for some sounds
    if (soundName === 'shoot' || soundName === 'shootUltra') {
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.5, now + config.duration);
    } else if (soundName === 'explosion' || soundName === 'bossMegaAttack') {
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.2, now + config.duration);
    } else if (soundName === 'heal') {
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 1.5, now + config.duration);
    }
    
    oscillator.start(now);
    oscillator.stop(now + config.duration);
  }, []);

  // Dramatic war music - procedurally generated
  const startMusic = useCallback(() => {
    if (!audioContextRef.current || isMusicPlayingRef.current) return;
    
    const ctx = audioContextRef.current;
    isMusicPlayingRef.current = true;
    
    // Create master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.12;
    masterGain.connect(ctx.destination);
    musicGainRef.current = masterGain;
    
    // Dramatic war theme using procedural audio
    const playNote = (freq: number, time: number, duration: number, type: OscillatorType = 'sawtooth') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(masterGain);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
      gain.gain.linearRampToValueAtTime(0, time + duration);
      osc.start(time);
      osc.stop(time + duration);
    };

    // War drum pattern
    const playDrum = (time: number, freq: number = 60) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(masterGain);
      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
      osc.start(time);
      osc.stop(time + 0.3);
    };

    // Epic melody notes (minor key, heroic)
    const melody = [
      { note: 146.83, dur: 0.5 }, // D3
      { note: 164.81, dur: 0.25 }, // E3
      { note: 174.61, dur: 0.5 }, // F3
      { note: 196.00, dur: 0.25 }, // G3
      { note: 220.00, dur: 0.5 }, // A3
      { note: 196.00, dur: 0.25 }, // G3
      { note: 174.61, dur: 0.5 }, // F3
      { note: 146.83, dur: 0.5 }, // D3
    ];

    let loopId: number;
    const loopDuration = 4; // 4 seconds per loop
    
    const playLoop = () => {
      if (!isMusicPlayingRef.current || !audioContextRef.current) return;
      
      const now = ctx.currentTime;
      
      // War drums (every beat)
      for (let i = 0; i < 8; i++) {
        playDrum(now + i * 0.5, i % 4 === 0 ? 60 : 80);
      }
      
      // Melody
      let melodyTime = 0;
      melody.forEach((m) => {
        playNote(m.note, now + melodyTime, m.dur, 'square');
        playNote(m.note * 0.5, now + melodyTime, m.dur, 'sawtooth'); // Bass
        melodyTime += m.dur;
      });
      
      // Schedule next loop
      loopId = window.setTimeout(playLoop, loopDuration * 1000);
    };

    playLoop();
  }, []);

  const stopMusic = useCallback(() => {
    isMusicPlayingRef.current = false;
    if (musicGainRef.current) {
      musicGainRef.current.gain.linearRampToValueAtTime(0, (audioContextRef.current?.currentTime || 0) + 0.5);
    }
  }, []);

  return { playSound, startMusic, stopMusic };
};
