# ⭐ Telegram Stars Payment Setup Guide
## Shovel Wallet — Real Stars Payments Enable Karo

---

> [!IMPORTANT]
> Stars payment ke liye **2 cheezein** zaroori hain:
> 1. **BotFather** mein payments enable karna
> 2. **Vercel webhook** set karna (bina iske payment step 4 pe fail hogi)

---

## STEP 1 — BotFather mein Stars Enable Karo

Telegram open karo aur [@BotFather](https://t.me/BotFather) pe jao:

```
1. Type karo: /mybots
2. Apna bot select karo: @ShovelWalletBot (ya jo bhi name hai)
3. "Bot Settings" click karo
4. "Payments" click karo
5. "Telegram Stars" select karo
6. Done ✅ — No external provider needed for Stars!
```

> [!NOTE]
> Telegram Stars ke liye koi **Stripe/bank account** nahi chahiye.
> Directly Telegram handle karta hai. Sirf BotFather mein enable karo.

---

## STEP 2 — Vercel Webhook Function Banao

Yeh **bahut zaroori** hai. Jab user Stars se pay karta hai, Telegram bot ko ek
`pre_checkout_query` bhejta hai. Bot ko **10 seconds ke andar** reply karna hota hai
warna payment cancel ho jaati hai.

Yeh file already create ho gayi hai:
📄 `api/telegram-webhook.js` — **Vercel serverless function**

---

## STEP 3 — Webhook URL Set Karo BotFather/Telegram mein

Vercel pe deploy hone ke baad, browser mein yeh URL open karo:

```
https://api.telegram.org/bot8814956227:AAEtC3kl2Gk0r3AtUshdfx0pwqkGo0kIMo4/setWebhook?url=https://shovel-wallet.vercel.app/api/telegram-webhook
```

> [!TIP]
> `shovel-wallet.vercel.app` ki jagah apna actual Vercel domain daalo.
> Vercel domain Vercel dashboard mein milega.

Response aana chahiye:
```json
{"ok": true, "result": true, "description": "Webhook was set"}
```

---

## STEP 4 — Webhook Verify Karo

```
https://api.telegram.org/bot8814956227:AAEtC3kl2Gk0r3AtUshdfx0pwqkGo0kIMo4/getWebhookInfo
```

Dekhna:
```json
{
  "url": "https://your-app.vercel.app/api/telegram-webhook",
  "has_custom_certificate": false,
  "pending_update_count": 0
}
```

---

## STEP 5 — Test Karo

1. Telegram mein apna bot open karo
2. Mining screen pe scroll karo
3. Koi bhi Stars panel pe click karo (e.g., ⭐ 399 — Daily Claim)
4. Telegram ka native Stars payment screen khulega
5. Pay karo — reward auto-credit hoga ✅

---

## 🔄 Payment Flow (How it Works)

```
User clicks ⭐ 399 Stars button
        ↓
Frontend: Bot API se invoice link create hota hai
        ↓
Telegram Stars UI khulta hai (native)
        ↓
Telegram → bot ko pre_checkout_query bhejta hai
        ↓
Vercel Webhook → answerPreCheckoutQuery(ok=true)
        ↓
⭐ Stars deducted from user's Telegram account
        ↓
Telegram → bot ko successful_payment bhejta hai
        ↓
Frontend: reward credited + toast shown ✅
```

---

> [!WARNING]
> Agar webhook set nahi kiya toh payment hamesha **"Payment Failed"** dikhayega
> kyunki Telegram ko 10 second mein confirmation nahi milegi.

