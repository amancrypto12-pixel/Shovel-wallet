# Implementation Plan - Telegram Mining & Testnet DEX Swap Mini App

Build a pro-level, responsive, game-like **Telegram Mining & Testnet DEX Swap Mini App** adhering to the provided design guide ("Dark Mode, Neon Telegram Vibe", Cyberpunk, Notcoin/Web3 aesthetic).

## User Review Required

> [!IMPORTANT]
> - The app will run completely locally with persistent state saved via `localStorage`.
> - Includes full simulation of Telegram WebApp environment, Web Audio API sound effects, particle canvas animations, live dynamic rate charts, simulated rewarded video ads, referral links, leaderboard rankings, and testnet token faucet/withdrawals.

## Open Questions

> [!NOTE]
> None at this stage. All screen details, color palettes, visual guidelines, state flows, and user interactions match your detailed specifications.

---

## Proposed Architecture & Component Design

The application will be built using modern web standards (Vite + HTML5 / Canvas / Modular JavaScript / CSS3 with Cyberpunk Neomorphism & Glassmorphism design tokens).

```
c:\Users\aman\OneDrive\Documents\Game.ai\
├── index.html                  # Main WebApp Entry HTML with Telegram Mini App viewport & theme
├── package.json                # Vite & dependency setup
├── vite.config.js              # Vite configuration
├── src/
│   ├── style.css               # Full Cyberpunk & Dark Neon Telegram CSS design system
│   ├── main.js                 # App initialization, routing & state management
│   ├── audio.js                # Web Audio API sound synthesizer (coin tap, swap, reward sounds)
│   ├── particles.js            # HTML5 Canvas tap explosion particles & background grid effects
│   ├── state.js                # LocalStorage state store (balance, energy, streak, inventory, referrals)
│   └── components/
│       ├── Header.js           # Top User Telegram Profile & MINE Balance Pill
│       ├── Navigation.js       # Bottom Neon Glass Nav Bar
│       ├── MiningScreen.js     # Notcoin-style interactive coin, energy bar, cooldown timer, floating crypto & ad boost
│       ├── SwapScreen.js       # DEX Swap interface, dynamic exchange rate, Chart.js line graph, slippage & modal
│       ├── ReferralScreen.js   # Referral link, statistics, friend list, Top 3 podium leaderboard
│       ├── PortfolioScreen.js  # Testnet portfolio balances, token cards, deposit faucet & withdrawal modal
│       └── Modals.js           # Welcome modal, Confirm Swap modal, Rewarded Ad modal, Faucet modal
```

---

## Screen Breakdown & Key Features

### 1. Visual Theme & CSS Tokens (`src/style.css`)
- **Colors**: Deep Black `#0A0B0E`, Charcoal `#12141C`, Neon Gold `#FFD700`, Neon Teal/Cyan `#00FFFF`, Electric Violet `#9D00FF`.
- **Fonts**: Google Fonts `Inter` & `Rubik` for cyber-styled typography and sharp tabular numbers.
- **Glassmorphism**: Backdrop blur filter, neon glow shadows (`box-shadow: 0 0 20px rgba(255, 215, 0, 0.4)`), pulsing border animations.

### 2. Screen 1: Mining Screen ⛏️
- **Notcoin Tap Mechanism**: High-resolution 3D-styled `$MINE` central crystal token.
- **Visual Feedback**: Dynamic HTML5 Canvas particle bursts, floating `+500 MINE` click popups, energy bar system (`1000/1000`), haptic vibration simulation.
- **Auto-Mining & Cooldown**: Active timer count (`04H 12M`), circular SVG progress ring, "Watch Ad for 2x Power" boost activator.
- **Floating Crypto Drops**: Interactive floating badges (`tTON`, `tUSDT`, `ETH`) drifting in 2D space; tapping yields instant bonus drops!
- **Rewarded Ad Simulator**: Interactive video ad popup modal with 5-second reward countdown giving 2x speed & instant energy refill.

### 3. Screen 2: Testnet DEX Swap 🔄
- **Swap Card**: 'From' `$MINE` and 'To' (`tTON`, `tUSDT`, `tETH`) input fields with instant conversion calculation.
- **Centered Reverse Button**: Smooth animation swapping tokens and amounts.
- **Dynamic Price Chart**: Canvas/SVG interactive 24-hour rate chart for `MINE/tTON` with timeframes (`1H`, `24H`, `7D`).
- **Confirm Swap Flow**: Interactive modal simulating Telegram Wallet Web3 transaction signing, gas fee breakdown, and tx completion notice.

### 4. Screen 3: Referral Dashboard & Leaderboard 👥🏆
- **My Team Tab**: Total invites counter, `$MINE` earned, copyable referral link with toast notification, and invited friend list.
- **Leaderboard Tab**: Filterable (`Top MINE`, `Top tUSDT`, `Daily Streak`), 3D-styled animated Podium for Top 3, ranked list with user's pinned rank card.

### 5. Screen 4: Portfolio & Wallet 💼
- **Portfolio Summary**: Total estimated USD value (labeled `[TESTNET]`), token breakdown cards with 24h percentage changes.
- **Simulated Web3 Faucet & Withdrawals**:
  - `Deposit tTON` Faucet Modal (claim free testnet tokens!).
  - `Withdraw` Modal (send testnet tokens to an address).

---

## Verification Plan

### Automated Build Verification
- Run `npm run build` or Vite build check to ensure zero syntax or compilation errors.

### Manual Verification
1. Launch app locally with `npm run dev` and test responsiveness on mobile (Telegram Mini App proportions) & desktop viewport.
2. Test tap mining: check energy drain, particle explosions, floating text, sound effects, cooldown activation, and ad boost refill.
3. Test DEX Swap: convert MINE to tTON, inspect rate chart, open confirmation modal, perform swap, verify Portfolio updates.
4. Test Referrals & Leaderboard: switch tabs, copy referral link, check leaderboard ranks.
5. Test Portfolio: verify token balances, test Testnet Faucet claim (+1.00 tTON), verify deposit/withdrawal flows.
