# Advanced Innovation Layer: Enterprise Logic & Differentiators

This layer transforms raw risk scores into **actionable intelligence** and **responsible AI**.

## 1. Fairness & Bias Monitoring Engine (The "Ethical AI" Shield)
**Why it matters:** Regulators demand proof that AI models don't discriminate. We will build a live dashboard widget that "audits" your risk scores in real-time.

### A. The "Disparate Impact" Monitor
We simulate checking protected attributes (Age, Gender - *mocked for demo fairness*).

**Metric:**  
$$ \text{Disparate Impact Ratio} = \frac{P(\text{High Risk} | \text{Group A})}{P(\text{High Risk} | \text{Group B})} $$
*Goal: Maintain ratio between 0.8 and 1.25.*

**Implementation Logic:**
1.  **Mock Attribute Assignment**: Assign random "Age Group" (<25 vs >25) to customers.
2.  **Real-time Audit**:
    - Count High Risk in Group <25.
    - Count High Risk in Group >25.
    - Calculate Ratio.
3.  **Visual Alert**: If ratio < 0.8 (e.g., young people are flagged too often), show a "Bias Warning" on the dashboard.

## 2. Risk "Noise Suppression" Logic
**Why it matters:** Banks hate false alarms. We need a way to filter out temporary blips from real crises.

### The "Persistence Filter" Algorithm
A risk signal is only valid if it persists for $N$ days or exceeds a severity threshold.

**Logic Rule:**
```javascript
IF (RiskScore > 80) THEN ALERT_IMMEDIATE
ELSE IF (RiskScore > 60 AND RiskDuration > 3_DAYS) THEN ALERT_WARNING
ELSE IGNORE (Transient Noise)
```

**UI Feature:** A toggle on the dashboard: **"Hide Transient Noise"**.
- *On*: Shows only persistent risks (cleaner view).
- *Off*: Shows raw, noisy data (for debugging).

## 3. Intervention Recommendation Engine (Hybrid Rule/Model)
**Why it matters:** Scores tell you *what* is wrong. Interventions tell you *how to fix it*.

We map **Archetypes** to **Strategies**.

| Stress Archetype | Recommended Action | Channel |
|------------------|--------------------|---------|
| **Sudden Spender** | "spending_curb_challenge" | App Notification (Push) |
| **Income Shocked** | "payment_holiday_offer" | SMS + Email |
| **Over-Leveraged** | "debt_consolidation_plan" | Call Center Agent |
| **Subscription Trap** | "subscription_audit_tool" | In-App Pop-up |

**The "Next Best Action" API Mock:**
- Input: `CustomerContext` (Risk Score, Archetype, Balance).
- Logic: Selects top 3 actions based on `ImpactScore` (estimated risk reduction).
- Output: JSON list of actions sorted by `Priority`.

## 4. Real-Time "Living" Simulation
**Why it matters:** Static dashboards are boring. We want the numbers to *move* during the demo.

### The "Day-in-the-Life" Accelerator
We simulate 1 day of transactions every 5 seconds.

**Simulation Cycle (5s Loop):**
1.  **Advance Clock**: `CurrentDate += 1 Day`
2.  **Process Scheduled Events**:
    - Is it Payday? -> Add Salary (+).
    - Is it Rent Day? -> Subtract Rent (-).
3.  **Inject Random Events (Chaos Monkey)**:
    - 5% chance: "Emergency Medical Expense" (-$500).
    - 2% chance: "Salary Delay" (Skip payday).
    - 10% chance: "Shopping Spree" (3x transactions).
4.  **Re-Run Intelligence**:
    - Recalculate Drift.
    - Update Risk Score.
    - Check for Alerts.

**Visual Effect**:
- The "Next EMI" countdown ticks down.
- Balances fluctuate live.
- Risk trend charts update dynamically (adding new bars).

## 5. Portfolio Health Matrix
**Why it matters:** Executives need the "big picture."

**The Matrix Visualization:**
X-Axis: **Risk Score** (Low -> High)
Y-Axis: **Risk Velocity** (Stable -> Accelerating)

**Quadrants:**
1.  **Safe Harbor**: Low Risk, Stable. (Green)
2.  **Watching**: Medium Risk, Stable. (Yellow)
3.  **Volatile**: Low Risk, Accelerating. (Orange - *Early Warning Zone*)
4.  **Critical**: High Risk, Accelerating. (Red - *Action Required*)

**Logic**:
- Map every customer to a dot on this 2D scatter plot.
- Show dots moving between quadrants as the simulation runs.

## 6. Demo "Narrative Arc"
Designed to guide the user through the features logically.

1.  **"All Quiet"**: Dashboard is green/stable.
2.  **"The Shock"**: Trigger a manual event (e.g., "Inject Economic Downturn").
3.  **"The Reaction"**: Watch risk scores spike, dots move to Red quadrant.
4.  **"The Insight"**: Click a Red customer -> See "Income Shocked" archetype.
5.  **"The Solution"**: Click "Approve Payment Holiday" -> Watch score stabilize.

---
**Summary**: This layer adds the *behavior*, *ethics*, and *solutions* that transform a static Next.js app into a convincing AI platform.
