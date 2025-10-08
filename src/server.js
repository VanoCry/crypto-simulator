const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Подключение к mongoDB

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-simulator',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// База данных
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', ()=> {
    console.log('Connected to MongoDB');
});

// Простые роуты для проверки
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/status', (req,res) => {
    res.json({status: 'Server is running!', version: '1.0.0'});
});


//WebSocket для real-time данных
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server running on port ${PORT}');
});
