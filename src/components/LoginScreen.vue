<template>
  <div class="login-wrap">
    <!-- Background decorations (behind everything) -->
    <div class="bg-grid" aria-hidden="true" />
    <div class="bg-glow" aria-hidden="true" />

    <div class="login-card">
      <div class="logo">
        <span class="logo-dot" />
        <span class="logo-text">pulse</span>
      </div>
      <p class="tagline">Real-time chat &amp; calls</p>

      <form @submit.prevent="submit" class="form">
        <label class="field-label">Your user ID</label>
        <div class="input-row">
          <input
            v-model="userId"
            placeholder="e.g. alice"
            autocomplete="off"
            spellcheck="false"
            maxlength="24"
            class="input"
            :class="{ error: touched && !userId.trim() }"
            @focus="touched = false"
          />
        </div>

        <button type="submit" class="btn-connect" :disabled="!userId.trim()">
          <span>Connect</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </form>

      <div class="hint">
        Open in two tabs with different IDs to test calling &amp; chat
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["login"]);
const userId = ref("");
const touched = ref(false);

function submit() {
  touched.value = true;
  if (userId.value.trim()) emit("login", userId.value.trim());
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Background layers — z-index 0, never intercept clicks */
.bg-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.35;
}

.bg-glow {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(79, 255, 176, 0.07) 0%,
    transparent 70%
  );
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Card sits above backgrounds */
.login-card {
  position: relative;
  z-index: 1;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 20px;
  padding: 48px 44px;
  width: 380px;
  box-shadow:
    var(--shadow),
    0 0 60px rgba(79, 255, 176, 0.06);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.logo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.8);
  }
}

.logo-text {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--text);
}

.tagline {
  color: var(--muted);
  font-size: 13px;
  letter-spacing: 0.3px;
  margin-bottom: 36px;
  font-family: var(--font-mono);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--muted);
}

.input-row {
  position: relative;
}

.input {
  width: 100%;
  background: var(--panel);
  border: 1px solid var(--border2);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  font-size: 15px;
  font-family: var(--font-mono);
  color: var(--text);
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79, 255, 176, 0.12);
}

.input.error {
  border-color: var(--danger);
}

.btn-connect {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--accent);
  color: #0d0f12;
  border: none;
  border-radius: var(--radius-sm);
  padding: 13px 24px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.15s,
    box-shadow 0.2s;
}

.btn-connect:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79, 255, 176, 0.3);
}

.btn-connect:active:not(:disabled) {
  transform: translateY(0);
}
.btn-connect:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.hint {
  margin-top: 28px;
  padding: 12px 14px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
  line-height: 1.6;
}
</style>
