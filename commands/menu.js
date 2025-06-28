// commands/menuCommand.js
const config = require('../config');
const getLang = require('../settings/language');
const lang = getLang(config.language);
const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

const menuCommand = async (sock, msg) => {
  const from = msg.key.remoteJid;

  if (config.typingIndicator) {
    await sock.sendPresenceUpdate('composing', from);
    await delay();
  }

  const status = (val) => val ? '✅ ON' : '❌ OFF';

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

╔═══ 🧠 𝗔𝗜 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 ═════════════════╗
║ • ${config.prefix[0]}chat [msg]     – ${lang.aiChat}
║ • ${config.prefix[0]}romantic [msg] – ${lang.aiRomantic}
║ • ${config.prefix[0]}swahili [msg]  – ${lang.aiSwahili}
╚══════════════════════════════════╝

╔═══ 🎯 𝗙𝗨𝗡 𝗭𝗢𝗡𝗘 ══════════════════════╗
║ • ${config.prefix[0]}truth – ${lang.funTruth}
║ • ${config.prefix[0]}dare  – ${lang.funDare}
╚══════════════════════════════════╝

╔═══ ⚙️ 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 ══════════════════════╗
║ • ${config.prefix[0]}ping  – ${lang.genPing}
║ • ${config.prefix[0]}menu  – ${lang.genMenu}
║ • ${config.prefix[0]}owner – ${lang.genOwner}
╚══════════════════════════════════╝

╔═══ 🎨 𝗠𝗘𝗗𝗜𝗔 𝗧𝗢𝗢𝗟𝗦 ═════════════════╗
║ • ${config.prefix[0]}sticker     – ${lang.mediaSticker}
║ • ${config.prefix[0]}attp [text] – ${lang.mediaATTP}
╚══════════════════════════════════╝

╔═══ 🔒 𝗔𝗗𝗠𝗜𝗡 𝗢𝗡𝗟𝗬 ══════════════════╗
║ • ${config.prefix[0]}kick @user – ${lang.adminKick}
║ • ${config.prefix[0]}mute       – ${lang.adminMute}
║ • ${config.prefix[0]}unmute     – ${lang.adminUnmute}
╚══════════════════════════════════╝

╔═══ 🎵 𝗠𝗨𝗦𝗜𝗖 𝗣𝗟𝗔𝗬𝗘𝗥 ════════════════╗
║ • ${config.prefix[0]}play [song name]
║ • ${config.prefix[0]}yta [yt url]
║ • ${config.prefix[0]}ytv [yt url]
║ • ${config.prefix[0]}lyrics [song]
║ • ${config.prefix[0]}shazam [reply audio]
╚══════════════════════════════════╝

📆 *𝗗𝗮𝘁𝗲:* ${new Date().toLocaleDateString()}
🕒 *𝗧𝗶𝗺𝗲:* ${new Date().toLocaleTimeString()}
🔗 *𝗥𝗲𝗽𝗼:* ${config.repo || 'N/A'}
🔖 *𝗙𝗼𝗼𝘁𝗲𝗿:* ${config.footer || 'Powered by Beltah x Knight'}
`;

  await sock.sendMessage(from, { text: menuText.trim() }, { quoted: msg });
};

module.exports = menuCommand;
