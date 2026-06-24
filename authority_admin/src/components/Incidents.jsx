import React, { useEffect, useState } from 'react';
import { Search, AlertCircle, Play, CheckCircle2, XCircle, Clock, X, Eye, Shield, MapPin } from 'lucide-react';
import { incidentService } from '../services/incidentService';
import { districtService } from '../services/districtService';

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
  const [summary, setSummary] = useState({
    total_incidents: 0,
    open: 0,
    inprogress: 0,
    resolved: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [districtsList, setDistrictsList] = useState([]);

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    const [incidentsRes, districtsRes] = await Promise.all([
      incidentService.getIncidents(onUnauthorized),
      districtService.getDistricts(onUnauthorized)
    ]);
    setLoading(false);

    if (incidentsRes.success) {
      // Sort incidents descending by created_on
      const sorted = (incidentsRes.incidents || []).sort((a, b) => {
        return new Date(b.created_on) - new Date(a.created_on);
      });
      setIncidents(sorted);

      // Compute summary metrics dynamically from the loaded incidents data
      const total_incidents = sorted.length;
      const open = sorted.filter(i => i.status?.value === 'open').length;
      const inprogress = sorted.filter(i => i.status?.value === 'inprogress').length;
      const resolved = sorted.filter(i => i.status?.value === 'resolved').length;
      const closed = sorted.filter(i => i.status?.value === 'closed').length;
      setSummary({ total_incidents, open, inprogress, resolved, closed });
    } else {
      showToast(incidentsRes.message || 'Failed to fetch state incidents.', 'error');
    }

    if (districtsRes.success) {
      setDistrictsList(districtsRes.districts || []);
    } else {
      showToast(districtsRes.message || 'Failed to fetch active districts list.', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Using districtsList loaded dynamically from ServiceNow API

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = 
      (inc.incident_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.farm?.farm_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.farmer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.district?.district_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || inc.category?.value === categoryFilter;
    const matchesStatus = statusFilter === 'all' || inc.status?.value === statusFilter;
    const matchesDistrict = districtFilter === 'all' || inc.district?.district_name === districtFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesDistrict;
  });

  return (
    <div className="page-content">
      <div className="view-header">
        <div>
          <h2 className="page-title">Incidents Operations Control</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            State-wide monitoring and oversight of farmer-reported incidents across all districts
          </p>
        </div>
      </div>

      {/* State Overview Summary Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="metric-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="metric-details">
            <div className="metric-value">{summary.total_incidents}</div>
            <div className="metric-label">Total Reported</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="metric-details">
            <div className="metric-value" style={{ color: '#ef4444' }}>{summary.open}</div>
            <div className="metric-label">Open Issues</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #f97316' }}>
          <div className="metric-details">
            <div className="metric-value" style={{ color: '#f97316' }}>{summary.inprogress}</div>
            <div className="metric-label">In Progress</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="metric-details">
            <div className="metric-value" style={{ color: '#10b981' }}>{summary.resolved}</div>
            <div className="metric-label">Resolved</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #6b7280' }}>
          <div className="metric-details">
            <div className="metric-value" style={{ color: '#6b7280' }}>{summary.closed}</div>
            <div className="metric-label">Closed</div>
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
            placeholder="Search by ID, title, farm, district or farmer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            className="filter-select"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="all">All Districts</option>
            {districtsList.map(dist => (
              <option key={dist.district_sys_id || dist.district_code} value={dist.district_name}>{dist.district_name}</option>
            ))}
          </select>
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
          <p>Syncing state incidents logs...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="empty-state">
          <h4 className="empty-title">No Incident Logs Found</h4>
          <p className="empty-desc">No incidents registered matching your search criteria.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>District</th>
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
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <MapPin size={12} className="text-blue-500" />
                      {inc.district?.district_name || 'N/A'}
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
                      onClick={() => setSelectedIncident(inc)}
                    >
                      <Eye size={13} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details View Modal */}
      {selectedIncident && (
        <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 800 }}>{selectedIncident.incident_id}</span>
                <span>— State Incident Log</span>
              </h3>
              <button className="drawer-close" onClick={() => setSelectedIncident(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{selectedIncident.title}</h4>
                <span className={`badge ${getStatusBadge(selectedIncident.status?.value)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {getStatusIcon(selectedIncident.status?.value)}
                  {selectedIncident.status?.label}
                </span>
              </div>

              <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Farm Name</span>
                  <strong>{selectedIncident.farm?.farm_name} ({selectedIncident.farm?.farm_id})</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>District Location</span>
                  <strong>{selectedIncident.district?.district_name} ({selectedIncident.district?.district_code})</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Category</span>
                  <strong>{selectedIncident.category?.label}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Reported On</span>
                  <strong>{selectedIncident.created_on}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Farmer Name</span>
                  <strong>{selectedIncident.farmer?.name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Reported By (User ID)</span>
                  <strong style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>{selectedIncident.created_by?.user_sys_id || 'N/A'}</strong>
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '6px' }}>Farmer Description</strong>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'pre-line', margin: 0, padding: '10px 14px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  {selectedIncident.description}
                </p>
              </div>

              {(selectedIncident.status?.value === 'resolved' || selectedIncident.resolution_notes) && (
                <div style={{ padding: '14px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '6px' }}>
                    <CheckCircle2 size={16} />
                    Official Resolution Notes
                  </strong>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-line' }}>
                    {selectedIncident.resolution_notes || 'No resolution notes provided.'}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedIncident(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
