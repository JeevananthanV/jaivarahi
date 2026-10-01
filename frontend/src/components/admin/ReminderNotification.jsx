import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Cake,
  Heart,
  MessageCircle,
  RefreshCw,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Shield,
  Users,
  FileText,
  Sparkles,
  ShoppingBag,
  Coins,
  Ticket,
  Clock,
  UserCheck
} from 'lucide-react';
import adminApi from './adminApi';

const ReminderNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [anniversaries, setAnniversaries] = useState([]);
  const [recentForms, setRecentForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, forms, birthdays, anniversaries
  const [selectedPerson, setSelectedPerson] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchAllNotifications = async () => {
    setLoading(true);
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
    }
  };

  useEffect(() => {
    fetchAllNotifications();
    // Auto-refresh every 3 minutes
    const interval = setInterval(fetchAllNotifications, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
    if (days <= 0) return 'dash-pill ok';
    if (days <= 2) return 'dash-pill er';
    if (days <= 5) return 'dash-pill wa';
    return 'dash-pill in';
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

  const getFormIcon = (type) => {
    switch (type) {
      case 'devotee':
        return <UserCheck size={15} />;
      case 'booking':
        return <Sparkles size={15} />;
      case 'prasadham':
        return <ShoppingBag size={15} />;
      case 'donation':
        return <Coins size={15} />;
      case 'vip':
        return <Ticket size={15} />;
      default:
        return <FileText size={15} />;
    }
  };

  const getFormColor = (type) => {
    switch (type) {
      case 'devotee':
        return { bg: 'var(--inb)', color: 'var(--in)' };
      case 'booking':
        return { bg: 'var(--special-08)', color: 'var(--special)' };
      case 'prasadham':
        return { bg: 'rgba(21, 150, 107, 0.12)', color: 'var(--ok)' };
      case 'donation':
        return { bg: 'rgba(234, 88, 12, 0.12)', color: 'var(--accent-color)' };
      case 'vip':
        return { bg: 'rgba(168, 85, 247, 0.12)', color: 'var(--purple, #a855f7)' };
      default:
        return { bg: 'var(--bg3)', color: 'var(--tx2)' };
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Trigger Button with ripple animation */}
      <button
        className="btn-ripple ic-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchAllNotifications();
        }}
        title={`Notifications & Reminders (${totalBadgeCount} items)`}
        style={{
          color: totalBadgeCount > 0 ? 'var(--special)' : 'var(--tx2)',
          borderColor: totalBadgeCount > 0 ? 'var(--bd2)' : 'var(--bd)',
        }}
      >
        <Bell size={18} />
        {totalBadgeCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: todayReminders > 0 ? 'var(--er)' : 'var(--special)',
              color: 'var(--light-text)',
              fontSize: 10,
              fontWeight: 800,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--bg2)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {totalBadgeCount > 99 ? '99+' : totalBadgeCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown with slide animation */}
      {isOpen && (
        <div
          className="modal-ov"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reminder-notif-title"
          onClick={() => setIsOpen(false)}
        >
          <div
            ref={dropdownRef}
            className="modal"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
            tabIndex="-1"
          >
            {/* Header */}
            <div className="modal-hd">
              <div className="d-flex align-center gap-3">
                <Bell size={16} color="var(--accent-color)" />
                <h4 id="reminder-notif-title" className="modal-title">
                  Notifications & Reminders
                </h4>
                <button
                  className="modal-x"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Filter Tabs with button animations */}
            <div
              className="d-flex justify-between p-3 px-0 border-b b-er bg-bg3"
            >
              <div className="d-flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'} fs-10 p-2`}
                  aria-pressed={activeTab === 'all'}
                >
                  All <span className="tx2">({totalBadgeCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab('forms')}
                  className={`btn btn-sm ${activeTab === 'forms' ? 'btn-primary' : 'btn-outline'} fs-10 p-2`}
                  aria-pressed={activeTab === 'forms'}
                >
                  📝 Forms <span className="tx2">({formattedForms.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('birthdays')}
                  className={`btn btn-sm ${activeTab === 'birthdays' ? 'btn-primary' : 'btn-outline'} fs-10 p-2`}
                  aria-pressed={activeTab === 'birthdays'}
                >
                  🎂 Birthdays <span className="tx2">({birthdays.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('anniversaries')}
                  className={`btn btn-sm ${activeTab === 'anniversaries' ? 'btn-primary' : 'btn-outline'} fs-10 p-2`}
                  aria-pressed={activeTab === 'anniversaries'}
                >
                  💍 Anniversaries <span className="tx2">({anniversaries.length})</span>
                </button>
              </div>
              <div className="tx2 fs-11 color-tx3">
                {todayReminders > 0 && <span className="b-er">Today: {todayReminders}</span>}
              </div>
            </div>

            {/* Feed List */}
            <div className="flex-1 p-4 overflow-y-auto">
              {loading && displayedList.length === 0 ? (
                <div className="spin-w pt-4 text-center">
                  <div className="spin" />
                </div>
              ) : displayedList.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <p style={{ margin: 0, fontWeight: 600 }}>No items in this section</p>
                  <p style={{ margin: '4px 0 0', fontSize: 11 }}>All notifications are up to date!</p>
                </div>
              ) : (
                displayedList.map((item, idx) => {
                  if (item.itemCategory === 'form') {
                    const styleMeta = getFormColor(item.formType);
                    return (
                      <div
                        key={`form-${item.id || idx}`}
                        className="dash-row card-hover"
                        style={{
                          borderBottom: idx === displayedList.length - 1 ? 'none' : '1px solid var(--bd)',
                          gap: 10,
                        }}
                      >
                        <div className="d-flex align-center gap-3 min-width-0 flex-1">
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: styleMeta.bg,
                              color: styleMeta.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {getFormIcon(item.formType)}
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 13,
                                color: 'var(--tx)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {item.name || item.formTitle}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--tx3)',
                                marginTop: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                flexWrap: 'wrap',
                              }}
                            >
                              <span style={{ fontWeight: 600, color: styleMeta.color }}>
                                {item.formTitle}
                              </span>
                              {item.contact && <span>• 📞 {item.contact}</span>}
                              {item.created_at && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                  • <Clock size={10} /> {formatTimeAgo(item.created_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-4 flex-shrink-0">
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              if (item.link) navigate(item.link);
                            }}
                            className="btn btn-sm btn-outline fs-10 p-1"
                            title="Open in Admin"
                            style={{ borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 2 }}
                          >
                            <span>Open</span>
                            <ChevronRight size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // Reminder Item with badge animation
                  return (
                    <div
                      key={`rem-${item.reminderType}-${item.id || idx}`}
                      className="dash-row card-hover"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 8px',
                        borderBottom: idx === displayedList.length - 1 ? 'none' : '1px solid var(--bd)',
                        gap: 10,
                      }}
                    >
                      <div className="d-flex align-items-center gap-3 min-width-0 flex-1">
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background:
                              item.reminderType === 'birthday'
                                ? 'var(--special-08)'
                                : 'rgba(219, 39, 119, 0.1)',
                            color:
                              item.reminderType === 'birthday' ? 'var(--special)' : '#db2777',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {item.reminderType === 'birthday' ? (
                            <Cake size={15} />
                          ) : (
                            <Heart size={15} />
                          )}
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              color: 'var(--tx)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.name}
                            {item.relationship && item.relationship !== 'Devotee' && (
                              <span style={{ fontSize: 10.5, color: 'var(--tx3)', marginLeft: 4, fontWeight: 400 }}>
                                ({item.relationship})
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 2 }}>
                            {item.reminderType === 'birthday'
                              ? `🎂 ${item.birthday ? new Date(item.birthday).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}`
                              : `💍 ${item.wedding_date ? new Date(item.wedding_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''} ${item.years_married ? `(${item.years_married}y)` : ''}`}
                            {item.type === 'admin' && ' • Admin'}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3 flex-shrink-0">
                        {/* View Details Button */}
                        <button
                          onClick={() => {
                            setSelectedPerson(item);
                          }}
                          className="btn btn-sm btn-outline"
                          title="View Details"
                          style={{ padding: '3px 6px', fontSize: 10, borderRadius: 'var(--r-sm)' }}
                          aria-label={`View details for ${item.name}`}
                        >
                          <Eye size={11} />
                        </button>

                        {/* WhatsApp Wish Button */}
                        {item.contact && (
                          <a
                            href={`https://wa.me/91${item.contact.replace(/\D/g, '')}?text=${
                              item.reminderType === 'birthday'
                                ? `Happy%20Birthday%20${encodeURIComponent(item.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings.`
                                : `Happy%20Wedding%20Anniversary%20${encodeURIComponent(item.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings.`
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                            style={{
                              padding: '3px 6px',
                              fontSize: 10,
                              background: 'var(--whatsapp)',
                              borderColor: 'var(--whatsapp)',
                              borderRadius: 'var(--r-sm)',
                              color: 'var(--light-text)',
                            }}
                            title="Send WhatsApp Wish"
                          >
                            <MessageCircle size={11} />
                          </a>
                        )}

                        <span className={getBadgeClass(item.days_until)} style={{ fontSize: 10, padding: '2px 6px' }}>
                          {getBadgeLabel(item.days_until)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer links */}
            <div
              className="p-3 px-0 border-t b-er bg-bg3 d-flex justify-between align-items-center flex-wrap gap-2"
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin/devotees');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--in)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                Devotee Forms <ChevronRight size={11} />
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin/birthdays');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-color)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                Birthdays <ChevronRight size={11} />
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin/wedding-anniversaries');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--special)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                Anniversaries <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Details Modal for Reminders */}
      {selectedPerson && (
        <div
          className="modal-ov"
          onClick={() => setSelectedPerson(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reminder-detail-title"
        >
          <div
            className="modal"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
            tabIndex="-1"
          >
            {/* Modal Header */}
            <div className="modal-hd">
              <div className="d-flex align-center gap-3">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background:
                      selectedPerson.reminderType === 'birthday'
                        ? 'var(--special-08)'
                        : 'rgba(219, 39, 119, 0.1)',
                    color:
                      selectedPerson.reminderType === 'birthday'
                        ? 'var(--special)'
                        : '#db2777',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {selectedPerson.reminderType === 'birthday' ? (
                    <Cake size={20} />
                  ) : (
                    <Heart size={20} />
                  )}
                </div>
                <div>
                  <h4 id="reminder-detail-title" className="modal-title" style={{ margin: 0 }}>
                    {selectedPerson.name}
                  </h4>
                  <span className="dash-pill in" style={{ fontSize: 11, marginTop: 2 }}>
                    {selectedPerson.source || selectedPerson.role || 'Devotee'}
                  </span>
                </div>

                <button
                  className="modal-x"
                  onClick={() => setSelectedPerson(null)}
                  title="Close"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                {/* Countdown Banner */}
                <div
                  style={{
                    background: 'var(--special-08)',
                    border: '1px solid var(--bd2)',
                    borderRadius: 'var(--r)',
                    padding: 'var(--sp-3) var(--sp-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--sp-4)',
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}
                    >
                      {selectedPerson.reminderType === 'birthday' ? 'Birthday' : 'Wedding Anniversary'}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)' }}>
                      {selectedPerson.birthday || selectedPerson.wedding_date
                        ? new Date(selectedPerson.birthday || selectedPerson.wedding_date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'No date'}
                    </div>
                  </div>
                  <span className={getBadgeClass(selectedPerson.days_until)} style={{ fontSize: 13, padding: '4px 10px' }}>
                    {getBadgeLabel(selectedPerson.days_until)}
                  </span>
                </div>

                {/* Detail Rows */}
                <div
                  style={{
                    background: 'var(--bg3)',
                    borderRadius: 'var(--r)',
                    padding: '0 var(--sp-4)',
                    marginBottom: 'var(--sp-4)',
                    border: '1px solid var(--bd)',
                  }}
                >
                  {selectedPerson.years_married > 0 && (
                    <div className="detail-row">
                      <span className="detail-key">Milestone</span>
                      <span className="detail-val" style={{ color: 'var(--special)' }}>
                        {selectedPerson.years_married} Years Completed
                      </span>
                    </div>
                  )}

                  {selectedPerson.devotee_name && (
                    <div className="detail-row">
                      <span className="detail-key">Devotee / Head</span>
                      <span className="detail-val">{selectedPerson.devotee_name}</span>
                    </div>
                  )}

                  {selectedPerson.relationship && (
                    <div className="detail-row">
                      <span className="detail-key">Relationship</span>
                      <span className="detail-val">{selectedPerson.relationship}</span>
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

                  {selectedPerson.father_name && (
                    <div className="detail-row">
                      <span className="detail-key">Father's Name</span>
                      <span className="detail-val">{selectedPerson.father_name}</span>
                    </div>
                  )}

                  {selectedPerson.mother_name && (
                    <div className="detail-row">
                      <span className="detail-key">Mother's Name</span>
                      <span className="detail-val">{selectedPerson.mother_name}</span>
                    </div>
                  )}

                  {selectedPerson.role && selectedPerson.type === 'admin' && (
                    <div className="detail-row">
                      <span className="detail-key">Admin Role</span>
                      <span className="detail-val">{selectedPerson.role}</span>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div
                  style={{
                    background: 'var(--bg3)',
                    padding: 'var(--sp-3) var(--sp-4)',
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--bd)',
                  }}
                >
                  <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 'var(--sp-2)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                    Contact Information
                  </div>

                  {selectedPerson.contact && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-2)', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 13, color: 'var(--tx)' }}>
                        <Phone size={14} color="var(--in)" />
                        <span>{selectedPerson.contact}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                        <a href={`tel:${selectedPerson.contact}`} className="btn btn-sm btn-outline" style={{ padding: '2px 8px', fontSize: 11 }}>
                          Call
                        </a>
                        <a
                          href={`https://wa.me/91${selectedPerson.contact.replace(/\D/g, '')}?text=${
                            selectedPerson.reminderType === 'birthday'
                              ? `Happy%20Birthday%20${encodeURIComponent(selectedPerson.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings.`
                              : `Happy%20Wedding%20Anniversary%20${encodeURIComponent(selectedPerson.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings.`
                        }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary"
                          style={{ padding: '2px 8px', fontSize: 11, background: 'var(--whatsapp)', borderColor: 'var(--whatsapp)', color: 'var(--light-text)' }}
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedPerson.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 13, marginBottom: 'var(--sp-2)', color: 'var(--tx)' }}>
                      <Mail size={14} color="var(--accent-color)" />
                      <a href={`mailto:${selectedPerson.email}`} style={{ color: 'var(--tx)', textDecoration: 'none' }}>
                        {selectedPerson.email}
                      </a>
                    </div>
                  )}

                  {selectedPerson.postal_address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-2)', fontSize: 12, color: 'var(--tx2)', marginTop: 'var(--sp-2)' }}>
                      <MapPin size={14} color="var(--special)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{selectedPerson.postal_address}</span>
                    </div>
                  )}

                  {selectedPerson.note && (
                    <div style={{ marginTop: 'var(--sp-2)', padding: 'var(--sp-2)', background: 'var(--bg2)', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--tx2)', border: '1px solid var(--bd)' }}>
                      <strong style={{ color: 'var(--tx)' }}>Note:</strong> {selectedPerson.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-ft">
                <button onClick={() => setSelectedPerson(null)} className="btn btn-outline">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderNotification;