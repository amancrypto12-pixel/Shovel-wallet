/* ==========================================================================
   APPLICATION ENTRY POINT & VIEW CONTROLLER (Shovel Wallet)
   
   CRITICAL FIX: Stop re-rendering header & navigation every second.
   Only re-render the ACTIVE SCREEN content on mining tick updates.
   Re-render header & navigation ONLY when activeTab changes.
   ========================================================================== */

import './style.css';
import { store, getReferralCodeFromTelegram } from './state.js';
import { ParticleEngine } from './particles.js';
import { renderHeader } from './components/Header.js';
import { renderNavigation } from './components/Navigation.js';
import { renderMiningScreen } from './components/MiningScreen.js';
import { renderSwapScreen } from './components/SwapScreen.js';
import { renderReferralScreen } from './components/ReferralScreen.js';
import { renderPortfolioScreen } from './components/PortfolioScreen.js';
import { showWelcomeModal, applyBgThemeToDOM, startMonetagInAppInterstitial } from './components/Modals.js';
import { initTonConnect } from './tonConnect.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize HTML5 Canvas Background Particle Physics Engine
  const bgCanvas = document.getElementById('bg-canvas');
  const particleCanvas = document.getElementById('particle-canvas');
  const particleEngine = new ParticleEngine(bgCanvas, particleCanvas);

  // 2. Initialize Telegram WebApp SDK FIRST (needed to get User ID)
  initTelegramWebApp();

  // 3. NOW initialize per-user state store (uses Telegram User ID as key)
  store.initForUser();

  // 4. Initialize TonConnect
  initTonConnect();

  // 5. Cache Core Shell DOM Elements
  const headerContainer = document.getElementById('app-header');
  const viewportContainer = document.getElementById('app-viewport');
  const navContainer = document.getElementById('app-nav');

  // 6. Initial Background Theme Application
  applyBgThemeToDOM(store.getState().currentBgTheme || 'theme_bg4');

  // 7. Check if user came via referral link
  const incomingRefCode = getReferralCodeFromTelegram();

  // 8. Track the last rendered tab so we only re-render shell when tab changes
  let lastRenderedTab = null;

  // 9. Main View Router Function
  function renderApp(state) {
    const currentTab = state.activeTab;
    const tabChanged = lastRenderedTab !== currentTab;

    // ── Only re-render header & navigation when the active tab actually changes ──
    if (tabChanged) {
      renderHeader(headerContainer);
      renderNavigation(navContainer);
      applyBgThemeToDOM(state.currentBgTheme || 'theme_bg4');
      lastRenderedTab = currentTab;
      // Scroll viewport to top on tab switch
      viewportContainer.scrollTop = 0;
    }

    // ── Always re-render active SCREEN CONTENT on every state change ──
    // Mining is excluded — it manages its own 1-second interval timer internally.
    // All other screens must re-render to show immediate state updates
    // (swap progression, portfolio balance, referral stats, etc.)
    switch (currentTab) {
      case 'mining':
        // Only render mining screen when tab changes — its own timer handles tick updates
        if (tabChanged) renderMiningScreen(viewportContainer, particleEngine);
        break;
      case 'swap':
        renderSwapScreen(viewportContainer);
        break;
      case 'referrals':
        renderReferralScreen(viewportContainer);
        break;
      case 'portfolio':
        renderPortfolioScreen(viewportContainer);
        break;
      default:
        if (tabChanged) renderMiningScreen(viewportContainer, particleEngine);
        break;
    }

    // Trigger Welcome / Onboarding Modal if new user (only once)
    if (!state.onboarded && !window._onboardingShown) {
      window._onboardingShown = true;
      setTimeout(() => {
        showWelcomeModal(incomingRefCode);
      }, 500);
    }
  }

  // 10. Subscribe to State Changes
  store.subscribe((state) => {
    renderApp(state);

    // Sync header balance pill on EVERY state change (mining ticks, swaps, purchases)
    const balancePill = document.querySelector('.balance-amount');
    if (balancePill) {
      balancePill.textContent = state.balances.SHOVEL.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  });

  // 11. Initial First Render
  renderApp(store.getState());

  // 12. Monetag In-App Interstitial
  // BUG-13 FIX: Only fire inside Telegram WebApp — not in browser dev testing
  // DELAY: 3 minutes after load to avoid conflicting with early swaps.
  if (window.Telegram?.WebApp) {
    setTimeout(() => {
      startMonetagInAppInterstitial();
    }, 180000); // 3 minutes = 180,000ms
  }
});

function initTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    // Customize Telegram Header Color
    try {
      tg.setHeaderColor('#ffffff');
      tg.setBackgroundColor('#f0f2f8');
    } catch (e) {
      // Ignored if older TG version
    }

    // CRITICAL: Disable vertical swipes so Telegram doesn't
    // intercept scroll events inside the Mini App
    try {
      tg.disableVerticalSwipes();
    } catch (e) {
      // Older Telegram versions may not support this
    }

    // Allow scroll on the viewport element directly
    const viewport = document.getElementById('app-viewport');
    if (viewport) {
      viewport.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      }, { passive: true });
      viewport.addEventListener('touchmove', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }
  }
}
