/**
 * B.E.L.T.A.H – index.js   (Tamax-ready, single-socket edition)
 * Owner   : Ishaq Ibrahim
 * Powered : Beltah × Knight
 *
 * FEATURES -------------------------------------------------------
 *  ✓ QR / Pair-code linking (multi-device)
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

const P   = require('pino');
const fs  = require('fs');

// --------------------------------------------------
// 1️⃣  CONFIG – edit here only if you must
// --------------------------------------------------
const SESSION_FOLDER = './session';
const BOT_NUMBER_E164 = process.env.BELTAH_PHONE || '254741819582';   // keep E.164, no '+'
const LOG_LEVEL = 'silent';   // change to 'info' for verbose logs
const BROWSER_DESCRIPTION = ['BeltahBot', 'Chrome', '3.0'];          // name, agent, v

// create session dir first run
if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER);

// --------------------------------------------------
// 2️⃣  BOOTSTRAP
// --------------------------------------------------
(async () => {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: LOG_LEVEL }),
    printQRInTerminal: false,              // we prefer Pair-code flow
    auth: state,
    browser: BROWSER_DESCRIPTION,
    markOnlineOnConnect: true
  });

  // keep creds fresh
  sock.ev.on('creds.update', saveCreds);

  // ------------------------------------------------
  // 3️⃣  CONNECTION EVENTS
  // ------------------------------------------------
  let pairingTried = false;

  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect } = u;

    if (connection === 'connecting') {
      console.log('⏳ Connecting to WhatsApp …');
    }
    if (connection === 'open') {
      console.log('✅ BeltahBot is ONLINE! 🚀');
    }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const willReconnect = code !== DisconnectReason.loggedOut;
      console.log(`❌ Connection lost (code ${code}). Reconnect: ${willReconnect}`);
      if (willReconnect) return (await delay(2_000), sock.ws.close());   // triggers auto-restart via pm2/node
    }

    // first-run pair-code
    if (connection === 'connecting'
        && !sock.authState.creds.registered
        && !pairingTried) {
      pairingTried = true;
      try {
        console.log('🔑 Generating pair code …');
        const code = await sock.requestPairingCode(BOT_NUMBER_E164);
        if (code) {
          console.log(`\n📲  Pairing Code:  ${code}\n`);
          console.log('👉  WhatsApp ► Linked Devices ► Enter Code\n');
        }
      } catch (e) {
        console.error('Failed to get pair-code:', e.message);
      }
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
  // 6️⃣  COMMAND HANDLER  (very small – extend later)
  // ------------------------------------------------
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m || m.key.fromMe || m.key.remoteJid === 'status@broadcast') return;

    const from  = m.key.remoteJid;
    const text  =
      m.message?.conversation
      || m.message?.extendedTextMessage?.text
      || m.message?.imageMessage?.caption
      || ''
    ;

    const cmd = text.trim().toLowerCase();

    // show typing before heavy replies
    await sock.sendPresenceUpdate('composing', from);

    // --- ping
    if (cmd === 'ping') {
      return sock.sendMessage(from, { text: '🏓 Pong! Beltah alive 😎' });
    }

    // --- AI ask
    if (cmd.startsWith('ask ') || cmd.startsWith('beltah ')) {
      const q = text.replace(/^ask |^beltah /i, '');
      await sock.sendMessage(from, { text: '🤖 (ChatGPT placeholder) …' });

      /* Example real call:
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
