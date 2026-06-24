import React, { useEffect, useState } from 'react';
import { Search, Map, RefreshCw } from 'lucide-react';
import { districtService } from '../services/districtService';

export default function Districts({ onUnauthorized, showToast }) {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDistricts = async () => {
    setLoading(true);
    const result = await districtService.getDistricts(onUnauthorized);
    setLoading(false);
    if (result.success) {
      setDistricts(result.districts || []);
    } else {
      showToast(result.message || 'Failed to load districts.', 'error');
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, [onUnauthorized]);

  const filtered = districts.filter(d => 
    d.district_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.district_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search and Action Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{
          position: 'relative',
          flex: '1',
          minWidth: '280px',
          maxWidth: '400px'
        }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search districts by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '14px'
            }}
          />
        </div>

        <button className="btn-secondary" onClick={fetchDistricts}>
          <RefreshCw size={15} />
          Reload List
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <span className="spinner" />
          <span style={{ fontWeight: 600 }}>Loading active jurisdictions...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Map size={36} />
          <div className="empty-title">No Districts Found</div>
          <div className="empty-desc">No districts matched your search keyword.</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>#</th>
                <th style={{ width: '150px' }}>District Code</th>
                <th>District Name</th>
                <th>System ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, index) => (
                <tr key={d.district_sys_id || index}>
                  <td style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{index + 1}</td>
                  <td>
                    <span className="badge badge-info" style={{ letterSpacing: '0.5px' }}>
                      {d.district_code || 'N/A'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.district_name || 'N/A'}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {d.district_sys_id || 'N/A'}
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
