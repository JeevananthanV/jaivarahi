import React, { useState } from 'react';

const DEFAULT_FAQS = [
  {
    q: 'What is Kosala (Goshala) and what is the purpose of donations at Jai Varahi Peedam?',
    a: 'Kosala is the sacred cow shelter maintained at Sri Kottai Varahi Amman Temple (Jai Varahi Peedam), Katpadi, Vellore. Donations provide lifelong care, nutritious green fodder, fresh water, regular veterinary doctor visits, shelter sanitation, and daily Go Pooja rituals. Contributions ensure that every protected cow is treated with reverence throughout her life.'
  },
  {
    q: 'Can I download an official receipt for my Kosala donation?',
    a: 'Yes. Every donation verified through Razorpay immediately provides an official downloadable PDF receipt featuring the temple emblem, donor name, contribution amount, purpose, transaction ID, and a verification QR code. You can also re-download your receipt anytime from the Public Donation Archive using your reference ID.'
  },
  {
    q: 'Can I make my donation anonymous on the public transparency archive?',
    a: 'Yes. You can toggle the "Make donation anonymous" option on the donation form. Your contribution will appear in the Public Transparency Ledger as "Anonymous Sevarthi (அநாமதேய கோசேவர்த்தி)" to respect your privacy while ensuring total financial accountability.'
  },
  {
    q: 'How can I donate an actual live cow to the temple?',
    a: 'To donate an actual milk cow or calf, you can reach out directly to the temple office at +91 90928 78389 or visit Sri Kottai Varahi Amman Temple, Arumparuthi, Katpadi, Vellore. Our administration coordinates medical screening, healthy arrival, and permanent stall allotment.'
  }
];

const KosalaFAQ = ({ faqs = DEFAULT_FAQS }) => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="kosala-faq-section">
      <div className="site-container">
        <div className="section-header-centered">
          <span className="section-tag">ஆன்மீக மகிமை மற்றும் சந்தேகங்கள்</span>
          <h2 className="section-heading">Frequently Asked Questions</h2>
          <p className="section-desc">
            Understand the spiritual blessings of Go Seva and answers regarding donation usage and receipts.
          </p>
        </div>

        <div className="faq-container-narrow">
          {faqs.map((faq, idx) => (
            <div className="faq-card-item" key={idx}>
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                aria-expanded={openFaq === idx}
              >
                <span>{faq.q}</span>
                <i className={`fas fa-chevron-${openFaq === idx ? 'up' : 'down'} faq-chevron-icon`}></i>
              </button>
              {openFaq === idx && (
                <div className="faq-answer-content">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KosalaFAQ;
