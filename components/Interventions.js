'use client';

import { customers } from '@/data/customers';

const interventionTypes = [
    {
        id: 'emi_restructuring',
        name: 'EMI Restructuring',
        category: 'Financial Relief',
        icon: '📊',
        description: 'Modify the customer\'s EMI schedule by extending the loan tenure, reducing monthly installment amounts, or adjusting interest rates to make repayments more manageable.',
        howItWorks: [
            'System identifies customers with high default probability (>25%) and recurring payment stress signals.',
            'Restructuring options are generated based on remaining loan amount, income pattern, and stress severity.',
            'Options typically include: tenure extension (6–24 months), EMI reduction (10–30%), or moratorium on principal.',
            'Once triggered, the restructuring proposal is sent to the customer via their preferred channel and routed to the loan operations team for approval.',
        ],
        eligibility: 'Risk score ≥ 61, at least 1 failed auto-debit, and salary delay > 3 days.',
        typicalConfidence: '80–95%',
        turnaround: '24–48 hours for approval',
        riskLevel: 'high',
    },
    {
        id: 'payment_holiday',
        name: 'Payment Holiday',
        category: 'Financial Relief',
        icon: '🗓️',
        description: 'Offer a temporary pause on EMI payments (1–3 months) to give the customer breathing room during acute financial stress, with interest accrual options.',
        howItWorks: [
            'Triggered when a customer shows sudden, severe financial distress — e.g., salary delayed >10 days, savings depleted >25%.',
            'The holiday period is calculated based on stress severity: 1 month (moderate), 2 months (severe), 3 months (critical).',
            'Interest may continue to accrue (standard) or be partially waived (for critical cases), depending on bank policy.',
            'Customer receives a formal offer with terms. Acceptance auto-pauses collection activity on the account.',
        ],
        eligibility: 'Risk score ≥ 71, savings decline >15% WoW, or salary delay >7 days.',
        typicalConfidence: '70–90%',
        turnaround: '12–24 hours for activation',
        riskLevel: 'high',
    },
    {
        id: 'soft_outreach',
        name: 'Soft Outreach Notification',
        category: 'Communication',
        icon: '💬',
        description: 'Send a personalized, non-threatening communication to the customer acknowledging potential financial difficulty and offering assistance — via SMS, email, in-app message, or WhatsApp.',
        howItWorks: [
            'System auto-generates a personalized message based on the customer\'s specific stress signals (e.g., "We noticed a change in your payment pattern").',
            'Messages are designed to be empathetic and solution-oriented — never punitive.',
            'Channel selection is automatic based on customer engagement history (highest open-rate channel is prioritized).',
            'Response tracking monitors if the customer engages with the message, clicks support links, or calls the helpline.',
        ],
        eligibility: 'Risk score ≥ 31. This is the first-line intervention for all medium+ risk customers.',
        typicalConfidence: '80–95%',
        turnaround: 'Immediate (automated)',
        riskLevel: 'medium',
    },
    {
        id: 'financial_wellness',
        name: 'Financial Wellness Tips',
        category: 'Communication',
        icon: '📘',
        description: 'Deliver targeted financial literacy content — budgeting tips, savings strategies, and expense management guidance — tailored to the customer\'s specific spending patterns.',
        howItWorks: [
            'Content is selected from a curated library based on the customer\'s dominant stress signal (e.g., high discretionary spend → budgeting tips).',
            'Delivered as a series of 3–5 messages over 2 weeks via the customer\'s preferred channel.',
            'Includes interactive tools: budget calculator link, savings goal setter, expense tracker.',
            'Engagement is tracked. If the customer engages, risk score adjustment factor is applied (+5% positive signal).',
        ],
        eligibility: 'Risk score 31–60. Best suited for medium-risk customers showing early stress.',
        typicalConfidence: '70–85%',
        turnaround: 'Immediate (automated)',
        riskLevel: 'low',
    },
    {
        id: 'rm_assignment',
        name: 'Assign Relationship Manager',
        category: 'Personal Engagement',
        icon: '👤',
        description: 'Escalate the customer to a dedicated Relationship Manager for personalized, one-on-one financial counseling and solution design.',
        howItWorks: [
            'Triggered for critical-risk customers where automated interventions alone are insufficient.',
            'An RM is assigned from the collections prevention team based on workload balancing and customer segment.',
            'The RM receives a full risk dossier: risk score, stress signals, transaction history, SHAP analysis, and recommended actions.',
            'RM initiates contact within 24 hours and works with the customer to design a personalized recovery plan.',
        ],
        eligibility: 'Risk score ≥ 81, or 3+ critical stress signals simultaneously.',
        typicalConfidence: '85–95%',
        turnaround: 'RM contact within 24 hours',
        riskLevel: 'high',
    },
    {
        id: 'loyalty_offer',
        name: 'Proactive Loyalty Offer',
        category: 'Retention',
        icon: '⭐',
        description: 'For low-risk customers showing minor stress, offer a positive incentive — cashback, fee waiver, or rate discount — to strengthen loyalty and prevent any deterioration.',
        howItWorks: [
            'Targets low-risk customers (score < 30) with long account tenure who show very mild early signals.',
            'Offers are selected from a configurable menu: 0.25% rate reduction, annual fee waiver, or cashback on next 3 EMIs.',
            'Framed positively as a "valued customer" benefit, not as a stress response.',
            'Cost-benefit analysis ensures the offer cost is below the projected loss from potential delinquency.',
        ],
        eligibility: 'Risk score < 30, account age > 12 months, no payment failures in 6 months.',
        typicalConfidence: '65–80%',
        turnaround: 'Immediate (automated)',
        riskLevel: 'low',
    },
    {
        id: 'credit_limit',
        name: 'Credit Limit Increase',
        category: 'Retention',
        icon: '💳',
        description: 'Proactively increase the customer\'s credit limit to provide additional financial runway and demonstrate trust, applicable only to low-risk customers with strong repayment history.',
        howItWorks: [
            'Only offered to customers with consistent low-risk scores (< 25) and no stress signals.',
            'Limit increase amount is calculated based on income trajectory, account behavior, and existing utilization.',
            'Requires automated credit policy engine approval. Typical increases: 15–30% of current limit.',
            'Communicated as a reward for good financial behavior.',
        ],
        eligibility: 'Risk score < 25, zero auto-debit failures, salary always on time, savings stable or growing.',
        typicalConfidence: '85–95%',
        turnaround: '24 hours (credit policy review)',
        riskLevel: 'low',
    },
];

