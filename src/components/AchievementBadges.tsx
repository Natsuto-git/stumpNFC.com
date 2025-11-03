import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star } from 'lucide-react';

interface AchievementBadgesProps {
  totalStampsEarned: number;
  completedCards: number;
  stampHistory: Array<{ date: string; count: number }>;
}

export const AchievementBadges = ({ totalStampsEarned, completedCards, stampHistory }: AchievementBadgesProps) => {
  const achievements = [
    {
      id: 'first-visit',
      title: '初めてのお客様',
      description: '初回スタンプ獲得',
      icon: Star,
      unlocked: totalStampsEarned >= 1,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'bronze',
      title: 'ブロンズ会員',
      description: 'スタンプカード1枚完成',
      icon: Trophy,
      unlocked: completedCards >= 1,
      color: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'silver',
      title: 'シルバー会員',
      description: 'スタンプカード3枚完成',
      icon: Trophy,
      unlocked: completedCards >= 3,
      color: 'bg-gray-100 text-gray-800',
    },
    {
      id: 'gold',
      title: 'ゴールド会員',
      description: 'スタンプカード6枚完成',
      icon: Trophy,
      unlocked: completedCards >= 6,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'platinum',
      title: 'プラチナ会員',
      description: 'スタンプカード10枚完成',
      icon: Trophy,
      unlocked: completedCards >= 10,
      color: 'bg-slate-100 text-slate-800',
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Card className="border-2 border-amber-800/60 shadow-lg w-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          獲得バッジ ({unlockedCount}/{achievements.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 pb-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            const isPlatinum = achievement.id === 'platinum';
            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isPlatinum ? 'col-span-2 mx-auto max-w-fit' : ''
                } ${
                  achievement.unlocked
                    ? `${achievement.color} border-amber-800/60`
                    : 'bg-gray-50 text-gray-400 border-gray-200 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${achievement.unlocked ? '' : 'opacity-50'}`} />
                  <span className={`text-xs font-bold ${achievement.unlocked ? '' : 'line-through'}`}>
                    {achievement.title}
                  </span>
                </div>
                <p className="text-xs text-stone-600">{achievement.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

