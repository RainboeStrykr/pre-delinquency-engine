
// Mathematical Utility: Calculate Drift Z-Score
export function calculateBehavioralDrift(transactions) {
    if (!transactions || transactions.length < 10) return { score: 0, level: 'LOW', details: [] };

    // Group by category (e.g., 'DINING', 'GROCERY')
    const grouped = transactions.reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = [];
        acc[t.category].push({
            date: new Date(t.date),
            amount: Math.abs(t.amount)
        });
        return acc;
    }, {});

    const features = [];
    let weightedDrift = 0;

    // Look at last 14 days vs historical baseline (previous 30-90 days)
    // Use the latest transaction date as "now" (data may be simulated)
    const sortedDates = transactions.map(t => new Date(t.date)).sort((a, b) => b - a);
    const now = new Date(sortedDates[0]);
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 14); // 14 days before latest txn

    for (const [category, txs] of Object.entries(grouped)) {
        // Current window
        const current = txs.filter(t => t.date >= cutoff).map(t => t.amount);
        // Historical window
        const history = txs.filter(t => t.date < cutoff).map(t => t.amount);

        if (history.length < 5 || current.length < 2) continue; // Skip if insufficient data

        const histMean = history.reduce((a, b) => a + b, 0) / history.length;
        const histStd = Math.sqrt(history.reduce((a, b) => a + Math.pow(b - histMean, 2), 0) / history.length);

        const currMean = current.reduce((a, b) => a + b, 0) / current.length;

        // Formula: Z = (Current - Baseline) / StdDev
        const zScore = (currMean - histMean) / (histStd || 1);

        // Weight Categories: 'GAMBLING' or 'CASH' is higher risk than 'GROCERY'
        let weight = 1;
        if (category === 'GAMBLING') weight = 5;
        if (category === 'ATM' || category === 'CASH') weight = 2.5;
        if (category === 'LUXURY') weight = 2;

        // Add to total drift
        if (zScore > 1.5) { // Only count significant upward drift
            weightedDrift += (zScore * weight);
        }

        features.push({
            category,
            baseline: histMean,
            current: currMean,
            zScore: zScore,
            isDrifting: zScore > 2.0 // Flag if highly anomalous
        });
    }

    // Normalize weightedDrift to a 0-100 Score
    // Assume 20 is "Extreme Drift"
    const score = Math.min(100, (weightedDrift / 20) * 100);

    let level = 'LOW';
    if (score > 70) level = 'HIGH';
    else if (score > 40) level = 'MEDIUM';

    return {
        score: Math.round(score),
        level,
        features: features.sort((a, b) => b.zScore - a.zScore)
    };
}
