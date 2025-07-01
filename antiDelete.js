const antiDeleteHandler = async (sock, update) => {
  for (const upd of update) {
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
};

module.exports = antiDeleteHandler;
