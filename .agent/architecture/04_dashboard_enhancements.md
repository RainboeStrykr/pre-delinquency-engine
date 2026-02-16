# Dashboard Enhancements: UI Design for Intelligence

This document outlines the **Visual Components** needed to expose the underlying ML and simulation logic.

## 1. The "Live Risk Ticker" (Global Header)
**Goal:** Create a sense of urgency and real-time activity.
**Location:** Top of the dashboard, below the main header.

*   **Content:** Scrolling list of latest risk events.
*   **Format:** `[Time] [Customer ID] - [Event Type] (Impact)`
*   **Example Items:**
    *   `10:42 AM • CUST-901 • Large ATM Withdrawal detected (-$400)`
    *   `10:45 AM • CUST-284 • Salary Credit MISSING (Day 5)`
    *   `10:48 AM • CUST-112 • Crypto Purchase detected ($2,500)`

**Component Strategy:**
- CSS Animation: `marquee` effect or simple fading <ul> list.
- Data Source: The `useSimulation` hook's event stream.

## 2. The "Fairness Monitor" Widget (Sidebar or Floating)
**Goal:** Prove the model is ethical.
**Location:** Bottom of Sidebar (replacing "Settings" or above it).
**Design:** Compact "Traffic Light" indicator.

*   **Visuals:**
    *   **Green Dot**: "Model Fair (DI > 0.8)"
    *   **Yellow Dot**: "Bias Warning (DI < 0.8)"
    *   **Red Dot**: "Critical Bias (DI < 0.6)"
*   **Tooltip (On Hover):**
    *   "Disparate Impact Ratio: 0.92"
    *   "Protected Group: Age < 25"
    *   "Action: Monitor Only"

## 3. Simulation Control Panel (The "Demo God" Mode)
**Goal:** You need to control the narrative during the presentation.
**Location:** Floating bottom-right widget (Collapsible).

**Controls:**
1.  **Play/Pause**: Stop the timeline to explain a specific customer state.
2.  **Speed Dial**: 1x (Real-time), 10x, 100x (Fast Forward).
3.  **"Inject Shock" Button**:
    - *Scenario A: "Economic Downturn"* (Slash all incomes by 20%).
    - *Scenario B: "Tech Layoffs"* (Remove salary for 5 random High-Income profiles).
    - *Scenario C: "Inflation Spike"* (Increase all 'Discretionary' spend by 15%).

## 4. Enhanced Customer Detail View
**Goal:** Show the "Why", not just the "What".

### A. "Risk Velocity" Gauge
- **Visual**: Speedometer style or simple sparkline.
- **Data**: The rate of change in risk score (+5 points/week).
- **Label**: "Unstable / Accelerating" vs "Stable".

### B. "Cashflow Projection" Chart (The 'Runway' View)
-   **X-Axis**: Next 30 Days.
-   **Y-Axis**: Predicted Balance.
-   **Visuals**:
    -   **Green Line**: Projected Balance.
    -   **Red Dotted Line**: Zero Balance (Day Zero).
    -   **Shaded Area**: Confidence Interval (95% range).
-   **Insight**: "Projected default in **12 Days** if spending continues."

### C. Intervention Action Center
**Goal:** Take action.
-   **Button**: "Approve Payment Holiday" (Primary Action).
-   **Context**: "Reduces probability of default by **18%**."
-   **Feedback**: Clicking triggers a success toast ("Intervention Sent via SMS").

## 5. Portfolio Health Matrix (New "Strategy" Tab)
**Goal:** Macro view for executives.

*   **Chart Type**: Scatter Plot.
*   **Axes**: Risk Score (X) vs. Risk Velocity (Y).
*   **Interaction**: Hover over dots to see Customer ID.
*   **Insight**: Focus on the "Top Right" quadrant (High Score + Fast Velocity). This is the "Critical" segment.

---
**Summary:**
These 5 components transform the dashboard from a static report into a **Command Center**.
1.  Show live activity (**Ticker**).
2.  Control the story (**Simulation Panel**).
3.  Prove ethics (**Fairness Widget**).
4.  Visualize the future (**Cashflow Chart**).
5.  Empower action (**Intervention Center**).
