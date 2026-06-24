import React, { useState } from 'react';
import { Search, MapPin, Users, Activity, Layers } from 'lucide-react';

export default function Farms({ farms, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [farmTypeFilter, setFarmTypeFilter] = useState('all');

  const filteredFarms = farms.filter(farm => {
    const matchesSearch = 
      farm.farm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.farm_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = farmTypeFilter === 'all' || farm.farm_type?.toLowerCase() === farmTypeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="page-content">
      <div className="view-header">
        <div>
          <h2 className="page-title">Farms Registry</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Overview of registered dairy, poultry, and animal farms in the district</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Activity size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{farms.length}</div>
            <div className="metric-label">Total Registered Farms</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Layers size={24} />
          </div>
          <div className="metric-details">
            <div className="metric-value">
              {farms.reduce((acc, curr) => acc + parseInt(curr.capacity || 0, 10), 0)}
            </div>
            <div className="metric-label">Cumulative Holding Capacity</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, name, village or farmer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={farmTypeFilter}
          onChange={(e) => setFarmTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="cow">Cow Farms</option>
          <option value="sheep">Sheep Farms</option>
          <option value="goat">Goat Farms</option>
          <option value="poultry">Poultry Farms</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching district farms...</p>
        </div>
      ) : filteredFarms.length === 0 ? (
        <div className="empty-state">
          <h4 className="empty-title">No Farms Found</h4>
          <p className="empty-desc">No registered farms match your search/filter parameters.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Farm ID</th>
                <th>Farm Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Owner (Farmer)</th>
                <th>Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredFarms.map((farm) => (
                <tr key={farm.farm_sys_id}>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {farm.farm_id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{farm.farm_name}</span>
                  </td>
                  <td>
                    <span className={`badge badge-blue`}>{farm.farm_type || 'N/A'}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{farm.capacity || 0} heads</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{farm.village}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{farm.district?.district_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {farm.farmer?.name || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {farm.created_on ? new Date(farm.created_on).toLocaleDateString() : 'N/A'}
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
