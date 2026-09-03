import React from 'react';

const CalendarHeader = ({
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onPrevYear,
  onNextYear,
  onYearChange,
  todayYear = new Date().getFullYear(),
  todayMonth = new Date().getMonth(),
  onGoToToday
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years (e.g., todayYear - 4 to todayYear + 4)
  const years = [];
  for (let y = todayYear - 4; y <= todayYear + 4; y++) {
    years.push(y);
  }

  return (
    <div className="calendar-header">
      <div className="header-content-container">
        <h1 id="calendarTitle" tabIndex="-1" onClick={onGoToToday}>
          <i className="fas fa-calendar-alt" aria-hidden="true"></i>
          Jai Varahi Calendar
          <span className="today-hint-text">(Click to go to today)</span>
        </h1>
        <div className="navigation-container">
          <div className="year-navigation-controls">
            <button
              className="navigation-button"
              aria-label="Previous year"
              onClick={onPrevYear}
              disabled={currentYear <= years[0]}
            >
              <i className="fas fa-chevron-left" aria-hidden="true"></i>
            </button>
            <select
              className="year-selector-dropdown"
              aria-label="Select year"
              value={currentYear}
              onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              className="navigation-button"
              aria-label="Next year"
              onClick={onNextYear}
              disabled={currentYear >= years[years.length - 1]}
            >
              <i className="fas fa-chevron-right" aria-hidden="true"></i>
            </button>
          </div>
          <div className="month-navigation-controls">
            <button
              className="navigation-button"
              aria-label="Previous month"
              onClick={onPrevMonth}
              disabled={currentYear === years[0] && currentMonth === 0}
            >
              <i className="fas fa-angle-left" aria-hidden="true"></i>
            </button>
            <div className="current-period-display" aria-live="polite">
              {monthNames[currentMonth]} {currentYear}
            </div>
            <button
              className="navigation-button"
              aria-label="Next month"
              onClick={onNextMonth}
              disabled={currentYear === years[years.length - 1] && currentMonth === 11}
            >
              <i className="fas fa-angle-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
