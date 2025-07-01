module.exports = {
  // ⚙️ Bot Identity
  botName: 'B.E.L.T.A.H',
  ownerName: 'Ishaq Ibrahim',
  ownerNumber: '254741819582',      // Keep this without '+'

  // 👨‍💻 Core Developer
  coreDevName: 'Raphton Muguna',
  coreDevNumber: '254743689554',

  // 🌍 Language control
  language: 'en', // 'auto', 'en', 'sw' (use 'en' for full compatibility with language.js)

  // 🛠️ Command prefixes
  prefix: ['.', '/'],

  // 👥 Public mode
  public: true, // true = anyone can use; false = only owner/core-dev

  // 👁️ Auto features
  autoViewStatus: true,     // Auto view statuses
  antiDelete: true,         // Repost deleted messages
  typingIndicator: true,    // Show "typing..." feedback

  // 🤖 AI Control
  aiEnabled: true,          // Enable AI replies
  aiEngine: 'chatgpt',      // Options: 'chatgpt', 'gminae', 'crewdrew'

  // 🖼️ Menu UI style
  menuStyle: 'image',       // 'image' = use menu banner image, 'text' = simple text

  // 🚫 Access & behavior
  blockUnauthorizedUsers: false, // If true, only owner/core-dev can run commands
  allowPrivateChat: true,        // Enable bot in private messages
  allowGroupChat: true,          // Enable bot in group chats

  // 📦 Branding
  footer: '🔖 Powered by Beltah × Knight',
  repo: 'https://github.com/Toxicant1/BeltahBot-MD',

  // 🧠 Developer extras
  debugMode: false,
  developerMode: false
};
