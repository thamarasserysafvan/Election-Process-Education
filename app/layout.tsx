import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Election Process Education Assistant | VoteAssist India',
  description:
    'An interactive, AI-driven assistant to educate voters on the Indian Electoral Process — voter registration, EVMs, polling logistics, election dates, and results.',
  keywords: [
    'Indian election',
    'voter registration',
    'ECI',
    'election commission',
    'EVM',
    'VVPAT',
    'how to vote India',
    'election dates India',
  ],
  authors: [{ name: 'VoteAssist India' }],
  openGraph: {
    title: 'VoteAssist India — Election Education Assistant',
    description:
      'Your AI guide to understanding elections in India — registration, dates, results, and procedures.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans bg-slate-50 min-h-screen flex flex-col`}
      >
        {/* Skip to main content for screen-reader / keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded-md z-50 font-medium"
        >
          Skip to main content
        </a>
        <Navigation />
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
