const axios = require('axios');

// Direct API key embedded temporarily (replace later with .env or Render variable)
const OPENAI_API_KEY = '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';

const askChatGPT = async (prompt) => {
  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('🧠 ChatGPT Error:', err.response?.data || err.message);
    return '⚠️ Beltah AI failed to respond, bro. Jaribu tena baadaye.';
  }
};

module.exports = askChatGPT;
