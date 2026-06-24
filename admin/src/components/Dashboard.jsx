import React from 'react';
import { Shield, Layers, Syringe, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Dashboard({ farms, batches, vaccinations, reports, setPage }) {
  const pendingVaccinations = vaccinations.filter(v => v.status?.toLowerCase() === 'pending').length;
  const unresolvedReports = reports.filter(r => r.status?.toLowerCase() !== 'resolved').length;
  const totalLivestock = batches.reduce((acc, curr) => acc + parseInt(curr.animal_count || 0, 10), 0);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      default: return 'var(--info)';
    }
  };

  return (
    <div className="page-content">
      {/* Welcome Header */}
      <div className="view-header" style={{ marginBottom: '32px' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '28px' }}>District Administration Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Real-time insights across farms, disease control programs, and biosecurity alerts
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '36px' }}>
        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setPage('farms')}>
          <div className="metric-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Shield size={26} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{farms.length}</div>
            <div className="metric-label">Registered Farms</div>
          </div>
          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setPage('batches')}>
          <div className="metric-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Layers size={26} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{totalLivestock}</div>
            <div className="metric-label">Livestock Heads</div>
          </div>
          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setPage('vaccinations')}>
          <div className="metric-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Syringe size={26} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{pendingVaccinations}</div>
            <div className="metric-label">Pending Vaccinations</div>
          </div>
          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setPage('disease-reports')}>
          <div className="metric-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertTriangle size={26} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{unresolvedReports}</div>
            <div className="metric-label">Unresolved Incidents</div>
          </div>
          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      <div className="dashboard-sections">
        {/* Left Section - Disease Reports */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Active Disease Incidents</h3>
            <button className="btn-action-outline" onClick={() => setPage('disease-reports')}>
              Manage Reports
            </button>
          </div>

          {reports.filter(r => r.status?.toLowerCase() !== 'resolved').length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--success)', marginBottom: '10px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>All reports resolved</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reports.filter(r => r.status?.toLowerCase() !== 'resolved').slice(0, 3).map((report) => (
                <div 
                  key={report.disease_sys_id || report.report_id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-app)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{report.report_id}</span>
                      <span style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: getRiskColor(report.risk_level) 
                      }}></span>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: getRiskColor(report.risk_level), fontWeight: 700 }}>
                        {report.risk_level} Risk
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {report.farm?.farm_name}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '350px' }}>
                      {report.symptoms}
                    </p>
                  </div>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setPage('disease-reports')}>
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section - Quick Broadcast */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">System Commands</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div 
              onClick={() => setPage('notifications')}
              style={{ 
                padding: '16px', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.03) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
              className="quick-action-row"
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Broadcast System Alert</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Send urgent weather warnings or policies</p>
              </div>
              <ArrowRight size={16} />
            </div>
            
            <div 
              onClick={() => setPage('farms')}
              style={{ 
                padding: '16px', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.03) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
              className="quick-action-row"
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Inspect Registered Farms</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Review owners, location codes, and capacities</p>
              </div>
              <ArrowRight size={16} />
            </div>

            <div 
              onClick={() => setPage('biosecurity')}
              style={{ 
                padding: '16px', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(13, 148, 136, 0.03) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
              className="quick-action-row"
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Audit Biosecurity Logs</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Review sanitation compliance and health scores</p>
              </div>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
