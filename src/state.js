/* ==========================================================================
   CENTRAL REACTIVE STATE STORE & LOCALSTORAGE PERSISTENCE (SHOVEL WALLET V5)
   ========================================================================== */

const STORAGE_KEY = 'SHOVEL_WALLET_STATE_V5';

const initialDefaultState = {
  onboarded: false,
  activeTab: 'mining', // 'mining' | 'swap' | 'referrals' | 'portfolio'
  currentBgTheme: 'theme_bg4', // Theme 4: Cyber Molten Magma Core (Default Theme)
  user: {
    name: 'ShovelMiner',
    username: '@shovelminer',
    avatarUrl: '/shovel_logo.png',
    streak: 7,
    rank: 42,
    isVip: false
  },
  tonWallet: {
    connected: false,
    address: null,
    walletName: null
  },
  balances: {
    SHOVEL: 12450.00,
    TON: 2.45,
    USDT: 12.50,
    BTC: 0.00045,
    ETH: 0.018,
    SOL: 0.42,
    BNB: 0.12,
    NOT: 18500.00,
    DOGS: 65000.00
  },
  autoMining: {
    active: false,
    startTime: 0,
    endTime: 0,
    sessionHours: 3, // Default 3 hours (upgrades to 6 hours!)
    ratePerHour: 1.0, // 1 SHOVEL per hour
    boostMultiplier: 1.0,
    boostEnd: 0
  },
  faucetLastClaimedAt: 0, // Timestamp for 24h limit
  totalSwapsCount: 0,     // Total swap transactions counter
  tasksClaimed: {
    task1: false, // 1,000 swaps -> Mining Boost
    task2: false, // 10,000 swaps -> 6 Hours Mining Upgrade
    task3: false  // 100,000 swaps -> VIP Member Status
  },
  referrals: {
    totalInvites: 18,
    earnedMine: 9000,
    code: 'ref_shovel99281',
    friends: [
      { name: 'Rahul S.', username: '@rahul_crypto', status: 'Active Miner', bonus: '+500 SHOVEL' },
      { name: 'Sarah K.', username: '@sarah_web3', status: 'Mined 4.2k', bonus: '+500 SHOVEL' },
      { name: 'Alex M.', username: '@alex_dev', status: 'Joined', bonus: '+250 SHOVEL' },
      { name: 'Dmitry P.', username: '@dmitry_ton', status: 'Active Miner', bonus: '+500 SHOVEL' }
    ]
  },
  transactions: [
    { type: 'MINE', title: '3H Auto-Mining Yield', amount: '+3.00 SHOVEL', time: '10m ago', isPositive: true },
    { type: 'SWAP', title: 'Swap SHOVEL ➔ TON (Fee: 0.1 SHOVEL)', amount: '-1,000 SHOVEL / +0.15 TON', time: '1h ago', isPositive: true },
    { type: 'FAUCET', title: 'Testnet Faucet Deposit', amount: '+1.00 TON', time: '5h ago', isPositive: true }
  ]
};

class StateStore {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
    this.startMiningTickLoop();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...initialDefaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    return { ...initialDefaultState };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
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

  connectTonWallet(walletName = 'Tonkeeper', address = 'EQBvW89xK_Shovel_7F9k') {
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

  completeOnboarding(hasRefCode = false) {
    this.state.onboarded = true;
    const bonus = hasRefCode ? 1000 : 200;
    this.state.balances.SHOVEL += bonus;
    this.state.transactions.unshift({
      type: 'MINE',
      title: hasRefCode ? 'Referral Onboarding Bonus' : 'Welcome Onboarding Bonus',
      amount: `+${bonus} SHOVEL`,
      time: 'Just now',
      isPositive: true
    });
    this.saveState();
    return bonus;
  }

  startMiningSession() {
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
    
    const isBoostActive = mining.boostEnd > now;
    let rate = mining.ratePerHour;
    if (isBoostActive) rate *= 2.0;
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

    if ((this.state.balances[fromToken] || 0) < requiredFrom) {
      return { success: false, reason: `Insufficient ${fromToken} balance` };
    }

    if (fromToken === 'SHOVEL') {
      this.state.balances.SHOVEL -= requiredFrom;
    } else {
      this.state.balances[fromToken] -= fromAmount;
      if (this.state.balances.SHOVEL >= fee) {
        this.state.balances.SHOVEL -= fee;
      }
    }

    this.state.balances[toToken] = (this.state.balances[toToken] || 0) + toAmount;
    this.state.totalSwapsCount = (this.state.totalSwapsCount || 0) + 1;

    this.state.transactions.unshift({
      type: 'SWAP',
      title: `Swap ${fromToken} ➔ ${toToken} (Fee: ${fee} SHOVEL)`,
      amount: `-${fromAmount.toLocaleString()} ${fromToken} / +${toAmount} ${toToken}`,
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

  startMiningTickLoop() {
    setInterval(() => {
      const now = Date.now();
      const mining = this.state.autoMining;

      if (mining.active) {
        if (now >= mining.endTime) {
          this.claimMiningYield();
        }
        // DO NOT call this.notify() here!
        // MiningScreen handles its own 1-second tick updates internally.
        // Calling notify() here was causing full DOM re-renders every second,
        // which destroyed the navigation bar and broke scroll position.
      }
    }, 1000);
  }
}

export const store = new StateStore();
