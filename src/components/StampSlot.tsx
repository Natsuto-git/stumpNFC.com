import { cn } from '../lib/utils';

interface StampSlotProps {
  filled: boolean;
  index: number;
  animationDelay?: number;
  size?: 'small' | 'medium' | 'large';
}

export function StampSlot({ filled, index, animationDelay = 0, size = 'medium' }: StampSlotProps) {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
  };
  const starSizeClasses = {
    small: 'w-5 h-5 text-sm',
    medium: 'w-8 h-8 text-lg',
    large: 'w-10 h-10 text-xl',
  };
  const numberSizeClasses = {
    small: 'text-xs -bottom-4',
    medium: 'text-xs -bottom-6',
    large: 'text-sm -bottom-7',
  };
  return (
    <div
      className={cn(
        'relative rounded-full border-2 transition-all duration-500 ease-out flex items-center justify-center shadow-md',
        sizeClasses[size],
        filled ? 'bg-gradient-to-br from-orange-400 to-red-500 border-orange-300 scale-110' : 'bg-white border-gray-300 hover:border-orange-300 hover:shadow-lg',
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {filled && (
        <div className="animate-in zoom-in duration-300">
          <div className={cn('bg-white rounded-full flex items-center justify-center shadow-inner', starSizeClasses[size])}>
            <span className="text-orange-600 font-bold">★</span>
          </div>
        </div>
      )}
      <div className={cn('absolute left-1/2 transform -translate-x-1/2', numberSizeClasses[size])}>
        <span className="font-medium text-gray-500">{index + 1}</span>
      </div>
      {filled && <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />}
    </div>
  );
}

export default StampSlot;


