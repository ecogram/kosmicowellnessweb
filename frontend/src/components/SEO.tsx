import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  noindex?: boolean;
  schema?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = 'Sweet Monk — 100% Natural Monk Fruit Sweetener Drops | Kosmico Wellness';
const DEFAULT_DESCRIPTION =
  'Sweet Monk by Kosmico Wellness: 100% Natural Zero-Calorie Monk Fruit Sweetener Drops. Pure monk fruit extract with zero sugar, zero carbs, and zero glycemic index. Ideal for diabetes care, keto, and healthy living.';
const DEFAULT_KEYWORDS =
  'Sweet Monk, sweet monk fruit, sweet monk sweetener, sweet monk drops, buy sweet monk online, sweet monk price in india, monk fruits, monk fruits sweetener, Kosmico Wellness, monk fruit sweetener, zero calorie drops, natural sugar substitute, keto sweetener, diabetes friendly sweetener, liquid sweetener India';
const DEFAULT_IMAGE = 'https://www.kosmicowellness.com/kosmico-logo.png';
const BASE_URL = 'https://www.kosmicowellness.com';

function updateOrCreateMeta(name: string, content: string, isProperty = false) {
  const attribute = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function updateOrCreateCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  schema,
}) => {
  const location = useLocation();

  const finalTitle = title ? `${title}` : DEFAULT_TITLE;
  const currentPath = location.pathname.endsWith('/') && location.pathname !== '/'
    ? location.pathname.slice(0, -1)
    : location.pathname;
  const resolvedCanonical = canonicalUrl || `${BASE_URL}${currentPath}`;

  useEffect(() => {
    // 1. Title
    document.title = finalTitle;

    // 2. Canonical URL
    updateOrCreateCanonical(resolvedCanonical);

    // 3. Robots directive
    const robotsContent = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    updateOrCreateMeta('robots', robotsContent);
    updateOrCreateMeta('googlebot', robotsContent);

    // 4. Primary Meta Tags
    updateOrCreateMeta('description', description);
    if (keywords) {
      updateOrCreateMeta('keywords', keywords);
    }

    // 5. Open Graph Meta Tags
    updateOrCreateMeta('og:title', finalTitle, true);
    updateOrCreateMeta('og:description', description, true);
    updateOrCreateMeta('og:url', resolvedCanonical, true);
    updateOrCreateMeta('og:type', ogType, true);
    updateOrCreateMeta('og:image', ogImage, true);
    updateOrCreateMeta('og:site_name', 'Kosmico Wellness', true);

    // 6. Twitter Card Meta Tags
    updateOrCreateMeta('twitter:card', 'summary_large_image');
    updateOrCreateMeta('twitter:title', finalTitle);
    updateOrCreateMeta('twitter:description', description);
    updateOrCreateMeta('twitter:image', ogImage);

    // 7. Dynamic JSON-LD Structured Data
    const schemaScriptId = 'kosmico-page-schema-ld';
    let schemaEl = document.getElementById(schemaScriptId) as HTMLScriptElement | null;

    if (schema) {
      if (!schemaEl) {
        schemaEl = document.createElement('script');
        schemaEl.id = schemaScriptId;
        schemaEl.type = 'application/ld+json';
        document.head.appendChild(schemaEl);
      }
      schemaEl.textContent = JSON.stringify(
        Array.isArray(schema)
          ? { '@context': 'https://schema.org', '@graph': schema }
          : { '@context': 'https://schema.org', ...schema }
      );
    } else if (schemaEl) {
      schemaEl.remove();
    }

    return () => {
      // Clean up dynamic page-level schema on unmount to prevent leaks
      const el = document.getElementById(schemaScriptId);
      if (el) el.remove();
    };
  }, [finalTitle, description, keywords, resolvedCanonical, ogType, ogImage, noindex, schema]);

  return null;
};
