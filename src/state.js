/* ==========================================================================
   CENTRAL REACTIVE STATE STORE — PER-USER ISOLATION via Telegram User ID
   
   FIX: Each Telegram user gets their OWN localStorage key so data is
   100% separate. New users start fresh (0 balances + 2 USDT).
   Referral bonus = 1000 SHOVEL. No fake demo data.
   ========================================================================== */

// --- Get Telegram User ID safely (fallback to 'guest' for browser testing) ---
function getTelegramUserId() {
  try {
    const tg = window.Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id;
    if (userId) return String(userId);
  } catch (_) {}
  return 'guest_browser';
}

// --- Clear ALL old/legacy localStorage keys (one-time migration) ---
// Deletes old shared keys like SHOVEL_WALLET_STATE_V1 through V5
// so no user sees stale/fake demo data ever again.
function clearOldStorage() {
  try {
    const OLD_KEYS = [
      'SHOVEL_WALLET_STATE_V1',
      'SHOVEL_WALLET_STATE_V2',
      'SHOVEL_WALLET_STATE_V3',
      'SHOVEL_WALLET_STATE_V4',
      'SHOVEL_WALLET_STATE_V5',
      'SHOVEL_WALLET_STATE',      // any no-version key
      'shovel_wallet_state',      // lowercase variant
    ];

    // Remove exact old keys
    OLD_KEYS.forEach(key => localStorage.removeItem(key));

    // Also scan & remove any key matching old pattern (no user ID in key)
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        key.startsWith('SHOVEL_WALLET_') &&
        !key.includes('_V6')       // V6 = new per-user keys — keep these
      ) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => localStorage.removeItem(key));

    if (keysToDelete.length > 0 || OLD_KEYS.some(k => localStorage.getItem(k))) {
      console.log(`[ShovelWallet] Cleared ${keysToDelete.length} old storage keys`);
    }
  } catch (e) {
    console.warn('Storage cleanup error:', e);
  }
}

// --- Get Referral Code from Telegram start_param (deep link) ---
export function getReferralCodeFromTelegram() {
  try {
    const tg = window.Telegram?.WebApp;
    const startParam = tg?.initDataUnsafe?.start_param; // e.g. "ref_abc12345"
    if (startParam && startParam.startsWith('ref_')) return startParam;
  } catch (_) {}
  // Also check URL hash fallback (for browser testing: ?ref=ref_abc12345)
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  if (ref && ref.startsWith('ref_')) return ref;
  return null;
}

// --- Get Telegram User Info ---
function getTelegramUserInfo() {
  try {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    if (user) {
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const username = user.username ? `@${user.username}` : `@user${user.id}`;
      return {
        name: `${firstName} ${lastName}`.trim() || username,
        username,
        avatarUrl: '/shovel_logo.png',
        streak: 0,
        rank: 9999,
        isVip: false
      };
    }
  } catch (_) {}
  return null;
}

// --- Generate unique referral code for a user ---
function generateRefCode(userId) {
  return `ref_${userId}`;
}

// --- Fresh state for a brand-new user (0 balances except 2 USDT) ---
function createFreshState(userId) {
  const tgUser = getTelegramUserInfo();
  const userInfo = tgUser || {
    name: 'ShovelMiner',
    username: `@user${userId}`,
    avatarUrl: '/shovel_logo.png',
    streak: 0,
    rank: 9999,
    isVip: false
  };

  return {
    onboarded: false,
    activeTab: 'mining',
    currentBgTheme: 'theme_bg4',
    user: userInfo,
    tonWallet: {
      connected: false,
      address: null,
      walletName: null
    },
    balances: {
      SHOVEL: 0,
      TON: 0,
      USDT: 2.00,   // ← Every new user gets 2 USDT
      BTC: 0,
      ETH: 0,
      SOL: 0,
      BNB: 0,
      NOT: 0,
      DOGS: 0
    },
    autoMining: {
      active: false,
      startTime: 0,
      endTime: 0,
      sessionHours: 3,
      ratePerHour: 1.0,
      boostMultiplier: 1.0,
      boostEnd: 0
    },
    faucetLastClaimedAt: 0,
    totalSwapsCount: 0,
    tasksClaimed: {
      task0: false,
      task1: false,
      task2: false,
      task3: false
    },
    referrals: {
      totalInvites: 0,
      earnedMine: 0,
      code: generateRefCode(userId),
      friends: []
    },
    transactions: [
      {
        type: 'FAUCET',
        title: 'Welcome Bonus — 2 USDT',
        amount: '+2.00 USDT',
        time: 'Just now',
        isPositive: true
      }
    ]
  };
}

