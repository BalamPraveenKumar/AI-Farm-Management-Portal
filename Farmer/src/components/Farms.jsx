import React, { useEffect, useState } from 'react';
import { farmService } from '../services/farmService';
import { Plus, Search, MapPin, Users, Calendar, X, Filter } from 'lucide-react';

export default function Farms({ showToast, onUnauthorized }) {
  const [farms, setFarms] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Form State
  const [farmName, setFarmName] = useState('');
  const [farmType, setFarmType] = useState('dairy');
  const [capacity, setCapacity] = useState('');
  const [village, setVillage] = useState('');
  const [districtCode, setDistrictCode] = useState('');

  const loadFarmsAndDistricts = async () => {
    setLoading(true);
    try {
      const [farmsRes, districtsRes] = await Promise.all([
        farmService.getFarms(onUnauthorized),
        farmService.getDistricts(onUnauthorized)
      ]);

      if (farmsRes && farmsRes.success) {
        setFarms(farmsRes.farms || []);
      } else {
        showToast(farmsRes?.message || 'Failed to fetch farms list.', 'error');
      }

      if (districtsRes && districtsRes.success) {
        const dists = districtsRes.districts || [];
        setDistricts(dists);
        if (dists.length > 0) {
          setDistrictCode(dists[0].district_code);
        }
      } else {
        showToast(districtsRes?.message || 'Failed to fetch districts.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading farm data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmsAndDistricts();
  }, []);

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    if (!farmName.trim() || !capacity.trim() || !village.trim() || !districtCode) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (isNaN(capacity) || parseInt(capacity) <= 0) {
      showToast('Capacity must be a positive number.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await farmService.createFarm({
        farm_name: farmName.trim(),
        farm_type: farmType,
        capacity: capacity.trim(),
        village: village.trim(),
        district_code: districtCode
      }, onUnauthorized);

      if (result && result.success) {
        showToast(result.message || 'Farm created successfully!', 'success');
        setShowModal(false);
        // Clear Form
        setFarmName('');
        setFarmType('dairy');
        setCapacity('');
        setVillage('');
        if (districts.length > 0) setDistrictCode(districts[0].district_code);
        
        // Reload list
        loadFarmsAndDistricts();
      } else {
        showToast(result?.message || 'Failed to create farm.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred during submission.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Farms
  const filteredFarms = farms.filter(farm => {
    const matchesSearch = farm.farm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          farm.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          farm.farm_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || farm.farm_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="page-content">
      <div className="view-header">
        <div>
          <h2 className="page-title" style={{ fontSize: '28px' }}>Farms Registry</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage and configure your registered farm lands</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Register New Farm
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by farm name, ID, or village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Farm Types</option>
            <option value="dairy">Dairy</option>
            <option value="poultry">Poultry</option>
            <option value="sheep">Sheep</option>
            <option value="goat">Goat</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your farm records...</p>
        </div>
      ) : filteredFarms.length === 0 ? (
        <div className="empty-state">
          <MapPin size={48} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h4 className="empty-title">No Farms Found</h4>
            <p className="empty-desc">
              {searchTerm || typeFilter 
                ? 'No registered farms match your search criteria.' 
                : 'Get started by registering your first farm land using the button above.'}
            </p>
          </div>
          {(searchTerm || typeFilter) && (
            <button className="btn-secondary" onClick={() => { setSearchTerm(''); setTypeFilter(''); }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="cards-grid">
          {filteredFarms.map((farm) => (
            <div key={farm.farm_sys_id || farm.farm_id} className="data-card">
              <div className="card-header">
                <div>
                  <div className="card-title">{farm.farm_name}</div>
                  <div className="card-subtitle">{farm.farm_id}</div>
                </div>
                <span className={`badge badge-${farm.status === 'active' ? 'green' : 'gray'}`}>
                  {farm.status || 'Active'}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">Farm Type</span>
                  <span className="info-value" style={{ textTransform: 'capitalize' }}>{farm.farm_type}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Capacity Limit</span>
                  <span className="info-value">{farm.capacity} Animals</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Location</span>
                  <span className="info-value">{farm.village}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">District Jurisdiction</span>
                  <span className="info-value">
                    {farm.district?.district_name || 'N/A'}{' '}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ({farm.district?.state || 'N/A'})
                    </span>
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Calendar size={14} />
                  <span>Added: {farm.created_on ? farm.created_on.split(' ')[0] : 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Register Farm Land</h3>
              <button className="drawer-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFarm} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 'calc(90vh - 80px)' }}>
              <div className="modal-body" style={{ overflowY: 'auto', flexGrow: 1 }}>
                <div className="form-group">
                  <label className="form-label">Farm Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Green Valley Farm"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Farm Type *</label>
                  <select
                    className="form-input"
                    value={farmType}
                    onChange={(e) => setFarmType(e.target.value)}
                    required
                  >
                    <option value="dairy">Dairy</option>
                    <option value="poultry">Poultry</option>
                    <option value="sheep">Sheep</option>
                    <option value="goat">Goat</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Capacity Limit (Count of Animals) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 100"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Village Location *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kurnool Village"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">District & State *</label>
                  <select
                    className="form-input"
                    value={districtCode}
                    onChange={(e) => setDistrictCode(e.target.value)}
                    required
                  >
                    {districts.map((d) => (
                      <option key={d.district_sys_id || d.district_code} value={d.district_code}>
                        {d.district_name} ({d.state})
                      </option>
                    ))}
                  </select>
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
                      Registering...
                    </span>
                  ) : (
                    'Register Farm'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
