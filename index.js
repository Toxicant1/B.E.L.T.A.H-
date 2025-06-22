/**
 * BeltahBot - index.js
 * Author: Ishaq Ibrahim
 * Powered by: Beltah x Knight
 */

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');

async function startBeltahBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const Beltah = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
  });

  Beltah.ev.on('creds.update', saveCreds);

  // Example: auto-reply
  Beltah.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (text?.toLowerCase() === '.menu') {
      await Beltah.sendMessage(msg.key.remoteJid, { text: '🔥 Beltah menu is loading...' });
    }
  });
}

startBeltahBot();
