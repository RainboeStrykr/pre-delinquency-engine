'use client';

import { customers } from '@/data/customers';

const signalDefinitions = [
    {
        id: 'salary_delay',
        name: 'Salary Credit Delay',
        description: 'Number of days salary credit is delayed compared to the customer\'s usual salary date pattern.',
        dataSource: 'Account credit transactions tagged as salary',
        thresholds: [
            { level: 'Normal', range: '0 days', color: 'low' },
            { level: 'Warning', range: '1–5 days', color: 'medium' },
            { level: 'Critical', range: '> 5 days', color: 'high' },
        ],
        weight: 0.25,
        logic: 'Compare current month salary credit date against rolling 6-month average salary date. Flag if delta exceeds threshold.',
    },
    {
        id: 'savings_decline',
        name: 'Week-over-Week Savings Decline',
        description: 'Percentage decline in savings/current account balance compared to the same day in the previous week.',
        dataSource: 'Daily closing balance snapshots',
        thresholds: [
            { level: 'Normal', range: '< 5%', color: 'low' },
            { level: 'Warning', range: '5–15%', color: 'medium' },
            { level: 'Critical', range: '> 15%', color: 'high' },
        ],
        weight: 0.20,
        logic: 'Calculate (Balance_W-1 − Balance_W) / Balance_W-1 × 100. Flag if consecutive 2+ weeks show decline above threshold.',
    },
    {
        id: 'auto_debit_fails',
        name: 'Auto-Debit / Standing Instruction Failures',
        description: 'Count of failed auto-debits (EMI, SIP, insurance, utility) in the current billing cycle.',
        dataSource: 'Payment gateway response codes + NACH mandate status',
        thresholds: [
            { level: 'Normal', range: '0', color: 'low' },
            { level: 'Warning', range: '1', color: 'medium' },
            { level: 'Critical', range: '≥ 2', color: 'high' },
        ],
        weight: 0.20,
        logic: 'Count all auto-debit transactions with status "failed" or "bounced" in the last 30 days. Consecutive failures in the same mandate carry extra weight.',
    },
    {
        id: 'discretionary_drop',
        name: 'Discretionary Spending Drop',
        description: 'Percentage decline in non-essential spending (dining, entertainment, shopping, travel) versus the 3-month rolling average.',
        dataSource: 'MCC-classified debit transactions',
        thresholds: [
            { level: 'Normal', range: '< 5%', color: 'low' },
            { level: 'Warning', range: '5–15%', color: 'medium' },
            { level: 'Critical', range: '> 15%', color: 'high' },
        ],
        weight: 0.15,
        logic: 'Aggregate discretionary MCC codes spend for current month vs 3-month rolling avg. A sharp drop signals the customer is consciously cutting back—an early stress indicator.',
    },
    {
        id: 'atm_increase',
        name: 'ATM Withdrawal Increase',
        description: 'Percentage increase in ATM cash withdrawals compared to the 3-month rolling average, suggesting cash hoarding behavior.',
        dataSource: 'ATM transaction logs',
        thresholds: [
            { level: 'Normal', range: '< 10%', color: 'low' },
            { level: 'Warning', range: '10–30%', color: 'medium' },
            { level: 'Critical', range: '> 30%', color: 'high' },
        ],
        weight: 0.10,
        logic: 'Compare current month ATM withdrawal amount to 3-month rolling average. Spike in cash withdrawals often precedes delinquency as customers shift to cash-based spending.',
    },
];

const riskScoringRules = [
    { range: '0 – 30', level: 'Low', color: 'low', action: 'No intervention. Standard monitoring.' },
    { range: '31 – 60', level: 'Medium', color: 'medium', action: 'Soft outreach. Financial wellness tips. Monitor weekly.' },
    { range: '61 – 80', level: 'High', color: 'high', action: 'Proactive engagement. Offer restructuring options. Assign RM.' },
    { range: '81 – 100', level: 'Critical', color: 'high', action: 'Immediate intervention. EMI holiday / restructuring. Escalate to collections prevention.' },
];

function getSignalValue(customer, signalId) {
    const map = {
        salary_delay: customer.stress.salaryDelay,
        savings_decline: customer.stress.savingsDecline,
        auto_debit_fails: customer.stress.autoDebitFails,
        discretionary_drop: customer.stress.discretionaryDrop,
        atm_increase: customer.stress.atmIncrease,
    };
    return map[signalId];
}

