'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListOrdered, Settings, PlusCircle, Tag, Zap, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', icon: Home, href: '/' },
  { name: 'Registro', icon: ListOrdered, href: '/registry' },
  { name: 'Categorías', icon: Tag, href: '/config/categories' },
  { name: 'Servicios', icon: Zap, href: '/config/services' },
  { name: 'Fuentes', icon: Wallet, href: '/config/sources' },
  { name: 'Ajustes', icon: Settings, href: '/config/settings' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass h-16 md:hidden flex items-center justify-around px-4 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 w-full transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
      {/* Mobile Credit */}
      <div className="hidden">Creado por Andres Felipe Garcia</div>
    </nav>
  );
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-card p-6">
      <div className="flex items-center space-x-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
          P
        </div>
        <h1 className="text-xl font-bold tracking-tight">PayControl</h1>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-border">
        <div className="bg-muted/50 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Plan Personal</p>
          <p className="text-sm font-semibold">Pro Version</p>
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">
              Desarrollado por<br />
              <span className="text-foreground font-bold">Andres Felipe Garcia</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
