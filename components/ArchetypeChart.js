
'use client';

import { useMemo } from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';
import { customers } from '@/data/customers';
import { getPortfolioClusters } from '@/lib/engines/stress-clustering';
import { MagicBentoCard } from '@/components/MagicBento';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const fontFamily = "'Inter', sans-serif";

export default function ArchetypeChart() {
    const clusterData = useMemo(() => getPortfolioClusters(customers), []);

    const data = {
        labels: clusterData.map(c => c.label),
        datasets: [
            {
                label: '# of Customers',
                data: clusterData.map(c => c.count),
                backgroundColor: clusterData.map(c => c.color + '99'), // Higher opacity for vibrancy
                borderColor: clusterData.map(c => c.color),
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Critical Fix: Allows chart to fill container
        plugins: {
            legend: { display: false }, // Use custom legend below
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1F2937',
                bodyColor: '#4B5563',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (ctx) => {
                        const val = ctx.raw;
                        const total = clusterData.reduce((a, b) => a + b.count, 0);
                        const pct = ((val / total) * 100).toFixed(1) + '%';
                        return ` ${ctx.label}: ${val} (${pct})`;
                    }
                }
            }
        },
        scales: {
            r: {
                ticks: { display: false, backdropColor: 'transparent' },
                grid: { color: '#F3F4F6' },
                pointLabels: { display: false }
            }
        },
        layout: { padding: 10 }
    };

    return (
        <MagicBentoCard className="chart-card" style={{ minHeight: 'auto', aspectRatio: 'unset' }}>
            <h3>Stress Archetype Distribution</h3>
            <div className="chart-container" style={{ position: 'relative', height: '280px', width: '100%' }}>
                <PolarArea data={data} options={options} />
            </div>

            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {clusterData.slice(0, 4).map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#4B5563' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color, flexShrink: 0 }}></span>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                            <span style={{ fontWeight: 600, color: '#111827' }}>{c.pct}%</span>
                            <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{c.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </MagicBentoCard>
    );
}
