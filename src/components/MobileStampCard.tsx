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
}

export const MobileStampCard = ({
  stamps,
  maxStamps,
  progress,
  isAuthenticated,
  canAddStampToday,
}: MobileStampCardProps) => {
  return (
    <Card className="w-full max-w-sm mx-auto bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 shadow-xl">
      <CardHeader className="text-center pb-3">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🍜</span>
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            スタンプカード
          </CardTitle>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 text-sm">
            {stamps} / {maxStamps}
          </Badge>
          {isAuthenticated && <Badge className="bg-green-500 hover:bg-green-600 text-xs">ログイン中</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span>進捗</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" />
        </div>
        <div className="grid grid-cols-5 gap-2 justify-items-center py-4">
          {Array.from({ length: maxStamps }, (_, index) => (
            <StampSlot key={index} filled={index < stamps} index={index} animationDelay={index * 50} size="small" />
          ))}
        </div>
        <div className="text-center p-3 bg-white/60 rounded-lg border border-orange-200">
          {!isAuthenticated ? (
            <p className="text-gray-600 text-sm">QRコードでログインして<br />スタンプを獲得しましょう</p>
          ) : !canAddStampToday ? (
            <p className="text-orange-600 font-medium text-sm">
              本日のスタンプは獲得済みです<br />
              <span className="text-xs text-gray-500">また明日お越しください</span>
            </p>
          ) : stamps === maxStamps ? (
            <p className="text-green-600 font-semibold animate-pulse">🎉 クーポン獲得！</p>
          ) : (
            <div className="space-y-1">
              <p className="text-gray-700 font-medium text-sm">スタンプ獲得可能！</p>
              <p className="text-gray-600 text-xs">あと {maxStamps - stamps} 個でクーポンゲット</p>
            </div>
          )}
        </div>
        {isAuthenticated && (
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`text-xs ${canAddStampToday ? 'border-green-300 text-green-700' : 'border-gray-300 text-gray-500'}`}
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


