import React from 'react';
import { X, Bell, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export default function Notifications({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkRead, 
  unreadCount,
  loading,
  setPage
}) {
  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'critical':
        return <AlertCircle size={20} style={{ color: 'var(--danger)' }} />;
      case 'warning':
        return <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />;
      default:
        return <Info size={20} style={{ color: 'var(--info)' }} />;
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'critical': return 'badge-red';
      case 'warning': return 'badge-orange';
      default: return 'badge-blue';
    }
  };

  const handleNotifClick = (notif) => {
    if (!notif.read) {
      onMarkRead(notif.notification_id);
    }
    
    // If there's a related record (e.g. disease report DISxxxxx), navigate to disease reports page
    if (notif.related_record) {
      setPage('disease-reports');
      onClose();
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} style={{ color: 'var(--primary)' }} />
            <h3 className="drawer-title">Notifications</h3>
            {unreadCount > 0 && (
              <span className="badge badge-red" style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>
                {unreadCount} New
              </span>
            )}
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {loading && notifications.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', color: 'var(--text-secondary)' }}>
              <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></div>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>Loading alerts...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              <CheckCircle2 size={40} style={{ color: 'var(--success)', marginBottom: '12px' }} />
              <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>You're all caught up!</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>No warnings or notifications to show.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.notification_sys_id || notif.notification_id}
                className={`notification-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => handleNotifClick(notif)}
              >
                <div className="notification-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getTypeIcon(notif.type)}
                    <span className="notification-title">{notif.title}</span>
                  </div>
                  <span className={`badge ${getTypeBadgeClass(notif.type)}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                    {notif.type}
                  </span>
                </div>
                
                <p className="notification-message">{notif.message}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span className="notification-time">
                    {notif.created_on ? new Date(notif.created_on).toLocaleString() : ''}
                  </span>
                  
                  {notif.related_record && (
                    <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>
                      View Record: {notif.related_record}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
