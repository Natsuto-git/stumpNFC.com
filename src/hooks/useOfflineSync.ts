import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface OfflineQueueItem {
  id: string;
  type: 'addStamp' | 'useCoupon' | 'updateData';
  data: any;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = 'stampapp:offline-queue';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueLength, setQueueLength] = useState(0);

  // オンライン/オフライン状態の監視
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // オフラインキューを取得
  const getQueue = useCallback((): OfflineQueueItem[] => {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // オフラインキューを保存
  const saveQueue = useCallback((queue: OfflineQueueItem[]) => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      setQueueLength(queue.length);
    } catch (error) {
      console.error('キュー保存エラー:', error);
    }
  }, []);

  // キューにアイテムを追加
  const addToQueue = useCallback((item: Omit<OfflineQueueItem, 'id' | 'timestamp'>) => {
    const queue = getQueue();
    const newItem: OfflineQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    queue.push(newItem);
    saveQueue(queue);
  }, [getQueue, saveQueue]);

  // キューを同期
  const syncQueue = useCallback(async () => {
    if (!isOnline || !auth.currentUser) return;

    const queue = getQueue();
    if (queue.length === 0) return;

    const user = auth.currentUser;
    const syncedItems: string[] = [];

    for (const item of queue) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const currentData = userDoc.exists() ? userDoc.data() : {};

        if (item.type === 'addStamp' || item.type === 'updateData') {
          await setDoc(userRef, {
            ...currentData,
            ...item.data,
          }, { merge: true });
          syncedItems.push(item.id);
        }
      } catch (error) {
        console.error('同期エラー:', error);
        // エラーが発生した場合は後で再試行
        break;
      }
    }

    // 同期成功したアイテムをキューから削除
    if (syncedItems.length > 0) {
      const remainingQueue = queue.filter(item => !syncedItems.includes(item.id));
      saveQueue(remainingQueue);
    }
  }, [isOnline, getQueue, saveQueue]);

  // キューをクリア
  const clearQueue = useCallback(() => {
    saveQueue([]);
  }, [saveQueue]);

  // 定期的にキューをチェック（オンライン時）
  useEffect(() => {
    if (isOnline && auth.currentUser) {
      syncQueue();
      const interval = setInterval(syncQueue, 30000); // 30秒ごと
      return () => clearInterval(interval);
    }
  }, [isOnline, syncQueue]);

  // 初期化時にキュー長を取得
  useEffect(() => {
    setQueueLength(getQueue().length);
  }, [getQueue]);

  return {
    isOnline,
    queueLength,
    addToQueue,
    syncQueue,
    clearQueue,
  };
}

