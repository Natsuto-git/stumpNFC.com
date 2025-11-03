import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Register() {
  const navigate = useNavigate();

  // LINEログインにリダイレクト（Login.tsxと同じ処理）
  const handleLineRegister = () => {
    const channelId = import.meta.env.VITE_LINE_CHANNEL_ID || 'YOUR_CHANNEL_ID';
    const callbackUrl = import.meta.env.VITE_LINE_CALLBACK_URL || 
      `${window.location.origin}/login`;
    const state = crypto.randomUUID();

    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
      `response_type=code&` +
      `client_id=${channelId}&` +
      `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
      `state=${state}&` +
      `scope=profile%20openid%20email`;

    window.location.href = lineAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            新規会員登録
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLineRegister} 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 text-lg"
          >
            LINEで新規登録
          </Button>
          
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

