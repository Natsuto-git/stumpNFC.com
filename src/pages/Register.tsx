import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signInWithRedirect, getRedirectResult, OAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ▼ LINEログイン（リダイレクト）から戻ってきた時の処理 ▼ ---
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          // ログイン成功！
          const user = result.user;
          console.log("LINEログイン成功（新規登録）:", user.uid);

          // このユーザーが「新規」か「既存」かを確認
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // --- ▼ 新規ユーザーの場合 ▼ ---
            console.log("新規ユーザーです。DBに初期データを作成します。");
            await setDoc(userDocRef, {
              email: user.email || '',
              displayName: user.displayName || 'ゲスト',
              photoURL: user.photoURL || '',
              stamps: 3,
              maxStamps: 10,
              totalStamps: 3,
              coupons: [],
              stampHistory: [],
              completedCards: 0,
              lastStampDate: undefined,
              createdAt: new Date().toISOString()
            });
          } else {
            // --- 既存ユーザーの場合（既にLINEログインで登録済み） ---
            console.log("既存ユーザーです。");
          }
          
          // 処理が完了したら、スタンプカード画面へ強制的に遷移
          navigate('/card');

        } else {
          // リダイレクト結果がない場合（＝普通に登録ページを開いた場合）
          setLoading(false);
        }
      })
      .catch((error) => {
        // エラー処理
        console.error("LINEログインエラー:", error);
        setError("ログインに失敗しました。もう一度お試しください。");
        setLoading(false);
      });
  }, [navigate]);

  // --- ▼ 「LINEで新規登録」ボタンが押された時の処理 ▼ ---
  const handleLineRegister = () => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new OAuthProvider('line.me');
      
      // LINEの認証画面にリダイレクト
      signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error("LINEログイン開始エラー:", err);
      setError("LINEログインの開始に失敗しました。");
      setLoading(false);
    }
  };

  // 読み込み中はスピナーを表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <LoadingSpinner size="lg" text="読み込み中..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            新規会員登録
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* LINEログインボタン */}
          <Button 
            onClick={handleLineRegister} 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 text-lg"
          >
            LINEで新規登録
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <p className="text-xs text-stone-500 text-center">
            ボタンを押すだけで登録・ログインが完了します。
          </p>

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

