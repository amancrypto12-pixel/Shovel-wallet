/* ==========================================================================
   GLOBAL HEADER COMPONENT (Shovel Wallet)
   Theme picker icon removed as per user request.
   ========================================================================== */

import { store } from '../state.js';
import { soundEngine } from '../audio.js';

export function renderHeader(container) {
  const state = store.getState();
  const balance = state.balances.SHOVEL || 0;

  container.innerHTML = `
    <!-- User Telegram Profile -->
    <div class="user-profile">
      <div class="avatar-wrapper">
        <img class="user-avatar" src="${state.user.avatarUrl}" alt="Avatar" />
        <div class="online-dot"></div>
      </div>
      <div class="user-info">
        <span class="welcome-label">Welcome</span>
        <div class="username">
          ${state.user.name}
          <i class="fa-solid fa-circle-check tg-badge"></i>
          ${state.user.isLegend ? '<span style="font-size: 0.7rem; background: linear-gradient(135deg,#d4a000,#7c3aed); -webkit-background-clip:text; -webkit-text-fill-color:transparent; font-weight:900;">👑 LEGEND</span>' : state.user.isVip ? '<span style="font-size: 0.7rem; color: var(--accent-gold);">👑 VIP</span>' : ''}
        </div>
      </div>
    </div>

    <!-- Right Controls: Balance Pill only (theme icon removed) -->
    <div style="display: flex; align-items: center; gap: 8px;">
      <div class="header-balance-pill" id="header-balance-pill">
        <img src="/shovel_logo.png" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;" />
        <span class="balance-amount">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    </div>
  `;

  // Attach event listener to balance pill to jump to Portfolio tab
  container.querySelector('#header-balance-pill')?.addEventListener('click', () => {
    soundEngine.playTabClick();
    store.setActiveTab('portfolio');
  });
}

