
"use client";

import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import Header from '@/components/customer/Header';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <div className="h-screen flex flex-col">
          <SidebarProvider defaultOpen={true} className="flex flex-col flex-1 min-h-0">
            {/* <Header /> */}
            {/* <div className="flex flex-1 min-h-0">
              <CustomerSidebar />
              <SidebarInset>
                <div className="flex-1 min-h-0 overflow-y-auto p-8">
                  {children}
                </div>
              </SidebarInset>
            </div> */}
             <div className="flex flex-1 min-h-0 relative">
              {/* Sidebar with higher z-index and shadow */}
              <div className="relative z-30 shadow-lg">
                <CustomerSidebar />
              </div>
              
              {/* Main content area */}
              <SidebarInset className="flex flex-col flex-1">
                {/* Header with lower z-index */}
                <div className="relative z-10 shadow-sm">
                  <Header />
                </div>
                
                {/* Page content */}
                <div className="flex-1 min-h-0 overflow-y-auto p-8">
                  {children}
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </div>
      </body>
    </html>
  );
}