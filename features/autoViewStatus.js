// features/autoViewStatus.js

const fs = require('fs');

// 🐯 Emojis pool (you can expand this)
const emojis = ['😎', '🔥', '💯', '🎉', '👀', '🌺', '🐱', '🐶', '🐍', '🌈', '🍀', '🦁', '🥳', '💡'];

function getRandomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

const autoViewStatus = async (sock, msg) => {
  const m = msg.messages[0];
  if (!m || m.key.remoteJid !== 'status@broadcast') return;

  try {
    // Read/view the status
    await sock.readMessages([m.key]);

    const caption =
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      m.message?.extendedTextMessage?.text ||
      m.message?.conversation ||
      '';

    const emoji = getRandomEmoji();
    const name = m.pushName || m.key.participant || '👤 Unknown';

    console.log(`👀 Auto-viewed ${name}'s status`);
    
    // 💬 React to caption with random emoji
    if (caption) {
      await sock.sendMessage(m.key.remoteJid, {
        text: `${emoji} ${caption}`
      });
    }

  } catch (err) {
    console.error('❌ Auto-view status failed:', err);
  }
};

module.exports = autoViewStatus;
