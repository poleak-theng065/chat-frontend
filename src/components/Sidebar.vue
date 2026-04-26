<template>
  <aside class="sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="logo-small">
        <span class="dot" />
        <span>pulse</span>
      </div>
      <div class="conn-badge" :class="{ online: connected }">
        {{ connected ? 'live' : 'off' }}
      </div>
    </div>

    <!-- My ID -->
    <div class="my-id-block">
      <div class="my-id-label">Signed in as</div>
      <div class="my-id">{{ myId }}</div>
    </div>

    <!-- Users -->
    <div class="section-label">Online users</div>

    <div class="user-list">
      <div
        v-if="peers.length === 0"
        class="empty-peers"
      >
        Waiting for others…
      </div>

      <button
        v-for="user in peers"
        :key="user"
        class="user-item"
        :class="{ active: selectedUser === user }"
        @click="$emit('select', user)"
      >
        <div class="avatar">{{ user[0].toUpperCase() }}</div>
        <div class="user-meta">
          <span class="user-name">{{ user }}</span>
          <span class="user-status">online</span>
        </div>
        <div class="status-dot" />
      </button>
    </div>

    <!-- Call history -->
    <div class="section-label" style="margin-top:auto; padding-top:16px;">
      Call history
    </div>
    <div class="call-history">
      <div v-if="callLog.length === 0" class="empty-history">No calls yet</div>
      <div
        v-for="log in callLog"
        :key="log.id"
        class="call-entry"
        :class="log.status"
      >
        <div class="call-icon">
          <svg v-if="log.status === 'completed'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.03 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          <svg v-else-if="log.status === 'missed'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.03 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91"/><line x1="23" y1="1" x2="17" y2="7"/><line x1="17" y1="1" x2="23" y2="7"/></svg>
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        <div class="call-detail">
          <span class="call-peer">{{ log.caller === myId ? log.receiver : log.caller }}</span>
          <span class="call-dur" v-if="log.duration">{{ log.duration }}s</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useCall } from '../composables/useCall'

const props = defineProps({
  myId: String,
  connected: Boolean,
  onlineUsers: Array,
  selectedUser: String,
})

defineEmits(['select'])

const { callLog } = useCall()

const peers = computed(() =>
  (props.onlineUsers || []).filter(u => u !== props.myId)
)
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 18px 14px;
  border-bottom: 1px solid var(--border);
}

.logo-small {
  display: flex; align-items: center; gap: 8px;
  font-weight: 800; font-size: 16px; letter-spacing: -.5px;
}

.dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}

.conn-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--faint);
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.conn-badge.online {
  background: rgba(79,255,176,.12);
  color: var(--accent);
}

.my-id-block {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}

.my-id-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--muted);
  margin-bottom: 4px;
}

.my-id {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--accent);
  font-weight: 500;
}

.section-label {
  padding: 14px 18px 6px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--faint);
  font-weight: 600;
}

.user-list { display: flex; flex-direction: column; gap: 2px; padding: 4px 8px; }

.empty-peers {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--faint);
  padding: 8px 10px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text);
  text-align: left;
  transition: background .15s;
  position: relative;
}

.user-item:hover { background: var(--panel); }
.user-item.active { background: rgba(79,255,176,.08); }

.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--panel);
  border: 1px solid var(--border2);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px;
  flex-shrink: 0;
}

.user-item.active .avatar {
  background: rgba(79,255,176,.15);
  border-color: var(--accent);
  color: var(--accent);
}

.user-meta { flex: 1; overflow: hidden; }

.user-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.user-status {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--accent);
}

.status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent);
  flex-shrink: 0;
}

/* Call History */
.call-history {
  padding: 4px 8px 16px;
  display: flex; flex-direction: column; gap: 2px;
  overflow-y: auto; max-height: 160px;
}

.empty-history {
  font-family: var(--font-mono); font-size: 11px; color: var(--faint);
  padding: 6px 10px;
}

.call-entry {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  background: var(--panel);
}

.call-icon { flex-shrink: 0; opacity: .7; }

.call-entry.completed .call-icon { color: var(--accent); }
.call-entry.missed    .call-icon { color: var(--warn); }
.call-entry.rejected  .call-icon { color: var(--danger); }

.call-detail { display: flex; flex-direction: column; overflow: hidden; }

.call-peer {
  font-family: var(--font-mono); font-size: 11px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.call-dur { font-size: 10px; color: var(--muted); }
</style>
