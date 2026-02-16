# Frontend-Centric ML & Feature Design

## 1. Design Philosophy: "Thick Client" Intelligence
To maximize demo reliability and portability, all intelligence logic will be implemented as **TypeScript utilities** running in the browser.

- **Data Source**: Local JSON files (simulating a database) loaded into React State/Context.
- **Compute Engine**: JavaScript (Client-side) for meaningful real-time calculations.
- **Simulation**: `setInterval` loops instead of WebSockets.

## 2. Feature Engineering (Computed on the Fly)

We will transform raw transaction data into these "signals" using JavaScript array reductions.

### A. Core Behavioral Features
| Feature Name | JS Implementation Logic |
|--------------|-------------------------|
| `avg_daily_spend_7d` | `transactions.filter(last7Days).reduce(sum) / 7` |
| `avg_daily_spend_30d` | `transactions.filter(last30Days).reduce(sum) / 30` |
| `transaction_velocity` | `count(transactions_today) / avg_daily_count_30d` |
| `cash_withdrawal_ratio` | `sum(atm_withdrawals) / sum(total_outflows)` |
| `declined_txn_rate` | `count(declined) / count(total_attempts)` |
| `night_owl_spend` | `% of spend occurring between 11 PM - 5 AM` |

### B. "Red Flag" Signals (Binary Indicators)
| Signal | Logic |
|--------|-------|
| `salary_missing` | `!transactions.some(t => t.type === 'SALARY' && t.date > expected_date)` |
| `gambling_detected` | `transactions.some(t => GAMBLING_MCC_CODES.includes(t.mcc))` |
| `loan_stacking` | `unique(transactions.filter(t => t.type === 'LENDING_APP').map(t => t.merchant)).length > 2` |

## 3. Mathematical Models (JS Implementation)

### 1. Behavioral Drift Detection (Z-Score Drift)
Did the customer's behavior change significantly this week compared to their baseline?

**Formula:**
$$ Z = \frac{CurrentValue - BaselineMean}{BaselineStdDev} $$

**JS Implementation Pseudo-code:**
```javascript
function calculateDrift(currentWindow, historicalWindow) {
  const currentMetric = mean(currentWindow); // e.g., avg spend this week
  const baselineMean = mean(historicalWindow); // avg spend last 3 months
  const baselineStd = stdDev(historicalWindow);
  
  const zScore = (currentMetric - baselineMean) / (baselineStd || 1);
  
  // Drift Severity Logic
  if (zScore > 3.0) return { drift: 'CRITICAL', score: zScore };
  if (zScore > 1.5) return { drift: 'MODERATE', score: zScore };
  return { drift: 'NONE', score: zScore };
}
```

### 2. Risk Acceleration Index (RAI)
Is the customer's situation getting worse *faster*? This is the "derivative" of risk.

**Formula:**
$$ RAI = \alpha \cdot (\text{Risk}_t - \text{Risk}_{t-1}) + \beta \cdot (\text{Risk}_t - \text{Risk}_{t-7}) $$
Where $\alpha$ (0.7) weighs immediate change and $\beta$ (0.3) weighs weekly trend.

**JS Logic:**
- **Velocity**: Rate of change in risk score (points per day).
- **Momentum**: Is the velocity increasing? (Acceleration).

### 3. Unified Stress Index (USI) - **Proprietary Metric**
A single composite score (0-100) to rank customers.

**Formula:**
$$ USI = (w_1 \times \text{BureauScore}) + (w_2 \times \text{DriftScore}) + (w_3 \times \text{CashflowStress}) $$

**Weights Strategy:**
- `BureauScore` (Traditional Risk): 30%
- `DriftScore` (Behavioral Anomaly): 40% (high weight for differentiation)
- `CashflowStress` (Liquidity Crunch): 30%

## 4. 30-Day Cashflow Projection Engine
Simulate the customer's bank balance into the future to predict "Day Zero" (when they run out of money).

**Algorithm:**
1.  **Identify Recurring**: Scan history for repeating amounts within ±5% variance (Rent, EMI, Salary, Netflix).
2.  **Estimate Discretionary**: Calculate daily average for non-recurring spend (Food, Transport).
3.  **Project**:
    ```javascript
    let forecastBalance = currentBalance;
    for (let day = 1; day <= 30; day++) {
       const date = getDate(day);
       
       // Add expected salary
       if (isPayDay(date)) forecastBalance += estimatedSalary;
       
       // Subtract scheduled bills
       const bills = getBillsForDate(date);
       forecastBalance -= sum(bills);
       
       // Subtract daily living baseline
       forecastBalance -= avgDailyDiscretionary;
       
       // Check for crash
       if (forecastBalance < 0) return { dayZero: day, shortfall: forecastBalance };
    }
    ```

## 5. Stress Archetype Clustering (Rule-Based Decision Tree)
Instead of running Python's K-Means, we use a **deterministic decision tree** in JS. This is easier to explain in a demo and strictly consistent.

**Archetype Definitions:**

1.  **The "Sudden Spender" (Behavioral change)**
    - *Logic*: `DriftScore > High` AND `Income == Stable`
    - *Root Cause*: Lifestyle inflation or emergency.

2.  **The "Income Shocked" (Loss of funds)**
    - *Logic*: `Salary == Missing` OR `IncomeDrop > 30%`
    - *Root Cause*: Job loss or pay cut.

3.  **The "Over-Leveraged" (Debt trap)**
    - *Logic*: `EMI_Ratio > 60%` of Inflows.
    - *Root Cause*: Too many loans.

4.  **The "Gamer/Risky" (High risk behavior)**
    - *Logic*: `Gambling_Detected == True` OR `Crypto_Spend > 50%`

## 6. Implementation Plan: Specialized React Hooks

We will encapsulate this logic in hooks to keep components clean.

-   `useRiskModel(customer)`: Returns real-time computed scores integers.
-   `useSimulation()`: Runs the "clock" and injects synthetic transactions.
-   `useCashflowProjection(transactions)`: Returns the chart data for the future balance.

## 7. Data Structure for Mocking

Each customer in `customers.js` will need this enriched structure:

```javascript
{
  id: "CUST-001",
  name: "Alex Doe",
  // Static Profile
  profile: {
    salaryDay: 5, 
    avgSalary: 4500,
    creditScore: 720
  },
  // Dynamic State (Mutable for Simulation)
  liveRiskScore: 45,
  transactions: [
    { date: "2024-02-10", amount: -45.00, merchant: "Uber", type: "TRANSPORT" },
    // ... history ...
  ]
}
```

## 8. Why This Wins (The "Secret Sauce")
Most hackathon projects just show static database fields.
**Your Advantage:** You are calculating *derivatives* (rate of change) and *projections* (future state) on the client side.
- "We don't just tell you the risk is High."
- "We tell you the risk is **accelerating** at 5 points/day and they will go broke on **Day 14**."
