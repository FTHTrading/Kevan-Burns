import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://troptionsunity.com';
  const now = new Date().toISOString();

  const staticRoutes = [
    '',
    '/pricing',
    '/how-it-works',
    '/blog',
    '/norcross-ga',
    '/gwinnett-county',
    '/atlanta-crypto-estate',
    '/onboard',
    '/vault-explained',
    '/features',
    '/partners',
    '/compare',
  ];

  return staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/pricing' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route.includes('pricing') || route.includes('norcross') ? 0.9 : 0.7,
  }));
}
