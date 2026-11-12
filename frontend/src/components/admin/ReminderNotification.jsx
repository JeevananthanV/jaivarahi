import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Cake, Heart, MessageCircle, RefreshCw, Eye, X, Phone,
  Mail, MapPin, ChevronRight, Shield, Users, FileText, Sparkles,
  ShoppingBag, Coins, Ticket, Clock, UserCheck, CheckCircle2,
  ExternalLink, CalendarDays, ArrowUpRight
} from 'lucide-react';
import adminApi from './adminApi';

const ReminderNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [anniversaries, setAnniversaries] = useState([]);
  const [recentForms, setRecentForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'forms', 'birthdays', 'anniversaries'
  const [selectedPerson, setSelectedPerson] = useState(null);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);
  const navigate = useNavigate();

  const fetchAllNotifications = async (showSpin = false) => {
    if (showSpin) setIsRefreshing(true);
    else setLoading(true);

    try {
      const [bData, aData, feedData] = await Promise.all([
        adminApi.getBirthdays({ days: 7 }).catch(() => ({ birthdays: [] })),
        adminApi.getWeddingAnniversaries({ days: 7 }).catch(() => ({ weddingAnniversaries: [] })),
        adminApi.getNotificationFeed().catch(() => ({ recentForms: [] })),
      ]);

      setBirthdays(bData.birthdays || []);
      setAnniversaries(aData.weddingAnniversaries || []);
      setRecentForms(feedData.recentForms || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
    const interval = setInterval(() => fetchAllNotifications(false), 3 * 60 * 1000);

    // Live Real-Time SSE Stream subscription
    const stream = adminApi.createRealtimeStream((event) => {
      if (event && (event.event || event.type)) {
        fetchAllNotifications(false);
      }
    });

    return () => {
      clearInterval(interval);
      if (stream && stream.close) stream.close();
    };
  }, []);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Combine and sort reminders
  const formattedReminders = [
    ...birthdays.map((b) => ({ ...b, itemCategory: 'reminder', reminderType: 'birthday' })),
    ...anniversaries.map((a) => ({ ...a, itemCategory: 'reminder', reminderType: 'anniversary' })),
  ].sort((a, b) => a.days_until - b.days_until);

  const formattedForms = recentForms.map((f) => ({
    ...f,
    itemCategory: 'form',
  }));

  const allItems = [...formattedReminders, ...formattedForms];

  const displayedList =
    activeTab === 'forms'
      ? formattedForms
      : activeTab === 'birthdays'
      ? formattedReminders.filter((r) => r.reminderType === 'birthday')
      : activeTab === 'anniversaries'
      ? formattedReminders.filter((r) => r.reminderType === 'anniversary')
      : allItems;

  const totalBadgeCount = formattedReminders.length + formattedForms.length;
  const todayReminders = formattedReminders.filter((r) => r.days_until === 0).length;

  const getBadgeClass = (days) => {
    if (days <= 0) return 'notif-tag notif-tag-today';
    if (days === 1) return 'notif-tag notif-tag-tomorrow';
    return 'notif-tag notif-tag-upcoming';
  };

  const getBadgeLabel = (days) => {
    if (days <= 0) return '🎉 Today!';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 2) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const getFormStyle = (type) => {
    switch (type) {
      case 'devotee':
        return { icon: <UserCheck size={16} />, bg: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' };
      case 'booking':
        return { icon: <CalendarDays size={16} />, bg: 'rgba(217, 119, 6, 0.12)', color: '#d97706' };
      case 'prasadham':
        return { icon: <ShoppingBag size={16} />, bg: 'rgba(21, 150, 107, 0.12)', color: '#15966b' };
      case 'donation':
        return { icon: <Coins size={16} />, bg: 'rgba(154, 59, 52, 0.12)', color: '#9a3b34' };
      case 'vip':
        return { icon: <Ticket size={16} />, bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' };
      default:
        return { icon: <FileText size={16} />, bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b' };
    }
  };

  return (
    <div className="notif-wrapper">
      {/* Bell Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        className={`ic-btn notif-bell-btn ${isOpen ? 'active' : ''} ${totalBadgeCount > 0 ? 'has-unread' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchAllNotifications(false);
        }}
        title={`Notifications & Reminders (${totalBadgeCount} items)`}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={18} className="notif-bell-icon" />
        {totalBadgeCount > 0 && (
          <span className={`notif-counter-badge ${todayReminders > 0 ? 'urgent' : ''}`}>
            {totalBadgeCount > 99 ? '99+' : totalBadgeCount}
          </span>
        )}
      </button>

      {/* Modern Floating Popover Dropdown */}
      {isOpen && (
        <div className="notif-popover-card animate-scale-in" ref={popoverRef}>
          {/* Popover Header */}
          <div className="notif-card-header">
            <div className="notif-header-left">
              <div className="notif-header-icon-box">
                <Bell size={16} />
              </div>
              <div>
                <h4 className="notif-header-title">Notifications Hub</h4>
                <div className="notif-header-subtitle">
                  {totalBadgeCount} {totalBadgeCount === 1 ? 'alert' : 'alerts'} &bull; {todayReminders > 0 ? `${todayReminders} today` : 'Real-time feed'}
                </div>
              </div>
            </div>

            <div className="notif-header-actions">
              <button 
                type="button"
                className={`notif-icon-action ${isRefreshing ? 'spinning' : ''}`}
                onClick={() => fetchAllNotifications(true)}
                title="Refresh notifications"
              >
                <RefreshCw size={14} />
              </button>
              <button 
                type="button"
                className="notif-icon-action"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="notif-tabs-bar">
            <button
              type="button"
              className={`notif-tab-pill ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <span>All</span>
              <span className="notif-tab-count">{totalBadgeCount}</span>
            </button>
            <button
              type="button"
              className={`notif-tab-pill ${activeTab === 'forms' ? 'active' : ''}`}
              onClick={() => setActiveTab('forms')}
            >
              <span>Forms</span>
              <span className="notif-tab-count">{formattedForms.length}</span>
            </button>
            <button
              type="button"
              className={`notif-tab-pill ${activeTab === 'birthdays' ? 'active' : ''}`}
              onClick={() => setActiveTab('birthdays')}
            >
              <span>🎂 Birthdays</span>
              <span className="notif-tab-count">{birthdays.length}</span>
            </button>
            <button
              type="button"
              className={`notif-tab-pill ${activeTab === 'anniversaries' ? 'active' : ''}`}
              onClick={() => setActiveTab('anniversaries')}
            >
              <span>💍 Anniversaries</span>
              <span className="notif-tab-count">{anniversaries.length}</span>
            </button>
          </div>

          {/* Notification List Scroll Area */}
          <div className="notif-list-container">
            {loading && displayedList.length === 0 ? (
              <div className="notif-loading-state">
                <RefreshCw size={22} className="spin" />
                <span>Loading latest updates...</span>
              </div>
            ) : displayedList.length === 0 ? (
              <div className="notif-empty-state">
                <div className="notif-empty-icon">
                  <CheckCircle2 size={32} />
                </div>
                <div className="notif-empty-title">All Caught Up!</div>
                <div className="notif-empty-text">
                  No pending alerts or reminders in this category.
                </div>
              </div>
            ) : (
              displayedList.map((item, idx) => {
                if (item.itemCategory === 'form') {
                  const styleMeta = getFormStyle(item.formType);
                  return (
                    <div key={`form-${item.id || idx}`} className="notif-item form-item">
                      <div 
                        className="notif-item-icon-box"
                        style={{ background: styleMeta.bg, color: styleMeta.color }}
                      >
                        {styleMeta.icon}
                      </div>

                      <div className="notif-item-content">
                        <div className="notif-item-top">
                          <span className="notif-item-title">
                            {item.name || item.formTitle}
                          </span>
                          {item.created_at && (
                            <span className="notif-item-time">
                              <Clock size={10} style={{ marginRight: 3 }} />
                              {formatTimeAgo(item.created_at)}
                            </span>
                          )}
                        </div>

                        <div className="notif-item-desc">
                          <span className="notif-type-tag" style={{ color: styleMeta.color, borderColor: styleMeta.bg }}>
                            {item.formTitle}
                          </span>
                          {item.contact && <span className="notif-contact-tag">📞 {item.contact}</span>}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="notif-action-btn"
                        onClick={() => {
                          setIsOpen(false);
                          if (item.link) navigate(item.link);
                        }}
                        title="Open in Admin"
                      >
                        <span>View</span>
                        <ArrowUpRight size={12} />
                      </button>
                    </div>
                  );
                }

                // Reminder Item (Birthday / Anniversary)
                const isBday = item.reminderType === 'birthday';
                return (
                  <div key={`rem-${item.reminderType}-${item.id || idx}`} className="notif-item reminder-item">
                    <div 
                      className={`notif-item-icon-box ${isBday ? 'bday-box' : 'anniv-box'}`}
                    >
                      {isBday ? <Cake size={16} /> : <Heart size={16} />}
                    </div>

                    <div className="notif-item-content">
                      <div className="notif-item-top">
                        <span className="notif-item-title">
                          {item.name}
                          {item.relationship && item.relationship !== 'Devotee' && (
                            <span className="notif-relation-chip">({item.relationship})</span>
                          )}
                        </span>
                        <span className={getBadgeClass(item.days_until)}>
                          {getBadgeLabel(item.days_until)}
                        </span>
                      </div>

                      <div className="notif-item-desc">
                        <span className="notif-date-label">
                          {isBday 
                            ? `🎂 ${item.birthday ? new Date(item.birthday).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}`
                            : `💍 ${item.wedding_date ? new Date(item.wedding_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''} ${item.years_married ? `(${item.years_married}y)` : ''}`}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="notif-item-actions">
                      <button
                        type="button"
                        className="notif-mini-btn"
                        onClick={() => setSelectedPerson(item)}
                        title="View Full Profile Details"
                      >
                        <Eye size={13} />
                      </button>

                      {item.contact && (
                        <a
                          href={`https://wa.me/91${item.contact.replace(/\D/g, '')}?text=${
                            isBday
                              ? `Happy%20Birthday%20${encodeURIComponent(item.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings.`
                              : `Happy%20Wedding%20Anniversary%20${encodeURIComponent(item.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings.`
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="notif-mini-btn whatsapp"
                          title="Send Divine WhatsApp Wish"
                        >
                          <MessageCircle size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Popover Footer Navigation */}
          <div className="notif-card-footer">
            <button
              type="button"
              className="notif-footer-link"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/devotees');
              }}
            >
              <span>Devotee Forms</span>
              <ChevronRight size={12} />
            </button>
            <button
              type="button"
              className="notif-footer-link"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/birthdays');
              }}
            >
              <span>Birthdays</span>
              <ChevronRight size={12} />
            </button>
            <button
              type="button"
              className="notif-footer-link"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/wedding-anniversaries');
              }}
            >
              <span>Anniversaries</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Person Astrological & Contact Details Modal */}
      {selectedPerson && (
        <div className="cmd-modal-backdrop" onClick={() => setSelectedPerson(null)}>
          <div 
            className="cmd-modal-container animate-slide-down" 
            style={{ maxWidth: 500 }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="cmd-search-bar" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div 
                  className={`notif-item-icon-box ${selectedPerson.reminderType === 'birthday' ? 'bday-box' : 'anniv-box'}`}
                  style={{ width: 36, height: 36 }}
                >
                  {selectedPerson.reminderType === 'birthday' ? <Cake size={18} /> : <Heart size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--tx)' }}>{selectedPerson.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{selectedPerson.source || 'Devotee Record'}</div>
                </div>
              </div>
              <button 
                type="button" 
                className="cmd-close-btn" 
                onClick={() => setSelectedPerson(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 18, maxHeight: '65vh', overflowY: 'auto' }}>
              {/* Event Banner */}
              <div 
                style={{ 
                  background: 'var(--primary-10)', 
                  border: '1px solid var(--bd2)', 
                  borderRadius: 'var(--r)', 
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', fontWeight: 700 }}>
                    {selectedPerson.reminderType === 'birthday' ? 'Celebration Date' : 'Wedding Date'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx)', marginTop: 2 }}>
                    {selectedPerson.birthday || selectedPerson.wedding_date
                      ? new Date(selectedPerson.birthday || selectedPerson.wedding_date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Not specified'}
                  </div>
                </div>
                <span className={getBadgeClass(selectedPerson.days_until)}>
                  {getBadgeLabel(selectedPerson.days_until)}
                </span>
              </div>

              {/* Astrological / Devotee Details */}
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', border: '1px solid var(--bd)', padding: '4px 14px', marginBottom: 16 }}>
                {selectedPerson.years_married > 0 && (
                  <div className="detail-row">
                    <span className="detail-key">Milestone</span>
                    <span className="detail-val" style={{ color: 'var(--special)' }}>{selectedPerson.years_married} Years</span>
                  </div>
                )}
                {selectedPerson.star && (
                  <div className="detail-row">
                    <span className="detail-key">Nakshatram (Star)</span>
                    <span className="detail-val">{selectedPerson.star}</span>
                  </div>
                )}
                {selectedPerson.rasi && (
                  <div className="detail-row">
                    <span className="detail-key">Rasi</span>
                    <span className="detail-val">{selectedPerson.rasi}</span>
                  </div>
                )}
                {selectedPerson.gothram && (
                  <div className="detail-row">
                    <span className="detail-key">Gothram</span>
                    <span className="detail-val">{selectedPerson.gothram}</span>
                  </div>
                )}
                {selectedPerson.devotee_name && (
                  <div className="detail-row">
                    <span className="detail-key">Head of Family</span>
                    <span className="detail-val">{selectedPerson.devotee_name}</span>
                  </div>
                )}
              </div>

              {/* Contact Actions */}
              {selectedPerson.contact && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <a
                    href={`tel:${selectedPerson.contact}`}
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: 'center', gap: 6, fontSize: 12.5 }}
                  >
                    <Phone size={14} color="var(--in)" />
                    <span>Call ({selectedPerson.contact})</span>
                  </a>
                  <a
                    href={`https://wa.me/91${selectedPerson.contact.replace(/\D/g, '')}?text=${
                      selectedPerson.reminderType === 'birthday'
                        ? `Happy%20Birthday%20${encodeURIComponent(selectedPerson.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings.`
                        : `Happy%20Wedding%20Anniversary%20${encodeURIComponent(selectedPerson.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings.`
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center', gap: 6, fontSize: 12.5, background: 'var(--whatsapp)', borderColor: 'var(--whatsapp)' }}
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="cmd-modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setSelectedPerson(null)}
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderNotification;