import { describe, expect, it } from 'bun:test';
import { sha256Hex, canonicalJson } from '../lib/engine/integrity';

describe('integrity helpers', () => {
  it('computes a real SHA-256', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
  it('canonicalJson is key-order independent', () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe(canonicalJson({ a: { c: 3, d: 2 }, b: 1 }));
  });
});
