import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: 'Bangla24 News | বাংলা সংবাদ',
    template: '%s | Bangla24 News'
  },
  description: 'দেশের কথা, মানুষের কথা।'
};
export const dynamic = 'force-dynamic';
export default function Root({
  children
}: {
  children: React.ReactNode;
}) {
  return <html lang="bn">
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </head>
    <body className="font-sans">
      {children}
    </body>
  </html>;
}
