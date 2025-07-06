/*
 * B.E.L.T.A.H – index.js (Render ⇄ Tamax Dual Mode, using Pair-Code)
 * Owner   : Ishaq Ibrahim
 * CoreDev : Raphton Muguna
 * Powered : Beltah × Knight
 */

const PLATFORM  = process.env.PLATFORM || 'render'; // 'tamax' or 'render'
const IS_TAMAX  = PLATFORM === 'tamax';

console.log(`[Beltah] Booting in ${PLATFORM.toUpperCase()} mode…`);

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const fs   = require('fs');
const path = require('path');
const P    = require('pino');

const config          = require('./config');
const menuCommand     = require('./commands/menu');
const autoViewStatus  = require('./features/autoViewStatus');
const antiDelete      = require('./features/antiDelete');
const askChatGPT      = require('./chatgpt'); // AI Chat Support

const SESSION_FOLDER      = './session';
const LOG_LEVEL           = IS_TAMAX ? 'info' : 'silent';
const BROWSER_DESCRIPTION = [config.botName, 'Chrome', '3.0'];

if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER);

(async () => {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: LOG_LEVEL }),
    printQRInTerminal: false, // disable deprecated QR
    auth: state,
    browser: BROWSER_DESCRIPTION,
    markOnlineOnConnect: true
  });

  sock.ev.on('creds.update', saveCreds);

  /* ───── CONNECTION HANDLER ───── */
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    const code = lastDisconnect?.error?.output?.statusCode;

    if (connection === 'connecting') console.log('⏳ Connecting...');
    if (connection === 'open') console.log('✅ BeltahBot ONLINE and ready!');

    if (connection === 'close') {
      const willReconnect = code !== DisconnectReason.loggedOut;
      console.log(`❌ Disconnected (${code}). Will reconnect: ${willReconnect}`);
      if (willReconnect) return (await delay(2000), sock.ws.close());
    }

    if (!sock.authState.creds.registered && !global.__paired) {
      global.__paired = true;
      try {
        const pairCode = await sock.requestPairingCode(config.ownerNumber);
        console.log(`📲 Pair-code: ${pairCode}\n🔗 WhatsApp ▸ Linked Devices ▸ Enter Code`);
      } catch (err) {
        console.error('❌ Pairing failed:', err.message);
      }
    }
  });

  /* ───── FEATURES ───── */
  sock.ev.on('messages.upsert', (msg) => autoViewStatus(sock, msg));
  sock.ev.on('messages.update', (upd) => antiDelete(sock, upd));

  /* ───── COMMAND HANDLER ───── */
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

    // 👇 Recording indicator instead of typing
    await sock.sendPresenceUpdate('recording', from);

    // 🔹 Basic command: .ping
    if (/^ping$/i.test(body))
      return sock.sendMessage(from, { text: '🏓 Pong! Beltah iko live 😎' }, { quoted: m });

    // 🔹 Menu command
    if (/^(\.menu|\.help|\.alive)$/i.test(body))
      return menuCommand(sock, m);

    // 🔹 AI chat commands
    if (/^(\.?(ask|beltah|chat)\s+)/i.test(body)) {
      const prompt = body.replace(/^(\.?(ask|beltah|chat)\s+)/i, '').trim();
      const reply  = await askChatGPT(prompt);
      return sock.sendMessage(from, { text: reply }, { quoted: m });
    }

    // 🔹 Owner-only restart
    if (/^\.restart$/i.test(body)) {
      if (!isBoss) return sock.sendMessage(from, { text: '🚫 Owner-only command.' }, { quoted: m });
      await sock.sendMessage(from, { text: '♻️ Restarting Beltah…' }, { quoted: m });
      return process.exit(0);
    }

    // 🔹 Admin command placeholder
    if (/^(\.kick|\.mute|\.unmute)/i.test(body)) {
      if (!isBoss) return sock.sendMessage(from, { text: '🚫 Admin-only command.' }, { quoted: m });
      return sock.sendMessage(from, { text: '🛠 Admin tools coming soon…' }, { quoted: m });
    }
  });
})();

/* 🔁 Delay Helper */
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
    }
