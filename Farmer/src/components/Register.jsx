import React, { useState } from 'react';
import { 
  Sprout, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  Leaf, 
  Milk, 
  Syringe, 
  ShieldCheck, 
  BarChart3, 
  UserPlus, 
  ArrowLeft 
} from 'lucide-react';
import { registerService } from '../services/registerService';

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

export default function Register({ onSwitchToLogin, showToast }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Validations
    if (!firstName.trim()) {
      showToast('First Name is required.', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Email is required.', 'error');
      return;
    }
    if (!mobile.trim()) {
      showToast('Mobile Number is required.', 'error');
      return;
    }
    if (!password) {
      showToast('Password is required.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await registerService.registerFarmer({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        password: password
      });

      if (result && result.success) {
        showToast('Account registered successfully! Please sign in.', 'success');
        onSwitchToLogin();
      } else {
        showToast(result?.message || 'Registration failed. Email/Mobile must be unique.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred during registration.', 'error');
    } finally {
      setLoading(false);
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

        {/* ══ RIGHT — Registration Form ═══════════════════════ */}
        <div className="farmer-login-right">
          <div className="farmer-form-card" style={{ maxWidth: '400px' }}>

            {/* Brand row */}
            <div className="farmer-brand-row">
              <div className="farmer-brand-logo">
                <Sprout size={22} />
              </div>
              <div>
                <div className="farmer-brand-name">Digital Farm Portal</div>
                <div className="farmer-brand-sub">FARMER REGISTRATION</div>
              </div>
            </div>

            {/* Heading */}
            <h2 className="farmer-form-title">Join Digital Farm</h2>
            <p className="farmer-form-subtitle">Register a new Farmer account</p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              
              {/* Name fields in grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div className="farmer-form-group" style={{ marginBottom: 0 }}>
                  <label className="farmer-form-label">First Name *</label>
                  <div className="farmer-input-wrapper">
                    <span className="farmer-input-icon" style={{ left: '10px' }}><User size={15} /></span>
                    <input
                      type="text"
                      className="farmer-field-input"
                      style={{ paddingLeft: '32px' }}
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="farmer-form-group" style={{ marginBottom: 0 }}>
                  <label className="farmer-form-label">Last Name</label>
                  <input
                    type="text"
                    className="farmer-field-input"
                    style={{ paddingLeft: '14px' }}
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="farmer-form-group">
                <label className="farmer-form-label">Email Address *</label>
                <div className="farmer-input-wrapper">
                  <span className="farmer-input-icon"><Mail size={16} /></span>
                  <input
                    type="email"
                    className="farmer-field-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="farmer-form-group">
                <label className="farmer-form-label">Mobile Number *</label>
                <div className="farmer-input-wrapper">
                  <span className="farmer-input-icon"><Phone size={16} /></span>
                  <input
                    type="tel"
                    className="farmer-field-input"
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="farmer-form-group">
                <label className="farmer-form-label">Password *</label>
                <div className="farmer-input-wrapper">
                  <span className="farmer-input-icon"><Lock size={16} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="farmer-field-input has-right"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
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

              {/* Confirm Password */}
              <div className="farmer-form-group">
                <label className="farmer-form-label">Confirm Password *</label>
                <div className="farmer-input-wrapper">
                  <span className="farmer-input-icon"><Lock size={16} /></span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="farmer-field-input has-right"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="farmer-input-icon-right"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                    Registering account...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Register Account
                  </>
                )}
              </button>
            </form>

            {/* Back to Login link */}
            <div className="farmer-register-link">
              Already have an account?{' '}
              <button type="button" onClick={onSwitchToLogin} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <ArrowLeft size={13} /> Sign In
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
