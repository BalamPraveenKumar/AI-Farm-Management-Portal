import React, { useEffect, useState } from 'react';
import { 
  Map, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Calendar,
  AlertOctagon
} from 'lucide-react';
import { districtService } from '../services/districtService';
import { farmService } from '../services/farmService';
import { batchService } from '../services/batchService';
import { diseaseService } from '../services/diseaseService';
import { biosecurityService } from '../services/biosecurityService';


export default function Dashboard({ setPage, onUnauthorized, showToast }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    districts: 0,
    farms: 0,
    batches: 0,
    checklists: 0,
    averageScore: 0,
    excellent: 0,
    good: 0,
    needsImprovement: 0
  });
  const [diseaseReports, setDiseaseReports] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [
          districtsRes,
          farmsRes,
          batchesRes,
          diseaseRes,
          summaryRes
        ] = await Promise.all([
          districtService.getDistricts(onUnauthorized),
          farmService.getFarms(onUnauthorized),
          batchService.getBatches(onUnauthorized),
          diseaseService.getDiseaseReports(onUnauthorized),
          biosecurityService.getBiosecuritySummary(onUnauthorized)
        ]);

        let districtsCount = 26;
        let farmsCount = 0;
        let batchesCount = 0;

        if (districtsRes.success) districtsCount = districtsRes.count || districtsRes.districts?.length || 26;
        if (farmsRes.success) farmsCount = farmsRes.count || farmsRes.farms?.length || 0;
        if (batchesRes.success) batchesCount = batchesRes.count || batchesRes.batches?.length || 0;

        const latestDiseases = diseaseRes.success ? (diseaseRes.reports || []).slice(0, 5) : [];

        if (summaryRes.success) {
          setStats({
            districts: districtsCount,
            farms: farmsCount,
            batches: batchesCount,
            checklists: summaryRes.total_checklists || 0,
            averageScore: summaryRes.average_score || 0,
            excellent: summaryRes.excellent || 0,
            good: summaryRes.good || 0,
            needsImprovement: summaryRes.needs_improvement || 0
          });
        } else {
          setStats(prev => ({
            ...prev,
            districts: districtsCount,
            farms: farmsCount,
            batches: batchesCount
          }));
        }

        setDiseaseReports(latestDiseases);
      } catch (error) {
        console.error('Dashboard loading error:', error);
        showToast('Failed to aggregate state dashboard metrics.', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [onUnauthorized]);

  if (loading) {
    return (
      <div className="loading-container">
        <span className="spinner" />
        <span style={{ fontWeight: 600 }}>Aggregating Statewide Farm Metrics...</span>
      </div>
    );
  }

  // Determine status color based on average biosecurity score
  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div>
      {/* KPI Stats Row */}
      <div className="dashboard-grid">
        {/* Total Districts */}
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(79, 70, 229, 0.12)', color: '#4f46e5' }}>
            <Map size={22} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{stats.districts}</div>
            <div className="metric-label">Total Districts Active</div>
          </div>
          <button 
            onClick={() => setPage('districts')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Total Farms */}
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
            <MapPin size={22} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{stats.farms}</div>
            <div className="metric-label">Registered Farms</div>
          </div>
          <button 
            onClick={() => setPage('farms')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Active Batches */}
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(217, 70, 239, 0.12)', color: '#d946ef' }}>
            <Layers size={22} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{stats.batches}</div>
            <div className="metric-label">Live Animal Batches</div>
          </div>
          <button 
            onClick={() => setPage('batches')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Compliance Rating */}
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <ShieldCheck size={22} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{stats.averageScore}%</div>
            <div className="metric-label">Biosecurity Score</div>
          </div>
          <button 
            onClick={() => setPage('biosecurity')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="dashboard-sections">
        {/* LEFT SECTION: Biosecurity summary chart & Disease incident list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          {/* Biosecurity aggregate stats */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Biosecurity Compliance Rating</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                Aggregated from {stats.checklists} log sheets
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
              {/* Circular gauge styling */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 100, height: 100,
                  borderRadius: '50%',
                  background: `conic-gradient(${getScoreColor(stats.averageScore)} ${stats.averageScore * 3.6}deg, var(--border-color) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    width: 80, height: 80,
                    borderRadius: '50%',
                    background: 'var(--bg-card)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                      {stats.averageScore}%
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>
                      State Avg
                    </span>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {stats.averageScore >= 80 ? 'Excellent Standing' : stats.averageScore >= 65 ? 'Satisfactory Standing' : 'Urgent Audits Needed'}
                  </h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 280, lineHeight: 1.4 }}>
                    Standard state index target is 80%+. Please send alert warnings to non-compliant districts.
                  </p>
                </div>
              </div>

              {/* Grid breakdown */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 110px)', gap: 12
              }}>
                <div style={{
                  padding: 12, background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center'
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{stats.excellent}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>Excellent</div>
                </div>

                <div style={{
                  padding: 12, background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center'
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>{stats.good}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>Good</div>
                </div>

                <div style={{
                  padding: 12, background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center'
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#ef4444' }}>{stats.needsImprovement}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>Critique</div>
                </div>
              </div>
            </div>
          </div>

          {/* Disease Reports panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Active Health Incidents</h3>
              <button 
                onClick={() => setPage('disease-reports')}
                style={{
                  background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, 
                  fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                View Registry <ArrowRight size={14} />
              </button>
            </div>

            {diseaseReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                No active disease incidents logged across the state.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {diseaseReports.map((report) => (
                  <div 
                    key={report.report_id}
                    className="quick-action-row"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px', background: 'var(--bg-app)', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', transition: 'all 0.2s', cursor: 'pointer'
                    }}
                    onClick={() => setPage('disease-reports')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: report.risk_level === 'high' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: report.risk_level === 'high' ? '#ef4444' : '#f59e0b', flexShrink: 0
                      }}>
                        <AlertOctagon size={18} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {report.symptoms}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{report.farm?.farm_name}</span>
                          <span>•</span>
                          <span>{report.district?.district_name}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={`badge badge-${report.risk_level === 'high' ? 'danger' : 'warning'}`}>
                        {report.risk_level}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {report.reported_date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SECTION: Quick Alerts Panel & Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          {/* Quick Alert Broadcast */}
          <div className="dashboard-panel" style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.04) 0%, rgba(139, 92, 246, 0.04) 100%)',
            border: '1px solid rgba(79, 70, 229, 0.15)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} style={{ color: '#4f46e5' }} />
              Broadcast Alert
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 20 }}>
              Quickly send disease warnings, vaccination campaign notifications, or weather guidelines statewide.
            </p>

            <button 
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              onClick={() => setPage('notifications')}
            >
              <PlusCircle size={16} />
              Compose Alert
            </button>
          </div>

          {/* Quick Stats list */}
          <div className="dashboard-panel">
            <h3 className="panel-title" style={{ marginBottom: 16 }}>Oversight Shortcuts</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Shortcut 1 */}
              <div 
                style={{
                  display: 'flex', alignItems: 'center', justifycontent: 'space-between', padding: '12px',
                  border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  transition: 'border-color var(--transition-fast)'
                }}
                onClick={() => setPage('vaccinations')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-border)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexGrow: 1 }}>
                  <TrendingUp size={16} style={{ color: '#8b5cf6' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Vaccinations Due</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Audit pending items</div>
                  </div>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>

              {/* Shortcut 2 */}
              <div 
                style={{
                  display: 'flex', alignItems: 'center', justifycontent: 'space-between', padding: '12px',
                  border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  transition: 'border-color var(--transition-fast)'
                }}
                onClick={() => setPage('biosecurity')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-border)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexGrow: 1 }}>
                  <ShieldCheck size={16} style={{ color: '#10b981' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Biosecurity Auditing</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Inspect sanitation sheets</div>
                  </div>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>

              {/* Shortcut 3 */}
              <div 
                style={{
                  display: 'flex', alignItems: 'center', justifycontent: 'space-between', padding: '12px',
                  border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  transition: 'border-color var(--transition-fast)'
                }}
                onClick={() => setPage('districts')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-border)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexGrow: 1 }}>
                  <Map size={16} style={{ color: '#4f46e5' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Districts Registry</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>26 AP Districts lists</div>
                  </div>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
