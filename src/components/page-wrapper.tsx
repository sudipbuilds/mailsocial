import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  outsideContent?: React.ReactNode;
}

export function PageWrapper({ children, spacing = 'lg', outsideContent }: PageWrapperProps) {
  return (
    <main className="min-h-dvh bg-neutral-50">
      <section
        className={cn(
          'px-6 py-16 sm:py-24 md:py-28 xl:py-32 max-w-md mx-auto *:leading-tight *:tracking-tight',
          spacing === 'sm' && 'space-y-8',
          spacing === 'md' && 'space-y-12',
          spacing === 'lg' && 'space-y-16'
        )}
      >
        {children}
      </section>
      {outsideContent}
    </main>
  );
}
