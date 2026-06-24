import React, { useEffect, useState } from 'react';
import { Send, RefreshCw, AlertTriangle, Info, BellRing, Volume2, Globe, User, Home } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { districtService } from '../services/districtService';
import { farmService } from '../services/farmService';

export default function SendNotifications({ onUnauthorized, showToast }) {
  const [districts, setDistricts] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingFarms, setLoadingFarms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [targetScope, setTargetScope] = useState('ALL'); // 'ALL', 'DISTRICT', or 'SPECIFIC_FARM'
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedFarmSysId, setSelectedFarmSysId] = useState('');
  const [type, setType] = useState('info'); // 'critical', 'warning', 'info'
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const fetchDistricts = async () => {
    setLoadingDistricts(true);
    const result = await districtService.getDistricts(onUnauthorized);
    setLoadingDistricts(false);
    if (result.success) {
      setDistricts(result.districts || []);
    }
  };

  const fetchFarms = async () => {
    setLoadingFarms(true);
    const result = await farmService.getFarms(onUnauthorized);
    setLoadingFarms(false);
    if (result.success) {
      setFarms(result.farms || []);
    }
  };

  useEffect(() => {
    fetchDistricts();
    fetchFarms();
  }, [onUnauthorized]);

  const selectedFarm = farms.find(f => f.farm_sys_id === selectedFarmSysId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Please specify a title and message content.', 'error');
      return;
    }

    if (targetScope === 'DISTRICT' && !selectedDistrict) {
      showToast('Please select a target district for this broadcast.', 'error');
      return;
    }

    if (targetScope === 'SPECIFIC_FARM' && !selectedFarmSysId) {
      showToast('Please select a target farm.', 'error');
      return;
    }

    setSubmitting(true);
    let result;

    if (targetScope === 'SPECIFIC_FARM') {
      const payload = {
        farm_sys_id: selectedFarmSysId,
        title: title.trim(),
        message: message.trim(),
        type: type
      };
      result = await notificationService.sendDirectNotification(payload, onUnauthorized);
    } else {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        type: type
      };
      if (targetScope === 'DISTRICT') {
        payload.district_code = selectedDistrict;
      }
      result = await notificationService.sendNotification(payload, onUnauthorized);
    }

    setSubmitting(false);

    if (result.success) {
      showToast(result.message || 'Notification dispatched successfully!', 'success');
      // Reset form
      setTitle('');
      setMessage('');
      setSelectedDistrict('');
      setSelectedFarmSysId('');
      setTargetScope('ALL');
    } else {
      showToast(result.message || 'Failed to dispatch notification.', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="dashboard-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(79, 70, 229, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BellRing size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Compose Notification Alert</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Send real-time alerts, health advisories, or target specific farmers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Target Scope selection */}
          <div>
            <label className="admin-form-label" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Broadcast Destination</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              
              {/* Statewide option */}
              <label style={{
                flex: 1,
                minWidth: '200px',
                padding: '16px',
                border: '1px solid ' + (targetScope === 'ALL' ? 'var(--primary)' : 'var(--border-color)'),
                borderRadius: 'var(--radius-md)',
                background: targetScope === 'ALL' ? 'var(--primary-light)' : 'var(--bg-app)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s'
              }}>
                <input 
                  type="radio" 
                  name="scope" 
                  value="ALL" 
                  checked={targetScope === 'ALL'} 
                  onChange={() => setTargetScope('ALL')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={14} style={{ color: 'var(--primary)' }} />
                    Statewide Broadcast
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dispatches to all active districts</span>
                </div>
              </label>

              {/* District Specific option */}
              <label style={{
                flex: 1,
                minWidth: '200px',
                padding: '16px',
                border: '1px solid ' + (targetScope === 'DISTRICT' ? 'var(--primary)' : 'var(--border-color)'),
                borderRadius: 'var(--radius-md)',
                background: targetScope === 'DISTRICT' ? 'var(--primary-light)' : 'var(--bg-app)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s'
              }}>
                <input 
                  type="radio" 
                  name="scope" 
                  value="DISTRICT" 
                  checked={targetScope === 'DISTRICT'} 
                  onChange={() => setTargetScope('DISTRICT')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Volume2 size={14} style={{ color: '#8b5cf6' }} />
                    Targeted District
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dispatches only to a specific selected district</span>
                </div>
              </label>

              {/* Specific Farm option */}
              <label style={{
                flex: 1,
                minWidth: '200px',
                padding: '16px',
                border: '1px solid ' + (targetScope === 'SPECIFIC_FARM' ? 'var(--primary)' : 'var(--border-color)'),
                borderRadius: 'var(--radius-md)',
                background: targetScope === 'SPECIFIC_FARM' ? 'var(--primary-light)' : 'var(--bg-app)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s'
              }}>
                <input 
                  type="radio" 
                  name="scope" 
                  value="SPECIFIC_FARM" 
                  checked={targetScope === 'SPECIFIC_FARM'} 
                  onChange={() => setTargetScope('SPECIFIC_FARM')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} style={{ color: '#10b981' }} />
                    Specific Farm / Farmer
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sends targeted alert to a specific farm owner</span>
                </div>
              </label>

            </div>
          </div>

          {/* District Selector (only if scope is DISTRICT) */}
          {targetScope === 'DISTRICT' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <label className="admin-form-label" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Select Target District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={loadingDistricts}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px'
                }}
                required
              >
                <option value="">-- Choose target district --</option>
                {districts.map(d => (
                  <option key={d.district_sys_id || d.district_code} value={d.district_code}>
                    {d.district_name} ({d.district_code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Farm Selector (only if scope is SPECIFIC_FARM) */}
          {targetScope === 'SPECIFIC_FARM' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <label className="admin-form-label" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Select Target Farm *</label>
              <select
                value={selectedFarmSysId}
                onChange={(e) => setSelectedFarmSysId(e.target.value)}
                disabled={loadingFarms}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px'
                }}
                required
              >
                <option value="">-- Choose target farm --</option>
                {farms.map(f => (
                  <option key={f.farm_sys_id} value={f.farm_sys_id}>
                    {f.farm_name} ({f.farmer?.name || 'Unknown Farmer'}, District: {f.district?.district_name || 'N/A'})
                  </option>
                ))}
              </select>
              {selectedFarm && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} />
                  <span>Targeted Farmer: <strong>{selectedFarm.farmer?.name || 'N/A'}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Alert Type */}
          <div>
            <label className="admin-form-label" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Alert Type / Severity</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* Info Type */}
              <button
                type="button"
                onClick={() => setType('info')}
                style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid ' + (type === 'info' ? 'var(--info)' : 'var(--border-color)'),
                  background: type === 'info' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-app)',
                  color: type === 'info' ? 'var(--info)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Info size={14} /> Information
              </button>

              {/* Warning Type */}
              <button
                type="button"
                onClick={() => setType('warning')}
                style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid ' + (type === 'warning' ? 'var(--warning)' : 'var(--border-color)'),
                  background: type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-app)',
                  color: type === 'warning' ? 'var(--warning)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <AlertTriangle size={14} /> Warning
              </button>

              {/* Critical Type */}
              <button
                type="button"
                onClick={() => setType('critical')}
                style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid ' + (type === 'critical' ? 'var(--danger)' : 'var(--border-color)'),
                  background: type === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-app)',
                  color: type === 'critical' ? 'var(--danger)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <AlertTriangle size={14} /> Critical Alert
              </button>
            </div>
          </div>

          {/* Alert Title */}
          <div>
            <label className="admin-form-label" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Alert Title</label>
            <input
              type="text"
              placeholder={targetScope === 'SPECIFIC_FARM' ? "e.g. Action required regarding your biosecurity compliance" : "e.g. Foot-and-Mouth Disease Outbreak Alert"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '14px'
              }}
              required
            />
          </div>

          {/* Alert Message */}
          <div>
            <label className="admin-form-label" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Alert Content / Message</label>
            <textarea
              placeholder="Provide clean instructions for farmers, symptoms details and contact numbers..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '14px',
                resize: 'vertical',
                lineHeight: 1.5
              }}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ padding: '14px', justifyContent: 'center', marginTop: '10px' }}
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff' }} />
                Dispatched alert...
              </>
            ) : (
              <>
                <Send size={15} />
                Send Alert Notification
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
