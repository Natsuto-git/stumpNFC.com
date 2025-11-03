import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// ダッシュボードの統計データ用インターフェース
interface DashboardStats {
  totalUsers: number;
  totalStampsIssued: number;
  // TODO: 今月のスタンプ数、クーポン利用率などを追加
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Firestoreの 'users' コレクション全体を取得するクエリ
        // 注意: ユーザー数が数万件になるとコストと速度が問題になるため、
        // 将来的に集計用ドキュメント（サマリー）への移行を検討します。
        // これはあくまでMVPの実装です。
        const usersCollectionRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);

        let totalUsers = 0;
        let totalStampsIssued = 0;

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          
          totalUsers++;
          
          // ドキュメントに 'totalStamps' フィールド（累計スタンプ数）があれば加算
          if (userData.totalStamps && typeof userData.totalStamps === 'number') {
            totalStampsIssued += userData.totalStamps;
          }
        });

        setStats({
          totalUsers,
          totalStampsIssued,
        });

      } catch (err) {
        console.error("ダッシュボードデータ取得エラー:", err);
        setError("データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // 初回読み込み時に一度だけ実行

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" text="読み込み中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-500 p-4 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-stone-800">オーナー管理ダッシュボード</h1>
      
      {/* 統計サマリー */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* カード1: 累計スタンプ発行数 */}
          <Card>
            <CardHeader>
              <CardTitle>累計スタンプ発行数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.totalStampsIssued.toLocaleString()} 個</p>
              <p className="text-sm text-stone-600">これまでの総リピート行動数</p>
            </CardContent>
          </Card>

          {/* カード2: 総会員数 */}
          <Card>
            <CardHeader>
              <CardTitle>総会員数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.totalUsers.toLocaleString()} 人</p>
              <p className="text-sm text-stone-600">アプリに登録したお客様の総数</p>
            </CardContent>
          </Card>

          {/* ▼▼▼ 今後のステップ ▼▼▼ */}
          {/* ここに「クーポン利用率」「今月のスタンプ数」のカードを追加していく */}

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

