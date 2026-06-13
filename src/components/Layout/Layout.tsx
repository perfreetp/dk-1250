import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      <div className="lg:hidden">
        <main className="pb-20">
          <div className="max-w-md mx-auto p-4">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
