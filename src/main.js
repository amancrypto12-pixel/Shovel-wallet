/* ==========================================================================
   APPLICATION ENTRY POINT & VIEW CONTROLLER (Shovel Wallet)
   ========================================================================== */

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

  // 2. Initialize Telegram WebApp SDK Simulation
  initTelegramWebApp();

  // 3. Cache Core Shell DOM Elements
  const headerContainer = document.getElementById('app-header');
  const viewportContainer = document.getElementById('app-viewport');
  const navContainer = document.getElementById('app-nav');

  // 4. Initial Background Theme Application
  applyBgThemeToDOM(store.getState().currentBgTheme || 'theme_bg1');

  // 5. Main View Router Function
  function renderApp(state) {
    // Render Header & Navigation
    renderHeader(headerContainer);
    renderNavigation(navContainer);

    // Apply Background Theme
    applyBgThemeToDOM(state.currentBgTheme || 'theme_bg1');

    // Route active tab
    switch (state.activeTab) {
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

    // Trigger Welcome / Onboarding Modal if new user
    if (!state.onboarded) {
      setTimeout(() => {
        showWelcomeModal();
      }, 500);
    }
  }

  // 6. Subscribe to State Changes
  store.subscribe((state) => {
    // Render view when activeTab or structural state changes
    renderApp(state);
  });

  // 7. Initial First Render
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
