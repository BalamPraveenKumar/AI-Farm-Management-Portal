import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, Clock, Check, Eye, X, BookOpen } from 'lucide-react';
import { diseaseService } from '../services/diseaseService';

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

export default function DiseaseReports({ reports, loading, onResolveSuccess, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolveRemarks, setResolveRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolveRemarks.trim()) {
      showToast('Please provide resolution remarks.', 'error');
      return;
    }

    setSubmitting(true);
    const result = await diseaseService.resolveReport(selectedReport.report_id, resolveRemarks.trim());
    setSubmitting(false);

    if (result.success) {
      showToast('Disease report resolved successfully.', 'success');
      onResolveSuccess(selectedReport.report_id, result.data || { status: 'resolved', remarks: resolveRemarks.trim() });
      setSelectedReport(null);
      setResolveRemarks('');
    } else {
      showToast(result.message || 'Failed to resolve report.', 'error');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.report_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.farm?.farm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.batch?.batch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.symptoms?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-content">
      <div className="view-header">
        <div>
          <h2 className="page-title">Disease Reports</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Review symptoms reported by farmers, inspect AI analysis predictions, and dispatch resolution remarks</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">
              {reports.filter(r => r.status?.toLowerCase() !== 'resolved').length}
            </div>
            <div className="metric-label">Unresolved Reports</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">
              {reports.filter(r => r.status?.toLowerCase() === 'resolved').length}
            </div>
            <div className="metric-label">Resolved Incidents</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, farm name, batch or symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
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
      ) : filteredReports.length === 0 ? (
        <div className="empty-state">
          <h4 className="empty-title">No Incident Reports</h4>
          <p className="empty-desc">All caught up! No reports found matching your search.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredReports.map((report) => (
            <div key={report.disease_sys_id || report.report_id} className="data-card">
              <div className="card-header">
                <div>
                  <span className="card-subtitle">{report.report_id}</span>
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

                {report.status === 'resolved' && report.remarks && (
                  <div style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--success)', marginBottom: '4px' }}>
                      RESOLUTION REMARKS:
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                      {report.remarks}
                    </p>
                    {report.resolved_on && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Resolved: {report.resolved_on}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="card-footer">
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Reported: {report.reported_date || 'N/A'}
                </span>
                
                {report.status !== 'resolved' && (
                  <button 
                    className="btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => {
                      setSelectedReport(report);
                      setResolveRemarks('');
                    }}
                  >
                    <Check size={14} />
                    Resolve Incident
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Drawer Overlay */}
      {selectedReport && (
        <div className="drawer-overlay" onClick={() => setSelectedReport(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="drawer-title">Resolve Incident</h3>
              <button className="drawer-close" onClick={() => setSelectedReport(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="drawer-body">
              <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{selectedReport.report_id}</span>
                <h4 style={{ margin: '4px 0', fontSize: '16px', fontWeight: 700 }}>{selectedReport.farm?.farm_name}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  <strong>Symptoms:</strong> {selectedReport.symptoms}
                </p>
              </div>

              <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Resolution Actions / Remarks *</label>
                  <textarea
                    className="form-input"
                    placeholder="Provide details about veterinary team visits, treatment, or medications supplied..."
                    value={resolveRemarks}
                    onChange={(e) => setResolveRemarks(e.target.value)}
                    rows={6}
                    disabled={submitting}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderTopColor: '#fff' }}></span>
                  ) : 'Confirm Resolution'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
