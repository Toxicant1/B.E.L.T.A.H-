const config = require('../config');

const ownerCommand = async (sock, msg) => {
  const from = msg.key.remoteJid;

  const text = `
👑 *Bot Owner Info*

📛 Name: ${config.ownerName}
📱 WhatsApp: wa.me/${config.ownerNumber.replace('+', '')}
💻 GitHub: https://github.com/Toxicant1
📧 Email: isaac0maina@gmail.com
🧠 Core Developer: Raph Muguna
📱 Dev Number: wa.me/254743689554
📸 Insta: @raph.muguna | @toxic._.a.n.t
`;

  await sock.sendMessage(from, { text }, { quoted: msg });
};

module.exports = ownerCommand;
