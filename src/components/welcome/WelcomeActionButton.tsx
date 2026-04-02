import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type WelcomeActionButtonProps = {
  href: string;
  title: string;
  description: string;
  variant?: 'primary' | 'secondary';
};

export function WelcomeActionButton({
  href,
  title,
  description,
  variant = 'primary',
}: WelcomeActionButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex w-full items-center justify-between rounded-3xl border p-5 text-left transition-all focus:outline-none focus:ring-4 focus:ring-primary/20',
        variant === 'primary'
          ? 'btn-primary border-primary/30 text-white'
          : 'glass border-border hover:border-primary/40'
      )}
    >
      <div className="min-w-0">
        <p className="text-xl font-bold tracking-tight">{title}</p>
        <p
          className={cn(
            'mt-2 text-sm leading-6',
            variant === 'primary' ? 'text-white/80' : 'text-muted-foreground'
          )}
        >
          {description}
        </p>
      </div>
      <ChevronRight
        size={24}
        className={cn(
          'ml-4 shrink-0 transition-transform group-hover:translate-x-1',
          variant === 'primary' ? 'text-white' : 'text-muted-foreground'
        )}
      />
    </Link>
  );
}
