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
  Users
} from 'lucide-react';
import adminApi from './adminApi';

const ReminderNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [anniversaries, setAnniversaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, birthdays, anniversaries
  const [selectedPerson, setSelectedPerson] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const [bData, aData] = await Promise.all([
        adminApi.getBirthdays({ days: 7 }).catch(() => ({ birthdays: [] })),
        adminApi.getWeddingAnniversaries({ days: 7 }).catch(() => ({ weddingAnniversaries: [] })),
      ]);

      setBirthdays(bData.birthdays || []);
      setAnniversaries(aData.weddingAnniversaries || []);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchReminders, 5 * 60 * 1000);
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

  // Combine and sort reminders by days_until
  const allReminders = [
    ...birthdays.map((b) => ({ ...b, reminderType: 'birthday' })),
    ...anniversaries.map((a) => ({ ...a, reminderType: 'anniversary' })),
  ].sort((a, b) => a.days_until - b.days_until);

  const displayedList =
    activeTab === 'birthdays'
      ? allReminders.filter((r) => r.reminderType === 'birthday')
      : activeTab === 'anniversaries'
      ? allReminders.filter((r) => r.reminderType === 'anniversary')
      : allReminders;

  const totalCount = allReminders.length;
  const todayCount = allReminders.filter((r) => r.days_until === 0).length;

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

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        className="ic-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchReminders();
        }}
        title={`Reminders (${totalCount} upcoming)`}
        style={{
          color: totalCount > 0 ? 'var(--special)' : 'var(--tx2)',
          borderColor: totalCount > 0 ? 'var(--bd2)' : 'var(--bd)',
        }}
      >
        <Bell size={18} />
        {totalCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: todayCount > 0 ? 'var(--er)' : 'var(--special)',
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
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            background: 'var(--bg2)',
            border: '1px solid var(--bd)',
            borderRadius: 'var(--rx)',
            boxShadow: 'var(--sh-lg)',
            zIndex: 250,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'modalSlide 0.2s var(--ease)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--bd)',
              background: 'var(--bg3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <Bell size={16} color="var(--accent-color)" />
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--tx)' }}>
                Upcoming Reminders
              </span>
              <span className="dash-pill in" style={{ fontSize: 10, padding: '1px 6px' }}>
                {totalCount}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={fetchReminders}
                title="Refresh"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--tx3)',
                  padding: 4,
                  display: 'flex',
                }}
              >
                <RefreshCw size={13} className={loading ? 'spin' : ''} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--tx3)',
                  padding: 4,
                  display: 'flex',
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '8px 12px',
              gap: 6,
              background: 'var(--bg2)',
              borderBottom: '1px solid var(--bd)',
            }}
          >
            <button
              onClick={() => setActiveTab('all')}
              className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: 11, padding: '3px 8px', flex: 1 }}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('birthdays')}
              className={`btn btn-sm ${activeTab === 'birthdays' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: 11, padding: '3px 8px', flex: 1 }}
            >
              🎂 Birthdays ({birthdays.length})
            </button>
            <button
              onClick={() => setActiveTab('anniversaries')}
              className={`btn btn-sm ${activeTab === 'anniversaries' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: 11, padding: '3px 8px', flex: 1 }}
            >
              💍 Anniversaries ({anniversaries.length})
            </button>
          </div>

          {/* Reminders List */}
          <div
            style={{
              maxHeight: 340,
              overflowY: 'auto',
              padding: '6px 12px',
            }}
          >
            {loading && displayedList.length === 0 ? (
              <div className="spin-w" style={{ padding: 'var(--sp-4)', textAlign: 'center' }}>
                <div className="spin" />
              </div>
            ) : displayedList.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--tx3)', fontSize: 13 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>No reminders in the next 7 days</p>
                <p style={{ margin: '4px 0 0', fontSize: 11 }}>All devotees & admins are caught up!</p>
              </div>
            ) : (
              displayedList.map((item, idx) => (
                <div
                  key={`${item.reminderType}-${item.id || idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 8px',
                    borderBottom: idx === displayedList.length - 1 ? 'none' : '1px solid var(--bd)',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    {/* View Button */}
                    <button
                      onClick={() => {
                        setSelectedPerson(item);
                      }}
                      className="btn btn-sm btn-outline"
                      title="View Details"
                      style={{ padding: '3px 6px', fontSize: 10, borderRadius: 'var(--r-sm)' }}
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
              ))
            )}
          </div>

          {/* Footer links */}
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--bd)',
              background: 'var(--bg3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/birthdays');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-color)',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              All Birthdays <ChevronRight size={12} />
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
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              All Anniversaries <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Full Details Modal from Notification */}
      {selectedPerson && (
        <div className="modal-ov" onClick={() => setSelectedPerson(null)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
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
                  }}
                >
                  {selectedPerson.reminderType === 'birthday' ? (
                    <Cake size={20} />
                  ) : (
                    <Heart size={20} />
                  )}
                </div>
                <div>
                  <h4 className="modal-title" style={{ margin: 0 }}>
                    {selectedPerson.name}
                  </h4>
                  <span className="dash-pill in" style={{ fontSize: 11, marginTop: 2 }}>
                    {selectedPerson.source || selectedPerson.role || 'Devotee'}
                  </span>
                </div>
              </div>

              <button className="modal-x" onClick={() => setSelectedPerson(null)} title="Close">
                <X size={20} />
              </button>
            </div>

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
                  <div style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
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
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '0 var(--sp-4)', marginBottom: 'var(--sp-4)', border: '1px solid var(--bd)' }}>
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
              <div style={{ background: 'var(--bg3)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--r)', border: '1px solid var(--bd)' }}>
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

            <div className="modal-ft">
              <button onClick={() => setSelectedPerson(null)} className="btn btn-outline">
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
