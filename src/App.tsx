import { useEffect, useState } from "react";

declare const liff: any;

function App() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const liffId = import.meta.env.VITE_LIFF_ID as string | undefined;
        if (!liffId) {
          console.error("VITE_LIFF_ID が未設定です");
          return;
        }
        await liff.init({ liffId });
        setIsReady(true);
        const loggedIn = liff.isLoggedIn();
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
          const profile = await liff.getProfile();
          setProfileName(profile?.displayName ?? null);
        } else {
          // 自動ログイン（誰でもアクセス直後にログイン画面へ遷移）
          const redirectUri = import.meta.env.VITE_LIFF_REDIRECT_URI || window.location.href;
          liff.login({ redirectUri });

          // さらに“LINEアプリで開く”を強制したい場合（アプリ外閲覧時）
          const forceOpenInLine = (import.meta.env.VITE_FORCE_OPEN_IN_LINE || "false").toString() === "true";
          const isInClient = typeof liff.isInClient === "function" ? liff.isInClient() : false;
          if (forceOpenInLine && !isInClient) {
            // LIFF URL に遷移すると LINE アプリが起動し、既ログインのアカウントでスムーズに認可されやすい
            const liffUrl = `https://liff.line.me/${liffId}`;
            // 認可後は LIFF 側設定のエンドポイントURLに戻る。必要ならクエリでヒントを付与
            window.location.replace(liffUrl);
          }
        }
      } catch (e) {
        console.error("LIFF 初期化エラー", e);
      }
    };
    init();
  }, []);

  const handleLogin = () => {
    if (!isReady) return;
    if (!liff.isLoggedIn()) {
      liff.login({ redirectUri: window.location.href });
    }
  };

  const handleLogout = () => {
    if (!isReady) return;
    if (liff.isLoggedIn()) {
      liff.logout();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md text-center space-y-4">
        <h1 className="text-xl font-semibold">LINE ログイン</h1>
        {!isReady && <p className="text-gray-500">初期化中...</p>}
        {/* 自動ログインのため未ログイン時ボタンは基本的に表示しない */}
        {isReady && !isLoggedIn && null}
        {isReady && isLoggedIn && (
          <div className="space-y-3">
            <p className="text-gray-700">ログイン中{profileName ? `：${profileName}` : ""}</p>
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
            >
              ログアウト
            </button>
          </div>
        )}
        <p className="text-xs text-gray-400">
          設定: VITE_LIFF_ID が必要です。LINE Developers のLIFF IDを設定してください。
        </p>
      </div>
    </div>
  );
}

export default App;
