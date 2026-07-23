/* ==========================================================================
   TELEGRAM STARS PAYMENT UTILITY (Shovel Wallet)
   
   Real Telegram Stars (XTR) payments via Bot API + WebApp openInvoice.
   Bot Token is used to create invoice links server-side style.
   ========================================================================== */

const BOT_TOKEN = '8814956227:AAEtC3kl2Gk0r3AtUshdfx0pwqkGo0kIMo4';
const BOT_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Test payment provider token (from BotFather /approve)
// Empty string "" for real Telegram Stars (XTR) in production
const PAYMENT_PROVIDER_TOKEN = 'a436e720ad4719888f432bb76c214eedbc9d091e:qwerty';

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

  try {
    // Step 1: Create invoice link via Bot API (Telegram Stars = currency XTR)
    const payload = JSON.stringify({ productKey, userId: tg.initDataUnsafe?.user?.id || 'unknown' });

    const res = await fetch(`${BOT_API}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: product.title,
        description: product.description,
        payload: payload,
        currency: 'XTR',                    // Telegram Stars currency
        prices: [{ label: product.title, amount: product.stars }],
        provider_token: PAYMENT_PROVIDER_TOKEN  // Test token from BotFather
      })
    });

    const data = await res.json();

    if (!data.ok || !data.result) {
      console.error('Invoice creation failed:', data);
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
    });

  } catch (err) {
    console.error('Stars payment error:', err);
    const tg = window.Telegram?.WebApp;
    if (tg?.showAlert) tg.showAlert('⚠️ Network error. Please try again.');
  }
}
