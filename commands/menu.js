// commands/menu.js

const fs = require('fs');
const path = require('path');
const figlet = require('figlet');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const menuCommand = async (sock, msg) => {
  const from = msg.key.remoteJid;

  // Generate big bold "B.E.L.T.A.H"
  const bigText = figlet.textSync('B.E.L.T.A.H', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  // 1. Typing animation
  await sock.sendPresenceUpdate('composing', from);
  await delay(400);

  // 2. Send intro audio 🎶
  const introAudio = fs.readFileSync(path.join(__dirname, '../media/menu-song.ogg'));
  await sock.sendMessage(from, {
    audio: introAudio,
    mimetype: 'audio/ogg',
    ptt: true
  }, { quoted: msg });

  await delay(1500);

  // 3. Send bold name
  await sock.sendMessage(from, { text: '```' + bigText + '```' }, { quoted: msg });

  await delay(1000);

  // 4. Prepare the image + text menu
  const menuImage = fs.readFileSync(path.join(__dirname, '../media/menu.jpg'));

  const caption = `
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

  // 5. Send menu image with caption
  await sock.sendMessage(from, {
    image: menuImage,
    caption
  }, { quoted: msg });
};

module.exports = menuCommand;