class StateStore {
  constructor() {
    this.listeners = [];
    this._userId = null;    // Set on first init via initForUser()
    this._storageKey = null;
    this.state = null;
  }

  // Call this AFTER Telegram WebApp SDK is ready
  initForUser() {
    // Step 1: Clear all old shared/legacy keys first (one-time migration)
    clearOldStorage();
    // Step 2: Load this user's own isolated state
    this._userId = getTelegramUserId();
    this._storageKey = `SHOVEL_WALLET_${this._userId}_V6`;
    this.state = this._loadState();
    this.startMiningTickLoop();
    return this;
  }

  _loadState() {
    try {
      const saved = localStorage.getItem(this._storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge: keep saved data but ensure all keys exist from fresh state
        const fresh = createFreshState(this._userId);
        return {
          ...fresh,
          ...parsed,
          balances: { ...fresh.balances, ...parsed.balances },
          autoMining: { ...fresh.autoMining, ...parsed.autoMining },
          referrals: { ...fresh.referrals, ...parsed.referrals },
          tasksClaimed: { ...fresh.tasksClaimed, ...parsed.tasksClaimed },
          user: { ...fresh.user, ...parsed.user }
        };
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    // Brand new user
    return createFreshState(this._userId);
  }

  saveState() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  getState() {
    return this.state;
  }

  // --- State Mutators ---
  setActiveTab(tab) {
    if (this.state.activeTab !== tab) {
      this.state.activeTab = tab;
      this.saveState();
    }
  }

  setBgTheme(themeName) {
    this.state.currentBgTheme = themeName;
    this.saveState();
  }

  connectTonWallet(walletName = 'Tonkeeper', address = null) {
    this.state.tonWallet.connected = true;
    this.state.tonWallet.walletName = walletName;
    this.state.tonWallet.address = address;
    this.saveState();
  }

  disconnectTonWallet() {
    this.state.tonWallet.connected = false;
    this.state.tonWallet.walletName = null;
    this.state.tonWallet.address = null;
    this.saveState();
  }

  // hasRefCode: true = user came via referral link → 1000 SHOVEL bonus
  // hasRefCode: false = normal signup → 200 SHOVEL welcome bonus
  completeOnboarding(hasRefCode = false) {
    this.state.onboarded = true;
    const bonus = hasRefCode ? 1000 : 200;
    this.state.balances.SHOVEL += bonus;
    this.state.transactions.unshift({
      type: 'MINE',
      title: hasRefCode ? '🎉 Referral Bonus — Welcome Gift' : '🎉 Welcome Bonus',
      amount: `+${bonus} SHOVEL`,
      time: 'Just now',
      isPositive: true
    });
    this.saveState();
    return bonus;
  }

  startMiningSession() {
    // Bug#16 Fix: Don't restart if already active
    if (this.state.autoMining.active) return;
    const now = Date.now();
    const durationHours = this.state.autoMining.sessionHours || 3;
    this.state.autoMining.active = true;
    this.state.autoMining.startTime = now;
    this.state.autoMining.endTime = now + (durationHours * 3600 * 1000);
    this.saveState();
  }

  claimMiningYield() {
    const now = Date.now();
    const mining = this.state.autoMining;
    if (!mining.active) return 0;

    const durationMs = (mining.sessionHours || 3) * 3600 * 1000;
    const elapsedMs = Math.min(now - mining.startTime, durationMs);
    const hoursElapsed = elapsedMs / (1000 * 3600);

    // Bug#3 Fix: read actual boostMultiplier (not hardcoded 2x)
    const isBoostActive = mining.boostEnd > now;
    let rate = mining.ratePerHour;
    if (isBoostActive) {
      const mult = mining.boostMultiplier || 2.0;
      rate *= mult;
    }
    if (this.state.user.isVip) rate *= 3.0;

    const yieldAmount = parseFloat((hoursElapsed * rate).toFixed(4));

    if (yieldAmount > 0) {
      this.state.balances.SHOVEL += yieldAmount;
      this.state.transactions.unshift({
        type: 'MINE',
        title: `${mining.sessionHours}H Mining Session Yield`,
        amount: `+${yieldAmount.toFixed(2)} SHOVEL`,
        time: 'Just now',
        isPositive: true
      });
    }

    mining.active = false;
    mining.startTime = 0;
    mining.endTime = 0;

    // Bug#14 Fix: cap transactions at 50 to prevent localStorage overflow
    if (this.state.transactions.length > 50) {
      this.state.transactions = this.state.transactions.slice(0, 50);
    }

    this.saveState();
    return yieldAmount;
  }

  applyAdBoost() {
    const now = Date.now();
    const durationMs = (this.state.autoMining.sessionHours || 3) * 3600 * 1000;
    this.state.autoMining.boostMultiplier = 2.0;
    this.state.autoMining.boostEnd = now + durationMs;
    this.saveState();
  }

  executeSwap(fromToken, toToken, fromAmount, toAmount) {
    const fee = 0.1;
    const requiredFrom = fromToken === 'SHOVEL' ? fromAmount + fee : fromAmount;
    // toAmount may arrive as a string from calculateToAmount() — always parse it
    const toAmountNum = parseFloat(toAmount) || 0;

    // Check sufficient fromToken balance
    if ((this.state.balances[fromToken] || 0) < requiredFrom) {
      return { success: false, reason: `Insufficient ${fromToken} balance` };
    }

    // For non-SHOVEL swaps, SHOVEL fee must also be payable
    if (fromToken !== 'SHOVEL' && (this.state.balances.SHOVEL || 0) < fee) {
      return { success: false, reason: `Need at least ${fee} SHOVEL to pay swap fee` };
    }

    if (fromToken === 'SHOVEL') {
      this.state.balances.SHOVEL -= requiredFrom;
    } else {
      this.state.balances[fromToken] -= fromAmount;
      this.state.balances.SHOVEL -= fee;
    }

    this.state.balances[toToken] = (this.state.balances[toToken] || 0) + toAmountNum;
    this.state.totalSwapsCount = (this.state.totalSwapsCount || 0) + 1;

    this.state.transactions.unshift({
      type: 'SWAP',
      title: `Swap ${fromToken} ➔ ${toToken} (Fee: ${fee} SHOVEL)`,
      amount: `-${fromAmount.toLocaleString()} ${fromToken} / +${toAmountNum.toFixed(4)} ${toToken}`,
      time: 'Just now',
      isPositive: true
    });

    this.saveState();
    return { success: true };
  }

  claimFaucet() {
    const now = Date.now();
    const cooldownMs = 24 * 3600 * 1000;
    if (this.state.faucetLastClaimedAt && (now - this.state.faucetLastClaimedAt) < cooldownMs) {
      return { success: false, reason: '24h Cooldown Active' };
    }

    this.state.balances.TON += 1.00;
    this.state.faucetLastClaimedAt = now;

    this.state.transactions.unshift({
      type: 'FAUCET',
      title: 'Faucet Deposit (24h Cooldown)',
      amount: '+1.00 TON',
      time: 'Just now',
      isPositive: true
    });

    this.saveState();
    return { success: true };
  }

  claimSwapTask(taskId) {
    if (this.state.tasksClaimed[taskId]) return false;

    if (taskId === 'task1' && this.state.totalSwapsCount >= 1000) {
      this.state.tasksClaimed.task1 = true;
      this.applyAdBoost();
      this.saveState();
      return { success: true, rewardMsg: '⚡ 2x Mining Speed Boost Unlocked!' };
    }

    if (taskId === 'task2' && this.state.totalSwapsCount >= 10000) {
      this.state.tasksClaimed.task2 = true;
      this.state.autoMining.sessionHours = 6;
      this.saveState();
      return { success: true, rewardMsg: '⏳ Mining Session Upgraded to 6 Hours!' };
    }

    if (taskId === 'task3' && this.state.totalSwapsCount >= 100000) {
      this.state.tasksClaimed.task3 = true;
      this.state.user.isVip = true;
      this.saveState();
      return { success: true, rewardMsg: '👑 VIP Member Status & Lifetime 3x Boost Unlocked!' };
    }

    return { success: false, reason: 'Milestone target not reached yet' };
  }

  // Credit referral invite (called when a friend joins via your link)
  recordReferralInvite(friendName, friendUsername) {
    this.state.referrals.totalInvites += 1;
    this.state.referrals.earnedMine += 500;
    this.state.balances.SHOVEL += 500;
    this.state.referrals.friends.unshift({
      name: friendName,
      username: friendUsername,
      status: 'Joined',
      bonus: '+500 SHOVEL'
    });
    this.state.transactions.unshift({
      type: 'MINE',
      title: `Referral Bonus — ${friendName} joined`,
      amount: '+500 SHOVEL',
      time: 'Just now',
      isPositive: true
    });
    this.saveState();
  }

  startMiningTickLoop() {
    setInterval(() => {
      const now = Date.now();
      const mining = this.state.autoMining;

      // Auto-claim when session ends
      if (mining.active && now >= mining.endTime) {
        this.claimMiningYield();
      }

      // Bug#4 Fix: Auto-Farm — if autoFarmEnd is active and no session running, restart session
      const autoFarmActive = this.state.autoFarmEnd && this.state.autoFarmEnd > now;
      if (autoFarmActive && !mining.active) {
        this.startMiningSession();
      }
    }, 1000);
  }
}

export const store = new StateStore();
