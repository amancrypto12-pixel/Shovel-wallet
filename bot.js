/* ==========================================================================
   TELEGRAM BOT BACKEND & MINI APP LAUNCHER (Shovel Wallet)
   ========================================================================== */

import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.BOT_TOKEN || '8814956227:AAEtC3kl2Gk0r3AtUshdfx0pwqkGo0kIMo4';
const webAppUrl = process.env.WEBAPP_URL || 'https://green-ties-hope.loca.lt';

const bot = new TelegramBot(token, { polling: true });

console.log('🚀 Shovel Wallet Telegram Bot (@shovelwallet_bot) started successfully!');

// --- 1. /start Command Handler ---
bot.onText(/\/start(?:\s+(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
  const refCode = match ? match[1] : null;

  let welcomeText = `👋 *Welcome to Shovel Wallet, ${username}!*\n\n` +
    `⛏️ *Dig & Mine $SHOVEL Points* every 3 hours!\n` +
    `🔄 *Swap Multi-Crypto Tokens* (TON, USDT, BTC, ETH, SOL, BNB, NOT, DOGS)\n` +
    `💎 *Connect TON Wallet* & track net worth\n` +
    `👥 *Invite Friends* & earn +1,000 SHOVEL bonus!\n\n`;

  if (refCode) {
    welcomeText += `🎁 *Referral Link Detected:* \`${refCode}\` (+1,000 SHOVEL Bonus Unlocked!)\n\n`;
  }

  welcomeText += `Tap the button below to launch Shovel Wallet:`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '🚀 Launch Shovel Wallet ⛏️',
          web_app: { url: refCode ? `${webAppUrl}?startapp=${refCode}` : webAppUrl }
        }
      ],
      [
        { text: '📢 Official Channel', url: 'https://t.me/telegram' },
        { text: '💬 Community', url: 'https://t.me/telegram' }
      ]
    ]
  };

  bot.sendMessage(chatId, welcomeText, {
    parse_mode: 'Markdown',
    reply_markup: replyMarkup
  });
});

// --- 2. Catch-all message handler ---
bot.on('message', (msg) => {
  if (msg.text && !msg.text.startsWith('/start')) {
    bot.sendMessage(msg.chat.id, 'Tap below to launch Shovel Wallet:', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Launch Shovel Wallet ⛏️',
              web_app: { url: webAppUrl }
            }
          ]
        ]
      }
    });
  }
});
