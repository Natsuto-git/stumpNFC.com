import { useState, useEffect, useRef } from 'react';
import { MobileStampCard } from '@/components/MobileStampCard';
import { CouponModal } from '@/components/CouponModal';
import { QRCodeModal } from '@/components/QRCodeModal';
import { StampAnimation } from '@/components/StampAnimation';
import { StampHistory } from '@/components/StampHistory';
import { AchievementBadges } from '@/components/AchievementBadges';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Button } from '@/components/ui/button';
import { Card as UICard, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecureStampCard } from '@/hooks/useSecureStampCard';
import { useFirestoreStampCard } from '@/hooks/useFirestoreStampCard';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Coupon } from '@/lib/types';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, RefreshCw, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Card() {
  const [firebaseAuth, setFirebaseAuth] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  // Firebase認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseAuth(!!user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Firebase認証済みの場合はFirestore、そうでない場合はlocalStorageを使用
  const firestoreData = useFirestoreStampCard();
  const localData = useSecureStampCard();

  const {
    currentCard,
    coupons,
    totalStampsEarned,
    progress,
    isAuthenticated,
    canAddStampToday,
    hasCompletedCard,
    stampHistory,
    completedCards,
    addStampSecure,
    useCoupon,
    resetCard,
    resetCoupons,
    addStampForTest,
    loading
  } = firebaseAuth ? firestoreData : localData;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('ログアウトしました');
      navigate('/');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      toast.error('ログアウトに失敗しました');
    }
  };

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>();
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showStampAnimation, setShowStampAnimation] = useState(false);
  const [animationTargetIndex, setAnimationTargetIndex] = useState(0);
  const [animationTargetPosition, setAnimationTargetPosition] = useState<{ x: number; y: number } | undefined>();
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const shouldShowCouponModalRef = useRef(false);
  const previousCouponsLengthRef = useRef(coupons.length);
  const hasAutoStampedRef = useRef(false);
  const stampCardRef = useRef<HTMLDivElement>(null);
  
  // オフライン同期
  const { isOnline, queueLength } = useOfflineSync();

  // 初回訪問時の自動スタンプ付与は無効化（スタンプが既に3つあるため）
  // useEffect(() => {
  //   // 既にスタンプを付与済み、またはカードが完成している場合はスキップ
  //   if (hasAutoStampedRef.current || hasCompletedCard || currentCard.stamps >= currentCard.maxStamps) {
  //     return;
  //   }

  //   // 初回訪問判定（スタンプが0個の場合のみ）
  //   if (currentCard.stamps === 0 && totalStampsEarned === 0) {
  //     // 少し遅延させてアニメーションを開始
  //     const timer = setTimeout(() => {
  //       setAnimationTargetIndex(0);
  //       setShowStampAnimation(true);
  //       hasAutoStampedRef.current = true;
  //     }, 500);

  //     return () => clearTimeout(timer);
  //   }
  // }, []); // 初回のみ実行

  // スタンプアニメーション完了時の処理
  const handleStampAnimationComplete = () => {
    setShowStampAnimation(false);
    setAnimationTargetPosition(undefined);
    // 通常のスタンプ追加はhandleAddStamp内で処理済み
  };

  // クーポンが追加されたときにモーダルを表示
  useEffect(() => {
    const currentLength = coupons.length;
    const previousLength = previousCouponsLengthRef.current;
    
    if (shouldShowCouponModalRef.current && currentLength > previousLength) {
      const latestCoupon = coupons[0];
      if (latestCoupon && !latestCoupon.isUsed) {
        setSelectedCoupon(latestCoupon);
        setShowCouponModal(true);
        shouldShowCouponModalRef.current = false;
        previousCouponsLengthRef.current = currentLength;
        return;
      }
    }
    
    // Firestoreの場合、状態更新が非同期なので再チェック
    if (shouldShowCouponModalRef.current) {
      const timer = setTimeout(() => {
        if (shouldShowCouponModalRef.current && coupons.length > previousCouponsLengthRef.current) {
          const latestCoupon = coupons[0];
          if (latestCoupon && !latestCoupon.isUsed) {
            setSelectedCoupon(latestCoupon);
            setShowCouponModal(true);
            shouldShowCouponModalRef.current = false;
            previousCouponsLengthRef.current = coupons.length;
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    
    previousCouponsLengthRef.current = currentLength;
  }, [coupons]);

  const handleAddStamp = async () => {
    // アニメーション用にターゲットスロットの位置を計算
    if (stampCardRef.current) {
      const stampSlots = stampCardRef.current.querySelectorAll('[data-stamp-slot]');
      const nextStampIndex = currentCard.stamps;
      if (nextStampIndex < stampSlots.length) {
        const targetSlot = stampSlots[nextStampIndex];
        const targetRect = targetSlot.getBoundingClientRect();
        
        // スロットの中心位置を計算（画面中央からの相対位置）
        const x = targetRect.left + (targetRect.width / 2) - window.innerWidth / 2;
        const y = targetRect.top + (targetRect.height / 2) - window.innerHeight / 2;
        
        setAnimationTargetIndex(nextStampIndex);
        setAnimationTargetPosition({ x, y });
        setShowStampAnimation(true);
      }
    }
    
    const result = await addStampSecure();
    if (result.success) {
      toast.success(result.message);
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => setMessage(null), 2000);
      
      if (result.earnedCoupon) {
        // クーポン獲得フラグを設定（useEffectでモーダルを表示）
        shouldShowCouponModalRef.current = true;
      }
    } else {
      toast.error(result.message);
      setMessage({ type: 'error', text: result.message });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUseCoupon = (couponId: string) => {
    useCoupon(couponId);
    toast.success('クーポンを使用しました');
    
    // クーポンモーダルを閉じる
    setShowCouponModal(false);
    
    // ランダムなQRコード値を生成
    const selected = selectedCoupon;
    if (selected) {
      const randomQRCode = `COUPON-${selected.id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      setQrCodeValue(randomQRCode);
      
      // 少し遅延してQRコードモーダルを表示（クーポンモーダルが閉じてから）
      setTimeout(() => {
        setShowQRCodeModal(true);
      }, 300);
    }
  };

  const handleReset = () => {
    if (confirm('スタンプカードをリセットしますか？')) {
      resetCard();
      toast.info('スタンプカードをリセットしました');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-x-hidden" style={{
      backgroundImage: 'url(/5-2-6-3.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-stone-900/40"></div>
      <div className="relative z-10">
        {(loadingAuth || loading) ? (
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" text="読み込み中..." />
          </div>
        ) : (
        <div className="max-w-md mx-auto space-y-6 w-full px-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="text-sm text-white hover:text-gray-200 whitespace-nowrap">
            ← ホームに戻る
          </Link>
          <h1 className="text-xl font-bold text-white">スタンプカード</h1>
          <div className="flex items-center gap-2">
            <Link to="/admin" className="text-xs text-white/80 hover:text-white whitespace-nowrap">
              管理画面
            </Link>
            {firebaseAuth && (
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-white hover:text-gray-200 hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-1" />
                ログアウト
              </Button>
            )}
            {!firebaseAuth && <div className="w-12" />}
          </div>
        </div>

            {/* オフライン/キュー状態表示 */}
            {!isOnline && (
              <Alert className="border-yellow-500 bg-yellow-50/80">
                <AlertDescription className="text-yellow-800">
                  オフラインモード：データはローカルに保存され、接続回復時に同期されます
                </AlertDescription>
              </Alert>
            )}
            {isOnline && queueLength > 0 && (
              <Alert className="border-blue-500 bg-blue-50/80">
                <AlertDescription className="text-blue-800">
                  {queueLength}件のデータを同期中...
                </AlertDescription>
              </Alert>
            )}

            {/* メッセージ表示 */}
            {message && (
              <Alert className="border-2 border-amber-800/60 w-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
                <AlertDescription className="text-stone-800">
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

        {/* スタンプカード */}
        <div ref={stampCardRef}>
          <MobileStampCard
            stamps={currentCard.stamps}
            maxStamps={currentCard.maxStamps}
            progress={progress}
            isAuthenticated={isAuthenticated}
            canAddStampToday={canAddStampToday}
            totalStampsEarned={totalStampsEarned}
            storeName="LotusCard"
          />
        </div>

        {/* スタンプ追加ボタン */}
        <div className="space-y-3">
            {canAddStampToday && (
            <Button
              onClick={handleAddStamp}
              disabled={hasCompletedCard}
              className="w-full bg-stone-600 hover:bg-stone-700 text-white font-semibold py-6 text-lg shadow-sm"
            >
              {hasCompletedCard ? 'カード完成！' : 'スタンプを獲得する'}
            </Button>
          )}

              {/* シミュレーション用：スタンプを1つ追加 */}
              <Button
                onClick={async () => {
                  // アニメーション用にターゲットスロットの位置を計算
                  if (stampCardRef.current) {
                    const stampSlots = stampCardRef.current.querySelectorAll('[data-stamp-slot]');
                    const nextStampIndex = currentCard.stamps;
                    if (nextStampIndex < stampSlots.length) {
                      const targetSlot = stampSlots[nextStampIndex];
                      const targetRect = targetSlot.getBoundingClientRect();
                      
                      // スロットの中心位置を計算（画面中央からの相対位置）
                      const x = targetRect.left + (targetRect.width / 2) - window.innerWidth / 2;
                      const y = targetRect.top + (targetRect.height / 2) - window.innerHeight / 2;
                      
                      setAnimationTargetIndex(nextStampIndex);
                      setAnimationTargetPosition({ x, y });
                      setShowStampAnimation(true);
                    }
                  }
                  
                  const result = await addStampForTest(1);
                  if (result.success) {
                    toast.success(result.message);
                    if (result.earnedCoupon) {
                      // クーポン獲得フラグを設定（useEffectでモーダルを表示）
                      shouldShowCouponModalRef.current = true;
                    }
                  }
                }}
                variant="outline"
                className="w-full text-xs text-white"
              >
                [テスト用] スタンプを1つ追加
              </Button>
        </div>

        {/* タブでクーポン、履歴、バッジを切り替え */}
        <Tabs defaultValue="coupons" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="coupons">クーポン</TabsTrigger>
            <TabsTrigger value="history">履歴</TabsTrigger>
            <TabsTrigger value="badges">バッジ</TabsTrigger>
          </TabsList>

          <TabsContent value="coupons">
            <UICard className="border-2 border-amber-800/60 shadow-lg w-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">獲得したクーポン</h2>
                  {coupons.filter((coupon) => !coupon.isUsed).length > 0 && (
                    <Button
                      onClick={() => {
                        if (confirm('クーポンをすべて削除しますか？')) {
                          resetCoupons();
                          toast.info('クーポンをリセットしました');
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      リセット
                    </Button>
                  )}
                </div>
                {coupons.filter((coupon) => !coupon.isUsed).length > 0 ? (
                  <div className="space-y-3">
                    {coupons.filter((coupon) => !coupon.isUsed).map((coupon) => (
                      <div
                        key={coupon.id}
                        className="flex items-center justify-between p-4 border-2 border-amber-800/50 rounded-lg cursor-pointer transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'}
                        onClick={() => {
                          setSelectedCoupon(coupon);
                          setShowCouponModal(true);
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-stone-700">{coupon.discount}</span>
                          </div>
                          <p className="text-sm font-medium text-stone-800">{coupon.title}</p>
                          <p className="text-xs text-stone-600">{coupon.description}</p>
                        </div>
                        <Circle className="w-5 h-5 text-stone-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-black text-sm py-4">まだクーポンがありません</p>
                )}
              </CardContent>
            </UICard>
          </TabsContent>

          <TabsContent value="history">
            <StampHistory 
              stampHistory={stampHistory || []} 
              totalStampsEarned={totalStampsEarned} 
            />
          </TabsContent>

          <TabsContent value="badges">
            <AchievementBadges 
              totalStampsEarned={totalStampsEarned}
              completedCards={completedCards || 0}
              stampHistory={stampHistory || []}
            />
          </TabsContent>
        </Tabs>
        </div>
        )}
      </div>

      {/* スタンプアニメーション */}
      {showStampAnimation && (
        <StampAnimation
          onComplete={handleStampAnimationComplete}
          targetIndex={animationTargetIndex}
          targetPosition={animationTargetPosition}
        />
      )}

      {/* クーポンモーダル */}
      {selectedCoupon && (
        <CouponModal
          coupon={selectedCoupon}
          open={showCouponModal}
          onClose={() => {
            setShowCouponModal(false);
            setSelectedCoupon(undefined);
          }}
          onUse={() => handleUseCoupon(selectedCoupon.id)}
        />
      )}

      {/* QRコードモーダル */}
      {qrCodeValue && (
        <QRCodeModal
          open={showQRCodeModal}
          onClose={() => {
            setShowQRCodeModal(false);
            setQrCodeValue('');
          }}
          qrCodeValue={qrCodeValue}
          couponTitle={selectedCoupon?.title || 'クーポン'}
        />
      )}
    </div>
  );
}
