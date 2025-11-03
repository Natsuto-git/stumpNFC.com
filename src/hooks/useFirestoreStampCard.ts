import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Coupon } from '@/lib/types';

type ActionResult = { success: boolean; message: string; earnedCoupon?: boolean };

type StampCardData = {
  stamps: number;
  maxStamps: number;
  totalStamps: number;
  lastStampDate?: string;
  coupons: Coupon[];
  stampHistory: Array<{
    date: string;
    count: number;
  }>;
  completedCards: number;
};

const DEFAULT_DATA: StampCardData = {
  stamps: 3,
  maxStamps: 10,
  totalStamps: 3,
  coupons: [],
  stampHistory: [],
  completedCards: 0,
};

async function loadFromFirestore(): Promise<StampCardData> {
  const user = auth.currentUser;
  if (!user) {
    return DEFAULT_DATA;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        stamps: data.stamps || DEFAULT_DATA.stamps,
        maxStamps: data.maxStamps || DEFAULT_DATA.maxStamps,
        totalStamps: data.totalStamps || DEFAULT_DATA.totalStamps,
        lastStampDate: data.lastStampDate || undefined,
        coupons: (data.coupons || []).map((c: any) => ({
          ...c,
          expiresAt: c.expiresAt?.toDate ? c.expiresAt.toDate() : new Date(c.expiresAt),
          createdAt: c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt || Date.now()),
        })),
        stampHistory: data.stampHistory || [],
        completedCards: data.completedCards || 0,
      };
    }
  } catch (error) {
    console.error('Firestore読み込みエラー:', error);
  }

  return DEFAULT_DATA;
}

async function saveToFirestore(data: StampCardData): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    return;
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      ...data,
      coupons: data.coupons.map(c => ({
        ...c,
        expiresAt: c.expiresAt.toISOString(),
        createdAt: c.createdAt.toISOString(),
      })),
    }, { merge: true });
  } catch (error) {
    console.error('Firestore保存エラー:', error);
    throw error;
  }
}

export function useFirestoreStampCard() {
  const [data, setData] = useState<StampCardData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        setLoading(true);
        const loadedData = await loadFromFirestore();
        setData(loadedData);
        setLoading(false);
      } else {
        setData(DEFAULT_DATA);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const save = useCallback(async (update: Partial<StampCardData>) => {
    const newData = { ...data, ...update };
    setData(newData);
    
    if (auth.currentUser) {
      try {
        await saveToFirestore(newData);
      } catch (error) {
        console.error('保存失敗:', error);
      }
    }
  }, [data]);

  const addStamp = useCallback(async (): Promise<ActionResult> => {
    if (!isAuthenticated) {
      return { success: false, message: 'ログインが必要です' };
    }

    const today = new Date().toISOString().split('T')[0];
    if (data.lastStampDate === today) {
      return { success: false, message: '本日のスタンプは獲得済みです' };
    }

    const currentStamps = data.stamps;
    const nextStamps = Math.min(currentStamps + 1, data.maxStamps);
    const newTotalStamps = data.totalStamps + 1;
    let earnedCoupon = false;
    let nextCoupons = [...data.coupons];
    const now = new Date();
    
    // カード完成数のカウント
    let newCompletedCards = data.completedCards;
    if (nextStamps === data.maxStamps && currentStamps < data.maxStamps) {
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
      nextCoupons = [coupon, ...nextCoupons];
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
      nextCoupons = [coupon, ...nextCoupons];
    }

    // スタンプ履歴に追加
    const newHistory = [...data.stampHistory];
    const todayHistory = newHistory.find(h => h.date === today);
    if (todayHistory) {
      todayHistory.count += 1;
    } else {
      newHistory.push({ date: today, count: 1 });
    }

    let shouldReset = false;
    if (newTotalStamps > 0 && newTotalStamps % 10 === 0) {
      shouldReset = true;
    }

    await save({
      stamps: shouldReset ? 0 : nextStamps,
      totalStamps: newTotalStamps,
      lastStampDate: shouldReset ? undefined : today,
      coupons: nextCoupons,
      stampHistory: newHistory,
      completedCards: newCompletedCards,
    });

    const message = shouldReset
      ? 'スタンプを獲得しました！累計スタンプが10の倍数になったのでリセットされました'
      : 'スタンプを獲得しました';

    return { success: true, message, earnedCoupon };
  }, [data, isAuthenticated, save]);

  const useCoupon = useCallback(async (couponId: string) => {
    const updatedCoupons = data.coupons.map(c =>
      c.id === couponId ? { ...c, isUsed: true } : c
    );
    await save({ coupons: updatedCoupons });
  }, [data.coupons, save]);

  const resetCoupons = useCallback(async () => {
    await save({ coupons: [] });
  }, [save]);

  const addStampForTest = useCallback(async (count: number = 1): Promise<ActionResult> => {
    if (!isAuthenticated) {
      return { success: false, message: 'ログインが必要です' };
    }

    const currentStamps = data.stamps;
    const newStamps = Math.min(currentStamps + count, data.maxStamps);
    const newTotalStamps = data.totalStamps + count;
    let earnedCoupon = false;
    let nextCoupons = [...data.coupons];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // スタンプ履歴に追加
    const newHistory = [...data.stampHistory];
    const todayHistory = newHistory.find(h => h.date === today);
    if (todayHistory) {
      todayHistory.count += count;
    } else {
      newHistory.push({ date: today, count });
    }
    
    // カード完成数のカウント
    let newCompletedCards = data.completedCards;
    if (newStamps === data.maxStamps && currentStamps < data.maxStamps) {
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
      nextCoupons = [coupon, ...nextCoupons];
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

    let shouldReset = false;
    if (newTotalStamps > 0 && newTotalStamps % 10 === 0) {
      shouldReset = true;
    }

    await save({
      stamps: shouldReset ? 0 : newStamps,
      totalStamps: newTotalStamps,
      lastStampDate: shouldReset ? undefined : today,
      coupons: nextCoupons,
      stampHistory: newHistory,
      completedCards: newCompletedCards,
    });

    const message = shouldReset 
      ? `${count}個のスタンプを追加しました！累計スタンプが10の倍数になったのでリセットされました` 
      : `${count}個のスタンプを追加しました`;

    return { success: true, message, earnedCoupon };
  }, [data, isAuthenticated, save]);

  const progress = Math.min(100, (data.stamps / data.maxStamps) * 100);
  const canAddStampToday = !data.lastStampDate || data.lastStampDate !== new Date().toISOString().split('T')[0];
  const hasCompletedCard = data.stamps >= data.maxStamps;

  return {
    currentCard: { stamps: data.stamps, maxStamps: data.maxStamps },
    coupons: data.coupons.filter(c => !c.isUsed),
    totalStampsEarned: data.totalStamps,
    progress,
    isAuthenticated,
    canAddStampToday,
    hasCompletedCard,
    loading,
    stampHistory: data.stampHistory,
    completedCards: data.completedCards || 0,
    addStampSecure: addStamp,
    useCoupon,
    resetCoupons,
    addStampForTest,
  };
}

