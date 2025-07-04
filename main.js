// main.js — BeltahBot-MD
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const fs = require('fs');
const path = require('path');

// 🧠 AI Stack (Placeholder Imports)
// const gminaeAI = require('./ai/gminae');
// const crewDrewImage = require('./ai/crewdrew');
// const chatGPT = require('./ai/chatgpt');

async function startBeltahBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');

  const { version } = await fetchLatestBaileysVersion();
  const Beltah = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    auth: state,
    printQRInTerminal: true,
    browser: ['BeltahBot', 'Safari', '3.0'],
    markOnlineOnConnect: true
  });

  Beltah.ev.on('creds.update', saveCreds);

  // 🔁 Auto-reconnect
  Beltah.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('⚠️ Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startBeltahBot();
    } else if (connection === 'open') {
      console.log('✅ BeltahBot is online and ready!');
    }
  });

  // 👀 Auto View Status
  Beltah.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg || msg.key.remoteJid !== 'status@broadcast') return;
      await Beltah.readMessages([msg.key]);
      console.log(`👀 Viewed status from ${msg.pushName || msg.key.participant}`);
    } catch (err) {
      console.error('❌ Failed to view status:', err);
    }
  });

  // 🛡️ Anti-delete — restore deleted messages
  Beltah.ev.on('messages.update', async (updates) => {
    for (const update of updates) {
      if (update.messageStubType === 1 && update.key?.remoteJid !== 'status@broadcast') {
        try {
          const original = await Beltah.loadMessage(update.key.remoteJid, update.key.id);
          if (original?.message) {
            await Beltah.sendMessage(update.key.remoteJid, {
              text: `⚠️ *Message deleted!* Reposting:\n`,
              forward: original
            });
            console.log(`🛡️ Recovered deleted message in ${update.key.remoteJid}`);
          }
        } catch (err) {
          console.error('❌ Anti-delete error:', err);
        }
      }
    }
  });

  // 💬 Basic Command Handler
  Beltah.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      '';

    const sender = msg.key.participant || msg.key.remoteJid;
    const command = text.trim().toLowerCase();

    // Typing indicator before replying
    await Beltah.sendPresenceUpdate('composing', from);

    if (command === 'ping') {
      await Beltah.sendMessage(from, { text: '🏓 Pong! BeltahBot is online 😎' });
    }

    // AI command placeholder
    else if (command.startsWith('ask ') || command.startsWith('beltah ')) {
      const query = command.replace(/^ask |^beltah /i, '');
      await Beltah.sendMessage(from, {
        text: `🤖 ChatGPT replying... (placeholder)\nYour message: "${query}"`
      });

      // Example:
      // const reply = await chatGPT(query);
      // await Beltah.sendMessage(from, { text: reply });
    }
  });
}

module.exports = { startBeltahBot };
