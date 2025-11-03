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
  
  return (
    <div
      className={cn(
        'relative rounded-full transition-all duration-300 ease-out flex items-center justify-center overflow-hidden',
        sizeClasses[size],
        filled ? 'shadow-md' : '',
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {filled ? (
        <div className="animate-in zoom-in duration-300 w-full h-full relative">
          <img 
            src={index % 2 === 0 ? "/stamp-filled.png" : "/stamp-empty.png"} 
            alt="スタンプ" 
            className="w-full h-full object-cover"
          />
        </div>
          ) : (
        <div className="w-full h-full rounded-full border-2 border-dashed border-amber-600/70 flex items-center justify-center relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
          {/* 5個目のスロットに「ドリンク1杯無料」を表示 */}
          {index === 4 && (
            <p className="text-xs text-stone-500 font-medium absolute inset-0 flex items-center justify-center text-center px-1">
              ドリンク<br />1杯無料
            </p>
          )}
          {/* 10個目のスロットに「10%オフクーポン」を表示 */}
          {index === 9 && (
            <p className="text-xs text-stone-500 font-medium absolute inset-0 flex items-center justify-center text-center px-1">
              10%オフ<br />クーポン
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default StampSlot;


