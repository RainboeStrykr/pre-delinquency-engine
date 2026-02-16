
// Mathematical Utility: Stress Archetype Clustering
// groups customers based on dominant financial stress factors.

export const ARCHETYPES = {
    INCOME_SHOCK: {
        id: 'INCOME_SHOCK',
        label: 'Income Shock',
        color: '#EF4444', // Red
        description: 'Primary stress from irregular or delayed income sources.'
    },
    OVERSPENDER: {
        id: 'OVERSPENDER',
        label: 'Aggressive Spender',
        color: '#F59E0B', // Orange
        description: 'Discretionary spending exceeds sustainable levels relative to income.'
    },
    DEBT_TRAP: { // High EMI burden
        id: 'DEBT_TRAP',
        label: 'High Debt Burden',
        color: '#8B5CF6', // Purple
        description: 'Fixed obligations (EMI) consume >60% of estimated inflows.'
    },
    SAVINGS_BLEED: {
        id: 'SAVINGS_BLEED',
        label: 'Savings Bleed',
        color: '#EC4899', // Pink
        description: 'Consistent decline in savings balance despite no single large expense.'
    },
    STABLE: {
        id: 'STABLE',
        label: 'Financially Stable',
        color: '#10B981', // Green
        description: 'Healthy balance of income, spending, and savings.'
    }
};

export function assignArchetype(customer) {
    if (!customer) return ARCHETYPES.STABLE;

    // Normalizing Features
    // 1. Income Stability
    const salaryDelayDays = customer.stress?.salaryDelay?.value || 0;

    // 2. Spending Intensity
    // Use Risk Acceleration logic proxy or raw spend/income ratio
    const totalSpend = customer.totalSpend || 0;
    const income = customer.estimatedIncome || 1;
    const spendRatio = totalSpend / income;

    // 3. Debt Burden
    // Approx EMI from nextEMI date or internal estimate
    const debtBurden = customer.riskScore > 75 ? 0.5 : 0.2; // Proxy based on risk if EMI not explicit

    // 4. Savings Trend
    const savingsDrop = parseFloat(customer.stress?.savingsDecline?.value || 0);

    // Scoring (0-10)
    const scores = {
        INCOME_SHOCK: salaryDelayDays > 5 ? 10 : (salaryDelayDays * 2),
        OVERSPENDER: spendRatio > 1.2 ? 10 : (spendRatio > 0.9 ? 7 : 2),
        DEBT_TRAP: (customer.riskScore > 85) ? 8 : 2, // Correlated with high general risk
        SAVINGS_BLEED: savingsDrop > 15 ? 10 : (savingsDrop * 0.5),
        STABLE: (customer.riskScore < 30) ? 10 : (100 - customer.riskScore) / 10
    };

    // Find Max Score
    let maxScore = -1;
    let bestFit = 'STABLE';

    Object.entries(scores).forEach(([key, score]) => {
        if (score > maxScore) {
            maxScore = score;
            bestFit = key;
        }
    });

    // Override if Risk Score is very low -> Stable
    if (customer.riskScore < 40 && bestFit !== 'INCOME_SHOCK') {
        return ARCHETYPES.STABLE;
    }

    return ARCHETYPES[bestFit] || ARCHETYPES.STABLE;
}

export function getPortfolioClusters(customers) {
    const counts = {
        INCOME_SHOCK: 0,
        OVERSPENDER: 0,
        DEBT_TRAP: 0,
        SAVINGS_BLEED: 0,
        STABLE: 0
    };

    customers.forEach(c => {
        const type = assignArchetype(c);
        if (counts[type.id] !== undefined) {
            counts[type.id]++;
        }
    });

    return Object.entries(counts).map(([id, count]) => ({
        id,
        label: ARCHETYPES[id].label,
        count,
        color: ARCHETYPES[id].color,
        pct: ((count / customers.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
}
