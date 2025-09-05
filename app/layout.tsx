import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NexusFlow - Unified Communication Dashboard',
  description: 'Unify your digital conversations, connect across every network.',
  keywords: ['communication', 'dashboard', 'farcaster', 'web3', 'messaging'],
  authors: [{ name: 'NexusFlow Team' }],
  openGraph: {
    title: 'NexusFlow - Unified Communication Dashboard',
    description: 'Unify your digital conversations, connect across every network.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
