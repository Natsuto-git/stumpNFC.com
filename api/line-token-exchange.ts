import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as admin from 'firebase-admin';

// Firebase Admin 初期化（多重初期化ガード）
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // 改行が \n で渡ってくるケースに対応
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Firebase Admin 環境変数が不足しています');
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      } as admin.ServiceAccount),
    });
  }
}

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOW_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code } = req.body || {};
  if (!code) {
    return res.status(400).json({ error: 'code is required' });
  }

  const channelId = process.env.LINE_CHANNEL_ID;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const callbackUrl = process.env.LINE_CALLBACK_URL;

  if (!channelId || !channelSecret || !callbackUrl) {
    return res.status(500).json({ error: 'LINE 環境変数が未設定です' });
  }

  try {
    // 1) code をアクセストークンに交換
    const tokenResponse = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl,
        client_id: channelId,
        client_secret: channelSecret,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    // 2) アクセストークンでプロフィール取得
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
    });

    const lineProfile = profileResponse.data as { userId?: string; displayName?: string; pictureUrl?: string };
    if (!lineProfile?.userId) {
      return res.status(500).json({ error: 'LINE userId を取得できませんでした' });
    }

    // 3) Firebase カスタムトークンを作成
    const firebaseToken = await admin.auth().createCustomToken(lineProfile.userId);

    return res.status(200).json({ firebaseToken, lineProfile });
  } catch (error: any) {
    const detail = error?.response?.data || error?.message || 'unknown error';
    console.error('LINE exchange error:', detail);
    return res.status(500).json({ error: 'LINE 認証でエラーが発生しました', detail });
  }
}


