# Intelligent Engines Architecture

## 1. Behavioral Drift Engine (`lib/engines/behavioral-drift.js`)
**Purpose**: Detects anomalies in customer spending patterns by comparing recent activity against a historical baseline.

### Mathematical Model
We use a **Weighted Z-Score Analysis**:
$$ Z = \frac{\mu_{current} - \mu_{baseline}}{\sigma_{baseline}} $$

- **Baseline Window**: T-90 days to T-15 days
- **Current Window**: Last 14 days
- **Weighted Sensitivity**:
  - Gambling/Cash: 5.0x Weight
  - Luxury/ATM: 2.5x Weight
  - Regular Spend: 1.0x Weight

**Thresholds**:
- `Z > 1.5`: Potential Drift
- `Z > 3.0`: Critical Drift (Triggers Alert)

---

## 2. Risk Acceleration Index (`lib/engines/risk-acceleration.js`)
**Purpose**: Measures the *velocity* and *momentum* of risk to identify rapidly deteriorating customers before they breach thresholds.

### Mathematical Model
We use **Linear Regression Slope Analysis** on cumulative spend/risk vectors.

1. **Velocity ($v$)**: The slope of the daily spend curve over T-30 days.
   $$ v = \frac{n(\sum xy) - (\sum x)(\sum y)}{n(\sum x^2) - (\sum x)^2} $$
   *(where x = days, y = cumulative spend)*

2. **Acceleration ($a$)**: The change in velocity between the first half (T-30 to T-15) and second half (T-15 to Now) of the window.
   $$ a = v_{recent} - v_{historical} $$

**Indicators**:
- `a > 0`: **Accelerating Risk** (Spending capacity depleting faster)
- `a < 0`: **Decelerating Risk** (Stabilization)
- `a ≈ 0`: **Stable Velocity**

---

## 3. Real-time Simulation Engine (`components/RiskCharts.js`)
**Purpose**: Emulates a live socket connection to a transaction processing system.

- **Mechanism**: Client-side state flux loop (2500ms interval).
- **Logic**: Random walk perturbation of risk bucket distributions.
- **Visuals**: CSS Pulse animation + dataset interpolation.
