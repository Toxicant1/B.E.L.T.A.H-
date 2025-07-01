require('dotenv').config();
const axios = require('axios');

const askChatGPT = async (prompt) => {
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

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('❌ ChatGPT error:', err?.response?.data || err.message);
    return "😔 Samahani, kuna shida na ChatGPT response.";
  }
};

module.exports = askChatGPT;
