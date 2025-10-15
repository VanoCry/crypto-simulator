const axios = require('axios');

class CryptoService {
  constructor() {
    this.cache = new Map();
    this.cacheTime = 30000; // 30 секунд кэш
  }

  // Получаем данные с CoinGecko API (бесплатно)
  async getCryptoPrices() {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,ripple,cardano,solana&vs_currencies=usd&include_24hr_change=true'
      );
      
      const data = response.data;
      
      return {
        BTC: {
          price: data.bitcoin.usd,
          change24h: data.bitcoin.usd_24h_change,
          symbol: 'BTC'
        },
        ETH: {
          price: data.ethereum.usd,
          change24h: data.ethereum.usd_24h_change,
          symbol: 'ETH'
        },
        BNB: {
          price: data.binancecoin.usd,
          change24h: data.binancecoin.usd_24h_change,
          symbol: 'BNB'
        },
        XRP: {
          price: data.ripple.usd,
          change24h: data.ripple.usd_24h_change,
          symbol: 'XRP'
        },
        ADA: {
          price: data.cardano.usd,
          change24h: data.cardano.usd_24h_change,
          symbol: 'ADA'
        },
        SOL: {
          price: data.solana.usd,
          change24h: data.solana.usd_24h_change,
          symbol: 'SOL'
        }
      };
      
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      
      // Fallback данные если API не работает
      return {
        BTC: { price: 45000, change24h: 2.5, symbol: 'BTC' },
        ETH: { price: 2500, change24h: 1.8, symbol: 'ETH' },
        BNB: { price: 320, change24h: 0.5, symbol: 'BNB' },
        XRP: { price: 0.55, change24h: -0.3, symbol: 'XRP' },
        ADA: { price: 0.48, change24h: 1.2, symbol: 'ADA' },
        SOL: { price: 95, change24h: 3.1, symbol: 'SOL' }
      };
    }
  }

  // Кэшируем запросы чтобы не спамить API
  async getCachedPrices() {
    const now = Date.now();
    const cached = this.cache.get('prices');
    
    if (cached && (now - cached.timestamp) < this.cacheTime) {
      return cached.data;
    }
    
    const prices = await this.getCryptoPrices();
    this.cache.set('prices', { data: prices, timestamp: now });
    
    return prices;
  }
}

module.exports = new CryptoService();