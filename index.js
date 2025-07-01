/**
 * B.E.L.T.A.H – index.js (Tamax-ready, multi-user)
 * Owner   : Ishaq Ibrahim
 * CoreDev : Raphton Muguna
 * Powered : Beltah × Knight
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const P = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const menuCommand = require('./commands/menuCommand');

const SESSION_FOLDER = './session';
const LOG_LEVEL = 'silent';
const BROWSER_DESCRIPTION = [config.botName, 'Chrome', '3.0'];

// Create session dir
if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER);

(async () => {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: LOG_LEVEL }),
    printQRInTerminal: false,
    auth: state,
    browser: BROWSER_DESCRIPTION,
    markOnlineOnConnect: true
  });

  sock.ev.on('creds.update', saveCreds);

  // 🔁 Auto reconnect + pair code
  let pairingTried = false;

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    const code = lastDisconnect?.error?.output?.statusCode;
    if (connection === 'connecting') {
      console.log('⏳ Connecting to WhatsApp...');
    }
    if (connection === 'open') {
      console.log('✅ BeltahBot is ONLINE and ready!');
    }
    if (connection === 'close') {
      const willReconnect = code !== DisconnectReason.loggedOut;
      console.log(`❌ Disconnected (code ${code}) | Reconnect: ${willReconnect}`);
      if (willReconnect) return (await delay(2_000), sock.ws.close());
    }

    if (connection === 'connecting'
        && !sock.authState.creds.registered
        && !pairingTried) {
      pairingTried = true;
      try {
        const code = await sock.requestPairingCode(config.ownerNumber);
        if (code) {
          console.log(`📲 Pairing Code: ${code}`);
          console.log('🔗 WhatsApp ► Linked Devices ► Enter Code');
        }
      } catch (err) {
        console.error('⚠️ Pair-code failed:', err.message);
      }
    }
  });

  // 👁️ Auto-view status
  if (config.autoViewStatus) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
      const m = messages[0];
      if (!m || m.key.remoteJid !== 'status@broadcast') return;
      try {
        await sock.readMessages([m.key]);
        console.log(`👀 Viewed status from ${m.pushName || m.key.participant}`);
      } catch (err) {
        console.error('Status-view error:', err);
      }
    });
  }

  // 🛡️ Anti-delete
  if (config.antiDelete) {
    sock.ev.on('messages.update', async (updates) => {
      for (const upd of updates) {
        if (upd.messageStubType === 1 && upd.key.remoteJid !== 'status@broadcast') {
          try {
            const original = await sock.loadMessage(upd.key.remoteJid, upd.key.id);
            if (original?.message) {
              await sock.sendMessage(
                upd.key.remoteJid,
                { forward: original, text: '⚠️ *Deleted message recovered:*' }
              );
              console.log('🔁 Re-posted deleted message.');
            }
          } catch (err) {
            console.error('Anti-delete error:', err);
          }
        }
      }
    });
  }

  // 🎯 COMMANDS
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m || m.key.fromMe || m.key.remoteJid === 'status@broadcast') return;

    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const senderNum = sender.split('@')[0];
    const isOwnerOrDev = [config.ownerNumber, config.coreDevNumber].includes(senderNum);

    const text = m.message?.conversation ||
                 m.message?.extendedTextMessage?.text ||
                 m.message?.imageMessage?.caption || '';

    const body = text.trim().toLowerCase();

    // Show typing indicator if enabled
    if (config.typingIndicator) {
      await sock.sendPresenceUpdate('composing', from);
    }

    // 🏓 Ping
    if (body === 'ping') {
      return sock.sendMessage(from, { text: '🏓 Pong! Beltah is online 😎' }, { quoted: m });
    }

    // 💬 AI placeholder
    if (body.startsWith('ask ') || body.startsWith('beltah ')) {
      const q = body.replace(/^ask |^beltah /i, '');
      await sock.sendMessage(from, { text: '🤖 (ChatGPT response coming soon...)' }, { quoted: m });
    }

    // 📋 Menu command triggers
    if (['.menu', '.help', '.alive'].includes(body)) {
      return await menuCommand(sock, m);
    }

    // 🔒 Owner-only placeholder
    if (body.startsWith('.kick') || body.startsWith('.mute')) {
      if (!isOwnerOrDev) {
        return sock.sendMessage(from, { text: '🚫 This command is owner-only.' }, { quoted: m });
      }

      return sock.sendMessage(from, { text: '🔧 Admin command acknowledged (placeholder).' }, { quoted: m });
    }
  });

})();

// Helper: delay
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
                                            }
