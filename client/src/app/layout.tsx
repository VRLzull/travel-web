import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TourKu - Paket Wisata Terbaik',
  description: 'Temukan pengalaman wisata terbaik dengan harga terjangkau',
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
