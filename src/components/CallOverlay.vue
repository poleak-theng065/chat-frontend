<template>
  <Teleport to="body">
    <!-- Incoming call banner -->
    <Transition name="slide-in">
      <div v-if="callState === 'incoming'" class="incoming-banner">
        <div class="ring-anim">
          <div class="ring ring1" />
          <div class="ring ring2" />
          <div class="ring ring3" />
          <div class="phone-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.03 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>
        </div>
        <div class="caller-info">
          <div class="caller-label">Incoming call from</div>
          <div class="caller-name">{{ callInfo?.peerId }}</div>
        </div>
        <div class="call-actions">
          <button class="btn-reject" @click="rejectCall">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button class="btn-accept" @click="acceptCall(myId)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.03 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Active / ringing call overlay -->
    <Transition name="call-fade">
      <div v-if="callState === 'active' || callState === 'ringing'" class="call-overlay">
        <div class="call-backdrop" />

        <div class="call-card">
          <!-- Remote video (or avatar fallback) -->
          <div class="video-area">
            <video ref="remoteVideoEl" class="video-remote" autoplay playsinline />
            <div v-if="!hasRemoteStream" class="video-placeholder">
              <div class="big-avatar">{{ callInfo?.peerId?.[0]?.toUpperCase() }}</div>
              <div class="call-status-text">
                {{ callState === 'ringing' ? 'Calling…' : 'Connected' }}
              </div>
            </div>
          </div>

          <!-- Local video pip -->
          <video ref="localVideoEl" class="video-local" autoplay playsinline muted />

          <!-- Peer name + timer -->
          <div class="call-info-bar">
            <div class="call-peer-name">{{ callInfo?.peerId }}</div>
            <div class="call-timer" v-if="callState === 'active'">{{ timerDisplay }}</div>
            <div class="call-timer blink" v-else>Ringing…</div>
          </div>

          <!-- Controls -->
          <div class="call-controls">
            <button class="ctrl-btn" :class="{ active: micMuted }" @click="toggleMic" title="Mute">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path v-if="!micMuted" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                <path v-if="!micMuted" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
                <path v-if="micMuted" d="M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/>
                <path v-if="micMuted" d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8"/>
              </svg>
            </button>
            <button class="ctrl-btn danger" @click="endCall" title="End call">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.71 16.67C20.66 13.78 16.54 12 12 12 7.46 12 3.34 13.78.29 16.67c-.18.18-.29.43-.29.67 0 .24.11.49.29.67l2.48 2.48c.18.18.43.29.67.29.25 0 .5-.11.67-.29.68-.68 1.39-1.28 2.14-1.8a.98.98 0 00.42-.82v-3.07c1.09-.41 2.26-.64 3.33-.64 1.07 0 2.24.23 3.33.64v3.06c0 .33.16.63.42.82.75.53 1.47 1.13 2.14 1.81.18.18.43.28.67.28.24 0 .49-.1.67-.28l2.48-2.48c.18-.18.29-.43.29-.67 0-.24-.11-.49-.29-.67z"/>
              </svg>
            </button>
            <button class="ctrl-btn" :class="{ active: camOff }" @click="toggleCam" title="Camera">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path v-if="!camOff" d="M23 7l-7 5 7 5V7z"/>
                <rect v-if="!camOff" x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                <path v-if="camOff" d="M16 16H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v1.34l1 1L23 7v10"/>
                <line v-if="camOff" x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useCall, localVideoEl, remoteVideoEl } from '../composables/useCall'

const props = defineProps({ myId: String })

const {
  callState, callInfo,
  localStream, remoteStream,
  acceptCall, rejectCall, endCall,
} = useCall()

// Expose video element refs to the composable
const localVideoEl_  = ref(null)
const remoteVideoEl_ = ref(null)

watch(localVideoEl_, el  => { localVideoEl.value  = el })
watch(remoteVideoEl_, el => { remoteVideoEl.value = el })

// Re-bind streams when elements mount
watch([remoteVideoEl_, () => remoteStream.value], ([el, stream]) => {
  if (el && stream) el.srcObject = stream
})
watch([localVideoEl_, () => localStream.value], ([el, stream]) => {
  if (el && stream) el.srcObject = stream
})

// Provide refs back under the original names for template
const hasRemoteStream = computed(() => !!remoteStream.value)

// Timer
const seconds = ref(0)
let timerInterval = null

watch(callState, (s) => {
  if (s === 'active') {
    seconds.value = 0
    timerInterval = setInterval(() => seconds.value++, 1000)
  } else {
    clearInterval(timerInterval)
    seconds.value = 0
  }
})

onUnmounted(() => clearInterval(timerInterval))

