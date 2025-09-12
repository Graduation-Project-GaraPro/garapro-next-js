import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Garage Pro',
  description: 'Vehicle Repair Management Application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">{children}</div>
        </div>
      </body>
    </html>
  );
}