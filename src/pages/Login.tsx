import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URLパラメータから認証コードを取得（LINE認証から戻ってきた時）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      // LINE認証から戻ってきた場合、Firebase Functionを呼び出してカスタムトークンを取得
      handleLineCallback(code);
    } else {
      setLoading(false);
    }
  }, []);

  // LINE認証のコールバック処理
  const handleLineCallback = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      // 認証サーバーのURL（Vercel Serverless Function）
      // 本番: /api/line-token-exchange
      // 開発: Vercel CLI の `vercel dev` を使うか、VITE_FIREBASE_FUNCTION_URL を設定
      const functionUrl = import.meta.env.VITE_FIREBASE_FUNCTION_URL || '/api/line-token-exchange';

      // Firebase Functionに認証コードを送信
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`Function呼び出しエラー: ${response.status}`);
      }

      const data = await response.json();
      const { firebaseToken, lineProfile } = data;

      // カスタムトークンでFirebaseにログイン
      const userCredential = await signInWithCustomToken(auth, firebaseToken);
      const user = userCredential.user;

      console.log("LINEログイン成功:", user.uid);

      // 新規/既存ユーザーのDBチェック
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log("新規ユーザーです。DBに初期データを作成します。");
        await setDoc(userDocRef, {
          email: lineProfile.email || '',
          displayName: lineProfile.displayName || 'ゲスト',
          photoURL: lineProfile.pictureUrl || '',
          stamps: 3,
          maxStamps: 10,
          totalStamps: 3,
          coupons: [],
          stampHistory: [],
          completedCards: 0,
          lastStampDate: undefined,
          createdAt: new Date().toISOString()
        });
      }

      // URLパラメータをクリアしてスタンプカード画面へ遷移
      window.history.replaceState({}, '', '/login');
      navigate('/card');

    } catch (error: unknown) {
      console.error("LINE認証エラー:", error);
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      setError(`ログインに失敗しました: ${errorMessage}`);
      setLoading(false);
    }
  };

  // LINEログインボタンが押された時の処理
  const handleLineLogin = () => {
    setLoading(true);
    setError(null);

    // LINE Login APIの認証URLにリダイレクト
    // 注意: これらの値はLINE Developers Consoleで取得した値に置き換えてください
    const channelId = import.meta.env.VITE_LINE_CHANNEL_ID || 'YOUR_CHANNEL_ID';
    const callbackUrl = import.meta.env.VITE_LINE_CALLBACK_URL || 
      `${window.location.origin}/login`;
    const state = crypto.randomUUID(); // CSRF対策

    // LINE認証URL
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
      `response_type=code&` +
      `client_id=${channelId}&` +
      `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
      `state=${state}&` +
      `scope=profile%20openid%20email`;

    // LINE認証ページにリダイレクト
    window.location.href = lineAuthUrl;
  };

  // 読み込み中はスピナーを表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <LoadingSpinner size="lg" text="LINE認証中..." />
      </div>
    );
  }

  // ログインボタンの表示
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-6">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-stone-800">ログイン / 新規登録</h2>
        
        <Button 
          onClick={handleLineLogin} 
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 text-lg"
          disabled={loading}
        >
          LINEでログイン
        </Button>

        {error && <p className="text-red-500 text-center mt-4 font-bold">{error}</p>}
        
        <p className="text-xs text-stone-500 text-center mt-4">
          ボタンを押すだけで登録・ログインが完了します。
        </p>

        <div className="mt-4 text-center text-sm text-gray-600">
          <Link to="/" className="text-gray-500 hover:underline">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
