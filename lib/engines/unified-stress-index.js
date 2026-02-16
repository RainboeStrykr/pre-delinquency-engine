
import { calculateBehavioralDrift } from './behavioral-drift';
import { calculateRiskAcceleration } from './risk-acceleration';
import { calculateProjection } from './cashflow-projection';

// Mathematical Utility: Unified Stress Index (USI)
// Aggregates all risk signals into a single standardized 0-100 score.
// 0 = Pristine Health, 100 = Imminent Default.

export function calculateUnifiedIndex(customer) {
    if (!customer) return { score: 0, level: 'LOW', contributions: {} };

    // 1. Compute Sub-Engine Outputs
    const driftData = calculateBehavioralDrift(customer.transactions);
    const accelData = calculateRiskAcceleration(customer.transactions, customer.riskScore);
    const projData = calculateProjection(customer);

    // 2. Normalize Components (0-100 scale)

    // A. Base Static Risk (30% Weight)
    // customer.riskScore is 0-100 (High is bad? No, usually credit score is High=Good? 
    // In this app, data/customers.js says riskScore: 90, riskLevel: HIGH. 
    // So 90 is BAD. 0 is GOOD.
    const scoreStatic = customer.riskScore || 50;

    // B. Behavioral Drift (20% Weight)
    // Drift Score is already 0-100 derived from Z-Score
    const scoreDrift = driftData.score || 0;

    // C. Acceleration (20% Weight)
    // Trend: ACCELERATING (+20), STABLE (0), DECELERATING (-10)
    // Velocity: If > 0, score increases.
    // Momentum is 0-100. Let's use momentum.
    const scoreAccel = accelData.momentum || 50;

    // D. Liquidity / Cashflow (30% Weight)
    // GAP = 100. TIGHT = 75. SAFE = 25.
    let scoreProj = 25;
    if (projData.status === 'GAP') scoreProj = 100;
    else if (projData.status === 'TIGHT') scoreProj = 75;

    // 3. Weighted Aggregation
    // Weights: Static 0.2, Drift 0.2, Accel 0.2, Cashflow 0.4 (Highest importance on actual liquidity)

    const wStatic = 0.2;
    const wDrift = 0.2;
    const wAccel = 0.2;
    const wProj = 0.4;

    const rawScore = (scoreStatic * wStatic) + (scoreDrift * wDrift) + (scoreAccel * wAccel) + (scoreProj * wProj);

    // 4. Boosters (Multipliers for critical combinations)
    let finalScore = rawScore;

    // Booster: High Acceleration + Gap = Critical Failure Imminent
    if (accelData.trend === 'ACCELERATING' && projData.status === 'GAP') {
        finalScore *= 1.25;
    }

    // Booster: Drift + Gap
    if (driftData.level === 'HIGH' && projData.status === 'GAP') {
        finalScore *= 1.15;
    }

    finalScore = Math.min(100, Math.round(finalScore));

    // 5. Determine Level
    let level = 'LOW';
    if (finalScore >= 85) level = 'CRITICAL';
    else if (finalScore >= 70) level = 'HIGH';
    else if (finalScore >= 45) level = 'MODERATE';

    return {
        score: finalScore,
        level,
        components: {
            static: Math.round(scoreStatic * wStatic),
            drift: Math.round(scoreDrift * wDrift),
            accel: Math.round(scoreAccel * wAccel),
            cashflow: Math.round(scoreProj * wProj)
        }
    };
}
