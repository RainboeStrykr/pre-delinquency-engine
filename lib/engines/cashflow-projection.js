
// Mathematical Utility: 30-Day Deterministic Cashflow Projection
// Projects daily balance based on Income, EMI, and Variable Spend patterns.

export function calculateProjection(customer) {
    if (!customer) return null;

    // 1. Setup Simulation Parameters
    // We assume simulation starts "today" relative to the dataset (e.g., Feb 14, 2026)
    // Or we use the customer's last active date.
    const today = new Date('2026-02-14');
    const projectionDays = 30;

    // 2. Initialize Starting Balance
    // Estimate current balance as 20% of income + random deterministic variance
    // Or derived from balanceTrend if available
    const seed = parseInt(String(customer.id).replace(/\D/g, '')) || 54321;
    const rand = () => {
        let t = seed + 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    let currentBalance = customer.balanceTrend && customer.balanceTrend.length > 0
        ? customer.balanceTrend[customer.balanceTrend.length - 1]
        : customer.estimatedIncome * 0.3; // Fallback

    const projectedBalances = [];
    let minBalance = currentBalance;

    // 3. Define Cashflow Events

    // A) Expected Salary
    // Assume monthly salary. Date derived from 'lastSalary'
    const lastSalaryDate = new Date(customer.lastSalary);
    const estimatedSalary = customer.estimatedIncome; // Use estimated income as salary

    // B) Recurring Outflows (EMI)
    // Estimate EMI based on risk score (Higher risk = Higher debt burden usually)
    // 20% base + up to 25% more based on risk
    const debtBurdenRatio = 0.20 + (customer.riskScore / 100) * 0.25;
    const emiAmount = Math.round(customer.estimatedIncome * debtBurdenRatio);

    // Parse Next EMI Date
    // If passed, add 1 month
    let nextEmiDate = new Date(customer.nextEMI);
    if (nextEmiDate < today) {
        nextEmiDate.setMonth(nextEmiDate.getMonth() + 1);
    }

    // C) Variable Spending (Daily Burn Rate)
    // Calculate from recent transactions window (last 30 days)
    // If no transactions, use fallback (30% of income / 30)
    const recentSpend = customer.transactions
        ? customer.transactions.reduce((acc, t) => acc + Math.abs(t.amount), 0)
        : customer.estimatedIncome * 0.3;

    // Daily Variable Burn
    let dailyBurnRaw = (recentSpend / 30) * 0.8; // Assume 80% is variable, 20% is fixed (EMI covered above)

    // Drift Adjustment: If high risk, assume spend is accelerating
    // We can check if we have the Risk Acceleration Engine output available, 
    // but here we keep it standalone deterministic based on score.
    const accelerationFactor = customer.riskScore > 80 ? 1.1 : 1.0;
    const dailyBurn = dailyBurnRaw * accelerationFactor;

    // Spending Volatility (Standard Deviation of daily spend) needed for Confidence
    // For deterministic mock, we'll use a factor of the mean
    const volatility = dailyBurn * 0.4;

    // 4. Run Day-by-Day Simulation
    let balance = currentBalance;

    for (let i = 0; i < projectionDays; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        // --- Inflows ---
        // Check if Salary hits today
        // Simple check: if Day of Month matches
        if (currentDate.getDate() === lastSalaryDate.getDate()) {
            balance += estimatedSalary;
        }

        // --- Outflows ---
        // 1. EMI
        if (currentDate.getDate() === nextEmiDate.getDate()) {
            balance -= emiAmount;
        }

        // 2. Variable Spend (deterministic noise)
        // Use sine wave + seed to make it look "organic" but standard
        const noise = Math.sin(i * 0.8 + seed) * volatility;
        const todaysBurn = Math.max(0, dailyBurn + noise);

        balance -= todaysBurn;

        // Floor at 0 for logical consistency (unauthorized overdraft)
        // actually showing negative is better for "Gap" visualization
        // balance = Math.max(-5000, balance);

        projectedBalances.push(Math.round(balance));
        if (balance < minBalance) minBalance = balance;
    }

    // 5. Analyze Results

    // Calculate Balance specifically on EMI Date
    // Find index of EMI date
    const dayDiffEMI = Math.ceil((nextEmiDate - today) / (1000 * 60 * 60 * 24));
    let balanceOnEmi = currentBalance;

    // Safety check if EMI is within 30 days
    if (dayDiffEMI >= 0 && dayDiffEMI < projectionDays) {
        balanceOnEmi = projectedBalances[dayDiffEMI];
    } else {
        // EMI is outside projection window, use end balance
        balanceOnEmi = projectedBalances[projectionDays - 1];
    }

    // Liquidity Gap Calculation
    // Logic: Gap is how much you are SHORT for the EMI.
    // However, if balance is already negative before EMI, the gap is huge.
    // The visual chart shows the trend. 
    // This metric defines the status.

    // If balance drops below 0 at any point, it's a gap?
    // User requirement: "liquidityGap = emiAmount - projectedBalance_on_EMI_date"
    // "If liquidityGap > 0 -> GAP"

    const projectedBalanceBeforeEMI = balanceOnEmi + emiAmount; // Reverse the EMI subtraction to see if we had funds *for* it
    // Wait, projectedBalances includes the EMI deduction on that day.
    // So if projectedBalances[dayDiffEMI] is < 0, it means we couldn't pay it fully (or went into OD).

    // Let's stick closer to the Requirement:
    // "liquidityGap = emiAmount - (Balance JUST BEFORE paying EMI)"
    // Since our array has "End of Day" balance, index [dayDiffEMI] has already subtracted EMI.
    // So Pre-EMI Balance = projectedBalances[dayDiffEMI] + emiAmount.

    const preEmiBalance = (dayDiffEMI >= 0 && dayDiffEMI < projectionDays)
        ? (projectedBalances[dayDiffEMI] + emiAmount)
        : currentBalance; // Fallback

    const liquidityGap = emiAmount - preEmiBalance;

    let status = 'SAFE';
    if (liquidityGap > 0) status = 'GAP';
    else if (preEmiBalance < emiAmount * 1.1) status = 'TIGHT'; // Less than 10% buffer

    // Projection Confidence
    // 1 - (stdDev / mean). We simulated vol at 0.4 mean.
    // So 1 - 0.4 = 0.6 = 60%.
    // Adjust based on transaction count (more data = higher confidence)
    const baseConfidence = 85;
    const confidence = Math.max(0, Math.min(100, baseConfidence - (volatility / dailyBurn) * 20));

    return {
        projectedBalances,
        emiDueDate: nextEmiDate,
        emiAmount,
        liquidityGap: Math.max(0, liquidityGap), // Only show positive gap
        status,
        projectionConfidence: Math.round(confidence)
    };
}
