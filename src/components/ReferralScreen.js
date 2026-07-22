/* ==========================================================================
   SCREEN 3: REFERRAL DASHBOARD & LEADERBOARD (Shovel Wallet)
   ========================================================================== */

import { store } from '../state.js';
import { soundEngine } from '../audio.js';
import { showToast } from './Modals.js';

let activeSubTab = 'team'; // 'team' | 'leaderboard'
let leaderboardFilter = 'mine'; // 'mine' | 'usdt' | 'streak'

export function renderReferralScreen(container) {
  const state = store.getState();
  container.className = 'screen referral-screen';

  function renderSubTabContent() {
    container.innerHTML = `
      <!-- Top Sub-Tab Navigation -->
      <div class="tab-navigation-bar">
        <button class="tab-btn ${activeSubTab === 'team' ? 'active' : ''}" id="tab-team-btn">
          <i class="fa-solid fa-users"></i> My Team (${state.referrals.totalInvites})
        </button>
        <button class="tab-btn ${activeSubTab === 'leaderboard' ? 'active' : ''}" id="tab-leaderboard-btn">
          <i class="fa-solid fa-trophy"></i> Leaderboard
        </button>
      </div>

      ${activeSubTab === 'team' ? renderTeamTab(state) : renderLeaderboardTab(state)}
    `;

    // Attach Sub-Tab Event Listeners
    container.querySelector('#tab-team-btn')?.addEventListener('click', () => {
      soundEngine.playTabClick();
      activeSubTab = 'team';
      renderSubTabContent();
    });

    container.querySelector('#tab-leaderboard-btn')?.addEventListener('click', () => {
      soundEngine.playTabClick();
      activeSubTab = 'leaderboard';
      renderSubTabContent();
    });

    // Attach Team Specific Handlers
    if (activeSubTab === 'team') {
      const copyBtn = container.querySelector('#copy-ref-btn');
      const inviteBtn = container.querySelector('#invite-friends-btn');
      const shareUrl = `t.me/ShovelWalletBot?start=${state.referrals.code}`;

      const handleCopy = () => {
        soundEngine.playCoinTap();
        navigator.clipboard.writeText(shareUrl).catch(() => {});
        showToast('📋 Referral Link Copied to Clipboard!');
      };

      copyBtn?.addEventListener('click', handleCopy);
      inviteBtn?.addEventListener('click', handleCopy);
    }

    // Attach Leaderboard Filter Handlers
    if (activeSubTab === 'leaderboard') {
      container.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          soundEngine.playTabClick();
          leaderboardFilter = chip.dataset.filter;
          renderSubTabContent();
        });
      });
    }
  }

  renderSubTabContent();
}

