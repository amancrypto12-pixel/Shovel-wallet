# 🚀 Vercel & Supabase Deployment Guide (Shovel Wallet)

Aapke **Shovel Wallet** ke liye Vercel build configuration (`vercel.json`) aur **Supabase Database Integration (`src/supabase.js`)** tayyar kar di gayi hai!

Vercel par deploy hone ke baad aapko ek **24/7 Permanent HTTPS URL** (e.g. `https://shovel-wallet.vercel.app`) milega jo Telegram Mini App mein fast aur bina kisi IP prompt ke hamesha chalega!

---

## ⚡ Option 1: Vercel CLI se Deploy karein (2 Minutes)

Terminal / Command Prompt open karein aur yeh 2 commands chalaayein:

1. **Vercel Login**:
   ```bash
   npx vercel login
   ```
   *(Yeh aapko browser mein 1-click Vercel login permission ke liye le jayega)*

2. **Deploy to Vercel**:
   ```bash
   npx vercel --prod
   ```
   *(Yeh aapke project ko 10 seconds mein publish karke aapko live `https://shovel-wallet.vercel.app` URL de dega!)*

---

## 🌐 Option 2: GitHub ➔ Vercel Dashboard 1-Click Deploy

1. Apne code ko GitHub repository par push karein.
2. **[Vercel Dashboard](https://vercel.com/new)** par jayein.
3. **Import Git Repository** par click karein.
4. **Deploy** button dabaayein!

---

## 🗄️ Supabase Database Connect Kaise Karein:

1. **[Supabase.com](https://supabase.com)** par free account banayein aur **New Project** create karein.
2. **Project Settings ➔ API** se `Project URL` aur `anon key` copy kar lein.
3. Vercel dashboard mein **Environment Variables** add karein:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
4. Supabase SQL Editor mein `src/supabase.js` mein di gayi SQL tables create kar lein!

---

## 🤖 Telegram Bot Token Update:
Vercel se mile Live URL ko apne `.env` mein daal kar bot chalaayein:
```env
BOT_TOKEN=8814956227:AAEtC3kl2Gk0r3AtUshdfx0pwqkGo0kIMo4
WEBAPP_URL=https://shovel-wallet.vercel.app
```
Command run karein: `npm run bot`

Ab aapka bot 24/7 Vercel permanent URL ke saath **[@shovelwallet_bot](https://t.me/shovelwallet_bot)** par live ho jayega!
