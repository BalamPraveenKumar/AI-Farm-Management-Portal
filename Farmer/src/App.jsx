import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  LayoutDashboard, 
  MapPin, 
  Layers, 
  HeartPulse, 
  Syringe, 
  ShieldCheck, 
  LogOut, 
  Sun, 
  Moon, 
  Bell, 
  Menu,
  X,
  AlertCircle
} from 'lucide-react';

// Services
import { getAuthCredentials, clearAuthCredentials } from './services/api';
import { notificationService } from './services/notificationService';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Farms from './components/Farms';
import Batches from './components/Batches';
import DiseaseReports from './components/DiseaseReports';
import Vaccinations from './components/Vaccinations';
import Biosecurity from './components/Biosecurity';
import Notifications from './components/Notifications';
import Toast from './components/Toast';
import NotificationsPage from './components/NotificationsPage';
import Register from './components/Register';
import Incidents from './components/Incidents';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [page, setPage] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('farm_theme') || 'light');
  
  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Notifications drawer state
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  // App initialization check
  useEffect(() => {
    const { username, password } = getAuthCredentials();
    if (username && password) {
      setIsLoggedIn(true);
    }
  }, []);

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('farm_theme', theme);
  }, [theme]);

  // Toast handlers
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Handlers
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setPage('dashboard');
  };

  const handleUnauthorized = () => {
    clearAuthCredentials();
    setIsLoggedIn(false);
    showToast('Session expired. Please log in again.', 'error');
  };

  const handleLogout = () => {
    clearAuthCredentials();
    setIsLoggedIn(false);
    showToast('Logged out successfully.', 'info');
  };

  // Notifications polling and loading
  const fetchNotificationsList = async (silent = false) => {
    if (!silent) setNotifLoading(true);
    try {
      const data = await notificationService.getNotifications(handleUnauthorized);
      if (data && data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setNotifLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotificationsList();
      const interval = setInterval(() => {
        fetchNotificationsList(true);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Mark notification as read
  const handleMarkNotifRead = async (notifId, sysId) => {
    try {
      const identifier = sysId || notifId;
      const result = await notificationService.markAsRead(identifier, handleUnauthorized);

      if (result && result.success) {
        // Optimistically update
        setNotifications(prev => 
          prev.map(n => {
            const isMatch = (notifId && n.notification_id === notifId) || (sysId && n.notification_sys_id === sysId);
            return isMatch ? { ...n, read: true, u_read: true } : n;
          })
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper for page headers
  const getPageTitle = () => {
    switch (page) {
      case 'farms': return 'Farms Registry';
      case 'batches': return 'Animal Batches';
      case 'disease-reports': return 'Disease & AI Diagnosis';
      case 'vaccinations': return 'Immunization Schedule';
      case 'biosecurity': return 'Biosecurity Logs';
      case 'incidents': return 'Incident Board';
      case 'notifications': return 'System Notifications';
      default: return 'Farmer Dashboard';
    }
  };

  const getPageIcon = () => {
    switch (page) {
      case 'farms': return <MapPin size={24} style={{ color: 'var(--primary)' }} />;
      case 'batches': return <Layers size={24} style={{ color: 'var(--primary)' }} />;
      case 'disease-reports': return <HeartPulse size={24} style={{ color: 'var(--primary)' }} />;
      case 'vaccinations': return <Syringe size={24} style={{ color: 'var(--primary)' }} />;
      case 'biosecurity': return <ShieldCheck size={24} style={{ color: 'var(--primary)' }} />;
      case 'incidents': return <AlertCircle size={24} style={{ color: 'var(--primary)' }} />;
      case 'notifications': return <Bell size={24} style={{ color: 'var(--primary)' }} />;
      default: return <LayoutDashboard size={24} style={{ color: 'var(--primary)' }} />;
    }
  };

  // Toggle Theme helper
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Logged-in Username
  const loggedInUser = sessionStorage.getItem('farm_username') || 'Farmer';

  if (!isLoggedIn) {
    return (
      <>
        {authView === 'login' ? (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onSwitchToRegister={() => setAuthView('register')} 
            showToast={showToast} 
          />
        ) : (
          <Register 
            onSwitchToLogin={() => setAuthView('login')} 
            showToast={showToast} 
          />
        )}
        <Toast toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  const renderActivePage = () => {
    switch (page) {
      case 'farms':
        return <Farms showToast={showToast} onUnauthorized={handleUnauthorized} />;
      case 'batches':
        return <Batches showToast={showToast} onUnauthorized={handleUnauthorized} />;
      case 'disease-reports':
        return <DiseaseReports showToast={showToast} onUnauthorized={handleUnauthorized} />;
      case 'vaccinations':
        return <Vaccinations showToast={showToast} onUnauthorized={handleUnauthorized} />;
      case 'biosecurity':
        return <Biosecurity showToast={showToast} onUnauthorized={handleUnauthorized} />;
      case 'incidents':
        return <Incidents showToast={showToast} onUnauthorized={handleUnauthorized} />;
      case 'notifications':
        return (
          <NotificationsPage 
            notifications={notifications}
            onMarkRead={handleMarkNotifRead}
            unreadCount={unreadCount}
            loading={notifLoading}
            setPage={setPage}
            showToast={showToast}
          />
        );
      default:
        return <Dashboard setPage={setPage} showToast={showToast} onUnauthorized={handleUnauthorized} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar - Desktop Layout */}
      <aside className="sidebar" style={{ display: 'flex' }}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Sprout size={22} />
          </div>
          <span className="brand-name">Digital Farm</span>
        </div>

        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${page === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setPage('dashboard'); setMobileSidebarOpen(false); }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>

          <div 
            className={`nav-item ${page === 'farms' ? 'active' : ''}`}
            onClick={() => { setPage('farms'); setMobileSidebarOpen(false); }}
          >
            <MapPin size={18} />
            <span>Farms</span>
          </div>

          <div 
            className={`nav-item ${page === 'batches' ? 'active' : ''}`}
            onClick={() => { setPage('batches'); setMobileSidebarOpen(false); }}
          >
            <Layers size={18} />
            <span>Animal Batches</span>
          </div>

          <div 
            className={`nav-item ${page === 'disease-reports' ? 'active' : ''}`}
            onClick={() => { setPage('disease-reports'); setMobileSidebarOpen(false); }}
          >
            <HeartPulse size={18} />
            <span>Disease Reports</span>
          </div>

          <div 
            className={`nav-item ${page === 'vaccinations' ? 'active' : ''}`}
            onClick={() => { setPage('vaccinations'); setMobileSidebarOpen(false); }}
          >
            <Syringe size={18} />
            <span>Vaccinations</span>
          </div>

          <div 
            className={`nav-item ${page === 'biosecurity' ? 'active' : ''}`}
            onClick={() => { setPage('biosecurity'); setMobileSidebarOpen(false); }}
          >
            <ShieldCheck size={18} />
            <span>Biosecurity Logs</span>
          </div>

          <div 
            className={`nav-item ${page === 'incidents' ? 'active' : ''}`}
            onClick={() => { setPage('incidents'); setMobileSidebarOpen(false); }}
          >
            <AlertCircle size={18} />
            <span>Incidents</span>
          </div>

          <div 
            className={`nav-item ${page === 'notifications' ? 'active' : ''}`}
            onClick={() => { setPage('notifications'); setMobileSidebarOpen(false); }}
          >
            <Bell size={18} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="badge badge-red" style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>
                {unreadCount}
              </span>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {loggedInUser.substring(0, 2).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name" title={loggedInUser}>{loggedInUser}</div>
              <div className="user-role">ServiceNow Farmer</div>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="page-title-container">
            {getPageIcon()}
            <h1 className="page-title" style={{ margin: 0, fontSize: '20px' }}>
              {getPageTitle()}
            </h1>
          </div>

          <div className="header-actions">
            {/* Theme Switcher */}
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme Mode">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Notification Bell */}
            <div 
              className="notif-bell-container" 
              onClick={() => { setNotifDrawerOpen(true); fetchNotificationsList(); }}
              title="View system alerts"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notif-badge" id="notif-badge">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {renderActivePage()}
        </main>
      </div>

      {/* Notifications Drawer */}
      <Notifications 
        isOpen={notifDrawerOpen} 
        onClose={() => setNotifDrawerOpen(false)} 
        notifications={notifications}
        onMarkRead={handleMarkNotifRead}
        unreadCount={unreadCount}
        loading={notifLoading}
        setPage={setPage}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
