import React, { useEffect, useState } from 'react';
import { Search, AlertTriangle, CheckCircle, Calendar, Cpu, ShieldAlert, BookOpen } from 'lucide-react';
import { diseaseService } from '../services/diseaseService';
import { districtService } from '../services/districtService';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads')) {
    return `http://localhost:5000${imagePath}`;
  }
  return imagePath;
};

export default function DiseaseReports({ onUnauthorized, showToast }) {
  const [reports, setReports] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReportsAndDistricts = async () => {
    setLoading(true);
    try {
      const [reportsRes, districtsRes] = await Promise.all([
        diseaseService.getDiseaseReports(onUnauthorized),
        districtService.getDistricts(onUnauthorized)
      ]);

      if (reportsRes.success) {
        setReports(reportsRes.reports || []);
      } else {
        showToast(reportsRes.message || 'Failed to load disease reports.', 'error');
      }

      if (districtsRes.success) {
        setDistricts(districtsRes.districts || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while fetching reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsAndDistricts();
  }, [onUnauthorized]);

  const getRiskBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'badge-red';
      case 'medium': return 'badge-orange';
      default: return 'badge-blue';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'badge-green';
      case 'underreview': return 'badge-orange';
      default: return 'badge-blue';
    }
  };

  // Apply filters
  const filtered = reports.filter((r) => {
    const matchesSearch = 
      r.symptoms?.toLowerCase().includes(search.toLowerCase()) ||
      r.report_id?.toLowerCase().includes(search.toLowerCase()) ||
      r.farm?.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.ai_analysis?.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict = !districtFilter || r.district?.district_code === districtFilter;
    const matchesRisk = !riskFilter || r.risk_level?.toLowerCase() === riskFilter.toLowerCase();
    const matchesStatus = !statusFilter || r.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDistrict && matchesRisk && matchesStatus;
  });

  const unresolvedCount = reports.filter(r => r.status?.toLowerCase() !== 'resolved').length;
  const resolvedCount = reports.filter(r => r.status?.toLowerCase() === 'resolved').length;

  return (
    <div className="page-content">
      <div className="view-header">
        <div>
          <h2 className="page-title">Disease Reports</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Review state-wide symptoms reported by farmers, inspect AI analysis predictions, and analyze regional outbreaks</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{unresolvedCount}</div>
            <div className="metric-label">Unresolved Reports</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{resolvedCount}</div>
            <div className="metric-label">Resolved Incidents</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, farm name, batch or symptoms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* District Filter */}
        <select
          className="filter-select"
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
        >
          <option value="">All Districts</option>
          {districts.map(d => (
            <option key={d.district_sys_id || d.district_code} value={d.district_code}>
              {d.district_name}
            </option>
          ))}
        </select>

        {/* Risk Level */}
        <select
          className="filter-select"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
        >
          <option value="">All Risks</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>

        {/* Status */}
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="underreview">Under Review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading disease reports...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h4 className="empty-title">No Incident Reports</h4>
          <p className="empty-desc">All caught up! No reports found matching your filters.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map((report) => (
            <div key={report.disease_sys_id || report.report_id} className="data-card">
              <div className="card-header">
                <div>
                  <span className="card-subtitle">{report.report_id} {report.district?.district_name && `• ${report.district.district_name}`}</span>
                  <h3 className="card-title" style={{ marginTop: '4px' }}>{report.farm?.farm_name}</h3>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={`badge ${getRiskBadge(report.risk_level)}`}>
                    {report.risk_level || 'low'}
                  </span>
                  <span className={`badge ${getStatusBadge(report.status)}`}>
                    {report.status || 'pending'}
                  </span>
                </div>
              </div>

              <div className="card-body">
                {report.disease_image && (
                  <div 
                    style={{ 
                      marginBottom: '12px', 
                      borderRadius: 'var(--radius-sm)', 
                      overflow: 'hidden', 
                      border: '1px solid var(--border-color)',
                      height: '140px',
                      width: '100%',
                      cursor: 'zoom-in'
                    }} 
                    onClick={() => window.open(getImageUrl(report.disease_image), '_blank')}
                    title="Click to view full image"
                  >
                    <img 
                      src={getImageUrl(report.disease_image)} 
                      alt="Disease symptom photolog" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Batch:</span>
                  <span className="info-value">{report.batch?.batch_name || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Species:</span>
                  <span className="info-value" style={{ textTransform: 'capitalize' }}>{report.animal_type || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Reporter:</span>
                  <span className="info-value">{report.reported_by || 'N/A'}</span>
                </div>
                <div className="info-row" style={{ flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  <span className="info-label">Symptoms:</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', background: 'var(--bg-app)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    {report.symptoms}
                  </span>
                </div>

                {report.ai_analysis && (
                  <div style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(59, 130, 246, 0.04)', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>
                      <BookOpen size={14} />
                      AI DIAGNOSTIC PROJECTION
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      {report.ai_analysis}
                    </p>
                  </div>
                )}

                {report.remarks && (
                  <div style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--success)', marginBottom: '4px' }}>
                      RESOLUTION REMARKS:
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                      {report.remarks}
                    </p>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Reported: {report.reported_date || 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
