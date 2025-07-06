// pairing.js
const baileys = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = './web-sessions';

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

async function generatePairCodeFor(number) {
  const sessionFolder = path.join(SESSIONS_DIR, number);

  const { state, saveCreds } = await baileys.useMultiFileAuthState(sessionFolder);
  const { version } = await baileys.fetchLatestBaileysVersion();

  const sock = baileys.default({
    version,
    logger: P({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: ['Beltah', 'Chrome', '3.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered) {
    const pairCode = await sock.requestPairingCode(number);
    return pairCode;
  } else {
    throw new Error('Number is already paired.');
  }
}

module.exports = { generatePairCodeFor };
