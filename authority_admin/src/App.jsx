import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getAuthCredentials, clearAuthCredentials } from './services/api';

// Components
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Districts from './components/Districts';
import Farms from './components/Farms';
import Batches from './components/Batches';
import Vaccinations from './components/Vaccinations';
import Biosecurity from './components/Biosecurity';
import DiseaseReports from './components/DiseaseReports';
import SendNotifications from './components/SendNotifications';
import Toast from './components/Toast';
import Incidents from './components/Incidents';

import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [toasts, setToasts] = useState([]);

  // Check login on mount
  useEffect(() => {
    const { username, password } = getAuthCredentials();
    if (username && password) {
      setIsAuthenticated(true);
    }

    // Default theme check
    const savedTheme = localStorage.getItem('authority_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('authority_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = () => {
    clearAuthCredentials();
    setIsAuthenticated(false);
    showToast('Signed out successfully.', 'info');
  };

  const handleUnauthorized = () => {
    clearAuthCredentials();
    setIsAuthenticated(false);
    showToast('Session expired or unauthorized. Please re-authenticate.', 'error');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            setPage={setCurrentPage} 
            showToast={showToast} 
            onUnauthorized={handleUnauthorized} 
          />
        );
      case 'districts':
        return (
          <Districts 
            showToast={showToast} 
            onUnauthorized={handleUnauthorized} 
          />
        );
      case 'farms':
        return (
          <Farms 
            showToast={showToast} 
            onUnauthorized={handleUnauthorized} 
          />
        );
      case 'batches':
        return (
          <Batches 
            showToast={showToast} 
            onUnauthorized={handleUnauthorized} 
          />
        );
      case 'vaccinations':
        return (
          <Vaccinations 
            showToast={showToast} 
            onUnauthorized={handleUnauthorized} 
          />
        );
      case 'biosecurity':
        return (
          <Biosecurity 
            showToast={showToast} 
            onUnauthorized={handleUnauthorized} 
          />
        );
      case 'disease-reports':
        return (
          <DiseaseReports 
            showToast={showToast} 
            onUnauthorized={handleUnauthorized} 
          />
        );
      case 'incidents':
        return (
          <Incidents 
            showToast={showToast} 
            onUnauthorized={handleUnauthorized} 
          />
        );
      case 'notifications':
        return (
          <SendNotifications 
            showToast={showToast} 
            onUnauthorized={handleUnauthorized} 
          />
        );
      default:
        return <div>Page not found</div>;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':       return 'Statewide Dashboard';
      case 'districts':       return 'Jurisdictional Districts';
      case 'farms':           return 'Agricultural Farms Registry';
      case 'batches':         return 'Livestock Batches';
      case 'vaccinations':    return 'State Immunization Auditing';
      case 'biosecurity':     return 'Biosecurity Logs Audit';
      case 'disease-reports': return 'Disease Outbreak Emergency Registry';
      case 'incidents':       return 'State Incident Ops Board';
      case 'notifications':   return 'Broadcast Alerts Centre';
      default:                return 'State Authority';
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login 
          onLoginSuccess={() => setIsAuthenticated(true)} 
          showToast={showToast} 
        />
        <Toast toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar 
        currentPage={currentPage} 
        setPage={setCurrentPage} 
        onLogout={handleLogout} 
      />

      {/* Main Panel */}
      <div className="main-wrapper">
        
        {/* Top Header */}
        <header className="top-header">
          <h2 className="page-title">{getPageTitle()}</h2>
          
          <div className="header-actions">
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: '20px',
              border: '1px solid var(--primary-border)'
            }}>
              Govt. Network Connection
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="page-content">
          {renderPage()}
        </main>
      </div>

      {/* Toast Alert Popups */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
