import { HTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border p-3', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm', className)} {...props} />;
}

export default Alert;


