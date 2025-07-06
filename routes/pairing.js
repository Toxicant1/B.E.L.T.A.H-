const express = require('express');
const router = express.Router();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const P = require('pino');
const fs = require('fs');

const SESSION_FOLDER = './session';

// POST route: receives WhatsApp number and generates pair-code
router.post('/pair', async (req, res) => {
  const number = req.body.number?.replace(/\D/g, '');

  if (!number || number.length < 9)
    return res.status(400).send('⚠️ Invalid number. Try again.');

  try {
    if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER);

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: P({ level: 'silent' }),
      auth: state,
      browser: ['Beltah Web Pairer', 'Chrome', '3.0']
    });

    sock.ev.on('creds.update', saveCreds);

    const code = await sock.requestPairingCode(number);
    return res.send(`
      <h2>✅ Pairing Code for ${number}</h2>
      <p><strong style="font-size:1.5em;">${code}</strong></p>
      <p>🔗 Go to WhatsApp ▸ Linked Devices ▸ Enter Code</p>
    `);
  } catch (err) {
    console.error('Pairing error:', err.message);
    return res.status(500).send('❌ Failed to generate pairing code.');
  }
});

module.exports = router;
