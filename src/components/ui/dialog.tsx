import { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

type DialogProps = PropsWithChildren<{ open: boolean; onOpenChange?: (open: boolean) => void }>;
export function Dialog({ open, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      {children}
    </div>
  );
}

export function DialogContent({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative z-50 w-full max-w-lg rounded-xl border bg-white p-4 shadow-lg',
        className,
      )}
      {...props}
    />
  );
}

export function DialogHeader({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-2 text-center', className)} {...props} />;
}

export function DialogTitle({ className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold', className)} {...props} />;
}

export function DialogDescription({ className = '', ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-gray-600', className)} {...props} />;
}

export function DialogFooter({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-4 flex gap-2', className)} {...props} />;
}

export default Dialog;


