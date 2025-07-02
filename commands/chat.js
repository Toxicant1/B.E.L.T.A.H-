const askChatGPT = require('../lib/chatgpt-ai'); // Load the AI handler
const config = require('../config');
const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

const chatCommand = async (sock, msg, text) => {
  const from = msg.key.remoteJid;

  if (!text || text.trim().length < 3) {
    return await sock.sendMessage(from, { text: "❗Andika ujumbe, bro. Ex: *.chat Niaje Beltah?*" }, { quoted: msg });
  }

  if (config.typingIndicator) {
    await sock.sendPresenceUpdate('composing', from);
    await delay(500);
  }

  try {
    const aiReply = await askChatGPT(text);
    const beltahStyle = `💬 *Beltah says:*\n\n${aiReply}\n\n✨ _powered by ChatGPT_`;
    await sock.sendMessage(from, { text: beltahStyle }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(from, { text: "😓 Pole bro, ChatGPT iko down ama kuna shida ya net." }, { quoted: msg });
  }
};

module.exports = chatCommand;
