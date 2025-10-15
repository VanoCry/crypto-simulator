const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  try {
    console.log('Register request:', req.body);
    
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Все поля обязательны для заполнения' 
      });
    }

    // Проверяем существующего пользователя
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Пользователь с таким email или логином уже существует' 
      });
    }

    // Создаем пользователя
    const user = new User({
      username,
      email,
      password
    });

    await user.save();
    console.log('User created:', user._id);

    // Создаем JWT токен
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '7d' }
    );

    // Преобразуем balance Map в объект
    const balanceObj = {};
    user.balance.forEach((value, key) => {
      balanceObj[key] = value;
    });

    res.status(201).json({
      message: 'Пользователь создан',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        balance: balanceObj
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    console.log('Login request:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Находим пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    // Проверяем пароль
    const isPasswordValid = await user.correctPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '7d' }
    );

    // Преобразуем balance Map в объект
    const balanceObj = {};
    user.balance.forEach((value, key) => {
      balanceObj[key] = value;
    });

    res.json({
      message: 'Вход выполнен',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        balance: balanceObj
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

// Получение профиля
router.get('/profile', auth, async (req, res) => {
  try {
    // Преобразуем balance Map в объект
    const balanceObj = {};
    req.user.balance.forEach((value, key) => {
      balanceObj[key] = value;
    });

    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        balance: balanceObj
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;