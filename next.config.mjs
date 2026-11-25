const host = process.env.SUPABASE_URL && new URL(process.env.SUPABASE_URL)
const config = {
  images: { remotePatterns: host ? [{protocol:'https',hostname:host.hostname,port:host.port,pathname:'/storage/v1/object/public/news-thumbnails/**'}] : [] },
  async rewrites() {
    return [
      { source: '/', destination: '/reader/index.html' },
      { source: '/article/:id(\\d+)', destination: '/reader/index.html' },
      { source: '/district/:id', destination: '/reader/index.html' },
      { source: '/live/:id', destination: '/reader/index.html' }
    ]
  },
  experimental: { serverActions: { bodySizeLimit: '3mb' } }
}

export default config
