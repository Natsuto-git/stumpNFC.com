import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'default', size = 'md', ...props },
  ref,
) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50';
  const variantCls = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400',
    outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  }[variant];
  const sizeCls = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4', lg: 'h-12 px-5 text-base' }[size];
  return <button ref={ref} className={cn(base, variantCls, sizeCls, className)} {...props} />;
});

export default Button;


