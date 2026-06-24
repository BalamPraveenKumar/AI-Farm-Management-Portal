import React, { useEffect, useState } from 'react';
import { biosecurityService } from '../services/biosecurityService';
import { farmService } from '../services/farmService';
import { Plus, Search, ShieldCheck, Calendar, Info, X, Check, AlertOctagon } from 'lucide-react';

export default function Biosecurity({ showToast, onUnauthorized }) {
  const [checklists, setChecklists] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [farmId, setFarmId] = useState('');
  const [visitorsLogged, setVisitorsLogged] = useState(false);
  const [disinfectionDone, setDisinfectionDone] = useState(false);
  const [sickAnimalsIsolated, setSickAnimalsIsolated] = useState(false);
  const [wasteDisposedProperly, setWasteDisposedProperly] = useState(false);
  const [footbathAvailable, setFootbathAvailable] = useState(false);
  const [remarks, setRemarks] = useState('');

  const loadChecklistsAndFarms = async () => {
    setLoading(true);
    try {
      const [checkRes, farmsRes] = await Promise.all([
        biosecurityService.getChecklists(onUnauthorized),
        farmService.getFarms(onUnauthorized)
      ]);

      if (checkRes && checkRes.success) {
        // Sort checklists by created date descending
        const sorted = (checkRes.checklists || []).sort((a, b) => {
          return new Date(b.created_on) - new Date(a.created_on);
        });
        setChecklists(sorted);
      } else {
        showToast(checkRes?.message || 'Failed to fetch checklists.', 'error');
      }

      if (farmsRes && farmsRes.success) {
        const farmList = farmsRes.farms || [];
        setFarms(farmList);
        if (farmList.length > 0) {
          setFarmId(farmList[0].farm_id);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading biosecurity checklists.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecklistsAndFarms();
  }, []);

  const handleCreateChecklist = async (e) => {
    e.preventDefault();
    if (!farmId) {
      showToast('Please select a farm land.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await biosecurityService.createChecklist({
        farm_id: farmId,
        visitors_registered: visitorsLogged,
        farm_sanitized: disinfectionDone,
        sick_animals_isolated: sickAnimalsIsolated,
        waste_disposed_properly: wasteDisposedProperly,
        footbath_available: footbathAvailable,
        remarks: remarks.trim() || undefined
      }, onUnauthorized);

      if (result && result.success) {
        showToast(result.message || 'Checklist logged successfully!', 'success');
        setShowModal(false);
        // Reset form fields
        setVisitorsLogged(false);
        setDisinfectionDone(false);
        setSickAnimalsIsolated(false);
        setWasteDisposedProperly(false);
        setFootbathAvailable(false);
        setRemarks('');
        if (farms.length > 0) setFarmId(farms[0].farm_id);
        
        // Reload list
        loadChecklistsAndFarms();
      } else {
        showToast(result?.message || 'Failed to file checklist.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred during submission.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered checklists
  const filteredChecklists = checklists.filter(chk => {
    const matchesSearch = chk.checklist_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          chk.farm?.farm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          chk.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="page-content">
      <div className="view-header">
        <div>
          <h2 className="page-title" style={{ fontSize: '28px' }}>Biosecurity Checklists</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Log visitor registries, containment tasks, and hygiene compliance</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} disabled={farms.length === 0}>
          <Plus size={18} />
          File New Checklist
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search checklists by ID, farm, or remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading biosecurity checkpoints...</p>
        </div>
      ) : filteredChecklists.length === 0 ? (
        <div className="empty-state">
          <ShieldCheck size={48} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h4 className="empty-title">No Logs Filed</h4>
            <p className="empty-desc">
              {searchTerm 
                ? 'No biosecurity checklists match your search terms.' 
                : 'Maintain sanitation safety! File your daily or weekly biosecurity checklist reports.'}
            </p>
          </div>
          {searchTerm && (
            <button className="btn-secondary" onClick={() => setSearchTerm('')}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="cards-grid">
          {filteredChecklists.map((chk) => {
            // Count completed criteria
            const isTrue = (val) => val === true || val === 'true';
            const score = (isTrue(chk.visitors_registered) ? 1 : 0) + 
                          (isTrue(chk.farm_sanitized) ? 1 : 0) + 
                          (isTrue(chk.sick_animals_isolated) ? 1 : 0) + 
                          (isTrue(chk.waste_disposed_properly) ? 1 : 0) +
                          (isTrue(chk.footbath_available) ? 1 : 0);
            
            const backendScore = chk.biosecurity_score !== undefined && chk.biosecurity_score !== null 
              ? chk.biosecurity_score 
              : (chk.u_biosecurity_score !== undefined && chk.u_biosecurity_score !== null ? chk.u_biosecurity_score : null);
            const displayScore = backendScore !== null ? backendScore : (score * 20);

            return (
              <div key={chk.checklist_sys_id || chk.checklist_id} className="data-card">
                <div className="card-header">
                  <div>
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} style={{ color: score === 5 ? 'var(--success)' : 'var(--warning)' }} />
                      <span>{chk.farm?.farm_name || 'N/A'}</span>
                    </div>
                    <div className="card-subtitle">{chk.checklist_id}</div>
                  </div>
                  <span className={`badge ${score === 5 ? 'badge-green' : 'badge-orange'}`}>
                    Score: {displayScore}% ({score}/5)
                  </span>
                </div>

                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="info-row" style={{ alignItems: 'center' }}>
                      <span className="info-label">Visitors Logged</span>
                      <span style={{ 
                        color: isTrue(chk.visitors_registered) ? 'var(--success)' : 'var(--danger)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}>
                        {isTrue(chk.visitors_registered) ? <Check size={14} /> : <X size={14} />}
                        {isTrue(chk.visitors_registered) ? 'YES' : 'NO'}
                      </span>
                    </div>
                    
                    <div className="info-row" style={{ alignItems: 'center' }}>
                      <span className="info-label">Disinfection Done</span>
                      <span style={{ 
                        color: isTrue(chk.farm_sanitized) ? 'var(--success)' : 'var(--danger)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}>
                        {isTrue(chk.farm_sanitized) ? <Check size={14} /> : <X size={14} />}
                        {isTrue(chk.farm_sanitized) ? 'YES' : 'NO'}
                      </span>
                    </div>

                    <div className="info-row" style={{ alignItems: 'center' }}>
                      <span className="info-label">Sick Animals Isolated</span>
                      <span style={{ 
                        color: isTrue(chk.sick_animals_isolated) ? 'var(--success)' : 'var(--warning)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}>
                        {isTrue(chk.sick_animals_isolated) ? <Check size={14} /> : <AlertOctagon size={14} />}
                        {isTrue(chk.sick_animals_isolated) ? 'YES' : 'NO'}
                      </span>
                    </div>

                    <div className="info-row" style={{ alignItems: 'center' }}>
                      <span className="info-label">Waste Disposed Properly</span>
                      <span style={{ 
                        color: isTrue(chk.waste_disposed_properly) ? 'var(--success)' : 'var(--danger)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}>
                        {isTrue(chk.waste_disposed_properly) ? <Check size={14} /> : <X size={14} />}
                        {isTrue(chk.waste_disposed_properly) ? 'YES' : 'NO'}
                      </span>
                    </div>

                    <div className="info-row" style={{ alignItems: 'center' }}>
                      <span className="info-label">Footbath Available</span>
                      <span style={{ 
                        color: isTrue(chk.footbath_available) ? 'var(--success)' : 'var(--danger)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}>
                        {isTrue(chk.footbath_available) ? <Check size={14} /> : <X size={14} />}
                        {isTrue(chk.footbath_available) ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>

                  {chk.remarks && (
                    <div style={{ 
                      marginTop: '12px', 
                      padding: '10px', 
                      backgroundColor: 'var(--bg-app)', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      borderLeft: '2px solid var(--border-color)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      <strong>Remarks:</strong> {chk.remarks}
                    </div>
                  )}
                </div>

                <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <Calendar size={14} />
                    <span>Logged on: {chk.created_on ? new Date(chk.created_on).toLocaleString() : 'N/A'}</span>
                  </div>
                  {(chk.logged_by || chk.u_logged_by || chk.sys_created_by) && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      By: {chk.logged_by || chk.u_logged_by || chk.sys_created_by}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Log Biosecurity Checklist</h3>
              <button className="drawer-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateChecklist} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 'calc(90vh - 80px)' }}>
              <div className="modal-body" style={{ overflowY: 'auto', flexGrow: 1 }}>
                <div className="form-group">
                  <label className="form-label">Select Farm Land *</label>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <div className="form-toggle-container">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Visitors Logged</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>All incoming logs and visits registered</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={visitorsLogged}
                        onChange={(e) => setVisitorsLogged(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="form-toggle-container">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Disinfection Completed</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Entry points and equipments disinfected</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={disinfectionDone}
                        onChange={(e) => setDisinfectionDone(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="form-toggle-container">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Sick Animals Isolated</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quarantine measures set for ill animals</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={sickAnimalsIsolated}
                        onChange={(e) => setSickAnimalsIsolated(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="form-toggle-container">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Waste Disposed Properly</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Carcass/organic farm waste safely treated</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={wasteDisposedProperly}
                        onChange={(e) => setWasteDisposedProperly(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="form-toggle-container">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Footbath Available</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Disinfectant footbaths functional at all entry points</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={footbathAvailable}
                        onChange={(e) => setFootbathAvailable(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Remarks / Safety Notes</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="e.g. Visitors logged for morning inspection. Disinfected storage area C."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
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
                    'Log Compliance'
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
