import createNextIntlPlugin from 'next-intl/plugin';
import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url';

// Validate the environment variables
const jiti = createJiti(fileURLToPath(import.meta.url));
await jiti.import('./src/env')


const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  /* config options here */
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};


export default withNextIntl(nextConfig);
