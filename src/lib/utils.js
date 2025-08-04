/**
 * Combines multiple class names into a single string
 * @param {...string} classes - Class names to combine
 * @returns {string} Combined class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a number to a specified number of decimal places
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 2) {
  return Number(num).toFixed(decimals);
}

/**
 * Generates a unique ID
 * @returns {string} A unique ID string
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}
