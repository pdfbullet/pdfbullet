import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import Script from 'next/script';
import { Providers } from '../components/Providers';
import AppShell from '../components/AppShell';
import '../../index.css';
import CanonicalHeader from '../components/CanonicalHeader';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pdf Bullet | Free PDF & Image Tools for Document Management',
  description: "The only PDF toolkit you'll ever need. Pdf Bullet provides a complete suite of free, secure, and fast online tools. Merge, split, compress, convert, edit, and sign PDFs with ease. Client-side processing ensures your files are 100% private.",
  keywords: "pdf bullet, pdf tools, merge pdf, split pdf, compress pdf, convert pdf, pdf editor, image background remover, free pdf tools, online pdf tools, document management, secure pdf processing, pdf to word, word to pdf, edit pdf, sign pdf, ocr pdf, image tools, ai tools, invoice generator, cv generator, remove background",
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pdf Bullet',
  },
  other: {
    'google-site-verification': 'eJAzXMamgbzNgQBnwgOiGSxvk5eMrM8Ah3gMFaW510U',
  }
};

export const viewport: Viewport = {
  themeColor: '#B90B06',
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <CanonicalHeader />
      </head>
      <body className="bg-white dark:bg-black font-sans antialiased">
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>

        {/* Cloud Picker Scripts */}
        <Script src="https://apis.google.com/js/api.js" strategy="lazyOnload" />
        <Script 
          src="https://www.dropbox.com/static/api/2/dropins.js" 
          id="dropboxjs" 
          data-app-key="roteftycciwco5q" 
          strategy="lazyOnload" 
        />
        <Script src="https://js.live.net/v7.2/OneDrive.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
