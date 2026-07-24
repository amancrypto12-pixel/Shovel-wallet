# 🤖 Telegram Bot Setup & Connection Guide (Shovel Wallet)

Aapke **Shovel Wallet Mini App** ke liye complete **Node.js Bot Backend (`bot.js`)** create kar diya gaya hai!

Bot connect karne ke liye aapko **2 chizen** chahiye:

---

### 1. Telegram Bot Token (`BOT_TOKEN`)
1. Telegram open karein aur **[@BotFather](https://t.me/BotFather)** search karein.
2. Command bhejein: `/newbot`
3. Bot Name daalein: `Shovel Wallet`
4. Bot Username daalein: `ShovelWalletBot` (ya koi bhi available username jo `bot` se end ho).
5. **BotFather aapko ek API Token dega** (e.g. `789123456:AAFd83...`). Iss token ko copy kar lein!

---

### 2. Live Web App HTTPS Link (`WEBAPP_URL`)
Telegram Mini Apps me **HTTPS URL** compulsory hota hai:
- **Local Testing ke liye**: Free tool `ngrok` ya `localtunnel` use kar sakte hain:
  ```bash
  npx localtunnel --port 3000
  ```
  Isse aapko ek live `https://...` link milega.
- **Production Hosting ke liye**: Code ko Vercel, Netlify, Render, ya Railway par deploy karke link le sakte hain.

---

### ⚙️ How to Connect & Run in 2 Steps:

1. `.env` file banayein project root folder (`Game.ai/`) mein:
   ```env
   BOT_TOKEN=789123456:AAFd83... (aapka bottoken)
   WEBAPP_URL=https://your-https-link.com (aapka webapp link)
   ```

2. Bot launch karein:
   ```bash
   npm run bot
   ```

---

### 🔘 Bot Menu Button Setup (Direct Telegram Menu Button):
1. **@BotFather** par jayein.
2. Send command: `/setmenubutton`
3. Select your bot.
4. Paste your WebApp HTTPS URL.
5. Set Button Title: `⛏️ Open Shovel Wallet`

Ab koi bhi user aapke Bot par `/start` bhejega ya Menu Button par click karega, direct **Shovel Wallet** open ho jayega! 🚀
