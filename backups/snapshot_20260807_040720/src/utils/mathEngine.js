/**
 * Spot Trading & Portfolio Intelligence Platform
 * Mathematical Engine & Calculations
 */

/**
 * Calculates effective fee percentage based on base fee and discount token rules
 */
export function calculateEffectiveFeePct(baseFeePct, useDiscountToken, discountPct) {
  const base = parseFloat(baseFeePct) || 0;
  if (!useDiscountToken) return base;
  const disc = parseFloat(discountPct) || 0;
  return base * (1 - disc / 100);
}

/**
 * Calculates trade purchase details and fee
 */
export function calculateTradePurchase({ amountUsd, entryPrice, feePct }) {
  const amount = parseFloat(amountUsd) || 0;
  const price = parseFloat(entryPrice) || 0;
  if (amount <= 0 || price <= 0) {
    return { quantity: 0, feeUsd: 0, netInvested: 0 };
  }
  const quantity = amount / price;
  const feeUsd = amount * ((parseFloat(feePct) || 0) / 100);
  const netInvested = amount + feeUsd;
  return { quantity, feeUsd, netInvested };
}

/**
 * Automatically generates TP (Take Profit) and SL (Stop Loss) targets from Strategy rules
 */
export function generateTradeTargets({ entryPrice, amountUsd, tpRules = [], slRules = [] }) {
  const price = parseFloat(entryPrice) || 0;
  const amount = parseFloat(amountUsd) || 0;
  if (price <= 0 || amount <= 0) return { tpTargets: [], slTargets: [] };

  const totalQuantity = amount / price;

  const tpTargets = (tpRules || []).map((rule) => {
    const gainPct = parseFloat(rule.gain_pct) || 0;
    const sellPortionPct = parseFloat(rule.sell_portion_pct) || 0;
    const targetPrice = price * (1 + gainPct / 100);
    const quantityToSell = totalQuantity * (sellPortionPct / 100);
    const expectedProceeds = targetPrice * quantityToSell;
    const expectedGainUsd = expectedProceeds - price * quantityToSell;

    return {
      stage: rule.stage,
      type: 'TP',
      gainPct,
      sellPortionPct,
      targetPrice,
      quantityToSell,
      expectedProceeds,
      expectedGainUsd,
      status: 'PENDING'
    };
  });

  const slTargets = (slRules || []).map((rule) => {
    const lossPct = parseFloat(rule.loss_pct) || 0;
    const sellPortionPct = parseFloat(rule.sell_portion_pct) || 0;
    const targetPrice = price * (1 - lossPct / 100);
    const quantityToSell = totalQuantity * (sellPortionPct / 100);
    const expectedProceeds = targetPrice * quantityToSell;
    const expectedLossUsd = price * quantityToSell - expectedProceeds;

    return {
      stage: rule.stage,
      type: 'SL',
      lossPct,
      sellPortionPct,
      targetPrice,
      quantityToSell,
      expectedProceeds,
      expectedLossUsd,
      status: 'PENDING'
    };
  });

  return { tpTargets, slTargets };
}

/**
 * Calculates Portfolio Metrics for a coin symbol
 */
