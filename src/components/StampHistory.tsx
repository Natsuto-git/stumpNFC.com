import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { ja } from 'date-fns/locale';

interface StampHistoryProps {
  stampHistory: Array<{
    date: string;
    count: number;
  }>;
  totalStampsEarned: number;
}

export const StampHistory = ({ stampHistory, totalStampsEarned }: StampHistoryProps) => {
  // 今月のスタンプ獲得数
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const thisMonthStamps = stampHistory
    .filter(h => {
      const date = parseISO(h.date);
      return isSameMonth(date, now);
    })
    .reduce((sum, h) => sum + h.count, 0);

  // 直近7日間のスタンプ獲得履歴
  const recentHistory = stampHistory
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)
    .reverse();

  return (
    <Card className="border-2 border-amber-800/60 shadow-lg w-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">スタンプ履歴・統計</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 統計サマリー */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border-2 border-amber-800/50 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
            <p className="text-xs text-stone-600 mb-1">総スタンプ数</p>
            <p className="text-2xl font-bold text-stone-800">{totalStampsEarned}</p>
          </div>
          <div className="p-4 rounded-lg border-2 border-amber-800/50 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
            <p className="text-xs text-stone-600 mb-1">今月の獲得</p>
            <p className="text-2xl font-bold text-stone-800">{thisMonthStamps}</p>
          </div>
        </div>

        {/* 直近の履歴 */}
        {recentHistory.length > 0 ? (
          <div>
            <p className="text-sm font-medium text-stone-700 mb-2">直近7日間の履歴</p>
            <div className="space-y-2">
              {recentHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded border border-amber-800/30"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                >
                  <span className="text-sm text-stone-700">
                    {format(parseISO(entry.date), 'MM月dd日(E)', { locale: ja })}
                  </span>
                  <span className="text-sm font-bold text-stone-800">{entry.count}個</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-stone-600">まだ履歴がありません</p>
        )}
      </CardContent>
    </Card>
  );
};

