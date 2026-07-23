/* ==========================================================================
   SCREEN 1: MINING DASHBOARD (3-Hour Auto-Mining & Pre-Mining Video Ad)
   
   FIX: Internal timer tick — no DOM re-render, only targeted element updates.
   FIX: Replace PRO-only icons with FREE alternatives.
   FIX: Show live countdown timer inside mining circle when active.
   ========================================================================== */

import { store } from '../state.js';
import { soundEngine } from '../audio.js';
import { showRewardedAdModal, showToast } from './Modals.js';
import { STAR_PRODUCTS, purchaseWithStars } from '../telegramPay.js';

let miningTimerInterval = null;
const DAILY_CLAIM_KEY = (userId) => `daily_claim_last_${userId}`;

export function renderMiningScreen(container, particleEngine) {
  const state = store.getState();
  container.className = 'screen mining-screen';

  const isMiningActive = state.autoMining.active;

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

      <!-- Circular SVG Progress Ring -->
      <svg class="cooldown-svg" viewBox="0 0 155 155">
        <circle class="cooldown-circle-bg" cx="77.5" cy="77.5" r="62" fill="none" />
        <circle class="cooldown-circle-progress" id="session-progress-ring" cx="77.5" cy="77.5" r="62" fill="none" 
          stroke="${isMiningActive ? 'var(--accent-teal)' : 'var(--accent-gold)'}" />
      </svg>

      <!-- Main Action Clickable Mining Button -->
      <button class="mining-tap-btn ${isMiningActive ? 'mining-active-state' : ''}" id="main-mining-action-btn">
        <div id="mining-center-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
          ${isMiningActive ? `
            <div class="cooldown-timer-text" id="mining-timer-display">--:--:--</div>
            <div style="font-size: 0.62rem; color: var(--accent-teal); font-weight: 700; margin-top: 2px;">MINING ACTIVE</div>
          ` : `
            <div style="font-size: 1.5rem; color: var(--accent-gold);"><i class="fa-solid fa-play"></i></div>
            <div class="mine-btn-label">START MINING</div>
            <div style="font-size: 0.62rem; color: var(--text-secondary); margin-top: 1px;">(Watch Ad → 3H Session)</div>
          `}
        </div>
      </button>
    </div>

    <!-- Live Yield Counter Card -->
    <div class="glass-card" style="width: 100%; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; min-height: 56px; flex-shrink: 0;">
      <div style="text-align: left; min-width: 0; flex: 1;">
        <div style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px;">Session Yield</div>
        <div style="font-family: var(--font-mono); font-weight: 800; font-size: 1rem; color: var(--accent-teal);" id="live-yield-counter">
          ${calculateCurrentYield(state)} SHOVEL
        </div>
      </div>
      <div style="width: 1px; height: 32px; background: var(--border-glass); flex-shrink: 0; margin: 0 12px;"></div>
      <div style="text-align: right; flex-shrink: 0;">
        <div style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px;">Rate</div>
        <div style="font-family: var(--font-mono); font-weight: 800; font-size: 1rem; color: var(--accent-gold);">
          ${getEffectiveRate(state).toFixed(1)} /HR
        </div>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="stats-cards-grid">
      <div class="glass-card stat-card">
        <div class="stat-icon"><i class="fa-solid fa-bolt"></i></div>
        <div class="stat-content">
          <span class="stat-label">Session Duration</span>
          <span class="stat-value">${state.autoMining.sessionHours || 3} Hours</span>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-icon teal"><i class="fa-solid fa-fire"></i></div>
        <div class="stat-content">
          <span class="stat-label">Daily Streak</span>
          <span class="stat-value">${state.user.streak} Days 🔥</span>
        </div>
      </div>
    </div>

    <!-- Rewarded Video Ad Speed Boost Banner -->
    <div class="glass-card ad-banner-card">
      <div class="ad-banner-left">
        <div class="ad-icon-box"><i class="fa-solid fa-video"></i></div>
        <div>
          <div class="ad-title">Watch Video Ad</div>
          <div class="ad-desc">Activate 2x Mining Speed Boost!</div>
        </div>
      </div>
      <button class="boost-ad-btn" id="watch-ad-btn">⚡ 2x Speed</button>
    </div>

    <!-- ⭐ Telegram Stars Premium Store -->
    <div style="width:100%; margin-top: 4px;">
      <div class="section-subtitle" style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
        <span style="font-size:1.1rem;">⭐</span>
        <span>Premium Store</span>
        <span style="font-size:0.68rem; background: linear-gradient(135deg,#f59e0b,#d97706); color:#fff; padding:2px 7px; border-radius:99px; font-weight:800; margin-left:4px;">STARS</span>
      </div>

      ${Object.values(STAR_PRODUCTS).map(p => {
        const todayKey = `points_pack_day_${new Date().toISOString().slice(0, 10)}`;
        const usedToday = p.dailyLimit ? parseInt(localStorage.getItem(todayKey) || '0') : 0;
        const isLimitReached = p.dailyLimit && usedToday >= p.dailyLimit;
        const limitLabel = p.dailyLimit ? `<span style="font-size:0.62rem; color:${isLimitReached ? '#ef4444' : '#22c55e'}; font-weight:700; margin-left:4px;">${usedToday}/${p.dailyLimit} today</span>` : '';

        return `
        <div class="glass-card premium-store-card" id="store-card-${p.id}" style="border-color: ${p.color}22; margin-bottom:8px; opacity:${isLimitReached ? '0.65' : '1'};">
          <div style="display:flex; align-items:center; gap:10px; width:100%;">
            <!-- Icon Circle -->
            <div style="width:44px; height:44px; border-radius:50%; background:${p.gradient}; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0; box-shadow: 0 0 12px ${p.color}55;">
              ${p.icon}
            </div>
            <!-- Info -->
            <div style="flex:1; min-width:0;">
              <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
                <span style="font-weight:800; font-size:0.82rem; color:var(--text-primary);">${p.title}</span>
                <span style="font-size:0.62rem; background:${p.color}22; color:${p.color}; padding:1px 6px; border-radius:99px; font-weight:700; border: 1px solid ${p.color}44;">${p.tag}</span>
                ${limitLabel}
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:2px; line-height:1.3;">${p.description}</div>
            </div>
            <!-- Price Button -->
            <button class="stars-buy-btn" data-product="${p.id}" style="background:${isLimitReached ? '#64748b' : p.gradient}; flex-shrink:0;" ${isLimitReached ? 'disabled' : ''}>
              ${isLimitReached ? '✗ Limit' : `⭐ ${p.stars.toLocaleString()}`}
            </button>
          </div>
        </div>
      `}).join('')}
    </div>

    <!-- Bottom spacer: ensures last panel clears the fixed nav bar on ALL devices -->
    <div style="height: 80px; width: 100%; flex-shrink: 0;" aria-hidden="true"></div>
  `;

  // Attach Click Listener to Main Mining Button
  const actionBtn = container.querySelector('#main-mining-action-btn');
  actionBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    soundEngine.playCoinTap();

    const currentState = store.getState();

    if (currentState.autoMining.active) {
      const now = Date.now();
      if (now >= currentState.autoMining.endTime) {
        const claimed = store.claimMiningYield();
        showToast(`🎉 Claimed +${claimed.toFixed(2)} SHOVEL Mined!`);
        // Force full re-render to update button state
        renderMiningScreen(container, particleEngine);
      } else {
        const remMs = currentState.autoMining.endTime - now;
        const h = Math.floor(remMs / 3600000);
        const m = Math.floor((remMs % 3600000) / 60000);
        showToast(`⚡ Mining active! ${h}h ${m}m remaining.`);
      }
    } else {
      showRewardedAdModal(() => {
        store.startMiningSession();
        showToast(`⛏️ ${store.getState().autoMining.sessionHours || 3}-Hour Auto-Mining Started!`);
        // Force full re-render to show timer state
        renderMiningScreen(container, particleEngine);
      });
    }
  });

  // Watch Ad 2x Speed Boost trigger
  container.querySelector('#watch-ad-btn')?.addEventListener('click', () => {
    soundEngine.playCoinTap();
    showRewardedAdModal(() => {
      store.applyAdBoost();
      showToast('⚡ 2x Speed Boost Activated!');
    });
  });

  // ⭐ Telegram Stars Premium Store — Buy button handlers
  container.querySelectorAll('.stars-buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundEngine.playSwapSuccess();
      const productKey = btn.dataset.product;

      // Daily limit check for points_pack
      if (productKey === 'points_pack') {
        const todayKey = `points_pack_day_${new Date().toISOString().slice(0, 10)}`;
        const todayCount = parseInt(localStorage.getItem(todayKey) || '0');
        if (todayCount >= 5) {
          showToast('⚠️ Daily limit reached! Come back tomorrow (5/day max).');
          return;
        }
      }

      purchaseWithStars(productKey, (key) => {
        // Grant reward based on product
        switch (key) {
          case 'ads_free_lifetime':
            store.state.premiumAdsFreeLt = true;
            store.saveState();
            showToast('♾️ Ads Free Lifetime Activated! No more ads ever!');
            break;

          case 'daily_claim': {
            // Bug#2 Fix: enforce real 24h cooldown
            const userId = store._userId || 'guest';
            const claimKey = `daily_claim_last_${userId}`;
            const lastClaim = parseInt(localStorage.getItem(claimKey) || '0');
            const now = Date.now();
            const cooldownMs = 24 * 60 * 60 * 1000;
            if (lastClaim && (now - lastClaim) < cooldownMs) {
              const remH = Math.ceil((cooldownMs - (now - lastClaim)) / 3600000);
              showToast(`⏳ Daily claim available again in ${remH}h!`);
            } else {
              store.state.balances.SHOVEL += 500;
              store.state.transactions.unshift({
                type: 'MINE', title: '🎁 Daily 500 SHOVEL Claim',
                amount: '+500 SHOVEL', time: 'Just now', isPositive: true
              });
              localStorage.setItem(claimKey, String(now));
              store.saveState();
              showToast('🎁 +500 SHOVEL Claimed! Come back in 24h for more!');
              // Refresh balance display immediately
              const balEl = container.querySelector('#main-mine-balance');
              if (balEl) balEl.textContent = store.state.balances.SHOVEL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            break;
          }

          case 'vip_pass':
            store.state.user.isVip = true;
            store.state.user.isLegend = true;
            store.state.transactions.unshift({ type: 'MINE', title: '👑 VIP Legend Pass Activated', amount: 'Legend Badge', time: 'Just now', isPositive: true });
            store.saveState();
            showToast('👑 VIP Legend Pass Activated! Legend badge added to profile!');
            renderMiningScreen(container, particleEngine);
            break;

          case 'monthly_sub':
            store.state.monthlySubEnd = Date.now() + 30 * 24 * 3600 * 1000;
            store.state.premiumAdsFreeLt = true;
            store.state.autoMining.boostMultiplier = 3.0;
            store.state.autoMining.boostEnd = Date.now() + 30 * 24 * 3600 * 1000;
            store.saveState();
            showToast('💎 Monthly Premium Active! Ads free + 3x rewards for 30 days!');
            break;

          case 'auto_farm':
            store.state.autoFarmEnd = Date.now() + 30 * 24 * 3600 * 1000;
            store.state.premiumAdsFreeLt = true;
            store.saveState();
            showToast('🤖 24H Auto-Farm Active for 30 days! Earning while you sleep!');
            break;

          case 'points_pack': {
            // Credit 10 SHOVEL + increment daily counter
            store.state.balances.SHOVEL += 10;
            store.state.transactions.unshift({
              type: 'MINE', title: '⚡ 10 SHOVEL Points Pack',
              amount: '+10 SHOVEL', time: 'Just now', isPositive: true
            });
            store.saveState();
            const today = new Date().toISOString().slice(0, 10);
            const todayKey = `points_pack_day_${today}`;
            const newCount = parseInt(localStorage.getItem(todayKey) || '0') + 1;
            localStorage.setItem(todayKey, String(newCount));
            const remaining = 5 - newCount;
            showToast(`⚡ +10 SHOVEL Added! ${remaining} purchase${remaining !== 1 ? 's' : ''} left today.`);
            // Bug fix: immediately update balance shown on screen + re-render premium panel
            const balEl = container.querySelector('#main-mine-balance');
            if (balEl) balEl.textContent = store.state.balances.SHOVEL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            // Re-render the premium store section to update 0/5 counter display
            renderMiningScreen(container, particleEngine);
            break;
          }
        }
      });
    });
  });

  // Internal targeted tick updates (NO full DOM re-render)
  function updateTick() {
    const s = store.getState();
    const now = Date.now();
    const isMining = s.autoMining.active;

    // Update balance display
    const balanceEl = container.querySelector('#main-mine-balance');
    if (balanceEl) balanceEl.textContent = s.balances.SHOVEL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Update yield counter
    const yieldEl = container.querySelector('#live-yield-counter');
    if (yieldEl) yieldEl.textContent = `${calculateCurrentYield(s)} SHOVEL`;

    // Update progress ring & timer
    const ring = container.querySelector('#session-progress-ring');
    const timerDisplay = container.querySelector('#mining-timer-display');
    const centerContent = container.querySelector('#mining-center-content');
    const btn = container.querySelector('#main-mining-action-btn');

    const durationHours = s.autoMining.sessionHours || 3;
    const totalMs = durationHours * 3600 * 1000;
    // Bug#5 Fix: circumference = 2π × r=62 = ~390 (matches SVG + CSS dasharray)
    const circumference = 2 * Math.PI * 62; // 389.6

    if (isMining && s.autoMining.endTime > now) {
      btn?.classList.add('mining-active-state');

      const remMs = Math.max(0, s.autoMining.endTime - now);
      const elapsedMs = Math.min(totalMs, now - s.autoMining.startTime);
      const progressRatio = elapsedMs / totalMs;

      if (ring) {
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = (circumference * (1 - progressRatio)).toFixed(2);
      }

      const hours = String(Math.floor(remMs / 3600000)).padStart(2, '0');
      const mins = String(Math.floor((remMs % 3600000) / 60000)).padStart(2, '0');
      const secs = String(Math.floor((remMs % 60000) / 1000)).padStart(2, '0');

      if (timerDisplay) {
        timerDisplay.textContent = `${hours}:${mins}:${secs}`;
      } else if (centerContent) {
        centerContent.innerHTML = `
          <div class="cooldown-timer-text" id="mining-timer-display">${hours}:${mins}:${secs}</div>
          <div style="font-size: 0.62rem; color: var(--accent-teal); font-weight: 700; margin-top: 2px;">MINING ACTIVE</div>
        `;
      }
    } else if (!isMining) {
      btn?.classList.remove('mining-active-state');
      if (ring) {
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = circumference;
      }
      if (centerContent && !container.querySelector('.mine-btn-label')) {
        centerContent.innerHTML = `
          <div style="font-size: 1.5rem; color: var(--accent-gold);"><i class="fa-solid fa-play"></i></div>
          <div class="mine-btn-label">START MINING</div>
          <div style="font-size: 0.62rem; color: var(--text-secondary); margin-top: 1px;">(Watch Ad → 3H Session)</div>
        `;
      }
    }
  }

  // Clear any previous timer and start fresh
  if (miningTimerInterval) clearInterval(miningTimerInterval);
  miningTimerInterval = setInterval(updateTick, 1000);
  updateTick();
}

function getEffectiveRate(s) {
  let rate = s.autoMining.ratePerHour;
  if (s.autoMining.boostEnd > Date.now()) {
    // Bug#3 Fix: Use actual stored multiplier, not hardcoded 2x
    rate *= (s.autoMining.boostMultiplier || 2.0);
  }
  if (s.user.isVip) rate *= 3.0;
  return rate;
}

function calculateCurrentYield(s) {
  if (!s.autoMining.active) return '0.0000';
  const now = Date.now();
  const durationMs = (s.autoMining.sessionHours || 3) * 3600 * 1000;
  const elapsedMs = Math.min(now - s.autoMining.startTime, durationMs);
  const hoursElapsed = elapsedMs / (1000 * 3600);
  return (hoursElapsed * getEffectiveRate(s)).toFixed(4);
}
