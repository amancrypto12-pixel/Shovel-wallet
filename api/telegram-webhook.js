/* ==========================================================================
   VERCEL SERVERLESS FUNCTION — Telegram Bot Webhook
   
   Handles:
   1. pre_checkout_query  → Must answer within 10s or payment fails
   2. successful_payment  → Payment confirmed by Telegram
   
   Deploy: This file goes in /api/ folder → Vercel auto-exposes it as:
   https://your-app.vercel.app/api/telegram-webhook
   ========================================================================== */

const BOT_TOKEN = '8814956227:AAEtC3kl2Gk0r3AtUshdfx0pwqkGo0kIMo4';
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req, res) {
  // Only accept POST from Telegram
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Shovel Wallet Webhook Active ✅' });
  }

  try {
    const update = req.body;

    // ── 1. PRE-CHECKOUT QUERY ─────────────────────────────────────────────
    // Telegram sends this before charging user. MUST reply ok=true within 10s.
    if (update.pre_checkout_query) {
      const pqId = update.pre_checkout_query.id;

      await fetch(`${TG_API}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: pqId,
          ok: true   // ← Approve payment
        })
      });

      console.log(`[Webhook] Pre-checkout approved: ${pqId}`);
      return res.status(200).json({ ok: true });
    }

    // ── 2. SUCCESSFUL PAYMENT ─────────────────────────────────────────────
    // Telegram sends this after Stars are deducted from user's account
    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment;
      const userId  = update.message.from.id;
      const chatId  = update.message.chat.id;
      const stars   = payment.total_amount;
      const payload = payment.invoice_payload;

      console.log(`[Webhook] Payment confirmed: User ${userId} paid ${stars} Stars. Payload: ${payload}`);

      // Optional: Send confirmation message to user
      await fetch(`${TG_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `✅ Payment Successful!\n\n⭐ ${stars} Stars received.\nYour premium feature has been activated in Shovel Wallet!\n\nOpen the app to see your reward 🎁`,
          parse_mode: 'HTML'
        })
      });

      return res.status(200).json({ ok: true });
    }

    // ── 3. ALL OTHER UPDATES (ignore) ─────────────────────────────────────
    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[Webhook] Error:', err);
    // Always return 200 to Telegram (never return 500 — Telegram will retry spam)
    return res.status(200).json({ ok: true });
  }
}
