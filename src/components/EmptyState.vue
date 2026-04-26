<template>
  <div class="empty-state">
    <div class="grid-bg" aria-hidden="true" />
    <div class="content">
      <div class="pulse-ring" aria-hidden="true">
        <div class="pr pr1" /><div class="pr pr2" /><div class="pr pr3" />
        <svg class="icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      </div>
      <h2>Select someone to chat with</h2>
      <p>Choose a user from the sidebar to start a conversation or make a call.</p>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.grid-bg {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: .2;
}

.content {
  position: relative;
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; text-align: center; padding: 40px;
}

.pulse-ring {
  position: relative;
  width: 80px; height: 80px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
}

.pr {
  position: absolute; border-radius: 50%;
  border: 1px solid var(--accent);
  animation: expand 3s ease-out infinite;
}
.pr1 { width: 80px; height: 80px; animation-delay: 0s; }
.pr2 { width: 56px; height: 56px; animation-delay: .5s; }
.pr3 { width: 36px; height: 36px; animation-delay: 1s; }

@keyframes expand {
  0%   { opacity: .5; transform: scale(.7); }
  100% { opacity: 0;  transform: scale(1.3); }
}

.icon { position: relative; z-index: 1; color: var(--accent); }

h2 { font-size: 18px; font-weight: 700; color: var(--text); }
p  { font-size: 13px; color: var(--muted); font-family: var(--font-mono); max-width: 280px; line-height: 1.6; }
</style>
