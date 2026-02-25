import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.resolve(__dirname, '../client');

const server = createServer(async (req, res) => {
  const url = req.url ?? '/';
  const filePath =
    url === '/'
      ? path.join(clientDir, 'index.html')
      : path.join(clientDir, url.replace(/^\//, ''));

  try {
    const body = await readFile(filePath);
    const ext = path.extname(filePath);
    const contentType =
      ext === '.js' ? 'text/javascript' : ext === '.css' ? 'text/css' : 'text/html';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

const wss = new WebSocketServer({ server });

const rooms = new Map<string, Set<WebSocket>>();

type WebSocket = import('ws').WebSocket;

wss.on('connection', (ws) => {
  let joinedRoom = '';

  ws.on('message', (raw) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(raw.toString()) as Record<string, unknown>;
    } catch {
      return;
    }

    if (msg.type === 'join' && typeof msg.roomId === 'string') {
      joinedRoom = msg.roomId;
      if (!rooms.has(joinedRoom)) rooms.set(joinedRoom, new Set());
      rooms.get(joinedRoom)?.add(ws);
      ws.send(JSON.stringify({ type: 'joined', roomId: joinedRoom }));
      return;
    }

    if (!joinedRoom) return;

    for (const peer of rooms.get(joinedRoom) ?? []) {
      if (peer !== ws && peer.readyState === peer.OPEN) {
        peer.send(JSON.stringify(msg));
      }
    }
  });

  ws.on('close', () => {
    if (!joinedRoom) return;
    rooms.get(joinedRoom)?.delete(ws);
    if ((rooms.get(joinedRoom)?.size ?? 0) === 0) rooms.delete(joinedRoom);
  });
});

const port = Number(process.env.PORT ?? 8787);
server.listen(port, () => {
  console.log(`rtc-trust-lens running at http://localhost:${port}`);
});
