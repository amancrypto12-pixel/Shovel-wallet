/* ==========================================================================
   SCREEN 1: MINING DASHBOARD (3-Hour Auto-Mining & Pre-Mining Video Ad)
   ========================================================================== */

import { store } from '../state.js';
import { soundEngine } from '../audio.js';
import { showRewardedAdModal, showToast } from './Modals.js';

let miningTimerInterval = null;

export function renderMiningScreen(container, particleEngine) {
  const state = store.getState();
  container.className = 'screen mining-screen';

  const isMiningActive = state.autoMining.active;

  // Render initial static DOM structure ONCE
  container.innerHTML = `
    <!-- Top Mining Token Banner -->
    <div class="mine-banner-summary">
      <div class="mine-token-badge">
        <img src="/shovel_logo.png" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;" />
        <span>$SHOVEL MINING</span>
      </div>
      <div class="huge-balance" id="main-mine-balance">${state.balances.SHOVEL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      <div class="mine-subtitle">Real-time Multi-Crypto Mining Hub</div>
    </div>

    <!-- Central Mining Device Ring & Tap Button -->
    <div class="mining-hero-container">
      <div class="mining-outer-ring"></div>
      <div class="mining-outer-glow"></div>

      <!-- Circular SVG Cooldown Progress Ring (r=72, circumference=450) -->
      <svg class="cooldown-svg" viewBox="0 0 165 165">
        <circle class="cooldown-circle-bg" cx="82.5" cy="82.5" r="72" fill="none" />
        <circle class="cooldown-circle-progress" id="session-progress-ring" cx="82.5" cy="82.5" r="72" fill="none" 
          stroke="${isMiningActive ? 'var(--accent-teal)' : 'var(--accent-gold)'}" />
      </svg>

      <!-- Main Action Clickable Mining Button -->
      <button class="mining-tap-btn ${isMiningActive ? 'mining-active-state' : ''}" id="main-mining-action-btn">
        <div id="mining-center-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
          ${isMiningActive ? `
            <div class="cooldown-timer-text" id="mining-timer-display">02:59:59</div>
            <div style="font-size: 0.6rem; color: var(--accent-teal); font-weight: 700; margin-top: 2px;">MINING IN PROGRESS</div>
          ` : `
            <div style="font-size: 1.5rem; color: var(--accent-gold);"><i class="fa-solid fa-play"></i></div>
            <div class="mine-btn-label">START MINING</div>
            <div style="font-size: 0.6rem; color: var(--text-secondary); margin-top: 1px;">(Watch Ad ➔ 3H)</div>
          `}
        </div>
      </button>
    </div>

    <!-- Live Yield Counter Card -->
    <div class="glass-card" style="width: 100%; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
      <div style="text-align: left;">
        <div style="font-size: 0.72rem; color: var(--text-secondary);">Session Yield Accumulating</div>
        <div style="font-family: var(--font-mono); font-weight: 800; font-size: 1rem; color: var(--accent-teal);" id="live-yield-counter">
          ${calculateCurrentYield(state)} SHOVEL
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 0.72rem; color: var(--text-secondary);">Mining Rate</div>
        <div style="font-family: var(--font-mono); font-weight: 800; font-size: 0.9rem; color: var(--accent-gold);">
          ${(state.autoMining.ratePerHour * (state.autoMining.boostEnd > Date.now() ? 2.0 : 1.0) * (state.user.isVip ? 3.0 : 1.0)).toFixed(1)} SHOVEL/HR
        </div>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="stats-cards-grid">
      <div class="glass-card stat-card">
        <div class="stat-icon"><i class="fa-solid fa-bolt"></i></div>
        <div class="stat-content">
          <span class="stat-label">Session Duration</span>
          <span class="stat-value" id="session-hours-lbl">${state.autoMining.sessionHours || 3} Hours</span>
        </div>
      </div>

      <div class="glass-card stat-card">
        <div class="stat-icon teal"><i class="fa-solid fa-clock-rotate-left"></i></div>
        <div class="stat-content">
          <span class="stat-label">Daily Streak</span>
          <span class="stat-value">${state.user.streak} Days 🔥</span>
        </div>
      </div>
    </div>

    <!-- Rewarded Video Ad Speed Boost Banner -->
    <div class="glass-card ad-banner-card">
      <div class="ad-banner-left">
        <div class="ad-icon-box"><i class="fa-solid fa-play"></i></div>
        <div>
          <div class="ad-title">Watch Video Ad</div>
          <div class="ad-desc">Activate 2x Mining Speed Boost!</div>
        </div>
      </div>
      <button class="boost-ad-btn" id="watch-ad-btn">
        ⚡ 2x Speed
      </button>
    </div>
  `;

  // Attach Click Listener to Main Mining Button
  const actionBtn = container.querySelector('#main-mining-action-btn');
  actionBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    soundEngine.playCoinTap();

    const currentState = store.getState();

    if (currentState.autoMining.active) {
      const now = Date.now();
      if (now >= currentState.autoMining.endTime) {
        const claimed = store.claimMiningYield();
        showToast(`🎉 Claimed +${claimed.toFixed(2)} SHOVEL Mined!`);
      } else {
        const remMs = currentState.autoMining.endTime - now;
        const h = Math.floor(remMs / 3600000);
        const m = Math.floor((remMs % 3600000) / 60000);
        showToast(`⚡ Mining active! ${h}h ${m}m remaining.`);
      }
    } else {
      // Trigger Rewarded Video Ad Modal FIRST before starting 3-Hour Mining!
      showRewardedAdModal(() => {
        store.startMiningSession();
        showToast(`⛏️ ${store.getState().autoMining.sessionHours || 3}-Hour Auto-Mining Started!`);
        updateTick();
      });
    }
  });

  // Watch Ad 2x Speed Boost trigger
  container.querySelector('#watch-ad-btn')?.addEventListener('click', () => {
    soundEngine.playCoinTap();
    showRewardedAdModal(() => {
      store.applyAdBoost();
      showToast('⚡ 2x Speed Boost Activated for Mining Session!');
    });
  });

  // Targeted Update Tick for Timer & Live Yield
  function updateTick() {
    const s = store.getState();
    const now = Date.now();
    const isMining = s.autoMining.active;

    const balanceEl = container.querySelector('#main-mine-balance');
    if (balanceEl) balanceEl.innerText = s.balances.SHOVEL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const yieldEl = container.querySelector('#live-yield-counter');
    if (yieldEl) yieldEl.innerText = `${calculateCurrentYield(s)} SHOVEL`;

    const ring = container.querySelector('#session-progress-ring');
    const timerDisplay = container.querySelector('#mining-timer-display');
    const centerContent = container.querySelector('#mining-center-content');
    const btn = container.querySelector('#main-mining-action-btn');

    const durationHours = s.autoMining.sessionHours || 3;
    const totalMs = durationHours * 3600 * 1000;

    if (isMining) {
      btn?.classList.add('mining-active-state');
      const remMs = Math.max(0, s.autoMining.endTime - now);
      const elapsedMs = Math.min(totalMs, now - s.autoMining.startTime);
      const progressRatio = elapsedMs / totalMs;

      // Update SVG ring offset (circumference = 450)
      if (ring) ring.style.strokeDashoffset = (450 * (1 - progressRatio)).toFixed(2);

      const hours = String(Math.floor(remMs / 3600000)).padStart(2, '0');
      const mins = String(Math.floor((remMs % 3600000) / 60000)).padStart(2, '0');
      const secs = String(Math.floor((remMs % 60000) / 1000)).padStart(2, '0');

      if (timerDisplay) {
        timerDisplay.innerText = `${hours}:${mins}:${secs}`;
      } else if (centerContent) {
        centerContent.innerHTML = `
          <div class="cooldown-timer-text" id="mining-timer-display">${hours}:${mins}:${secs}</div>
          <div style="font-size: 0.6rem; color: var(--accent-teal); font-weight: 700; margin-top: 2px;">MINING IN PROGRESS</div>
        `;
      }
    } else {
      btn?.classList.remove('mining-active-state');
      if (ring) ring.style.strokeDashoffset = '450';
      if (centerContent && !container.querySelector('.mine-btn-label')) {
        centerContent.innerHTML = `
          <div style="font-size: 1.5rem; color: var(--accent-gold);"><i class="fa-solid fa-play"></i></div>
          <div class="mine-btn-label">START MINING</div>
          <div style="font-size: 0.6rem; color: var(--text-secondary); margin-top: 1px;">(Watch Ad ➔ 3H)</div>
        `;
      }
    }
  }

  // Clear previous timer and run targeted updates
  if (miningTimerInterval) clearInterval(miningTimerInterval);
  miningTimerInterval = setInterval(updateTick, 1000);
  updateTick(); // Initial tick run
}

function calculateCurrentYield(s) {
  if (!s.autoMining.active) return '0.0000';
  const now = Date.now();
  const durationHours = s.autoMining.sessionHours || 3;
  const durationMs = durationHours * 3600 * 1000;
  const elapsedMs = Math.min(now - s.autoMining.startTime, durationMs);
  const hoursElapsed = elapsedMs / (1000 * 3600);
  
  let rate = s.autoMining.ratePerHour;
  if (s.autoMining.boostEnd > now) rate *= 2.0;
  if (s.user.isVip) rate *= 3.0;

  return (hoursElapsed * rate).toFixed(4);
}
