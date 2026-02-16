'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MetricsRow from '@/components/MetricsRow';
import RiskCharts from '@/components/RiskCharts';
import CustomerTable from '@/components/CustomerTable';
import CustomerDetail from '@/components/CustomerDetail';
import { customers } from '@/data/customers';

export default function Home() {
  const [activeView, setActiveView] = useState('overview');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [toast, setToast] = useState('');

  const filteredCustomers = useMemo(() => {
    let result = customers;
    if (riskFilter !== 'all') {
      result = result.filter((c) => c.riskLevel === riskFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) => c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [riskFilter, searchQuery]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) || null,
    [selectedCustomerId]
  );

  const handleNavigate = useCallback((view) => {
    setActiveView(view);
    setSelectedCustomerId(null);
  }, []);

  const handleSelectCustomer = useCallback((id) => {
    setSelectedCustomerId(id);
    setActiveView('detail');
  }, []);

  const handleBack = useCallback(() => {
    setSelectedCustomerId(null);
    setActiveView('overview');
  }, []);

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      // Jump to detail if exact match
      const exact = customers.find((c) => c.id.toLowerCase() === query.toLowerCase().trim());
      if (exact) {
        handleSelectCustomer(exact.id);
        return;
      }
      if (activeView === 'detail') {
        setActiveView('overview');
        setSelectedCustomerId(null);
      }
    },
    [activeView, handleSelectCustomer]
  );

  const handleRiskFilter = useCallback(
    (val) => {
      setRiskFilter(val);
      if (activeView === 'detail') {
        setActiveView('overview');
        setSelectedCustomerId(null);
      }
    },
    [activeView]
  );

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  return (
    <div className="app">
      <Sidebar
        activeView={activeView === 'detail' ? '' : activeView}
        onNavigate={handleNavigate}
      />
      <div className="main">
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          riskFilter={riskFilter}
          onRiskFilterChange={handleRiskFilter}
        />
        <div className="content">
          {/* Overview */}
          {activeView !== 'detail' && (
            <div>
              <h2 className="section-title">Portfolio Overview</h2>
              <MetricsRow />
              <RiskCharts />
              <CustomerTable
                customers={filteredCustomers}
                onSelectCustomer={handleSelectCustomer}
              />
            </div>
          )}

          {/* Customer Detail */}
          {activeView === 'detail' && selectedCustomer && (
            <CustomerDetail customer={selectedCustomer} onBack={handleBack} onToast={showToast} />
          )}
        </div>
      </div>

      {/* Toast */}
      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  );
}
