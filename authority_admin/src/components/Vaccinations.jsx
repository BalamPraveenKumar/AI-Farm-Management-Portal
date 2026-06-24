import React, { useEffect, useState } from 'react';
import { Search, Syringe, RefreshCw, Filter, Calendar } from 'lucide-react';
import { vaccinationService } from '../services/vaccinationService';
import { districtService } from '../services/districtService';

export default function Vaccinations({ onUnauthorized, showToast }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchVaccinationsAndDistricts = async () => {
    setLoading(true);
    try {
      const [vaccinationsRes, districtsRes] = await Promise.all([
        vaccinationService.getVaccinations(onUnauthorized),
        districtService.getDistricts(onUnauthorized)
      ]);

      if (vaccinationsRes.success) {
        setVaccinations(vaccinationsRes.vaccinations || []);
      } else {
        showToast(vaccinationsRes.message || 'Failed to load vaccinations.', 'error');
      }

      if (districtsRes.success) {
        setDistricts(districtsRes.districts || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while fetching vaccinations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinationsAndDistricts();
  }, [onUnauthorized]);

  // Apply filters
  const filtered = vaccinations.filter((v) => {
    const matchesSearch = 
      v.vaccine_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.vaccination_id?.toLowerCase().includes(search.toLowerCase()) ||
      v.farm?.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.batch?.batch_name?.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict = !districtFilter || v.district?.district_code === districtFilter;
    const matchesStatus = !statusFilter || v.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDistrict && matchesStatus;
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
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Vaccination Filters</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          {/* Search */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Search keyword</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="ID, vaccine, farm or batch name..."
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

          {/* Status */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Immunization Status</label>
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
              <option value="completed">Completed</option>
              <option value="pending">Pending / Due</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-secondary" onClick={fetchVaccinationsAndDistricts}>
            <RefreshCw size={14} />
            Reset List
          </button>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="loading-container">
          <span className="spinner" />
          <span style={{ fontWeight: 600 }}>Loading state immunization reports...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Syringe size={36} />
          <div className="empty-title">No Vaccination Schedules Found</div>
          <div className="empty-desc">No schedules match your current filters.</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Immunization ID</th>
                <th>Vaccine Name</th>
                <th>Farm Owner</th>
                <th>District</th>
                <th>Batch targeted</th>
                <th>Due Date</th>
                <th>Completion Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const isOverdue = v.status?.toLowerCase() === 'pending' && new Date(v.due_date) < new Date();
                const displayStatus = isOverdue ? 'overdue' : v.status || 'pending';

                return (
                  <tr key={v.vaccination_id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{v.vaccination_id || 'N/A'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.vaccine_name || 'N/A'}</td>
                    <td>{v.farm?.farm_name || 'N/A'}</td>
                    <td>
                      {v.district ? (
                        <span className="badge badge-neutral">
                          {v.district.district_name || v.district.district_code}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td>{v.batch?.batch_name || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                        <span>{v.due_date ? new Date(v.due_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      {v.completion_date ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--success)' }}>
                          <Calendar size={13} />
                          <span>{new Date(v.completion_date).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>Not Completed</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${displayStatus === 'completed' ? 'success' : displayStatus === 'overdue' ? 'danger' : 'warning'}`}>
                        {displayStatus}
                      </span>
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
