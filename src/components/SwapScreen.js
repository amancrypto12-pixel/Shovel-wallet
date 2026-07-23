/* ==========================================================================
   SCREEN 2: TESTNET SWAP DEX (Shovel Wallet Multi-Currency & Quests)
   FIX: Replace PRO-only icons with FREE alternatives.
   ========================================================================== */

import { store } from '../state.js';
import { soundEngine } from '../audio.js';
import { TOKEN_MAP } from '../tokens.js';
import { showConfirmSwapModal, showTokenPickerModal, showToast } from './Modals.js';

export { TOKEN_MAP };

export function renderSwapScreen(container) {
  const state = store.getState();
  container.className = 'screen swap-screen';

  let fromToken = 'SHOVEL';
  let toToken = 'TON';
  let fromAmount = 100;

  function calculateRate(fromSym, toSym) {
    const pFrom = TOKEN_MAP[fromSym]?.priceUsd || 1;
    const pTo = TOKEN_MAP[toSym]?.priceUsd || 1;
    return pFrom / pTo;
  }

  function calculateToAmount(amount) {
    if (!amount || isNaN(amount) || amount <= 0) return '0.00';
    const rate = calculateRate(fromToken, toToken);
    const val = amount * rate;
    if (val < 0.000001) return val.toExponential(4);
    if (val < 0.01) return val.toFixed(6);
    return val.toFixed(4);
  }

  function getRateString() {
    const rate = calculateRate(fromToken, toToken);
    let dispRate = rate < 0.001 ? rate.toFixed(6) : rate.toFixed(4);
    return `1 ${fromToken} = ${dispRate} ${toToken}`;
  }

  function renderUI() {
    // Always read fresh state (fixes stale balance bug after swap)
    const liveState = store.getState();
    const toAmount = calculateToAmount(fromAmount);
    const fromBalance = liveState.balances[fromToken] || 0;
    const toBalance = liveState.balances[toToken] || 0;
    const fee = 0.1;
    const requiredFrom = fromToken === 'SHOVEL' ? fromAmount + fee : fromAmount;
    const isInsufficient = requiredFrom > fromBalance;
    const isInvalid = !fromAmount || fromAmount <= 0;
    const isSameToken = fromToken === toToken;

    let buttonText = `SWAP ${fromAmount || 0} ${fromToken} ➔ ${toToken}`;
    if (isSameToken) buttonText = 'Select different tokens';
    else if (isInvalid) buttonText = 'Enter Amount';
    else if (isInsufficient) buttonText = `Insufficient ${fromToken} Balance`;

    const swapsCount = state.totalSwapsCount || 0;

    container.innerHTML = `
      <div class="screen-header-title">
        <i class="fa-solid fa-repeat" style="color: var(--accent-teal);"></i> Shovel DEX Swap
      </div>

      <!-- Swap Input Container Card -->
      <div class="swap-card-container">
        <!-- From Input Box -->
        <div class="swap-input-box">
          <div class="swap-input-header">
            <span>From (Pay)</span>
            <span class="swap-balance-lbl">Balance: <span>${fromBalance.toLocaleString()} ${fromToken}</span></span>
          </div>
          <div class="swap-input-row">
            <input type="number" step="any" min="0.000001" class="swap-number-input" id="from-amount-input" value="${fromAmount}" placeholder="0.0" />
            <button class="token-selector-btn" id="from-token-btn">
              ${TOKEN_MAP[fromToken].svg}
              <span>${fromToken}</span>
              <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem;"></i>
            </button>
          </div>
          <!-- Quick Amount Presets -->
          <div class="preset-pct-row">
            <button class="preset-chip" data-pct="0.25">25%</button>
            <button class="preset-chip" data-pct="0.50">50%</button>
            <button class="preset-chip" data-pct="0.75">75%</button>
            <button class="preset-chip" data-pct="1.00">MAX</button>
          </div>
        </div>

        <!-- Reverse Swap Button -->
        <div class="swap-reverse-btn-wrapper">
          <button class="swap-reverse-btn" id="swap-reverse-trigger">
            <i class="fa-solid fa-arrow-right-arrow-left" style="transform: rotate(90deg);"></i>
          </button>
        </div>

        <!-- To Input Box -->
        <div class="swap-input-box">
          <div class="swap-input-header">
            <span>To (Estimated Receive)</span>
            <span class="swap-balance-lbl">Balance: <span>${toBalance.toLocaleString()} ${toToken}</span></span>
          </div>
          <div class="swap-input-row">
            <input type="text" class="swap-number-input" id="to-amount-input" value="${toAmount}" readonly />
            <button class="token-selector-btn" id="to-token-btn">
              ${TOKEN_MAP[toToken].svg}
              <span>${toToken}</span>
              <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem;"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Transaction Rate & Fee Banner -->
      <div class="glass-card" style="padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; overflow: hidden; gap: 8px;">
        <span style="font-family: var(--font-mono); font-weight: 700; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${getRateString()}</span>
        <span style="color: var(--accent-teal); font-weight: 700; white-space: nowrap; flex-shrink: 0;">Fee: 0.1</span>
      </div>

      <!-- MAIN SWAP ACTION BUTTON -->
      <button class="main-swap-action-btn" id="execute-swap-btn" ${isInsufficient || isInvalid || isSameToken ? 'disabled' : ''}>
        ${buttonText}
      </button>

      <!-- Swap Milestone Tasks & Rewards Section -->
      <div class="glass-card" style="padding: 14px; display: flex; flex-direction: column; gap: 10px; margin-top: 4px;">
        <div class="section-subtitle" style="display: flex; justify-content: space-between; align-items: center;">
          <span><i class="fa-solid fa-trophy" style="color: var(--accent-gold);"></i> Swap Milestone Tasks</span>
          <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-teal);">${swapsCount} Total Swaps</span>
        </div>

        <!-- Task 1: 1,000 Swaps -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 10px; border-radius: 10px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.82rem;">Task 1: Swap 1,000 Times</span>
            <span style="font-size: 0.72rem; color: var(--accent-gold); font-weight: 700;">2x Mining Boost ⚡</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">Progress: ${Math.min(swapsCount, 1000)} / 1,000</div>
          <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
            <div style="width: ${Math.min(swapsCount / 10, 100)}%; height: 100%; background: var(--accent-gold); border-radius: 4px; transition: width 0.3s;"></div>
          </div>
        </div>

        <!-- Task 2: 10,000 Swaps -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 10px; border-radius: 10px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.82rem;">Task 2: Swap 10,000 Times</span>
            <span style="font-size: 0.72rem; color: var(--accent-teal); font-weight: 700;">6H Mining ⏳</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">Progress: ${Math.min(swapsCount, 10000)} / 10,000</div>
          <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
            <div style="width: ${Math.min(swapsCount / 100, 100)}%; height: 100%; background: var(--accent-teal); border-radius: 4px; transition: width 0.3s;"></div>
          </div>
        </div>

        <!-- Task 3: 100,000 Swaps -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 10px; border-radius: 10px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.82rem;">Task 3: Swap 100,000 Times</span>
            <span style="font-size: 0.72rem; color: var(--accent-purple); font-weight: 700;">VIP 👑</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">Progress: ${Math.min(swapsCount, 100000)} / 100,000</div>
          <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
            <div style="width: ${Math.min(swapsCount / 1000, 100)}%; height: 100%; background: var(--accent-purple); border-radius: 4px; transition: width 0.3s;"></div>
          </div>
      </div>
    </div>
    <div style="height: 80px; width: 100%; flex-shrink: 0;" aria-hidden="true"></div>
    `;

    // Input Listener
    const inputField = container.querySelector('#from-amount-input');
    const updateSwapState = (newVal) => {
      fromAmount = parseFloat(newVal) || 0;
      // Always read fresh live balances (fixes stale balance bug)
      const freshBalance = store.getState().balances[fromToken] || 0;
      const toField = container.querySelector('#to-amount-input');
      const actionBtn = container.querySelector('#execute-swap-btn');
      if (toField) toField.value = calculateToAmount(fromAmount);
      if (actionBtn) {
        const checkSame = fromToken === toToken;
        const checkInsuff = (fromToken === 'SHOVEL' ? fromAmount + fee : fromAmount) > freshBalance;
        const checkInval = !fromAmount || fromAmount <= 0;
        actionBtn.disabled = checkSame || checkInsuff || checkInval;
        actionBtn.textContent = checkSame ? 'Select different tokens' : checkInval ? 'Enter Amount' : checkInsuff ? `Insufficient ${fromToken} Balance` : `SWAP ${fromAmount} ${fromToken} ➔ ${toToken}`;
      }
    };

    inputField?.addEventListener('input', (e) => {
      updateSwapState(e.target.value);
    });

    // Preset Percentage Chips
    container.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        soundEngine.playTabClick();
        const pct = parseFloat(chip.dataset.pct);
        // Read fresh balance for presets too
        const freshBal = store.getState().balances[fromToken] || 0;
        let calcAmt = freshBal * pct;
        if (fromToken === 'SHOVEL' && calcAmt > fee) calcAmt = Math.max(0, calcAmt - fee);
        calcAmt = parseFloat(calcAmt.toFixed(4));
        if (inputField) inputField.value = calcAmt;
        updateSwapState(calcAmt);
      });
    });

    // Reverse Trigger
    container.querySelector('#swap-reverse-trigger')?.addEventListener('click', () => {
      soundEngine.playTabClick();
      const temp = fromToken;
      fromToken = toToken;
      toToken = temp;
      renderUI();
    });

    // Token Selectors
    container.querySelector('#from-token-btn')?.addEventListener('click', () => {
      showTokenPickerModal({
        type: 'from',
        currentToken: fromToken,
        onSelect: (selected) => {
          if (selected === toToken) toToken = fromToken;
          fromToken = selected;
          renderUI();
        }
      });
    });

    container.querySelector('#to-token-btn')?.addEventListener('click', () => {
      showTokenPickerModal({
        type: 'to',
        currentToken: toToken,
        onSelect: (selected) => {
          if (selected === fromToken) fromToken = toToken;
          toToken = selected;
          renderUI();
        }
      });
    });

    // Execute Swap Trigger
    container.querySelector('#execute-swap-btn')?.addEventListener('click', () => {
      soundEngine.playTabClick();
      if (!isInsufficient && !isInvalid) {
        showConfirmSwapModal({
          fromToken,
          toToken,
          fromAmount,
          toAmount: calculateToAmount(fromAmount)
        });
      }
    });
  }

  renderUI();
}
