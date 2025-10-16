import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';
import Navigation from '@/components/Navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinTrack - Financial Dashboard',
  description: 'Track your finances with AI-powered insights',
};

