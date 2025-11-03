import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('メールとパスワードを入力してください。');
      setLoading(false);
      return;
    }

    try {
      // Firebaseで新規アカウント作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ユーザー専用のスタンプカードデータをFirestoreに作成
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        stampCount: 0,
        maxStamps: 10,
        coupons: [],
        totalStamps: 0,
        lastStampDate: null,
        createdAt: new Date().toISOString()
      });

      // 登録成功、スタンプカード画面に遷移
      navigate('/card');
    } catch (error: any) {
      console.error('登録エラー:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('そのメールアドレスは既に使用されています。');
      } else if (error.code === 'auth/weak-password') {
        setError('パスワードは6文字以上にしてください。');
      } else if (error.code === 'auth/invalid-email') {
        setError('メールアドレスの形式が正しくありません。');
      } else {
        setError('登録に失敗しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            新規会員登録
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-6 text-lg"
              disabled={loading}
            >
              {loading ? '登録中...' : '登録する'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              既にアカウントをお持ちの方は{' '}
              <Link to="/login" className="text-orange-600 hover:underline">
                こちらからログイン
              </Link>
            </p>
            <p className="mt-2">
              <Link to="/" className="text-gray-500 hover:underline">
                ← ホームに戻る
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

