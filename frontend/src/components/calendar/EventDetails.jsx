import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PrasadhamForm from '../forms/PrasadhamForm.jsx';

const EventDetails = ({
  selectedDateStr,
  eventsData,
  loading,
  error
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const socialMediaLinks = {
    facebook: "https://www.facebook.com/PallurVarahiDhasan",
    instagram: "https://www.instagram.com/jai_varahi_peedam",
    youtube: "https://www.youtube.com/@kottaivarahiTV"
  };

  if (!selectedDateStr) {
    return (
      <div className="event-details-panel" id="eventPanel" aria-live="polite">
        <h2>Event Details</h2>
        <div id="eventDetails">
          <div className="no-events-message">Select a date to view events</div>
        </div>
        <div className="data-status-indicator">
          <div className={`status-indicator-dot ${error ? 'error' : ''}`}></div>
          <span id="statusText">{loading ? 'Loading calendar data...' : error ? `Error: ${error}` : 'Calendar data loaded'}</span>
        </div>
      </div>
    );
  }

  const [year, month, day] = selectedDateStr.split('-').map(Number);
  const formattedDate = `${monthNames[month - 1]} ${day}, ${year}`;
  
  const event = eventsData[selectedDateStr];
  const fallbackTitle = 'General Booking';

  const isSpecialDay = (title = '') => {
    const keywordSource = title.toLowerCase();
    const keywords = [
      'amavasya',
      'amavasai',
      'pournami',
      'purnima',
      'panchami',
      'ashtami',
      'navarathiri',
      'navaratri',
      'homam',
      'pooja',
      'puja',
      'festival',
      'special',
      'utsavam'
    ];
    return keywords.some((word) => keywordSource.includes(word));
  };
  
  return (
    <div className="event-details-panel" id="eventPanel" aria-live="polite">
      <h2>Event Details</h2>
      <div id="eventDetails">
        <div className="selected-event-date">{formattedDate}</div>
        <div className="events-list-container">
          {event ? (
            (() => {
              const eventDate = new Date(selectedDateStr);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = eventDate < today;
              const eventTypeClass = isPast ? 'past-event' : 'future-event';
              const badgeText = isPast ? 'Past Event' : 'Future Event';
              
              const sanitizedCategory = event.category.replace(/[\s_]+/g, '-').toLowerCase();
              const showBookButton = isSpecialDay(event.title) && !isPast;

              const currentSocialLinks = event.socialMedia || socialMediaLinks;

              return (
                <div className={`event-card ${eventTypeClass} ${sanitizedCategory}-event`}>
                  <div className={`event-category-badge ${isPast ? 'past-event-badge' : 'future-event-badge'} ${sanitizedCategory}-event-badge`}>
                    {badgeText}
                  </div>
                  <div className="event-name-title">{event.title}</div>
                  <div className="event-details-text">{event.descriptionEnglish}</div>
                  <div className="event-details-tamil-text">{event.descriptionTamil}</div>
                  
                  {event.time && (
                    <div className="event-metadata">
                      <div><i className="far fa-clock" aria-hidden="true"></i> {event.time}</div>
                    </div>
                  )}

                  <div className="event-social-links">
                    {Object.entries(currentSocialLinks).map(([platform, url]) => (
                      <a 
                        key={platform}
                        href={url} 
                        className="social-media-link" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label={platform}
                      >
                        <i className={`fab fa-${platform}`} aria-hidden="true"></i>
                      </a>
                    ))}
                  </div>

                  {showBookButton && (
                    <div className="event-cta">
                      <Link
                        to="/book-pooja"
                        state={{ eventTitle: event.title }}
                        className="event-cta__button"
                      >
                        Book Pooja
                      </Link>
                      <Link to="/services" className="event-cta__button event-cta__button--secondary">
                        View Services
                      </Link>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="no-events-message">
              <p>No events scheduled for this date</p>
              <div className="event-cta">
                <Link
                  to="/book-pooja"
                  state={{ eventTitle: fallbackTitle }}
                  className="event-cta__button"
                >
                  Book Pooja
                </Link>
                <Link to="/services" className="event-cta__button event-cta__button--secondary">
                  View Services
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="data-status-indicator">
        <div className={`status-indicator-dot ${error ? 'error' : ''}`}></div>
        <span id="statusText">{loading ? 'Loading calendar data...' : error ? `Error: ${error}` : 'Calendar data loaded'}</span>
      </div>
    </div>
  );
};

export default EventDetails;
