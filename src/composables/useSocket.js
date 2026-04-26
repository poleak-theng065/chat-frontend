/**
 * useSocket.js
 * Wraps Socket.IO client. One shared instance across the app.
 *
 * VITE_BACKEND_URL:
 *   - Set to "http://localhost:3001" for local dev (direct connection)
 *   - Left empty in Docker build — Nginx proxies /socket.io to the backend,
 *     so Socket.IO connects to the same origin automatically.
 */
import { ref, readonly } from 'vue'
import { io } from 'socket.io-client'

const backendUrl = import.meta.env.VITE_BACKEND_URL

// When backendUrl is empty, pass `undefined` so Socket.IO uses the current origin.
const socket = io(backendUrl || undefined, { autoConnect: false })

const connected   = ref(false)
const onlineUsers = ref([])

socket.on('connect',    () => { connected.value = true  })
socket.on('disconnect', () => { connected.value = false })

socket.on('user-online',  ({ onlineUsers: u }) => { onlineUsers.value = u })
socket.on('user-offline', ({ onlineUsers: u }) => { onlineUsers.value = u })

export function useSocket() {
  function connect(userId) {
    socket.connect()
    socket.once('connect', () => {
      socket.emit('register', { userId })
    })
  }

  function disconnect() {
    socket.disconnect()
  }

  return {
    socket,
    connected: readonly(connected),
    onlineUsers: readonly(onlineUsers),
    connect,
    disconnect,
  }
}
