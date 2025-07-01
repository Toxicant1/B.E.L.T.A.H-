// commands/truth.js

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;

  const truths = [
    "😳 What’s the most embarrassing thing you’ve ever done?",
    "😈 Have you ever cheated on a test?",
    "💔 Who was your first crush?",
    "📱 What’s the last thing you searched on your phone?",
    "🤐 Have you ever told a big lie to your best friend?",
    "💬 If your crush texted right now, what would you reply?",
    "📷 Ever sent a screenshot of someone behind their back?"
  ];

  const randomTruth = truths[Math.floor(Math.random() * truths.length)];

  await sock.sendMessage(from, {
    text: `🎯 *Truth:* ${randomTruth}`
  }, { quoted: msg });
};
