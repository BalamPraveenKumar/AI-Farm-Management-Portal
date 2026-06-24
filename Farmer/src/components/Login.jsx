import React, { useState } from 'react';
import {
  Sprout,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Leaf,
  Milk,
  Syringe,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { testCredentials, setAuthCredentials } from '../services/api';

const FEATURES = [
  {
    icon: <Milk size={19} />,
    color: 'emerald',
    title: 'Farm & Batch Management',
    desc: 'Manage your dairy, poultry and livestock records',
  },
  {
    icon: <Syringe size={19} />,
    color: 'teal',
    title: 'Vaccination Scheduling',
    desc: 'Track immunizations and upcoming due dates',
  },
  {
    icon: <ShieldCheck size={19} />,
    color: 'amber',
    title: 'Biosecurity Compliance',
    desc: 'Monitor hygiene standards and get health scores',
  },
  {
    icon: <BarChart3 size={19} />,
    color: 'rose',
    title: 'AI Disease Detection',
    desc: 'Report symptoms and get AI-powered diagnostics',
  },
];

export default function Login({ onLoginSuccess, onSwitchToRegister, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('Please enter both username and password.', 'error');
      return;
    }

    setLoading(true);
    const result = await testCredentials(username.trim(), password.trim());
    setLoading(false);

    if (result.success) {
      setAuthCredentials(username.trim(), password.trim());
      showToast('Welcome back! Loading your farm dashboard…', 'success');
      onLoginSuccess();
    } else {
      showToast(result.message || 'Invalid credentials. Please try again.', 'error');
    }
  };

  return (
    <div className="login-container">
      {/* Ambient glow orbs */}
      <div className="farmer-orb farmer-orb-1" />
      <div className="farmer-orb farmer-orb-2" />
      <div className="farmer-orb farmer-orb-3" />

      <div className="farmer-login-split">

        {/* ══ LEFT — Hero Info Panel ══════════════════════════ */}
        <div className="farmer-login-left">
          {/* Govt / state badge */}
          <div className="farmer-hero-badge">
            <Leaf size={11} />
            Andhra Pradesh · Digital Farm Programme
          </div>

          <h1 className="farmer-hero-title">
            Your Farm,<br />
            <span>Smarter Every Day</span>
          </h1>

          <p className="farmer-hero-desc">
            The all-in-one digital platform for Andhra Pradesh farmers — manage livestock,
            track vaccinations, monitor biosecurity, and receive real-time alerts from your
            district administrator.
          </p>

          {/* Feature highlights */}
          <div className="farmer-feature-list">
            {FEATURES.map((f, i) => (
              <div className="farmer-feature-item" key={i}>
                <div className={`farmer-feature-icon ${f.color}`}>{f.icon}</div>
                <div className="farmer-feature-text">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div className="farmer-stats-strip">
            <div>
              <span className="farmer-stat-value">500+</span>
              <span className="farmer-stat-label">Registered Farms</span>
            </div>
            <div>
              <span className="farmer-stat-value">26</span>
              <span className="farmer-stat-label">Districts</span>
            </div>
            <div>
              <span className="farmer-stat-value">98%</span>
              <span className="farmer-stat-label">Uptime</span>
            </div>
          </div>
        </div>

        {/* ══ RIGHT — Login Form ══════════════════════════════ */}
        <div className="farmer-login-right">
          <div className="farmer-form-card">

            {/* Brand row */}
            <div className="farmer-brand-row">
              <div className="farmer-brand-logo">
                <Sprout size={22} />
              </div>
              <div>
                <div className="farmer-brand-name">Digital Farm Portal</div>
                <div className="farmer-brand-sub">FARMER DASHBOARD</div>
              </div>
            </div>

            {/* Heading */}
            <h2 className="farmer-form-title">Welcome back</h2>
            <p className="farmer-form-subtitle">Sign in with your ServiceNow credentials</p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="farmer-form-group">
                <label className="farmer-form-label">Username</label>
                <div className="farmer-input-wrapper">
                  <span className="farmer-input-icon"><Mail size={16} /></span>
                  <input
                    type="text"
                    className="farmer-field-input"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="farmer-form-group">
                <label className="farmer-form-label">Password</label>
                <div className="farmer-input-wrapper">
                  <span className="farmer-input-icon"><Lock size={16} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="farmer-field-input has-right"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="farmer-input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="farmer-login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2, borderTopColor: '#fff' }} />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Sign In to Dashboard
                    <ArrowRight size={15} style={{ marginLeft: 'auto' }} />
                  </>
                )}
              </button>
            </form>

            {/* Register link */}
            <div className="farmer-register-link">
              New farmer?{' '}
              <button type="button" onClick={onSwitchToRegister}>
                Create an Account
              </button>
            </div>

            {/* Bottom note */}
            <div style={{
              marginTop: 20,
              padding: '11px 14px',
              background: 'rgba(16,185,129,0.07)',
              border: '1px solid rgba(16,185,129,0.18)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 9
            }}>
              <Leaf size={13} style={{ color: '#34d399', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.5 }}>
                Powered by the Andhra Pradesh Digital Agriculture Mission.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
