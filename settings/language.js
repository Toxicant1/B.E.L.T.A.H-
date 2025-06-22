// settings/language.js

const messages = {
  en: {
    greeting: "Hi 👋, I'm Beltah – your smart assistant!",
    menuHeader: "📍 *Your Digital Buddy on WhatsApp*",
    botStatus: "✅ Bot is Online",
    help: "Use commands like .menu, .chat, .ping",
  },
  sw: {
    greeting: "Niaje 👋, mimi ni Beltah – msaidizi wako!",
    menuHeader: "📍 *Rafiki Wako wa WhatsApp*",
    botStatus: "✅ Beltah iko Live",
    help: "Tumia commands kama .menu, .chat, .ping",
  }
};

const getLang = (langCode) => {
  return messages[langCode] || messages['en'];
};

module.exports = getLang;
