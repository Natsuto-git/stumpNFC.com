import { StampSlot } from './StampSlot';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MobileStampCardProps {
  stamps: number;
  maxStamps: number;
  progress: number;
  isAuthenticated: boolean;
  canAddStampToday: boolean;
  totalStampsEarned: number;
  storeName?: string;
}

export const MobileStampCard = ({
  stamps,
  maxStamps,
  progress,
  isAuthenticated,
  canAddStampToday,
  totalStampsEarned,
  storeName = '〇〇店',
}: MobileStampCardProps) => {
  return (
    <Card className="w-full max-w-lg mx-auto border-2 border-amber-800/60 shadow-lg relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
      <CardHeader className="text-center pb-3">
        <div className="mb-3">
          <p className="text-xl font-bold text-stone-800">ようこそ{storeName}へ！</p>
        </div>
        {isAuthenticated && (
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-green-500 hover:bg-green-600 text-xs">ログイン中</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
            <div className="space-y-2">
              <div className="flex justify-end text-sm font-medium text-stone-700">
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2" 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                }}
              />
            </div>
        <div className="grid grid-cols-5 gap-x-3 gap-y-8 justify-items-center py-6">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} data-stamp-slot>
              <StampSlot 
                filled={index < stamps && index < maxStamps} 
                index={index} 
                animationDelay={index * 50} 
                size="medium" 
              />
            </div>
          ))}
        </div>
        <div className="text-center p-4 rounded-lg border-2 border-amber-800/50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-stone-600 mb-1">累計スタンプ数</p>
              <p className="text-2xl font-bold text-stone-800">{totalStampsEarned}</p>
            </div>
            {!canAddStampToday && (
              <p className="text-stone-700 font-medium text-sm">
                本日のスタンプは獲得済みです<br />
                <span className="text-xs text-stone-600">また明日お越しください</span>
              </p>
            )}
            {canAddStampToday && stamps === maxStamps && (
              <p className="text-stone-700 font-semibold">クーポン獲得！</p>
            )}
            {canAddStampToday && stamps < maxStamps && (
              <p className="text-stone-600 text-xs">あと {maxStamps - stamps} 個でクーポンゲット</p>
            )}
          </div>
        </div>
        {isAuthenticated && (
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`text-xs ${canAddStampToday ? 'border-stone-400 text-stone-700' : 'border-stone-300 text-stone-600'}`}
            >
              今日: {canAddStampToday ? '未獲得' : '獲得済み'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileStampCard;


