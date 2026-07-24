# 🔍 Shovel Wallet — Full Bug Analysis Report

> Analyzed: main.js, state.js, MiningScreen.js, SwapScreen.js, ReferralScreen.js, PortfolioScreen.js, Header.js, Modals.js

---

## 🔴 CRITICAL BUGS (App-Breaking)

### Bug #1 — `miningTimerInterval` Memory Leak (MiningScreen.js L325)
**Problem:** `miningTimerInterval` is a **module-level variable**. Every time the user switches tabs and returns to Mining, `renderMiningScreen()` is called, which starts a **new** `setInterval(updateTick, 1000)`. The old interval is cleared, BUT the `startMiningTickLoop()` in `state.js` (line 434) ALSO runs its own setInterval forever. So there are always **2 parallel timers** ticking — one in state, one in MiningScreen.

**Impact:** Double tick = double saveState() calls per second = double battery drain.

---

### Bug #2 — `daily_claim` Premium Lets You Claim Unlimited Times (MiningScreen.js L215)
**Problem:** When user buys "Daily 500 SHOVEL Claim" (399 Stars), +500 SHOVEL is **immediately credited**. But there's no daily cooldown check. User can buy it again the NEXT day, and it adds 500 again... **BUT** the `dailyClaimUnlocked` flag is never used to block re-buys or enforce a daily timer. It's just set to `true` and never checked.

**Impact:** User pays 399 Stars → gets 500 SHOVEL. They can never actually "daily claim" again because there's no UI for it after the buy.

---

### Bug #3 — `monthly_sub` boostMultiplier Overrides VIP Rate (state.js L302)
**Problem:** In `claimMiningYield()`:
```js
if (isBoostActive) rate *= 2.0;   // ad boost
if (this.state.user.isVip) rate *= 3.0; // VIP
```
But in `MiningScreen.js` (monthly_sub purchase L233):
```js
store.state.autoMining.boostMultiplier = 3.0;
store.state.autoMining.boostEnd = Date.now() + 30 * 24 * 3600 * 1000;
```
The `boostMultiplier` stored in state is **never read** in `claimMiningYield()`. The code only checks `mining.boostEnd > now` and hardcodes `rate *= 2.0`. So monthly_sub pays 3x boost price but only applies ad-level 2x boost.

**Impact:** Monthly Sub buyers only get 2x, not 3x.

---

### Bug #4 — `auto_farm` Does Nothing (MiningScreen.js L238)
**Problem:**
```js
case 'auto_farm':
  store.state.autoFarmEnd = Date.now() + 30 * 24 * 3600 * 1000;
  store.saveState();
```
`autoFarmEnd` is saved to state but **never read anywhere** — not in `claimMiningYield()`, not in `startMiningTickLoop()`, not in any tick logic. So the user pays 499 Stars but gets zero functionality.

**Impact:** 24H Auto-Farm is completely non-functional.

---

### Bug #5 — `circumference` Mismatch in updateTick() (MiningScreen.js L282)
**Problem:**
```js
const circumference = 2 * Math.PI * 72; // ~452 — uses OLD radius 72
```
But the SVG circle now has `r="62"` (updated when we shrunk the mining circle to 155px). The dasharray in CSS is `390` (2π×62). So the progress animation calculates offsets based on circumference 452 but the SVG element has dasharray 390 → progress ring always **appears partially filled even when 0%** done.

**Impact:** Mining progress ring visually wrong.

---

