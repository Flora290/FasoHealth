import { ReactNode, useEffect, useState } from 'react';
import FloatingPillsBackground from './FloatingPillsBackground';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
  showFloatingPills?: boolean;
}

export default function Layout({ children, showFloatingPills = true }: LayoutProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Hide the global logout button on dashboard pages (as they have their own)
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Floating Pills Background */}
      {showFloatingPills && <FloatingPillsBackground />}
      

      {/* Main Content */}
      <div className="relative z-10 flex-1">
        {children}
      </div>
    </div>
  );
}
