import { useEffect, useState } from "react";

declare const liff: any;

function App() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInClient, setIsInClient] = useState(false);
  const [showManualOpen, setShowManualOpen] = useState(false);
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
        const inClient = typeof liff.isInClient === "function" ? liff.isInClient() : false;
        setIsInClient(inClient);
        const loggedIn = liff.isLoggedIn();
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
          const profile = await liff.getProfile();
          setProfileName(profile?.displayName ?? null);
          sessionStorage.removeItem("AUTO_LOGIN_TRIED");
        } else {
          // セッション内で一度だけ自動処理
          const tried = sessionStorage.getItem("AUTO_LOGIN_TRIED") === "1";
          if (!tried) {
            sessionStorage.setItem("AUTO_LOGIN_TRIED", "1");

            if (inClient) {
              // LINEアプリ内は即ログイン（ワンタップ不要）
              const redirectUri = import.meta.env.VITE_LIFF_REDIRECT_URI || window.location.href;
              liff.login({ redirectUri });
            } else {
              // アプリ外は自動でアプリ起動（スキーム→LIFF→ストア/再試行）
              const liffUrl = `https://liff.line.me/${liffId}`;
              const deepLink = `line://app/${liffId}`;
              const appStoreUrl = `https://apps.apple.com/app/id443904275`;
              const ua = navigator.userAgent || "";
              const isAndroid = /Android/i.test(ua);
              const isIOS = /iPhone|iPad|iPod/i.test(ua);

              try {
                const iframe = document.createElement("iframe");
                iframe.style.display = "none";
                iframe.src = deepLink;
                document.body.appendChild(iframe);
                setTimeout(() => {
                  try { document.body.removeChild(iframe); } catch {}
                }, 1000);
              } catch {}

              setTimeout(() => {
                if (document.visibilityState === "visible") {
                  window.location.href = liffUrl;
                }
              }, 600);

              setTimeout(() => {
                if (document.visibilityState === "visible") {
                  if (isIOS) {
                    window.location.href = appStoreUrl;
                  } else if (isAndroid) {
                    window.location.href = deepLink;
                  }
                  // ここまで来ても画面が残っている=自動遷移がブロックされた
                  setShowManualOpen(true);
                }
              }, 1800);
            }
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

  const openInLineApp = () => {
    const liffId = import.meta.env.VITE_LIFF_ID as string | undefined;
    if (!liffId) return;
    const liffUrl = `https://liff.line.me/${liffId}`;
    const deepLink = `line://app/${liffId}`;
    const appStoreUrl = `https://apps.apple.com/app/id443904275`; // LINE 公式
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    // 1) まずスキームで直接起動を試みる（ユーザー操作直後に実行）
    //    iOSでは iframe 経由が比較的成功しやすいケースあり
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = deepLink;
      document.body.appendChild(iframe);
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    } catch {}

    // 2) 0.6s 後に https の LIFF URL を試す（Safariや一部環境で成功しやすい）
    setTimeout(() => {
      if (document.visibilityState === "visible") {
        window.location.href = liffUrl;
      }
    }, 600);

    // 3) さらに 1.8s 後もアプリが前面にいない場合、
    //    iOS は App Store、Android は再度 deepLink or intent を試行
    setTimeout(() => {
      if (document.visibilityState === "visible") {
        if (isIOS) {
          window.location.href = appStoreUrl;
        } else if (isAndroid) {
          // Android の一部ブラウザ向け再試行
          window.location.href = deepLink;
        }
      }
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md text-center space-y-4">
        <h1 className="text-xl font-semibold">LINE ログイン</h1>
        {!isReady && <p className="text-gray-500">初期化中...</p>}
        {isReady && !isLoggedIn && (
          <div className="space-y-2">
            <p className="text-gray-600 text-sm">ログインへ遷移しています…</p>
            {showManualOpen && (
              <a
                href={`https://liff.line.me/${import.meta.env.VITE_LIFF_ID}`}
                className="inline-block w-full py-3 rounded-md bg-green-500 hover:bg-green-600 text-white font-medium"
              >
                LINEアプリで開く（うまく遷移しない場合）
              </a>
            )}
          </div>
        )}
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
