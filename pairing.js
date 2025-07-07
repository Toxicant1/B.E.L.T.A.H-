const baileys = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

const SESS_DIR = './web-sessions';
if (!fs.existsSync(SESS_DIR)) fs.mkdirSync(SESS_DIR);

async function generatePairCodeFor(number) {
  const clean = number.replace(/\D/g, '');
  const userDir = path.join(SESS_DIR, clean);
  const { state, saveCreds } = await baileys.useMultiFileAuthState(userDir);
  const { version } = await baileys.fetchLatestBaileysVersion();

  const sock = baileys.default({
    version,
    logger: P({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: ['Beltah-UI', 'Chrome', '3.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  return new Promise((resolve, reject) => {
    sock.ev.on('connection.update', (u) => {
      const { connection, pairingCode, qr, lastDisconnect } = u;

      if (pairingCode) return resolve({ type: 'code', value: pairingCode });
      if (qr) return resolve({ type: 'qr', value: qr });

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown';
        reject(new Error('Connection closed: ' + reason));
      }
    });
  });
}

module.exports = { generatePairCodeFor };
