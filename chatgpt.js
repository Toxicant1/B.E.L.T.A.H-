// chatgpt.js
const axios = require('axios');

// Pull API key securely from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function askChatGPT(prompt) {
  try {
    const res = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',  // or change to 'gpt-4' if needed
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('❌ ChatGPT error:', err.response?.data || err.message);
    return '😕 ChatGPT failed to respond. Check API key or try again later.';
  }
}

module.exports = askChatGPT;
