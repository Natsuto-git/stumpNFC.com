import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import * as cors from "cors";

// Firebase Admin SDKを初期化
admin.initializeApp();

// CORS（セキュリティ設定）
// これにより、あなたのフロントエンド（localhostやstumpnfc.com）からのみ
// このFunctionを呼び出すことを許可します。
const corsHandler = cors({
  origin: [
    "http://localhost:5173", // あなたのPCでのテスト用
    "https://stumpcard-app.web.app", // Firebaseのデフォルトドメイン（重要）
    // "https://stumpnfc.com", // 将来の本番ドメイン
  ],
});

/**
 * LINE認証の「認証コード(code)」を受け取り、
 * Firebaseの「カスタムトークン」を生成して返すFunction
 */
export const createFirebaseTokenFromLine = functions
  .region("asia-northeast1") // 東京リージョン（高速化）
  .https.onRequest((request, response) => {
    
    // CORSミドルウェアを実行（おまじない）
    corsHandler(request, response, async () => {
      
      // 1. フロントエンドから「認証コード」を受け取る
      const code = request.body.code;
      if (!code) {
        response.status(400).send("認証コード(code)がありません。");
        return;
      }
      
      // Firebaseの「金庫（環境変数）」から秘密情報を安全に読み込む
const channelId = functions.config().line.channel_id;
const channelSecret = functions.config().line.channel_secret;
const callbackUrl = functions.config().line.callback_url;

      try {
        // 2. LINEサーバーに「認証コード」を送り、「アクセストークン」を要求
        const tokenResponse = await axios.post(
          "https://api.line.me/oauth2/v2.1/token",
          new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: callbackUrl,
            client_id: channelId,
            client_secret: channelSecret,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        // 3. 取得した「アクセストークン」で、LINEユーザーのプロファイル（LINE ID）を要求
        const profileResponse = await axios.get(
          "https://api.line.me/v2/profile",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.data.access_token}`,
            },
          }
        );

        // 4. LINEのユーザーID (`userId`) を取得
        const lineUserId = profileResponse.data.userId;
        if (!lineUserId) {
          throw new Error("LINEのユーザーIDが取得できませんでした。");
        }
        
        // 5. LINE IDを元に、Firebaseの「カスタムトークン」を生成
        const firebaseToken = await admin.auth().createCustomToken(lineUserId);
        
        // 6. フロントエンドに「カスタムトークン」と「LINEプロファイル」を返す
        response.status(200).json({
          firebaseToken: firebaseToken,
          lineProfile: profileResponse.data, // displayNameやpictureUrlも含む
        });

      } catch (error: any) {
        console.error("LINE認証エラー:", error.response?.data || error.message);
        response.status(500).send("LINE認証の途中でエラーが発生しました。");
      }
    });
  });