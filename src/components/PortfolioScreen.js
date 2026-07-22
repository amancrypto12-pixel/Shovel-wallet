/* ==========================================================================
   SCREEN 4: PORTFOLIO & WALLET DASHBOARD (Shovel Wallet & TON Connect 2.0)
   ========================================================================== */

import { store } from '../state.js';
import { soundEngine } from '../audio.js';
import { TOKEN_MAP } from '../tokens.js';
import { showFaucetModal, showTonConnectModal, showTonWalletDetailsModal, showRewardedAdModal, showToast } from './Modals.js';

export function renderPortfolioScreen(container) {
  const state = store.getState();
  const now = Date.now();
  container.className = 'screen portfolio-screen';

  // Check Faucet 24-Hour Cooldown
  const cooldownMs = 24 * 3600 * 1000;
  const lastClaimed = state.faucetLastClaimedAt || 0;
  const isFaucetCooldown = lastClaimed > 0 && (now - lastClaimed) < cooldownMs;

  const remMs = isFaucetCooldown ? cooldownMs - (now - lastClaimed) : 0;
  const remHours = Math.floor(remMs / (1000 * 3600));
  const remMins = Math.floor((remMs % (1000 * 3600)) / (1000 * 60));

  // Wallet Connection Info
  const isWalletConnected = state.tonWallet.connected;
  const walletAddr = state.tonWallet.address;
  const walletName = state.tonWallet.walletName;

  // Calculate estimated total USD value across all tokens
  let totalUsd = 0;
  Object.keys(TOKEN_MAP).forEach(sym => {
    const amt = state.balances[sym] || 0;
    const price = TOKEN_MAP[sym].priceUsd || 0;
    totalUsd += amt * price;
  });

  container.innerHTML = `
    <div class="screen-header-title">
      <i class="fa-solid fa-wallet" style="color: var(--accent-teal);"></i> Shovel Wallet Portfolio
    </div>

    <!-- Main Total Estimated Balance Card -->
    <div class="glass-card portfolio-balance-card">
      <span style="font-size: 0.8rem; color: var(--text-secondary);">Total Net Worth (USD)</span>
      <div class="usd-total-val">$${totalUsd.toFixed(2)}</div>

      <!-- Action Buttons Row (Faucet Deposit + TON Connect Wallet Button) -->
      <div class="portfolio-actions-row">
        <button class="wallet-act-btn primary" id="deposit-faucet-btn" ${isFaucetCooldown ? 'disabled style="background: #334155; color: #94a3b8; box-shadow: none;"' : ''}>
          <i class="fa-solid fa-download"></i> 
          ${isFaucetCooldown ? `Claimed (${remHours}h ${remMins}m)` : 'Faucet Deposit (Watch Ad)'}
        </button>
        
        <button class="wallet-act-btn" id="connect-ton-wallet-btn" style="background: ${isWalletConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 136, 204, 0.2)'}; border-color: ${isWalletConnected ? 'var(--accent-green)' : '#0088cc'}; color: ${isWalletConnected ? 'var(--accent-green)' : '#0088cc'}; font-weight: 800;">
          <i class="${isWalletConnected ? 'fa-solid fa-circle-check' : 'fa-solid fa-wallet'}"></i> 
          ${isWalletConnected ? `${walletName}: ${walletAddr.slice(0, 4)}...${walletAddr.slice(-4)}` : 'Connect TON Wallet'}
        </button>
      </div>
    </div>

    <!-- Holdings List Section (100% Reliable SVG Icons) -->
    <div class="section-subtitle"><i class="fa-solid fa-coins"></i> Crypto Assets Holdings</div>
    <div class="holdings-list-container">
      ${Object.keys(TOKEN_MAP).map(sym => {
        const info = TOKEN_MAP[sym];
        const amt = state.balances[sym] || 0;
        const valUsd = amt * info.priceUsd;
        return `
          <div class="glass-card token-holding-card">
            <div class="token-holding-left">
              <div style="display: flex; align-items: center; justify-content: center;">
                ${info.svg}
              </div>
              <div class="token-holding-info">
                <span class="token-holding-name">${info.name}</span>
                <span class="token-holding-sym">${sym}</span>
              </div>
            </div>
            <div class="token-holding-right">
              <span class="token-holding-amt" style="color: ${sym === 'SHOVEL' ? 'var(--accent-gold)' : 'var(--text-primary)'}">
                ${amt < 0.01 && amt > 0 ? amt.toFixed(6) : amt.toLocaleString()} ${sym}
              </span>
              <span class="token-holding-usd">≈ $${valUsd.toFixed(2)} USD</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Recent Transactions Activity -->
    <div class="section-subtitle" style="margin-top: 8px;"><i class="fa-solid fa-clock-rotate-left"></i> Recent Activity</div>
    <div class="glass-card referrals-list-card">
      ${state.transactions.map(tx => `
        <div class="ref-item-row">
          <div class="ref-user-left">
            <div class="ref-avatar" style="background: rgba(255,255,255,0.06); color: var(--accent-teal);">
              <i class="${getTxIcon(tx.type)}"></i>
            </div>
            <div>
              <div class="ref-name">${tx.title}</div>
              <div class="ref-status-tag" style="color: var(--text-secondary);">${tx.time}</div>
            </div>
          </div>
          <div class="ref-bonus-val" style="color: ${tx.isPositive ? 'var(--accent-green)' : 'var(--text-primary)'}; font-size: 0.8rem;">
            ${tx.amount}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Faucet Trigger Listener
  container.querySelector('#deposit-faucet-btn')?.addEventListener('click', () => {
    soundEngine.playTabClick();
    if (isFaucetCooldown) {
      showToast(`⚠️ Faucet Claimed! Next claim available in ${remHours}h ${remMins}m`);
      return;
    }

    showRewardedAdModal(() => {
      const res = store.claimFaucet();
      if (res.success) {
        soundEngine.playSwapSuccess();
        showToast('💧 Claimed +1.00 TON Faucet Deposit! (24h Cooldown Started)');
      }
    });
  });

  // TON Connect Wallet Button Listener
  container.querySelector('#connect-ton-wallet-btn')?.addEventListener('click', () => {
    soundEngine.playTabClick();
    if (isWalletConnected) {
      showTonWalletDetailsModal();
    } else {
      showTonConnectModal();
    }
  });
}

function getTxIcon(type) {
  switch (type) {
    case 'MINE': return 'fa-solid fa-pickaxe';
    case 'SWAP': return 'fa-solid fa-rotate';
    case 'FAUCET': return 'fa-solid fa-faucet-drip';
    default: return 'fa-solid fa-receipt';
  }
}
