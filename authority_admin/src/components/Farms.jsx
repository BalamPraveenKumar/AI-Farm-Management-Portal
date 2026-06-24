import React, { useEffect, useState } from 'react';
import { Search, MapPin, RefreshCw, Filter } from 'lucide-react';
import { farmService } from '../services/farmService';
import { districtService } from '../services/districtService';

export default function Farms({ onUnauthorized, showToast }) {
  const [farms, setFarms] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchFarmsAndDistricts = async () => {
    setLoading(true);
    try {
      const [farmsRes, districtsRes] = await Promise.all([
        farmService.getFarms(onUnauthorized),
        districtService.getDistricts(onUnauthorized)
      ]);

      if (farmsRes.success) {
        setFarms(farmsRes.farms || []);
      } else {
        showToast(farmsRes.message || 'Failed to load farms.', 'error');
      }

      if (districtsRes.success) {
        setDistricts(districtsRes.districts || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while fetching registry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmsAndDistricts();
  }, [onUnauthorized]);

  // Apply filters
  const filtered = farms.filter((f) => {
    const matchesSearch = 
      f.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
      f.farm_id?.toLowerCase().includes(search.toLowerCase()) ||
      f.farmer?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict = !districtFilter || f.district?.district_code === districtFilter;
    const matchesStatus = !statusFilter || f.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = !typeFilter || f.farm_type?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesDistrict && matchesStatus && matchesType;
  });

  return (
    <div>
      {/* Filters Panel */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Filter size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Registry Filters</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {/* Search */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Search keyword</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="ID, farm or farmer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          {/* District Filter */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>District</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '13px'
              }}
            >
              <option value="">All Districts</option>
              {districts.map(d => (
                <option key={d.district_sys_id || d.district_code} value={d.district_code}>
                  {d.district_name} ({d.district_code})
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Livestock Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '13px'
              }}
            >
              <option value="">All Livestock Types</option>
              <option value="cow">Cow / Dairy</option>
              <option value="poultry">Poultry</option>
              <option value="sheep">Sheep / Goat</option>
              <option value="pig">Piggery</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '13px'
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending Audit</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-secondary" onClick={fetchFarmsAndDistricts}>
            <RefreshCw size={14} />
            Reset Registry
          </button>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="loading-container">
          <span className="spinner" />
          <span style={{ fontWeight: 600 }}>Loading state agricultural registry...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <MapPin size={36} />
          <div className="empty-title">No Registered Farms Found</div>
          <div className="empty-desc">No farm records match the filters you have selected.</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Farm ID</th>
                <th>Farm Name</th>
                <th>Type</th>
                <th>District</th>
                <th>Village</th>
                <th>Capacity</th>
                <th>Farmer Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((farm) => (
                <tr key={farm.farm_sys_id || farm.farm_id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{farm.farm_id || 'N/A'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{farm.farm_name || 'N/A'}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      color: 'var(--text-secondary)'
                    }}>
                      {farm.farm_type || 'N/A'}
                    </span>
                  </td>
                  <td>
                    {farm.district ? (
                      <span className="badge badge-neutral">
                        {farm.district.district_name || farm.district.district_code}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td>{farm.village || 'N/A'}</td>
                  <td style={{ fontWeight: 700 }}>{farm.capacity || 'N/A'} heads</td>
                  <td>{farm.farmer?.name || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${farm.status?.toLowerCase() === 'active' ? 'success' : farm.status?.toLowerCase() === 'pending' ? 'warning' : 'danger'}`}>
                      {farm.status || 'inactive'}
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
