<template>
  <div class="app">
    <!-- Login -->
    <LoginScreen v-if="!myId" @login="handleLogin" />

    <!-- Main UI -->
    <div v-else class="main-layout">
      <Sidebar
        :myId="myId"
        :connected="connected"
        :onlineUsers="onlineUsers"
        :selectedUser="selectedUser"
        @select="selectedUser = $event"
      />

      <ChatWindow
        v-if="selectedUser"
        :myId="myId"
        :peer="selectedUser"
      />

      <EmptyState v-else />
    </div>

    <!-- Call overlay (always mounted so it can receive incoming calls) -->
    <CallOverlay v-if="myId" :myId="myId" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSocket } from './composables/useSocket'

import LoginScreen from './components/LoginScreen.vue'
import Sidebar     from './components/Sidebar.vue'
import ChatWindow  from './components/ChatWindow.vue'
import EmptyState  from './components/EmptyState.vue'
import CallOverlay from './components/CallOverlay.vue'

const { connected, onlineUsers, connect } = useSocket()

const myId        = ref(null)
const selectedUser = ref(null)

function handleLogin(userId) {
  myId.value = userId
  connect(userId)
}
</script>

<style scoped>
.app { height: 100vh; display: flex; flex-direction: column; }

.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
