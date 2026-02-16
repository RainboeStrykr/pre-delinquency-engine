
'use client';

import { useMemo } from 'react';
// Import the Unified Stress Index Engine (which aggregates Drift, Cashflow, Accel)
import { calculateUnifiedIndex } from '@/lib/engines/unified-stress-index';
import { customers } from '@/data/customers';

export default function RiskSignals() {
    // Bulk compute risk profiles for the entire portfolio
    const analysis = useMemo(() => {
        return customers.map(c => {
            const result = calculateUnifiedIndex(c);
            return {
                ...c,
                usi: result.score,
                level: result.level,
                components: result.components // { static, drift, accel, cashflow }
            };
        }).sort((a, b) => b.usi - a.usi); // Sort by highest risk
    }, []);

    const stats = {
        CRITICAL: analysis.filter(c => c.level === 'CRITICAL').length,
        HIGH: analysis.filter(c => c.level === 'HIGH').length,
        MODERATE: analysis.filter(c => c.level === 'MODERATE').length,
        LOW: analysis.filter(c => c.level === 'LOW').length,
    };

    return (
        <div>
            <h2 className="section-title">Portfolio Risk Signals (USI)</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.82rem', marginBottom: '20px', lineHeight: 1.7 }}>
                Real-time analysis using the <strong>Unified Stress Index (USI)</strong>.
                This engine aggregates Behavioral Drift, Spend Velocity, and Cashflow Projections into a single live health score.
            </p>

            {/* Portfolio Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <RiskCard label="Critical" count={stats.CRITICAL} color="red" desc="Imminent Default Risk" />
                <RiskCard label="High" count={stats.HIGH} color="orange" desc="Significant Stress" />
                <RiskCard label="Moderate" count={stats.MODERATE} color="blue" desc="Watchlist / Emerging" />
                <RiskCard label="Low" count={stats.LOW} color="green" desc="Healthy Behavior" />
            </div>

            {/* Detailed Matrix */}
            <div className="panel">
                <div className="panel-header">
                    <h3>Unified Stress Index Matrix</h3>
                </div>
                <div className="panel-body" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                                <th style={{ padding: '12px', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Customer</th>
                                <th style={{ padding: '12px', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>USI Score</th>
                                <th style={{ padding: '12px', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Drift Impact</th>
                                <th style={{ padding: '12px', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Velocity Impact</th>
                                <th style={{ padding: '12px', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Liquidity Gap</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analysis.map((c) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>ID: {c.id}</div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <Badge level={c.level} score={c.usi} />
                                    </td>
                                    {/* Component Breakdown (normalized 0-100 contributions) */}
                                    <td style={{ padding: '12px' }}>
                                        <Bar value={c.components.drift} max={20} color="#3B82F6" />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <Bar value={c.components.accel} max={20} color="#8B5CF6" />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <Bar value={c.components.cashflow} max={40} color="#F59E0B" />
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

// Sub-components for clean rendering
function RiskCard({ label, count, color, desc }) {
    const colors = {
        red: { bg: '#FEF2F2', text: '#DC2626' },
        orange: { bg: '#FFFBEB', text: '#D97706' },
        blue: { bg: '#EFF6FF', text: '#2563EB' },
        green: { bg: '#ECFDF5', text: '#059669' },
    };
    const c = colors[color];
    return (
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: c.text, margin: '8px 0' }}>{count}</div>
            <div style={{ fontSize: '0.75rem', color: c.text, background: c.bg, display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 }}>
                {desc}
            </div>
        </div>
    );
}

function Badge({ level, score }) {
    const styles = {
        CRITICAL: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
        HIGH: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
        MODERATE: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
        LOW: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    };
    const s = styles[level] || styles.LOW;
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '20px',
            background: s.bg, color: s.text, border: `1px solid ${s.border}`
        }}>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{score}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>{level}</span>
        </div>
    );
}

// Simple sparkline-like bar
function Bar({ value, max, color }) {
    // Normalize value against the max weight of that component (approx)
    // E.g. Drift is max ~20 points of USI. 
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div style={{ width: '100px', height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }} />
        </div>
    );
}
