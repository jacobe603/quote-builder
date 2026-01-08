/**
 * Generate a unique ID string
 */
export const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Format a number as USD currency
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

/**
 * Format a decimal as percentage (0.05 -> "5.0%")
 */
export const formatPercent = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${(value * 100).toFixed(1)}%`;
};

/**
 * Parse line number like "1.2.3" into components
 */
export const parseLineNumber = (lineNum) => {
  const parts = lineNum.split('.').map(p => parseInt(p, 10));
  return {
    packageNum: parts[0] || null,
    lineNum: parts[1] || null,
    subLineNum: parts[2] || null,
    depth: parts.filter(p => !isNaN(p)).length
  };
};
