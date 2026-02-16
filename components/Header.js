'use client';

import { useState, useRef, useEffect } from 'react';

export default function Header({ activeView, searchQuery, onSearchChange, riskFilter, onRiskFilterChange }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const popupRef = useRef(null);

    // Close popup on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        if (profileOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [profileOpen]);

    const showFilters = activeView === 'customers';

    return (
        <header className="header">
            {showFilters && (
                <div className="header-search">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input
                        type="text"
                        placeholder="Search Customer ID..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            )}
            <div className="header-spacer" />
            <div className="header-controls">
                {showFilters && (
                    <div className="header-filter">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                        <select value={riskFilter} onChange={(e) => onRiskFilterChange(e.target.value)}>
                            <option value="all">All Risk Levels</option>
                            <option value="high">High Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="low">Low Risk</option>
                        </select>
                    </div>
                )}

                {/* Profile */}
                <div className="profile-wrapper" ref={popupRef}>
                    <div
                        className="header-profile"
                        title="Executive Profile"
                        onClick={() => setProfileOpen((v) => !v)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>

                    {profileOpen && (
                        <div className="profile-popup">
                            <div className="profile-popup-header">
                                <div className="profile-avatar">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="profile-name">John Doe</div>
                                    <div className="profile-role">Managing Director — Credit Risk</div>
                                </div>
                            </div>
                            <div className="profile-popup-body">
                                <div className="profile-detail-row">
                                    <span className="profile-detail-label">Division</span>
                                    <span className="profile-detail-value">Risk & Compliance</span>
                                </div>
                                <div className="profile-detail-row">
                                    <span className="profile-detail-label">Region</span>
                                    <span className="profile-detail-value">Barclays India</span>
                                </div>
                                <div className="profile-detail-row">
                                    <span className="profile-detail-label">Employee ID</span>
                                    <span className="profile-detail-value">BRC-MD-20482</span>
                                </div>
                                <div className="profile-detail-row">
                                    <span className="profile-detail-label">Email</span>
                                    <span className="profile-detail-value">a.reddy@barclays.com</span>
                                </div>
                                <div className="profile-detail-row">
                                    <span className="profile-detail-label">Access Level</span>
                                    <span className="profile-detail-value">
                                        <span className="risk-badge low" style={{ fontSize: '0.6rem' }}>L5 — Full Admin</span>
                                    </span>
                                </div>
                                <div className="profile-detail-row">
                                    <span className="profile-detail-label">Last Login</span>
                                    <span className="profile-detail-value">16 Feb 2026, 09:14 AM</span>
                                </div>
                            </div>
                            <div className="profile-popup-footer">
                                <button className="btn btn-outline" style={{ width: '100%' }}>Sign Out</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
