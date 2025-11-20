import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Site configuration
const siteConfig = {
  name: 'FinTrack',
  description: 'Your intelligent financial management platform. Track expenses, analyze spending patterns, and make informed financial decisions with ease.',
  url: 'https://fintrack-liart.vercel.app',
  ogImage: 'https://fintrack-liart.vercel.app/og-image.png',
  keywords: [
    'finance management',
    'expense tracker',
    'budget planner',
    'financial analytics',
    'money management',
    'personal finance',
    'spending tracker',
    'financial dashboard',
    'CSV import',
    'transaction tracking'
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'FinTrack - Smart Financial Management Platform',
    template: '%s | FinTrack'
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: 'FinTrack Team',
      url: siteConfig.url,
    }
  ],
  creator: 'FinTrack',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: 'FinTrack - Smart Financial Management Platform',
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'FinTrack - Financial Management Dashboard',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinTrack - Smart Financial Management Platform',
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@fintrack',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Additional SEO tags */}
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Verification tags (add your own) */}
        {/* <meta name="google-site-verification" content="your-code" /> */}
        {/* <meta name="msvalidate.01" content="your-code" /> */}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}