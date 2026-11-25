const host = process.env.SUPABASE_URL && new URL(process.env.SUPABASE_URL)
const config = {
  images: { remotePatterns: host ? [{protocol:'https',hostname:host.hostname,port:host.port,pathname:'/storage/v1/object/public/news-thumbnails/**'}] : [] },
  experimental: { serverActions: { bodySizeLimit: '3mb' } }
}

export default config
