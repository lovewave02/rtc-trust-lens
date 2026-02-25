const ws = new WebSocket(`ws://${location.host}`);

const roomIdInput = document.getElementById('roomId');
const joinBtn = document.getElementById('joinBtn');
const callBtn = document.getElementById('callBtn');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const metricsLine = document.getElementById('metricsLine');
const integrityLine = document.getElementById('integrityLine');

let pc;
let localStream;
let joined = false;

const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

joinBtn.addEventListener('click', async () => {
  const roomId = roomIdInput.value.trim();
  if (!roomId) return;

  localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  localVideo.srcObject = localStream;

  ws.send(JSON.stringify({ type: 'join', roomId }));
  joined = true;
  callBtn.disabled = false;
});

callBtn.addEventListener('click', async () => {
  if (!joined) return;
  await ensurePeer();
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  ws.send(JSON.stringify({ type: 'offer', sdp: offer }));
});

ws.onmessage = async (e) => {
  const msg = JSON.parse(e.data);

  if (msg.type === 'offer') {
    await ensurePeer();
    await pc.setRemoteDescription(msg.sdp);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    ws.send(JSON.stringify({ type: 'answer', sdp: answer }));
  }

  if (msg.type === 'answer' && pc) {
    await pc.setRemoteDescription(msg.sdp);
  }

  if (msg.type === 'ice' && pc && msg.candidate) {
    await pc.addIceCandidate(msg.candidate);
  }
};

async function ensurePeer() {
  if (pc) return;
  pc = new RTCPeerConnection(rtcConfig);

  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

  pc.ontrack = (ev) => {
    const [stream] = ev.streams;
    remoteVideo.srcObject = stream;
  };

  pc.onicecandidate = (ev) => {
    if (ev.candidate) ws.send(JSON.stringify({ type: 'ice', candidate: ev.candidate }));
  };

  startStatsLoop(pc);
}

function normalizeNetworkScore(jitter, loss) {
  return Math.max(0, Math.round(100 - jitter * 2 - loss * 5));
}

function startStatsLoop(pcRef) {
  setInterval(async () => {
    const stats = await pcRef.getStats();
    let jitter = 0;
    let packetsLost = 0;
    let packetsReceived = 0;
    let bitrateKbps = 0;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && !report.isRemote) {
        jitter = (report.jitter ?? 0) * 1000;
        packetsLost += report.packetsLost ?? 0;
        packetsReceived += report.packetsReceived ?? 0;
        bitrateKbps = ((report.bytesReceived ?? 0) * 8) / 1000;
      }
    });

    const lossPct = packetsReceived > 0 ? (packetsLost / (packetsReceived + packetsLost)) * 100 : 0;
    const score = normalizeNetworkScore(jitter, lossPct);

    metricsLine.textContent = `jitter=${jitter.toFixed(1)}ms | loss=${lossPct.toFixed(2)}% | bitrate=${bitrateKbps.toFixed(1)}kbps | score=${score}`;
    integrityLine.textContent = `Integrity: ${score >= 75 ? 'ok' : score >= 45 ? 'warning' : 'critical'}`;
  }, 1500);
}
