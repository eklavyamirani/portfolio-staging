// YIN fundamental-frequency estimator (de Cheveigné & Kawahara, 2002)
// with parabolic interpolation, plus helpers for mapping a frequency to
// the nearest equal-tempered note.

export interface PitchOptions {
  /** Cumulative-mean-normalised difference threshold. Lower is stricter. */
  threshold?: number;
  minFreq?: number;
  maxFreq?: number;
  /** Frames quieter than this RMS are treated as silence. */
  minRms?: number;
}

export interface Pitch {
  freq: number;
  /** 0..1, how periodic the frame is (1 − normalised difference at the chosen lag). */
  clarity: number;
}

export function detectPitch(
  buf: Float32Array,
  sampleRate: number,
  { threshold = 0.15, minFreq = 80, maxFreq = 2000, minRms = 0.01 }: PitchOptions = {},
): Pitch | null {
  let sumSq = 0;
  for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
  if (Math.sqrt(sumSq / buf.length) < minRms) return null;

  const tauMin = Math.max(2, Math.floor(sampleRate / maxFreq));
  const tauMax = Math.min(Math.floor(sampleRate / minFreq), Math.floor(buf.length / 2));
  const window = buf.length - tauMax;
  const d = new Float32Array(tauMax + 1);

  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let j = 0; j < window; j++) {
      const delta = buf[j] - buf[j + tau];
      sum += delta * delta;
    }
    d[tau] = sum;
  }

  // Cumulative mean normalised difference.
  d[0] = 1;
  let running = 0;
  for (let tau = 1; tau <= tauMax; tau++) {
    running += d[tau];
    d[tau] = running === 0 ? 1 : (d[tau] * tau) / running;
  }

  let tau = -1;
  for (let t = tauMin; t <= tauMax; t++) {
    if (d[t] < threshold) {
      while (t + 1 <= tauMax && d[t + 1] < d[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau === -1) return null;

  let refined = tau;
  if (tau > 1 && tau < tauMax) {
    const a = d[tau - 1], b = d[tau], c = d[tau + 1];
    const denom = a - 2 * b + c;
    if (denom !== 0) refined = tau + (a - c) / (2 * denom);
  }

  return { freq: sampleRate / refined, clarity: 1 - d[tau] };
}

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

export interface Note {
  name: string;
  octave: number;
  midi: number;
  /** Deviation from the nearest equal-tempered pitch, −50..+50. */
  cents: number;
}

export function noteFromFrequency(freq: number, a4 = 440): Note {
  const exact = 69 + 12 * Math.log2(freq / a4);
  const midi = Math.round(exact);
  return {
    name: NOTE_NAMES[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    midi,
    cents: (exact - midi) * 100,
  };
}

export function frequencyFromMidi(midi: number, a4 = 440): number {
  return a4 * 2 ** ((midi - 69) / 12);
}
