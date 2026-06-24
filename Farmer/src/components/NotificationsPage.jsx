import React, { useState } from 'react';
import { Bell, Check, AlertCircle, AlertTriangle, Info, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';

export default function NotificationsPage({
  notifications,
  onMarkRead,
  unreadCount,
  loading,
  setPage,
  showToast
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'critical':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getTypeIconClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'critical': return 'notification-icon-critical';
      case 'warning': return 'notification-icon-warning';
      default: return 'notification-icon-info';
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
    const isRead = notif.read || notif.u_read === true || notif.u_read === 'true';
    if (!isRead) {
      onMarkRead(notif.notification_id, notif.notification_sys_id);
    }
    if (notif.related_record) {
      setPage('disease-reports');
    }
  };

  const handleMarkAllRead = async () => {
    const unreadList = notifications.filter(n => !n.read && !n.u_read);
    if (unreadList.length === 0) {
      showToast('All notifications are already read!', 'info');
      return;
    }
    for (const notif of unreadList) {
      await onMarkRead(notif.notification_id, notif.notification_sys_id);
    }
    showToast('All notifications marked as read.', 'success');
  };

  const filteredNotifs = notifications.filter(notif => {
    const isRead = notif.read || notif.u_read === true || notif.u_read === 'true';
    if (filter === 'unread') return !isRead;
    if (filter === 'read') return isRead;
    return true;
  });

  return (
    <div className="page-content">
      {/* View Header */}
      <div className="view-header">
        <div>
          <h2 className="page-title" style={{ fontSize: '28px' }}>System Notifications</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Stay updated on critical animal health notices and biosecurity warnings</p>
        </div>
        {notifications.some(n => !n.read && !n.u_read) && (
          <button className="btn-secondary" style={{ display: 'flex', gap: '8px' }} onClick={handleMarkAllRead}>
            <CheckCircle2 size={16} />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button 
          className={`btn-tab ${filter === 'all' ? 'active' : ''}`}
          style={{ 
            padding: '8px 16px', 
            background: filter === 'all' ? 'var(--primary-light)' : 'transparent', 
            color: filter === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
            border: filter === 'all' ? '1px solid var(--primary)' : '1px solid transparent',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onClick={() => setFilter('all')}
        >
          All Notifications ({notifications.length})
        </button>
        <button 
          className={`btn-tab ${filter === 'unread' ? 'active' : ''}`}
          style={{ 
            padding: '8px 16px', 
            background: filter === 'unread' ? 'var(--primary-light)' : 'transparent', 
            color: filter === 'unread' ? 'var(--primary)' : 'var(--text-secondary)',
            border: filter === 'unread' ? '1px solid var(--primary)' : '1px solid transparent',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onClick={() => setFilter('unread')}
        >
          Unread ({notifications.filter(n => !n.read && !n.u_read).length})
        </button>
        <button 
          className={`btn-tab ${filter === 'read' ? 'active' : ''}`}
          style={{ 
            padding: '8px 16px', 
            background: filter === 'read' ? 'var(--primary-light)' : 'transparent', 
            color: filter === 'read' ? 'var(--primary)' : 'var(--text-secondary)',
            border: filter === 'read' ? '1px solid var(--primary)' : '1px solid transparent',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onClick={() => setFilter('read')}
        >
          Read ({notifications.filter(n => n.read || n.u_read).length})
        </button>
      </div>

      {/* Content */}
      {loading && notifications.length === 0 ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading system warnings...</p>
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="empty-state">
          <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
          <div>
            <h4 className="empty-title">All Caught Up!</h4>
            <p className="empty-desc">
              {filter === 'unread' 
                ? 'No unread notifications to display.' 
                : filter === 'read' 
                  ? 'No read notifications found.' 
                  : 'Your notification inbox is currently empty.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="notification-feed">
          {filteredNotifs.map((notif) => {
            const isRead = notif.read || notif.u_read === true || notif.u_read === 'true';
            const typeClass = notif.type?.toLowerCase() || 'info';

            return (
              <div 
                key={notif.notification_sys_id || notif.notification_id}
                className={`notification-card ${isRead ? 'read' : 'unread'} ${typeClass}`}
                onClick={() => handleNotifClick(notif)}
              >
                <div className={`notification-icon-container ${getTypeIconClass(notif.type)}`}>
                  {getTypeIcon(notif.type)}
                </div>

                <div className="notification-content">
                  <div className="notification-meta-title">
                    <span className="notification-card-title">{notif.title}</span>
                    <span className={`badge ${getTypeBadgeClass(notif.type)}`} style={{ fontSize: '10px' }}>
                      {notif.type || 'info'}
                    </span>
                  </div>
                  <p className="notification-card-message">{notif.message}</p>
                  
                  <div className="notification-card-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      <span>{notif.created_on ? new Date(notif.created_on).toLocaleString() : 'N/A'}</span>
                    </div>

                    {notif.related_record && (
                      <div className="notification-link-btn" onClick={(e) => {
                        e.stopPropagation();
                        setPage('disease-reports');
                      }}>
                        <span>Inspect: {notif.related_record}</span>
                        <ArrowRight size={14} />
                      </div>
                    )}
                  </div>
                </div>

                {!isRead && (
                  <button 
                    className="notification-action-check"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(notif.notification_id, notif.notification_sys_id);
                    }}
                    title="Mark as Read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
