import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable the skeletal marker transform during analysis
  // Usage: SKELETAL_ANALYZE=1 next dev
  webpack: (config) => {
    if (process.env['SKELETAL_ANALYZE'] === '1') {
      // The skeletalNextTransform is applied via custom loader
      // See: skeletal/next docs
    }
    return config
  },
}

export default nextConfig
