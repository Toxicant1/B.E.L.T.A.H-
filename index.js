/**
 * B.E.L.T.A.H – index.js  (Tamax ⇄ Cloud dual-mode with Pair Code + Recording Presence)
 * Owner   : Ishaq Ibrahim
 * CoreDev : Raphton Muguna
 * Powered : Beltah × Knight
 */

const PLATFORM  = process.env.PLATFORM || 'tamax';   // tamax | render | talkdrove
const IS_TAMAX  = PLATFORM === 'tamax';

console.log(`[Beltah] Booting in ${PLATFORM.toUpperCase()} mode…`);

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const P   = require('pino');
const fs  = require('fs');
const config          = require('./config');
const menuCommand     = require('./commands/menu');
const autoViewStatus  = require('./features/autoViewStatus');
const antiDelete      = require('./features/antiDelete');
const askChatGPT      = require('./chatgpt');

const SESSION_FOLDER      = './session';
const LOG_LEVEL           = IS_TAMAX ? 'info' : 'silent';
const BROWSER_DESCRIPTION = [config.botName, 'Chrome', '3.0'];

if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER);

(async () => {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: LOG_LEVEL }),
    printQRInTerminal: false, // Pair Code only
    auth: state,
    browser: BROWSER_DESCRIPTION,
    markOnlineOnConnect: true
  });

  sock.ev.on('creds.update', saveCreds);

  /* ── Connection Events ── */
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    const code = lastDisconnect?.error?.output?.statusCode;

    if (connection === 'connecting') console.log('⏳ Connecting…');
    if (connection === 'open') console.log('✅ BeltahBot ONLINE!');

    if (connection === 'close') {
      const willReconnect = code !== DisconnectReason.loggedOut;
      console.log(`❌ Connection closed (${code}). Reconnect: ${willReconnect}`);
      if (willReconnect) return (await delay(2000), sock.ws.close());
    }

    // 🔐 Pair Code (used everywhere)
    if (connection === 'connecting'
      && !sock.authState.creds.registered
      && !global.__paired) {
      global.__paired = true;
      try {
        const pc = await sock.requestPairingCode(config.ownerNumber);
        console.log(`📲 Pair-code: ${pc}\n🔗 WhatsApp ▸ Linked Devices ▸ Enter Code`);
      } catch (err) {
        console.error('Pair-code error:', err.message);
      }
    }
  });

  /* ── Features ── */
  sock.ev.on('messages.upsert', (m) => autoViewStatus(sock, m));
  sock.ev.on('messages.update', (m) => antiDelete(sock, m));

  /* ── Command Handler ── */
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m || m.key.fromMe || m.key.remoteJid === 'status@broadcast') return;

    const from = m.key.remoteJid;
    const sender = (m.key.participant || m.key.remoteJid).split('@')[0];
    const isBoss = [config.ownerNumber, config.coreDevNumber].includes(sender);

    const txt =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption || '';

    const body = txt.trim();

    // 🎙 Send "recording audio" status
    if (config.typingIndicator) await sock.sendPresenceUpdate('recording', from);

    // 🔧 Commands
    if (/^ping$/i.test(body))
      return sock.sendMessage(from, { text: '🏓 Pong! Beltah iko live 😎' }, { quoted: m });

    if (/^(\.menu|\.help|\.alive)$/i.test(body))
      return menuCommand(sock, m);

    if (/^(\.?(ask|beltah|chat)\s+)/i.test(body)) {
      const prompt = body.replace(/^(\.?(ask|beltah|chat)\s+)/i, '').trim();
      const reply = await askChatGPT(prompt);
      return sock.sendMessage(from, { text: reply }, { quoted: m });
    }

    // 🔒 Admin-only
    if (/^\.restart$/i.test(body)) {
      if (!isBoss) return sock.sendMessage(from, { text: '🚫 Owner-only command.' }, { quoted: m });
      await sock.sendMessage(from, { text: '♻️ Restarting Beltah…' }, { quoted: m });
      return process.exit(0);
    }

    if (/^(\.kick|\.mute|\.unmute)/i.test(body)) {
      if (!isBoss)
        return sock.sendMessage(from, { text: '🚫 Owner-only command.' }, { quoted: m });
      return sock.sendMessage(from, { text: '🔧 Admin command placeholder.' }, { quoted: m });
    }
  });
})();

/* helper */
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
             }
