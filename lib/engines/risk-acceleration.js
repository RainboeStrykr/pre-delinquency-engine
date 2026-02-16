
// Mathematical Utility: Calculate Risk Acceleration (Velocity & Momentum)
export function calculateRiskAcceleration(transactions, currentScore) {
    if (!transactions || transactions.length < 5) return { velocity: 0, acceleration: 0, trend: 'STABLE' };

    // Sort by date ascending
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    // We need at least 30 days of data to see acceleration
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    const recentTxns = sorted.filter(t => new Date(t.date) >= thirtyDaysAgo);

    if (recentTxns.length < 5) return { velocity: 0, acceleration: 0, trend: 'STABLE' };

    // 1. Calculate Daily Spend Velocity (Slope of cumulative spend)
    // We'll use simple linear regression: y = mx + c (y = cumulative spend, x = day index)

    let cumulativeSpend = 0;
    const points = recentTxns.map((t, i) => {
        cumulativeSpend += Math.abs(t.amount);
        const dayDiff = (new Date(t.date) - thirtyDaysAgo) / (1000 * 60 * 60 * 24);
        return { x: dayDiff, y: cumulativeSpend };
    });

    const n = points.length;
    const sumX = points.reduce((a, p) => a + p.x, 0);
    const sumY = points.reduce((a, p) => a + p.y, 0);
    const sumXY = points.reduce((a, p) => a + (p.x * p.y), 0);
    const sumXX = points.reduce((a, p) => a + (p.x * p.x), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX); // Daily Spend Velocity

    // 2. Calculate Acceleration (Change in Velocity between first 15 days and last 15 days)
    const midPoint = 15;
    const firstHalf = points.filter(p => p.x <= midPoint);
    const secondHalf = points.filter(p => p.x > midPoint);

    const getSlope = (pts) => {
        if (pts.length < 2) return 0;
        const n = pts.length;
        const sX = pts.reduce((a, p) => a + p.x, 0);
        const sY = pts.reduce((a, p) => a + p.y, 0);
        const sXY = pts.reduce((a, p) => a + (p.x * p.y), 0);
        const sXX = pts.reduce((a, p) => a + (p.x * p.x), 0);
        return (n * sXY - sX * sY) / (n * sXX - sX * sX);
    };

    const v1 = getSlope(firstHalf);
    const v2 = getSlope(secondHalf);

    const acceleration = v2 - v1; // Positive means spending is accelerating

    // Normalize metrics
    // Velocity: Avg daily spend. Acceleration: Change in daily spend per 15 days.

    let trend = 'STABLE';
    if (acceleration > 50) trend = 'ACCELERATING'; // Spending increasing rapidly
    if (acceleration < -50) trend = 'DECELERATING'; // Spending slowing down
    if (acceleration > 200) trend = 'CRITICAL SURGE';

    // Risk Momentum Score (0-100)
    // Base it on acceleration relative to velocity
    const momentum = Math.min(100, Math.max(0, (acceleration / (slope || 1)) * 50 + 50));

    return {
        velocity: Math.round(slope), // Avg daily spend
        acceleration: Math.round(acceleration), // Change in rate
        trend,
        momentum: Math.round(momentum)
    };
}
