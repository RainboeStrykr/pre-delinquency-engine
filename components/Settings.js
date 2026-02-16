'use client';

import { useEffect } from 'react';

export default function Settings({ isOpen, onClose, darkMode, onToggleDarkMode }) {
    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    return (
        <>
            {/* Backdrop */}
            <div className={`settings-overlay${isOpen ? ' open' : ''}`} onClick={onClose} />

            {/* Drawer */}
            <div className={`settings-drawer${isOpen ? ' open' : ''}`}>
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button className="settings-close" onClick={onClose}>✕</button>
                </div>
                <div className="settings-body">
                    {/* Appearance */}
                    <div className="settings-section">
                        <div className="settings-section-label">Appearance</div>

                        <div className="settings-option">
                            <div className="settings-option-info">
                                <span className="option-label">Dark Mode</span>
                                <span className="option-desc">Switch to a dark color scheme</span>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={darkMode} onChange={onToggleDarkMode} />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="settings-section">
                        <div className="settings-section-label">Notifications</div>

                        <div className="settings-option">
                            <div className="settings-option-info">
                                <span className="option-label">Risk Alerts</span>
                                <span className="option-desc">Get notified when a customer crosses a risk threshold</span>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" defaultChecked />
                                <span className="toggle-slider" />
                            </label>
                        </div>

                        <div className="settings-option">
                            <div className="settings-option-info">
                                <span className="option-label">Intervention Updates</span>
                                <span className="option-desc">Notification when an intervention action completes</span>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" defaultChecked />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    </div>

                    {/* Data */}
                    <div className="settings-section">
                        <div className="settings-section-label">Data & Refresh</div>

                        <div className="settings-option">
                            <div className="settings-option-info">
                                <span className="option-label">Auto-Refresh</span>
                                <span className="option-desc">Refresh risk scores every 5 minutes</span>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" defaultChecked />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    </div>

                    {/* About */}
                    <div className="settings-section">
                        <div className="settings-section-label">About</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', lineHeight: 1.7 }}>
                            <div><strong style={{ color: 'var(--gray-700)' }}>Pre-Delinquency Intervention Engine</strong></div>
                            <div>Version 1.0.0</div>
                            <div style={{ marginTop: '4px' }}>Credit Risk Analytics Dashboard</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
