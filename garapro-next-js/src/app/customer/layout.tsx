
"use client";

import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import NewHeader from '@/components/customer/NewHeader';
import ChatBotUI from '@/components/chatbot/ChatBot';


const inter = Inter({ subsets: ['latin'] });

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.className} bg-gray-50 min-h-screen h-screen flex flex-col`}>
      {/* Header with higher z-index */}
      <div className="relative z-30">
        <NewHeader />
        
      </div>
      
      {/* Main content area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {children}
     
        
      </div>
      
      {/* Chat Bot */}
      <ChatBotUI />
     
    </div>
  );
}