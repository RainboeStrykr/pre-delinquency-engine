'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MetricsRow from '@/components/MetricsRow';
import RiskCharts from '@/components/RiskCharts';
import CustomerTable from '@/components/CustomerTable';
import CustomerDetail from '@/components/CustomerDetail';
import RiskSignals from '@/components/RiskSignals';
import Interventions from '@/components/Interventions';
import ArchetypeChart from '@/components/ArchetypeChart';
import { MagicBentoCard } from '@/components/MagicBento';
import Settings from '@/components/Settings';
import { customers } from '@/data/customers';



export default function Home() {
  const [activeView, setActiveView] = useState('overview');
  const [previousView, setPreviousView] = useState('overview');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    let result = customers;
    if (riskFilter !== 'all') {
      result = result.filter((c) => c.riskLevel === riskFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) => String(c.id).toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
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
    setPreviousView(activeView);
    setActiveView('detail');
  }, [activeView]);

  const handleBack = useCallback(() => {
    setSelectedCustomerId(null);
    setActiveView(previousView || 'overview');
  }, [previousView]);

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      // Switch to customers view so the filtered table is visible
      if (query.trim() && activeView !== 'overview' && activeView !== 'customers') {
        setActiveView('customers');
        setSelectedCustomerId(null);
      }
      if (activeView === 'detail') {
        setActiveView('customers');
        setSelectedCustomerId(null);
      }
    },
    [activeView]
  );

  const handleSearchSubmit = useCallback(
    (query) => {
      const exact = customers.find((c) => String(c.id).toLowerCase() === query.toLowerCase().trim());
      if (exact) {
        handleSelectCustomer(exact.id);
      }
    },
    [handleSelectCustomer]
  );

  const handleRiskFilter = useCallback(
    (val) => {
      setRiskFilter(val);
      // Switch to a view that shows the customer table
      if (activeView !== 'overview' && activeView !== 'customers') {
        setActiveView('customers');
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
        activeView={activeView === 'detail' ? previousView : activeView}
        onNavigate={handleNavigate}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      <div className="main">
        <Header
          activeView={activeView}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onSearchSubmit={handleSearchSubmit}
          riskFilter={riskFilter}
          onRiskFilterChange={handleRiskFilter}
        />
        <div className="content">
          {/* Overview */}
          {activeView === 'overview' && (
            <div>
              <h2 className="section-title">Portfolio Overview</h2>
              <MetricsRow />
              <RiskCharts />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <ArchetypeChart />
                {/* Empty slot for balance projection aggregate or migration matrix */}
                <MagicBentoCard className="chart-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', minHeight: '300px', aspectRatio: 'unset', borderStyle: 'dashed' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔄</div>
                  <div style={{ fontWeight: 500 }}>Risk Migration Matrix</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Coming soon in Phase 2</div>
                </MagicBentoCard>
              </div>

              <CustomerTable
                customers={filteredCustomers}
                onSelectCustomer={handleSelectCustomer}
              />
            </div>
          )}

          {/* Customer Explorer */}
          {activeView === 'customers' && (
            <div>
              <h2 className="section-title">Customer Explorer</h2>
              <CustomerTable
                customers={filteredCustomers}
                onSelectCustomer={handleSelectCustomer}
              />
            </div>
          )}

          {/* Risk Signals */}
          {activeView === 'signals' && (
            <RiskSignals />
          )}

          {/* Interventions */}
          {activeView === 'interventions' && (
            <Interventions />
          )}

          {/* Customer Detail */}
          {activeView === 'detail' && selectedCustomer && (
            <CustomerDetail customer={selectedCustomer} onBack={handleBack} onToast={showToast} />
          )}
        </div>
      </div>

      {/* Toast */}
      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>

      {/* Settings Drawer */}
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />
    </div>
  );
}
