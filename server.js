// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { generatePairCodeFor } = require('./pairing'); // We’ll create this next

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

// Home page with form
app.get('/', (req, res) => {
  res.render('index');
});

// POST: /pair
app.post('/pair', async (req, res) => {
  const number = req.body.number?.trim();

  if (!number) return res.send('⚠️ Please enter a valid number.');

  try {
    const code = await generatePairCodeFor(number);
    res.send(`
      ✅ Pairing Code for ${number}: <strong>${code}</strong><br><br>
      🔗 Open WhatsApp → Linked Devices → Enter Code
    `);
  } catch (err) {
    res.send('❌ Error: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`[Beltah UI] Running on http://localhost:${PORT}`);
});
