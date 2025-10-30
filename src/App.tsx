import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

function App() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const oneTapTriedRef = useRef(false);
  const tokenClientRef = useRef<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      console.error("VITE_GOOGLE_CLIENT_ID が未設定です");
      setErrorMsg("VITE_GOOGLE_CLIENT_ID が未設定です");
      return;
    }

    const init = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            const credential = response?.credential;
            if (!credential) return;
            const payload = JSON.parse(atob(credential.split(".")[1] || ""));
            setProfileName(payload?.name || null);
            setIsLoggedIn(true);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // OAuth 2.0 Token Client（iOS Safari 等でOne Tapが出ない時のフォールバック）
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: async (tokenResponse: any) => {
            try {
              const accessToken = tokenResponse?.access_token;
              if (!accessToken) return;
              const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              const user = await res.json();
              setProfileName(user?.name || user?.email || null);
              setIsLoggedIn(true);
            } catch (e) {
              console.error("userinfo 取得失敗", e);
            }
          },
        });

        // ボタンを描画（見た目はTailwindボタンも併置する）
        const target = document.getElementById("g_id_signin");
        if (target) {
          window.google.accounts.id.renderButton(target, {
            theme: "outline",
            size: "large",
            width: 320,
            shape: "rectangular",
          });
        }

        if (!oneTapTriedRef.current) {
          oneTapTriedRef.current = true;
          window.google.accounts.id.prompt();
        }

        setIsReady(true);
      } catch (e) {
        console.error("Google Identity Services 初期化エラー", e);
        setErrorMsg("Googleの初期化に失敗しました");
      }
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          init();
        }
      }, 100);
      setTimeout(() => clearInterval(timer), 10000);
    }
  }, []);

  const handleLogout = () => {
    window.google?.accounts.id.disableAutoSelect();
    setIsLoggedIn(false);
    setProfileName(null);
  };

  const handleGoogleLogin = () => {
    // One Tap を再提示（出ない場合はトークンフローにフォールバック）
    setErrorMsg(null);
    let prompted = false;
    try {
      window.google?.accounts.id.prompt((notification: any) => {
        // NotDisplayed or Skipped ならフォールバック
        const reason = notification?.getNotDisplayedReason?.() || notification?.getSkippedReason?.();
        if (reason) {
          try {
            tokenClientRef.current?.requestAccessToken({ prompt: "consent" });
          } catch (e) {
            console.error("TokenClient 起動失敗", e);
            setErrorMsg("ポップアップがブロックされました。ポップアップを許可してください。");
          }
        }
      });
      prompted = true;
    } catch {}
    if (!prompted) {
      try {
        tokenClientRef.current?.requestAccessToken({ prompt: "consent" });
      } catch (e) {
        console.error("TokenClient 起動失敗", e);
        setErrorMsg("ログイン画面を開けませんでした。ブラウザ設定をご確認ください。");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md text-center space-y-4">
        <h1 className="text-xl font-semibold">Google ログイン</h1>
        {!isReady && <p className="text-gray-500">初期化中...</p>}
        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
        {isReady && !isLoggedIn && (
          <div className="space-y-3">
            <div id="g_id_signin"></div>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Googleでログイン
            </button>
            <p className="text-xs text-gray-500">One Tapが表示されない場合はボタンを押してください。</p>
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
          設定: VITE_GOOGLE_CLIENT_ID を用意し、Google Cloud Consoleで承認済みドメインに本番/開発URLを登録してください。
        </p>
      </div>
    </div>
  );
}

export default App;