export default function RiskSignals() {
    // Count customers by severity per signal
    const signalStats = signalDefinitions.map((sig) => {
        let normal = 0, warning = 0, critical = 0;
        customers.forEach((c) => {
            const val = getSignalValue(c, sig.id);
            if (val.severity === 'danger') critical++;
            else if (val.severity === 'warning') warning++;
            else normal++;
        });
        return { ...sig, normal, warning, critical };
    });

    return (
        <div>
            <h2 className="section-title">Risk Signals — Flagging Criteria</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.82rem', marginBottom: '20px', lineHeight: 1.7 }}>
                The Pre-Delinquency Engine monitors five financial stress signals per customer. Each signal is evaluated against defined thresholds to determine severity.
                Signals are weighted and combined into a composite risk score (0–100).
            </p>

            {/* Risk Score Bands */}
            <div className="panel" style={{ marginBottom: '20px' }}>
                <div className="panel-header">
                    <h3>Composite Risk Score Bands</h3>
                </div>
                <div className="panel-body">
                    <table>
                        <thead>
                            <tr>
                                <th>Score Range</th>
                                <th>Risk Level</th>
                                <th>Recommended Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riskScoringRules.map((rule, i) => (
                                <tr key={i} style={{ cursor: 'default' }}>
                                    <td style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{rule.range}</td>
                                    <td><span className={`risk-badge ${rule.color}`}>{rule.level}</span></td>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>{rule.action}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="explanation-box" style={{ marginTop: '16px' }}>
                        <strong>Scoring Formula:</strong> Risk Score = Σ (Signal Weight × Signal Severity Factor) × 100.
                        Severity factors: Normal = 0.0, Warning = 0.5, Critical = 1.0.
                        Consecutive critical signals across multiple categories receive a 1.15× compounding multiplier.
                    </div>
                </div>
            </div>

            {/* Signal Definitions */}
            <h2 className="section-title" style={{ marginTop: '8px' }}>Signal Definitions &amp; Thresholds</h2>

            {signalStats.map((sig) => (
                <div className="panel" key={sig.id} style={{ marginBottom: '16px' }}>
                    <div className="panel-header">
                        <h3>{sig.name}</h3>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 500 }}>
                            Weight: {(sig.weight * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="panel-body">
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.82rem', marginBottom: '14px', lineHeight: 1.6 }}>
                            {sig.description}
                        </p>

                        {/* Thresholds */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                            {sig.thresholds.map((t, i) => (
                                <div
                                    key={i}
                                    className={`stress-card ${t.color === 'high' ? 'danger' : t.color === 'medium' ? 'warning' : ''}`}
                                >
                                    <div className="stress-label">{t.level}</div>
                                    <div className="stress-value" style={{ fontSize: '1rem' }}>{t.range}</div>
                                </div>
                            ))}
                        </div>

                        {/* Portfolio impact */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
                            <div style={{
                                flex: 1, padding: '10px 14px', borderRadius: '8px',
                                background: 'var(--risk-low-bg)', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--risk-low)' }}>{sig.normal}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Normal</div>
                            </div>
                            <div style={{
                                flex: 1, padding: '10px 14px', borderRadius: '8px',
                                background: 'var(--risk-medium-bg)', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--risk-medium)' }}>{sig.warning}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Warning</div>
                            </div>
                            <div style={{
                                flex: 1, padding: '10px 14px', borderRadius: '8px',
                                background: 'var(--risk-high-bg)', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--risk-high)' }}>{sig.critical}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Critical</div>
                            </div>
                        </div>

                        {/* Details */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                            padding: '14px', background: 'var(--gray-50)', borderRadius: '8px', fontSize: '0.78rem'
                        }}>
                            <div>
                                <span style={{ color: 'var(--gray-400)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>Data Source</span>
                                <div style={{ color: 'var(--gray-700)', marginTop: '4px', fontWeight: 500 }}>{sig.dataSource}</div>
                            </div>
                            <div>
                                <span style={{ color: 'var(--gray-400)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>Detection Logic</span>
                                <div style={{ color: 'var(--gray-700)', marginTop: '4px', fontWeight: 500 }}>{sig.logic}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Customer Signal Matrix */}
            <h2 className="section-title" style={{ marginTop: '8px' }}>Customer Signal Matrix</h2>
            <div className="panel">
                <div className="panel-header">
                    <h3>Current Signal Status by Customer</h3>
                </div>
                <div className="panel-body" style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Salary Delay</th>
                                <th>Savings Decline</th>
                                <th>Auto-Debit Fails</th>
                                <th>Discr. Spend Drop</th>
                                <th>ATM Increase</th>
                                <th>Risk Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((c) => (
                                <tr key={c.id} style={{ cursor: 'default' }}>
                                    <td>
                                        <strong>{c.id}</strong>
                                        <br />
                                        <span style={{ color: 'var(--gray-400)', fontSize: '0.7rem' }}>{c.name}</span>
                                    </td>
                                    <td>
                                        <span className={`risk-badge ${severityToBadge(c.stress.salaryDelay.severity)}`}>
                                            {c.stress.salaryDelay.value}{c.stress.salaryDelay.unit}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`risk-badge ${severityToBadge(c.stress.savingsDecline.severity)}`}>
                                            {c.stress.savingsDecline.value}{c.stress.savingsDecline.unit}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`risk-badge ${severityToBadge(c.stress.autoDebitFails.severity)}`}>
                                            {c.stress.autoDebitFails.value}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`risk-badge ${severityToBadge(c.stress.discretionaryDrop.severity)}`}>
                                            {c.stress.discretionaryDrop.value}{c.stress.discretionaryDrop.unit}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`risk-badge ${severityToBadge(c.stress.atmIncrease.severity)}`}>
                                            {c.stress.atmIncrease.value}{c.stress.atmIncrease.unit}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`risk-score ${c.riskLevel}`} style={{ fontSize: '1rem' }}>{c.riskScore}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function severityToBadge(severity) {
    if (severity === 'danger') return 'high';
    if (severity === 'warning') return 'medium';
    return 'low';
}