const categories = [...new Set(interventionTypes.map((i) => i.category))];

export default function Interventions() {
    // Count how many customers currently have each intervention recommended
    const interventionUsage = interventionTypes.map((intv) => {
        let count = 0;
        customers.forEach((c) => {
            if (c.interventions.some((ci) => ci.action.toLowerCase().includes(intv.name.toLowerCase().split(' ')[0]))) {
                count++;
            }
        });
        return { ...intv, activeCount: count };
    });

    return (
        <div>
            <h2 className="section-title">Intervention Actions</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.82rem', marginBottom: '12px', lineHeight: 1.7 }}>
                The Pre-Delinquency Engine recommends targeted intervention actions based on each customer&apos;s risk profile, stress signals, and predicted default probability.
                These actions are designed to prevent delinquency through early, empathetic engagement.
            </p>

            {/* Cross-reference callout */}
            <div className="explanation-box" style={{ marginBottom: '24px' }}>
                <strong>How to trigger interventions:</strong> Navigate to any customer&apos;s detail page (via Overview or Customer Explorer), scroll to the
                <strong> Intervention Recommendations</strong> panel, and click <strong>&quot;Trigger Outreach&quot;</strong> or <strong>&quot;Apply Action&quot;</strong> on the recommended action.
                The system auto-selects the best interventions based on the customer&apos;s SHAP analysis and stress signals.
            </div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div className="metric-card">
                    <div className="metric-label">Total Actions Available</div>
                    <div className="metric-value">{interventionTypes.length}</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Categories</div>
                    <div className="metric-value">{categories.length}</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Automated Actions</div>
                    <div className="metric-value">4</div>
                    <span className="metric-change down">Instant delivery</span>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Manual Review Actions</div>
                    <div className="metric-value">3</div>
                    <span className="metric-change neutral">12–48 hr turnaround</span>
                </div>
            </div>

            {/* Intervention Escalation Ladder */}
            <div className="panel" style={{ marginBottom: '24px' }}>
                <div className="panel-header">
                    <h3>Intervention Escalation Ladder</h3>
                </div>
                <div className="panel-body">
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.78rem', marginBottom: '16px', lineHeight: 1.6 }}>
                        Interventions follow an escalation model. Lower-intensity actions are tried first; if the customer&apos;s risk does not improve within 2 weeks, the system
                        automatically escalates to the next tier.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                        {[
                            { tier: 'Tier 1', label: 'Preventive', actions: 'Financial Wellness Tips, Loyalty Offer, Credit Limit Increase', color: 'var(--risk-low)', bg: 'var(--risk-low-bg)', score: '< 40' },
                            { tier: 'Tier 2', label: 'Awareness', actions: 'Soft Outreach Notification', color: 'var(--risk-medium)', bg: 'var(--risk-medium-bg)', score: '40–60' },
                            { tier: 'Tier 3', label: 'Active Support', actions: 'EMI Restructuring, Payment Holiday', color: 'var(--risk-high)', bg: 'var(--risk-high-bg)', score: '61–80' },
                            { tier: 'Tier 4', label: 'Critical Care', actions: 'Assign Relationship Manager + Restructuring', color: 'var(--risk-high)', bg: '#FEE2E2', score: '81–100' },
                        ].map((t, i) => (
                            <div key={i} style={{
                                flex: 1, padding: '16px', borderRadius: '10px', background: t.bg,
                                borderLeft: `3px solid ${t.color}`, display: 'flex', flexDirection: 'column', gap: '6px'
                            }}>
                                <div style={{ fontSize: '0.65rem', color: t.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.tier}</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-800)' }}>{t.label}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)', lineHeight: 1.5, flex: 1 }}>{t.actions}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--gray-400)', fontWeight: 500 }}>Score: {t.score}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Action Cards */}
            {categories.map((cat) => (
                <div key={cat}>
                    <h2 className="section-title" style={{ marginTop: '8px', marginBottom: '12px' }}>{cat}</h2>
                    {interventionUsage
                        .filter((i) => i.category === cat)
                        .map((intv) => (
                            <div className="panel" key={intv.id} style={{ marginBottom: '16px' }}>
                                <div className="panel-header">
                                    <h3>
                                        <span style={{ marginRight: '8px' }}>{intv.icon}</span>
                                        {intv.name}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {intv.activeCount > 0 && (
                                            <span style={{
                                                fontSize: '0.68rem', padding: '3px 10px', borderRadius: '20px',
                                                background: 'var(--primary-50)', color: 'var(--primary-600)', fontWeight: 600
                                            }}>
                                                {intv.activeCount} customer{intv.activeCount > 1 ? 's' : ''} recommended
                                            </span>
                                        )}
                                        <span className={`risk-badge ${intv.riskLevel}`}>
                                            {intv.riskLevel === 'high' ? 'High Risk' : intv.riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
                                        </span>
                                    </div>
                                </div>
                                <div className="panel-body">
                                    <p style={{ color: 'var(--gray-600)', fontSize: '0.82rem', marginBottom: '16px', lineHeight: 1.6 }}>
                                        {intv.description}
                                    </p>

                                    {/* How it works */}
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                                            How It Works
                                        </div>
                                        <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {intv.howItWorks.map((step, i) => (
                                                <li key={i} style={{ fontSize: '0.78rem', color: 'var(--gray-600)', lineHeight: 1.6 }}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>

                                    {/* Metadata grid */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
                                        padding: '14px', background: 'var(--gray-50)', borderRadius: '8px'
                                    }}>
                                        <div>
                                            <span style={{ color: 'var(--gray-400)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>Eligibility</span>
                                            <div style={{ color: 'var(--gray-700)', marginTop: '4px', fontSize: '0.78rem', fontWeight: 500 }}>{intv.eligibility}</div>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--gray-400)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>Confidence Range</span>
                                            <div style={{ color: 'var(--gray-700)', marginTop: '4px', fontSize: '0.78rem', fontWeight: 500 }}>{intv.typicalConfidence}</div>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--gray-400)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>Turnaround</span>
                                            <div style={{ color: 'var(--gray-700)', marginTop: '4px', fontSize: '0.78rem', fontWeight: 500 }}>{intv.turnaround}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            ))}
        </div>
    );
}