export function calculateCoinPortfolio({ trades = [], livePrices = {} }) {
  const portfolioMap = {};

  trades.forEach((trade) => {
    const symbol = trade.symbol.toUpperCase();
    const key = `${symbol}_${trade.exchange_id}_${trade.strategy_id}`;

    if (!portfolioMap[key]) {
      portfolioMap[key] = {
        symbol,
        exchange_id: trade.exchange_id,
        exchange_name: trade.exchange_name,
        strategy_id: trade.strategy_id,
        strategy_name: trade.strategy_name,
        category: trade.category || 'Short-Term',
        totalBuyQuantity: 0,
        totalBuyCostUsd: 0,
        totalBuyFeesUsd: 0,
        totalSoldQuantity: 0,
        realizedPnlUsd: 0,
        totalFeesPaidUsd: 0,
      };
    }

    const item = portfolioMap[key];
    const qty = parseFloat(trade.quantity) || 0;
    const price = parseFloat(trade.entry_price) || 0;
    const fee = parseFloat(trade.calculated_fee) || 0;

    item.totalBuyQuantity += qty;
    item.totalBuyCostUsd += qty * price;
    item.totalBuyFeesUsd += fee;
    item.totalFeesPaidUsd += fee;

    // Process executed sell targets if any
    if (trade.targets && Array.isArray(trade.targets)) {
      trade.targets.forEach((tgt) => {
        if (tgt.status === 'EXECUTED') {
          const soldQty = parseFloat(tgt.quantityToSell) || 0;
          const sellPrice = parseFloat(tgt.targetPrice) || 0;
          const sellFee = parseFloat(tgt.executedFee) || 0;
          item.totalSoldQuantity += soldQty;
          item.totalFeesPaidUsd += sellFee;

          // Average cost remains constant for sold items
          const avgCost = item.totalBuyQuantity > 0 ? (item.totalBuyCostUsd + item.totalBuyFeesUsd) / item.totalBuyQuantity : 0;
          const costOfSold = soldQty * avgCost;
          const grossProceeds = soldQty * sellPrice - sellFee;
          item.realizedPnlUsd += grossProceeds - costOfSold;
        }
      });
    }
  });

  // Calculate final numbers per asset
  return Object.values(portfolioMap).map((item) => {
    const currentQuantity = Math.max(0, item.totalBuyQuantity - item.totalSoldQuantity);
    
    // Average Cost Formula: (SUM(Buy Qty * Buy Price + Fees)) / SUM(Buy Qty)
    const averageCost = item.totalBuyQuantity > 0 
      ? (item.totalBuyCostUsd + item.totalBuyFeesUsd) / item.totalBuyQuantity 
      : 0;

    const totalInvestedRemaining = currentQuantity * averageCost;
    
    // Fetch live price
    const livePrice = livePrices[item.symbol] || livePrices[`${item.symbol}USDT`] || averageCost;
    const currentValue = currentQuantity * livePrice;
    const unrealizedPnlUsd = currentValue - totalInvestedRemaining;
    const unrealizedPnlPct = totalInvestedRemaining > 0 ? (unrealizedPnlUsd / totalInvestedRemaining) * 100 : 0;

    return {
      ...item,
      currentQuantity,
      averageCost,
      totalInvestedRemaining,
      livePrice,
      currentValue,
      unrealizedPnlUsd,
      unrealizedPnlPct,
      breakEvenPrice: averageCost // For spot trading
    };
  });
}

/**
 * Calculates Overview Dashboard Global Summaries
 */
export function calculateOverviewMetrics({ exchanges = [], coinPortfolios = [] }) {
  let totalCashBalance = 0;
  let totalInvestedValue = 0;
  let totalFeesPaidUsd = 0;
  let totalUnrealizedPnlUsd = 0;
  let totalRealizedPnlUsd = 0;

  // Cash per exchange
  exchanges.forEach((ex) => {
    totalCashBalance += parseFloat(ex.initial_cash_balance) || 0;
  });

  coinPortfolios.forEach((item) => {
    totalInvestedValue += item.currentValue;
    totalFeesPaidUsd += item.totalFeesPaidUsd;
    totalUnrealizedPnlUsd += item.unrealizedPnlUsd;
    totalRealizedPnlUsd += item.realizedPnlUsd;
  });

  const totalPortfolioValue = totalCashBalance + totalInvestedValue;
  const cashPct = totalPortfolioValue > 0 ? (totalCashBalance / totalPortfolioValue) * 100 : 0;
  const investedPct = totalPortfolioValue > 0 ? (totalInvestedValue / totalPortfolioValue) * 100 : 0;

  return {
    totalPortfolioValue,
    totalCashBalance,
    totalInvestedValue,
    cashPct,
    investedPct,
    totalFeesPaidUsd,
    totalUnrealizedPnlUsd,
    totalRealizedPnlUsd
  };
}

/**
 * Calculates Short-Term Trading Metrics (Win Rate, Profit Factor, etc.)
 */
export function calculateShortTermMetrics(trades = []) {
  const shortTermTrades = trades.filter((t) => t.category === 'Short-Term' || !t.category);
  
  let winsCount = 0;
  let lossesCount = 0;
  let totalWinUsd = 0;
  let totalLossUsd = 0;

  shortTermTrades.forEach((t) => {
    if (t.realizedPnl !== undefined && t.status === 'CLOSED') {
      if (t.realizedPnl > 0) {
        winsCount++;
        totalWinUsd += t.realizedPnl;
      } else if (t.realizedPnl < 0) {
        lossesCount++;
        totalLossUsd += Math.abs(t.realizedPnl);
      }
    }
  });

  const totalClosed = winsCount + lossesCount;
  const winRatePct = totalClosed > 0 ? (winsCount / totalClosed) * 100 : 0;
  const profitFactor = totalLossUsd > 0 ? totalWinUsd / totalLossUsd : totalWinUsd > 0 ? totalWinUsd : 0;
  const avgWinUsd = winsCount > 0 ? totalWinUsd / winsCount : 0;
  const avgLossUsd = lossesCount > 0 ? totalLossUsd / lossesCount : 0;

  return {
    totalClosed,
    winsCount,
    lossesCount,
    winRatePct,
    profitFactor,
    totalWinUsd,
    totalLossUsd,
    avgWinUsd,
    avgLossUsd
  };
}
