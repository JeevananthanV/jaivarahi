import { useState } from 'react';

function Schedule() {
  const [activeIndex, setActiveIndex] = useState(0);

  const scheduleItems = [
    {
      day: '13',
      month: 'July',
      weekday: 'Monday',
      tithi: 'Amavasya',
      ritual: 'Maha Ganapathy Homam',
      detail: 'Invokes Lord Ganesha for obstacle removal, auspicious beginnings, and smooth completion of the sacred observances.',
      purpose: 'Removal of obstacles.',
      benefits: 'Success in all endeavors and smooth beginning of the mahotsavam.',
    },
    {
      day: '14',
      month: 'July',
      weekday: 'Tuesday',
      tithi: 'Prathama',
      ritual: 'Sri Laghu Varahi Homam',
      detail: 'A gentle offering dedicated to Sri Varahi for protection, clarity, and steady divine support.',
      purpose: 'Divine protection.',
      benefits: 'Protection from negativity, warding off troubles, and mental peace.',
    },
    {
      day: '15',
      month: 'July',
      weekday: 'Wednesday',
      tithi: 'Dwitiya',
      ritual: 'Sri Swapna Varahi Homam',
      detail: 'Performed to receive divine guidance through dreams, inner wisdom, and spiritual reassurance from the Goddess.',
      purpose: 'Receiving divine guidance.',
      benefits: 'Clarity in thoughts, wisdom through dreams, and removal of doubts.',
    },
    {
      day: '16',
      month: 'July',
      weekday: 'Thursday',
      tithi: 'Tritiya',
      ritual: 'Sri Aadhi Varahi Homam',
      detail: "A core protective ritual seeking Sri Varahi Amman's strength for health, stability, and courage.",
      purpose: 'Health, stability, and courage.',
      benefits: 'Physical strength, career stability, and courage to face life struggles.',
    },
    {
      day: '17',
      month: 'July',
      weekday: 'Friday',
      tithi: 'Chaturthi',
      ritual: 'Sri Maha Varahi Homam',
      detail: 'A grand homam invoking the fierce grace of Sri Varahi for victory over negativity and life obstacles.',
      purpose: 'Victory over life obstacles and negativity.',
      benefits: 'Triumph over enemies, settlement of debts, and legal success.',
    },
    {
      day: '18',
      month: 'July',
      weekday: 'Saturday',
      tithi: 'Panchami',
      ritual: 'Sri Panchami Varahi Homam',
      detail: 'Dedicated to abundance, family well-being, and the steady increase of divine blessings in the home.',
      purpose: 'Family well-being and abundance.',
      benefits: 'Wealth, prosperity, home harmony, and business growth.',
    },
    {
      day: '19',
      month: 'July',
      weekday: 'Sunday',
      tithi: 'Shashti',
      ritual: 'Sri Agni Varahi Homam',
      detail: 'A fiery offering meant to purify the mind, remove karmic burdens, and energize spiritual progress.',
      purpose: 'Purification of mind and karma.',
      benefits: 'Warding off bad karma, cleansing of thoughts, and inner strength.',
    },
    {
      day: '20',
      month: 'July',
      weekday: 'Monday',
      tithi: 'Saptami',
      ritual: 'Sri Astra Varahi Homam',
      detail: 'Asks for divine shielding and protection from harmful influences through the sacred power of Varahi.',
      purpose: 'Divine shielding.',
      benefits: 'Shield against negative energies and protection of children and family.',
    },
    {
      day: '21',
      month: 'July',
      weekday: 'Tuesday',
      tithi: 'Ashtami',
      ritual: 'Sri Dhoomra Varahi Homam',
      detail: 'A deep protective ritual associated with dissolving fear, confusion, and hidden negativity.',
      purpose: 'Dissolving fear and confusion.',
      benefits: 'Mental clarity, relief from anxieties, and elimination of hidden obstacles.',
    },
    {
      day: '22',
      month: 'July',
      weekday: 'Wednesday',
      tithi: 'Navami',
      ritual: 'Sri Ashwarudha Varahi Homam',
      detail: 'Seeks momentum, triumph, and forward movement in work, family, and spiritual life.',
      purpose: 'Momentum and triumph in life.',
      benefits: 'Career advancement, leadership success, and overcoming stagnation.',
    },
    {
      day: '23',
      month: 'July',
      weekday: 'Thursday',
      tithi: 'Dashami',
      ritual: 'Sri Sampathkari Varahi Homam',
      detail: 'The final homam of the festival, offered for prosperity, completion, and auspicious fulfillment.',
      purpose: 'Prosperity and final completion.',
      benefits: 'Ultimate blessings, spiritual fulfillment, wealth, and overall success.',
      note: 'Grand Completion Ceremony',
    },
  ];

  return (
    <section id="ashada-schedule" className="anv-schedule anv-schedule--rail">
      <div className="anv-schedule__shell">
        <div className="anv-schedule__hero">
          <p className="anv-schedule__eyebrow">Eleven Nights of Varahi Shakti Blessings</p>
          <h3 className="anv-schedule__heading">Aashada Navarathri 2026 Schedule</h3>
          <div className="anv-schedule__meta">
            <span><i className="fa-regular fa-calendar"></i> 13-23 July 2026</span>
            <span><i className="fa-regular fa-clock"></i> 12:30 PM Daily</span>
            <span><i className="fa-solid fa-location-dot"></i> Jai Varahi Peedam</span>
          </div>
        </div>

        <div className="anv-schedule__rail">
          {scheduleItems.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <article
                key={index}
                className={`anv-schedule__row ${item.note ? 'anv-schedule__row--final' : ''} ${isActive ? 'is-active' : ''}`}
              >
                <div className="anv-schedule__stamp">
                  <span className="anv-schedule__stamp-day">{item.day}</span>
                  <span className="anv-schedule__stamp-month">{item.month}</span>
                  <span className="anv-schedule__stamp-weekday">{item.weekday}</span>
                </div>
                <div className="anv-schedule__body">
                  <button
                    type="button"
                    className="anv-schedule__body-trigger"
                    onClick={() => setActiveIndex(isActive ? null : index)}
                    aria-expanded={isActive}
                    aria-controls={`anv-schedule-detail-${index}`}
                  >
                    <div className="anv-schedule__topline">
                      <span className="anv-schedule__tag">{item.tithi}</span>
                      {item.note && <span className="anv-schedule__highlight">Grand Finale</span>}
                    </div>
                    <span className="anv-schedule__ritual">{item.ritual}</span>
                  </button>
                  <div
                    id={`anv-schedule-detail-${index}`}
                    className={`anv-schedule__detail ${isActive ? 'is-visible' : ''}`}
                  >
                    <p className="anv-schedule__detail-desc">{item.detail}</p>
                    <div className="anv-schedule__info-grid">
                      <div className="anv-schedule__info-item">
                        <span className="anv-schedule__info-label">Purpose:</span>
                        <span className="anv-schedule__info-value">{item.purpose}</span>
                      </div>
                      <div className="anv-schedule__info-item">
                        <span className="anv-schedule__info-label">Benefits:</span>
                        <span className="anv-schedule__info-value">{item.benefits}</span>
                      </div>
                    </div>
                  </div>
                  {item.note && (
                    <p className="anv-schedule__note">
                      <i className="fa-solid fa-star"></i> {item.note}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Schedule;
