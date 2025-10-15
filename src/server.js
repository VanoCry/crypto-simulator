const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Импорты роутов
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Подключение к MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-exchange';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// База данных
const db = mongoose.connection;
db.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});
db.once('open', () => {
  console.log('✅ Connected to MongoDB');
});

// Роуты
app.use('/api/auth', authRoutes);

// Статические файлы
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Статус сервера
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    version: '1.0.0',
    database: db.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// WebSocket для real-time данных
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 Открой http://localhost:${PORT}`);
  console.log(`🗄️  MongoDB: ${MONGODB_URI}`);
});