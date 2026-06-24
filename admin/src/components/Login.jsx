import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Map, 
  Syringe, 
  ShieldAlert, 
  BellRing, 
  ArrowRight,
  Leaf,
  Activity
} from 'lucide-react';
import { testCredentials, setAuthCredentials } from '../services/api';

const FEATURES = [
  {
    icon: <Map size={20} />,
    color: 'blue',
    title: 'Farms & Livestock Oversight',
    desc: 'Monitor all registered farms across the district',
  },
  {
    icon: <Syringe size={20} />,
    color: 'green',
    title: 'Vaccination Management',
    desc: 'Track immunization schedules and compliance',
  },
  {
    icon: <ShieldAlert size={20} />,
    color: 'purple',
    title: 'Disease Incident Reports',
    desc: 'Resolve farmer-reported disease emergencies',
  },
  {
    icon: <BellRing size={20} />,
    color: 'orange',
    title: 'Broadcast District Alerts',
    desc: 'Send critical weather & health warnings to all',
  },
];

export default function Login({ onLoginSuccess, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('Please enter both admin credentials.', 'error');
      return;
    }

    setLoading(true);
    const result = await testCredentials(username.trim(), password.trim());
    setLoading(false);

    if (result.success) {
      setAuthCredentials(username.trim(), password.trim());
      showToast('Welcome back, District Admin!', 'success');
      onLoginSuccess();
    } else {
      showToast(result.message || 'Invalid credentials. Please retry.', 'error');
    }
  };

  return (
    <div className="login-container">
      {/* Animated background orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      <div className="login-split">
        {/* ─── LEFT HERO PANEL ─────────────────────── */}
        <div className="login-left-panel">
          {/* Logo / Govt badge */}
          <div className="login-hero-badge">
            <Leaf size={12} />
            Andhra Pradesh Farm Administration
          </div>

          <h1 className="login-hero-title">
            District Admin<br />
            <span>Control Centre</span>
          </h1>

          <p className="login-hero-desc">
            Centralized platform for overseeing registered farms, livestock batches, disease incident resolution, 
            and real-time alert broadcasting across the district.
          </p>

          {/* Feature list */}
          <div className="login-feature-list">
            {FEATURES.map((f, i) => (
              <div className="login-feature-item" key={i}>
                <div className={`login-feature-icon ${f.color}`}>{f.icon}</div>
                <div className="login-feature-text">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div className="login-stats-strip">
            <div className="login-stat">
              <span className="login-stat-value">26</span>
              <span className="login-stat-label">Districts Covered</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-value">500+</span>
              <span className="login-stat-label">Registered Farms</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-value">24/7</span>
              <span className="login-stat-label">Live Monitoring</span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT FORM PANEL ─────────────────────── */}
        <div className="login-right-panel">
          <div className="login-form-card">
            {/* Brand row */}
            <div className="login-brand-row">
              <div className="login-brand-logo">
                <Shield size={24} />
              </div>
              <div className="login-brand-text">
                <span className="login-brand-name">FarmAdmin</span>
                <span className="login-brand-sub">DISTRICT PORTAL</span>
              </div>
            </div>

            {/* Form heading */}
            <div className="login-form-header">
              <h2 className="login-form-title">Sign in to continue</h2>
              <p className="login-form-subtitle">Use your official district admin credentials</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="admin-form-group">
                <label className="admin-form-label">Admin Email / Username</label>
                <div className="admin-input-wrapper">
                  <span className="admin-input-icon"><Mail size={17} /></span>
                  <input
                    type="text"
                    className="admin-field-input"
                    placeholder="atp_admin@gmail.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="admin-form-group">
                <label className="admin-form-label">Password</label>
                <div className="admin-input-wrapper">
                  <span className="admin-input-icon"><Lock size={17} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="admin-field-input has-right-icon"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="admin-input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="admin-login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff' }} />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Activity size={16} />
                    Access Admin Dashboard
                    <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
                  </>
                )}
              </button>
            </form>

            {/* Security note */}
            <div style={{
              marginTop: 24,
              padding: '12px 16px',
              background: 'rgba(13, 148, 136, 0.08)',
              border: '1px solid rgba(13, 148, 136, 0.2)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <Shield size={14} style={{ color: '#5eead4', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                This portal is restricted to authorized district officials only. Unauthorized access is monitored.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
