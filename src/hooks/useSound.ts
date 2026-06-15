import { useRef, useCallback } from 'react';

export type SoundName =
  | 'tokenPick'
  | 'tokenConfirm'
  | 'cardReserve'
  | 'cardPurchase'
  | 'nobleClaimed'
  | 'yourTurn'
  | 'timerWarning'
  | 'timerCritical'
  | 'turnEnd';

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  // Helper: play a single shaped tone
  const tone = (
    ac: AudioContext,
    freq: number,
    start: number,
    duration: number,
    peakGain = 0.25,
    type: OscillatorType = 'sine',
    freqEnd?: number,
  ) => {
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, start + duration * 0.8);
    }

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peakGain, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.start(start);
    osc.stop(start + duration + 0.02);
  };

  const play = useCallback((name: SoundName) => {
    const ac = getCtx();
    if (!ac) return;
    const t = ac.currentTime;

    try {
      switch (name) {

        case 'tokenPick':
          // Light crystalline tap
          tone(ac, 1200, t,       0.06, 0.15, 'sine');
          tone(ac,  900, t + 0.03, 0.08, 0.08, 'sine');
          break;

        case 'tokenConfirm':
          // Satisfying three-note confirm
          tone(ac, 660, t,       0.12, 0.2,  'sine');
          tone(ac, 880, t + 0.1, 0.12, 0.2,  'sine');
          tone(ac, 1100, t + 0.2, 0.2, 0.18, 'sine');
          break;

        case 'cardReserve':
          // Mechanical click + vault lock thud
          tone(ac, 350, t,       0.06, 0.35, 'square', 200);
          tone(ac, 180, t + 0.05, 0.18, 0.25, 'sine');
          break;

        case 'cardPurchase':
          // Ascending power-up arpeggio
          tone(ac, 523,  t,       0.14, 0.28, 'triangle'); // C5
          tone(ac, 659,  t + 0.1, 0.14, 0.28, 'triangle'); // E5
          tone(ac, 784,  t + 0.2, 0.14, 0.28, 'triangle'); // G5
          tone(ac, 1047, t + 0.3, 0.3,  0.32, 'triangle'); // C6
          break;

        case 'nobleClaimed':
          // Royal fanfare — four notes + shimmer
          tone(ac, 523,  t,       0.15, 0.35, 'sine');
          tone(ac, 659,  t + 0.12, 0.15, 0.35, 'sine');
          tone(ac, 784,  t + 0.24, 0.15, 0.35, 'sine');
          tone(ac, 1047, t + 0.36, 0.45, 0.4,  'sine');
          tone(ac, 1319, t + 0.44, 0.3,  0.2,  'sine');
          break;

        case 'yourTurn':
          // Two rising chime notes — "it's your go"
          tone(ac, 554, t,       0.18, 0.22, 'sine'); // C#5
          tone(ac, 740, t + 0.16, 0.28, 0.28, 'sine'); // F#5
          break;

        case 'timerWarning':
          // Single mid tick — "10 seconds left"
          tone(ac, 660, t, 0.07, 0.22, 'square');
          break;

        case 'timerCritical':
          // Urgent double beep
          tone(ac, 880, t,        0.06, 0.28, 'square');
          tone(ac, 880, t + 0.11, 0.06, 0.28, 'square');
          break;

        case 'turnEnd':
          // Gentle descending close
          tone(ac, 659, t,        0.14, 0.18, 'sine');
          tone(ac, 523, t + 0.12, 0.22, 0.12, 'sine');
          break;
      }
    } catch (e) {
      // Silently swallow — audio is non-critical
    }
  }, [getCtx]);

  return { play };
}
