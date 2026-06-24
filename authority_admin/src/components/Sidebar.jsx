import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  MapPin, 
  Layers, 
  Syringe, 
  ShieldCheck, 
  ShieldAlert, 
  BellRing, 
  LogOut, 
  Shield,
  Leaf,
  AlertCircle
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',       label: 'Dashboard',       icon: <LayoutDashboard size={18} /> },
  { id: 'districts',       label: 'Districts List',   icon: <Map size={18} /> },
  { id: 'farms',           label: 'Farms Registry',   icon: <MapPin size={18} /> },
  { id: 'batches',         label: 'Animal Batches',   icon: <Layers size={18} /> },
  { id: 'vaccinations',    label: 'Vaccinations',     icon: <Syringe size={18} /> },
  { id: 'biosecurity',     label: 'Biosecurity Logs', icon: <ShieldCheck size={18} /> },
  { id: 'disease-reports', label: 'Disease Reports',  icon: <ShieldAlert size={18} /> },
  { id: 'incidents',       label: 'Incidents Panel',  icon: <AlertCircle size={18} /> },
  { id: 'notifications',   label: 'Broadcast Alerts', icon: <BellRing size={18} /> },
];

export default function Sidebar({ currentPage, setPage, onLogout }) {
  const adminName = sessionStorage.getItem('authority_username') || 'Authority';
  const initials   = adminName.substring(0, 2).toUpperCase();

  return (
    <aside className="sidebar" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* subtle gradient shimmer at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2.5px',
        background: 'linear-gradient(90deg, #4f46e5, #8b5cf6, #d946ef)',
        zIndex: 10
      }} />

      {/* Brand / Logo */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Shield size={20} />
        </div>
        <div>
          <div className="brand-name">Digital Farm</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.8px' }}>
            STATE AUTHORITY
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          const showDivider = item.id === 'notifications';

          return (
            <React.Fragment key={item.id}>
              {showDivider && (
                <div className="nav-section-label" style={{ marginTop: 12 }}>Actions</div>
              )}
              <button
                onClick={() => setPage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '11px 16px',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  background: isActive
                    ? 'linear-gradient(135deg, #4f46e5, #3730a3)'
                    : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s',
                  boxShadow: isActive ? '0 4px 16px rgba(79,70,229,0.35)' : 'none',
                  fontFamily: 'var(--font-sans)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  }
                }}
              >
                {isActive && (
                  <span style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: '60%', background: '#c7d2fe', borderRadius: '0 2px 2px 0'
                  }} />
                )}
                <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.75 }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="sidebar-footer">
        {/* State indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          background: 'rgba(79, 70, 229, 0.08)',
          border: '1px solid rgba(79, 70, 229, 0.15)',
          borderRadius: 'var(--radius-md)',
        }}>
          <Leaf size={13} style={{ color: '#8b5cf6' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            Andhra Pradesh State
          </span>
        </div>

        {/* User profile details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 13,
            boxShadow: '0 0 12px rgba(79,70,229,0.4)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {adminName}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              State Authority
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button
          className="logout-btn"
          onClick={onLogout}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
