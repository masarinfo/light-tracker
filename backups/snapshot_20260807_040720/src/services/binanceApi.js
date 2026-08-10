/**
 * Binance & Public Market REST API Service
 * Fetches real-time public spot ticker prices without requiring API keys.
 */

const BINANCE_24HR_URL = 'https://api.binance.com/api/v3/ticker/24hr';
const COINGECKO_SIMPLE_URL = 'https://api.coingecko.com/api/v3/simple/price';

/**
 * Default fallback prices for common spot trading pairs (in USD)
 */
export const DEFAULT_SPOT_PRICES = {
  BTCUSDT: 64500.0,
  ETHUSDT: 3450.0,
  SOLUSDT: 145.5,
  BNBUSDT: 580.0,
  NEARUSDT: 5.25,
  AVAXUSDT: 28.4,
  ADAUSDT: 0.38,
  BTC: 64500.0,
  ETH: 3450.0,
  SOL: 145.5,
  BNB: 580.0,
  NEAR: 5.25,
  AVAX: 28.4,
  ADA: 0.38
};

/**
 * Fetches live 24hr tickers from Binance Public REST API
 */
export async function fetchLivePrices() {
  try {
    const response = await fetch(BINANCE_24HR_URL);
    if (!response.ok) {
      throw new Error(`Binance API HTTP status: ${response.status}`);
    }
    const data = await response.json();
    
    const priceMap = {};
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.symbol && item.lastPrice) {
          const price = parseFloat(item.lastPrice);
          priceMap[item.symbol] = price;
          // Also map base asset symbol (e.g. BTCUSDT -> BTC)
          if (item.symbol.endsWith('USDT')) {
            const baseSymbol = item.symbol.replace('USDT', '');
            priceMap[baseSymbol] = price;
          }
        }
      });
    }

    return { success: true, prices: priceMap, source: 'Binance REST API' };
  } catch (err) {
    console.warn('Binance API fetch failed, trying fallback...', err);

    // Fallback to CoinGecko
    try {
      const cgResponse = await fetch(
        `${COINGECKO_SIMPLE_URL}?ids=bitcoin,ethereum,solana,binancecoin,near,avalanche-2,cardano&vs_currencies=usd`
      );
      if (cgResponse.ok) {
        const cgData = await cgResponse.json();
        const priceMap = { ...DEFAULT_SPOT_PRICES };
        if (cgData.bitcoin) {
          priceMap.BTC = cgData.bitcoin.usd;
          priceMap.BTCUSDT = cgData.bitcoin.usd;
        }
        if (cgData.ethereum) {
          priceMap.ETH = cgData.ethereum.usd;
          priceMap.ETHUSDT = cgData.ethereum.usd;
        }
        if (cgData.solana) {
          priceMap.SOL = cgData.solana.usd;
          priceMap.SOLUSDT = cgData.solana.usd;
        }
        if (cgData.binancecoin) {
          priceMap.BNB = cgData.binancecoin.usd;
          priceMap.BNBUSDT = cgData.binancecoin.usd;
        }
        return { success: true, prices: priceMap, source: 'CoinGecko API' };
      }
    } catch (fallbackErr) {
      console.warn('Fallback price fetch failed, using default spot prices.', fallbackErr);
    }

    return { success: false, prices: DEFAULT_SPOT_PRICES, source: 'Default Offline Mock' };
  }
}
