const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Импорты
const authRoutes = require('./routes/auth');
const cryptoService = require('./services/cryptoService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-exchange', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('✅ Connected to MongoDB');
});

// Роуты
app.use('/api/auth', authRoutes);

// Новый роут для получения цен
app.get('/api/crypto/prices', async (req, res) => {
  try {
    const prices = await cryptoService.getCachedPrices();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Статические файлы
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Dashboard страница
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running!', version: '1.0.0' });
});

// WebSocket для real-time данных
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Отправляем цены при подключении
  cryptoService.getCachedPrices().then(prices => {
    socket.emit('cryptoPrices', prices);
  });

  // Обновляем цены каждые 10 секунд
  const interval = setInterval(async () => {
    const prices = await cryptoService.getCachedPrices();
    socket.emit('cryptoPrices', prices);
  }, 10000);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    clearInterval(interval);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 Открой http://localhost:${PORT}`);
});