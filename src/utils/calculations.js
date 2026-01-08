/**
 * Calculate derived pricing values for a line item
 *
 * Formulas:
 * - Mfg Net = Qty × List Price × Multiplier × (1 + Price Increase %)
 * - Mfg Comm = Mfg Net × Pay %
 * - Total Net = Mfg Net + Freight
 * - Bid Price = Total Net × Markup
 * - Sales Comm = (Bid Price - Total Net) + Mfg Comm
 */
export const calculateLineItem = (item) => {
  const qty = item.qty || 0;
  const listPrice = item.listPrice || 0;
  const multiplier = item.multiplier || 0;
  const priceIncrease = item.priceIncrease || 0;
  const pay = item.pay || 0;
  const freight = item.freight || 0;
  const markup = item.markup || 1;

  const mfgNet = qty * listPrice * multiplier * (1 + priceIncrease);
  const mfgComm = mfgNet * pay;
  const totalNet = mfgNet + freight;
  const bidPrice = totalNet * markup;
  const salesComm = (bidPrice - totalNet) + mfgComm;

  return {
    mfgNet: Math.round(mfgNet * 100) / 100,
    mfgComm: Math.round(mfgComm * 100) / 100,
    totalNet: Math.round(totalNet * 100) / 100,
    bidPrice: Math.round(bidPrice * 100) / 100,
    salesComm: Math.round(salesComm * 100) / 100
  };
};

/**
 * Calculate totals for a group of line items
 */
export const calculateGroupTotals = (lineItems) => {
  return lineItems.reduce((acc, item) => {
    const calc = calculateLineItem(item);
    return {
      totalNet: acc.totalNet + calc.totalNet,
      bidPrice: acc.bidPrice + calc.bidPrice,
      salesComm: acc.salesComm + calc.salesComm
    };
  }, { totalNet: 0, bidPrice: 0, salesComm: 0 });
};
