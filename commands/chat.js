const axios = require('axios');
require('dotenv').config();

const chatCommand = async (sock, msg, prompt) => {
  const from = msg.key.remoteJid;

  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = res.data.choices[0].message.content.trim();

    await sock.sendMessage(from, {
      text: `🧠 *BeltahBot says:*\n\n${reply}`
    }, { quoted: msg });
  } catch (err) {
    console.error('❌ ChatGPT Error:', err?.response?.data || err.message);
    await sock.sendMessage(from, {
      text: '😔 Pole boss, kuna shida na ChatGPT response. Jaribu tena baadaye.'
    }, { quoted: msg });
  }
};

module.exports = chatCommand;
