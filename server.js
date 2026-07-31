const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('dashboard');
});

app.get('/visualizer', (req, res) => {
  const { algo } = req.query;
  res.render('visualizer', { algo: algo || 'bubbleSort' });
});

app.get('/compare', (req, res) => {
  const algoA = req.query.algoA || 'bubbleSort';
  const algoB = req.query.algoB || 'selectionSort';
  res.render('compare', { algoA, algoB });
});

app.get('/dual', (req, res) => {
  const algoA = req.query.algoA || 'bubbleSort';
  const algoB = req.query.algoB || 'insertionSort';
  res.render('dual', { algoA, algoB });
});

app.get('/race', (req, res) => {
  const algo1 = req.query.algo1 || 'bubbleSort';
  const algo2 = req.query.algo2 || 'selectionSort';
  const algo3 = req.query.algo3 || 'insertionSort';
  const algo4 = req.query.algo4 || 'quickSort';
  res.render('race', { algo1, algo2, algo3, algo4 });
});

// Avoid app.listen during Jest test runs
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`AlgoVisual server running on http://localhost:${port}`);
  });
}

module.exports = app;
