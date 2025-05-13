import React from 'react';
import { Helmet } from 'react-helmet-async';

// App-wide SEO keywords that reflect the core functionality and value proposition
const CORE_KEYWORDS = [
  'emotion tracking',
  'mood journal',
  'emotional intelligence',
  'mental wellness',
  'emotional health',
  'mood patterns',
  'feeling tracker',
  'emotional support network',
  'mood analytics',
  'emotional wellbeing',
  'sentiment analysis',
  'emotional NFTs',
  'emotion-based social network',
  'mental health community',
  'emotion recognition',
  'sentiment tracking',
  'emotional milestone rewards',
  'personalized mood insights',
  'psychological well-being',
  'mental health app',
  'emotion AI platform',
  'real-time emotion tracking',
  'emotional awareness tools',
  'digital mental wellness',
  'emotion sharing community'
];

export interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogUrl?: string;
  canonicalUrl?: string;
  pageType?: 'website' | 'article' | 'profile' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  twitterHandle?: string;
  noindex?: boolean;
  structuredData?: object;
  language?: string;
  locale?: string;
  alternateUrls?: {[key: string]: string};
  ratingValue?: number;
  reviewCount?: number;
  priceRange?: string;
}

/**
 * SEOHead - A reusable SEO component that injects appropriate metadata
 * into the document head for improved search engine visibility.
 */
export const SEOHead: React.FC<SeoProps> = ({
  title = 'MoodSync - #1 Emotion-Driven Social Network',
  description = 'Connect authentically through shared emotions on MoodSync. Track your moods, earn rewards, and build meaningful relationships based on emotional understanding.',
  keywords = [],
  ogImage = '/moodlync-logo-new.jpg',
  ogUrl,
  canonicalUrl,
  pageType = 'website',
  publishedTime,
  modifiedTime,
  author = 'MoodSync Team',
  twitterHandle = '@moodsync',
  noindex = false,
  structuredData,
  language = 'en',
  locale = 'en_US',
  alternateUrls,
  ratingValue,
  reviewCount,
  priceRange
}) => {
  // Combine provided keywords with core keywords and remove duplicates
  // Create a combined array first and then filter out duplicates
  const combinedKeywords = [...keywords, ...CORE_KEYWORDS];
  const uniqueKeywords = combinedKeywords.filter((value, index, self) => 
    self.indexOf(value) === index
  );
  const allKeywords = uniqueKeywords.join(', ');
  
  // Determine canonical URL from window if not provided
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const defaultCanonical = `${siteUrl}${path}`;
  
  // Default structured data for the organization
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MoodSync',
    description: 'An emotion-driven social network connecting people through shared emotional experiences',
    url: siteUrl,
    logo: `${siteUrl}/moodlync-logo-new.jpg`,
    sameAs: [
      'https://twitter.com/moodsync',
      'https://facebook.com/moodsync',
      'https://instagram.com/moodsync'
    ]
  };

  // Prepare product structured data if applicable
  const productStructuredData = pageType === 'product' && ratingValue && reviewCount ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title.split('|')[0].trim(),
    description: description,
    image: ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`,
    offers: {
      '@type': 'Offer',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceType: 'https://schema.org/PriceSpecification',
        priceCurrency: 'USD'
      },
      priceRange: priceRange || '$0 - $49.99',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      reviewCount: reviewCount
    }
  } : null;
  
  return (
    <Helmet>
      {/* Basic Metadata */}
      <html lang={language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#6366F1" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl || defaultCanonical} />
      
      {/* Language and Localization */}
      <meta property="og:locale" content={locale} />
      {alternateUrls && Object.entries(alternateUrls).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={pageType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="MoodSync" />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}
      <meta name="twitter:site" content="@moodsync" />
      
      {/* Article-specific metadata */}
      {pageType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {pageType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {pageType === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || (productStructuredData || defaultStructuredData))}
      </script>
      
      {/* Additional <head> elements can be passed as children */}
    </Helmet>
  );
};

export default SEOHead;