/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://carbonlens-blond.vercel.app',
  generateRobotsTxt: true,
  changefreq: 'monthly',
  priority: 0.7,
  additionalPaths: async () => [
    { loc: '/tw', priority: 0.9 },
    { loc: '/cbam', priority: 0.8 },
    { loc: '/compare', priority: 0.8 },
  ],
};
