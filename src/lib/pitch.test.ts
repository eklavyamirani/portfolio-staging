import { describe, expect, it } from 'vitest';
import { detectPitch, noteFromFrequency } from './pitch';
import { demoFrame } from './demo-violin';

const SR = 48000;
const N = 2048;

function sine(freq: number, harmonics = [1]): Float32Array {
  const buf = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let v = 0;
    harmonics.forEach((a, h) => (v += a * Math.sin((2 * Math.PI * freq * (h + 1) * i) / SR)));
    buf[i] = 0.3 * v;
  }
  return buf;
}

const centsBetween = (a: number, b: number) => 1200 * Math.log2(a / b);

describe('detectPitch', () => {
  it.each([196, 293.66, 440, 659.25, 1318.5])('finds a pure %f Hz tone within 1 cent', (f) => {
    const p = detectPitch(sine(f), SR);
    expect(p).not.toBeNull();
    expect(Math.abs(centsBetween(p!.freq, f))).toBeLessThan(1);
  });

  it('reports the fundamental of a harmonic-rich tone, not an octave', () => {
    const p = detectPitch(sine(196, [0.4, 1, 0.8, 0.6]), SR);
    expect(Math.abs(centsBetween(p!.freq, 196))).toBeLessThan(2);
  });

  it('returns null for silence', () => {
    expect(detectPitch(new Float32Array(N), SR)).toBeNull();
  });

  it('returns null for white noise', () => {
    let seed = 1;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    const noise = Float32Array.from({ length: N }, () => 0.3 * rand());
    expect(detectPitch(noise, SR)).toBeNull();
  });
});

describe('noteFromFrequency', () => {
  it('names concert A', () => {
    expect(noteFromFrequency(440)).toMatchObject({ name: 'A', octave: 4, midi: 69 });
    expect(noteFromFrequency(440).cents).toBeCloseTo(0, 6);
  });

  it('measures cents sharp and flat', () => {
    expect(noteFromFrequency(445).cents).toBeCloseTo(19.56, 1);
    expect(noteFromFrequency(196 * 2 ** (-12 / 1200))).toMatchObject({ name: 'G', octave: 3 });
  });
});

describe('demo signal through the detector', () => {
  it('tracks the synthetic player to within 3 cents across a whole scale', () => {
    for (let t = 0.05; t < 24; t += 0.137) {
      const frame = demoFrame(t, SR, N);
      const p = detectPitch(frame.samples, SR);
      expect(p, `t=${t}`).not.toBeNull();
      const note = noteFromFrequency(p!.freq);
      expect(note.midi, `t=${t}`).toBe(frame.midi);
      expect(Math.abs(note.cents - frame.cents), `t=${t}`).toBeLessThan(3);
    }
  });
});
