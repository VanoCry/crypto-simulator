let currentToken = localStorage.getItem('cryptoToken');
let currentUser = null;
let socket = null;
let currentPrices = {};

// Инициализация дашборда
document.addEventListener('DOMContentLoaded', function() {
    if (!currentToken) {
        window.location.href = '/';
        return;
    }
    
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        // Проверяем авторизацию
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Not authorized');
        }

        const data = await response.json();
        currentUser = data.user;
        
        // Обновляем интерфейс
        updateUserInfo();
        
        // Подключаем WebSocket
        initializeWebSocket();
        
        // Загружаем начальные цены
        loadInitialPrices();
        
    } catch (error) {
        console.error('Dashboard init error:', error);
        window.location.href = '/';
    }
}

function updateUserInfo() {
    document.getElementById('user-greeting').textContent = `Welcome, ${currentUser.username}!`;
    document.getElementById('balance-usd').textContent = currentUser.balance?.USD?.toFixed(2) || '0.00';
    document.getElementById('balance-btc').textContent = currentUser.balance?.BTC?.toFixed(6) || '0.000000';
    document.getElementById('balance-eth').textContent = currentUser.balance?.ETH?.toFixed(6) || '0.000000';
}

function initializeWebSocket() {
    socket = io();
    
    socket.on('cryptoPrices', (prices) => {
        currentPrices = prices;
        updateMarketPrices(prices);
        updateTradeForm();
    });
    
    socket.on('connect', () => {
        console.log('WebSocket connected');
    });
    
    socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
    });
}

async function loadInitialPrices() {
    try {
        const response = await fetch('/api/crypto/prices');
        const prices = await response.json();
        currentPrices = prices;
        updateMarketPrices(prices);
        updateTradeForm();
    } catch (error) {
        console.error('Error loading prices:', error);
    }
}

function updateMarketPrices(prices) {
    const marketGrid = document.getElementById('market-grid');
    marketGrid.innerHTML = '';

    Object.values(prices).forEach(crypto => {
        const changeClass = crypto.change24h >= 0 ? 'change-positive' : 'change-negative';
        const changeIcon = crypto.change24h >= 0 ? '↗' : '↘';
        
        const cryptoCard = document.createElement('div');
        cryptoCard.className = `crypto-card ${crypto.change24h < 0 ? 'negative' : ''}`;
        cryptoCard.innerHTML = `
            <div class="crypto-header">
                <span class="crypto-symbol">${crypto.symbol}</span>
                <span class="crypto-price">$${crypto.price.toLocaleString()}</span>
            </div>
            <div class="crypto-change ${changeClass}">
                ${changeIcon} ${Math.abs(crypto.change24h).toFixed(2)}%
            </div>
        `;
        
        marketGrid.appendChild(cryptoCard);
    });
}

function updateTradeForm() {
    const currency = document.getElementById('trade-currency').value;
    const priceInput = document.getElementById('trade-price');
    const amountInput = document.getElementById('trade-amount');
    
    if (currentPrices[currency]) {
        priceInput.value = currentPrices[currency].price.toFixed(2);
        calculateTotal();
    }
}

function calculateTotal() {
    const amount = parseFloat(document.getElementById('trade-amount').value) || 0;
    const price = parseFloat(document.getElementById('trade-price').value) || 0;
    const total = amount * price;
    
    document.getElementById('trade-total').value = total.toFixed(2);
}

// Слушатели событий
document.getElementById('trade-currency').addEventListener('change', updateTradeForm);
document.getElementById('trade-amount').addEventListener('input', calculateTotal);

function executeTrade() {
    alert('Торговая система в разработке!');
    // Здесь будет логика покупки/продажи
}

function logout() {
    localStorage.removeItem('cryptoToken');
    window.location.href = '/';
}