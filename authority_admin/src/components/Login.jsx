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
    color: 'indigo',
    title: 'Districts Coverage & Oversight',
    desc: 'Oversight across all 26 districts of Andhra Pradesh',
  },
  {
    icon: <Syringe size={20} />,
    color: 'violet',
    title: 'Vaccination Schedule Audit',
    desc: 'Track immunization metrics and state coverage rates',
  },
  {
    icon: <ShieldAlert size={20} />,
    color: 'fuchsia',
    title: 'Disease Control Centre',
    desc: 'Monitor health incidents, risk ratings and outbreak trends',
  },
  {
    icon: <BellRing size={20} />,
    color: 'rose',
    title: 'Statewide Broadcasts',
    desc: 'Dispatch statewide alerts or target individual districts',
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
      showToast('Please enter your authority credentials.', 'error');
      return;
    }

    setLoading(true);
    const result = await testCredentials(username.trim(), password.trim());
    setLoading(false);

    if (result.success) {
      setAuthCredentials(username.trim(), password.trim());
      showToast('Successfully signed in. Welcome, State Authority Officer.', 'success');
      onLoginSuccess();
    } else {
      showToast(result.message || 'Invalid credentials. Please retry.', 'error');
    }
  };

  return (
    <div className="login-container">
      {/* Floating orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      <div className="login-split">
        {/* Left Hero Panel */}
        <div className="login-left-panel">
          <div className="login-hero-badge">
            <Leaf size={12} style={{ color: '#a5b4fc' }} />
            Andhra Pradesh State Farm Programme
          </div>

          <h1 className="login-hero-title">
            State Authority<br />
            <span>Oversight Portal</span>
          </h1>

          <p className="login-hero-desc">
            District-wide statistics aggregator, biosecurity standard checker, statewide health broadcaster and disease outbreak monitor.
          </p>

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

          <div className="login-stats-strip">
            <div className="login-stat">
              <span className="login-stat-value">26</span>
              <span className="login-stat-label">Districts Active</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-value">100%</span>
              <span className="login-stat-label">Statewide Coverage</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-value">24/7</span>
              <span className="login-stat-label">Auditing Logs</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="login-right-panel">
          <div className="login-form-card">
            <div className="login-brand-row">
              <div className="login-brand-logo">
                <Shield size={24} />
              </div>
              <div className="login-brand-text">
                <span className="login-brand-name">Digital Farm Portal</span>
                <span className="login-brand-sub">STATE AUTHORITY</span>
              </div>
            </div>

            <div className="login-form-header">
              <h2 className="login-form-title">Officer Login</h2>
              <p className="login-form-subtitle">Access broad district reports and alerts</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="admin-form-group">
                <label className="admin-form-label">Authority Email / ID</label>
                <div className="admin-input-wrapper">
                  <span className="admin-input-icon"><Mail size={17} /></span>
                  <input
                    type="text"
                    className="admin-field-input"
                    placeholder="authority_officer@ap.gov.in"
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
                <label className="admin-form-label">Security Key</label>
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
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    <Activity size={16} />
                    Sign In
                    <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
                  </>
                )}
              </button>
            </form>

            <div style={{
              marginTop: 24,
              padding: '12px 16px',
              background: 'rgba(79, 70, 229, 0.08)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <Shield size={14} style={{ color: '#a5b4fc', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                Restricted area. Authority activity logs are reported to the State Livestock Development Council.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
