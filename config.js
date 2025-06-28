// config.js

module.exports = {
  // ⚙️ Bot Identity
  botName: 'B.E.L.T.A.H',
  ownerName: 'Ishaq Ibrahim',
  ownerNumber: '+254741819582',

  // 🌍 Language control
  language: 'auto', // 'auto', 'en', 'sw'

  // 🛠️ Prefixes for commands
  prefix: ['.', '/'],

  // 👥 Public mode
  public: true, // true = anyone can use, false = only owner

  // 👁️ Auto features
  autoViewStatus: true,     // View WhatsApp statuses automatically
  antiDelete: true,         // Repost deleted messages
  typingIndicator: true,    // Show "typing..." when processing

  // 🤖 AI Control
  aiEnabled: true,          // Enable AI chatbot replies
  aiEngine: 'chatgpt',      // Options: 'chatgpt', 'gminae', 'crewdrew'

  // 🖼️ Menu UI
  menuStyle: 'image',       // 'image' = stylish visual menu, 'text' = normal

  // 🚫 Access & protection
  blockUnauthorizedUsers: false, // true = deny non-owner commands
  allowPrivateChat: true,        // Enable bot in private DMs
  allowGroupChat: true,          // Enable bot in groups

  // 📦 Branding
  footer: 'Powered by Beltah x Knight',
  repo: 'https://github.com/Toxicant1/BeltahBot-MD',

  // 🧠 Developer extras (for future upgrades)
  debugMode: false,
  developerMode: false
};
