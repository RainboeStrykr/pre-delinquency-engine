'use client';

import { useState, useCallback, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { formatDate, formatCurrency } from '@/data/customers';
import { calculateBehavioralDrift } from '@/lib/engines/behavioral-drift';
import { calculateRiskAcceleration } from '@/lib/engines/risk-acceleration';
import { calculateProjection } from '@/lib/engines/cashflow-projection';
import { assignArchetype } from '@/lib/engines/stress-clustering';
import { calculateUnifiedIndex } from '@/lib/engines/unified-stress-index';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip, Legend);

const fontFamily = "'Inter', sans-serif";

function statusIcon(status) {
    const icons = { paid: '●', pending: '◐', failed: '✕', bounced: '✕' };
    return icons[status] || '●';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function CustomerDetail({ customer, onBack, onToast }) {
    const [categoryFilter, setCategoryFilter] = useState('All');
    const c = customer;

    // --- 1. Behavioral Drift Calculation (Real-time) ---
    const driftData = useMemo(() => {
        return calculateBehavioralDrift(c.transactions);
    }, [c.transactions]);

    // --- 2. Risk Acceleration Index (Velocity) ---
    const riskVelocity = useMemo(() => {
        return calculateRiskAcceleration(c.transactions, c.riskScore);
    }, [c.transactions, c.riskScore]);

    // --- 3. Cashflow Projection (Liquidity) ---
    const cashflow = useMemo(() => calculateProjection(c), [c]);

    // --- 4. Stress Archetype (Persona) ---
    const archetype = useMemo(() => assignArchetype(c), [c]);

    // --- 5. Unified Stress Index (USI) ---
    const usi = useMemo(() => calculateUnifiedIndex(c), [c]);

    // --- 6. Historical Charts Data (Real) ---
    const { balanceChartConfig, spendChartConfig } = useMemo(() => {
        if (!c.transactions || c.transactions.length === 0) return { balanceChartConfig: null, spendChartConfig: null };

        // Sort chronologically
        const txns = [...c.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

        // A. Balance History (Daily Closing)
        const dateMap = new Map();
        txns.forEach(t => {
            const d = t.date.substring(0, 10);
            if (t.balance_after !== undefined) dateMap.set(d, t.balance_after);
        });

        const dates = Array.from(dateMap.keys());
        const balances = Array.from(dateMap.values());

        const balanceChartConfig = {
            labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [{
                label: 'End-of-Day Balance',
                data: balances,
                borderColor: '#059669', // Emerald 600
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, 'rgba(5, 150, 105, 0.2)');
                    gradient.addColorStop(1, 'rgba(5, 150, 105, 0.0)');
                    return gradient;
                },
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                borderWidth: 2
            }]
        };

        // B. Monthly Spend Trend
        const spendMap = {};
        txns.forEach(t => {
            if (t.amount < 0 && t.category !== 'EMI') { // Exclude EMI? Or include? Include for total burn.
                // Let's exclude Salary/Credit.
                const m = t.date.substring(0, 7); // YYYY-MM
                spendMap[m] = (spendMap[m] || 0) + Math.abs(t.amount);
            }
        });

        const months = Object.keys(spendMap).sort();
        // Limit to last 6 months if huge
        const recentMonths = months.slice(-6);

        const spends = recentMonths.map(m => spendMap[m]);
        const monthLabels = recentMonths.map(m => {
            const [y, mo] = m.split('-');
            const d = new Date(y, parseInt(mo) - 1);
            return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });

        const spendChartConfig = {
            labels: monthLabels,
            datasets: [{
                label: 'Total Outflows',
                data: spends,
                backgroundColor: '#6366F1', // Indigo 500
                borderRadius: 4,
                barPercentage: 0.6
            }]
        };

        return { balanceChartConfig, spendChartConfig };
    }, [c.transactions]);

    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { maxTicksLimit: 6, font: { size: 10 } } },
            y: { grid: { color: '#F3F4F6' }, ticks: { callback: (v) => '₹' + (v / 1000).toFixed(0) + 'k', font: { size: 10 } } }
        },
        interaction: { mode: 'index', intersect: false },
    };

    // Remove legacy chart data logic if present
    const cashflowChartData = useMemo(() => {
        if (!cashflow) return null;
        // Mock start date: Feb 14
        const startDate = new Date('2026-02-14');
        const labels = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        });

        // Identify EMI Date Index for highlighting
        const emiDate = new Date(cashflow.emiDueDate);
        const dayDiff = Math.ceil((emiDate - startDate) / (86400000));

        return {
            labels,
            datasets: [
                {
                    label: 'Projected Balance',
                    data: cashflow.projectedBalances,
                    borderColor: cashflow.status === 'GAP' ? '#EF4444' : (cashflow.status === 'TIGHT' ? '#F59E0B' : '#10B981'),
                    backgroundColor: cashflow.status === 'GAP' ? 'rgba(239, 68, 68, 0.1)' : (cashflow.status === 'TIGHT' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
                    fill: true,
                    tension: 0.4,
                    pointRadius: (ctx) => ctx.dataIndex === dayDiff ? 6 : 0,
                    pointBackgroundColor: '#FFF',
                    pointBorderColor: '#000',
                    pointBorderWidth: 2
                }
            ]
        };
    }, [cashflow]);

    const categories = ['All', ...new Set(c.transactions.map((t) => t.category))];

    const filteredTxns =
        categoryFilter === 'All'
            ? c.transactions
            : c.transactions.filter((t) => t.category === categoryFilter);



    // --- Drift Chart Config ---
    const driftChartData = useMemo(() => {
        const topDrifters = driftData.features.slice(0, 5); // Top 5 drifting categories
        return {
            labels: topDrifters.map(f => f.category),
            datasets: [
                {
                    label: 'Baseline (30d avg)',
                    data: topDrifters.map(f => f.baseline),
                    backgroundColor: '#D1D5DB', // Grey
                    borderRadius: 4,
                },
                {
                    label: 'Current (7d avg)',
                    data: topDrifters.map(f => f.current),
                    backgroundColor: (ctx) => {
                        const idx = ctx.dataIndex;
                        // Red if Z-Score high, Blue otherwise
                        return topDrifters[idx] && topDrifters[idx].zScore > 1.5 ? '#EF4444' : '#3B82F6';
                    },
                    borderRadius: 4,
                }
            ]
        };
    }, [driftData]);

    const handleTrigger = useCallback(() => {
        onToast('✓ Action triggered successfully. Notification sent to relationship manager.');
    }, [onToast]);

    return (
        <div className="text-gray-900">
            {/* Back */}
            <button className="detail-back" onClick={onBack}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                Back to Overview
            </button>

            {/* Summary Card */}
            <div className="customer-summary">
                <div className="summary-risk-circle" style={{
                    background: usi.level === 'CRITICAL' ? '#FEF2F2' : (usi.level === 'HIGH' ? '#FFFBEB' : (usi.level === 'MODERATE' ? '#F0F9FF' : '#ECFDF5')),
                    border: `4px solid ${usi.level === 'CRITICAL' ? '#DC2626' : (usi.level === 'HIGH' ? '#D97706' : (usi.level === 'MODERATE' ? '#0284C7' : '#059669'))}`
                }}>
                    <span className="score risk-score" style={{
                        color: usi.level === 'CRITICAL' ? '#DC2626' : (usi.level === 'HIGH' ? '#D97706' : (usi.level === 'MODERATE' ? '#0284C7' : '#059669')),
                        fontSize: '2rem'
                    }}>{usi.score}</span>
                    <span className="label" style={{
                        color: '#6B7280', fontWeight: 600, fontSize: '0.6rem', marginTop: '2px'
                    }}>
                        USI SCORE
                    </span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>{usi.level}</span>
                </div>
                <div className="summary-info">
                    <div className="customer-id">{c.id}</div>
                    <div style={{ color: 'var(--gray-500)', fontSize: '0.82rem', marginTop: '2px' }}>{c.name}</div>

                    {/* Stress Archetype Badge */}
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '2px 8px', borderRadius: '12px',
                            background: archetype.color + '20', color: archetype.color,
                            border: `1px solid ${archetype.color}40`,
                            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                            <span style={{ fontSize: '1.1em' }}>▣</span>
                            {archetype.label} Profile
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <span className="info-label">Default Probability</span>
                            <span className={`info-value risk-score ${c.riskLevel.toLowerCase()}`}>{c.defaultProb}%</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Last Salary Credit</span>
                            <span className="info-value">{formatDate(c.lastSalary)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Next EMI Due</span>
                            <span className="info-value">{formatDate(c.nextEMI)}</span>
                        </div>
                    </div>
                </div>
                <div className="summary-actions">
                    <span className={`risk-badge ${c.riskLevel.toLowerCase()}`}>{c.riskLevel} risk</span>

                    {/* Risk Acceleration Badge */}
                    <span className="risk-badge" style={{
                        background: riskVelocity.trend === 'DECELERATING' ? '#ECFDF5' : (riskVelocity.trend === 'STABLE' ? '#F3F4F6' : '#FEF2F2'),
                        color: riskVelocity.trend === 'DECELERATING' ? '#059669' : (riskVelocity.trend === 'STABLE' ? '#4B5563' : '#DC2626'),
                        border: `1px solid ${riskVelocity.trend === 'DECELERATING' ? '#A7F3D0' : (riskVelocity.trend === 'STABLE' ? '#E5E7EB' : '#FECACA')}`,
                        marginTop: '4px'
                    }}>
                        Risk Velocity: {riskVelocity.velocity >= 0 ? '+' : ''}{riskVelocity.velocity}/day
                        <span style={{ fontSize: '0.8em', marginLeft: '4px', opacity: 0.8 }}>
                            ({riskVelocity.trend === 'ACCELERATING' ? '↑' : riskVelocity.trend === 'DECELERATING' ? '↓' : '→'})
                        </span>
                    </span>

                    {driftData.level === 'HIGH' && (
                        <span className="risk-badge" style={{ background: '#FFFBEB', color: '#B45309', border: '1px solid #FCD34D', marginTop: '4px' }}>
                            ⚡ Drift Detected
                        </span>
                    )}
                </div>
            </div>

            {/* --- NEW: Behavioral Drift Analysis Panel --- */}
            {true && (
                <div className="panel" style={{ marginBottom: '20px', borderLeft: '4px solid #F59E0B' }}>
                    <div className="panel-header">
                        <h3>Behavioral Drift Analysis</h3>
                        <span className="badge" style={{ background: '#FFFBEB', color: '#B45309' }}>
                            Drift Score: {driftData.score}/100
                        </span>
                    </div>
                    <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {driftData.features.length > 0 ? (
                            <>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: '#4B5563', marginBottom: '12px' }}>
                                        Significant deviation detected in spending patterns compared to historical baseline.
                                        <br /><br />
                                        <strong style={{ color: '#B45309' }}>Key Insight:</strong> The customer is spending
                                        <strong> {((driftData.features[0]?.current / (driftData.features[0]?.baseline || 1) - 1) * 100).toFixed(0)}% more</strong> on
                                        <u> {driftData.features[0]?.category}</u> than usual.
                                    </p>
                                    <div className="stress-card warning">
                                        <span className="stress-label">Primary Drift Driver</span>
                                        <div className="stress-value">{driftData.features[0]?.category}</div>
                                    </div>
                                </div>
                                <div style={{ height: '160px' }}>
                                    <Bar
                                        data={driftChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'bottom' } },
                                            scales: { y: { beginAtZero: true } }
                                        }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div style={{ gridColumn: '1 / -1', color: '#6B7280', fontSize: '0.9rem', fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>
                                Not enough transaction history to calculate behavioral drift.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Detail Grid */}
            <div className="detail-grid">
                {/* 1. Historical Balance (Real) */}
                <div className="panel">
                    <div className="panel-header">
                        <h3>Balance History (6 Mo)</h3>
                    </div>
                    <div className="panel-body" style={{ height: '220px', position: 'relative' }}>
                        {balanceChartConfig ? (
                            <Line data={balanceChartConfig} options={commonChartOptions} />
                        ) : (
                            <div className="empty-state">No Data</div>
                        )}
                    </div>
                </div>

                {/* 2. Monthly Outflow Trend (Real) */}
                <div className="panel">
                    <div className="panel-header">
                        <h3>Monthly Outflow Trend</h3>
                    </div>
                    <div className="panel-body" style={{ height: '220px', position: 'relative' }}>
                        {spendChartConfig ? (
                            <Bar data={spendChartConfig} options={commonChartOptions} />
                        ) : (
                            <div className="empty-state">No Data</div>
                        )}
                    </div>
                </div>

                {/* --- NEW: Cashflow Projection Panel --- */}
                {cashflow && (
                    <div className="panel" style={{ gridColumn: '1 / -1', marginBottom: '8px', borderLeft: cashflow.status === 'GAP' ? '4px solid #EF4444' : (cashflow.status === 'TIGHT' ? '4px solid #F59E0B' : '4px solid #10B981') }}>
                        <div className="panel-header">
                            <h3>30-Day Liquidity Forecast</h3>
                            <span className="badge" style={{
                                background: cashflow.status === 'GAP' ? '#FEF2F2' : (cashflow.status === 'TIGHT' ? '#FFFBEB' : '#ECFDF5'),
                                color: cashflow.status === 'GAP' ? '#DC2626' : (cashflow.status === 'TIGHT' ? '#B45309' : '#059669'),
                                fontWeight: 700
                            }}>
                                STATUS: {cashflow.status}
                            </span>
                        </div>
                        <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                            <div>
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Projected Outcome</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1F2937' }}>
                                        {cashflow.liquidityGap > 0 ? (
                                            <span style={{ color: '#DC2626' }}>-{formatCurrency(cashflow.liquidityGap)} Shortfall</span>
                                        ) : (
                                            <span style={{ color: '#059669' }}>Sufficient Liquidity</span>
                                        )}
                                    </div>
                                </div>

                                <div className="stress-grid" style={{ gridTemplateColumns: '1fr', gap: '8px' }}>
                                    <div className="stress-card" style={{ borderLeft: 'none', background: '#F9FAFB' }}>
                                        <div className="stress-label">Next EMI Liability</div>
                                        <div className="stress-value">{formatCurrency(cashflow.emiAmount)} <span style={{ fontSize: '0.7em', color: '#6B7280' }}>on {formatDate(cashflow.emiDueDate)}</span></div>
                                    </div>
                                    <div className="stress-card" style={{ borderLeft: 'none', background: '#F9FAFB' }}>
                                        <div className="stress-label">Projection Confidence</div>
                                        <div className="stress-value">{cashflow.projectionConfidence}% <span style={{ fontSize: '0.7em', color: '#6B7280' }}>based on volatility</span></div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ height: '200px' }}>
                                <Line
                                    data={cashflowChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                                        scales: {
                                            y: { beginAtZero: true, grid: { color: '#F3F4F6' } },
                                            x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } }
                                        },
                                        interaction: { mode: 'index', intersect: false },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {/* Transaction History & Balance */}
                <div className="panel">
                    <div className="panel-header">
                        <h3>Transaction History</h3>
                    </div>
                    <div className="panel-body">
                        <div className="txn-filters">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`txn-filter-btn${cat === categoryFilter ? ' active' : ''}`}
                                    onClick={() => setCategoryFilter(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="txn-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Category</th>
                                        <th>Amount</th>
                                        <th>Merchant</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTxns.slice(0, 10).map((t, i) => ( // Limit to 10 for perf
                                        <tr key={i}>
                                            <td>{formatDate(t.date)}</td>
                                            <td>{t.category}</td>
                                            <td
                                                style={{
                                                    fontVariantNumeric: 'tabular-nums',
                                                    color: t.amount > 0 ? 'var(--risk-low)' : undefined,
                                                }}
                                            >
                                                {formatCurrency(t.amount)}
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: '#6B7280' }}>{t.merchant}</td>
                                            <td>
                                                <span className={`payment-status ${t.status}`}>
                                                    {statusIcon(t.status)} {capitalize(t.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>


            </div>


        </div>
    );
}
