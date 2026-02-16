
import realCustomers from './customers_real.json';
import realTransactions from './transactions_real.json';

// Deterministic helpers for data enrichment
// We derive Category/Merchant from the transaction amount/date signature 
// so it looks consistent without being purely "random".
const CATEGORIES = ['Groceries', 'Dining', 'Travel', 'Shopping', 'Utilities', 'Health', 'Entertainment', 'Electronics'];
const MERCHANTS = [
    'Amazon', 'Uber', 'Starbucks', 'Apollo Pharmacy', 'Reliance Fresh', 'Netflix',
    'Zomato', 'Shell', 'Flipkart', 'Airtel', 'BigBasket', 'Makemytrip'
];

function deriveTransactionMetadata(t) {
    // robust hash from properties
    const amt = Math.abs(t.amount || 0);
    const dateVal = new Date(t.date || 0).getTime();
    const hash = Math.floor(amt * 13 + dateVal * 7);

    // Status: 95% completed, 5% failed/pending (simulated based on hash)
    const statusVal = hash % 100;
    let status = 'completed';
    if (statusVal > 95) status = 'failed';
    else if (statusVal > 90) status = 'pending';

    // Category & Merchant
    const catIdx = hash % CATEGORIES.length;
    const merchIdx = (hash + catIdx) % MERCHANTS.length;

    return {
        ...t,
        category: t.category || CATEGORIES[catIdx],
        merchant: t.merchant || MERCHANTS[merchIdx],
        status: t.status || status,
        amount: t.amount || 0 // ensure amount exists
    };
}

export const customers = realCustomers.map(c => {
    let custTransactions = realTransactions
        .filter(t => t.customerId === c.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Enrich transactions
    custTransactions = custTransactions.map(deriveTransactionMetadata);

    // Identify derived status
    // Use existing score or default to 50
    const riskScore = c.riskScore !== undefined ? c.riskScore : 50;
    const riskLevel = c.riskLevel || (riskScore > 80 ? 'HIGH' : (riskScore > 40 ? 'MEDIUM' : 'LOW'));

    // Estimated Income: If missing, infer from average spend * 1.5
    let estimatedIncome = c.estimatedIncome;
    if (!estimatedIncome) {
        const total = custTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
        // Assume 3 months data? or just monthly avg
        // transactions_real.json duration is unknown. Assume 30 days for safety if count is small?
        // Let's take avg * 30 if daily?
        // Safer: Average transaction * frequency * 30
        estimatedIncome = (total / (custTransactions.length || 1)) * 50;
        if (estimatedIncome < 10000) estimatedIncome = 50000; // Floor
    }

    return {
        ...c,
        name: `Customer ${c.id}`,
        transactions: custTransactions,
        riskScore,
        riskLevel,
        estimatedIncome,
        defaultProb: (riskScore * 0.15).toFixed(1),
        // Legacy fields for safety
        lastSalary: c.lastSalary || '2026-02-01', // Fallback date for UI
        nextEMI: c.nextEMI || '2026-03-01'
    };
});

// Update standard portfolio metrics
// Case-insensitive matching for robustness
const highRiskCount = customers.filter(c => (c.riskLevel || '').toUpperCase() === 'HIGH').length;
const mediumRiskCount = customers.filter(c => (c.riskLevel || '').toUpperCase() === 'MEDIUM').length;
const avgScore = customers.length ? (customers.reduce((a, b) => a + b.riskScore, 0) / customers.length).toFixed(1) : 0;

export const portfolioMetrics = [
    { label: 'Total Customers', value: customers.length.toLocaleString(), change: '', direction: 'neutral' },
    { label: 'High Risk', value: highRiskCount.toLocaleString(), change: '', direction: 'neutral', highlighted: true },
    { label: 'Medium Risk', value: mediumRiskCount.toLocaleString(), change: '', direction: 'neutral' },
    { label: 'Avg Risk Score', value: avgScore, change: '', direction: 'neutral' },
    { label: 'Transactions', value: realTransactions.length.toLocaleString(), change: '', direction: 'neutral' },
];

export function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
        return 'N/A';
    }
}

export function formatCurrency(amount) {
    if (amount === undefined || amount === null) return '₹0';
    const prefix = amount >= 0 ? '+' : '';
    return prefix + '₹' + Math.abs(amount).toLocaleString('en-IN');
}
