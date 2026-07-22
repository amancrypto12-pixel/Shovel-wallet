/* ==========================================================================
   NAVIGATION COMPONENT (Bottom Telegram Cyberpunk Nav Bar)
   ========================================================================== */

import { store } from '../state.js';
import { soundEngine } from '../audio.js';

export function renderNavigation(container) {
  const state = store.getState();
  const current = state.activeTab;

  container.innerHTML = `
    <div class="nav-item ${current === 'mining' ? 'active' : ''}" data-tab="mining">
      <i class="fa-solid fa-pickaxe nav-icon"></i>
      <span class="nav-label">Mining</span>
    </div>
    <div class="nav-item ${current === 'swap' ? 'active dex-active' : ''}" data-tab="swap">
      <i class="fa-solid fa-rotate nav-icon"></i>
      <span class="nav-label">Swap DEX</span>
    </div>
    <div class="nav-item ${current === 'referrals' ? 'active' : ''}" data-tab="referrals">
      <i class="fa-solid fa-users nav-icon"></i>
      <span class="nav-label">Referrals</span>
    </div>
    <div class="nav-item ${current === 'portfolio' ? 'active' : ''}" data-tab="portfolio">
      <i class="fa-solid fa-wallet nav-icon"></i>
      <span class="nav-label">Portfolio</span>
    </div>
  `;

  container.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const tab = el.dataset.tab;
      if (tab !== current) {
        soundEngine.playTabClick();
        store.setActiveTab(tab);
      }
    });
  });
}
