/* ==========================================================================
   TELEGRAM STARS PAYMENT UTILITY (Shovel Wallet)
   
   BUG-01 FIX: Bot Token moved to backend (/api/create-invoice.js).
   BUG-02 FIX: provider_token removed — not needed for Telegram Stars (XTR).
   BUG-18 FIX: Loading state added on buy button during invoice creation.
   ========================================================================== */

// Invoice creation is now handled server-side via /api/create-invoice
// BOT_TOKEN is NEVER in frontend code


// Product definitions — prices in Telegram Stars
export const STAR_PRODUCTS = {
  ads_free_lifetime: {
    id: 'ads_free_lifetime',
    title: '♾️ Ads Free — Lifetime',
    description: 'Watch zero ads forever. Never see an ad in Shovel Wallet again!',
    icon: '♾️',
    stars: 1499,
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
    tag: 'LIFETIME'
  },
  daily_claim: {
    id: 'daily_claim',
    title: '🎁 Daily 500 SHOVEL Claim',
    description: 'Claim 500 bonus SHOVEL points every 24 hours!',
    icon: '🎁',
    stars: 399,
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
    tag: 'DAILY'
  },
  vip_pass: {
    id: 'vip_pass',
    title: '👑 VIP Legend Pass',
    description: 'Exclusive Legend badge on your profile + 3x mining multiplier forever!',
    icon: '👑',
    stars: 1999,
    color: '#d4a000',
    gradient: 'linear-gradient(135deg, #d4a000 0%, #92400e 100%)',
    tag: 'LEGEND'
  },
  monthly_sub: {
    id: 'monthly_sub',
    title: '💎 Monthly Premium',
    description: 'Ads free + 3x daily rewards for a full month!',
    icon: '💎',
    stars: 599,
    color: '#0088cc',
    gradient: 'linear-gradient(135deg, #0088cc 0%, #005a99 100%)',
    tag: '1 MONTH'
  },
  auto_farm: {
    id: 'auto_farm',
    title: '🤖 24H Auto-Farm',
    description: 'Automatic points farming for 1 full month — earn while you sleep!',
    icon: '🤖',
    stars: 499,
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
    tag: '1 MONTH'
  },
  points_pack: {
    id: 'points_pack',
    title: '⚡ 10 SHOVEL Points',
    description: 'Instantly get +10 SHOVEL points! Max 5 purchases per day.',
    icon: '⚡',
    stars: 1,
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
    tag: '5/DAY LIMIT',
    dailyLimit: 5
  }
};

// Create Telegram Stars invoice link via Bot API, then open it in WebApp
export async function purchaseWithStars(productKey, onSuccess) {
  const product = STAR_PRODUCTS[productKey];
  if (!product) {
    console.warn('Unknown product:', productKey);
    return;
  }

  // Check if Telegram WebApp is available
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    alert('⚠️ Please open inside Telegram to make purchases.');
    return;
  }

  // BUG-18 FIX: Show loading state on all ⭐ buy buttons during API call
  const allBuyBtns = document.querySelectorAll(`.stars-buy-btn[data-product="${productKey}"]`);
  allBuyBtns.forEach(btn => {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
  });

  const restoreBtns = () => {
    allBuyBtns.forEach(btn => {
      btn.disabled = false;
      btn.innerHTML = `⭐ ${product.stars.toLocaleString()}`;
    });
  };

  try {
    // Step 1: Create invoice link via secure backend API (BOT_TOKEN never in frontend)
    const payload = JSON.stringify({ productKey, userId: tg.initDataUnsafe?.user?.id || 'unknown' });

    const res = await fetch('/api/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: product.title,
        description: product.description,
        payload: payload,
        stars: product.stars
        // provider_token intentionally omitted — not needed for Telegram Stars XTR
      })
    });

    const data = await res.json();

    if (!data.ok || !data.result) {
      console.error('Invoice creation failed:', data);
      restoreBtns();
      if (tg.showAlert) {
        tg.showAlert('⚠️ Could not create payment link. Please try again.');
      }
      return;
    }

    const invoiceUrl = data.result;

    // Step 2: Open native Telegram Stars payment UI
    tg.openInvoice(invoiceUrl, (status) => {
      if (status === 'paid') {
        // Payment confirmed by Telegram
        if (typeof onSuccess === 'function') onSuccess(productKey);
      } else if (status === 'cancelled') {
        console.log('Payment cancelled by user');
      } else if (status === 'failed') {
        if (tg.showAlert) tg.showAlert('⚠️ Payment failed. Please try again.');
      }
      restoreBtns(); // Always restore button after invoice closes
    });

  } catch (err) {
    console.error('Stars payment error:', err);
    restoreBtns();
    if (tg?.showAlert) tg.showAlert('⚠️ Network error. Please try again.');
  }
}
