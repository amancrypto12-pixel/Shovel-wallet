/* ==========================================================================
   GLOBAL INTERACTIVE MODALS & TOAST NOTIFICATIONS (Shovel Wallet)
   ========================================================================== */

import { store } from '../state.js';
import { soundEngine } from '../audio.js';
import { TOKEN_MAP } from '../tokens.js';

const getModalContainer = () => document.getElementById('modal-container');

export function hideModal() {
  const container = getModalContainer();
  if (container) {
    container.classList.add('hidden');
    container.innerHTML = '';
  }
}

export function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerText = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

// --- 0. TON Connect 2.0 Web3 Wallet Connection Modal ---
export function showTonConnectModal() {
  const container = getModalContainer();
  if (!container) return;

  // Real TON ecosystem wallet options with inline SVG icons
  const wallets = [
    { 
      name: 'Tonkeeper', 
      color: '#45AEF5',
      desc: 'Most Popular TON Wallet',
      svg: `<svg viewBox="0 0 56 56" style="width:36px;height:36px;border-radius:10px;"><rect width="56" height="56" rx="12" fill="#45AEF5"/><path d="M28 14L14 24v12l14 8 14-8V24L28 14zm0 4.5l9.5 6.5v8.5L28 40l-9.5-6.5V25L28 18.5z" fill="#fff"/><path d="M28 26v14" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`
    },
    { 
      name: 'Telegram Wallet', 
      color: '#229ED9',
      desc: '@wallet Bot inside Telegram',
      svg: `<svg viewBox="0 0 56 56" style="width:36px;height:36px;border-radius:10px;"><rect width="56" height="56" rx="12" fill="#229ED9"/><path d="M18 28.5l5.3 2 2 6.5 3-3.5 5.2 4L39 19 18 28.5z" fill="#fff"/><path d="M23.3 30.5l-.3 5 3-3.5" fill="#B0D4F1"/><path d="M23.3 30.5L33 24l-7.7 7.5" fill="#D2E5F9"/></svg>`
    },
    { 
      name: 'MyTonWallet', 
      color: '#2F6BED',
      desc: 'Web & Extension Wallet',
      svg: `<svg viewBox="0 0 56 56" style="width:36px;height:36px;border-radius:10px;"><rect width="56" height="56" rx="12" fill="#2F6BED"/><path d="M22 20h12c1.7 0 2.7 1.8 1.8 3.2L29 33.6c-.8 1.4-2.8 1.4-3.6 0L18.2 23.2C17.3 21.8 18.3 20 22 20z" fill="none" stroke="#fff" stroke-width="3"/><path d="M28 20v14" stroke="#fff" stroke-width="3"/></svg>`
    },
    { 
      name: 'TonHub', 
      color: '#1C8CF0',
      desc: 'Secure Mobile Wallet',
      svg: `<svg viewBox="0 0 56 56" style="width:36px;height:36px;border-radius:10px;"><rect width="56" height="56" rx="12" fill="#1C8CF0"/><circle cx="28" cy="28" r="12" fill="none" stroke="#fff" stroke-width="3"/><path d="M28 20v16M22 28h12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>`
    }
  ];

  container.innerHTML = `
    <div class="glass-card modal-card" style="max-width: 340px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
        <svg viewBox="0 0 128 128" style="width: 32px; height: 32px;">
          <circle cx="64" cy="64" r="64" fill="#0088CC"/>
          <path d="M41 40h46c2.8 0 4.5 3 3.1 5.3L67.1 84.7c-1.4 2.3-4.8 2.3-6.2 0L37.9 45.3C36.5 43 38.2 40 41 40z" fill="none" stroke="#FFF" stroke-width="7"/>
          <path d="M64 40v46" stroke="#FFF" stroke-width="7"/>
        </svg>
        <div>
          <div class="modal-title" style="font-size: 1.1rem; text-align: left;">Connect TON Wallet</div>
          <div style="font-size: 0.7rem; color: var(--text-secondary); text-align: left;">Select wallet to connect</div>
        </div>
      </div>

      <div style="width: 100%; display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
        ${wallets.map(w => `
          <div class="glass-card wallet-option-item" data-wallet="${w.name}"
            style="padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border-color: rgba(255,255,255,0.08);">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${w.svg}
              <div style="text-align: left;">
                <div style="font-weight: 700; font-size: 0.85rem; color: white;">${w.name}</div>
                <div style="font-size: 0.68rem; color: var(--text-secondary);">${w.desc}</div>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; color: var(--text-secondary);"></i>
          </div>
        `).join('')}
      </div>

      <button style="background: transparent; border: none; color: var(--text-secondary); margin-top: 8px; font-size: 0.82rem; cursor: pointer;" id="close-ton-connect-btn">
        Cancel
      </button>
    </div>
  `;

  container.classList.remove('hidden');

  container.querySelector('#close-ton-connect-btn')?.addEventListener('click', hideModal);

  container.querySelectorAll('.wallet-option-item').forEach(item => {
    item.addEventListener('click', () => {
      soundEngine.playTabClick();
      const walletName = item.dataset.wallet;
      
      const card = item;
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; width: 100%; justify-content: center;">
          <i class="fa-solid fa-spinner fa-spin" style="color: #0088cc; font-size: 1.2rem;"></i>
          <span style="font-weight: 700; font-size: 0.82rem; color: white;">Connecting ${walletName}...</span>
        </div>
      `;

      setTimeout(() => {
        // Generate realistic mock TON address
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let addr = 'EQ';
        for (let i = 0; i < 46; i++) addr += chars[Math.floor(Math.random() * chars.length)];
        
        store.connectTonWallet(walletName, addr);
        soundEngine.playSwapSuccess();
        hideModal();
        showToast(`💎 Connected to ${walletName}! (${addr.slice(0, 6)}...${addr.slice(-4)})`);
      }, 1500);
    });
  });
}

// --- 0.1 Connected TON Wallet Details / Disconnect Modal ---
export function showTonWalletDetailsModal() {
  const container = getModalContainer();
  if (!container) return;

  const tw = store.getState().tonWallet;

  container.innerHTML = `
    <div class="glass-card modal-card" style="max-width: 340px;">
      <div class="modal-icon-hero" style="color: var(--accent-green);">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <div class="modal-title">TON Wallet Connected</div>
      
      <div style="width: 100%; background: #12151e; padding: 12px; border-radius: 12px; text-align: left; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
          <span style="color: var(--text-secondary);">Provider:</span>
          <b style="color: white;">${tw.walletName || 'Tonkeeper'}</b>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
          <span style="color: var(--text-secondary);">Address:</span>
          <code style="color: var(--accent-teal); font-size: 0.75rem;">${tw.address || 'EQBvW89x...7F9k'}</code>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
          <span style="color: var(--text-secondary);">Network:</span>
          <span style="color: var(--accent-gold); font-weight: 700;">TON Mainnet / Testnet</span>
        </div>
      </div>

      <button class="modal-close-btn" id="disconnect-wallet-btn" style="background: #dc2626; color: white;">
        Disconnect Wallet
      </button>
      <button style="background: transparent; border: none; color: var(--text-secondary); font-size: 0.8rem; cursor: pointer;" id="close-wallet-details-btn">
        Close
      </button>
    </div>
  `;

  container.classList.remove('hidden');

  container.querySelector('#close-wallet-details-btn')?.addEventListener('click', hideModal);
  container.querySelector('#disconnect-wallet-btn')?.addEventListener('click', () => {
    soundEngine.playCoinTap();
    store.disconnectTonWallet();
    hideModal();
    showToast('🔴 TON Wallet Disconnected!');
  });
}

// --- Live Background UI Theme Switcher Modal ---
export function showThemePickerModal() {
  const container = getModalContainer();
  if (!container) return;

  const current = store.getState().currentBgTheme || 'theme_bg4';

  const themes = [
    { id: 'theme_bg1', title: '1. Cyberpunk Gold Grid', img: '/bg_1.jpg', desc: 'Dark obsidian with glowing neon gold particle matrix' },
    { id: 'theme_bg2', title: '2. Galactic Space Nebulae', img: '/bg_2.jpg', desc: 'Deep violet space with neon stars & cyan dust clouds' },
    { id: 'theme_bg3', title: '3. Hexagonal Honeycomb', img: '/bg_3.jpg', desc: '3D dark honeycomb grid with glowing neon edges' },
    { id: 'theme_bg4', title: '4. Cyber Lava Core', img: '/bg_4.jpg', desc: 'Obsidian rock with molten gold magma energy veins' }
  ];

  container.innerHTML = `
    <div class="glass-card modal-card" style="max-width: 360px; max-height: 85vh; overflow-y: auto;">
      <div class="modal-title" style="font-size: 1.15rem; margin-bottom: 4px;">
        🎨 Choose Background UI Theme
      </div>
      <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 10px;">
        Select your favorite background style to apply live:
      </div>

      <div style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
        ${themes.map(t => `
          <div class="glass-card theme-picker-item" data-theme="${t.id}" 
            style="padding: 10px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-color: ${current === t.id ? 'var(--accent-gold)' : 'var(--border-glass)'}; background: ${current === t.id ? 'rgba(255,215,0,0.08)' : 'var(--bg-card)'}">
            <img src="${t.img}" style="width: 55px; height: 75px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.2);" />
            <div style="text-align: left; flex: 1;">
              <div style="font-weight: 700; font-size: 0.88rem; color: ${current === t.id ? 'var(--accent-gold)' : 'white'};">${t.title}</div>
              <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">${t.desc}</div>
            </div>
            ${current === t.id ? '<span style="color: var(--accent-gold); font-size: 1rem;">✓</span>' : ''}
          </div>
        `).join('')}
      </div>

      <button style="background: transparent; border: none; color: var(--text-secondary); margin-top: 10px; font-size: 0.85rem; cursor: pointer;" id="close-theme-btn">
        Close
      </button>
    </div>
  `;

  container.classList.remove('hidden');

  container.querySelector('#close-theme-btn')?.addEventListener('click', hideModal);

  container.querySelectorAll('.theme-picker-item').forEach(item => {
    item.addEventListener('click', () => {
      soundEngine.playTabClick();
      const themeId = item.dataset.theme;
      store.setBgTheme(themeId);
      applyBgThemeToDOM(themeId);
      hideModal();
      showToast(`🎨 Background UI Updated!`);
    });
  });
}

export function applyBgThemeToDOM(themeId) {
  // Background themes disabled — solid dark background for clean UI
  // No background image to prevent visual bleed-through on glass cards
}

// --- 1. Welcome / Onboarding Modal ---
export function showWelcomeModal() {
  const container = getModalContainer();
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card modal-card">
      <div class="modal-icon-hero"><img src="/shovel_logo.png" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; filter: drop-shadow(0 0 20px var(--accent-gold));" /></div>
      <div class="modal-title">Welcome to Shovel Wallet!</div>
      <div class="modal-text">
        Dig & Mine <b>$SHOVEL</b> points, swap real multi-crypto assets (TON, USDT, BTC, ETH, SOL, BNB, NOT, DOGS), invite friends & climb the leaderboard!
        <br><br>
        <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid var(--accent-gold); padding: 8px; border-radius: 8px; font-size: 0.8rem; color: var(--accent-gold);">
          🎁 Enter Referral Code for <b>1,000 SHOVEL Points</b>! (Without code: 200 Points)
        </div>
      </div>

      <div style="width: 100%;">
        <input type="text" id="welcome-ref-input" placeholder="Enter Referral Code (e.g. ref_shovel99281)" 
          style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: #12151e; color: white; margin-bottom: 12px;" />
      </div>

      <button class="modal-close-btn" id="start-mining-btn">
        🚀 Claim Welcome Bonus & Start!
      </button>
    </div>
  `;

  container.classList.remove('hidden');

  container.querySelector('#start-mining-btn')?.addEventListener('click', () => {
    soundEngine.playSwapSuccess();
    const refCode = container.querySelector('#welcome-ref-input')?.value?.trim();
    const hasRef = refCode && refCode.length > 0;
    
    const bonus = store.completeOnboarding(hasRef);
    hideModal();
    showToast(`🎁 Claimed +${bonus} SHOVEL ${hasRef ? 'Referral' : 'Welcome'} Bonus!`);
  });
}

// --- 2. Rewarded Video Ad Modal Simulator ---
export function showRewardedAdModal(onAdComplete) {
  const container = getModalContainer();
  if (!container) return;

  let seconds = 5;

  container.innerHTML = `
    <div class="glass-card modal-card" style="border-color: var(--accent-purple);">
      <div class="modal-icon-hero" style="color: var(--accent-purple);"><i class="fa-solid fa-play"></i></div>
      <div class="modal-title">Shovel Video Ad Simulator</div>
      <div class="modal-text">
        Watching Partner Video Ad...
        <br><br>
        <div id="ad-countdown" style="font-family: 'Rubik', sans-serif; font-size: 2rem; font-weight: 900; color: var(--accent-purple);">
          00:0${seconds}
        </div>
      </div>
      <button class="modal-close-btn" id="ad-complete-btn" disabled style="background: #334155; color: #94a3b8;">
        Watching Ad... (${seconds}s)
      </button>
    </div>
  `;

  container.classList.remove('hidden');

  const adTimer = setInterval(() => {
    seconds--;
    const countEl = container.querySelector('#ad-countdown');
    const btn = container.querySelector('#ad-complete-btn');

    if (countEl) countEl.innerText = `00:0${seconds}`;

    if (seconds <= 0) {
      clearInterval(adTimer);
      if (btn) {
        btn.disabled = false;
        btn.style.background = 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)';
        btn.style.color = 'white';
        btn.innerText = '⚡ Ad Verified! Proceed';
      }
    }
  }, 1000);

  container.querySelector('#ad-complete-btn')?.addEventListener('click', () => {
    soundEngine.playEnergyBoost();
    hideModal();
    if (typeof onAdComplete === 'function') {
      onAdComplete();
    } else {
      store.applyAdBoost();
      showToast('⚡ 2x Speed Boost Activated!');
    }
  });
}

// --- 3. Global Token Picker Modal for Swap DEX ---
export function showTokenPickerModal({ type, currentToken, onSelect }) {
  const container = getModalContainer();
  if (!container) return;

  const state = store.getState();
  const availableTokens = Object.keys(TOKEN_MAP);

  container.innerHTML = `
    <div class="glass-card modal-card" style="max-width: 330px; max-height: 80vh; overflow-y: auto;">
      <div class="modal-title" style="font-size: 1.1rem; margin-bottom: 8px;">
        Select ${type === 'from' ? 'Pay' : 'Receive'} Token
      </div>
      <div style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
        ${availableTokens.map(sym => `
          <div class="glass-card token-picker-item" data-sym="${sym}" 
            style="padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border-color: ${currentToken === sym ? 'var(--accent-teal)' : 'var(--border-glass)'}">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${TOKEN_MAP[sym].svg}
              <div style="text-align: left;">
                <div style="font-weight: 700; font-size: 0.9rem;">${sym}</div>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">${TOKEN_MAP[sym].name}</div>
              </div>
            </div>
            <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-gold);">
              ${(state.balances[sym] || 0).toLocaleString()}
            </span>
          </div>
        `).join('')}
      </div>
      <button style="background: transparent; border: none; color: var(--text-secondary); margin-top: 12px; font-size: 0.85rem; cursor: pointer;" id="close-picker-btn">
        Cancel
      </button>
    </div>
  `;

  container.classList.remove('hidden');

  container.querySelector('#close-picker-btn')?.addEventListener('click', hideModal);

  container.querySelectorAll('.token-picker-item').forEach(item => {
    item.addEventListener('click', () => {
      soundEngine.playTabClick();
      const selected = item.dataset.sym;
      hideModal();
      if (typeof onSelect === 'function') {
        onSelect(selected);
      }
    });
  });
}

// --- 4. Confirm DEX Swap Modal ---
export function showConfirmSwapModal({ fromToken, toToken, fromAmount, toAmount }) {
  const container = getModalContainer();
  if (!container) return;

  const fee = 0.1;

  container.innerHTML = `
    <div class="glass-card modal-card" style="border-color: var(--border-neon-teal);">
      <div class="modal-icon-hero" style="color: var(--accent-teal);"><i class="fa-solid fa-rotate"></i></div>
      <div class="modal-title">Confirm Shovel DEX Swap</div>
      
      <div class="modal-text" style="width: 100%; text-align: left; background: #12151e; padding: 12px; border-radius: 12px; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-secondary);">You Pay:</span>
          <b style="color: white;">${fromAmount.toLocaleString()} ${fromToken}</b>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-secondary);">You Receive (Est):</span>
          <b style="color: var(--accent-teal);">${toAmount} ${toToken}</b>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
          <span style="color: var(--text-secondary);">Transaction Fee:</span>
          <span style="color: var(--accent-gold); font-weight: 700;">${fee} SHOVEL</span>
        </div>
      </div>

      <button class="modal-close-btn" id="confirm-swap-action" style="background: var(--accent-teal-gradient); color: #050b14;">
        Confirm Swap
      </button>
      <button style="background: transparent; border: none; color: var(--text-secondary); font-size: 0.8rem; cursor: pointer;" id="cancel-swap-btn">
        Cancel
      </button>
    </div>
  `;

  container.classList.remove('hidden');

  container.querySelector('#cancel-swap-btn')?.addEventListener('click', hideModal);

  container.querySelector('#confirm-swap-action')?.addEventListener('click', () => {
    const btn = container.querySelector('#confirm-swap-action');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Executing Swap...';
    }

    setTimeout(() => {
      const res = store.executeSwap(fromToken, toToken, fromAmount, parseFloat(toAmount));
      if (res.success) {
        soundEngine.playSwapSuccess();
        hideModal();
        showToast(`✅ Swapped ${fromAmount.toLocaleString()} ${fromToken} ➔ ${toAmount} ${toToken}!`);
      } else {
        hideModal();
        showToast(`❌ Swap Failed: ${res.reason}`);
      }
    }, 1500);
  });
}

// --- 5. Deposit Testnet Faucet Modal ---
export function showFaucetModal() {
  const container = getModalContainer();
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card modal-card">
      <div class="modal-icon-hero" style="color: #0088cc;"><i class="fa-solid fa-droplet"></i></div>
      <div class="modal-title">Shovel Faucet</div>
      <div class="modal-text">
        Get free <b>+1.00 TON</b> tokens for swap gas fees and transactions! (24-Hour Cooldown)
      </div>
      <button class="modal-close-btn" id="claim-faucet-btn" style="background: linear-gradient(135deg, #0088cc 0%, #005588 100%); color: white;">
        💧 Claim 1.00 TON Faucet
      </button>
      <button style="background: transparent; border: none; color: var(--text-secondary); font-size: 0.8rem; cursor: pointer;" id="close-faucet-btn">
        Close
      </button>
    </div>
  `;

  container.classList.remove('hidden');

  container.querySelector('#close-faucet-btn')?.addEventListener('click', hideModal);
  container.querySelector('#claim-faucet-btn')?.addEventListener('click', () => {
    soundEngine.playSwapSuccess();
    const res = store.claimFaucet();
    hideModal();
    if (res.success) {
      showToast('💧 Claimed +1.00 TON Faucet Deposit!');
    } else {
      showToast(`⚠️ ${res.reason}`);
    }
  });
}
