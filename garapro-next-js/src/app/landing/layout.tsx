'use client';

import { Inter } from 'next/font/google';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.className} bg-gray-50 min-h-screen h-screen flex flex-col`}>
      {children}
    </div>
  );
}