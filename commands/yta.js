// commands/yta.js
const ytdl = require('ytdl-core');

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;
  const url = args[0];

  if (!url || !ytdl.validateURL(url)) {
    return sock.sendMessage(from, {
      text: '❌ Please provide a valid YouTube link.\n\n📌 Usage: .yta [url]'
    }, { quoted: msg });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const channel = info.videoDetails.author.name;
    const duration = info.videoDetails.lengthSeconds;

    await sock.sendMessage(from, {
      audio: ytdl(url, { filter: 'audioonly' }),
      mimetype: 'audio/mp4',
      ptt: false
    }, { quoted: msg });

    await sock.sendMessage(from, {
      text: `✅ *Downloaded:* ${title}\n📺 *Channel:* ${channel}\n⏱️ *Duration:* ${Math.floor(duration / 60)} min`
    }, { quoted: msg });

  } catch (err) {
    console.error('YTA Error:', err);
    sock.sendMessage(from, {
      text: '⚠️ Sorry, failed to download audio. Try another link.'
    }, { quoted: msg });
  }
};
