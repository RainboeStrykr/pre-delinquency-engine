'use client';

import { useEffect, useRef } from 'react';
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

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const fontFamily = "'Inter', sans-serif";

export default function RiskCharts() {
    const donutData = {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [
            {
                data: [8151, 3412, 1284],
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                borderWidth: 0,
                hoverOffset: 6,
            },
        ],
    };

    const donutOptions = {
        cutout: '68%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 8,
                    font: { family: fontFamily, size: 11, weight: '500' },
                    color: '#6B7280',
                },
            },
        },
    };

    const trendData = {
        labels: ['December', 'January', 'February'],
        datasets: [
            {
                label: 'Low',
                data: [8420, 8290, 8151],
                backgroundColor: '#10B981',
                borderRadius: 4,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
            },
            {
                label: 'Medium',
                data: [3180, 3310, 3412],
                backgroundColor: '#F59E0B',
                borderRadius: 4,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
            },
            {
                label: 'High',
                data: [1100, 1200, 1284],
                backgroundColor: '#EF4444',
                borderRadius: 4,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
            },
        ],
    };

    const trendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { family: fontFamily, size: 11 }, color: '#9CA3AF' },
            },
            y: {
                grid: { color: '#F3F4F6' },
                ticks: { font: { family: fontFamily, size: 11 }, color: '#9CA3AF' },
                beginAtZero: true,
            },
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 8,
                    font: { family: fontFamily, size: 11, weight: '500' },
                    color: '#6B7280',
                },
            },
        },
    };

    return (
        <div className="charts-row">
            <div className="chart-card">
                <h3>Risk Distribution</h3>
                <div className="chart-container donut">
                    <Doughnut data={donutData} options={donutOptions} />
                </div>
            </div>
            <div className="chart-card">
                <h3>
                    Risk Trend <span className="section-subtitle">Last 3 Months</span>
                </h3>
                <div className="chart-container bar">
                    <Bar data={trendData} options={trendOptions} />
                </div>
            </div>
        </div>
    );
}
