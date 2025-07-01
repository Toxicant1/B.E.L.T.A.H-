/**
 * B.E.L.T.A.H – index.js  (Tamax / Termux ready)
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

const P  = require('pino');
const fs = require('fs');
const path = require('path');

const config        = require('./config');
const menuCommand   = require('./commands/menuCommand');
const autoViewStatus = require('./features/autoViewStatus');
const antiDelete     = require('./features/antiDelete');
const askChatGPT     = require('./chatgpt');               // real AI replies

const SESSION_FOLDER      = './session';
const LOG_LEVEL           = 'silent';
const BROWSER_DESCRIPTION = [config.botName, 'Chrome', '3.0'];

if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER);

(async () => {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: LOG_LEVEL }),
    printQRInTerminal: false,
    auth: state,
    browser: BROWSER_DESCRIPTION,
    markOnlineOnConnect: true
  });

  sock.ev.on('creds.update', saveCreds);

  /* ───────────────── CONNECTION EVENTS ───────────────── */
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    const code = lastDisconnect?.error?.output?.statusCode;

    if (connection === 'connecting') console.log('⏳ Connecting…');
    if (connection === 'open')      console.log('✅ BeltahBot ONLINE!');

    if (connection === 'close') {
      const willReconnect = code !== DisconnectReason.loggedOut;
      console.log(`❌ Connection closed (${code}). Reconnect: ${willReconnect}`);
      if (willReconnect) return (await delay(2000), sock.ws.close());
    }

    /* First-run pair-code flow */
    if (connection === 'connecting'
        && !sock.authState.creds.registered
        && !global.__paired) {
      global.__paired = true;
      try {
        const pc = await sock.requestPairingCode(config.ownerNumber);
        console.log(`📲 Pair-code: ${pc}\n🔗 WhatsApp ▸ Linked devices ▸ Enter code`);
      } catch (e) {
        console.error('Pair-code error:', e.message);
      }
    }
  });

  /* ───────────────── FEATURE HANDLERS ───────────────── */
  sock.ev.on('messages.upsert', (msg)    => autoViewStatus(sock, msg));
  sock.ev.on('messages.update', (upd)    => antiDelete(sock, upd));

  /* ───────────────── COMMAND HANDLER ───────────────── */
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

    /* typing indicator */
    if (config.typingIndicator) await sock.sendPresenceUpdate('composing', from);

    /* ----- basic commands ----- */
    if (/^ping$/i.test(body)) {
      return sock.sendMessage(from, { text: '🏓 Pong! Beltah iko live 😎' }, { quoted: m });
    }

    if (/^(\.menu|\.help|\.alive)$/i.test(body)) {
      return menuCommand(sock, m);
    }

    /* ----- AI chat commands (.ask / .beltah / .chat) ----- */
    if (/^(\.?(ask|beltah|chat)\s+)/i.test(body)) {
      const prompt = body.replace(/^(\.?(ask|beltah|chat)\s+)/i, '').trim();
      const reply  = await askChatGPT(prompt);
      return sock.sendMessage(from, { text: reply }, { quoted: m });
    }

    /* ----- owner-only placeholders ----- */
    if (/^\.restart$/i.test(body)) {
      if (!isBoss) {
        return sock.sendMessage(from, { text: '🚫 Owner-only command.' }, { quoted: m });
      }
      await sock.sendMessage(from, { text: '♻️ Restarting Beltah…' }, { quoted: m });
      return process.exit(0);                   // pm2 / nodemon will revive
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
  return new Promise((r) => setTimeout(r, ms));
      }
