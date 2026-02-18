
'use client';

import { useMemo } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { customers } from '@/data/customers';
import { MagicBentoCard } from '@/components/MagicBento';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const fontFamily = "'Inter', sans-serif";

export default function RiskCharts() {

    // Calculate real metrics from the Generated Dataset
    const { riskCounts, archetypeCounts } = useMemo(() => {
        const rCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
        const aCounts = {};

        customers.forEach(c => {
            // Risk Level Normalization
            let level = (c.riskLevel || 'LOW').toUpperCase();
            if (level === 'CRITICAL') level = 'HIGH'; // Group critical into high for simple donut
            if (rCounts[level] !== undefined) rCounts[level]++;
            else rCounts.LOW++;

            // Archetype Aggregation
            // Use the ground-truth archetype from the dataset
            const arch = c.archetype || 'UNCLASSIFIED';
            aCounts[arch] = (aCounts[arch] || 0) + 1;
        });

        // Sort archetypes by count descending
        const sortedArch = Object.entries(aCounts)
            .sort((a, b) => b[1] - a[1]);

        return {
            riskCounts: [rCounts.LOW, rCounts.MEDIUM, rCounts.HIGH],
            archetypeCounts: sortedArch
        };
    }, []);

    const donutData = {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [
            {
                data: riskCounts,
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                borderWidth: 0,
                hoverOffset: 6,
            },
        ],
    };

    const donutOptions = {
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    pointStyleWidth: 8,
                    font: { family: fontFamily, size: 11 },
                    color: '#6B7280',
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const total = riskCounts.reduce((a, b) => a + b, 0);
                        const val = context.raw;
                        const pct = ((val / total) * 100).toFixed(1) + '%';
                        return ` ${context.label}: ${val} (${pct})`;
                    }
                }
            }
        },
    };

    const barData = {
        labels: archetypeCounts.map(([k, v]) => k.replace(/_/g, ' ')), // Format labels
        datasets: [
            {
                label: 'Customers',
                data: archetypeCounts.map(([k, v]) => v),
                backgroundColor: '#6366F1', // Indigo
                borderRadius: 4,
                barPercentage: 0.6,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { family: fontFamily, size: 10 }, color: '#6B7280', autoSkip: false, maxRotation: 45, minRotation: 0 },
            },
            y: {
                grid: { color: '#F3F4F6', drawBorder: false },
                ticks: { display: false }, // Cleaner look
            },
        },
        plugins: {
            legend: { display: false },
        },
    };

    return (
        <div className="charts-row">
            <MagicBentoCard className="chart-card" style={{ minHeight: 'auto', aspectRatio: 'unset' }}>
                <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ marginBottom: 0 }}>Portfolio Risk Split</h3>
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Real-time Distribution</span>
                </div>
                <div className="chart-container donut">
                    <Doughnut data={donutData} options={donutOptions} />
                </div>
            </MagicBentoCard>
            <MagicBentoCard className="chart-card" style={{ minHeight: 'auto', aspectRatio: 'unset' }}>
                <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ marginBottom: 0 }}>Behavioral Archetypes</h3>
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Cluster Analysis</span>
                </div>
                <div className="chart-container bar">
                    <Bar data={barData} options={barOptions} />
                </div>
            </MagicBentoCard>
        </div>
    );
}
