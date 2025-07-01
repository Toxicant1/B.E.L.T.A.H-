const messages = {
  en: {
    greeting: "Hi 👋, I'm Beltah – your smart assistant!",
    menuHeader: "📍 *Your Digital Buddy on WhatsApp*",
    botStatus: "✅ Bot is Online",
    help: "Use commands like .menu, .chat, .ping",

    // Menu command labels
    aiChat: "Chat with Beltah AI",
    aiRomantic: "Send romantic replies 💖",
    aiSwahili: "Reply in Kiswahili slang",
    funTruth: "Play truth game",
    funDare: "Play dare game",
    genPing: "Check if bot is alive",
    genMenu: "Show full menu",
    genOwner: "Show contact of the owner",
    mediaSticker: "Convert image to sticker",
    mediaATTP: "Animated text-to-sticker",
    adminKick: "Remove user from group",
    adminMute: "Mute group",
    adminUnmute: "Unmute group"
  },

  sw: {
    greeting: "Niaje 👋, mimi ni Beltah – msaidizi wako!",
    menuHeader: "📍 *Rafiki Wako wa WhatsApp*",
    botStatus: "✅ Beltah iko Live",
    help: "Tumia commands kama .menu, .chat, .ping",

    // Menu command labels
    aiChat: "Piga story na Beltah AI",
    aiRomantic: "Tuma mistari ya mahaba 💘",
    aiSwahili: "Jibu kwa Kiswahili na slang",
    funTruth: "Cheza truth",
    funDare: "Cheza dare",
    genPing: "Angalia kama bot iko live",
    genMenu: "Onyesha menyu yote",
    genOwner: "Angalia namba ya owner",
    mediaSticker: "Badilisha picha kuwa stika",
    mediaATTP: "Text ya kustickia inamove",
    adminKick: "Mtoa mtu group",
    adminMute: "Funga group",
    adminUnmute: "Fungua group"
  }
};

const getLang = (langCode) => {
  return messages[langCode] || messages['en'];
};

module.exports = getLang;
