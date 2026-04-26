/**
 * useCall.js
 * WebRTC peer connection + signaling via Socket.IO.
 *
 * Flow:
 *  Caller  → createOffer → emit call-user (offer SDP)
 *  Callee  ← incoming-call → emit accept-call (answer SDP)
 *  Caller  ← call-accepted → setRemoteDescription
 *  Both    ↔ ice-candidate relay
 *  Either  → emit end-call → both get call-ended
 */
import { ref, shallowRef } from 'vue'
import { useSocket } from './useSocket'

const { socket } = useSocket()

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
}

// ── Reactive call state ───────────────────────────────────────────────────────
export const callState = ref('idle')   // idle | ringing | incoming | active
export const callInfo  = ref(null)     // { callId, peerId, direction }
export const callLog   = ref([])       // completed call history

// ── WebRTC objects ────────────────────────────────────────────────────────────
const pc        = shallowRef(null)   // RTCPeerConnection
const localStream  = shallowRef(null)
const remoteStream = shallowRef(null)

// Elements to attach streams to (set by CallOverlay component)
export const localVideoEl  = ref(null)
export const remoteVideoEl = ref(null)

// ── Helpers ───────────────────────────────────────────────────────────────────
function createPeerConnection(myId, peerId) {
  const conn = new RTCPeerConnection(ICE_SERVERS)

  conn.onicecandidate = ({ candidate }) => {
    if (candidate) {
      socket.emit('ice-candidate', {
        callId: callInfo.value?.callId,
        candidate,
        to: peerId,
      })
    }
  }

  conn.ontrack = (event) => {
    remoteStream.value = event.streams[0]
    if (remoteVideoEl.value) remoteVideoEl.value.srcObject = event.streams[0]
  }

  conn.onconnectionstatechange = () => {
    console.log('[WebRTC] connection state:', conn.connectionState)
  }

  return conn
}

async function getLocalStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    localStream.value = stream
    if (localVideoEl.value) localVideoEl.value.srcObject = stream
    return stream
  } catch (err) {
    // Fallback: audio only
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      localStream.value = stream
      return stream
    } catch {
      console.warn('[WebRTC] No media devices available (demo mode)')
      return null
    }
  }
}

function stopLocalStream() {
  if (localStream.value) {
    localStream.value.getTracks().forEach(t => t.stop())
    localStream.value = null
  }
}

function closePeerConnection() {
  if (pc.value) { pc.value.close(); pc.value = null }
  stopLocalStream()
  remoteStream.value = null
}

function resetCallState() {
  closePeerConnection()
  callState.value = 'idle'
  callInfo.value  = null
}

// ── Socket event listeners ────────────────────────────────────────────────────
socket.on('incoming-call', ({ callId, from, offer }) => {
  callState.value = 'incoming'
  callInfo.value  = { callId, peerId: from, direction: 'inbound', offer }
  console.log('[Call] Incoming from', from)
})

socket.on('call-accepted', async ({ callId, answer }) => {
  if (!pc.value) return
  await pc.value.setRemoteDescription(new RTCSessionDescription(answer))
  callState.value = 'active'
  console.log('[Call] Accepted — active')
})

socket.on('call-rejected', ({ callId, log }) => {
  if (log) callLog.value.unshift(log)
  resetCallState()
  console.log('[Call] Rejected')
})

socket.on('call-ended', ({ callId, log }) => {
  if (log) callLog.value.unshift(log)
  resetCallState()
  console.log('[Call] Ended')
})

socket.on('ice-candidate', async ({ candidate }) => {
  if (pc.value && candidate) {
    try { await pc.value.addIceCandidate(new RTCIceCandidate(candidate)) }
    catch (e) { console.warn('[ICE] Failed to add candidate', e) }
  }
})

// ── Exported actions ──────────────────────────────────────────────────────────
export function useCall() {
  async function startCall(myId, peerId) {
    if (callState.value !== 'idle') return

    callState.value = 'ringing'
    callInfo.value  = { peerId, direction: 'outbound' }

    const stream = await getLocalStream()
    const conn   = createPeerConnection(myId, peerId)
    pc.value     = conn

    if (stream) stream.getTracks().forEach(t => conn.addTrack(t, stream))

    const offer = await conn.createOffer()
    await conn.setLocalDescription(offer)

    socket.emit('call-user', { from: myId, to: peerId, offer })
    console.log('[Call] Offer sent to', peerId)
  }

  async function acceptCall(myId) {
    const { callId, peerId, offer } = callInfo.value

    const stream = await getLocalStream()
    const conn   = createPeerConnection(myId, peerId)
    pc.value     = conn

    if (stream) stream.getTracks().forEach(t => conn.addTrack(t, stream))

    await conn.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await conn.createAnswer()
    await conn.setLocalDescription(answer)

    socket.emit('accept-call', { callId, answer })
    callState.value = 'active'
    callInfo.value  = { ...callInfo.value, direction: 'inbound' }
    console.log('[Call] Answer sent')
  }

  function rejectCall() {
    if (!callInfo.value) return
    socket.emit('reject-call', { callId: callInfo.value.callId })
    resetCallState()
  }

  function endCall() {
    if (!callInfo.value) return
    socket.emit('end-call', { callId: callInfo.value.callId })
    resetCallState()
  }

  return {
    callState,
    callInfo,
    callLog,
    localStream,
    remoteStream,
    localVideoEl,
    remoteVideoEl,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  }
}
