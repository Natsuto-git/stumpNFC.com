import { useCallback, useMemo, useState } from 'react';
import type { Coupon } from '../lib/types';

type ActionResult = { success: boolean; message: string; earnedCoupon?: boolean };

const STORAGE_KEY = 'stampapp:v1';

type Persisted = {
  isAuthenticated: boolean;
  lastStampDate?: string;
  card: StampCardState;
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
      coupons: (parsed.coupons || []).map((c: any) => ({ ...c, expiresAt: new Date(c.expiresAt) })),
    } as Persisted;
  } catch {
    return {
      isAuthenticated: false,
      card: { stamps: 0, maxStamps: 10 },
      coupons: [],
      totalStamps: 0,
    };
  }
}

function save(state: Persisted) {
  const data = { ...state, coupons: state.coupons.map(c => ({ ...c, expiresAt: c.expiresAt.toISOString() })) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useSecureStampCard() {
  const [state, setState] = useState<Persisted>(() => load());

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

  const canAddStampToday = useMemo(() => {
    if (!isAuthenticated) return false;
    if (!state.lastStampDate) return true;
    const last = new Date(state.lastStampDate);
    const now = new Date();
    return last.toDateString() !== now.toDateString();
  }, [isAuthenticated, state.lastStampDate]);

  const hasCompletedCard = currentCard.stamps >= currentCard.maxStamps;
  const progress = Math.min(100, (currentCard.stamps / currentCard.maxStamps) * 100);

  const loginWithQR = useCallback((qrCode: string): ActionResult => {
    if (!qrCode) return { success: false, message: 'QRコードが空です' };
    persist({ isAuthenticated: true });
    return { success: true, message: 'ログインしました' };
  }, [persist]);

  const addStampSecure = useCallback((): ActionResult => {
    if (!isAuthenticated) return { success: false, message: 'ログインが必要です' };
    if (!canAddStampToday) return { success: false, message: '本日のスタンプは獲得済みです' };

    const nextStamps = Math.min(currentCard.stamps + 1, currentCard.maxStamps);
    const completed = nextStamps === currentCard.maxStamps;
    let earnedCoupon = false;
    let nextCoupons = coupons;
    if (completed) {
      earnedCoupon = true;
      const coupon: Coupon = {
        id: crypto.randomUUID(),
        title: '次回10%OFF',
        description: 'ご飲食代から10%お値引き',
        discount: '10% OFF',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isUsed: false,
      };
      nextCoupons = [coupon, ...coupons];
    }

    persist({
      card: { ...currentCard, stamps: nextStamps },
      lastStampDate: new Date().toISOString(),
      coupons: nextCoupons,
      totalStamps: state.totalStamps + 1,
    });

    return { success: true, message: 'スタンプを獲得しました', earnedCoupon };
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

  return {
    currentCard,
    coupons,
    totalStampsEarned,
    progress,
    isAuthenticated,
    canAddStampToday,
    hasCompletedCard,
    loginWithQR,
    addStampSecure,
    logout,
    useCoupon,
    resetCard,
  };
}


