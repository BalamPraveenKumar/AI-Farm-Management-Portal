import React, { useState } from 'react';
import { Send, BellRing, Info, AlertTriangle, AlertCircle, Users, User } from 'lucide-react';
import { notificationService } from '../services/notificationService';

export default function SendNotifications({ showToast, onUnauthorized, farms = [] }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [submitting, setSubmitting] = useState(false);
  
  // New States for Targeted Notification
  const [targetType, setTargetType] = useState('broadcast'); // 'broadcast' or 'direct'
  const [selectedFarmSysId, setSelectedFarmSysId] = useState('');

  const selectedFarm = farms.find(f => f.farm_sys_id === selectedFarmSysId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Please provide both title and alert description.', 'error');
      return;
    }

    if (targetType === 'direct' && !selectedFarmSysId) {
      showToast('Please select a target farm.', 'error');
      return;
    }

    setSubmitting(true);
    let result;
    if (targetType === 'direct') {
      const payload = {
        farm_sys_id: selectedFarmSysId,
        title: title.trim(),
        message: message.trim(),
        type: type
      };
      result = await notificationService.sendDirectNotification(payload, onUnauthorized);
    } else {
      result = await notificationService.sendNotification(title.trim(), message.trim(), type, onUnauthorized);
    }
    setSubmitting(false);

    if (result.success) {
      showToast(result.message || (targetType === 'direct' ? 'Targeted notification sent successfully.' : 'Notification broadcasted successfully.'), 'success');
      setTitle('');
      setMessage('');
      setType('info');
      setSelectedFarmSysId('');
    } else {
      showToast(result.message || 'Failed to dispatch alert.', 'error');
    }
  };

  const getAlertIcon = (t) => {
    switch (t) {
      case 'critical': return <AlertCircle size={20} style={{ color: 'var(--danger)' }} />;
      case 'warning': return <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />;
      default: return <Info size={20} style={{ color: 'var(--info)' }} />;
    }
  };

  return (
    <div className="page-content">
      <div className="view-header">
        <div>
          <h2 className="page-title">Send Notifications</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Dispatch notifications to all farmers in your district or send a targeted alert to a specific farmer.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Form Panel */}
        <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Target Type Toggle */}
            <div className="form-group">
              <label className="form-label">Notification Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setTargetType('broadcast')}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: targetType === 'broadcast' ? 'var(--primary)' : 'var(--border-color)',
                    background: targetType === 'broadcast' ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                    color: targetType === 'broadcast' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  disabled={submitting}
                >
                  <Users size={16} />
                  District Broadcast
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('direct')}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: targetType === 'direct' ? 'var(--primary)' : 'var(--border-color)',
                    background: targetType === 'direct' ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                    color: targetType === 'direct' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  disabled={submitting}
                >
                  <User size={16} />
                  Target Specific Farm
                </button>
              </div>
            </div>

            {/* Farm Select Dropdown (Visible only if Target Type is Direct) */}
            {targetType === 'direct' && (
              <div className="form-group" style={{ animation: 'fadeIn 0.2s ease' }}>
                <label className="form-label">Select Target Farm *</label>
                <select
                  className="form-input"
                  value={selectedFarmSysId}
                  onChange={(e) => setSelectedFarmSysId(e.target.value)}
                  disabled={submitting}
                  required
                  style={{ width: '100%', height: '45px', padding: '0 12px' }}
                >
                  <option value="">-- Select a Farm --</option>
                  {farms.map((f) => (
                    <option key={f.farm_sys_id} value={f.farm_sys_id}>
                      {f.farm_name} ({f.farmer?.name || 'Unknown Farmer'})
                    </option>
                  ))}
                </select>
                {selectedFarm && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} />
                    <span>Selected Farmer: <strong>{selectedFarm.farmer?.name || 'N/A'}</strong></span>
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Alert Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder={targetType === 'direct' ? "e.g., Notice regarding your farm compliance..." : "e.g., Extreme Weather Warning, Scheduled Vaccination..."}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alert Severity Level *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {['info', 'warning', 'critical'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: type === t 
                        ? (t === 'info' ? 'var(--info)' : t === 'warning' ? 'var(--warning)' : 'var(--danger)')
                        : 'var(--border-color)',
                      background: type === t
                        ? (t === 'info' ? 'rgba(59, 130, 246, 0.1)' : t === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)')
                        : 'transparent',
                      color: type === t
                        ? (t === 'info' ? 'var(--info)' : t === 'warning' ? 'var(--warning)' : 'var(--danger)')
                        : 'var(--text-secondary)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    disabled={submitting}
                  >
                    {getAlertIcon(t)}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Message *</label>
              <textarea
                className="form-input"
                placeholder="Write clear instructions for the farmer..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                disabled={submitting}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ justifyContent: 'center', gap: '8px', padding: '12px 20px', width: '100%' }}
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#fff' }}></span>
              ) : (
                <>
                  <Send size={16} />
                  {targetType === 'direct' ? 'Send Targeted Alert' : 'Dispatch System Alert'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Preview Panel */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
            {targetType === 'direct' ? 'Targeted Preview:' : 'Broadcasting Preview:'}
          </h4>
          
          <div 
            className={`notification-card unread ${type}`}
            style={{ 
              pointerEvents: 'none', 
              opacity: title.trim() || message.trim() ? 1 : 0.5,
              transition: 'opacity 0.2s'
            }}
          >
            <div className={`notification-icon-container ${
              type === 'critical' ? 'notification-icon-critical' : type === 'warning' ? 'notification-icon-warning' : 'notification-icon-info'
            }`}>
              {type === 'critical' ? <AlertCircle size={20} /> : type === 'warning' ? <AlertTriangle size={20} /> : <Info size={20} />}
            </div>

            <div className="notification-content">
              <div className="notification-meta-title">
                <span className="notification-card-title">{title || 'Your Alert Title'}</span>
                <span className={`badge ${
                  type === 'critical' ? 'badge-red' : type === 'warning' ? 'badge-orange' : 'badge-blue'
                }`} style={{ fontSize: '10px' }}>
                  {type}
                </span>
              </div>
              <p className="notification-card-message" style={{ whiteSpace: 'pre-line' }}>
                {message || 'Your alert message details will appear here as you write them in the dispatch form panel...'}
              </p>
              
              <div className="notification-card-footer">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>Recipient: <strong>{targetType === 'direct' ? (selectedFarm ? `${selectedFarm.farmer?.name || 'Unknown'} (${selectedFarm.farm_name})` : 'Specific Farmer') : 'All District Farmers'}</strong></span>
                  <span>Date: {new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
