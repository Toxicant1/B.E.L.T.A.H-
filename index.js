/**
 * B.E.L.T.A.H – index.js   (Tamax-ready)
 * Project   : RAPHTON and BELTAH's COMP EXPERTS PROJECT
 * Owner     : Ishaq Ibrahim
 * Core Dev  : Raphton Muguna
 * Powered   : Beltah × Knight
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const P = require('pino');
const fs = require('fs');

// Load external menu handler
const menuCommand = require('./menuCommand');

// CONFIG
const SESSION_FOLDER = './session';
const OWNER_NUMBERS = ['254741819582', '254743689554']; // Ishaq & Raphton
const LOG_LEVEL = 'silent';
const BROWSER_DESCRIPTION = ['BeltahBot', 'Chrome', '3.0'];

if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER);

// BOOT
(async () => {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: LOG_LEVEL }),
    printQRInTerminal: true,
    auth: state,
    browser: BROWSER_DESCRIPTION,
    markOnlineOnConnect: true
  });

  sock.ev.on('creds.update', saveCreds);

  // CONNECTION EVENTS
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'connecting') {
      console.log('⏳ Connecting to WhatsApp …');
    }
    if (connection === 'open') {
      console.log('✅ BeltahBot is ONLINE! 🚀');
    }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const willReconnect = code !== DisconnectReason.loggedOut;
      console.log(`❌ Connection closed (code: ${code}). Reconnect: ${willReconnect}`);
      if (willReconnect) return (await delay(2000), sock.ws.close());
    }
  });

  // AUTO-VIEW STATUS
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m || m.key.remoteJid !== 'status@broadcast') return;
    try {
      await sock.readMessages([m.key]);
      console.log(`👀 Viewed status from ${m.pushName || m.key.participant}`);
    } catch (err) {
      console.error('Status-viewer error:', err);
    }
  });

  // ANTI-DELETE
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
            console.log('🛡️  Re-posted deleted message.');
          }
        } catch (err) {
          console.error('Anti-delete error:', err);
        }
      }
    }
  });

  // COMMAND HANDLER
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return;

    const from = msg.key.remoteJid;
    const senderJID = msg.participant || msg.key.participant || msg.key.remoteJid;
    const senderNumber = senderJID.split('@')[0];
    const isOwner = OWNER_NUMBERS.includes(senderNumber);

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      '';

    const cmd = text.trim().toLowerCase();
    await sock.sendPresenceUpdate('composing', from);

    // ping
    if (cmd === 'ping') {
      console.log(`📩 [PING] from ${senderNumber}`);
      return sock.sendMessage(from, { text: '🏓 Pong! Beltah is vibing 😎' });
    }

    // ask / beltah
    if (cmd.startsWith('ask ') || cmd.startsWith('beltah ')) {
      const q = text.replace(/^ask |^beltah /i, '');
      console.log(`📩 [ASK] from ${senderNumber} → ${q}`);
      await sock.sendMessage(from, { text: '🤖 (ChatGPT placeholder)…' });
      return;
    }

    // menu / help / alive
    if (cmd === '.menu' || cmd === '.help' || cmd === '.alive') {
      console.log(`📩 [MENU] ${cmd} by ${senderNumber}`);
      return menuCommand(sock, msg);
    }

    // OWNER + CORE DEV COMMANDS
    if (cmd.startsWith('.broadcast') || cmd === '.kick' || cmd === '.mute' || cmd === '.unmute') {
      if (!isOwner) {
        console.log(`🚫 [DENIED] ${cmd} by ${senderNumber}`);
        return sock.sendMessage(from, { text: '🚫 Hii command ni ya owner tu. Acha kujaribu bana.' });
      }

      // Broadcast example
      if (cmd.startsWith('.broadcast ')) {
        const broadcastText = text.replace('.broadcast ', '');
        console.log(`📢 [BROADCAST] From ${senderNumber}: ${broadcastText}`);
        await sock.sendMessage(from, { text: `📢 Broadcasting:\n\n${broadcastText}` });
        // TODO: Add actual broadcast loop here
        return;
      }

      // Placeholder for other commands
      return sock.sendMessage(from, { text: `✅ Owner command "${cmd}" received.` });
    }

    // Unknown handler (optional)
    // sock.sendMessage(from, { text: '❓ Unknown command. Try `.menu`' });
  });

})();

// delay helper
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
    }
