import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'outline';
};

export function Badge({ className, variant = 'default', ...props }: Props) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium';
  const cls = {
    default: 'bg-blue-600 text-white',
    secondary: 'bg-gray-100 text-gray-700',
    outline: 'border border-gray-300 text-gray-700',
  }[variant];
  return <span className={cn(base, cls, className)} {...props} />;
}

export default Badge;


