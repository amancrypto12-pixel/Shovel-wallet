/* ==========================================================================
   APPLICATION ENTRY POINT & VIEW CONTROLLER (Shovel Wallet)
   
   CRITICAL FIX: Stop re-rendering header & navigation every second.
   Only re-render the ACTIVE SCREEN content on mining tick updates.
   Re-render header & navigation ONLY when activeTab changes.
   ========================================================================== */

import './style.css';
import { store } from './state.js';
import { ParticleEngine } from './particles.js';
import { renderHeader } from './components/Header.js';
import { renderNavigation } from './components/Navigation.js';
import { renderMiningScreen } from './components/MiningScreen.js';
import { renderSwapScreen } from './components/SwapScreen.js';
import { renderReferralScreen } from './components/ReferralScreen.js';
import { renderPortfolioScreen } from './components/PortfolioScreen.js';
import { showWelcomeModal, applyBgThemeToDOM } from './components/Modals.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize HTML5 Canvas Background Particle Physics Engine
  const bgCanvas = document.getElementById('bg-canvas');
  const particleCanvas = document.getElementById('particle-canvas');
  const particleEngine = new ParticleEngine(bgCanvas, particleCanvas);

  // 2. Initialize Telegram WebApp SDK
  initTelegramWebApp();

  // 3. Cache Core Shell DOM Elements
  const headerContainer = document.getElementById('app-header');
  const viewportContainer = document.getElementById('app-viewport');
  const navContainer = document.getElementById('app-nav');

  // 4. Initial Background Theme Application
  applyBgThemeToDOM(store.getState().currentBgTheme || 'theme_bg4');

  // 5. Track the last rendered tab so we only re-render shell when tab changes
  let lastRenderedTab = null;

  // 6. Main View Router Function
  function renderApp(state) {
    const currentTab = state.activeTab;

    // Only re-render header & navigation when the active tab actually changes
    if (lastRenderedTab !== currentTab) {
      renderHeader(headerContainer);
      renderNavigation(navContainer);
      applyBgThemeToDOM(state.currentBgTheme || 'theme_bg4');
      lastRenderedTab = currentTab;

      // Route active tab — full screen render
      switch (currentTab) {
        case 'mining':
          renderMiningScreen(viewportContainer, particleEngine);
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
          renderMiningScreen(viewportContainer, particleEngine);
          break;
      }

      // Scroll viewport to top on tab switch
      viewportContainer.scrollTop = 0;
    }
    // If tab hasn't changed, MiningScreen handles its own 1-second tick updates
    // internally via setInterval — no DOM rebuild needed here.

    // Trigger Welcome / Onboarding Modal if new user (only once)
    if (!state.onboarded && !window._onboardingShown) {
      window._onboardingShown = true;
      setTimeout(() => {
        showWelcomeModal();
      }, 500);
    }
  }

  // 7. Subscribe to State Changes
  store.subscribe((state) => {
    renderApp(state);
  });

  // 8. Initial First Render
  renderApp(store.getState());
});

function initTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    
    // Customize Telegram Header Color
    try {
      tg.setHeaderColor('#0a0b0e');
      tg.setBackgroundColor('#0a0b0e');
    } catch (e) {
      // Ignored if older TG version
    }
  }
}
