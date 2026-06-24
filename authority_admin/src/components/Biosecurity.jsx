import React, { useEffect, useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  RefreshCw, 
  Filter, 
  Check, 
  X, 
  AlertTriangle,
  Calendar,
  Activity,
  CheckCircle2,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { biosecurityService } from '../services/biosecurityService';
import { districtService } from '../services/districtService';

export default function Biosecurity({ onUnauthorized, showToast }) {
  const [checklists, setChecklists] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    average: 0,
    excellent: 0,
    good: 0,
    needsImprovement: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [scoreFilter, setScoreFilter] = useState('');

  const fetchBiosecurityData = async () => {
    setLoading(true);
    try {
      const [listRes, districtsRes] = await Promise.all([
        biosecurityService.getBiosecurityChecklists(onUnauthorized),
        districtService.getDistricts(onUnauthorized)
      ]);

      if (listRes.success) {
        const list = listRes.checklists || [];
        setChecklists(list);

        // Compute summary metrics dynamically from the loaded checklist data
        const total = list.length;
        let totalScoreSum = 0;
        let excellent = 0;
        let good = 0;
        let needsImprovement = 0;

        const isTrue = (val) => val === true || val === 'true';
        list.forEach(chk => {
          const scoreCount = (isTrue(chk.visitors_registered) ? 1 : 0) + 
                             (isTrue(chk.farm_sanitized) ? 1 : 0) + 
                             (isTrue(chk.sick_animals_isolated) ? 1 : 0) + 
                             (isTrue(chk.waste_disposed_properly) ? 1 : 0) +
                             (isTrue(chk.footbath_available) ? 1 : 0);
          
          const backendScore = chk.biosecurity_score !== undefined && chk.biosecurity_score !== null 
            ? chk.biosecurity_score 
            : (chk.u_biosecurity_score !== undefined && chk.u_biosecurity_score !== null ? chk.u_biosecurity_score : null);
          const displayScore = backendScore !== null ? parseInt(backendScore, 10) : (scoreCount * 20);

          totalScoreSum += displayScore;
          if (displayScore >= 85) {
            excellent++;
          } else if (displayScore >= 70) {
            good++;
          } else {
            needsImprovement++;
          }
        });

        const average = total > 0 ? Math.round(totalScoreSum / total) : 0;
        setSummary({
          total,
          average,
          excellent,
          good,
          needsImprovement
        });
      } else {
        showToast(listRes.message || 'Failed to load checklists.', 'error');
      }

      if (districtsRes.success) {
        setDistricts(districtsRes.districts || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while fetching biosecurity details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiosecurityData();
  }, [onUnauthorized]);

  // Apply filters
  const filtered = checklists.filter((chk) => {
    const isTrue = (val) => val === true || val === 'true';
    const scoreCount = (isTrue(chk.visitors_registered) ? 1 : 0) + 
                       (isTrue(chk.farm_sanitized) ? 1 : 0) + 
                       (isTrue(chk.sick_animals_isolated) ? 1 : 0) + 
                       (isTrue(chk.waste_disposed_properly) ? 1 : 0) +
                       (isTrue(chk.footbath_available) ? 1 : 0);
    
    const backendScore = chk.biosecurity_score !== undefined && chk.biosecurity_score !== null 
      ? chk.biosecurity_score 
      : (chk.u_biosecurity_score !== undefined && chk.u_biosecurity_score !== null ? chk.u_biosecurity_score : null);
    const scoreVal = backendScore !== null ? parseInt(backendScore, 10) : (scoreCount * 20);

    const matchesSearch = 
      chk.checklist_id?.toLowerCase().includes(search.toLowerCase()) ||
      chk.farm?.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
      chk.submitted_by?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict = !districtFilter || chk.district?.district_code === districtFilter;
    
    let matchesScore = true;
    if (scoreFilter === 'excellent') matchesScore = scoreVal >= 85;
    else if (scoreFilter === 'good') matchesScore = scoreVal >= 70 && scoreVal < 85;
    else if (scoreFilter === 'critique') matchesScore = scoreVal < 70;

    return matchesSearch && matchesDistrict && matchesScore;
  });

  return (
    <div>
      {/* Summary Stats Grid */}
      <div className="dashboard-grid" style={{ marginBottom: '28px' }}>
        {/* Total Logs */}
        <div className="metric-card" style={{ padding: '20px' }}>
          <div className="metric-icon-wrapper" style={{ background: 'rgba(79, 70, 229, 0.12)', color: '#4f46e5' }}>
            <Activity size={20} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{summary.total}</div>
            <div className="metric-label">Checklists Audited</div>
          </div>
        </div>

        {/* Compliant rate */}
        <div className="metric-card" style={{ padding: '20px' }}>
          <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{summary.excellent + summary.good}</div>
            <div className="metric-label">Compliant Farms ({(summary.total > 0 ? Math.round(((summary.excellent + summary.good) / summary.total) * 100) : 0)}%)</div>
          </div>
        </div>

        {/* Avg State Score */}
        <div className="metric-card" style={{ padding: '20px' }}>
          <div className="metric-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
            <TrendingUp size={20} />
          </div>
          <div className="metric-details">
            <div className="metric-value">{summary.average}%</div>
            <div className="metric-label">Average State Score</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', flexGrow: 1 }}>
            
            {/* Search */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by Farm / ID..."
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

            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              style={{
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
                  {d.district_name}
                </option>
              ))}
            </select>

            {/* Compliance Filter */}
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '13px'
              }}
            >
              <option value="">All Scores</option>
              <option value="excellent">Excellent Compliance (85%+)</option>
              <option value="good">Good Compliance (70%-84%)</option>
              <option value="critique">Needs Improvement (&lt;70%)</option>
            </select>
          </div>

          <button className="btn-secondary" onClick={fetchBiosecurityData}>
            <RefreshCw size={14} />
            Reset Audit
          </button>
        </div>
      </div>

      {/* Checklist Cards List */}
      {loading ? (
        <div className="loading-container">
          <span className="spinner" />
          <span style={{ fontWeight: 600 }}>Analyzing state biosecurity reports...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <ShieldCheck size={36} />
          <div className="empty-title">No Checklists Logged</div>
          <div className="empty-desc">No checklists found for the selected criteria.</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filtered.map((chk) => {
            const isTrue = (val) => val === true || val === 'true';
            const scoreCount = (isTrue(chk.visitors_registered) ? 1 : 0) + 
                               (isTrue(chk.farm_sanitized) ? 1 : 0) + 
                               (isTrue(chk.sick_animals_isolated) ? 1 : 0) + 
                               (isTrue(chk.waste_disposed_properly) ? 1 : 0) +
                               (isTrue(chk.footbath_available) ? 1 : 0);
            
            const backendScore = chk.biosecurity_score !== undefined && chk.biosecurity_score !== null 
              ? chk.biosecurity_score 
              : (chk.u_biosecurity_score !== undefined && chk.u_biosecurity_score !== null ? chk.u_biosecurity_score : null);
            const score = backendScore !== null ? parseInt(backendScore, 10) : (scoreCount * 20);
            
            return (
              <div 
                key={chk.checklist_id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <ShieldCheck size={18} style={{ color: score >= 80 ? '#10b981' : '#f59e0b' }} />
                      {chk.farm?.farm_name || 'N/A'}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      ID: {chk.checklist_id || 'N/A'} • {chk.district?.district_name || chk.district?.district_code || 'N/A'}
                    </span>
                  </div>

                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: score >= 85 ? 'rgba(16,185,129,0.1)' : score >= 70 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                    color: score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '14px'
                  }}>
                    {score}%
                  </div>
                </div>

                {/* Body checklist options */}
                <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Option 1 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Visitors Logged</span>
                    {chk.visitors_registered ? <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><Check size={14} /> Yes</span> 
                                             : <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><X size={14} /> No</span>}
                  </div>

                  {/* Option 2 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Disinfected / Sanitized</span>
                    {chk.farm_sanitized ? <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><Check size={14} /> Yes</span> 
                                        : <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><X size={14} /> No</span>}
                  </div>

                  {/* Option 3 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Sick Animals Isolated</span>
                    {chk.sick_animals_isolated ? <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><Check size={14} /> Yes</span> 
                                               : <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><X size={14} /> No</span>}
                  </div>

                  {/* Option 4 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Waste Disposed Properly</span>
                    {chk.waste_disposed_properly ? <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><Check size={14} /> Yes</span> 
                                                 : <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><X size={14} /> No</span>}
                  </div>

                  {/* Option 5 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Footbath Available</span>
                    {chk.footbath_available ? <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><Check size={14} /> Yes</span> 
                                            : <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><X size={14} /> No</span>}
                  </div>

                </div>

                {/* Footer details */}
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
                    <span>{chk.checklist_date || 'N/A'}</span>
                  </div>
                  {chk.submitted_by?.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <UserCheck size={12} />
                      <span>{chk.submitted_by.name}</span>
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
