// commands/menuCommand.js
const config = require('../config');
const getLang = require('../settings/language');
const fs = require('fs');
const lang = getLang(config.language);
const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

const menuCommand = async (sock, msg) => {
  const from = msg.key.remoteJid;

  if (config.typingIndicator) {
    await sock.sendPresenceUpdate('composing', from);
    await delay(400);
  }

  // ✅ Step 1: Play the intro audio before menu
  const introPath = './media/menu-song.ogg';
  if (fs.existsSync(introPath)) {
    await sock.sendMessage(from, {
      audio: fs.readFileSync(introPath),
      mimetype: 'audio/ogg',
      ptt: false
    }, { quoted: msg });
    await delay(1200); // Delay after audio to give time before menu
  } else {
    console.warn('⚠️ Intro music not found at:', introPath);
  }

  // ✅ Step 2: Send the decorated menu text
  const status = (v) => v ? '✅ ON' : '❌ OFF';
  const menuText = `
╔══════════════════════════════════╗
║         🎉 𝗕.𝗘.𝗟.𝗧.𝗔.𝗛 𝗠𝗘𝗡𝗨 🎉         ║
╠══════════════════════════════════╣
║ 👑 𝗢𝘄𝗻𝗲𝗿: ${config.ownerName}
║ 🔐 𝗟𝗼𝗰𝗸𝗲𝗱 𝘁𝗼: wa.me/${config.ownerNumber.replace('+', '')}
║ ⚙️ 𝗠𝗼𝗱𝗲: ${status(config.public)}
║ 🤖 𝗔𝗜: ${status(config.aiEnabled)} (${config.aiEngine.toUpperCase()})
║ 👁️ 𝗔𝘂𝘁𝗼-𝗦𝘁𝗮𝘁𝘂𝘀: ${status(config.autoViewStatus)}
║ 🛡️ 𝗔𝗻𝘁𝗶-𝗗𝗲𝗹𝗲𝘁𝗲: ${status(config.antiDelete)}
╚══════════════════════════════════╝

╔═══ 🎵 𝗠𝗨𝗦𝗜𝗖 𝗣𝗟𝗔𝗬𝗘𝗥 ════════════════╗
║ • .play [song]
║ • .yta [url]
║ • .ytv [url]
║ • .lyrics [song]
║ • .shazam [reply audio]
╚══════════════════════════════════╝

╔═══ 🧠 𝗔𝗜 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 ═════════════════╗
║ • .chat [msg]     – ${lang.aiChat}
║ • .romantic [msg] – ${lang.aiRomantic}
║ • .swahili [msg]  – ${lang.aiSwahili}
╚══════════════════════════════════╝

╔═══ 🎯 𝗙𝗨𝗡 𝗭𝗢𝗡𝗘 ══════════════════════╗
║ • .truth – ${lang.funTruth}
║ • .dare  – ${lang.funDare}
╚══════════════════════════════════╝

╔═══ ⚙️ 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 ══════════════════════╗
║ • .ping  – ${lang.genPing}
║ • .menu  – ${lang.genMenu}
║ • .owner – ${lang.genOwner}
╚══════════════════════════════════╝

╔═══ 🎨 𝗠𝗘𝗗𝗜𝗔 𝗧𝗢𝗢𝗟𝗦 ═════════════════╗
║ • .sticker     – ${lang.mediaSticker}
║ • .attp [text] – ${lang.mediaATTP}
╚══════════════════════════════════╝

╔═══ 🔒 𝗔𝗗𝗠𝗜𝗡 𝗢𝗡𝗟𝗬 ══════════════════╗
║ • .kick @user – ${lang.adminKick}
║ • .mute       – ${lang.adminMute}
║ • .unmute     – ${lang.adminUnmute}
╚══════════════════════════════════╝

📅 *Date:* ${new Date().toLocaleDateString()}
🕒 *Time:* ${new Date().toLocaleTimeString()}
🔖 *Powered by:* Beltah × Knight
`;

  await sock.sendMessage(from, { text: menuText.trim() }, { quoted: msg });
};

module.exports = menuCommand;
