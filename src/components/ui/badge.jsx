import { cn } from '../../lib/utils';

export default function Badge({ children, className, variant = 'default' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none',
        variant === 'default' && 'bg-foreground text-background',
        variant === 'destructive' && 'bg-like text-white',
        variant === 'muted' && 'bg-secondary text-secondary-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}
