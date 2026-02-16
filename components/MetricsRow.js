'use client';

import { portfolioMetrics } from '@/data/customers';

export default function MetricsRow() {
    return (
        <div className="metrics-row">
            {portfolioMetrics.map((m, i) => (
                <div key={i} className={`metric-card${m.highlighted ? ' highlighted' : ''}`}>
                    <div className="metric-label">{m.label}</div>
                    <div className="metric-value">{m.value}</div>
                    <span className={`metric-change ${m.direction}`}>
                        {m.direction === 'up' ? '↑' : m.direction === 'down' ? '↓' : '→'} {m.change}
                    </span>
                </div>
            ))}
        </div>
    );
}
