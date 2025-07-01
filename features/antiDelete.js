// features/antiDelete.js

const antiDelete = async (sock, update) => {
  for (const upd of update) {
    if (upd.messageStubType === 1 && upd.key.remoteJid !== 'status@broadcast') {
      try {
        const original = await sock.loadMessage(upd.key.remoteJid, upd.key.id);
        if (original?.message) {
          await sock.sendMessage(
            upd.key.remoteJid,
            {
              text: `⚠️ *Deleted message recovered:*\n`,
              forward: original
            }
          );
          console.log('🛡️ Anti-delete: Reposted a deleted message.');
        }
      } catch (err) {
        console.error('❌ Anti-delete failed:', err);
      }
    }
  }
};

module.exports = antiDelete;
