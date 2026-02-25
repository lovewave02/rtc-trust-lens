import { describe, expect, it } from 'vitest';

import { normalizeNetworkScore } from '../src/metrics.js';

describe('smoke', () => {
  it('keeps existing utility behavior', () => {
    expect(normalizeNetworkScore(0, 0)).toBe(100);
  });
});
