/**
 * useChat.js
 * Manages message history and send/receive logic.
 */
import { ref } from 'vue'
import { useSocket } from './useSocket'

const { socket } = useSocket()

// { conversationKey: [ message, ... ] }
const conversations = ref({})

function convKey(a, b) {
  return [a, b].sort().join('::')
}

function getMessages(userA, userB) {
  const key = convKey(userA, userB)
  if (!conversations.value[key]) conversations.value[key] = []
  return conversations.value[key]
}

socket.on('receive-message', (msg) => {
  const key = convKey(msg.from, msg.to)
  if (!conversations.value[key]) conversations.value[key] = []
  // Deduplicate (sender receives echo back)
  const exists = conversations.value[key].some(m => m.id === msg.id)
  if (!exists) conversations.value[key].push(msg)
})

export function useChat() {
  function sendMessage(from, to, content) {
    if (!content.trim()) return
    socket.emit('send-message', { from, to, content })
  }

  return { conversations, getMessages, sendMessage }
}
