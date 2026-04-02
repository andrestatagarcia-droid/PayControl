'use client';

import { usePathname } from 'next/navigation';
import { DesktopNav, MobileNav } from '@/components/layout/Navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWelcomePage = pathname === '/welcome';

  return (
    <div className="flex min-h-screen">
      {!isWelcomePage && <DesktopNav />}
      <main className={isWelcomePage ? 'flex-1' : 'flex-1 md:ml-64 pb-20 md:pb-0'}>
        <div className={isWelcomePage ? 'min-h-screen px-4 py-8' : 'container mx-auto max-w-5xl px-4 py-8'}>
          {children}
        </div>
      </main>
      {!isWelcomePage && <MobileNav />}
    </div>
  );
}
