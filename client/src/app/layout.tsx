import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Faraday Tour and Travel - Layanan Travel Terbaik',
  description: 'Temukan pengalaman wisata terbaik dengan harga terjangkau',
  icons: {
    icon: '/faraday-tour-and-travel.png',
    apple: '/faraday-tour-and-travel.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} bg-gray-50`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
