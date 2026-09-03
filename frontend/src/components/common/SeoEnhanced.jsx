import { Helmet } from 'react-helmet-async'

/**
 * SeoEnhanced — Extended SEO component supporting AEO (Answer Engine Optimization)
 * and GEO (Generative Engine Optimization).
 *
 * AEO features:
 *   - FAQPage JSON-LD structured data (surfaces in featured snippets & PAA)
 *   - HowTo JSON-LD structured data (step-by-step rich results)
 *   - QAPage support for community Q&A
 *   - Featured snippet optimization via structured FAQ content
 *
 * GEO features:
 *   - E-E-A-T author markup (Experience, Expertise, Authoritativeness, Trustworthiness)
 *   - Comprehensive structured data for generative AI citation
 *   - GEO-optimized meta descriptions with natural language queries
 *
 * @param {object} props
 * @param {string} props.title          - Page title
 * @param {string} props.description    - Meta description (concise for SERP)
 * @param {string} props.canonical      - Canonical URL
 * @param {string} props.robots         - Robots meta tag content
 * @param {string} props.ogTitle        - Open Graph title
 * @param {string} props.ogDescription  - Open Graph description
 * @param {string} props.ogImage        - Open Graph image URL
 * @param {string} props.ogUrl          - Open Graph URL
 * @param {string} props.ogType         - Open Graph type (default: website)
 * @param {string} props.ogLocale       - Open Graph locale (default: en_US)
 * @param {string} props.twitterCard      - Twitter card type
 * @param {string} props.twitterTitle   - Twitter title
 * @param {string} props.twitterDescription - Twitter description
 * @param {string} props.twitterImage   - Twitter image URL
 * @param {string} props.keywords       - Meta keywords
 * @param {array}  props.faqs           - Array of {q, a} for FAQPage schema
 * @param {object} props.howTo          - HowTo object {name, description, totalTime, tool, step[]}
 * @param {object} props.author         - E-E-A-T author info {name, url, sameAs, jobTitle, description}
 * @param {object} props.organization    - Organization info (defaults to Jai Varahi Peedam)
 * @param {boolean} props.noindex        - If true, adds noindex meta tag
 */
function SeoEnhanced({
  title,
  description,
  canonical,
  robots,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = 'website',
  ogLocale = 'en_US',
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  keywords,
  faqs,
  howTo,
  author,
  organization,
  noindex,
}) {
  // ── Default organization data (Jai Varahi Peedam) ──
  const orgData = organization || {
    name: 'Jai Varahi Peedam',
    url: 'https://www.jaivarahi.org/',
    logo: 'https://www.jaivarahi.org/assets/img/images_new/VARAHI%20LOGO.svg',
    sameAs: [
      'https://www.facebook.com/PallurVarahiDhasan',
      'https://www.instagram.com/jai_varahi_peedam',
      'https://www.youtube.com/@kottaivarahiTV',
    ],
    address: {
      streetAddress: 'Sri Kottai Varahi Amman Temple Street, Arumparuthi',
      addressLocality: 'Katpadi',
      addressRegion: 'Tamil Nadu',
      postalCode: '632106',
      addressCountry: 'IN',
    },
    telephone: '+91-9092878389',
    email: 'varahikottai@gmail.com',
  }

  // ── Build FAQPage JSON-LD ──
  const faqSchema = faqs && faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a || f.fullAnswer || '',
          },
        })),
      }
    : null

  // ── Build HowTo JSON-LD ──
  const howToSchema = howTo
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: howTo.name,
        description: howTo.description,
        totalTime: howTo.totalTime || undefined,
        tool: howTo.tool || undefined,
        step: howTo.step.map((s, i) => ({
          '@type': 'HowToStep',
          name: s.name,
          text: s.text,
          url: s.url,
          image: s.image || undefined,
          position: s.position || i + 1,
        })),
      }
    : null

  // ── Build Person E-E-A-T schema ──
  const personSchema = author
    ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: author.name,
        url: author.url,
        sameAs: author.sameAs || [],
        jobTitle: author.jobTitle,
        description: author.description,
      }
    : null

  // ── Build Article schema with author (for GEO citation) ──
  const articleSchema = author && title
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: description,
        author: {
          '@type': 'Person',
          name: author.name,
          url: author.url,
          jobTitle: author.jobTitle,
        },
        publisher: {
          '@type': 'Organization',
          name: orgData.name,
          logo: {
            '@type': 'ImageObject',
            url: orgData.logo,
          },
        },
        datePublished: author.datePublished || new Date().toISOString().split('T')[0],
        dateModified: author.dateModified || new Date().toISOString().split('T')[0],
      }
    : null

  // ── Build Website schema with search action ──
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: orgData.name,
    url: orgData.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.jaivarahi.org/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    sameAs: orgData.sameAs,
  }

  // ── Assemble JSON-LD scripts ──
  const jsonLdScripts = [
    websiteSchema,
    orgData,
    faqSchema,
    howToSchema,
    personSchema,
    articleSchema,
  ].filter(Boolean)

  const robotsContent = noindex
    ? 'noindex, nofollow'
    : (robots || 'index, follow')

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      {(ogTitle || title) && <meta property="og:title" content={ogTitle || title} />}
      {(ogDescription || description) && <meta property="og:description" content={ogDescription || description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:alt" content={ogTitle || title || 'Jai Varahi Peedam'} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      {ogType && <meta property="og:type" content={ogType} />}
      {ogLocale && <meta property="og:locale" content={ogLocale} />}
      <meta property="og:site_name" content={orgData.name} />

      {/* Twitter Card */}
      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      {(twitterTitle || title) && <meta name="twitter:title" content={twitterTitle || title} />}
      {(twitterDescription || description) && <meta name="twitter:description" content={twitterDescription || description} />}
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}

      {/* GEO: Additional meta tags for generative engine optimization */}
      <meta name="geo.region" content="IN-Tamil%20Nadu" />
      <meta name="geo.placename" content="Vellore" />
      <meta name="geo.position" content="12.6167;78.8428" />
      <meta name="ICBM" content="12.6167, 78.8428" />

      {/* Structured Data (JSON-LD) for AEO & GEO */}
      {jsonLdScripts.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Helmet>
  )
}

export default SeoEnhanced
