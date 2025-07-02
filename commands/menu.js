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

  // 🔊 Step 1: Play intro audio
  const introPath = './media/menu-song.ogg';
  if (fs.existsSync(introPath)) {
    await sock.sendMessage(from, {
      audio: fs.readFileSync(introPath),
      mimetype: 'audio/ogg',
      ptt: false
    }, { quoted: msg });
    await delay(1200);
  }

  // 🧾 Step 2: Build styled menu
  const status = (v) => v ? '✅ ON' : '❌ OFF';
  const menuCaption = `
╔════════════════════════════════╗
║     🧠 ${config.botName.toUpperCase()} - COMMANDS 🧠     ║
╠════════════════════════════════╣
👑 *Boss:* ${config.ownerName}
👨‍💻 *Core Dev:* ${config.coreDevName}
🔐 *Number Lock:* wa.me/${config.ownerNumber}
⚙️ *Public Mode:* ${status(config.public)}
🤖 *AI Engine:* ${status(config.aiEnabled)} (${config.aiEngine.toUpperCase()})
👀 *Auto View Status:* ${status(config.autoViewStatus)}
🗑️ *Anti-Delete:* ${status(config.antiDelete)}
╚════════════════════════════════╝

╔═ 🎶 𝗠𝗨𝗦𝗜𝗖 𝗕𝗟𝗢𝗖𝗞 ═╗
║ • .play [song]         – Tafuta ngoma moja safi
║ • .yta [yt-link]       – Download audio
║ • .ytv [yt-link]       – Download video
║ • .lyrics [title]      – Pata mistari ya ngoma
║ • .shazam [reply audio]– Tambua jina ya ngoma
╚═════════════════════════╝

╔═ 💬 𝗔𝗜 𝗖𝗛𝗔𝗧𝗕𝗢𝗧 ═╗
║ • .chat [msg]          – ${lang.aiChat || "Chat na Beltah AI 🧠"}
║ • .romantic [msg]      – ${lang.aiRomantic || "Maneno tamu kwa warembo 💘"}
║ • .swahili [msg]       – ${lang.aiSwahili || "Chat ya Kiswahili Gen Z 🇰🇪"}
╚═════════════════════════╝

╔═ 🎭 𝗙𝗨𝗡 𝗭𝗢𝗡𝗘 ═╗
║ • .truth               – ${lang.funTruth || "Swali la ukweli 🔍"}
║ • .dare                – ${lang.funDare || "Changamoto moto 🔥"}
╚════════════════════╝

╔═ ⚙️ 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 ═╗
║ • .ping                – ${lang.genPing || "Beltah iko radar? 📡"}
║ • .menu                – ${lang.genMenu || "Onyesha menu yote 📜"}
║ • .owner               – ${lang.genOwner || "Pata info ya owner 👑"}
║ • .restart             – ♻️ Restart bot (kwa admin tu)
╚════════════════════╝

╔═ 🖼️ 𝗠𝗘𝗗𝗜𝗔 𝗧𝗢𝗢𝗟𝗦 ═╗
║ • .sticker             – ${lang.mediaSticker || "Tengeneza sticker haraka 🎨"}
║ • .attp [text]         – ${lang.mediaATTP || "Andika text kwa emoji format 🌀"}
╚════════════════════╝

╔═ 🛡️ 𝗔𝗗𝗠𝗜𝗡 𝗢𝗡𝗟𝗬 ═╗
║ • .kick @user          – ${lang.adminKick || "Toa mtu nje ya group 👟"}
║ • .mute                – ${lang.adminMute || "Tuliza group kabisa 🤐"}
║ • .unmute              – ${lang.adminUnmute || "Fungua group tena 🗣️"}
╚════════════════════╝

📆 *Date:* ${new Date().toLocaleDateString()}
🕒 *Time:* ${new Date().toLocaleTimeString()}
🔖 *Powered by:* ${config.footer}
  `.trim();

  // 🖼️ Step 3: Send menu (image/text mode)
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
