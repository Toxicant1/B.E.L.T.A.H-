#!/usr/bin/env node

/**
 * BeltahBot - index.js
 * Author: Ishaq Ibrahim
 * Powered by: Beltah x Knight
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');

async function startBeltahBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');

  const Beltah = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ['BeltahBot', 'Termux', '1.0'],
    markOnlineOnConnect: true
  });

  // ✅ Save session
  Beltah.ev.on('creds.update', saveCreds);

  // ✅ Show QR manually (fixed for latest Baileys)
  Beltah.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      console.log('\n📲 Scan this QR Code to connect WhatsApp:\n');
      console.log(qr);
    }

    if (connection === 'open') {
      console.log('✅ B.E.L.T.A.H Bot is now connected to WhatsApp!');
    }

    if (connection === 'close') {
      const shouldReconnect = 
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log('❌ Connection closed. Reconnecting:', shouldReconnect);

      if (shouldReconnect) {
        startBeltahBot();
      } else {
        console.log('🚫 Logged out. Delete session folder and scan again.');
      }
    }
  });

  // ✅ Simple auto-reply example
  Beltah.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    if (text?.toLowerCase() === '.menu') {
      await Beltah.sendMessage(msg.key.remoteJid, { text: '🔥 BeltahBot Menu Coming Soon!' });
    }
  });
}

// Start the bot
startBeltahBot();

// ✅ Handle Termux unhandled errors
process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);
