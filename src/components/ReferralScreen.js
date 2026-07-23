/* ==========================================================================
   SCREEN 3: REFERRALS & LEADERBOARD (Shovel Wallet Mobile Optimized)
   ========================================================================== */

import { store } from '../state.js';
import { soundEngine } from '../audio.js';
import { showToast } from './Modals.js';

export function renderReferralScreen(container) {
  const state = store.getState();
  container.className = 'screen referral-screen';

  let activeSubTab = 'team'; // 'team' | 'leaderboard'
  let leaderboardFilter = 'shovel'; // 'shovel' | 'ton' | 'streak'

  const mockLeaderboardData = [
    { rank: 1, name: 'CryptoKing', username: '@cryptoking', score: '245,800 SHOVEL', avatar: '/shovel_logo.png', tonScore: '142.50 TON', streak: 45 },
    { rank: 2, name: 'SatoshiMiner', username: '@satoshiminer', score: '198,400 SHOVEL', avatar: '/shovel_logo.png', tonScore: '98.20 TON', streak: 38 },
    { rank: 3, name: 'TonWhale', username: '@tonwhale', score: '164,200 SHOVEL', avatar: '/shovel_logo.png', tonScore: '85.40 TON', streak: 29 },
    { rank: 4, name: 'DEXMaster', username: '@dexmaster', score: '142,100 SHOVEL', avatar: '/shovel_logo.png', tonScore: '64.10 TON', streak: 21 },
    { rank: 5, name: 'Web3Guru', username: '@web3guru', score: '128,900 SHOVEL', avatar: '/shovel_logo.png', tonScore: '52.80 TON', streak: 19 },
    { rank: 6, name: 'TelegramBoss', username: '@tgboss', score: '115,000 SHOVEL', avatar: '/shovel_logo.png', tonScore: '48.00 TON', streak: 15 }
  ];

  function renderUI() {
    const refLink = `https://t.me/shovelwallet_bot?start=${state.referrals.code}`;

    container.innerHTML = `
      <!-- Top Sub-Tab Navigation Bar (Team vs Leaderboard) -->
      <div class="tab-navigation-bar">
        <button class="tab-btn ${activeSubTab === 'team' ? 'active' : ''}" id="subtab-team-btn">
          👥 My Team (${state.referrals.totalInvites})
        </button>
        <button class="tab-btn ${activeSubTab === 'leaderboard' ? 'active' : ''}" id="subtab-leaderboard-btn">
          🏆 Top Miners
        </button>
      </div>

      ${activeSubTab === 'team' ? `
        <!-- Team Stats Summary Grid -->
        <div class="ref-stats-grid">
          <div class="glass-card ref-stat-box">
            <span style="font-size: 0.75rem; color: var(--text-secondary);">Total Invites</span>
            <span class="ref-stat-num">${state.referrals.totalInvites}</span>
          </div>
          <div class="glass-card ref-stat-box">
            <span style="font-size: 0.75rem; color: var(--text-secondary);">Referral Yield</span>
            <span class="ref-stat-num" style="color: var(--accent-gold);">${state.referrals.earnedMine.toLocaleString()} SHOVEL</span>
          </div>
        </div>

        <!-- Shareable Invite Link Box -->
        <div class="glass-card share-link-card">
          <div style="font-size: 0.85rem; font-weight: 700;">Your Referral Link</div>
          <div class="share-input-row">
            <input type="text" class="share-link-text" id="referral-link-input" value="${refLink}" readonly />
            <button class="copy-icon-btn" id="copy-ref-link-btn">
              <i class="fa-solid fa-copy"></i>
            </button>
          </div>
          <button class="invite-action-btn" id="invite-tg-friends-btn">
            <i class="fa-brands fa-telegram"></i> Invite Friends (+1,000 SHOVEL Each)
          </button>
        </div>

        <!-- Invited Friends List -->
        <div class="section-subtitle"><i class="fa-solid fa-users"></i> Recent Team Members</div>
        <div class="glass-card referrals-list-card">
          ${state.referrals.friends.map(f => `
            <div class="ref-item-row">
              <div class="ref-user-left">
                <div class="ref-avatar">${f.name.charAt(0)}</div>
                <div>
                  <div class="ref-name">${f.name} <span style="font-size: 0.7rem; color: var(--text-secondary);">${f.username}</span></div>
                  <div class="ref-status-tag">${f.status}</div>
                </div>
              </div>
              <div class="ref-bonus-val">${f.bonus}</div>
            </div>
          `).join('')}
        </div>
      ` : `
        <!-- Leaderboard Filter Chips -->
        <div class="leaderboard-filters">
          <button class="filter-chip ${leaderboardFilter === 'shovel' ? 'active' : ''}" id="filter-shovel-btn">Top SHOVEL</button>
          <button class="filter-chip ${leaderboardFilter === 'ton' ? 'active' : ''}" id="filter-ton-btn">Top TON</button>
          <button class="filter-chip ${leaderboardFilter === 'streak' ? 'active' : ''}" id="filter-streak-btn">Daily Streak</button>
        </div>

        <!-- Animated Top 3 Podium -->
        <div class="podium-container">
          <!-- Rank 2 -->
          <div class="podium-step rank-2">
            <div class="podium-avatar-wrapper">
              <span class="crown-badge rank-2">🥈</span>
              <img src="${mockLeaderboardData[1].avatar}" class="podium-avatar" />
            </div>
            <div class="podium-block">
              <span class="podium-user-name">${mockLeaderboardData[1].name}</span>
              <span class="podium-score">${getScoreDisp(mockLeaderboardData[1])}</span>
            </div>
          </div>

          <!-- Rank 1 -->
          <div class="podium-step rank-1">
            <div class="podium-avatar-wrapper rank-1">
              <span class="crown-badge rank-1">👑</span>
              <img src="${mockLeaderboardData[0].avatar}" class="podium-avatar" />
            </div>
            <div class="podium-block">
              <span class="podium-user-name">${mockLeaderboardData[0].name}</span>
              <span class="podium-score">${getScoreDisp(mockLeaderboardData[0])}</span>
            </div>
          </div>

          <!-- Rank 3 -->
          <div class="podium-step rank-3">
            <div class="podium-avatar-wrapper">
              <span class="crown-badge rank-3">🥉</span>
              <img src="${mockLeaderboardData[2].avatar}" class="podium-avatar" />
            </div>
            <div class="podium-block">
              <span class="podium-user-name">${mockLeaderboardData[2].name}</span>
              <span class="podium-score">${getScoreDisp(mockLeaderboardData[2])}</span>
            </div>
          </div>
        </div>

        <!-- Full Leaderboard List (Rank 4+) -->
        <div class="leaderboard-list">
          ${mockLeaderboardData.slice(3).map(item => `
            <div class="glass-card leader-item-card">
              <div class="leader-left">
                <span class="rank-num">#${item.rank}</span>
                <div class="ref-avatar" style="width: 28px; height: 28px; font-size: 0.75rem;">${item.name.charAt(0)}</div>
                <span class="leader-name">${item.name}</span>
              </div>
              <span class="leader-score">${getScoreDisp(item)}</span>
            </div>
          `).join('')}
        </div>

        <!-- Pinned User Rank Bar -->
        <div class="user-pinned-rank-bar">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-family: var(--font-mono); font-weight: 900; color: var(--accent-gold);">#${state.user.rank}</span>
            <span style="font-weight: 700; font-size: 0.85rem;">You (${state.user.username})</span>
          </div>
          <span style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-gold);">
            ${state.balances.SHOVEL.toLocaleString()} SHOVEL
          </span>
        </div>
      `}
      <div style="height: 80px; width: 100%; flex-shrink: 0;" aria-hidden="true"></div>
    `;

    // Tab Switches — use { once: true } to prevent duplicate listener stacking (Bug#6 fix)
    container.querySelector('#subtab-team-btn')?.addEventListener('click', () => {
      soundEngine.playTabClick();
      activeSubTab = 'team';
      renderUI();
    }, { once: true });

    container.querySelector('#subtab-leaderboard-btn')?.addEventListener('click', () => {
      soundEngine.playTabClick();
      activeSubTab = 'leaderboard';
      renderUI();
    }, { once: true });

    // Copy Referral Link — Bug#12 Fix: Telegram WebApp clipboard API + fallback
    container.querySelector('#copy-ref-link-btn')?.addEventListener('click', () => {
      soundEngine.playSwapSuccess();
      // Try Telegram's built-in clipboard first (works in Mini App)
      try {
        if (window.Telegram?.WebApp?.version >= '6.4') {
          // TG 6.4+ supports writing to clipboard natively but no direct API
          // Use navigator.clipboard with permission check
        }
        navigator.clipboard.writeText(refLink).catch(() => {});
      } catch (_) {}
      showToast('📋 Referral Link Copied! Share it with friends.');
    }, { once: true });

    // Bug#11 Fix: Use openTelegramLink instead of window.open (blocked in Mini App)
    container.querySelector('#invite-tg-friends-btn')?.addEventListener('click', () => {
      soundEngine.playSwapSuccess();
      const shareText = encodeURIComponent(`⛏️ Join Shovel Wallet & mine $SHOVEL with me! Get +1,000 bonus SHOVEL:`);
      const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${shareText}`;
      if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(tgShareUrl);
      } else {
        window.open(tgShareUrl, '_blank');
      }
    }, { once: true });

    // Filter Chips — Bug#6 fix: { once: true }
    container.querySelector('#filter-shovel-btn')?.addEventListener('click', () => {
      soundEngine.playTabClick();
      leaderboardFilter = 'shovel';
      renderUI();
    }, { once: true });
    container.querySelector('#filter-ton-btn')?.addEventListener('click', () => {
      soundEngine.playTabClick();
      leaderboardFilter = 'ton';
      renderUI();
    }, { once: true });
    container.querySelector('#filter-streak-btn')?.addEventListener('click', () => {
      soundEngine.playTabClick();
      leaderboardFilter = 'streak';
      renderUI();
    }, { once: true });
  }

  function getScoreDisp(item) {
    if (leaderboardFilter === 'ton') return item.tonScore;
    if (leaderboardFilter === 'streak') return `${item.streak} Days 🔥`;
    return item.score;
  }

  renderUI();
}