// --- Tab A: My Team HTML ---
function renderTeamTab(state) {
  const shareUrl = `t.me/ShovelWalletBot?start=${state.referrals.code}`;

  return `
    <!-- Invite Stats Grid -->
    <div class="ref-stats-grid">
      <div class="glass-card ref-stat-box">
        <span class="stat-label">Total Invites</span>
        <span class="ref-stat-num">${state.referrals.totalInvites}</span>
      </div>
      <div class="glass-card ref-stat-box">
        <span class="stat-label">$SHOVEL Earned</span>
        <span class="ref-stat-num">${state.referrals.earnedMine.toLocaleString()} <img src="/shovel_logo.png" style="width: 14px; height: 14px; border-radius: 50%; vertical-align: middle;" /></span>
      </div>
    </div>

    <!-- Share Link Area -->
    <div class="glass-card share-link-card">
      <div class="section-subtitle"><i class="fa-solid fa-link"></i> Your Shovel Telegram Link</div>
      <div class="share-input-row">
        <span class="share-link-text">${shareUrl}</span>
        <button class="copy-icon-btn" id="copy-ref-btn" title="Copy Link">
          <i class="fa-regular fa-copy"></i>
        </button>
      </div>
      <button class="invite-action-btn" id="invite-friends-btn">
        <i class="fa-paper-plane fa-solid"></i> Copy & Invite Telegram Friends
      </button>
    </div>

    <!-- Recent Referrals List -->
    <div class="glass-card referrals-list-card">
      <div class="section-subtitle"><i class="fa-solid fa-user-group"></i> Recent Referrals</div>
      <div class="ref-items-container">
        ${state.referrals.friends.map(f => `
          <div class="ref-item-row">
            <div class="ref-user-left">
              <div class="ref-avatar">${f.name.charAt(0)}</div>
              <div>
                <div class="ref-name">${f.name}</div>
                <div class="ref-status-tag">${f.status}</div>
              </div>
            </div>
            <div class="ref-bonus-val">${f.bonus}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// --- Tab B: Leaderboard HTML ---
function renderLeaderboardTab(state) {
  const leaderboardData = [
    { rank: 1, name: 'Satoshi_N', username: '@satoshi', score: '2,450,000 ⛏️', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Satoshi' },
    { rank: 2, name: 'Pavel_D', username: '@durov', score: '1,890,000 ⛏️', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pavel' },
    { rank: 3, name: 'CryptoWhale', username: '@whale', score: '1,420,000 ⛏️', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Whale' },
    { rank: 4, name: 'Alex_Ton', username: '@alexton', score: '980,000 ⛏️', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex' },
    { rank: 5, name: 'Elena_Web3', username: '@elena', score: '840,000 ⛏️', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elena' },
    { rank: 6, name: 'MinerKing', username: '@king', score: '720,000 ⛏️', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=King' }
  ];

  const top1 = leaderboardData[0];
  const top2 = leaderboardData[1];
  const top3 = leaderboardData[2];
  const restList = leaderboardData.slice(3);

  return `
    <!-- Filter Chips -->
    <div class="leaderboard-filters">
      <button class="filter-chip ${leaderboardFilter === 'mine' ? 'active' : ''}" data-filter="mine">Top SHOVEL</button>
      <button class="filter-chip ${leaderboardFilter === 'usdt' ? 'active' : ''}" data-filter="usdt">Top TON</button>
      <button class="filter-chip ${leaderboardFilter === 'streak' ? 'active' : ''}" data-filter="streak">Daily Streak</button>
    </div>

    <!-- Animated 3D Top 3 Podium -->
    <div class="podium-container">
      <!-- Rank 2 -->
      <div class="podium-step rank-2">
        <div class="podium-avatar-wrapper rank-2">
          <i class="fa-solid fa-crown crown-badge rank-2"></i>
          <img src="${top2.avatar}" class="podium-avatar" />
        </div>
        <div class="podium-block">
          <span class="podium-user-name">${top2.name}</span>
          <span class="podium-score">${top2.score}</span>
        </div>
      </div>

      <!-- Rank 1 -->
      <div class="podium-step rank-1">
        <div class="podium-avatar-wrapper rank-1">
          <i class="fa-solid fa-crown crown-badge rank-1"></i>
          <img src="${top1.avatar}" class="podium-avatar" />
        </div>
        <div class="podium-block">
          <span class="podium-user-name">${top1.name}</span>
          <span class="podium-score">${top1.score}</span>
        </div>
      </div>

      <!-- Rank 3 -->
      <div class="podium-step rank-3">
        <div class="podium-avatar-wrapper rank-3">
          <i class="fa-solid fa-crown crown-badge rank-3"></i>
          <img src="${top3.avatar}" class="podium-avatar" />
        </div>
        <div class="podium-block">
          <span class="podium-user-name">${top3.name}</span>
          <span class="podium-score">${top3.score}</span>
        </div>
      </div>
    </div>

    <!-- Rest of Top 100 List -->
    <div class="leaderboard-list">
      ${restList.map(item => `
        <div class="glass-card leader-item-card">
          <div class="leader-left">
            <span class="rank-num">#${item.rank}</span>
            <div class="ref-avatar" style="width: 28px; height: 28px;">${item.name.charAt(0)}</div>
            <span class="leader-name">${item.name}</span>
          </div>
          <span class="leader-score">${item.score}</span>
        </div>
      `).join('')}
    </div>

    <!-- Pinned User Rank Bar -->
    <div class="user-pinned-rank-bar">
      <div class="leader-left">
        <span class="rank-num" style="color: var(--accent-gold);">#${state.user.rank}</span>
        <img src="/shovel_logo.png" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />
        <span class="leader-name" style="color: white; font-weight: 700;">You (${state.user.name})</span>
      </div>
      <span class="leader-score">${Math.floor(state.balances.SHOVEL || 0).toLocaleString()} ⛏️</span>
    </div>
  `;
}
