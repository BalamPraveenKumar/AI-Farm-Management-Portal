import React, { useEffect, useState } from 'react';
import { batchService } from '../services/batchService';
import { farmService } from '../services/farmService';
import { Plus, Search, Layers, Calendar, Home, Tag, X, Filter } from 'lucide-react';

export default function Batches({ showToast, onUnauthorized }) {
  const [batches, setBatches] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [farmFilter, setFarmFilter] = useState('');

  // Form State
  const [farmId, setFarmId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [animalType, setAnimalType] = useState('cow');
  const [count, setCount] = useState('');
  const [breed, setBreed] = useState('');
  const [dateOfArrival, setDateOfArrival] = useState('');

  const loadBatchesAndFarms = async () => {
    setLoading(true);
    try {
      const [batchesRes, farmsRes] = await Promise.all([
        batchService.getBatches(onUnauthorized),
        farmService.getFarms(onUnauthorized)
      ]);

      if (batchesRes && batchesRes.success) {
        setBatches(batchesRes.batches || []);
      } else {
        showToast(batchesRes?.message || 'Failed to fetch batches.', 'error');
      }

      if (farmsRes && farmsRes.success) {
        const farmList = farmsRes.farms || [];
        setFarms(farmList);
        if (farmList.length > 0) {
          setFarmId(farmList[0].farm_id);
        }
      } else {
        showToast(farmsRes?.message || 'Failed to fetch farms list.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading animal batches data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatchesAndFarms();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!farmId || !batchName.trim() || !count.trim() || !dateOfArrival) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (isNaN(count) || parseInt(count) <= 0) {
      showToast('Animal count must be a positive number.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await batchService.createBatch({
        farm_id: farmId,
        batch_name: batchName.trim(),
        animal_type: animalType,
        animal_count: count.trim(),
        breed: breed.trim() || undefined,
        arrival_date: dateOfArrival
      }, onUnauthorized);

      if (result && result.success) {
        showToast(result.message || 'Animal batch created successfully!', 'success');
        setShowModal(false);
        // Clear Form
        setBatchName('');
        setAnimalType('cow');
        setCount('');
        setBreed('');
        setDateOfArrival('');
        if (farms.length > 0) setFarmId(farms[0].farm_id);
        
        // Reload list
        loadBatchesAndFarms();
      } else {
        showToast(result?.message || 'Failed to create batch.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred during submission.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Batches
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          batch.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          batch.batch_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || batch.animal_type === typeFilter;
    const matchesFarm = farmFilter === '' || batch.farm?.farm_id === farmFilter;
    return matchesSearch && matchesType && matchesFarm;
  });

  return (
    <div className="page-content">
      <div className="view-header">
        <div>
          <h2 className="page-title" style={{ fontSize: '28px' }}>Animal Batches</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Track, classify, and monitor animal groups across registered lands</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} disabled={farms.length === 0}>
          <Plus size={18} />
          Register New Batch
        </button>
      </div>

      {farms.length === 0 && !loading && (
        <div className="alert-banner" style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
          <Home size={20} />
          <span>You must register at least one <strong>Farm</strong> before you can create an animal batch.</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by batch name, breed, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Animal Types</option>
            <option value="cow">Cow</option>
            <option value="buffalo">Buffalo</option>
            <option value="goat">Goat</option>
            <option value="sheep">Sheep</option>
            <option value="chicken">Chicken</option>
            <option value="pig">Pig</option>
          </select>

          <select
            className="filter-select"
            value={farmFilter}
            onChange={(e) => setFarmFilter(e.target.value)}
          >
            <option value="">All Farms</option>
            {farms.map(f => (
              <option key={f.farm_sys_id || f.farm_id} value={f.farm_id}>{f.farm_name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading animal batches...</p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="empty-state">
          <Layers size={48} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h4 className="empty-title">No Batches Found</h4>
            <p className="empty-desc">
              {searchTerm || typeFilter || farmFilter 
                ? 'No animal batches match your filter selections.' 
                : 'Log your animal cohorts and batches to manage their feed, health reports, and vaccinations.'}
            </p>
          </div>
          {(searchTerm || typeFilter || farmFilter) && (
            <button className="btn-secondary" onClick={() => { setSearchTerm(''); setTypeFilter(''); setFarmFilter(''); }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="cards-grid">
          {filteredBatches.map((batch) => (
            <div key={batch.batch_sys_id || batch.batch_id} className="data-card">
              <div className="card-header">
                <div>
                  <div className="card-title">{batch.batch_name}</div>
                  <div className="card-subtitle">{batch.batch_id}</div>
                </div>
                <span className={`badge badge-${batch.status === 'active' ? 'green' : 'gray'}`}>
                  {batch.status || 'Active'}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">Animal Type</span>
                  <span className="info-value" style={{ textTransform: 'capitalize' }}>{batch.animal_type}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Head Count</span>
                  <span className="info-value" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{batch.animal_count} Heads</span>
                </div>
                {batch.breed && (
                  <div className="info-row">
                    <span className="info-label">Breed Category</span>
                    <span className="info-value">{batch.breed}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Date of Arrival</span>
                  <span className="info-value">{batch.arrival_date}</span>
                </div>
                <div className="info-row" style={{ marginTop: '4px', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                  <span className="info-label">Assigned Farm</span>
                  <span className="info-value" style={{ fontWeight: 700 }}>
                    {batch.farm?.farm_name || 'N/A'}{' '}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                      ({batch.farm?.farm_id || 'N/A'})
                    </span>
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Calendar size={14} />
                  <span>Tracked since arrival</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Register Animal Batch</h3>
              <button className="drawer-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 'calc(90vh - 80px)' }}>
              <div className="modal-body" style={{ overflowY: 'auto', flexGrow: 1 }}>
                {/* Form Row 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Farm *</label>
                    <select
                      className="form-input"
                      value={farmId}
                      onChange={(e) => setFarmId(e.target.value)}
                      required
                    >
                      {farms.map((f) => (
                        <option key={f.farm_sys_id || f.farm_id} value={f.farm_id}>
                          {f.farm_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Batch Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Batch A, Cow Cohort 1"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Form Row 2 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Animal Type *</label>
                    <select
                      className="form-input"
                      value={animalType}
                      onChange={(e) => setAnimalType(e.target.value)}
                      required
                    >
                      <option value="cow">Cow</option>
                      <option value="buffalo">Buffalo</option>
                      <option value="goat">Goat</option>
                      <option value="sheep">Sheep</option>
                      <option value="chicken">Chicken</option>
                      <option value="pig">Pig</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Animal Count *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 50"
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Form Row 3 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Breed (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Holstein Friesian"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Date of Arrival *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={dateOfArrival}
                      onChange={(e) => setDateOfArrival(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '8px' }}>
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
                    'Create Batch'
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
