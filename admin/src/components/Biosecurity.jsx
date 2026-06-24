import React, { useState, useEffect } from 'react';
import { biosecurityService } from '../services/biosecurityService';
import { 
  ShieldCheck, 
  Search, 
  Calendar, 
  Check, 
  X, 
  AlertOctagon, 
  TrendingUp, 
  CheckCircle2, 
  Activity, 
  Filter 
} from 'lucide-react';

export default function Biosecurity({ showToast }) {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all'); // all, full, partial

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      const res = await biosecurityService.getChecklists();
      if (res && res.success) {
        // Sort checklists by created date descending
        const sorted = (res.checklists || []).sort((a, b) => {
          return new Date(b.created_on) - new Date(a.created_on);
        });
        setChecklists(sorted);
      } else {
        showToast(res?.message || 'Failed to fetch biosecurity checklists.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading biosecurity checkpoints.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  // Filtered checklists
  const filteredChecklists = checklists.filter(chk => {
    // 1. Search term match
    const matchesSearch = 
      (chk.checklist_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chk.farm?.farm_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chk.remarks || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chk.logged_by || chk.u_logged_by || chk.sys_created_by || '').toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Score filter match
    const isTrue = (val) => val === true || val === 'true';
    const score = (isTrue(chk.visitors_registered) ? 1 : 0) + 
                  (isTrue(chk.farm_sanitized) ? 1 : 0) + 
                  (isTrue(chk.sick_animals_isolated) ? 1 : 0) + 
                  (isTrue(chk.waste_disposed_properly) ? 1 : 0) +
                  (isTrue(chk.footbath_available) ? 1 : 0);

    let matchesScore = true;
    if (scoreFilter === 'full') {
      matchesScore = score === 5;
    } else if (scoreFilter === 'partial') {
      matchesScore = score < 5;
    }

    return matchesSearch && matchesScore;
  });

  // Calculate statistics
  const totalLogs = checklists.length;
  const compliantLogs = checklists.filter(chk => {
    const isTrue = (val) => val === true || val === 'true';
    const score = (isTrue(chk.visitors_registered) ? 1 : 0) + 
                  (isTrue(chk.farm_sanitized) ? 1 : 0) + 
                  (isTrue(chk.sick_animals_isolated) ? 1 : 0) + 
                  (isTrue(chk.waste_disposed_properly) ? 1 : 0) +
                  (isTrue(chk.footbath_available) ? 1 : 0);
    return score === 5;
  }).length;

  const complianceRate = totalLogs > 0 ? Math.round((compliantLogs / totalLogs) * 100) : 0;

  const averageScore = totalLogs > 0 ? Math.round(
    (checklists.reduce((acc, chk) => {
      const isTrue = (val) => val === true || val === 'true';
      const score = (isTrue(chk.visitors_registered) ? 1 : 0) + 
                    (isTrue(chk.farm_sanitized) ? 1 : 0) + 
                    (isTrue(chk.sick_animals_isolated) ? 1 : 0) + 
                    (isTrue(chk.waste_disposed_properly) ? 1 : 0) +
                    (isTrue(chk.footbath_available) ? 1 : 0);
      return acc + (score * 20);
    }, 0)) / totalLogs
  ) : 0;

  const isTrue = (val) => val === true || val === 'true';

  return (
    <div className="page-content" style={{ padding: '24px 32px' }}>
      <div className="view-header" style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Biosecurity Compliance Logs
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            Monitor hygiene standards, visitor registration, quarantine isolation, and safety checklists across all farms
          </p>
        </div>
        <button className="btn-primary" onClick={fetchChecklists} style={{ padding: '10px 18px' }}>
          ↻ Refresh Logs
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Total Checklists */}
        <div style={{
          padding: '24px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(13, 148, 136, 0.12)',
            color: '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Logs Logged</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{totalLogs}</div>
          </div>
        </div>

        {/* Full Compliance Rate */}
        <div style={{
          padding: '24px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Fully Compliant Farms</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {compliantLogs} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>({complianceRate}%)</span>
            </div>
          </div>
        </div>

        {/* Avg District Score */}
        <div style={{
          padding: '24px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Average District Score</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{averageScore}%</div>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search logs by Farm, ID, remarks or logger..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-app)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'border-color 0.15s'
            }}
          />
        </div>

        {/* Filter select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-app)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              flexGrow: 1
            }}
          >
            <option value="all">All Score Ratings</option>
            <option value="full">100% Fully Compliant</option>
            <option value="partial">Less than 100% (Action Required)</option>
          </select>
        </div>
      </div>

      {/* Main List view */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Syncing biosecurity checkpoints...</p>
        </div>
      ) : filteredChecklists.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 32px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShieldCheck size={48} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>No Compliance Logs Found</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '420px', margin: 0, lineHeight: 1.5 }}>
            {searchTerm || scoreFilter !== 'all' 
              ? 'No compliance checklists match the applied search keywords or rating filters.' 
              : 'There are no biosecurity checklist registrations filed from farmers in the system yet.'}
          </p>
          {(searchTerm || scoreFilter !== 'all') && (
            <button className="btn-secondary" onClick={() => { setSearchTerm(''); setScoreFilter('all'); }} style={{ marginTop: '12px' }}>
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredChecklists.map((chk) => {
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
              <div 
                key={chk.checklist_sys_id || chk.checklist_id} 
                className="data-card" 
                style={{ 
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--card-shadow)',
                  transition: 'transform 0.18s, border-color 0.18s'
                }}
              >
                {/* Header */}
                <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <ShieldCheck size={18} style={{ color: score === 5 ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
                      <span>{chk.farm?.farm_name || 'N/A'}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
                      ID: {chk.checklist_id || 'N/A'}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '50px',
                    whiteSpace: 'nowrap',
                    background: score === 5 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: score === 5 ? '#10b981' : '#f59e0b',
                    border: score === 5 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'
                  }}>
                    Score: {displayScore}% ({score}/5)
                  </span>
                </div>

                {/* Body */}
                <div style={{ padding: '16px 20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Visitors Logged</span>
                    <span style={{ 
                      color: isTrue(chk.visitors_registered) ? '#10b981' : '#ef4444', 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}>
                      {isTrue(chk.visitors_registered) ? <Check size={14} /> : <X size={14} />}
                      {isTrue(chk.visitors_registered) ? 'YES' : 'NO'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Disinfection Completed</span>
                    <span style={{ 
                      color: isTrue(chk.farm_sanitized) ? '#10b981' : '#ef4444', 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}>
                      {isTrue(chk.farm_sanitized) ? <Check size={14} /> : <X size={14} />}
                      {isTrue(chk.farm_sanitized) ? 'YES' : 'NO'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Sick Animals Isolated</span>
                    <span style={{ 
                      color: isTrue(chk.sick_animals_isolated) ? '#10b981' : '#ef4444', 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}>
                      {isTrue(chk.sick_animals_isolated) ? <Check size={14} /> : <AlertOctagon size={14} />}
                      {isTrue(chk.sick_animals_isolated) ? 'YES' : 'NO'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Waste Disposed Properly</span>
                    <span style={{ 
                      color: isTrue(chk.waste_disposed_properly) ? '#10b981' : '#ef4444', 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}>
                      {isTrue(chk.waste_disposed_properly) ? <Check size={14} /> : <X size={14} />}
                      {isTrue(chk.waste_disposed_properly) ? 'YES' : 'NO'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Footbath Available</span>
                    <span style={{ 
                      color: isTrue(chk.footbath_available) ? '#10b981' : '#ef4444', 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}>
                      {isTrue(chk.footbath_available) ? <Check size={14} /> : <X size={14} />}
                      {isTrue(chk.footbath_available) ? 'YES' : 'NO'}
                    </span>
                  </div>

                  {chk.remarks && (
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '10px', 
                      backgroundColor: 'var(--bg-app)', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      borderLeft: '3px solid #0d9488',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap'
                    }}>
                      <strong>Remarks:</strong> {chk.remarks}
                    </div>
                  )}

                </div>

                {/* Footer */}
                <div style={{ 
                  padding: '12px 20px', 
                  borderTop: '1px solid var(--border-color)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '11px',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} />
                    <span>{chk.created_on ? new Date(chk.created_on).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {(chk.logged_by || chk.u_logged_by || chk.sys_created_by) && (
                    <div style={{ fontWeight: 500 }}>
                      By: {chk.logged_by || chk.u_logged_by || chk.sys_created_by}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