### Bug #6 — `refLink` Scoped Inside `renderUI()` but Used in Event Listener Closure (ReferralScreen.js L179)
**Problem:**
```js
function renderUI() {
  const refLink = `https://t.me/...`;  // L26 — declared inside renderUI
  ...
  container.querySelector('#copy-ref-link-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(refLink); // ← OK, closure captures it
  });
}
```
This is technically fine BUT every call to `renderUI()` re-adds a new event listener to the same button element. After switching between Team/Leaderboard tabs multiple times, the copy button has **multiple listeners stacked** — each call fires the toast multiple times.

**Impact:** Copy button fires toast 2x, 3x, 4x depending on how many times tab was toggled.

---

## 🟠 MEDIUM BUGS (Wrong Behavior)

### Bug #7 — Header Balance Shows Truncated Integer, Not Full Balance (Header.js L38)
**Problem:**
```js
${balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
```
Header pill shows `100` for `100.2489` SHOVEL. But the main mining screen shows `100.25`. Inconsistency — user might think their mined SHOVEL disappeared.

---

### Bug #8 — Mining `getEffectiveRate()` and `claimMiningYield()` Use Different Logic (state.js + MiningScreen.js)
**Problem:** `getEffectiveRate()` in MiningScreen.js:
```js
if (s.autoMining.boostEnd > Date.now()) rate *= 2.0;
if (s.user.isVip) rate *= 3.0;
```
`claimMiningYield()` in state.js:
```js
if (isBoostActive) rate *= 2.0;
if (this.state.user.isVip) rate *= 3.0;
```
If user has **both** ad boost AND VIP → effective rate = `1.0 × 2.0 × 3.0 = 6.0/hr`. But the **Session Yield card** (live counter) uses `getEffectiveRate()` from MiningScreen which calculates correctly. However the `claimMiningYield()` function in state.js calculates `rate` from `mining.ratePerHour` (always 1.0), so the **claimed amount at session end** could differ from what was shown live.

---

### Bug #9 — Swap `toAmount` Displayed in Confirm Modal Still as String (Modals.js L493)
**Problem:**
```js
<b style="color: var(--accent-teal);">${toAmount} ${toToken}</b>
```
`toAmount` is passed as a string like `"0.000042"`. If it's a very small number like `4.2e-5`, it displays as `4.2e-5 TON` in the confirm dialog — confusing for users.

---

### Bug #10 — Onboarding: Manual Referral Code Doesn't Credit the Referrer (Modals.js L301)
**Problem:** When a user enters a ref code manually and gets 1,000 SHOVEL:
```js
const bonus = store.completeOnboarding(hasRef); // only credits current user
```
The **person who shared** the referral link gets nothing — `recordReferralInvite()` is never called. Referral bonus only flows one way.

---

### Bug #11 — `window.open()` for Telegram Share Blocked in Mini App (ReferralScreen.js L191)
**Problem:**
```js
window.open(tgShareUrl, '_blank');
```
Telegram Mini App **blocks `window.open()`**. Should use:
```js
window.Telegram?.WebApp?.openTelegramLink(tgShareUrl);
```
**Impact:** "Invite Friends" button silently fails inside Telegram.

---

### Bug #12 — `navigator.clipboard.writeText()` Fails in Telegram Mini App (ReferralScreen.js L179)
**Problem:** Telegram WebApp doesn't grant clipboard permission in many versions. The `execCommand('copy')` fallback on L182 also won't work because the input element isn't properly focused in all cases.

Should use:
```js
window.Telegram?.WebApp?.openTelegramLink() // or show a manual copy prompt
```

---

## 🟡 MINOR BUGS / UX Issues

### Bug #13 — `state.user.rank` Always 9999, Never Updates
Rank is set to `9999` in `createFreshState()` and never recalculated. Leaderboard shows real mock data but "You" pinned bar always shows `#9999`.

### Bug #14 — Transactions Array Grows Unbounded
Every swap, mine, faucet appends to `state.transactions` with no cap. After thousands of swaps, localStorage key could exceed browser quota (~5MB), causing `saveState()` to silently fail and all progress to be lost.

**Fix:** Cap at 50 entries:
```js
if (this.state.transactions.length > 50) this.state.transactions = this.state.transactions.slice(0, 50);
```

### Bug #15 — `points_pack_day_*` Keys in localStorage Never Cleaned Up
Every day creates a new key `points_pack_day_2026-07-23`. These accumulate forever in localStorage, wasting space.

### Bug #16 — `startMiningSession()` Doesn't Check if Session Already Active
If user somehow triggers the mining button while a session is already active (race condition), `startMiningSession()` overwrites `startTime` and `endTime`, resetting the session mid-way.

---

## Summary Table

| # | Severity | File | Bug |
|---|----------|------|-----|
| 1 | 🔴 Critical | MiningScreen.js | Double timer — state + screen both tick |
| 2 | 🔴 Critical | MiningScreen.js | daily_claim has no actual daily cooldown |
| 3 | 🔴 Critical | state.js | monthly_sub gives 2x not 3x boost |
| 4 | 🔴 Critical | MiningScreen.js | auto_farm completely non-functional |
| 5 | 🔴 Critical | MiningScreen.js | circumference 452 vs SVG r=62 (→ 390) mismatch |
| 6 | 🟠 Medium | ReferralScreen.js | Duplicate event listeners on tab toggle |
| 7 | 🟠 Medium | Header.js | Balance integer only — feels like loss |
| 8 | 🟠 Medium | state.js | Yield display vs claimed amount diverge |
| 9 | 🟠 Medium | Modals.js | toAmount shows scientific notation |
| 10 | 🟠 Medium | Modals.js | Referrer never gets bonus |
| 11 | 🟠 Medium | ReferralScreen.js | window.open() blocked in Mini App |
| 12 | 🟠 Medium | ReferralScreen.js | clipboard.writeText() fails in Telegram |
| 13 | 🟡 Minor | state.js | User rank always 9999 |
| 14 | 🟡 Minor | state.js | Transactions unbounded — localStorage overflow risk |
| 15 | 🟡 Minor | MiningScreen.js | points_pack_day keys accumulate in localStorage |
| 16 | 🟡 Minor | state.js | startMiningSession() no active-check guard |
