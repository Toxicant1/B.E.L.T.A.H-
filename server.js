const express = require('express');
const bodyParser = require('body-parser');
const { generatePairCodeFor } = require('./pairing');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/pair', (req, res) => {
  res.render('pair', { result: null });
});

app.post('/pair', async (req, res) => {
  const number = req.body.number;
  try {
    const result = await generatePairCodeFor(number);
    res.render('pair', { result });
  } catch (err) {
    res.render('pair', { result: { type: 'error', value: err.message } });
  }
});

app.listen(port, () => {
  console.log(`🌐 Beltah Pair UI running: http://localhost:${port}`);
});
