import React, { useEffect, useState } from 'react';
import { Search, Layers, RefreshCw, Filter } from 'lucide-react';
import { batchService } from '../services/batchService';
import { districtService } from '../services/districtService';

export default function Batches({ onUnauthorized, showToast }) {
  const [batches, setBatches] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [animalFilter, setAnimalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBatchesAndDistricts = async () => {
    setLoading(true);
    try {
      const [batchesRes, districtsRes] = await Promise.all([
        batchService.getBatches(onUnauthorized),
        districtService.getDistricts(onUnauthorized)
      ]);

      if (batchesRes.success) {
        setBatches(batchesRes.batches || []);
      } else {
        showToast(batchesRes.message || 'Failed to load animal batches.', 'error');
      }

      if (districtsRes.success) {
        setDistricts(districtsRes.districts || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while fetching batches.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchesAndDistricts();
  }, [onUnauthorized]);

  // Apply filters
  const filtered = batches.filter((b) => {
    const matchesSearch = 
      b.batch_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.batch_id?.toLowerCase().includes(search.toLowerCase()) ||
      b.farm?.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.breed?.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict = !districtFilter || b.district?.district_code === districtFilter;
    const matchesAnimal = !animalFilter || b.animal_type?.toLowerCase() === animalFilter.toLowerCase();
    const matchesStatus = !statusFilter || b.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDistrict && matchesAnimal && matchesStatus;
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
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Batch Filters</span>
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
                placeholder="ID, name, farm or breed..."
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

          {/* Animal Type */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Animal Type</label>
            <select
              value={animalFilter}
              onChange={(e) => setAnimalFilter(e.target.value)}
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
              <option value="">All Types</option>
              <option value="cow">Cow / Cattle</option>
              <option value="poultry">Poultry</option>
              <option value="sheep">Sheep / Goat</option>
              <option value="pig">Pig</option>
            </select>
          </div>

          {/* Status */}
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
              <option value="quarantined">Quarantined</option>
              <option value="disposed">Disposed / Sold</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-secondary" onClick={fetchBatchesAndDistricts}>
            <RefreshCw size={14} />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="loading-container">
          <span className="spinner" />
          <span style={{ fontWeight: 600 }}>Loading animal batch registry...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Layers size={36} />
          <div className="empty-title">No Batches Found</div>
          <div className="empty-desc">No animal batches match the criteria.</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Batch Name</th>
                <th>Farm Owner</th>
                <th>District</th>
                <th>Animal Type</th>
                <th>Breed</th>
                <th>Quantity</th>
                <th>Arrival Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.batch_id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{b.batch_id || 'N/A'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.batch_name || 'N/A'}</td>
                  <td>{b.farm?.farm_name || 'N/A'}</td>
                  <td>
                    {b.district ? (
                      <span className="badge badge-neutral">
                        {b.district.district_name || b.district.district_code}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{b.animal_type || 'N/A'}</td>
                  <td>{b.breed || 'N/A'}</td>
                  <td style={{ fontWeight: 700 }}>{b.animal_count || 'N/A'} heads</td>
                  <td>{b.arrival_date ? new Date(b.arrival_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${b.status?.toLowerCase() === 'active' ? 'success' : b.status?.toLowerCase() === 'quarantined' ? 'danger' : 'neutral'}`}>
                      {b.status || 'active'}
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
