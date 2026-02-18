'use client';

import { portfolioMetrics } from '@/data/customers';
import { MagicBentoCard } from '@/components/MagicBento';

export default function MetricsRow() {
    return (
        <div className="metrics-row">
            {portfolioMetrics.map((m, i) => (
                <MagicBentoCard key={i} className={`metric-card${m.highlighted ? ' highlighted' : ''}`} style={{ minHeight: 'auto', aspectRatio: 'unset', padding: '20px' }}>
                    <div className="metric-label">{m.label}</div>
                    <div className="metric-value">{m.value}</div>
                    <span className={`metric-change ${m.direction}`}>
                        {m.direction === 'up' ? '↑' : m.direction === 'down' ? '↓' : '→'} {m.change}
                    </span>
                </MagicBentoCard>
            ))}
        </div>
    );
}
