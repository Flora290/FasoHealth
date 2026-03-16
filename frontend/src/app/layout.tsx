import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FasoHealth',
  description: 'Premium healthcare appointment management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-teal-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen relative overflow-x-hidden`}>
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        
        <div className="relative z-10">
            {children}
        </div>
      </body>
    </html>
  );
}
