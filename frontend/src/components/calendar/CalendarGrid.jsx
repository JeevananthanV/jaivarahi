import React from 'react';

const CalendarGrid = ({
  currentYear,
  currentMonth,
  eventsData,
  onDayClick,
  selectedDateStr
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to render a month card
  const renderMonthCard = (monthOffset) => {
    const month = (currentMonth + monthOffset) % 12;
    const year = currentMonth + monthOffset > 11 ? currentYear + 1 : currentYear;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Fill empty cells
    const emptyCells = Array(firstDay).fill(null);
    // Fill day cells
    const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const today = new Date();
    
    return (
      <div className="month-calendar-card" key={`month-${year}-${month}`}>
        <div className="month-title-header">{monthNames[month]} {year}</div>
        <div className="calendar-days-grid">
          <div className="weekday-labels">
            {weekdayNames.map(day => (
              <div className="weekday-label" key={day}>{day}</div>
            ))}
          </div>
          <div className="calendar-days">
            {emptyCells.map((_, index) => (
              <div 
                key={`empty-${index}`} 
                className="calendar-day day-from-other-month" 
                style={{ visibility: 'hidden' }} 
                aria-hidden="true"
              ></div>
            ))}
            {dayCells.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasEvent = !!eventsData[dateStr];
              const eventCategory = hasEvent ? eventsData[dateStr].category.replace(/[\s_]+/g, '-').toLowerCase() : '';
              
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              
              let classes = "calendar-day";
              if (hasEvent) classes += ` event-bg-${eventCategory}`;
              if (isToday) classes += " current-day";

              return (
                <div 
                  key={day}
                  className={classes}
                  role="gridcell"
                  tabIndex={0}
                  aria-label={`${day} ${hasEvent ? eventsData[dateStr].title : 'no events'}`}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => onDayClick(dateStr)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onDayClick(dateStr);
                    }
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="calendar-legend">
        <div className="legend-item-container"><div className="legend-color-indicator" style={{backgroundColor: 'var(--amavasai-color)'}}></div><span>Amavasai</span></div>
        <div className="legend-item-container"><div className="legend-color-indicator" style={{backgroundColor: 'var(--pournami-color)'}}></div><span>Pournami</span></div>
        <div className="legend-item-container"><div className="legend-color-indicator" style={{backgroundColor: 'var(--valarpirai-panchami-color)'}}></div><span>Valarpirai Panchami</span></div>
        <div className="legend-item-container"><div className="legend-color-indicator" style={{backgroundColor: 'var(--theipirai-panchami-color)'}}></div><span>Theipirai Panchami</span></div>
        <div className="legend-item-container"><div className="legend-color-indicator" style={{backgroundColor: 'var(--valarpirai-ashtami-color)'}}></div><span>Valarpirai Ashtami</span></div>
        <div className="legend-item-container"><div className="legend-color-indicator" style={{backgroundColor: 'var(--theipirai-ashtami-color)'}}></div><span>Theipirai Ashtami</span></div>
        <div className="legend-item-container"><div className="legend-color-indicator" style={{backgroundColor: 'var(--nakshatra-homam-color)'}}></div><span>Nakshatra & Homam</span></div>
        <div className="legend-item-container"><div className="legend-color-indicator" style={{backgroundColor: 'var(--special-color)'}}></div><span>Special</span></div>
      </div>

      <div className="calendar-grid-container" role="grid" aria-label="Calendar grid">
        {[0, 1, 2, 3].map(offset => renderMonthCard(offset))}
      </div>
    </>
  );
};

export default CalendarGrid;
