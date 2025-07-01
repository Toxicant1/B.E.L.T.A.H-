// commands/play.js
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const { getAudioBuffer } = require('../lib/helpers'); // Optional helper if needed

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;
  const query = args.join(' ');

  if (!query) {
    return sock.sendMessage(from, { text: '❌ Please provide a song name. Usage: .play [song name]' }, { quoted: msg });
  }

  try {
    const result = await yts(query);
    const song = result.videos[0];

    if (!song) {
      return sock.sendMessage(from, { text: '🚫 No results found on YouTube.' }, { quoted: msg });
    }

    const audioStream = ytdl(song.url, { filter: 'audioonly' });

    sock.sendMessage(from, {
      audio: audioStream,
      mimetype: 'audio/mp4',
      ptt: false
    }, { quoted: msg });
  } catch (err) {
    console.error('Play command error:', err);
    sock.sendMessage(from, { text: '⚠️ Failed to fetch song.' }, { quoted: msg });
  }
};
