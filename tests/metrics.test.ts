import { describe, expect, it } from 'vitest';

import { computeTrustMetrics, normalizeNetworkScore } from '../src/metrics.js';

describe('normalizeNetworkScore', () => {
  it('is bounded in 0..100', () => {
    expect(normalizeNetworkScore(0, 0)).toBe(100);
    expect(normalizeNetworkScore(999, 999)).toBe(0);
  });
});

describe('computeTrustMetrics', () => {
  it('classifies integrity state', () => {
    expect(computeTrustMetrics(3, 0.2, 900).integrityState).toBe('ok');
    expect(computeTrustMetrics(15, 3, 400).integrityState).toBe('warning');
    expect(computeTrustMetrics(40, 8, 150).integrityState).toBe('critical');
  });
});
