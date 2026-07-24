/* ==========================================================================
   SCREEN 2: TESTNET SWAP DEX (Shovel Wallet Multi-Currency & Quests)
   FIX: Replace PRO-only icons with FREE alternatives.
   ========================================================================== */

import { store } from '../state.js';
import { soundEngine } from '../audio.js';
import { TOKEN_MAP } from '../tokens.js';
import { showConfirmSwapModal, showTokenPickerModal, showToast } from './Modals.js';

export { TOKEN_MAP };

// ── Module-level state: persists across re-renders ──
// These are outside renderSwapScreen so that when renderApp() calls
// renderSwapScreen() again on state changes, the user's token selection
// and entered amount are preserved (not reset to defaults).
let fromToken = 'SHOVEL';
let toToken = 'TON';
let fromAmount = 100;

export function renderSwapScreen(container) {
  container.className = 'screen swap-screen';

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

    const swapsCount = liveState.totalSwapsCount || 0;

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
            <span class="swap-balance-lbl">Balance: <span>${fromBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${fromToken}</span></span>
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

        <!-- Task 0: 5 Swaps (Starter) -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 10px; border-radius: 10px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.82rem;">Task 0: Swap 5 Times</span>
            <span style="font-size: 0.72rem; color: var(--accent-green); font-weight: 700;">+50 SHOVEL 🎁</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">Progress: ${Math.min(swapsCount, 5)} / 5</div>
          <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
            <div style="width: ${Math.min((swapsCount / 5) * 100, 100)}%; height: 100%; background: var(--accent-green); border-radius: 4px; transition: width 0.3s;"></div>
          </div>
          ${swapsCount >= 5 && !liveState.tasksClaimed?.task0 ? `<button class="preset-chip" style="margin-top:4px; background: var(--accent-green); color: white; width:100%;" id="claim-task0-btn">✅ Claim 50 SHOVEL!</button>` : swapsCount >= 5 ? '<div style="font-size:0.72rem; color:var(--accent-green); font-weight:700;">✅ Claimed!</div>' : ''}
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 10px; border-radius: 10px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.82rem;">Task 1: Swap 1,000 Times</span>
            <span style="font-size: 0.72rem; color: var(--accent-gold); font-weight: 700;">2x Mining Boost ⚡</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">Progress: ${Math.min(swapsCount, 1000)} / 1,000</div>
          <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
            <div style="width: ${Math.min(swapsCount / 10, 100)}%; height: 100%; background: var(--accent-gold); border-radius: 4px; transition: width 0.3s;"></div>
          </div>
          ${swapsCount >= 1000 && !liveState.tasksClaimed?.task1 ? `<button class="preset-chip" style="margin-top:4px; background: var(--accent-gold); color:#050b14; width:100%;" id="claim-task1-btn">✅ Claim 2x Mining Boost!</button>` : swapsCount >= 1000 ? '<div style="font-size:0.72rem; color:var(--accent-gold); font-weight:700;">✅ Claimed!</div>' : ''}
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
          ${swapsCount >= 10000 && !liveState.tasksClaimed?.task2 ? `<button class="preset-chip" style="margin-top:4px; background: var(--accent-teal); color:#050b14; width:100%;" id="claim-task2-btn">✅ Claim 6H Mining Session!</button>` : swapsCount >= 10000 ? '<div style="font-size:0.72rem; color:var(--accent-teal); font-weight:700;">✅ Claimed!</div>' : ''}
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
          ${swapsCount >= 100000 && !liveState.tasksClaimed?.task3 ? `<button class="preset-chip" style="margin-top:4px; background: var(--accent-purple); color:white; width:100%;" id="claim-task3-btn">✅ Claim VIP Legend Status!</button>` : swapsCount >= 100000 ? '<div style="font-size:0.72rem; color:var(--accent-purple); font-weight:700;">✅ Claimed!</div>' : ''}
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

    // BUG-05 FIX: Use [data-pct] selector to ONLY target percentage chips,
    // not the task claim buttons that also use .preset-chip class
    container.querySelectorAll('[data-pct]').forEach(chip => {
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
    // AD-FREE: Swap button intentionally has NO ads — goes direct to confirm modal
    container.querySelector('#execute-swap-btn')?.addEventListener('click', () => {
      soundEngine.playTabClick();

      // Bug fix: Always recompute fresh values at click time — closure values can be stale
      const freshState = store.getState();
      const freshBalance = freshState.balances[fromToken] || 0;
      const currentFee = 0.1;
      const requiredNow = fromToken === 'SHOVEL' ? fromAmount + currentFee : fromAmount;
      const freshInsufficient = requiredNow > freshBalance;
      const freshInvalid = !fromAmount || fromAmount <= 0;
      const freshSameToken = fromToken === toToken;

      if (freshSameToken) {
        showToast('⚠️ Select two different tokens to swap!');
        return;
      }
      if (freshInvalid) {
        showToast('⚠️ Enter a valid amount to swap!');
        return;
      }
      if (freshInsufficient) {
        showToast(`⚠️ Insufficient ${fromToken} balance!`);
        return;
      }
      // Non-SHOVEL swaps need 0.1 SHOVEL for fee
      if (fromToken !== 'SHOVEL') {
        const shovelBal = freshState.balances.SHOVEL || 0;
        if (shovelBal < currentFee) {
          showToast(`⚠️ Need at least ${currentFee} SHOVEL to pay swap fee!`);
          return;
        }
      }

      // All checks passed — open confirm modal (NO ad)
      showConfirmSwapModal({
        fromToken,
        toToken,
        fromAmount,
        toAmount: calculateToAmount(fromAmount)
      });
    });

    // Task 0 Claim — 5 swaps → 50 SHOVEL
    // BUG-09 FIX: Read fresh state from store (not stale closure)
    container.querySelector('#claim-task0-btn')?.addEventListener('click', () => {
      soundEngine.playSwapSuccess();
      const freshState = store.getState();
      if (!freshState.tasksClaimed?.task0 && freshState.totalSwapsCount >= 5) {
        store.state.tasksClaimed = { ...store.state.tasksClaimed, task0: true };
        store.state.balances.SHOVEL += 50;
        store.state.transactions.unshift({ type: 'MINE', title: '🎁 Swap Task 0 Reward', amount: '+50 SHOVEL', time: 'Just now', isPositive: true });
        store.saveState();
        showToast('🎁 +50 SHOVEL Claimed! Task 0 Complete!');
        renderUI();
      }
    });

    // Task 1/2/3 Claim buttons
    container.querySelector('#claim-task1-btn')?.addEventListener('click', () => {
      soundEngine.playSwapSuccess();
      const res = store.claimSwapTask('task1');
      if (res?.success) { showToast(res.rewardMsg); renderUI(); }
      else showToast(`⚠️ ${res?.reason}`);
    });
    container.querySelector('#claim-task2-btn')?.addEventListener('click', () => {
      soundEngine.playSwapSuccess();
      const res = store.claimSwapTask('task2');
      if (res?.success) { showToast(res.rewardMsg); renderUI(); }
      else showToast(`⚠️ ${res?.reason}`);
    });
    container.querySelector('#claim-task3-btn')?.addEventListener('click', () => {
      soundEngine.playSwapSuccess();
      const res = store.claimSwapTask('task3');
      if (res?.success) { showToast(res.rewardMsg); renderUI(); }
      else showToast(`⚠️ ${res?.reason}`);
    });
  }

  renderUI();
}

