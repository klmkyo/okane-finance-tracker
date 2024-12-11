import createNextIntlPlugin from 'next-intl/plugin';
import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url';

// Validate the environment variables
const jiti = createJiti(fileURLToPath(import.meta.url));
await jiti.import('./src/env')


const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  /* config options here */
};


export default withNextIntl(nextConfig);

