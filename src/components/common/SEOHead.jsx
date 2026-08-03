import { useEffect } from 'react';

function upsertMetaByName(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export default function SEOHead({ title, description, canonicalPath = '/' }) {
  useEffect(() => {
    document.title = title;
    upsertMetaByName('description', description);
    upsertCanonical(`https://cgj563.com${canonicalPath}`);
  }, [title, description, canonicalPath]);

  return null;
}
