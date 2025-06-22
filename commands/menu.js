const figlet = require('figlet');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const config = require('../config');
const getLang = require('../settings/language');
const lang = getLang(config.language); // Load language settings

const menuCommand = async (sock, msg) => {
  const from = msg.key.remoteJid;

  // Typing effect
  await sock.sendPresenceUpdate('composing', from);
  await delay(400);

  // Big B.E.L.T.A.H Banner
  const bigText = figlet.textSync('B.E.L.T.A.H', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  // Send banner
  await sock.sendMessage(from, { text: '```' + bigText + '```' }, { quoted: msg });
  await delay(900);

  // Main menu message
  const menuMessage = `
${lang.menuHeader}

╭──[ 🧠 AI FEATURES ]──⭓
│ • .chat [msg] – ${lang.aiChat}
│ • .romantic [msg] – ${lang.aiRomantic}
│ • .swahili [msg] – ${lang.aiSwahili}
╰───────────────⭕

╭──[ 🎯 FUN ZONE ]──⭓
│ • .truth – ${lang.funTruth}
│ • .dare – ${lang.funDare}
╰───────────────⭕

╭──[ 🛠 GENERAL ]──⭓
│ • .ping – ${lang.genPing}
│ • .menu – ${lang.genMenu}
│ • .owner – ${lang.genOwner}
╰───────────────⭕

╭──[ 🎨 MEDIA TOOLS ]──⭓
│ • .sticker – ${lang.mediaSticker}
│ • .attp [text] – ${lang.mediaATTP}
╰───────────────⭕

╭──[ 🔒 GROUP ADMIN ]──⭓
│ • .kick @user – ${lang.adminKick}
│ • .mute – ${lang.adminMute}
│ • .unmute – ${lang.adminUnmute}
╰───────────────⭕

${lang.botStatus}
📅 Date: ${new Date().toLocaleDateString()}
🕰 Time: ${new Date().toLocaleTimeString()}

${lang.help}
`;

  await sock.sendMessage(from, { text: menuMessage }, { quoted: msg });
};

module.exports = menuCommand;
