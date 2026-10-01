// Synthesises short frames of a bowed-string-like tone for the tuner's demo
// mode, so the real pitch detector has something to listen to without a
// microphone. A player walks up a G major scale, landing each note slightly
// flat, correcting, then adding vibrato.

import { frequencyFromMidi } from './pitch';

const SCALE = [67, 69, 71, 72, 74, 76, 78, 79]; // G4..G5
const NOTE_SECONDS = 1.6;
const HARMONICS = [1, 0.5, 0.33, 0.22, 0.14];

/** Intended pitch offset in cents at time `t` within a note. */
export function intendedCents(t: number, landing: number): number {
  const settle = landing * Math.exp(-t * 4.5);
  const vibratoDepth = Math.min(1, Math.max(0, (t - 0.5) / 0.4)) * 12;
  return settle + vibratoDepth * Math.sin(2 * Math.PI * 5.6 * t);
}

export interface DemoFrame {
  samples: Float32Array;
  /** What the synthetic player is aiming for, for tests. */
  midi: number;
  cents: number;
}

/** Deterministic per-note landing error in cents, roughly −35..+25. */
function landingFor(noteIndex: number): number {
  const x = Math.sin(noteIndex * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 60 - 35;
}

export function demoFrame(time: number, sampleRate: number, size: number): DemoFrame {
  const step = Math.floor(time / NOTE_SECONDS);
  const ascending = step % (SCALE.length * 2 - 2);
  const index = ascending < SCALE.length ? ascending : SCALE.length * 2 - 2 - ascending;
  const midi = SCALE[index];
  const tInNote = time - step * NOTE_SECONDS;
  const cents = intendedCents(tInNote, landingFor(step));
  const freq = frequencyFromMidi(midi) * 2 ** (cents / 1200);

  const samples = new Float32Array(size);
  const phase0 = 2 * Math.PI * freq * time;
  for (let i = 0; i < size; i++) {
    const p = phase0 + (2 * Math.PI * freq * i) / sampleRate;
    let v = 0;
    for (let h = 0; h < HARMONICS.length; h++) v += HARMONICS[h] * Math.sin((h + 1) * p);
    samples[i] = 0.25 * v;
  }
  return { samples, midi, cents };
}
