const config = require('../config');
const getLang = require('../settings/language');
const fs = require('fs');
const path = require('path');
const lang = getLang(config.language);
const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

const PLATFORM = process.env.PLATFORM || 'tamax';
const IS_TAMAX = PLATFORM === 'tamax';

const menuCommand = async (sock, msg) => {
  const from = msg.key.remoteJid;

  if (config.typingIndicator) {
    await sock.sendPresenceUpdate('composing', from);
    await delay(400);
  }

  // ✅ Step 1: Play intro audio (only on Tamax/local)
  const introPath = './media/assets_beltah_intro.mp3';
  if (IS_TAMAX && fs.existsSync(introPath)) {
    await sock.sendMessage(from, {
      audio: fs.readFileSync(introPath),
      mimetype: 'audio/mp4',
      ptt: false
    }, { quoted: msg });
    await delay(1200);
  }

  // ✅ Step 2: Build the menu text
  const status = (v) => v ? '✅ ON' : '❌ OFF';
  const menuCaption = `
╔════════════════════════════════╗
║     🎉 ${config.botName.toUpperCase()} COMMAND MENU 🎉     ║
╠════════════════════════════════╣
👑 *Owner:* ${config.ownerName}
👨‍💻 *Core Dev:* ${config.coreDeveloper || 'Raph Muguna'}
🔐 *Locked to:* wa.me/${config.ownerNumber.replace('+', '')}
⚙️ *Mode:* ${status(config.public)}
🤖 *AI Engine:* ${status(config.aiEnabled)} (${config.aiEngine.toUpperCase()})
👁️ *Auto-Status View:* ${status(config.autoViewStatus)}
🛡️ *Anti-Delete:* ${status(config.antiDelete)}
╚════════════════════════════════╝

╔═ 🎵 𝗠𝗨𝗦𝗜𝗖 𝗣𝗟𝗔𝗬𝗘𝗥 ═╗
║ • .play [song]
║ • .yta [url]
║ • .ytv [url]
║ • .lyrics [song]
║ • .shazam [reply audio]
╚═════════════════════════╝

╔═ 🧠 𝗔𝗜 / 𝗖𝗛𝗔𝗧𝗕𝗢𝗧 ═╗
║ • .chat [msg] – ${lang.aiChat}
║ • .romantic [msg] – ${lang.aiRomantic}
║ • .swahili [msg]  – ${lang.aiSwahili}
╚═════════════════════════╝

╔═ 🎯 𝗙𝗨𝗡 𝗭𝗢𝗡𝗘 ═╗
║ • .truth – ${lang.funTruth}
║ • .dare  – ${lang.funDare}
╚════════════════════╝

╔═ ⚙️ 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 ═╗
║ • .ping     – ${lang.genPing}
║ • .menu     – ${lang.genMenu}
║ • .owner    – ${lang.genOwner}
║ • .restart  – ♻️ Restart bot
╚════════════════════╝

╔═ 🎨 𝗠𝗘𝗗𝗜𝗔 𝗧𝗢𝗢𝗟𝗦 ═╗
║ • .sticker     – ${lang.mediaSticker}
║ • .attp [text] – ${lang.mediaATTP}
╚════════════════════╝

╔═ 🔒 𝗔𝗗𝗠𝗜𝗡 𝗢𝗡𝗟𝗬 ═╗
║ • .kick @user – ${lang.adminKick}
║ • .mute       – ${lang.adminMute}
║ • .unmute     – ${lang.adminUnmute}
╚════════════════════╝

📅 *Date:* ${new Date().toLocaleDateString()}
🕒 *Time:* ${new Date().toLocaleTimeString()}
🔖 *Powered by:* ${config.footer}
`.trim();

  // ✅ Step 3: Send the menu as image or text
  const bannerPath = './media/beltah-banner.png';
  if (config.menuStyle === 'image' && fs.existsSync(bannerPath)) {
    await sock.sendMessage(from, {
      image: fs.readFileSync(bannerPath),
      caption: menuCaption
    }, { quoted: msg });
  } else {
    await sock.sendMessage(from, { text: menuCaption }, { quoted: msg });
  }
};

module.exports = menuCommand;
