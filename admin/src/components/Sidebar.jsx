import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Layers, 
  ShieldAlert, 
  Syringe, 
  BellRing, 
  LogOut, 
  Shield,
  Leaf,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',       label: 'Dashboard',       icon: <LayoutDashboard size={18} /> },
  { id: 'farms',           label: 'Farms Registry',   icon: <Map size={18} /> },
  { id: 'batches',         label: 'Animal Batches',   icon: <Layers size={18} /> },
  { id: 'vaccinations',    label: 'Vaccinations',     icon: <Syringe size={18} /> },
  { id: 'biosecurity',     label: 'Biosecurity Logs', icon: <ShieldCheck size={18} /> },
  { id: 'disease-reports', label: 'Disease Reports',  icon: <ShieldAlert size={18} /> },
  { id: 'incidents',       label: 'Incidents Desk',   icon: <AlertCircle size={18} /> },
  { id: 'notifications',   label: 'Broadcast Alert',  icon: <BellRing size={18} /> },
];

export default function Sidebar({ currentPage, setPage, onLogout }) {
  const adminName = sessionStorage.getItem('admin_username') || 'Admin';
  const initials   = adminName.substring(0, 2).toUpperCase();

  return (
    <aside className="sidebar" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* subtle gradient shimmer at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, #0d9488, #0f766e, #10b981)',
        zIndex: 10
      }} />

      {/* ── Brand / Logo ────────────────────────── */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Shield size={20} />
        </div>
        <div>
          <div className="brand-name">FarmAdmin</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.8px' }}>
            DISTRICT PORTAL
          </div>
        </div>
      </div>

      {/* ── Navigation ──────────────────────────── */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = currentPage === item.id;

          /* Section divider before 'Broadcast Alert' */
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
                    ? 'linear-gradient(135deg, #0d9488, #115e59)'
                    : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s',
                  boxShadow: isActive ? '0 4px 16px rgba(13,148,136,0.35)' : 'none',
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
                {/* left accent pill for active */}
                {isActive && (
                  <span style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: '60%', background: '#93c5fd', borderRadius: '0 2px 2px 0'
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

      {/* ── Footer / User Profile ────────────────── */}
      <div className="sidebar-footer">
        {/* AP State indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          background: 'rgba(13, 148, 136, 0.08)',
          border: '1px solid rgba(13, 148, 136, 0.15)',
          borderRadius: 'var(--radius-md)',
        }}>
          <Leaf size={13} style={{ color: '#34d399' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            Andhra Pradesh · Farm Mgmt
          </span>
        </div>

        {/* Avatar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #0d9488, #0f766e)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 13,
            boxShadow: '0 0 12px rgba(13,148,136,0.4)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {adminName}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.3px' }}>
              District Official
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px', width: '100%',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.55)',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            transition: 'all 0.18s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
          }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
