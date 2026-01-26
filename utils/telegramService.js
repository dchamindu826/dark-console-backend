const axios = require('axios');

// Common function to send message
const sendTelegramMessage = async (chatId, message) => {
  if (!chatId) return;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    console.log(`📩 Telegram sent to ${chatId}`);
  } catch (error) {
    console.error('❌ Telegram Error:', error.response?.data || error.message);
  }
};

// Super Admin ට යවන විශේෂ Function එක
const notifySuperAdmin = async (message) => {
    const superAdminId = process.env.SUPER_ADMIN_CHAT_ID;
    if(superAdminId) {
        await sendTelegramMessage(superAdminId, message);
    } else {
        console.warn("⚠️ Super Admin Chat ID not set in .env");
    }
};

module.exports = { sendTelegramMessage, notifySuperAdmin };