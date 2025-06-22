const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const config = require('../config');
const getLang = require('../settings/language');
const lang = getLang(config.language); // Load language settings
const fs = require('fs');

const menuCommand = async (sock, msg) => {
  const from = msg.key.remoteJid;

  // Typing effect
  await sock.sendPresenceUpdate('composing', from);
  await delay(400);

  // Load updated banner image (make sure it's placed in /media/)
  const imagePath = './media/beltah-banner.png';

  const menuCaption = `*🟢 B.E.L.T.A.H BOT 🟢*\n
🤖 _Street-smart WhatsApp bot powered by ChatGPT_  
🧠 AI Brain: ChatGPT × Gminae × CrewDrew  
📲 Works offline with Tamax or Termux  
🔐 Locked to: wa.me/254741819582

╭──[ 🧠 *AI FEATURES* ]──⭓
│ • .chat [msg] – ${lang.aiChat}
│ • .romantic [msg] – ${lang.aiRomantic}
│ • .swahili [msg] – ${lang.aiSwahili}
╰───────────────⭕

╭──[ 🎯 *FUN ZONE* ]──⭓
│ • .truth – ${lang.funTruth}
│ • .dare – ${lang.funDare}
╰───────────────⭕

╭──[ ⚙️ *GENERAL* ]──⭓
│ • .ping – ${lang.genPing}
│ • .menu – ${lang.genMenu}
│ • .owner – ${lang.genOwner}
╰───────────────⭕

╭──[ 🎨 *MEDIA TOOLS* ]──⭓
│ • .sticker – ${lang.mediaSticker}
│ • .attp [text] – ${lang.mediaATTP}
╰───────────────⭕

╭──[ 🔒 *GROUP ADMIN* ]──⭓
│ • .kick @user – ${lang.adminKick}
│ • .mute – ${lang.adminMute}
│ • .unmute – ${lang.adminUnmute}
╰───────────────⭕

📅 *Date:* ${new Date().toLocaleDateString()}
🕰 *Time:* ${new Date().toLocaleTimeString()}
`;

  // Send the image menu
  await sock.sendMessage(from, {
    image: fs.readFileSync(imagePath),
    caption: menuCaption,
  }, { quoted: msg });
};

module.exports = menuCommand;
