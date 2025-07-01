// commands/lyrics.js
const lyricsFinder = require('lyrics-finder');

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;
  const query = args.join(' ');

  if (!query) {
    return sock.sendMessage(from, {
      text: '❌ Please type a song name.\n\n📌 Usage: .lyrics [song name]'
    }, { quoted: msg });
  }

  try {
    const lyrics = await lyricsFinder(query, '') || '❌ Lyrics not found.';
    
    await sock.sendMessage(from, {
      text: `🎵 *Lyrics for:* ${query}\n\n${lyrics}`
    }, { quoted: msg });

  } catch (err) {
    console.error('Lyrics Error:', err);
    sock.sendMessage(from, {
      text: '⚠️ Failed to fetch lyrics. Try a different song.'
    }, { quoted: msg });
  }
};
