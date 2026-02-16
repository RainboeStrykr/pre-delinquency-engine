'use client';

import { formatDate } from '@/data/customers';

export default function CustomerTable({ customers, onSelectCustomer }) {
    return (
        <div className="customers-table-card">
            <div className="table-header">
                <h3>Customers at Risk</h3>
                <span className="badge">{customers.length} customers</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Customer ID</th>
                        <th>Risk Score</th>
                        <th>Risk Level</th>
                        <th>Default Prob.</th>
                        <th>Salary Status</th>
                        <th>Next EMI</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((c) => (
                        <tr key={c.id} onClick={() => onSelectCustomer(c.id)} style={{ cursor: 'pointer' }}>
                            <td>
                                <strong>{c.id}</strong>
                                <br />
                                <span style={{ color: 'var(--gray-400)', fontSize: '0.72rem' }}>{c.name}</span>
                            </td>
                            <td>
                                <span className={`risk-score ${c.riskLevel.toLowerCase()}`}>{c.riskScore}</span>
                            </td>
                            <td>
                                <span className={`risk-badge ${c.riskLevel.toLowerCase()}`}>{c.riskLevel}</span>
                            </td>
                            <td>{c.defaultProb}%</td>
                            <td>{c.salaryStatus}</td>
                            <td>{formatDate(c.nextEMI)}</td>
                            <td>
                                <button
                                    className="btn btn-outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectCustomer(c.id);
                                    }}
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
