import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={isMobile ? 'pt-14' : 'pl-64'}>
        <div className="min-h-screen px-3 py-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
