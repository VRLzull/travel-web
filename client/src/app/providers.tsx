'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Gunakan dynamic import untuk komponen yang memerlukan browser API
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
