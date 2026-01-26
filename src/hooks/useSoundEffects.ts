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
  // === HERO LASER GUN SOUNDS - High-pitched energy weapon ===
  shoot: { frequency: 1200, duration: 0.15, type: 'sine', volume: 0.3, attack: 0.005, decay: 0.1 },
  shootUltra: { frequency: 800, duration: 0.2, type: 'sawtooth', volume: 0.35, attack: 0.005, decay: 0.15 },
  // === 4K EXPLOSION - Multi-layered rumble with punch ===
  explosion: { frequency: 60, duration: 0.45, type: 'sawtooth', volume: 0.35, attack: 0.005, decay: 0.35 },
  // === 4K IMPACT SOUNDS - Crisp and punchy ===
  hit: { frequency: 250, duration: 0.12, type: 'square', volume: 0.2, attack: 0.003, decay: 0.08 },
  hurt: { frequency: 180, duration: 0.2, type: 'sawtooth', volume: 0.25, attack: 0.005, decay: 0.15 },
  // === SUPPORT SOUNDS ===
  heal: { frequency: 700, duration: 0.25, type: 'sine', volume: 0.18, attack: 0.03, decay: 0.15 },
  armor: { frequency: 500, duration: 0.2, type: 'triangle', volume: 0.22, attack: 0.01, decay: 0.12 },
  dash: { frequency: 350, duration: 0.3, type: 'sine', volume: 0.18, attack: 0.01, decay: 0.2 },
  // === 4K ENEMY ATTACK SOUNDS - Distinct and impactful ===
  enemyDeath: { frequency: 80, duration: 0.5, type: 'sawtooth', volume: 0.3, attack: 0.005, decay: 0.4 },
  enemyShoot: { frequency: 400, duration: 0.15, type: 'square', volume: 0.2, attack: 0.005, decay: 0.1 },
  droneShoot: { frequency: 700, duration: 0.12, type: 'sine', volume: 0.22, attack: 0.005, decay: 0.08 },
  droneFireShoot: { frequency: 250, duration: 0.25, type: 'sawtooth', volume: 0.3, attack: 0.005, decay: 0.18 },
  // === 4K BOSS SOUNDS - Massive and cinematic ===
  bossTaunt: { frequency: 50, duration: 0.7, type: 'square', volume: 0.35, attack: 0.08, decay: 0.5 },
  bossLaugh: { frequency: 120, duration: 1.5, type: 'sawtooth', volume: 0.4, attack: 0.05, decay: 1.2 },
  bossFireball: { frequency: 100, duration: 0.4, type: 'sawtooth', volume: 0.38, attack: 0.01, decay: 0.3 },
  bossMegaAttack: { frequency: 35, duration: 1.2, type: 'sawtooth', volume: 0.5, attack: 0.08, decay: 1.0 },
  // === MISC SOUNDS ===
  chicken: { frequency: 1800, duration: 0.12, type: 'sine', volume: 0.12, attack: 0.005 },
  gift: { frequency: 1000, duration: 0.18, type: 'triangle', volume: 0.18, attack: 0.01 },
  victory: { frequency: 600, duration: 0.6, type: 'sine', volume: 0.25, attack: 0.03, decay: 0.4 },
  gameOver: { frequency: 180, duration: 1.0, type: 'sawtooth', volume: 0.3, attack: 0.05, decay: 0.9 },
  magicFlash: { frequency: 1200, duration: 0.25, type: 'sine', volume: 0.25, attack: 0.005, decay: 0.18 },
  spawn: { frequency: 300, duration: 0.25, type: 'triangle', volume: 0.18, attack: 0.01 },
  shieldBlock: { frequency: 600, duration: 0.15, type: 'triangle', volume: 0.25, attack: 0.005, decay: 0.1 },
  // === 4K BOSS ATTACK SOUNDS - Cinematic and terrifying ===
  laserSweep: { frequency: 2500, duration: 0.5, type: 'sawtooth', volume: 0.35, attack: 0.01, decay: 0.45 },
  missileWarning: { frequency: 900, duration: 0.8, type: 'square', volume: 0.38, attack: 0.03, decay: 0.7 },
  groundPound: { frequency: 40, duration: 0.7, type: 'sawtooth', volume: 0.5, attack: 0.005, decay: 0.6 },
  screenAttack: { frequency: 25, duration: 1.0, type: 'sawtooth', volume: 0.55, attack: 0.08, decay: 0.9 },
  // === 4K JET ROBOT SOUNDS ===
  jetDrop: { frequency: 450, duration: 1.0, type: 'sawtooth', volume: 0.35, attack: 0.03, decay: 0.9 },
  jetEngine: { frequency: 180, duration: 0.8, type: 'sawtooth', volume: 0.3, attack: 0.08, decay: 0.7 },
  jetSwoosh: { frequency: 1800, duration: 0.5, type: 'sine', volume: 0.25, attack: 0.005, decay: 0.45 },
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
    if (soundName === 'shoot') {
      // LASER GUN - High-pitched zap with descending sweep
      oscillator.frequency.setValueAtTime(config.frequency * 1.5, now);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.6, now + config.duration * 0.3);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.3, now + config.duration);
    } else if (soundName === 'shootUltra') {
      // HEAVY LASER - Deeper energy pulse with wobble
      oscillator.frequency.setValueAtTime(config.frequency * 2, now);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 1.2, now + 0.05);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.4, now + config.duration);
    } else if (soundName === 'bossLaugh') {
      // EVIL LAUGH - Oscillating low frequency with menacing wobble
      oscillator.frequency.setValueAtTime(config.frequency, now);
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 1.8, now + config.duration * 0.15);
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 0.7, now + config.duration * 0.3);
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 1.5, now + config.duration * 0.45);
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 0.6, now + config.duration * 0.6);
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 1.3, now + config.duration * 0.75);
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 0.4, now + config.duration);
    } else if (soundName === 'explosion' || soundName === 'bossMegaAttack' || soundName === 'groundPound') {
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.2, now + config.duration);
    } else if (soundName === 'heal') {
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 1.5, now + config.duration);
    } else if (soundName === 'laserSweep') {
      // Whooshing sweep down then up
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.3, now + config.duration * 0.5);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.8, now + config.duration);
    } else if (soundName === 'missileWarning') {
      // Pulsing warning siren
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 1.5, now + config.duration * 0.25);
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 0.8, now + config.duration * 0.5);
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 1.5, now + config.duration * 0.75);
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 0.5, now + config.duration);
    } else if (soundName === 'screenAttack') {
      // Deep rumbling that builds
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 3, now + config.duration * 0.3);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.5, now + config.duration);
    } else if (soundName === 'jetDrop') {
      // Descending whoosh - high to low frequency sweep
      oscillator.frequency.setValueAtTime(config.frequency * 4, now);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.5, now + config.duration);
    } else if (soundName === 'jetEngine') {
      // Roaring engine - oscillating frequency
      oscillator.frequency.setValueAtTime(config.frequency, now);
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 2, now + config.duration * 0.2);
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 1.5, now + config.duration * 0.5);
      oscillator.frequency.linearRampToValueAtTime(config.frequency * 0.8, now + config.duration);
    } else if (soundName === 'jetSwoosh') {
      // High-pitched swooshing descent
      oscillator.frequency.setValueAtTime(config.frequency * 2, now);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.3, now + config.duration);
    } else if (soundName === 'droneFireShoot') {
      // Fire crackling sound - chaotic frequency modulation
      oscillator.frequency.setValueAtTime(config.frequency * 2, now);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 4, now + 0.05);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.5, now + config.duration * 0.6);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.2, now + config.duration);
    } else if (soundName === 'droneShoot') {
      // Energy zap - high pitch sweep
      oscillator.frequency.setValueAtTime(config.frequency * 1.5, now);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.4, now + config.duration);
    } else if (soundName === 'enemyShoot') {
      // Enemy gunshot - punchy mid-range
      oscillator.frequency.setValueAtTime(config.frequency * 2, now);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.4, now + 0.03);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.2, now + config.duration);
    } else if (soundName === 'hit') {
      // Impact sound - sharp crack
      oscillator.frequency.setValueAtTime(config.frequency * 3, now);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.3, now + config.duration);
    } else if (soundName === 'enemyDeath') {
      // Death explosion - layered rumble
      oscillator.frequency.setValueAtTime(config.frequency * 2, now);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.5, now + config.duration * 0.3);
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.1, now + config.duration);
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
