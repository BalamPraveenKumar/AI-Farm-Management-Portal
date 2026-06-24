import React, { useEffect, useState } from 'react';
import { farmService } from '../services/farmService';
import { batchService } from '../services/batchService';
import { diseaseService } from '../services/diseaseService';
import { vaccinationService } from '../services/vaccinationService';
import { biosecurityService } from '../services/biosecurityService';
import { 
  Home, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Calendar, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function Dashboard({ setPage, showToast, onUnauthorized }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    farms: 0,
    batches: 0,
    activeReports: 0,
    pendingVaccinations: 0,
    overdueVaccinations: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);
  const [latestChecklist, setLatestChecklist] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [farmsRes, batchesRes, reportsRes, vaccsRes, checkRes] = await Promise.all([
        farmService.getFarms(onUnauthorized),
        batchService.getBatches(onUnauthorized),
        diseaseService.getDiseaseReports(onUnauthorized),
        vaccinationService.getVaccinations(onUnauthorized),
        biosecurityService.getChecklists(onUnauthorized)
      ]);

      let farmCount = 0;
      let batchCount = 0;
      let activeReportCount = 0;
      let pendingVaccCount = 0;
      let overdueVaccCount = 0;
      
      const today = new Date().toISOString().split('T')[0];

      if (farmsRes && farmsRes.success) {
        farmCount = farmsRes.count || farmsRes.farms?.length || 0;
      }
      if (batchesRes && batchesRes.success) {
        batchCount = batchesRes.count || batchesRes.batches?.length || 0;
      }
      if (reportsRes && reportsRes.success) {
        const reports = reportsRes.reports || [];
        activeReportCount = reports.filter(r => r.status !== 'resolved').length;
        setRecentReports(reports.slice(0, 5));
      }
      if (vaccsRes && vaccsRes.success) {
        const vaccs = vaccsRes.vaccinations || [];
        pendingVaccCount = vaccs.filter(v => v.status === 'pending').length;
        
        // Highlight overdue items (due_date < today and status != completed)
        overdueVaccCount = vaccs.filter(v => {
          const isOverdue = v.due_date && v.due_date < today;
          return isOverdue && v.status !== 'completed';
        }).length;

        // Upcoming/Pending vaccinations sorted by due_date
        const upcoming = vaccs
          .filter(v => v.status === 'pending' || (v.due_date && v.due_date < today && v.status !== 'completed'))
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        setUpcomingVaccinations(upcoming.slice(0, 5));
      }
      if (checkRes && checkRes.success) {
        const checkLists = checkRes.checklists || [];
        if (checkLists.length > 0) {
          setLatestChecklist(checkLists[0]); // newest is first
        }
      }

      setStats({
        farms: farmCount,
        batches: batchCount,
        activeReports: activeReportCount,
        pendingVaccinations: pendingVaccCount,
        overdueVaccinations: overdueVaccCount
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to load dashboard statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'success';
      case 'underreview': return 'warning';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Gathering farm analytics...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      {stats.overdueVaccinations > 0 && (
        <div className="alert-banner">
          <AlertCircle size={20} />
          <span>
            <strong>Attention:</strong> You have {stats.overdueVaccinations} overdue vaccination{stats.overdueVaccinations > 1 ? 's' : ''}. Please update them as soon as possible.
          </span>
          <button 
            className="btn-action-outline" 
            style={{ marginLeft: 'auto', border: '1px solid currentColor', color: 'inherit', padding: '4px 10px' }}
            onClick={() => setPage('vaccinations')}
          >
            Resolve Now
          </button>
        </div>
      )}

      {/* Dashboard Metrics */}
      <div className="dashboard-grid">
        <div className="metric-card" onClick={() => setPage('farms')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--primary)' }}>
            <Home size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{stats.farms}</div>
            <div className="metric-label">Total Farms</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => setPage('batches')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--info)' }}>
            <Layers size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{stats.batches}</div>
            <div className="metric-label">Animal Batches</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => setPage('disease-reports')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)' }}>
            <Activity size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{stats.activeReports}</div>
            <div className="metric-label">Active Disease Reports</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => setPage('vaccinations')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon-wrapper" style={{ 
            backgroundColor: stats.overdueVaccinations > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)', 
            color: stats.overdueVaccinations > 0 ? 'var(--danger)' : 'var(--warning)' 
          }}>
            <Calendar size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{stats.pendingVaccinations}</div>
            <div className="metric-label">
              Pending Vaccs {stats.overdueVaccinations > 0 && <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>({stats.overdueVaccinations} Overdue)</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        {/* Recent Disease Reports */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Recent Disease Reports</h3>
            <button className="btn-action-outline" onClick={() => setPage('disease-reports')}>
              View All
            </button>
          </div>

          {recentReports.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px', borderStyle: 'none' }}>
              <ShieldCheck size={40} style={{ color: 'var(--success)' }} />
              <div>
                <p className="empty-title">All Animals Safe</p>
                <p className="empty-desc">No disease outbreaks or reports filed recently.</p>
              </div>
            </div>
          ) : (
            <div className="table-container" style={{ boxShadow: 'none', border: 'none', marginBottom: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Farm / Batch</th>
                    <th>Symptoms</th>
                    <th>Risk</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map(report => (
                    <tr key={report.report_sys_id}>
                      <td style={{ fontWeight: 'bold', fontFamily: 'var(--mono)' }}>{report.report_id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{report.farm?.farm_name || 'N/A'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{report.batch?.batch_name || 'N/A'}</div>
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.symptoms}
                      </td>
                      <td>
                        <span className={`badge badge-${getRiskColor(report.risk_level)}`}>
                          {report.risk_level || 'low'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Insights & Action Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Latest Biosecurity Checklist Info */}
          <div className="dashboard-panel" style={{ flexGrow: 0 }}>
            <div className="panel-header">
              <h3 className="panel-title">Biosecurity Audit</h3>
              <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
            </div>
            
            {latestChecklist ? (() => {
              const isTrue = (val) => val === true || val === 'true';
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    LAST FILED: {latestChecklist.created_on ? new Date(latestChecklist.created_on).toLocaleDateString() : 'Recent'}
                  </div>
                  <div className="info-row">
                    <span className="info-label">Farm</span>
                    <span className="info-value">{latestChecklist.farm?.farm_name || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Disinfection Done</span>
                    <span className={`badge badge-${isTrue(latestChecklist.farm_sanitized) ? 'green' : 'red'}`}>
                      {isTrue(latestChecklist.farm_sanitized) ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Sick Isolated</span>
                    <span className={`badge badge-${isTrue(latestChecklist.sick_animals_isolated) ? 'green' : 'orange'}`}>
                      {isTrue(latestChecklist.sick_animals_isolated) ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <button className="btn-secondary" style={{ marginTop: '8px' }} onClick={() => setPage('biosecurity')}>
                    File New Checklist
                  </button>
                </div>
              );
            })() : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>No biosecurity logs filed yet.</p>
                <button className="btn-secondary" onClick={() => setPage('biosecurity')}>
                  Log First Checklist
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Vaccinations Panel */}
          <div className="dashboard-panel" style={{ flexGrow: 1 }}>
            <div className="panel-header">
              <h3 className="panel-title">Due Vaccinations</h3>
              <Clock size={20} style={{ color: 'var(--warning)' }} />
            </div>

            {upcomingVaccinations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '13px' }}>No vaccinations scheduled or pending.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingVaccinations.map(v => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isOverdue = v.due_date && v.due_date < todayStr;
                  return (
                    <div 
                      key={v.vaccination_sys_id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: `3px solid ${isOverdue ? 'var(--danger)' : 'var(--warning)'}`
                      }}
                    >
                      <div style={{ minWidth: 0, flexGrow: 1, marginRight: '10px' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {v.vaccine_name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Batch: {v.batch?.batch_name || 'N/A'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)' }}>
                          Due: {v.due_date}
                        </div>
                        {isOverdue && <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--danger)', textTransform: 'uppercase' }}>OVERDUE</span>}
                      </div>
                    </div>
                  );
                })}
                <button className="btn-secondary" style={{ width: '100%', marginTop: '8px' }} onClick={() => setPage('vaccinations')}>
                  Manage Vaccinations
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
