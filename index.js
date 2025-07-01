/**
 * B.E.L.T.A.H – index.js   (Tamax-ready, multi-user edition)
 * Project  : RAPHTON and BELTAH's COMP EXPERTS PROJECT
 * Owner    : Ishaq Ibrahim (Beltah)
 * Co-Dev   : Raphton Muguna
 * Powered  : Beltah × Knight
 *
 * FEATURES -------------------------------------------------------
 *  ✓ QR linking (multi-device, unrestricted)
 *  ✓ Auto-reconnect
 *  ✓ Auto-view status updates
 *  ✓ Anti-delete (repost deleted messages)
 *  ✓ Basic command handler  (ping, ask <text>)
 *  ✓ AI hook (Gminae → CrewDrew → ChatGPT) – placeholder
 * ---------------------------------------------------------------
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const P  = require('pino');
const fs = require('fs');

// --------------------------------------------------
// 1️⃣  CONFIG
// --------------------------------------------------
const SESSION_FOLDER      = './session';
const LOG_LEVEL           = 'silent';                 // 'info' for verbose
const BROWSER_DESCRIPTION = ['BeltahBot', 'Chrome', '3.0'];

// create session dir if not exist
if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER);

// --------------------------------------------------
// 2️⃣  BOOTSTRAP SOCKET
// --------------------------------------------------
(async () => {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: LOG_LEVEL }),
    printQRInTerminal: true,          // Show QR code for all users
    auth: state,
    browser: BROWSER_DESCRIPTION,
    markOnlineOnConnect: true
  });

  // keep session saved
  sock.ev.on('creds.update', saveCreds);

  // ------------------------------------------------
  // 3️⃣  CONNECTION EVENTS
  // ------------------------------------------------
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

  // ------------------------------------------------
  // 4️⃣  AUTO-VIEW STATUS
  // ------------------------------------------------
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

  // ------------------------------------------------
  // 5️⃣  ANTI-DELETE
  // ------------------------------------------------
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

  // ------------------------------------------------
  // 6️⃣  COMMAND HANDLER
  // ------------------------------------------------
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m || m.key.fromMe || m.key.remoteJid === 'status@broadcast') return;

    const from = m.key.remoteJid;
    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      '';

    const cmd = text.trim().toLowerCase();

    // show typing indicator
    await sock.sendPresenceUpdate('composing', from);

    // --- ping
    if (cmd === 'ping') {
      return sock.sendMessage(from, { text: '🏓 Pong! Beltah alive 😎' });
    }

    // --- AI placeholder
    if (cmd.startsWith('ask ') || cmd.startsWith('beltah ')) {
      const q = text.replace(/^ask |^beltah /i, '');
      await sock.sendMessage(from, { text: '🤖 (ChatGPT placeholder) …' });

      /*
      // In future:
      const answer = await chatgpt(q);
      return sock.sendMessage(from, { text: answer });
      */
    }
  });

})();

// --------------------------------------------------
// helper
// --------------------------------------------------
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
             }
