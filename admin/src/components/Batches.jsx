import React, { useState } from 'react';
import { Search, Layers, Calendar, BarChart3 } from 'lucide-react';

export default function Batches({ batches, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = 
      batch.batch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.batch_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.farm?.farm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.breed?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || batch.animal_type?.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="page-content">
      <div className="view-header">
        <div>
          <h2 className="page-title">Animal Batches</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Monitor livestock groups, arrivals, and breeds across all district facilities</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Layers size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{batches.length}</div>
            <div className="metric-label">Total Active Batches</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <BarChart3 size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">
              {batches.reduce((acc, curr) => acc + parseInt(curr.animal_count || 0, 10), 0)}
            </div>
            <div className="metric-label">Total Livestock Heads</div>
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
            placeholder="Search by ID, batch name, breed, or farm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Species</option>
          <option value="cow">Cow</option>
          <option value="sheep">Sheep</option>
          <option value="goat">Goat</option>
          <option value="poultry">Poultry</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching active animal batches...</p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="empty-state">
          <h4 className="empty-title">No Batches Found</h4>
          <p className="empty-desc">No animal batches match the search criteria.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Batch Name</th>
                <th>Farm Location</th>
                <th>Species</th>
                <th>Breed</th>
                <th>Count</th>
                <th>Arrival Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((batch) => (
                <tr key={batch.batch_sys_id}>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {batch.batch_id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{batch.batch_name}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{batch.farm?.farm_name || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="badge badge-gray">{batch.animal_type || 'N/A'}</span>
                  </td>
                  <td>
                    <span>{batch.breed || 'N/A'}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{batch.animal_count || 0} heads</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{batch.arrival_date ? new Date(batch.arrival_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${batch.status === 'active' ? 'badge-green' : 'badge-orange'}`}>
                      {batch.status || 'unknown'}
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
