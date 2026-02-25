# RTC Trust Lens

A practical WebRTC trust-observability demo with real-time network and integrity signals.

## MVP implemented
- Minimal WebSocket signaling server (`src/server/signaling.ts`)
- Browser 1:1 call skeleton (offer/answer/ICE)
- Runtime stats panel from `getStats()`:
  - jitter
  - packet loss
  - bitrate
  - trust score
- Integrity status classification: `ok` / `warning` / `critical`

## Quick start
```bash
npm install
npm test
npm run build
npm run dev
```
Then open `http://localhost:8787` in two browser tabs and join the same room.

## Core files
- `src/server/signaling.ts`: signaling and static hosting
- `src/client/main.js`: WebRTC flow and stats polling
- `src/metrics.ts`: trust score and integrity state logic
- `tests/metrics.test.ts`: metric classification tests

## Why this is portfolio-worthy
- Demonstrates practical realtime engineering beyond chat-clone UI.
- Shows measurable trust telemetry derived from RTC internals.
- Easy interview demo: same-room two-tab call with live score updates.

## Next roadmap
1. Add insertable streams hash-chaining for stronger media integrity evidence
2. Add timeline chart for score degradation events
3. Add call session export (JSON) for postmortem analysis
