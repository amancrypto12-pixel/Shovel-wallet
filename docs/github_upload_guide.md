# 🐙 GitHub Upload & Vercel Deploy Step-by-Step Guide

Maine aapke poore project code ka **Git repository local commit kar diya hai**!

Ab aapko bas **GitHub par 1 new repository banani hai** aur yeh 3 steps follow karne hain:

---

### 📌 STEP 1: GitHub Par Repository Banayein (1 Minute)

1. Browser mein **[github.com/new](https://github.com/new)** par jayein.
2. **Repository Name** mein daalein: `shovel-wallet`
3. **Public** ya **Private** select karein.
4. **"Create Repository"** green button par click karein.
5. GitHub aapko ek URL dega (e.g. `https://github.com/your-username/shovel-wallet.git`).

---

### 📌 STEP 2: Code ko GitHub Par Push Karein (30 Seconds)

Apne Terminal / Command Prompt (Game.ai folder ke andar) mein yeh 3 lines paste karein (apne GitHub link ke saath):

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shovel-wallet.git
git push -u origin main
```

*(Aapka poora Shovel Wallet code instantly GitHub par upload ho jayega!)*

---

### 📌 STEP 3: Vercel Par 1-Click Deploy (1 Minute)

1. Browser mein **[vercel.com/new](https://vercel.com/new)** par jayein (GitHub se sign in karein).
2. **"Import"** button par click karein apne `shovel-wallet` repository ke aage.
3. Framework **Vite** automatically detect ho jayega.
4. **"Deploy"** button par click karein!

🎉 **10 seconds mein Vercel aapko 24/7 Permanent HTTPS Link de dega** (e.g. `https://shovel-wallet.vercel.app`)!

---

### 📌 STEP 4: Telegram Bot Se Connect Karein

Vercel Link milne ke baad:
1. **[@BotFather](https://t.me/BotFather)** par jayein.
2. Send command `/setmenubutton` ➔ Select `@shovelwallet_bot` ➔ Paste your Vercel URL `https://shovel-wallet.vercel.app` ➔ Set title: `⛏️ Open Shovel Wallet`.

3. `.env` file mein URL update karke bot launch karein:
   ```env
   BOT_TOKEN=8814956227:AAEtC3kl2Gk0r3AtUshdfx0pwqkGo0kIMo4
   WEBAPP_URL=https://shovel-wallet.vercel.app
   ```
   Run command: `npm run bot`

Ab aapka bot **[@shovelwallet_bot](https://t.me/shovelwallet_bot)** 24/7 bina rukey HAMESHA LIVE CHALEGA! 🚀
