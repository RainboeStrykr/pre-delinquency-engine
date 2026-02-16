'use client';

import { useState, useCallback } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { formatDate, formatCurrency } from '@/data/customers';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip);

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

    const categories = ['All', ...new Set(c.transactions.map((t) => t.category))];

    const filteredTxns =
        categoryFilter === 'All'
            ? c.transactions
            : c.transactions.filter((t) => t.category === categoryFilter);

    const maxImportance = Math.max(...c.shap.map((s) => s.importance));

    const stressSignals = [
        { label: 'Salary Delay', ...c.stress.salaryDelay },
        { label: 'Savings Decline (WoW)', ...c.stress.savingsDecline },
        { label: 'Auto-Debit Failures', ...c.stress.autoDebitFails },
        { label: 'Discretionary Spend Drop', ...c.stress.discretionaryDrop },
        { label: 'ATM Withdrawal Increase', ...c.stress.atmIncrease },
    ];

    const spendData = {
        labels: ['Dec', 'Jan', 'Feb'],
        datasets: [
            {
                data: c.monthlySpend,
                backgroundColor: ['#93C5FD', '#60A5FA', '#3B82F6'],
                borderRadius: 6,
                barPercentage: 0.5,
            },
        ],
    };

    const spendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: fontFamily, size: 10 }, color: '#9CA3AF' } },
            y: {
                grid: { color: '#F3F4F6' },
                ticks: {
                    font: { family: fontFamily, size: 10 },
                    color: '#9CA3AF',
                    callback: (v) => '₹' + v / 1000 + 'k',
                },
            },
        },
    };

    const balanceData = {
        labels: ['W-6', 'W-5', 'W-4', 'W-3', 'W-2', 'Now'],
        datasets: [
            {
                data: c.balanceTrend,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59,130,246,0.08)',
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                borderWidth: 2,
            },
        ],
    };

    const balanceOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: fontFamily, size: 10 }, color: '#9CA3AF' } },
            y: {
                grid: { color: '#F3F4F6' },
                ticks: {
                    font: { family: fontFamily, size: 10 },
                    color: '#9CA3AF',
                    callback: (v) => '₹' + v / 1000 + 'k',
                },
            },
        },
    };

    const handleTrigger = useCallback(() => {
        onToast('✓ Action triggered successfully. Notification sent to relationship manager.');
    }, [onToast]);

    return (
        <>
            {/* Back */}
            <button className="detail-back" onClick={onBack}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                Back to Overview
            </button>

            {/* Summary Card */}
            <div className="customer-summary">
                <div className={`summary-risk-circle ${c.riskLevel}`}>
                    <span className={`score risk-score ${c.riskLevel}`}>{c.riskScore}</span>
                    <span className="label" style={{ color: `var(--risk-${c.riskLevel})` }}>
                        {c.riskLevel} risk
                    </span>
                </div>
                <div className="summary-info">
                    <div className="customer-id">{c.id}</div>
                    <div style={{ color: 'var(--gray-500)', fontSize: '0.82rem', marginTop: '2px' }}>{c.name}</div>
                    <div className="info-row">
                        <div className="info-item">
                            <span className="info-label">Default Probability</span>
                            <span className={`info-value risk-score ${c.riskLevel}`}>{c.defaultProb}%</span>
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
                    <span className={`risk-badge ${c.riskLevel}`}>{c.riskLevel} risk</span>
                </div>
            </div>

            {/* Transactions + Stress Signals */}
            <div className="detail-grid">
                {/* Transaction History */}
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
                                        <th>Balance</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTxns.map((t, i) => (
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
                                            <td style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(t.balance)}</td>
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
                        <div className="detail-charts-row">
                            <div>
                                <h3 style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '8px' }}>
                                    Monthly Spend
                                </h3>
                                <div className="detail-chart-container">
                                    <Bar data={spendData} options={spendOptions} />
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '8px' }}>
                                    Balance Trend
                                </h3>
                                <div className="detail-chart-container">
                                    <Line data={balanceData} options={balanceOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stress Signals */}
                <div className="panel">
                    <div className="panel-header">
                        <h3>Financial Stress Signals</h3>
                    </div>
                    <div className="panel-body">
                        <div className="stress-grid">
                            {stressSignals.map((sig, i) => (
                                <div key={i} className={`stress-card ${sig.severity}`}>
                                    <div className="stress-label">{sig.label}</div>
                                    <div className="stress-value">
                                        {sig.value}
                                        {sig.unit}
                                        <span className={`stress-arrow ${sig.trend}`}>
                                            {sig.trend === 'up' ? '▲' : '▼'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* SHAP + Interventions */}
            <div className="detail-grid">
                {/* Model Explainability */}
                <div className="panel">
                    <div className="panel-header">
                        <h3>Model Explainability — SHAP</h3>
                    </div>
                    <div className="panel-body">
                        {c.shap.map((s, i) => {
                            const pct = (s.importance / maxImportance) * 100;
                            return (
                                <div key={i} className="shap-bar">
                                    <span className="shap-label">{s.feature}</span>
                                    <div className="shap-track">
                                        <div className="shap-fill" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="shap-value">{(s.importance * 100).toFixed(0)}%</span>
                                </div>
                            );
                        })}
                        <div className="explanation-box">
                            <strong>Model Insight:</strong> {c.explanation}
                        </div>
                    </div>
                </div>

                {/* Interventions */}
                <div className="panel">
                    <div className="panel-header">
                        <h3>Intervention Recommendations</h3>
                    </div>
                    <div className="panel-body">
                        <div className="intervention-list">
                            {c.interventions.map((inv, i) => (
                                <div key={i} className="intervention-item">
                                    <div className="intervention-info">
                                        <span className="intervention-name">{inv.action}</span>
                                        <span className="intervention-confidence">Confidence: {inv.confidence}%</span>
                                    </div>
                                    <button className="btn btn-primary" onClick={handleTrigger}>
                                        {inv.action.includes('Outreach') || inv.action.includes('Notification')
                                            ? 'Trigger Outreach'
                                            : 'Apply Action'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
