import { Helmet } from 'react-helmet-async'

function Seo({
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
}) {
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {robots && <meta name="robots" content={robots} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {(ogTitle || title) && <meta property="og:title" content={ogTitle || title} />}
      {(ogDescription || description) && (
        <meta property="og:description" content={ogDescription || description} />
      )}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      {ogType && <meta property="og:type" content={ogType} />}
      {ogLocale && <meta property="og:locale" content={ogLocale} />}

      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      {(twitterTitle || title) && <meta name="twitter:title" content={twitterTitle || title} />}
      {(twitterDescription || description) && (
        <meta name="twitter:description" content={twitterDescription || description} />
      )}
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
    </Helmet>
  )
}

export default Seo
