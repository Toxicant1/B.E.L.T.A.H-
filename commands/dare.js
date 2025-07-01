// commands/dare.js

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;

  const dares = [
    "😜 Text your crush 'I like you' and screenshot the reply.",
    "🎤 Record a voice note singing your favorite song.",
    "📷 Take a funny selfie and send it to the group.",
    "🤳 Use your front camera and send your serious face.",
    "🔄 Change your status to 'I'm single again 😭' for 10 mins.",
    "👀 Say something embarrassing in your family group.",
    "🫣 Write a love message to a random group member."
  ];

  const randomDare = dares[Math.floor(Math.random() * dares.length)];

  await sock.sendMessage(from, {
    text: `😈 *Dare:* ${randomDare}`
  }, { quoted: msg });
};
