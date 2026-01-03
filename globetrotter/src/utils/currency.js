/**
 * Formats a number as Indian Rupees (INR)
 * @param {number} amount - The numeric amount to format
 * @returns {string} - Formatted string (e.g., "₹1,50,000")
 */
export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';

    // Handle potential string inputs gracefully
    const num = Number(amount);
    if (isNaN(num)) return '₹0';

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    }).format(num);
};

/**
 * Formats a number in compact notation if needed (e.g. 1.5L, 2Cr)
 * Useful for very small spaces, though standard format is preferred.
 */
export const formatCompactCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    const num = Number(amount);

    if (num >= 10000000) { // Crore
        return `₹${(num / 10000000).toFixed(2)}Cr`;
    }
    if (num >= 100000) { // Lakh
        return `₹${(num / 100000).toFixed(2)}L`;
    }

    return formatCurrency(num);
};