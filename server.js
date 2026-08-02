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

app.get('/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const algo = req.query.algo || 'bubbleSort';
  res.render('visualizer', { algo, roomId });
});

// Avoid app.listen during Jest test runs
if (process.env.NODE_ENV !== 'test') {
  const http = require('http');
  const socketIo = require('socket.io');
  const server = http.createServer(app);
  const io = socketIo(server);

  io.on('connection', (socket) => {
    socket.on('JOIN_ROOM', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('PLAYBACK_STEP', ({ roomId, index, isPlaying }) => {
      socket.to(roomId).emit('PLAYBACK_STEP', { index, isPlaying });
    });

    socket.on('ALGO_CHANGE', ({ roomId, algo }) => {
      socket.to(roomId).emit('ALGO_CHANGE', { algo });
    });

    socket.on('ARRAY_UPDATE', ({ roomId, array, target }) => {
      socket.to(roomId).emit('ARRAY_UPDATE', { array, target });
    });
  });

  server.listen(port, () => {
    console.log(`AlgoVisual server running on http://localhost:${port}`);
  });
}

module.exports = app;
