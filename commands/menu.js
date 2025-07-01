// commands/menuCommand.js
const config = require('../config');
const getLang = require('../settings/language');
const fs = require('fs');
const path = require('path');
const lang = getLang(config.language);
const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

const menuCommand = async (sock, msg) => {
  const from = msg.key.remoteJid;

  if (config.typingIndicator) {
    await sock.sendPresenceUpdate('composing', from);
    await delay(400);
  }

  // ✅ Step 1: Play intro audio
  const introPath = './media/menu-song.ogg';
  if (fs.existsSync(introPath)) {
    await sock.sendMessage(from, {
      audio: fs.readFileSync(introPath),
      mimetype: 'audio/ogg',
      ptt: false
    }, { quoted: msg });
    await delay(1200);
  }

  // ✅ Step 2: Generate menu caption
  const status = (v) => v ? '✅ ON' : '❌ OFF';
  const menuCaption = `
╔══════════════════════════════╗
║ 🎉 ${config.botName.toUpperCase()} MENU 🎉
╠══════════════════════════════╣
👑 Owner: ${config.ownerName}
🔐 Locked to: wa.me/${config.ownerNumber.replace('+', '')}
⚙️ Mode: ${status(config.public)}
🤖 AI: ${status(config.aiEnabled)} (${config.aiEngine.toUpperCase()})
👁️ Auto-Status: ${status(config.autoViewStatus)}
🛡️ Anti-Delete: ${status(config.antiDelete)}
╚══════════════════════════════╝

🎵 MUSIC:
• .play [song]
• .yta [url]
• .ytv [url]
• .lyrics [song]
• .shazam [reply audio]

🧠 AI COMMANDS:
• .chat [msg] – ${lang.aiChat}
• .romantic [msg] – ${lang.aiRomantic}
• .swahili [msg] – ${lang.aiSwahili}

🎯 FUN ZONE:
• .truth – ${lang.funTruth}
• .dare  – ${lang.funDare}

⚙️ GENERAL:
• .ping  – ${lang.genPing}
• .menu  – ${lang.genMenu}
• .owner – ${lang.genOwner}

🎨 MEDIA TOOLS:
• .sticker     – ${lang.mediaSticker}
• .attp [text] – ${lang.mediaATTP}

🔒 ADMIN ONLY:
• .kick @user – ${lang.adminKick}
• .mute       – ${lang.adminMute}
• .unmute     – ${lang.adminUnmute}

📅 Date: ${new Date().toLocaleDateString()}
🕒 Time: ${new Date().toLocaleTimeString()}
🔖 Powered by: ${config.footer}
`;

  // ✅ Step 3: Send image menu or text
  const bannerPath = './media/beltah-banner.png'; // Or './beltah-banner.png' if outside
  if (config.menuStyle === 'image' && fs.existsSync(bannerPath)) {
    await sock.sendMessage(from, {
      image: fs.readFileSync(bannerPath),
      caption: menuCaption.trim()
    }, { quoted: msg });
  } else {
    await sock.sendMessage(from, { text: menuCaption.trim() }, { quoted: msg });
  }
};

module.exports = menuCommand;
