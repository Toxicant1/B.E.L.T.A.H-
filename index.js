/**
 * B.E.L.T.A.H - index.js
 * Owner: Ishaq Ibrahim
 * Powered by: Beltah x Knight
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const fs = require('fs');

const SESSION_FOLDER = './session';
if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER);

const startBeltahBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    // MODIFIED: Using a different browser agent for better compatibility
    browser: ['Chrome', 'Windows', '1.0.0'],
  });

  let pairingTried = false;

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'connecting') {
      console.log('⏳ Connecting to WhatsApp...');
    }

    if (connection === 'open') {
      console.log('✅ B.E.L.T.A.H connected successfully!');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`❌ Connection closed (code: ${statusCode}). Reconnect: ${shouldReconnect}`);
      if (shouldReconnect) startBeltahBot();
    }

    // MODIFIED: This block attempts to generate a pairing code if the bot is not registered.
    if (connection === 'connecting' && !sock.authState.creds.registered && !pairingTried) {
        pairingTried = true;
        try {
            console.log('⏳ Attempting to generate pairing code...');
            const phoneNumber = '254741819582'; // Your phone number
            // Request the pairing code from WhatsApp
            const code = await sock.requestPairingCode(phoneNumber);
            if (code) {
                console.log(`\n📲 Pairing Code: ${code}\n`);
                console.log('👉 Go to WhatsApp > Linked Devices > Use Pairing Code to link this device.\n');
            } else {
                console.error('❌ Failed to generate pairing code: Code is null or undefined.');
            }
        } catch (err) {
            console.error('❌ Failed to generate pairing code:', err.message);
        }
    }
  });

  sock.ev.on('creds.update', saveCreds);
};

startBeltahBot();
