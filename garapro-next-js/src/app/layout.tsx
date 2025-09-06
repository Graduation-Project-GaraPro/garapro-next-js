import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from '@/components/manager/layout/app-sidebar'
import { SiteHeader } from '@/components/manager/layout/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GaragePro",
  description: "Professional garage management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="h-screen flex flex-col">
          <SidebarProvider className="flex flex-col flex-1 min-h-0">
            <SiteHeader />
            <div className="flex flex-1 min-h-0">
              <AppSidebar />
              <SidebarInset>
                <div className="flex-1 min-h-0 overflow-y-auto">
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
