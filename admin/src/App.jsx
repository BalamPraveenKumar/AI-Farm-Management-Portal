import React, { useState, useEffect } from 'react';
import { clearAuthCredentials, getAuthCredentials } from './services/api';
import { farmService } from './services/farmService';
import { batchService } from './services/batchService';
import { vaccinationService } from './services/vaccinationService';
import { diseaseService } from './services/diseaseService';
import { biosecurityService } from './services/biosecurityService';

// Components
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Farms from './components/Farms';
import Batches from './components/Batches';
import Vaccinations from './components/Vaccinations';
import DiseaseReports from './components/DiseaseReports';
import SendNotifications from './components/SendNotifications';
import Toast from './components/Toast';
import Biosecurity from './components/Biosecurity';
import Incidents from './components/Incidents';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('admin_theme') || 'light');
  
  // Data States
  const [farms, setFarms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [reports, setReports] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);

  // Toast Alerts States
  const [toasts, setToasts] = useState([]);

  // Toast helpers
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check login on startup
  useEffect(() => {
    const { username, password } = getAuthCredentials();
    if (username && password) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleUnauthorized = () => {
    setIsLoggedIn(false);
    clearAuthCredentials();
    showToast('Session expired. Please log in again.', 'error');
  };

  // Fetch all admin data
  const fetchAllData = async () => {
    const { username, password } = getAuthCredentials();
    if (!username || !password) return;

    setLoading(true);

    try {
      const [farmsRes, batchesRes, vaccsRes, reportsRes, checklistsRes] = await Promise.all([
        farmService.getFarms(handleUnauthorized),
        batchService.getBatches(handleUnauthorized),
        vaccinationService.getVaccinations(handleUnauthorized),
        diseaseService.getDiseaseReports(handleUnauthorized),
        biosecurityService.getChecklists(handleUnauthorized)
      ]);

      if (farmsRes.success) setFarms(farmsRes.farms);
      if (batchesRes.success) setBatches(batchesRes.batches);
      if (vaccsRes.success) setVaccinations(vaccsRes.vaccinations);
      if (reportsRes.success) setReports(reportsRes.reports);
      if (checklistsRes.success) setChecklists(checklistsRes.checklists);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast('Failed to sync data with server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllData();
      
      // Auto-poll every 30s
      const interval = setInterval(fetchAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Handle Logout
  const handleLogout = () => {
    clearAuthCredentials();
    setIsLoggedIn(false);
    setFarms([]);
    setBatches([]);
    setVaccinations([]);
    setReports([]);
    setChecklists([]);
    showToast('Logged out successfully.', 'info');
  };

  // Handle successful resolution of disease report
  const handleResolveSuccess = (reportId, resolvedData) => {
    setReports((prevReports) =>
      prevReports.map((r) =>
        r.report_id === reportId
          ? { 
              ...r, 
              status: 'resolved', 
              remarks: resolvedData.remarks,
              resolved_on: resolvedData.resolved_on || new Date().toLocaleString()
            }
          : r
      )
    );
  };

  // Apply Theme class
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  // Toggle Theme helper
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (!isLoggedIn) {
    return (
      <>
        <Login onLoginSuccess={() => setIsLoggedIn(true)} showToast={showToast} />
        <Toast toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  const renderActivePage = () => {
    switch (page) {
      case 'farms':
        return <Farms farms={farms} loading={loading} />;
      case 'batches':
        return <Batches batches={batches} loading={loading} />;
      case 'vaccinations':
        return <Vaccinations vaccinations={vaccinations} loading={loading} />;
      case 'biosecurity':
        return <Biosecurity showToast={showToast} />;
      case 'disease-reports':
        return (
          <DiseaseReports 
            reports={reports} 
            loading={loading} 
            onResolveSuccess={handleResolveSuccess} 
            showToast={showToast} 
          />
        );
      case 'incidents':
        return <Incidents showToast={showToast} onUnauthorized={handleUnauthorized} />;
      case 'notifications':
        return <SendNotifications showToast={showToast} onUnauthorized={handleUnauthorized} farms={farms} />;
      case 'dashboard':
      default:
        return (
          <Dashboard 
            farms={farms} 
            batches={batches} 
            vaccinations={vaccinations} 
            reports={reports} 
            checklists={checklists}
            setPage={setPage} 
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentPage={page} setPage={setPage} onLogout={handleLogout} />
      
      <main className="main-wrapper">
        <header className="top-header">
          <div className="page-title-container">
            {/* Live data indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 0 2px rgba(16,185,129,0.25)',
                animation: 'pulse 2s infinite',
                display: 'inline-block',
                flexShrink: 0,
              }} />
              <h1 className="page-title" style={{ textTransform: 'capitalize', fontSize: '20px' }}>
                {page === 'notifications' ? 'Broadcast Alerts' : page.replace('-', ' ')}
              </h1>
            </div>
          </div>
          <div className="header-actions">
            {/* Refresh data button */}
            <button
              onClick={fetchAllData}
              title="Refresh all data"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-app)',
                color: 'var(--text-secondary)',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.18s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(13,148,136,0.4)';
                e.currentTarget.style.color = '#0d9488';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              ↻ Sync Data
            </button>

            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              title="Toggle Light/Dark Theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px',
              background: 'rgba(13, 148, 136, 0.06)',
              border: '1px solid rgba(13, 148, 136, 0.15)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 10, fontWeight: 800,
              }}>
                {(sessionStorage.getItem('admin_username') || 'AD').substring(0,2).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                District Admin
              </span>
            </div>
          </div>
        </header>

        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {renderActivePage()}
        </div>
      </main>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
