/**
 * B.E.L.T.A.H – index.js  (Render ⇄ Tamax | Final QR + Pair-Code)
 * Owner   : Ishaq Ibrahim   |   CoreDev : Raphton Muguna
 */

const PLATFORM = process.env.PLATFORM || 'render';   // 'tamax' or 'render'
const IS_TAMAX = PLATFORM === 'tamax';

console.log(`[Beltah] Booting in ${PLATFORM.toUpperCase()} mode…`);

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');        // ← NEW (for QR in Tamax)

const P    = require('pino');
const fs   = require('fs');

const config          = require('./config');
const menuCommand     = require('./commands/menu');
const autoViewStatus  = require('./features/autoViewStatus');
const antiDelete      = require('./features/antiDelete');
const askChatGPT      = require('./chatgpt');

const SESSION_FOLDER = './session';
if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER);

(async () => {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: IS_TAMAX ? 'info' : 'silent' }),
    auth: state,
    /* QR only when running locally in Tamax  */
    printQRInTerminal: IS_TAMAX,    
    browser: [config.botName, 'Chrome', '3.0'],
    markOnlineOnConnect: true
  });

  sock.ev.on('creds.update', saveCreds);

  /* ─── Extra QR handler (in case Baileys deprecates printQRInTerminal) ─── */
  sock.ev.on('connection.update', ({ qr }) => {
    if (qr && IS_TAMAX) {
      qrcode.generate(qr, { small: true });
      console.log('📸  Scan the QR above within 2 minutes');
    }
  });

  /* ─── Main connection flow (pair-code on Render) ─── */
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    const code = lastDisconnect?.error?.output?.statusCode;
    const pairTTL = 90_000;  // pair-code lifetime

    if (connection === 'connecting') console.log('⏳ Connecting…');
    if (connection === 'open') {
      console.log('✅ BeltahBot ONLINE!');
      global.__fullyConnected = true;           // stop future pairing
      return;
    }

    if (connection === 'close') {
      const again = code !== DisconnectReason.loggedOut && !global.__fullyConnected;
      console.log(`❌ Disconnected (${code}). Reconnect: ${again}`);
      if (again) return (await delay(10_000), sock.ws.close());
    }

    /* Pair-code on Render (or if QR disabled) */
    const needCode =
      connection === 'connecting' &&
      !sock.authState.creds.registered &&
      !global.__paired &&
      !IS_TAMAX &&               // pair-code only for cloud
      !global.__fullyConnected;

    if (needCode && !global.__pairTimer) {
      global.__paired = true;
      try {
        const pc = await sock.requestPairingCode(config.ownerNumber);
        console.log(`📲 Pair-code (valid 90 s): ${pc}`);
        console.log('🔗 WhatsApp ▸ Linked Devices ▸ Enter Code');
        global.__pairTimer = setTimeout(() => {
          global.__paired = false;
          global.__pairTimer = null;
        }, pairTTL);
      } catch (e) {
        console.error('❌ Pair-code error:', e.message);
      }
    }
  });

  /* ─── Features ─── */
  sock.ev.on('messages.upsert', (m) => autoViewStatus(sock, m));
  sock.ev.on('messages.update', (u) => antiDelete(sock, u));

  /* ─── Commands ─── */
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m || m.key.fromMe || m.key.remoteJid === 'status@broadcast') return;

    const from = m.key.remoteJid;
    const sender = (m.key.participant || m.key.remoteJid).split('@')[0];
    const isBoss = [config.ownerNumber, config.coreDevNumber].includes(sender);

    const body =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption || '';

    await sock.sendPresenceUpdate('recording', from);

    if (/^ping$/i.test(body))
      return sock.sendMessage(from, { text: '🏓 Pong! Beltah iko live 😎' }, { quoted: m });

    if (/^(\.menu|\.help|\.alive)$/i.test(body))
      return menuCommand(sock, m);

    if (/^(\.?(ask|beltah|chat)\s+)/i.test(body)) {
      const prompt = body.replace(/^(\.?(ask|beltah|chat)\s+)/i, '').trim();
      return sock.sendMessage(from, { text: await askChatGPT(prompt) }, { quoted: m });
    }

    if (/^\.restart$/i.test(body)) {
      if (!isBoss) return sock.sendMessage(from, { text: '🚫 Owner only.' }, { quoted: m });
      await sock.sendMessage(from, { text: '♻️ Restarting…' }, { quoted: m });
      return process.exit(0);
    }
  });
})();

/* delay helper */
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
 }
