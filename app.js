// ============================================================
// Pre-Delinquency Intervention Engine — Application Logic
// ============================================================

(function () {
  'use strict';

  // ===== MOCK DATA =====
  const customers = [
    {
      id: 'CUST-2024-78312',
      name: 'Rajesh Kumar',
      riskScore: 82,
      riskLevel: 'high',
      defaultProb: 34.2,
      lastSalary: '2026-01-22',
      nextEMI: '2026-02-20',
      salaryStatus: 'Delayed (7 days)',
      stress: {
        salaryDelay: { value: 7, unit: 'days', trend: 'up', severity: 'danger' },
        savingsDecline: { value: 18.4, unit: '%', trend: 'up', severity: 'danger' },
        autoDebitFails: { value: 2, unit: '', trend: 'up', severity: 'danger' },
        discretionaryDrop: { value: 12.1, unit: '%', trend: 'down', severity: 'warning' },
        atmIncrease: { value: 35.0, unit: '%', trend: 'up', severity: 'warning' }
      },
      shap: [
        { feature: 'Salary Credit Delay', importance: 0.38 },
        { feature: 'Savings Balance Trend', importance: 0.27 },
        { feature: 'Auto-Debit Failures', importance: 0.18 },
        { feature: 'Discretionary Spend Δ', importance: 0.10 },
        { feature: 'ATM Withdrawal Freq.', importance: 0.07 }
      ],
      explanation: 'Customer flagged high risk due to delayed salary (7 days), declining savings balance (-18.4% WoW), and 2 failed auto-debits in the current cycle.',
      interventions: [
        { action: 'Offer EMI Restructuring', confidence: 87 },
        { action: 'Payment Holiday (1 month)', confidence: 72 },
        { action: 'Soft Outreach Notification', confidence: 93 }
      ],
      transactions: [
        { date: '2026-02-14', category: 'Grocery', amount: -3200, balance: 28400, status: 'paid' },
        { date: '2026-02-12', category: 'EMI', amount: -15000, balance: 31600, status: 'paid' },
        { date: '2026-02-10', category: 'Utility', amount: -2800, balance: 46600, status: 'paid' },
        { date: '2026-02-08', category: 'ATM', amount: -10000, balance: 49400, status: 'paid' },
        { date: '2026-02-05', category: 'Auto-Debit', amount: -5000, balance: 59400, status: 'failed' },
        { date: '2026-02-03', category: 'Shopping', amount: -4500, balance: 64400, status: 'paid' },
        { date: '2026-01-30', category: 'Transfer', amount: -8000, balance: 68900, status: 'paid' },
        { date: '2026-01-27', category: 'Auto-Debit', amount: -5000, balance: 76900, status: 'failed' },
        { date: '2026-01-25', category: 'Fuel', amount: -3200, balance: 81900, status: 'paid' },
        { date: '2026-01-22', category: 'Salary', amount: 85000, balance: 85100, status: 'paid' },
        { date: '2026-01-20', category: 'Grocery', amount: -2800, balance: 100, status: 'paid' },
        { date: '2026-01-18', category: 'Utility', amount: -4200, balance: 2900, status: 'paid' },
        { date: '2026-01-15', category: 'EMI', amount: -15000, balance: 7100, status: 'bounced' },
        { date: '2026-01-12', category: 'Shopping', amount: -6500, balance: 22100, status: 'paid' },
        { date: '2026-01-10', category: 'ATM', amount: -5000, balance: 28600, status: 'paid' }
      ],
      monthlySpend: [42000, 48500, 53200],
      balanceTrend: [95000, 88000, 72000, 64000, 49000, 28400]
    },
    {
      id: 'CUST-2024-56201',
      name: 'Priya Sharma',
      riskScore: 68,
      riskLevel: 'medium',
      defaultProb: 18.7,
      lastSalary: '2026-02-01',
      nextEMI: '2026-02-18',
      salaryStatus: 'On Time',
      stress: {
        salaryDelay: { value: 0, unit: 'days', trend: 'down', severity: '' },
        savingsDecline: { value: 9.2, unit: '%', trend: 'up', severity: 'warning' },
        autoDebitFails: { value: 1, unit: '', trend: 'up', severity: 'warning' },
        discretionaryDrop: { value: 5.6, unit: '%', trend: 'down', severity: '' },
        atmIncrease: { value: 12.0, unit: '%', trend: 'up', severity: '' }
      },
      shap: [
        { feature: 'Savings Balance Trend', importance: 0.32 },
        { feature: 'Auto-Debit Failures', importance: 0.24 },
        { feature: 'Discretionary Spend Δ', importance: 0.19 },
        { feature: 'Credit Utilization', importance: 0.14 },
        { feature: 'Payment Regularity', importance: 0.11 }
      ],
      explanation: 'Customer flagged medium risk due to declining savings (-9.2% WoW), 1 failed auto-debit, and elevated credit utilization at 78%.',
      interventions: [
        { action: 'Soft Outreach Notification', confidence: 88 },
        { action: 'Offer EMI Restructuring', confidence: 61 },
        { action: 'Financial Wellness Tips', confidence: 79 }
      ],
      transactions: [
        { date: '2026-02-13', category: 'Shopping', amount: -7800, balance: 42200, status: 'paid' },
        { date: '2026-02-11', category: 'Grocery', amount: -4100, balance: 50000, status: 'paid' },
        { date: '2026-02-08', category: 'Utility', amount: -3500, balance: 54100, status: 'paid' },
        { date: '2026-02-05', category: 'Auto-Debit', amount: -8000, balance: 57600, status: 'failed' },
        { date: '2026-02-03', category: 'Transfer', amount: -5000, balance: 65600, status: 'paid' },
        { date: '2026-02-01', category: 'Salary', amount: 72000, balance: 70600, status: 'paid' },
        { date: '2026-01-28', category: 'EMI', amount: -12000, balance: -1400, status: 'paid' },
        { date: '2026-01-25', category: 'Shopping', amount: -5600, balance: 10600, status: 'paid' },
        { date: '2026-01-22', category: 'Fuel', amount: -2800, balance: 16200, status: 'paid' },
        { date: '2026-01-18', category: 'Grocery', amount: -3400, balance: 19000, status: 'paid' }
      ],
      monthlySpend: [38000, 41200, 44500],
      balanceTrend: [78000, 70600, 57600, 50000, 42200, 42200]
    },
    {
      id: 'CUST-2024-91047',
      name: 'Amit Patel',
      riskScore: 91,
      riskLevel: 'high',
      defaultProb: 52.8,
      lastSalary: '2026-01-18',
      nextEMI: '2026-02-17',
      salaryStatus: 'Delayed (14 days)',
      stress: {
        salaryDelay: { value: 14, unit: 'days', trend: 'up', severity: 'danger' },
        savingsDecline: { value: 31.5, unit: '%', trend: 'up', severity: 'danger' },
        autoDebitFails: { value: 3, unit: '', trend: 'up', severity: 'danger' },
        discretionaryDrop: { value: 24.3, unit: '%', trend: 'down', severity: 'danger' },
        atmIncrease: { value: 58.0, unit: '%', trend: 'up', severity: 'danger' }
      },
      shap: [
        { feature: 'Salary Credit Delay', importance: 0.42 },
        { feature: 'Auto-Debit Failures', importance: 0.25 },
        { feature: 'Savings Balance Trend', importance: 0.17 },
        { feature: 'ATM Withdrawal Freq.', importance: 0.10 },
        { feature: 'Loan-to-Income Ratio', importance: 0.06 }
      ],
      explanation: 'Critical risk: Salary delayed by 14 days, 3 consecutive auto-debit failures, savings depleted by 31.5%. Immediate intervention recommended.',
      interventions: [
        { action: 'Offer EMI Restructuring', confidence: 94 },
        { action: 'Payment Holiday (2 months)', confidence: 86 },
        { action: 'Assign Relationship Manager', confidence: 91 }
      ],
      transactions: [
        { date: '2026-02-12', category: 'ATM', amount: -15000, balance: 8200, status: 'paid' },
        { date: '2026-02-10', category: 'Auto-Debit', amount: -6000, balance: 23200, status: 'failed' },
        { date: '2026-02-07', category: 'Grocery', amount: -2100, balance: 23200, status: 'paid' },
        { date: '2026-02-04', category: 'Auto-Debit', amount: -6000, balance: 25300, status: 'failed' },
        { date: '2026-02-02', category: 'Fuel', amount: -4500, balance: 25300, status: 'paid' },
        { date: '2026-01-30', category: 'Auto-Debit', amount: -6000, balance: 29800, status: 'failed' },
        { date: '2026-01-27', category: 'ATM', amount: -10000, balance: 29800, status: 'paid' },
        { date: '2026-01-24', category: 'Utility', amount: -5200, balance: 39800, status: 'paid' },
        { date: '2026-01-20', category: 'EMI', amount: -18000, balance: 45000, status: 'paid' },
        { date: '2026-01-18', category: 'Salary', amount: 65000, balance: 63000, status: 'paid' }
      ],
      monthlySpend: [45000, 52000, 61700],
      balanceTrend: [82000, 63000, 45000, 29800, 23200, 8200]
    },
    {
      id: 'CUST-2024-34829',
      name: 'Sneha Reddy',
      riskScore: 35,
      riskLevel: 'low',
      defaultProb: 4.1,
      lastSalary: '2026-02-01',
      nextEMI: '2026-02-22',
      salaryStatus: 'On Time',
      stress: {
        salaryDelay: { value: 0, unit: 'days', trend: 'down', severity: '' },
        savingsDecline: { value: 2.1, unit: '%', trend: 'up', severity: '' },
        autoDebitFails: { value: 0, unit: '', trend: 'down', severity: '' },
        discretionaryDrop: { value: 1.3, unit: '%', trend: 'down', severity: '' },
        atmIncrease: { value: 3.0, unit: '%', trend: 'up', severity: '' }
      },
      shap: [
        { feature: 'Payment Regularity', importance: 0.28 },
        { feature: 'Savings Balance Trend', importance: 0.22 },
        { feature: 'Credit Utilization', importance: 0.20 },
        { feature: 'Income Stability', importance: 0.18 },
        { feature: 'Account Age', importance: 0.12 }
      ],
      explanation: 'Customer shows stable financial behavior. All indicators within healthy range. Low risk profile maintained for 6+ months.',
      interventions: [
        { action: 'Proactive Loyalty Offer', confidence: 75 },
        { action: 'Credit Limit Increase', confidence: 68 }
      ],
      transactions: [
        { date: '2026-02-14', category: 'Shopping', amount: -5200, balance: 124800, status: 'paid' },
        { date: '2026-02-11', category: 'Grocery', amount: -3600, balance: 130000, status: 'paid' },
        { date: '2026-02-08', category: 'Utility', amount: -4100, balance: 133600, status: 'paid' },
        { date: '2026-02-05', category: 'Auto-Debit', amount: -10000, balance: 137700, status: 'paid' },
        { date: '2026-02-03', category: 'EMI', amount: -20000, balance: 147700, status: 'paid' },
        { date: '2026-02-01', category: 'Salary', amount: 95000, balance: 167700, status: 'paid' },
        { date: '2026-01-28', category: 'Transfer', amount: -12000, balance: 72700, status: 'paid' },
        { date: '2026-01-25', category: 'Grocery', amount: -2800, balance: 84700, status: 'paid' },
        { date: '2026-01-22', category: 'Fuel', amount: -3500, balance: 87500, status: 'paid' },
        { date: '2026-01-18', category: 'Shopping', amount: -6200, balance: 91000, status: 'paid' }
      ],
      monthlySpend: [52000, 50400, 51300],
      balanceTrend: [115000, 120000, 130000, 137700, 133600, 124800]
    },
    {
      id: 'CUST-2024-67453',
      name: 'Vikram Singh',
      riskScore: 56,
      riskLevel: 'medium',
      defaultProb: 14.3,
      lastSalary: '2026-02-03',
      nextEMI: '2026-02-19',
      salaryStatus: 'Delayed (3 days)',
      stress: {
        salaryDelay: { value: 3, unit: 'days', trend: 'up', severity: 'warning' },
        savingsDecline: { value: 6.8, unit: '%', trend: 'up', severity: 'warning' },
        autoDebitFails: { value: 0, unit: '', trend: 'down', severity: '' },
        discretionaryDrop: { value: 8.4, unit: '%', trend: 'down', severity: '' },
        atmIncrease: { value: 8.0, unit: '%', trend: 'up', severity: '' }
      },
      shap: [
        { feature: 'Salary Credit Delay', importance: 0.30 },
        { feature: 'Savings Balance Trend', importance: 0.25 },
        { feature: 'Credit Utilization', importance: 0.20 },
        { feature: 'Discretionary Spend Δ', importance: 0.15 },
        { feature: 'Payment Regularity', importance: 0.10 }
      ],
      explanation: 'Customer trending medium risk due to mild salary delay (3 days) and declining savings. No auto-debit failures but spend patterns show early stress signals.',
      interventions: [
        { action: 'Soft Outreach Notification', confidence: 82 },
        { action: 'Financial Wellness Tips', confidence: 76 }
      ],
      transactions: [
        { date: '2026-02-13', category: 'Grocery', amount: -4500, balance: 58300, status: 'paid' },
        { date: '2026-02-10', category: 'ATM', amount: -8000, balance: 62800, status: 'paid' },
        { date: '2026-02-07', category: 'Utility', amount: -3800, balance: 70800, status: 'paid' },
        { date: '2026-02-05', category: 'EMI', amount: -16000, balance: 74600, status: 'paid' },
        { date: '2026-02-03', category: 'Salary', amount: 78000, balance: 90600, status: 'paid' },
        { date: '2026-01-30', category: 'Shopping', amount: -9200, balance: 12600, status: 'paid' },
        { date: '2026-01-26', category: 'Transfer', amount: -6000, balance: 21800, status: 'paid' },
        { date: '2026-01-22', category: 'Fuel', amount: -3100, balance: 27800, status: 'paid' },
        { date: '2026-01-18', category: 'Grocery', amount: -3900, balance: 30900, status: 'paid' },
        { date: '2026-01-15', category: 'EMI', amount: -16000, balance: 34800, status: 'paid' }
      ],
      monthlySpend: [44000, 46500, 51500],
      balanceTrend: [75000, 70000, 62800, 58300, 58300, 58300]
    },
    {
      id: 'CUST-2024-12890',
      name: 'Anita Desai',
      riskScore: 22,
      riskLevel: 'low',
      defaultProb: 1.8,
      lastSalary: '2026-02-01',
      nextEMI: '2026-02-25',
      salaryStatus: 'On Time',
      stress: {
        salaryDelay: { value: 0, unit: 'days', trend: 'down', severity: '' },
        savingsDecline: { value: 0.5, unit: '%', trend: 'down', severity: '' },
        autoDebitFails: { value: 0, unit: '', trend: 'down', severity: '' },
        discretionaryDrop: { value: 0, unit: '%', trend: 'down', severity: '' },
        atmIncrease: { value: 1.0, unit: '%', trend: 'up', severity: '' }
      },
      shap: [
        { feature: 'Income Stability', importance: 0.35 },
        { feature: 'Payment Regularity', importance: 0.25 },
        { feature: 'Savings Balance Trend', importance: 0.18 },
        { feature: 'Account Age', importance: 0.13 },
        { feature: 'Credit Utilization', importance: 0.09 }
      ],
      explanation: 'Excellent financial health. Consistent salary credits, zero payment failures, and growing savings balance. Model confidence: very low risk.',
      interventions: [
        { action: 'Premium Account Upgrade', confidence: 82 },
        { action: 'Credit Limit Increase', confidence: 91 }
      ],
      transactions: [
        { date: '2026-02-14', category: 'Shopping', amount: -8500, balance: 215400, status: 'paid' },
        { date: '2026-02-12', category: 'Grocery', amount: -5200, balance: 223900, status: 'paid' },
        { date: '2026-02-09', category: 'Auto-Debit', amount: -12000, balance: 229100, status: 'paid' },
        { date: '2026-02-06', category: 'EMI', amount: -25000, balance: 241100, status: 'paid' },
        { date: '2026-02-03', category: 'Utility', amount: -6200, balance: 266100, status: 'paid' },
        { date: '2026-02-01', category: 'Salary', amount: 120000, balance: 272300, status: 'paid' },
        { date: '2026-01-28', category: 'Transfer', amount: -15000, balance: 152300, status: 'paid' },
        { date: '2026-01-25', category: 'Shopping', amount: -7200, balance: 167300, status: 'paid' },
        { date: '2026-01-20', category: 'Fuel', amount: -4100, balance: 174500, status: 'paid' },
        { date: '2026-01-18', category: 'Grocery', amount: -4800, balance: 178600, status: 'paid' }
      ],
      monthlySpend: [62000, 60500, 61900],
      balanceTrend: [180000, 192000, 205000, 229100, 223900, 215400]
    }
  ];

  // ===== PORTFOLIO METRICS =====
  const portfolioMetrics = [
    { label: 'Total Customers', value: '12,847', change: '+124', direction: 'neutral' },
    { label: 'High Risk', value: '1,284', change: '+8.2%', direction: 'up', highlighted: true },
    { label: 'Medium Risk', value: '3,412', change: '+3.1%', direction: 'up' },
    { label: 'Avg Risk Score', value: '47.3', change: '-1.2', direction: 'down' },
    { label: '30-Day Default Forecast', value: '2.8%', change: '+0.4%', direction: 'up' }
  ];

  // ===== DOM REFS =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ===== STATE =====
  let currentView = 'overview';
  let selectedCustomer = null;
  let txnCategoryFilter = 'All';
  let chartInstances = {};

  // ===== INIT =====
  function init() {
    renderMetrics();
    renderCustomerTable(customers);
    renderCharts();
    bindEvents();
    updateBadge(customers);
  }

  // ===== RENDER PORTFOLIO METRICS =====
  function renderMetrics() {
    const row = $('#metricsRow');
    row.innerHTML = portfolioMetrics.map(m => `
      <div class="metric-card${m.highlighted ? ' highlighted' : ''}">
        <div class="metric-label">${m.label}</div>
        <div class="metric-value">${m.value}</div>
        <span class="metric-change ${m.direction}">
          ${m.direction === 'up' ? '↑' : m.direction === 'down' ? '↓' : '→'} ${m.change}
        </span>
      </div>
    `).join('');
  }

  // ===== RENDER CUSTOMER TABLE =====
  function renderCustomerTable(data) {
    const tbody = $('#customerTableBody');
    tbody.innerHTML = data.map(c => `
      <tr data-id="${c.id}">
        <td><strong>${c.id}</strong><br><span style="color:var(--gray-400);font-size:0.72rem">${c.name}</span></td>
        <td><span class="risk-score ${c.riskLevel}">${c.riskScore}</span></td>
        <td><span class="risk-badge ${c.riskLevel}">${c.riskLevel}</span></td>
        <td>${c.defaultProb}%</td>
        <td>${c.salaryStatus}</td>
        <td>${formatDate(c.nextEMI)}</td>
        <td><button class="btn btn-outline view-btn" data-id="${c.id}">View</button></td>
      </tr>
    `).join('');
    updateBadge(data);
  }

  function updateBadge(data) {
    $('#customerCountBadge').textContent = `${data.length} customers`;
  }

  // ===== CHARTS =====
  function renderCharts() {
    // Destroy existing instances
    Object.values(chartInstances).forEach(c => c.destroy());
    chartInstances = {};

    // Donut
    const donutCtx = $('#donutChart').getContext('2d');
    chartInstances.donut = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [{
          data: [8151, 3412, 1284],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
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
              font: { family: 'Inter', size: 11, weight: '500' },
              color: '#6B7280'
            }
          }
        }
      }
    });

    // Risk Trend Bar
    const trendCtx = $('#trendChart').getContext('2d');
    chartInstances.trend = new Chart(trendCtx, {
      type: 'bar',
      data: {
        labels: ['December', 'January', 'February'],
        datasets: [
          {
            label: 'Low',
            data: [8420, 8290, 8151],
            backgroundColor: '#10B981',
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          },
          {
            label: 'Medium',
            data: [3180, 3310, 3412],
            backgroundColor: '#F59E0B',
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          },
          {
            label: 'High',
            data: [1100, 1200, 1284],
            backgroundColor: '#EF4444',
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#9CA3AF' }
          },
          y: {
            grid: { color: '#F3F4F6' },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#9CA3AF' },
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 8,
              font: { family: 'Inter', size: 11, weight: '500' },
              color: '#6B7280'
            }
          }
        }
      }
    });
  }

  // ===== CUSTOMER DETAIL =====
  function showCustomerDetail(customerId) {
    selectedCustomer = customers.find(c => c.id === customerId);
    if (!selectedCustomer) return;
    txnCategoryFilter = 'All';

    switchView('detail');
    renderSummaryCard();
    renderTransactions();
    renderStressSignals();
    renderShapPanel();
    renderInterventions();
    renderDetailCharts();
  }

  function renderSummaryCard() {
    const c = selectedCustomer;
    const riskColorClass = c.riskLevel;
    $('#customerSummary').innerHTML = `
      <div class="summary-risk-circle ${riskColorClass}">
        <span class="score risk-score ${riskColorClass}">${c.riskScore}</span>
        <span class="label" style="color: var(--risk-${c.riskLevel})">${c.riskLevel} risk</span>
      </div>
      <div class="summary-info">
        <div class="customer-id">${c.id}</div>
        <div style="color:var(--gray-500);font-size:0.82rem;margin-top:2px">${c.name}</div>
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">Default Probability</span>
            <span class="info-value risk-score ${riskColorClass}">${c.defaultProb}%</span>
          </div>
          <div class="info-item">
            <span class="info-label">Last Salary Credit</span>
            <span class="info-value">${formatDate(c.lastSalary)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Next EMI Due</span>
            <span class="info-value">${formatDate(c.nextEMI)}</span>
          </div>
        </div>
      </div>
      <div class="summary-actions">
        <span class="risk-badge ${riskColorClass}">${c.riskLevel} risk</span>
      </div>
    `;
  }

  function renderTransactions() {
    // Get unique categories
    const categories = ['All', ...new Set(selectedCustomer.transactions.map(t => t.category))];

    // Render filters
    const filtersEl = $('#txnFilters');
    filtersEl.innerHTML = categories.map(cat =>
      `<button class="txn-filter-btn${cat === txnCategoryFilter ? ' active' : ''}" data-category="${cat}">${cat}</button>`
    ).join('');

    // Render rows
    const filtered = txnCategoryFilter === 'All'
      ? selectedCustomer.transactions
      : selectedCustomer.transactions.filter(t => t.category === txnCategoryFilter);

    $('#txnTableBody').innerHTML = filtered.map(t => `
      <tr>
        <td>${formatDate(t.date)}</td>
        <td>${t.category}</td>
        <td style="font-variant-numeric:tabular-nums;${t.amount > 0 ? 'color:var(--risk-low)' : ''}">${formatCurrency(t.amount)}</td>
        <td style="font-variant-numeric:tabular-nums">${formatCurrency(t.balance)}</td>
        <td><span class="payment-status ${t.status}">${statusIcon(t.status)} ${capitalize(t.status)}</span></td>
      </tr>
    `).join('');
  }

  function renderStressSignals() {
    const s = selectedCustomer.stress;
    const signals = [
      { label: 'Salary Delay', ...s.salaryDelay },
      { label: 'Savings Decline (WoW)', ...s.savingsDecline },
      { label: 'Auto-Debit Failures', ...s.autoDebitFails },
      { label: 'Discretionary Spend Drop', ...s.discretionaryDrop },
      { label: 'ATM Withdrawal Increase', ...s.atmIncrease }
    ];

    $('#stressGrid').innerHTML = signals.map(sig => `
      <div class="stress-card ${sig.severity}">
        <div class="stress-label">${sig.label}</div>
        <div class="stress-value">
          ${sig.value}${sig.unit}
          <span class="stress-arrow ${sig.trend}">${sig.trend === 'up' ? '▲' : '▼'}</span>
        </div>
      </div>
    `).join('');
  }

  function renderShapPanel() {
    const c = selectedCustomer;
    const maxImportance = Math.max(...c.shap.map(s => s.importance));

    const barsHtml = c.shap.map(s => {
      const pct = (s.importance / maxImportance) * 100;
      return `
        <div class="shap-bar">
          <span class="shap-label">${s.feature}</span>
          <div class="shap-track">
            <div class="shap-fill" style="width:${pct}%"></div>
          </div>
          <span class="shap-value">${(s.importance * 100).toFixed(0)}%</span>
        </div>
      `;
    }).join('');

    $('#shapPanel').innerHTML = `
      ${barsHtml}
      <div class="explanation-box">
        <strong>Model Insight:</strong> ${c.explanation}
      </div>
    `;
  }

  function renderInterventions() {
    const c = selectedCustomer;
    $('#interventionList').innerHTML = c.interventions.map(i => `
      <div class="intervention-item">
        <div class="intervention-info">
          <span class="intervention-name">${i.action}</span>
          <span class="intervention-confidence">Confidence: ${i.confidence}%</span>
        </div>
        <button class="btn btn-primary trigger-btn">${i.action.includes('Outreach') || i.action.includes('Notification') ? 'Trigger Outreach' : 'Apply Action'}</button>
      </div>
    `).join('');
  }

  function renderDetailCharts() {
    // Destroy old detail charts
    if (chartInstances.spend) chartInstances.spend.destroy();
    if (chartInstances.balance) chartInstances.balance.destroy();

    const c = selectedCustomer;

    // Monthly Spend Bar
    const spendCtx = $('#spendChart').getContext('2d');
    chartInstances.spend = new Chart(spendCtx, {
      type: 'bar',
      data: {
        labels: ['Dec', 'Jan', 'Feb'],
        datasets: [{
          data: c.monthlySpend,
          backgroundColor: ['#93C5FD', '#60A5FA', '#3B82F6'],
          borderRadius: 6,
          barPercentage: 0.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10 }, color: '#9CA3AF' } },
          y: { grid: { color: '#F3F4F6' }, ticks: { font: { family: 'Inter', size: 10 }, color: '#9CA3AF', callback: v => '₹' + (v / 1000) + 'k' } }
        }
      }
    });

    // Balance Trend Line
    const balCtx = $('#balanceChart').getContext('2d');
    chartInstances.balance = new Chart(balCtx, {
      type: 'line',
      data: {
        labels: ['W-6', 'W-5', 'W-4', 'W-3', 'W-2', 'Now'],
        datasets: [{
          data: c.balanceTrend,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59,130,246,0.08)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10 }, color: '#9CA3AF' } },
          y: { grid: { color: '#F3F4F6' }, ticks: { font: { family: 'Inter', size: 10 }, color: '#9CA3AF', callback: v => '₹' + (v / 1000) + 'k' } }
        }
      }
    });
  }

  // ===== NAVIGATION =====
  function switchView(view) {
    currentView = view;
    $$('.view').forEach(v => v.classList.remove('active'));

    if (view === 'detail') {
      $('#view-detail').classList.add('active');
      $$('.nav-item').forEach(n => n.classList.remove('active'));
    } else {
      $('#view-overview').classList.add('active');
      $$('.nav-item').forEach(n => {
        n.classList.toggle('active', n.dataset.view === 'overview');
      });
    }
  }

  // ===== EVENT BINDINGS =====
  function bindEvents() {
    // Sidebar nav
    $$('.nav-item[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.nav-item').forEach(n => n.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.view === 'overview' || btn.dataset.view === 'customers') {
          switchView('overview');
        } else {
          // Show overview with filtered context for other nav items
          switchView('overview');
        }
      });
    });

    // Back button
    $('#backBtn').addEventListener('click', () => switchView('overview'));

    // Customer table row clicks
    $('#customerTableBody').addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      if (row && row.dataset.id) showCustomerDetail(row.dataset.id);
    });

    // Transaction category filters
    $('#txnFilters').addEventListener('click', (e) => {
      const btn = e.target.closest('.txn-filter-btn');
      if (!btn) return;
      txnCategoryFilter = btn.dataset.category;
      renderTransactions();
    });

    // Intervention trigger buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('trigger-btn')) {
        showToast('✓ Action triggered successfully. Notification sent to relationship manager.');
      }
    });

    // Search
    $('#searchInput').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderCustomerTable(customers);
        return;
      }

      // If user types a full customer ID, jump to detail
      const exactMatch = customers.find(c => c.id.toLowerCase() === query);
      if (exactMatch) {
        showCustomerDetail(exactMatch.id);
        return;
      }

      const filtered = customers.filter(c =>
        c.id.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)
      );
      renderCustomerTable(filtered);
      if (currentView === 'detail') switchView('overview');
    });

    // Risk filter
    $('#riskFilter').addEventListener('change', (e) => {
      const level = e.target.value;
      if (level === 'all') {
        renderCustomerTable(customers);
      } else {
        renderCustomerTable(customers.filter(c => c.riskLevel === level));
      }
      if (currentView === 'detail') switchView('overview');
    });
  }

  // ===== UTILITIES =====
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatCurrency(amount) {
    const prefix = amount >= 0 ? '+' : '';
    return prefix + '₹' + Math.abs(amount).toLocaleString('en-IN');
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function statusIcon(status) {
    const icons = {
      paid: '●',
      pending: '◐',
      failed: '✕',
      bounced: '✕'
    };
    return icons[status] || '●';
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // ===== BOOT =====
  document.addEventListener('DOMContentLoaded', init);
})();
