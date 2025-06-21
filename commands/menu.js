// commands/menu.js

const figlet = require('figlet');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const menuCommand = async (sock, msg) => {
  const from = msg.key.remoteJid;

  // Generate big text for "B.E.L.T.A.H"
  const bigText = figlet.textSync('B.E.L.T.A.H', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  // Send typing animation
  await sock.sendPresenceUpdate('composing', from);
  await delay(500);

  // Send big bold name
  await sock.sendMessage(from, { text: '```' + bigText + '```' }, { quoted: msg });
  await delay(1000);

  const menuMessage = `
📍 *Your Digital Buddy on WhatsApp*  
🧠 AI · 🔧 Tools · 🎮 Fun · 🛡 Admin Panel  

╭──[ 🧠 AI FEATURES ]──⭓
│ • .chat [msg] – Talk to Beltah AI  
│ • .romantic [msg] – Beltah in love 💘  
│ • .swahili [msg] – Swahili / Sheng mode  
╰───────────────⭕

╭──[ 🎯 FUN ZONE ]──⭓
│ • .truth – Ask a deep Q 🤔  
│ • .dare – Accept challenge 😈  
╰───────────────⭕

╭──[ 🛠 GENERAL ]──⭓
│ • .ping – Check speed 🛰  
│ • .menu – Show this menu 🧾  
│ • .owner – Info ya Boss 🧔🏽  
╰───────────────⭕

╭──[ 🎨 MEDIA TOOLS ]──⭓
│ • .sticker – Image to sticker ✨  
│ • .attp [text] – Text sticker 💬  
╰───────────────⭕

╭──[ 🔒 GROUP ADMIN ]──⭓
│ • .kick @user – Ondoa msee 🚪  
│ • .mute – Silence group 🤐  
│ • .unmute – Allow talk 🗣  
╰───────────────⭕

🔋 *Bot Status:* ONLINE ✅  
📅 *Date:* ${new Date().toLocaleDateString()}
🕰 *Time:* ${new Date().toLocaleTimeString()}

_💬 Beltah iko radhi kusaidia!_
`;

  await sock.sendMessage(from, { text: menuMessage }, { quoted: msg });
};

module.exports = menuCommand;
