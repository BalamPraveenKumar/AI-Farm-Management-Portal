import React, { useState } from 'react';
import { Search, Syringe, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Vaccinations({ vaccinations, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredVaccs = vaccinations.filter(vac => {
    const matchesSearch = 
      vac.vaccine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vac.vaccination_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vac.farm?.farm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vac.batch?.batch_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || vac.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-content">
      <div className="view-header">
        <div>
          <h2 className="page-title">Vaccinations Registry</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Track vaccination schedules, completions, and pending immunizations across animal batches</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">
              {vaccinations.filter(v => v.status?.toLowerCase() === 'completed').length}
            </div>
            <div className="metric-label">Completed immunizations</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertCircle size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">
              {vaccinations.filter(v => v.status?.toLowerCase() === 'pending').length}
            </div>
            <div className="metric-label">Pending Vaccinations</div>
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
            placeholder="Search by ID, vaccine name, batch or farm..."
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
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching vaccination logs...</p>
        </div>
      ) : filteredVaccs.length === 0 ? (
        <div className="empty-state">
          <h4 className="empty-title">No Vaccinations Found</h4>
          <p className="empty-desc">No immunization records match your search.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vaccination ID</th>
                <th>Vaccine Name</th>
                <th>Farm Location</th>
                <th>Animal Batch</th>
                <th>Due Date</th>
                <th>Completion Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVaccs.map((vac) => (
                <tr key={vac.vaccination_sys_id}>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {vac.vaccination_id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vac.vaccine_name}</span>
                  </td>
                  <td>
                    <span>{vac.farm?.farm_name || 'N/A'}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{vac.batch?.batch_name || 'N/A'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{vac.due_date ? new Date(vac.due_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px' }}>
                      {vac.completion_date ? new Date(vac.completion_date).toLocaleDateString() : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${vac.status?.toLowerCase() === 'completed' ? 'badge-green' : 'badge-orange'}`}>
                      {vac.status || 'unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
