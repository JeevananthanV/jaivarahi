import { useState } from 'react'
import { Helmet } from 'react-helmet-async'

/**
 * FaqSection — Reusable FAQ component with AEO & GEO structured data.
 *
 * AEO: Renders FAQPage JSON-LD so search engines can surface individual
 *      questions as rich results and featured snippets.
 *
 * GEO: Uses fullAnswer text for visible content so generative AI models
 *      have comprehensive, authoritative content to cite.
 *
 * @param {object} props
 * @param {array}  props.faqs      - Array of {q, a, fullAnswer, category}
 * @param {string} props.title      - Section heading
 * @param {string} props.subtitle   - Optional subheading
 * @param {string} props.schemaId   - Optional unique ID for the FAQPage schema
 */
function FaqSection({ faqs, title = 'Frequently Asked Questions', subtitle, schemaId }) {
  const [activeIndex, setActiveIndex] = useState(null)

  // ── FAQPage JSON-LD structured data for AEO ──
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faqs || []).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.fullAnswer || f.a || '',
      },
    })),
  }

  if (!faqs || faqs.length === 0) return null

  return (
    <>
      <Helmet>
        <script
          type="application/ld+json"
          id={schemaId}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Helmet>

      <section className="faq-section" aria-label="Frequently Asked Questions">
        <div className="svc-container">
          <div className="text-center m-b40">
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && <p className="svc-spec-label text-center">{subtitle}</p>}
          </div>

          <div className="svc-faq-wrapper">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <h3
                  className="faq-title"
                  onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                  style={{ cursor: 'pointer', transition: 'color 0.3s ease' }}
                >
                  <span>{faq.q}</span>
                  <span>{activeIndex === i ? '−' : '+'}</span>
                </h3>
                <div
                  className={`faq-content ${activeIndex === i ? 'open' : ''}`}
                  style={{
                    maxHeight: activeIndex === i ? '500px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-out',
                    color: '#94a3b8',
                    fontSize: '14px',
                    lineHeight: '1.6',
                  }}
                >
                  {faq.fullAnswer || faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default FaqSection
