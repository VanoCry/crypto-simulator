let currentToken = localStorage.getItem('cryptoToken');
let currentUser = null;

// Проверяем авторизацию при загрузке
document.addEventListener('DOMContentLoaded', function() {
    if (currentToken) {
        checkAuth();
    } else {
        showLogin();
    }
});

// Показать форму входа
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('user-panel').classList.add('hidden');
    hideMessage();
    
    // Очищаем поля
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
}

// Показать форму регистрации
function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('user-panel').classList.add('hidden');
    hideMessage();
    
    // Очищаем поля
    document.getElementById('register-username').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
}

// Показать панель пользователя
function showUserPanel() {
    // ✅ СРАЗУ ПЕРЕХОДИМ НА ДАШБОРД
    window.location.href = '/dashboard';
}

// Показать сообщение
function showMessage(text, type = 'error') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = type === 'error' ? 'error-message' : 'success-message';
    messageEl.classList.remove('hidden');
    
    // Автоматически скрываем успешные сообщения через 3 секунды
    if (type === 'success') {
        setTimeout(hideMessage, 3000);
    }
}

// Скрыть сообщение
function hideMessage() {
    document.getElementById('message').classList.add('hidden');
}

// Регистрация
async function register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (!username || !email || !password) {
        showMessage('Заполните все поля');
        return;
    }

    if (password.length < 6) {
        showMessage('Пароль должен быть не менее 6 символов');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('cryptoToken', data.token);
            currentToken = data.token;
            currentUser = data.user;
            showUserPanel();
            showMessage('Аккаунт успешно создан!', 'success');
        } else {
            showMessage(data.error || 'Ошибка регистрации');
        }
    } catch (error) {
        showMessage('Ошибка сети: ' + error.message);
    }
}

// Вход
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showMessage('Заполните все поля');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('cryptoToken', data.token);
            currentToken = data.token;
            currentUser = data.user;
            showUserPanel();
            showMessage('Вход выполнен!', 'success');
        } else {
            showMessage(data.error || 'Ошибка входа');
        }
    } catch (error) {
        showMessage('Ошибка сети: ' + error.message);
    }
}

// Проверка авторизации
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showUserPanel();
        } else {
            localStorage.removeItem('cryptoToken');
            showLogin();
            showMessage('Сессия истекла, войдите снова');
        }
    } catch (error) {
        localStorage.removeItem('cryptoToken');
        showLogin();
        showMessage('Ошибка сети, войдите снова');
    }
}

// Выход
function logout() {
    localStorage.removeItem('cryptoToken');
    currentToken = null;
    currentUser = null;
    showLogin();
    showMessage('Вы вышли из системы', 'success');
}