import React, { useEffect, useState } from 'react';
import { vaccinationService } from '../services/vaccinationService';
import { Calendar, Search, CheckCircle, Clock, AlertTriangle, User, RefreshCw, Filter } from 'lucide-react';

export default function Vaccinations({ showToast, onUnauthorized }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadVaccinations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await vaccinationService.getVaccinations(onUnauthorized);
      if (result && result.success) {
        // Sort vaccinations: pending/overdue first, then by due date
        const sorted = (result.vaccinations || []).sort((a, b) => {
          if (a.status === 'completed' && b.status !== 'completed') return 1;
          if (a.status !== 'completed' && b.status === 'completed') return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        });
        setVaccinations(sorted);
      } else {
        showToast(result?.message || 'Failed to fetch vaccinations.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading vaccinations.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadVaccinations();
  }, []);

  const handleMarkComplete = async (vaccinationId) => {
    if (!vaccinationId) return;

    setSubmittingId(vaccinationId);
    try {
      const result = await vaccinationService.completeVaccination(vaccinationId, onUnauthorized);

      if (result && result.success) {
        showToast(result.message || 'Vaccination marked as completed successfully!', 'success');
        // Reload list silently
        loadVaccinations(true);
      } else {
        showToast(result?.message || 'Failed to complete vaccination.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const getVaccStatus = (v) => {
    if (v.status === 'completed') return 'completed';
    const isOverdue = v.due_date && v.due_date < todayStr;
    return isOverdue ? 'overdue' : 'pending';
  };

  const getStatusBadge = (v) => {
    const status = getVaccStatus(v);
    switch (status) {
      case 'completed':
        return <span className="badge badge-green">Completed</span>;
      case 'overdue':
        return <span className="badge badge-red">Overdue</span>;
      default:
        return <span className="badge badge-orange">Pending</span>;
    }
  };

  // Filtered vaccinations
  const filteredVaccinations = vaccinations.filter((v) => {
    const matchesSearch = v.vaccine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.vaccination_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.farm?.farm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.batch?.batch_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const vStatus = getVaccStatus(v);
    const matchesStatus = statusFilter === '' || vStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-content">
      <div className="view-header">
        <div>
          <h2 className="page-title" style={{ fontSize: '28px' }}>Vaccination Schedules</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Track immunization calendars, schedules, and record completions</p>
        </div>
        <button className="btn-secondary" style={{ display: 'flex', gap: '8px' }} onClick={() => loadVaccinations(true)} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          Refresh List
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by vaccine name, ID, farm, or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading immunization records...</p>
        </div>
      ) : filteredVaccinations.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h4 className="empty-title">No Vaccinations Found</h4>
            <p className="empty-desc">
              {searchTerm || statusFilter 
                ? 'No immunization records match your current filters.' 
                : 'All animal vaccinations are up-to-date and complete.'}
            </p>
          </div>
          {(searchTerm || statusFilter) && (
            <button className="btn-secondary" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vaccination ID</th>
                <th>Vaccine Name</th>
                <th>Farm / Batch Details</th>
                <th>Due Date</th>
                <th>Immunization Status</th>
                <th>Completion Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVaccinations.map((v) => {
                const status = getVaccStatus(v);
                const isOverdue = status === 'overdue';
                
                return (
                  <tr key={v.vaccination_sys_id || v.vaccination_id} style={{
                    backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.02)' : 'inherit'
                  }}>
                    <td>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--mono)', fontSize: '13px' }}>{v.vaccination_id}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <User size={10} />
                        <span>By: {v.created_by || 'system'}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.vaccine_name}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{v.farm?.farm_name || 'N/A'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Batch: {v.batch?.batch_name || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        {isOverdue && <AlertTriangle size={14} />}
                        <span>{v.due_date}</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(v)}</td>
                    <td style={{ fontWeight: 500 }}>
                      {v.completion_date ? (
                        <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={12} />
                          {v.completion_date}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>Not complete</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {status !== 'completed' ? (
                        <button
                          className="btn-primary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            boxShadow: 'none',
                            backgroundColor: isOverdue ? 'var(--danger)' : 'var(--primary)'
                          }}
                          disabled={submittingId === v.vaccination_id}
                          onClick={() => handleMarkComplete(v.vaccination_id)}
                        >
                          {submittingId === v.vaccination_id ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span className="spinner" style={{ width: '10px', height: '10px', borderWidth: '1px', borderTopColor: '#fff' }}></span>
                              Finishing...
                            </span>
                          ) : (
                            'Mark Complete'
                          )}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--success)', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} />
                          Done
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
