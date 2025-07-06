/**
 * B.E.L.T.A.H – index.js (Render ⇄ Tamax | Final Stable Release)
 * Owner   : Ishaq Ibrahim
 * CoreDev : Raphton Muguna
 * Powered : Beltah × Knight
 */

const PLATFORM = process.env.PLATFORM || 'render'; // 'tamax' or 'render'
const IS_TAMAX = PLATFORM === 'tamax';

console.log(`[Beltah] Booting in ${PLATFORM.toUpperCase()} mode…`);

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const P    = require('pino');
const fs   = require('fs');
const path = require('path');

const config          = require('./config');
const menuCommand     = require('./commands/menu');
const autoViewStatus  = require('./features/autoViewStatus');
const antiDelete      = require('./features/antiDelete');
const askChatGPT      = require('./chatgpt'); // Beltah AI

const SESSION_FOLDER = './session';
const LOG_LEVEL = IS_TAMAX ? 'info' : 'silent';
const BROWSER_DESCRIPTION = [config.botName, 'Chrome', '3.0'];

if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER);

(async () => {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: LOG_LEVEL }),
    auth: state,
    printQRInTerminal: false, // handled manually
    browser: BROWSER_DESCRIPTION,
    markOnlineOnConnect: true
  });

  sock.ev.on('creds.update', saveCreds);

  /* ─── Connection Logic ─── */
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    const code = lastDisconnect?.error?.output?.statusCode;
    const pairTTL = 90000; // 90 seconds

    if (connection === 'connecting') console.log('⏳ Connecting...');
    if (connection === 'open') {
      console.log('✅ BeltahBot ONLINE and ready!');
      global.__fullyConnected = true;
      return;
    }

    if (connection === 'close') {
      const willReconnect = code !== DisconnectReason.loggedOut && !global.__fullyConnected;
      console.log(`❌ Disconnected (${code}). Reconnect: ${willReconnect}`);
      if (willReconnect) return (await delay(10000), sock.ws.close()); // wait 10s
    }

    // 🔐 First-time Pairing Only
    const shouldPair =
      connection === 'connecting' &&
      !sock.authState.creds.registered &&
      !global.__paired &&
      !global.__fullyConnected;

    if (shouldPair && !global.__pairTimer) {
      global.__paired = true;
      try {
        const pc = await sock.requestPairingCode(config.ownerNumber);
        console.log(`📲 Pair-code (valid ~90s): ${pc}`);
        console.log('🔗 WhatsApp → Linked Devices → Enter Code');

        global.__pairTimer = setTimeout(() => {
          global.__paired = false;
          global.__pairTimer = null;
        }, pairTTL);
      } catch (err) {
        console.error('❌ Pairing failed:', err.message);
      }
    }
  });

  /* ─── Features ─── */
  sock.ev.on('messages.upsert', (msg) => autoViewStatus(sock, msg));
  sock.ev.on('messages.update', (upd) => antiDelete(sock, upd));

  /* ─── Command Handler ─── */
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m || m.key.fromMe || m.key.remoteJid === 'status@broadcast') return;

    const from   = m.key.remoteJid;
    const sender = (m.key.participant || m.key.remoteJid).split('@')[0];
    const isBoss = [config.ownerNumber, config.coreDevNumber].includes(sender);

    const txt =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption || '';

    const body = txt.trim();

    // 🟢 Show "recording…" instead of typing
    await sock.sendPresenceUpdate('recording', from);

    // 🔹 Basic Commands
    if (/^ping$/i.test(body))
      return sock.sendMessage(from, { text: '🏓 Pong! Beltah iko live 😎' }, { quoted: m });

    if (/^(\.menu|\.help|\.alive)$/i.test(body))
      return menuCommand(sock, m);

    // 🔹 ChatGPT AI Commands
    if (/^(\.?(ask|beltah|chat)\s+)/i.test(body)) {
      const prompt = body.replace(/^(\.?(ask|beltah|chat)\s+)/i, '').trim();
      const reply = await askChatGPT(prompt);
      return sock.sendMessage(from, { text: reply }, { quoted: m });
    }

    // 🔹 Restart Command
    if (/^\.restart$/i.test(body)) {
      if (!isBoss)
        return sock.sendMessage(from, { text: '🚫 Owner-only command.' }, { quoted: m });

      await sock.sendMessage(from, { text: '♻️ Restarting Beltah…' }, { quoted: m });
      return process.exit(0);
    }

    // 🔹 Placeholder for Admin Commands
    if (/^(\.kick|\.mute|\.unmute)/i.test(body)) {
      if (!isBoss)
        return sock.sendMessage(from, { text: '🚫 Admin-only command.' }, { quoted: m });

      return sock.sendMessage(from, { text: '🛠 Admin tools coming soon…' }, { quoted: m });
    }
  });
})();

/* Utility delay */
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
      }
