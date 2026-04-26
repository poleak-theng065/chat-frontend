<template>
  <div class="chat-window">
    <!-- Top bar -->
    <div class="chat-header">
      <div class="peer-info">
        <div class="peer-avatar">{{ peer[0].toUpperCase() }}</div>
        <div>
          <div class="peer-name">{{ peer }}</div>
          <div class="peer-online">online</div>
        </div>
      </div>

      <button
        class="btn-call"
        :class="{ calling: callState === 'ringing' }"
        :disabled="callState !== 'idle'"
        @click="startCall(myId, peer)"
        title="Start video call"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 7l-7 5 7 5V7z"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
        <span>{{ callState === 'ringing' ? 'Calling…' : 'Call' }}</span>
      </button>
    </div>

    <!-- Messages -->
    <div class="messages-area" ref="msgsEl">
      <div class="messages-inner">
        <div
          v-if="messages.length === 0"
          class="empty-chat"
        >
          <div class="empty-icon">💬</div>
          <div>Start the conversation with <strong>{{ peer }}</strong></div>
        </div>

        <TransitionGroup name="msg" tag="div" class="msgs-list">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="msg-row"
            :class="{ mine: msg.from === myId }"
          >
            <div class="bubble">
              <div class="bubble-text">{{ msg.content }}</div>
              <div class="bubble-time">{{ formatTime(msg.timestamp) }}</div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Input -->
    <div class="chat-input-area">
      <div class="input-wrap">
        <input
          v-model="draft"
          class="msg-input"
          placeholder="Type a message…"
          @keydown.enter.prevent="send"
          :disabled="!peer"
          maxlength="1000"
        />
        <button
          class="btn-send"
          :disabled="!draft.trim()"
          @click="send"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useChat } from '../composables/useChat'
import { useCall } from '../composables/useCall'

const props = defineProps({ myId: String, peer: String })

const { getMessages, sendMessage }       = useChat()
const { callState, startCall }           = useCall()

const draft  = ref('')
const msgsEl = ref(null)

const messages = computed(() => getMessages(props.myId, props.peer))

function send() {
  if (!draft.value.trim()) return
  sendMessage(props.myId, props.peer, draft.value)
  draft.value = ''
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function scrollBottom() {
  await nextTick()
  if (msgsEl.value) msgsEl.value.scrollTop = msgsEl.value.scrollHeight
}

watch(messages, scrollBottom, { deep: true })
watch(() => props.peer, () => { draft.value = ''; scrollBottom() })
</script>

<style scoped>
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--bg);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}

.peer-info { display: flex; align-items: center; gap: 12px; }

.peer-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(79,255,176,.12);
  border: 1px solid var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px; color: var(--accent);
}

.peer-name { font-weight: 700; font-size: 15px; }

.peer-online {
  font-family: var(--font-mono); font-size: 11px; color: var(--accent);
}

.btn-call {
  display: flex; align-items: center; gap: 7px;
  background: var(--panel);
  border: 1px solid var(--border2);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
}

.btn-call:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(79,255,176,.06);
}

.btn-call.calling {
  border-color: var(--warn);
  color: var(--warn);
  animation: calling-pulse 1.2s ease-in-out infinite;
}

@keyframes calling-pulse {
  0%, 100% { opacity: 1; } 50% { opacity: .6; }
}

.btn-call:disabled:not(.calling) { opacity: .4; cursor: not-allowed; }

/* Messages */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px 24px 0;
  min-height: 0;
}

.messages-inner { min-height: 100%; display: flex; flex-direction: column; justify-content: flex-end; }

.empty-chat {
  text-align: center;
  color: var(--muted);
  font-size: 14px;
  padding: 60px 20px;
  line-height: 1.7;
}

.empty-icon { font-size: 36px; margin-bottom: 12px; opacity: .4; }

.msgs-list { display: flex; flex-direction: column; gap: 6px; padding-bottom: 16px; }

.msg-row { display: flex; }
.msg-row.mine { justify-content: flex-end; }

.bubble {
  max-width: 66%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px 16px 16px 4px;
  padding: 10px 14px;
}

.msg-row.mine .bubble {
  background: rgba(79,255,176,.1);
  border-color: rgba(79,255,176,.25);
  border-radius: 16px 16px 4px 16px;
}

.bubble-text { font-size: 14px; line-height: 1.55; word-break: break-word; }

.bubble-time {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--muted); margin-top: 4px; text-align: right;
}

/* Transitions */
.msg-enter-active { transition: all .22s cubic-bezier(.34,1.56,.64,1); }
.msg-enter-from   { opacity: 0; transform: translateY(12px) scale(.97); }

/* Input */
.chat-input-area {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}

.input-wrap {
  display: flex; align-items: center; gap: 10px;
  background: var(--panel);
  border: 1px solid var(--border2);
  border-radius: 12px;
  padding: 4px 4px 4px 16px;
  transition: border-color .2s, box-shadow .2s;
}

.input-wrap:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79,255,176,.1);
}

.msg-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 14px;
  padding: 8px 0;
}

.msg-input::placeholder { color: var(--muted); }

.btn-send {
  width: 38px; height: 38px; border-radius: 9px;
  background: var(--accent);
  border: none;
  color: #0d0f12;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity .15s, transform .15s;
}

.btn-send:hover:not(:disabled) { opacity: .85; transform: scale(1.06); }
.btn-send:disabled { opacity: .3; cursor: not-allowed; }
</style>
