import { useCallback, useMemo, useState } from 'react';
import type { Coupon } from '../lib/types';

type ActionResult = { success: boolean; message: string; earnedCoupon?: boolean };

const STORAGE_KEY = 'stampapp:v1';

type Persisted = {
  isAuthenticated: boolean;
  lastStampDate?: string;
  card: { stamps: number; maxStamps: number };
  coupons: Coupon[];
  totalStamps: number;
};

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('empty');
    const parsed = JSON.parse(raw);
      return {
        ...parsed,
        coupons: (parsed.coupons || []).map((c: any) => ({
          ...c,
          expiresAt: new Date(c.expiresAt),
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        })),
        stampHistory: parsed.stampHistory || [],
        completedCards: parsed.completedCards || 0,
      } as Persisted;
  } catch {
      return {
        isAuthenticated: false,
        card: { stamps: 0, maxStamps: 10 },
        coupons: [],
        totalStamps: 0,
        stampHistory: [],
        completedCards: 0,
      };
  }
}

function save(state: Persisted) {
  const data = {
    ...state,
    coupons: state.coupons.map(c => ({
      ...c,
      expiresAt: c.expiresAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
    })),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useSecureStampCard() {
  const [state, setState] = useState<Persisted>(() => {
    const loaded = load();
    // maxStampsを10に統一、初期値を設定
    if (loaded.card.maxStamps !== 10 || !loaded.stampHistory || !('completedCards' in loaded)) {
      const updated = {
        ...loaded,
        card: { ...loaded.card, maxStamps: 10 },
        stampHistory: loaded.stampHistory || [],
        completedCards: loaded.completedCards || 0,
      };
      save(updated);
      return updated;
    }
    return loaded;
  });

  const persist = useCallback((update: Partial<Persisted>) => {
    setState(prev => {
      const next = { ...prev, ...update } as Persisted;
      save(next);
      return next;
    });
  }, []);

  const isAuthenticated = state.isAuthenticated;
  const currentCard = state.card;
  const coupons = state.coupons;
  const totalStampsEarned = state.totalStamps;

  // ログイン機能を一時的に無効化（常にスタンプ追加可能）
  const canAddStampToday = useMemo(() => {
    // if (!isAuthenticated) return false; // ログインチェックを一時的に無効化
    if (!state.lastStampDate) return true;
    const last = new Date(state.lastStampDate);
    const now = new Date();
    return last.toDateString() !== now.toDateString();
  }, [/* isAuthenticated, */ state.lastStampDate]);

  const hasCompletedCard = currentCard.stamps >= currentCard.maxStamps;
  const progress = Math.min(100, (currentCard.stamps / currentCard.maxStamps) * 100);

  const loginWithQR = useCallback((qrCode: string): ActionResult => {
    if (!qrCode) return { success: false, message: 'QRコードが空です' };
    persist({ isAuthenticated: true });
    return { success: true, message: 'ログインしました' };
  }, [persist]);

  const addStampSecure = useCallback(async (): Promise<ActionResult> => {
    // ログインチェックを一時的に無効化
    // if (!isAuthenticated) return { success: false, message: 'ログインが必要です' };
    if (!canAddStampToday) return { success: false, message: '本日のスタンプは獲得済みです' };

    const nextStamps = Math.min(currentCard.stamps + 1, currentCard.maxStamps);
    let earnedCoupon = false;
    let nextCoupons = coupons;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // スタンプ履歴に追加
    const newHistory = [...state.stampHistory];
    const todayHistory = newHistory.find(h => h.date === today);
    if (todayHistory) {
      todayHistory.count += 1;
    } else {
      newHistory.push({ date: today, count: 1 });
    }
    
    // カード完成数のカウント
    let newCompletedCards = state.completedCards;
    if (nextStamps === currentCard.maxStamps && currentCard.stamps < currentCard.maxStamps) {
      newCompletedCards += 1;
    }
    
    // 5個でドリンク1杯無料クーポン
    if (nextStamps === 5) {
      earnedCoupon = true;
      const coupon: Coupon = {
        id: crypto.randomUUID(),
        title: 'ドリンク1杯無料',
        description: 'お好きなドリンクを1杯無料でサービス',
        discount: 'ドリンク無料',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isUsed: false,
        createdAt: now,
      };
      nextCoupons = [coupon, ...coupons];
    }
    
    // 10個で10%オフクーポン
    if (nextStamps === 10) {
      earnedCoupon = true;
      const coupon: Coupon = {
        id: crypto.randomUUID(),
        title: '次回10%OFF',
        description: 'ご飲食代から10%お値引き',
        discount: '10% OFF',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isUsed: false,
        createdAt: now,
      };
      nextCoupons = [coupon, ...coupons];
    }

    const newTotalStamps = state.totalStamps + 1;
    let shouldReset = false;
    
    // 累計スタンプが10の倍数になったらリセット
    if (newTotalStamps > 0 && newTotalStamps % 10 === 0) {
      shouldReset = true;
    }

    persist({
      card: { ...currentCard, stamps: shouldReset ? 0 : nextStamps },
      lastStampDate: shouldReset ? undefined : new Date().toISOString(),
      coupons: nextCoupons,
      totalStamps: newTotalStamps,
      stampHistory: newHistory,
      completedCards: newCompletedCards,
    });

    const message = shouldReset 
      ? 'スタンプを獲得しました！累計スタンプが10の倍数になったのでリセットされました' 
      : 'スタンプを獲得しました';

    return { success: true, message, earnedCoupon };
  }, [isAuthenticated, canAddStampToday, currentCard, coupons, persist, state.totalStamps]);

  const useCoupon = useCallback((couponId: string) => {
    const updated = coupons.map(c => c.id === couponId ? { ...c, isUsed: true } : c);
    persist({ coupons: updated });
  }, [coupons, persist]);

  const logout = useCallback(() => {
    persist({ isAuthenticated: false });
  }, [persist]);

  const resetCard = useCallback(() => {
    persist({ card: { stamps: 0, maxStamps: currentCard.maxStamps }, lastStampDate: undefined });
  }, [currentCard.maxStamps, persist]);

  const resetCoupons = useCallback(() => {
    persist({ coupons: [] });
  }, [persist]);

  // テスト用：制限を無視してスタンプを追加
  const addStampForTest = useCallback(async (count: number = 1): Promise<ActionResult> => {
    const currentStamps = currentCard.stamps;
    const newStamps = Math.min(currentStamps + count, currentCard.maxStamps);
    let earnedCoupon = false;
    let nextCoupons = coupons;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // スタンプ履歴に追加
    const newHistory = [...state.stampHistory];
    const todayHistory = newHistory.find(h => h.date === today);
    if (todayHistory) {
      todayHistory.count += count;
    } else {
      newHistory.push({ date: today, count });
    }
    
    // カード完成数のカウント
    let newCompletedCards = state.completedCards;
    if (newStamps === currentCard.maxStamps && currentStamps < currentCard.maxStamps) {
      newCompletedCards += 1;
    }
    
    // 5個でドリンク1杯無料クーポン
    if (currentStamps < 5 && newStamps >= 5) {
      earnedCoupon = true;
      const coupon: Coupon = {
        id: crypto.randomUUID(),
        title: 'ドリンク1杯無料',
        description: 'お好きなドリンクを1杯無料でサービス',
        discount: 'ドリンク無料',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isUsed: false,
        createdAt: now,
      };
      nextCoupons = [coupon, ...coupons];
    }
    
    // 10個で10%オフクーポン
    if (currentStamps < 10 && newStamps >= 10) {
      earnedCoupon = true;
      const coupon: Coupon = {
        id: crypto.randomUUID(),
        title: '次回10%OFF',
        description: 'ご飲食代から10%お値引き',
        discount: '10% OFF',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isUsed: false,
        createdAt: now,
      };
      nextCoupons = [coupon, ...nextCoupons];
    }

    const newTotalStamps = state.totalStamps + count;
    let shouldReset = false;
    
    // 累計スタンプが10の倍数になったらリセット
    if (newTotalStamps > 0 && newTotalStamps % 10 === 0) {
      shouldReset = true;
    }

    persist({
      card: { ...currentCard, stamps: shouldReset ? 0 : newStamps },
      lastStampDate: shouldReset ? undefined : new Date().toISOString(),
      coupons: nextCoupons,
      totalStamps: newTotalStamps,
      stampHistory: newHistory,
      completedCards: newCompletedCards,
    });

    const message = shouldReset 
      ? `${count}個のスタンプを追加しました！累計スタンプが10の倍数になったのでリセットされました` 
      : `${count}個のスタンプを追加しました`;

    return { success: true, message, earnedCoupon };
  }, [currentCard, coupons, persist, state.totalStamps, state.stampHistory, state.completedCards]);

  return {
    currentCard,
    coupons: coupons.filter(c => !c.isUsed), // 使用済みクーポンは除外
    totalStampsEarned,
    progress,
    isAuthenticated,
    canAddStampToday,
    hasCompletedCard,
    stampHistory: state.stampHistory || [],
    completedCards: state.completedCards || 0,
    loginWithQR,
    addStampSecure,
    logout,
    useCoupon,
    resetCard,
    resetCoupons,
    addStampForTest, // テスト用
  };
}


