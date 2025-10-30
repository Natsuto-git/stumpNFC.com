import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none',
        'focus:ring-2 focus:ring-blue-400',
        className,
      )}
      {...props}
    />
  );
});

export default Input;


