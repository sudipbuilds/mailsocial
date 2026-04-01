import type { MetadataRoute } from 'next';

import config from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = config.url;
  const currentDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      priority: 1,
      changeFrequency: 'monthly',
    },
    {
      url: baseUrl + '/signin',
      lastModified: currentDate,
      priority: 1,
      changeFrequency: 'monthly',
    },
    {
      url: baseUrl + '/signup',
      lastModified: currentDate,
      priority: 1,
      changeFrequency: 'monthly',
    },
  ];

  return [...staticPages];
}
