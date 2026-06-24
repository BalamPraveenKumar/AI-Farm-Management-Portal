import React, { useEffect, useState } from 'react';
import { incidentService } from '../services/incidentService';
import { 
  AlertCircle, 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Play, 
  XCircle,
  FileText,
  Tag,
  Eye
} from 'lucide-react';

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
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Detail Modal State
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form State
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [category, setCategory] = useState('vaccination_issue');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [incidentsRes, farmsRes] = await Promise.all([
        incidentService.getIncidents(onUnauthorized),
        incidentService.getFarmsDropdown(onUnauthorized)
      ]);

      if (incidentsRes && incidentsRes.success) {
        // Sort incidents by created_on descending
        const sorted = (incidentsRes.incidents || []).sort((a, b) => {
          return new Date(b.created_on) - new Date(a.created_on);
        });
        setIncidents(sorted);
      } else {
        showToast(incidentsRes?.message || 'Failed to fetch incidents.', 'error');
      }

      if (farmsRes && farmsRes.success) {
        const farmList = farmsRes.farms || [];
        setFarms(farmList);
        if (farmList.length > 0) {
          setSelectedFarmId(farmList[0].farm_id);
        }
      } else {
        showToast(farmsRes?.message || 'Failed to fetch farms dropdown.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading incident data.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    if (!selectedFarmId || !category || !title.trim() || !description.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await incidentService.createIncident({
        farm_id: selectedFarmId,
        category,
        title: title.trim(),
        description: description.trim()
      }, onUnauthorized);

      if (result && result.success) {
        showToast(result.message || 'Incident reported successfully!', 'success');
        setShowModal(false);
        // Clear Form
        setTitle('');
        setDescription('');
        setCategory('vaccination_issue');
        if (farms.length > 0) setSelectedFarmId(farms[0].farm_id);
        
        // Reload list
        loadData(true);
      } else {
        showToast(result?.message || 'Failed to report incident.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred during submission.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (statusValue) => {
    switch (statusValue?.toLowerCase()) {
      case 'open': return 'badge-red';
      case 'inprogress': return 'badge-orange';
      case 'resolved': return 'badge-green';
      case 'closed': return 'badge-gray';
      default: return 'badge-blue';
    }
  };

  const getStatusIcon = (statusValue) => {
    switch (statusValue?.toLowerCase()) {
      case 'open': return <AlertCircle size={14} className="text-red-500" />;
      case 'inprogress': return <Play size={14} className="text-orange-500" />;
      case 'resolved': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'closed': return <XCircle size={14} className="text-gray-500" />;
      default: return <Clock size={14} />;
    }
  };

  // Filtered Incidents
  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = (inc.incident_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (inc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (inc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (inc.farm?.farm_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || inc.category?.value === categoryFilter;
    const matchesStatus = statusFilter === '' || inc.status?.value === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="page-title" style={{ fontSize: '28px' }}>Incident Board</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Report issues and track resolutions for your farm lands</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ display: 'flex', gap: '8px' }} onClick={() => loadData(true)} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinner' : ''} />
            Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)} disabled={farms.length === 0}>
            <Plus size={18} />
            Report Incident
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by Incident ID, Title, Description, Farm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
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
          <p>Syncing your incident board...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h4 className="empty-title">No Incidents Found</h4>
            <p className="empty-desc">
              {searchTerm || categoryFilter || statusFilter 
                ? 'No incident logs match your current search/filter conditions.' 
                : 'Need assistance? Report any vaccination, technical or registry issue using the button above.'}
            </p>
          </div>
          {(searchTerm || categoryFilter || statusFilter) && (
            <button className="btn-secondary" onClick={() => { setSearchTerm(''); setCategoryFilter(''); setStatusFilter(''); }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Farm</th>
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
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{inc.district?.district_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-gray">{inc.category?.label}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(inc.status?.value)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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

      {/* Creation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Report New Incident</h3>
              <button className="drawer-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Impacted Farm *</label>
                  <select
                    className="form-input"
                    value={selectedFarmId}
                    onChange={(e) => setSelectedFarmId(e.target.value)}
                    required
                  >
                    {farms.map((f) => (
                      <option key={f.farm_sys_id || f.farm_id} value={f.farm_id}>
                        {f.farm_name} ({f.farm_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Category *</label>
                  <select
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Short summary of the issue..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description *</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    placeholder="Describe the issue in detail so the District Admin can assist you..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff', borderWidth: '2px' }}></span>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Incident'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedIncident && (
        <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 800 }}>{selectedIncident.incident_id}</span>
                <span>— Details</span>
              </h3>
              <button className="drawer-close" onClick={() => setSelectedIncident(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{selectedIncident.title}</h4>
                <span className={`badge ${getStatusBadgeClass(selectedIncident.status?.value)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>District</span>
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
              </div>

              <div>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '6px' }}>Description</strong>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'pre-line', margin: 0, padding: '10px 14px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  {selectedIncident.description}
                </p>
              </div>

              {selectedIncident.status?.value === 'resolved' && (
                <div style={{ padding: '14px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '6px' }}>
                    <CheckCircle2 size={16} />
                    Resolution Notes
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
