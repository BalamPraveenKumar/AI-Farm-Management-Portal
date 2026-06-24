import React, { useEffect, useState } from 'react';
import { Search, AlertCircle, Play, CheckCircle2, XCircle, Clock, X, Check, Eye } from 'lucide-react';
import { incidentService } from '../services/incidentService';

const CATEGORIES = [
  { value: 'vaccination_issue', label: 'Vaccination Issue' },
  { value: 'account_issue', label: 'Account Issue' },
  { value: 'farm_registration_issue', label: 'Farm Registration Issue' },
  { value: 'batch_issue', label: 'Batch Issue' },
  { value: 'disease_report_issue', label: 'Disease Report Issue' },
  { value: 'notification_issue', label: 'Notification Issue' },
  { value: 'technical_issue', label: 'Technical Issue' },
  { value: 'other', label: 'Other' }
];

export default function Incidents({ showToast, onUnauthorized }) {
  const [incidents, setIncidents] = useState([]);
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  // Status Update State in Modal
  const [newStatus, setNewStatus] = useState('inprogress');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchIncidents = async (silent = false) => {
    if (!silent) setLoading(true);
    const res = await incidentService.getIncidents(onUnauthorized);
    setLoading(false);
    if (res.success) {
      // Sort incidents descending by created_on
      const sorted = (res.incidents || []).sort((a, b) => {
        return new Date(b.created_on) - new Date(a.created_on);
      });
      setIncidents(sorted);
      if (res.district) setDistrict(res.district);
    } else {
      showToast(res.message || 'Failed to fetch district incidents.', 'error');
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;

    setSubmitting(true);
    const result = await incidentService.updateIncidentStatus(
      selectedIncident.incident_id,
      newStatus,
      resolutionNotes.trim(),
      onUnauthorized
    );
    setSubmitting(false);

    if (result.success) {
      showToast('Incident updated successfully.', 'success');
      
      // Update locally
      setIncidents(prev => 
        prev.map(inc => inc.incident_id === selectedIncident.incident_id 
          ? { 
              ...inc, 
              status: result.incident?.status || { value: newStatus, label: newStatus },
              resolution_notes: result.incident?.resolution_notes || resolutionNotes.trim()
            } 
          : inc
        )
      );

      setSelectedIncident(null);
      setResolutionNotes('');
    } else {
      showToast(result.message || 'Failed to update incident status.', 'error');
    }
  };

  const getStatusBadge = (statusVal) => {
    switch (statusVal?.toLowerCase()) {
      case 'open': return 'badge-red';
      case 'inprogress': return 'badge-orange';
      case 'resolved': return 'badge-green';
      case 'closed': return 'badge-gray';
      default: return 'badge-blue';
    }
  };

  const getStatusIcon = (statusVal) => {
    switch (statusVal?.toLowerCase()) {
      case 'open': return <AlertCircle size={13} className="text-red-500" />;
      case 'inprogress': return <Play size={13} className="text-orange-500" />;
      case 'resolved': return <CheckCircle2 size={13} className="text-green-500" />;
      case 'closed': return <XCircle size={13} className="text-gray-500" />;
      default: return <Clock size={13} />;
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = 
      (inc.incident_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.farm?.farm_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.farmer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || inc.category?.value === categoryFilter;
    const matchesStatus = statusFilter === 'all' || inc.status?.value === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="page-content">
      <div className="view-header">
        <div>
          <h2 className="page-title">Incidents Desk</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Manage farmer issues reported in <strong>{district || 'your assigned'} District</strong>
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertCircle size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">
              {incidents.filter(i => i.status?.value === 'open').length}
            </div>
            <div className="metric-label">Open Issues</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
            <Play size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">
              {incidents.filter(i => i.status?.value === 'inprogress').length}
            </div>
            <div className="metric-label">In Progress</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">
              {incidents.filter(i => i.status?.value === 'resolved').length}
            </div>
            <div className="metric-label">Resolved Issues</div>
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
            placeholder="Search by ID, title, farmer or farm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="inprogress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching district incidents...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="empty-state">
          <h4 className="empty-title">No Incidents Filed</h4>
          <p className="empty-desc">No incident logs matched your search/filter settings.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Farm / Owner</th>
                <th>Category</th>
                <th>Status</th>
                <th>Reported On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map(inc => (
                <tr key={inc.incident_sys_id || inc.incident_id}>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {inc.incident_id}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inc.title}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inc.description}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>{inc.farm?.farm_name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{inc.farmer?.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-gray">{inc.category?.label}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(inc.status?.value)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {getStatusIcon(inc.status?.value)}
                      {inc.status?.label}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{inc.created_on}</span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => {
                        setSelectedIncident(inc);
                        setNewStatus(inc.status?.value || 'inprogress');
                        setResolutionNotes(inc.resolution_notes || '');
                      }}
                    >
                      <Eye size={13} />
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resolution Drawer Overlay */}
      {selectedIncident && (
        <div className="drawer-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="drawer-header">
              <h3 className="drawer-title">Manage Incident</h3>
              <button className="drawer-close" onClick={() => setSelectedIncident(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Incident Meta info */}
              <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--primary)' }}>
                    {selectedIncident.incident_id}
                  </span>
                  <span className={`badge ${getStatusBadge(selectedIncident.status?.value)}`}>
                    {selectedIncident.status?.label}
                  </span>
                </div>
                <h4 style={{ margin: '4px 0', fontSize: '15px', fontWeight: 700 }}>{selectedIncident.title}</h4>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                  <strong>Description:</strong> {selectedIncident.description}
                </p>
                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '10px 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <div>Farm: <strong>{selectedIncident.farm?.farm_name}</strong></div>
                  <div>Farmer: <strong>{selectedIncident.farmer?.name}</strong></div>
                  <div>District: <strong>{selectedIncident.district?.district_name}</strong></div>
                  <div>Category: <strong>{selectedIncident.category?.label}</strong></div>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Update Status *</label>
                  <select
                    className="form-input"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    disabled={submitting}
                  >
                    <option value="open">Open</option>
                    <option value="inprogress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Resolution Notes / Comments</label>
                  <textarea
                    className="form-input"
                    placeholder="Provide details about issue investigation, steps taken to resolve, or instructions for the farmer..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={6}
                    disabled={submitting}
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
                  ) : (
                    <>
                      <Check size={16} />
                      Save Status Updates
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
