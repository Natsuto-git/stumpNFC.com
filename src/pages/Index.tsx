import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🍜</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            スタンプカードアプリ
          </CardTitle>
          <p className="text-gray-600 mt-2">
            10個のスタンプを集めて<br />お得なクーポンをゲットしよう！
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link to="/login" className="block">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-6 text-lg">
              LINEでログイン / 新規登録
            </Button>
          </Link>
          <div className="text-center text-sm text-gray-500 space-y-2">
            <Link to="/card" className="text-orange-600 hover:underline block">
              ゲストとしてスタンプカードを見る
            </Link>
            <Link to="/admin" className="text-gray-500 hover:underline block">
              オーナー管理画面
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
