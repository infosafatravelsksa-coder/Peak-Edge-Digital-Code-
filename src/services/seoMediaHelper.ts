import { MediaItemRecord } from '../types/cms';

/**
 * Updates Google-compliant Schema.org structured data in <head>
 * so Googlebot and search engine crawlers can read Alt Text, Titles,
 * Captions, and URLs of all media assets.
 */
export function syncMediaToGoogleSchema(mediaItems: MediaItemRecord[]): void {
  if (typeof document === 'undefined') return;

  try {
    let scriptTag = document.getElementById('google-media-schema') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'google-media-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaGraph = mediaItems.map((item) => {
      const isVideo = item.category === 'videos' || item.mimeType.startsWith('video/');
      const isPdf = item.category === 'pdf' || item.mimeType === 'application/pdf';

      if (isVideo) {
        return {
          '@type': 'VideoObject',
          '@id': `${item.storageUrl}#video`,
          name: item.title || item.filename,
          description: item.description || item.altText || item.title || item.filename,
          thumbnailUrl: [item.storageUrl],
          contentUrl: item.storageUrl,
          uploadDate: item.uploadedAt || new Date().toISOString(),
          caption: item.caption || item.altText,
        };
      }

      if (isPdf) {
        return {
          '@type': 'DigitalDocument',
          '@id': `${item.storageUrl}#doc`,
          name: item.title || item.filename,
          description: item.description || item.altText || item.title,
          url: item.storageUrl,
          encodingFormat: 'application/pdf',
          datePublished: item.uploadedAt || new Date().toISOString(),
        };
      }

      // Default: ImageObject (including SVG and Icons)
      return {
        '@type': 'ImageObject',
        '@id': `${item.storageUrl}#image`,
        name: item.title || item.filename,
        caption: item.caption || item.altText || item.title,
        description: item.description || item.altText || item.title,
        contentUrl: item.storageUrl,
        encodingFormat: item.mimeType || 'image/jpeg',
        uploadDate: item.uploadedAt || new Date().toISOString(),
        ...(item.dimensions
          ? {
              width: `${item.dimensions.width} px`,
              height: `${item.dimensions.height} px`,
            }
          : {}),
      };
    });

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': schemaGraph,
    };

    scriptTag.textContent = JSON.stringify(structuredData, null, 2);

    // Also expose catalog globally for cms-live-sync
    (window as any).__orbitMediaCatalog = mediaItems;
  } catch (err) {
    console.warn('Could not sync media to Google Schema:', err);
  }
}
