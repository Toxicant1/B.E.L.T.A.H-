// commands/ytv.js
const ytdl = require('ytdl-core');

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;
  const url = args[0];

  if (!url || !ytdl.validateURL(url)) {
    return sock.sendMessage(from, {
      text: '❌ Please provide a valid YouTube video link. Usage: .ytv [url]'
    }, { quoted: msg });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;

    await sock.sendMessage(from, {
      video: ytdl(url, { quality: '18' }), // 360p standard
      mimetype: 'video/mp4',
      caption: `🎥 *${title}*`
    }, { quoted: msg });

  } catch (err) {
    console.error('YTV Error:', err);
    sock.sendMessage(from, {
      text: '⚠️ Failed to download video.'
    }, { quoted: msg });
  }
};