const timerDisplay = computed(() => {
  const m = Math.floor(seconds.value / 60).toString().padStart(2, '0')
  const s = (seconds.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

// Media controls
const micMuted = ref(false)
const camOff   = ref(false)

function toggleMic() {
  micMuted.value = !micMuted.value
  if (localStream.value) {
    localStream.value.getAudioTracks().forEach(t => { t.enabled = !micMuted.value })
  }
}

function toggleCam() {
  camOff.value = !camOff.value
  if (localStream.value) {
    localStream.value.getVideoTracks().forEach(t => { t.enabled = !camOff.value })
  }
}
</script>

<style scoped>
/* ── Incoming banner ── */
.incoming-banner {
  position: fixed;
  top: 20px; right: 20px;
  z-index: 1000;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow), 0 0 40px rgba(79,255,176,.12);
  min-width: 300px;
}

.ring-anim {
  position: relative;
  width: 52px; height: 52px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

.ring {
  position: absolute; border-radius: 50%;
  border: 2px solid var(--accent);
  animation: ring-expand 1.5s ease-out infinite;
}
.ring1 { width: 52px; height: 52px; animation-delay: 0s; }
.ring2 { width: 40px; height: 40px; animation-delay: .3s; }
.ring3 { width: 28px; height: 28px; animation-delay: .6s; }

@keyframes ring-expand {
  0%   { opacity: .8; transform: scale(.5); }
  100% { opacity: 0;  transform: scale(1.4); }
}

.phone-icon {
  position: relative; z-index: 1;
  color: var(--accent);
  animation: shake-phone .5s ease-in-out infinite alternate;
}

@keyframes shake-phone {
  0% { transform: rotate(-12deg); }
  100% { transform: rotate(12deg); }
}

.caller-info { flex: 1; }

.caller-label { font-size: 11px; color: var(--muted); font-family: var(--font-mono); }
.caller-name  { font-size: 16px; font-weight: 700; color: var(--text); }

.call-actions { display: flex; gap: 10px; }

.btn-reject, .btn-accept {
  width: 44px; height: 44px; border-radius: 50%; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: transform .15s, opacity .15s;
}

.btn-reject  { background: var(--danger); color: #fff; }
.btn-accept  { background: var(--accent); color: #0d0f12; }

.btn-reject:hover, .btn-accept:hover { transform: scale(1.08); opacity: .9; }

/* ── Active call overlay ── */
.call-overlay {
  position: fixed; inset: 0; z-index: 900;
  display: flex; align-items: center; justify-content: center;
}

.call-backdrop {
  position: absolute; inset: 0;
  background: rgba(10, 12, 16, .88);
  backdrop-filter: blur(12px);
}

.call-card {
  position: relative; z-index: 1;
  width: 520px;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.video-area {
  position: relative;
  height: 300px;
  background: var(--panel);
}

.video-remote {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}

.video-placeholder {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px;
}

.big-avatar {
  width: 80px; height: 80px; border-radius: 50%;
  background: rgba(79,255,176,.12);
  border: 2px solid var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 800; color: var(--accent);
}

.call-status-text {
  font-family: var(--font-mono); font-size: 13px; color: var(--muted);
}

.video-local {
  position: absolute;
  bottom: 12px; right: 12px;
  width: 100px; height: 75px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid var(--border2);
  background: var(--panel);
}

.call-info-bar {
  padding: 16px 20px 8px;
  display: flex; align-items: center; justify-content: space-between;
}

.call-peer-name { font-size: 18px; font-weight: 700; }

.call-timer {
  font-family: var(--font-mono); font-size: 14px; color: var(--accent);
}

.call-timer.blink { animation: blink-text 1.2s ease-in-out infinite; color: var(--muted); }

@keyframes blink-text { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }

.call-controls {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 16px 20px 24px;
}

.ctrl-btn {
  width: 52px; height: 52px; border-radius: 50%; border: none;
  background: var(--panel);
  border: 1px solid var(--border2);
  color: var(--text);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all .2s;
}

.ctrl-btn:hover { border-color: var(--accent); color: var(--accent); }
.ctrl-btn.active { background: rgba(255,75,109,.12); border-color: var(--danger); color: var(--danger); }
.ctrl-btn.danger {
  width: 62px; height: 62px;
  background: var(--danger); border-color: var(--danger);
  color: #fff;
}
.ctrl-btn.danger:hover { opacity: .85; transform: scale(1.05); }

/* Transitions */
.slide-in-enter-active { transition: all .35s cubic-bezier(.34,1.56,.64,1); }
.slide-in-leave-active { transition: all .25s ease-in; }
.slide-in-enter-from   { opacity: 0; transform: translateX(60px) scale(.95); }
.slide-in-leave-to     { opacity: 0; transform: translateX(60px); }

.call-fade-enter-active { transition: all .3s ease-out; }
.call-fade-leave-active { transition: all .25s ease-in; }
.call-fade-enter-from, .call-fade-leave-to { opacity: 0; }
</style>
