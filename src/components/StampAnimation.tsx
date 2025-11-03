import { useEffect, useState, useRef } from 'react';

interface StampAnimationProps {
  onComplete: () => void;
  targetIndex: number;
  targetPosition?: { x: number; y: number }; // ターゲットスロットの位置
}

export const StampAnimation = ({ onComplete, targetIndex, targetPosition }: StampAnimationProps) => {
  const [phase, setPhase] = useState<'idle' | 'appear' | 'fly' | 'complete'>('idle');
  const flyerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // アニメーション開始
    setPhase('appear');

    // オーバーレイを表示（薄く）
    if (overlayRef.current) {
      overlayRef.current.style.opacity = '0.3';
      overlayRef.current.style.visibility = 'visible';
    }

    // ステップ1: 画面中央に大きく表示（ポン！）- ゆっくり表示
    if (flyerRef.current) {
      // 登場アニメーション用のトランジション設定（ゆっくり）
      flyerRef.current.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1.2), opacity 0.5s ease-out';
      flyerRef.current.style.opacity = '1';
      flyerRef.current.style.transform = 'translate(-50%, -50%) scale(2.5)'; // 1.2から2.5に拡大
    }

    // ステップ2: 0.6秒後にターゲットに移動（ヒュッ！）- 登場がゆっくりなのでタイミングも調整
    const flyTimer = setTimeout(() => {
      setPhase('fly');
      
      if (flyerRef.current && targetPosition) {
        // 移動アニメーション用のトランジションに変更
        flyerRef.current.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.4s ease-in, left 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55), top 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
        
        // 画面中央を基準とした相対位置を絶対位置に変換
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const x = centerX + targetPosition.x;
        const y = centerY + targetPosition.y;
        
        // フライヤーのサイズを考慮した位置調整
        flyerRef.current.style.left = `${x}px`;
        flyerRef.current.style.top = `${y}px`;
        flyerRef.current.style.transform = 'translate(-50%, -50%) scale(0.2)';
        flyerRef.current.style.opacity = '0';
      }
    }, 600); // 0.6秒後に移動開始

    // ステップ3: 1.2秒後に完了（0.6秒 + 0.6秒）
    const completeTimer = setTimeout(() => {
      setPhase('complete');
      
      // フライヤーを初期状態にリセット
      if (flyerRef.current) {
        flyerRef.current.style.transition = 'none';
        flyerRef.current.style.transform = 'translate(-50%, -50%) scale(0.5)';
        flyerRef.current.style.opacity = '0';
        
        // トランジションを元に戻す
        setTimeout(() => {
          if (flyerRef.current) {
            flyerRef.current.style.transition = '';
            flyerRef.current.style.left = '50%';
            flyerRef.current.style.top = '50%';
          }
        }, 50);
      }
      
      // オーバーレイを非表示
      if (overlayRef.current) {
        overlayRef.current.style.opacity = '0';
        overlayRef.current.style.visibility = 'hidden';
      }
      
      onComplete();
    }, 1200); // 0.6秒 + 0.6秒 = 1.2秒

    return () => {
      clearTimeout(flyTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, targetPosition]);

  // スタンプ画像を交互に使用
  const stampImage = targetIndex % 2 === 0 ? '/stamp-filled.png' : '/stamp-empty.png';

  return (
    <>
      {/* オーバーレイ（画面を薄く暗くするエフェクト） */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black z-[999] pointer-events-none"
        style={{
          opacity: 0,
          visibility: 'hidden',
          transition: 'opacity 0.5s ease-out',
        }}
      />
      
      {/* フライヤー（飛行するスタンプ） */}
      <div
        ref={flyerRef}
        className="fixed z-[1000] pointer-events-none"
        style={{
          backgroundImage: `url(${encodeURI(stampImage)})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '100px',
          height: '100px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(0)',
          opacity: 0,
        }}
      />
    </>
  );
};
