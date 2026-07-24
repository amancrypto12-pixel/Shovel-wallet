/* ==========================================================================
   VERCEL SERVERLESS FUNCTION — Create Telegram Stars Invoice Link
   
   BUG-01 FIX: Bot Token is now ONLY on the server, never in frontend JS.
   BUG-02 FIX: provider_token is NOT sent for XTR (Telegram Stars) currency.
   
   Called by frontend telegramPay.js via POST /api/create-invoice
   ========================================================================== */

const BOT_TOKEN = process.env.BOT_TOKEN || '8814956227:AAEtC3kl2Gk0r3AtUshdfx0pwqkGo0kIMo4';
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { title, description, payload, stars } = req.body;

    if (!title || !description || !payload || !stars) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // BUG-02 FIX: For Telegram Stars (XTR), do NOT send provider_token
    const invoiceBody = {
      title: String(title).slice(0, 32),          // Telegram limit: 32 chars
      description: String(description).slice(0, 255), // Telegram limit: 255 chars
      payload: String(payload),
      currency: 'XTR',                             // Telegram Stars currency code
      prices: [{ label: String(title).slice(0, 32), amount: parseInt(stars) }]
      // ← provider_token intentionally OMITTED for Stars (BUG-02 fix)
    };

    const response = await fetch(`${TG_API}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceBody)
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('[create-invoice] Telegram API error:', data);
      return res.status(500).json({ ok: false, error: data.description || 'Invoice creation failed' });
    }

    return res.status(200).json({ ok: true, result: data.result });

  } catch (err) {
    console.error('[create-invoice] Server error:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}
