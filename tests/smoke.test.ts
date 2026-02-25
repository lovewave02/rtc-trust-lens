import { normalizeNetworkScore } from '../src/metrics';

if (normalizeNetworkScore(0, 0) !== 100) throw new Error('network score failed');
