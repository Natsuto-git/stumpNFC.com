// セキュリティ関連のユーティリティ関数

export const generateSessionId = (): string => {
  return crypto.randomUUID();
};

export const generateQRCode = (): string => {
  // 実際のQRコードは店舗側で管理される想定
  // ここではデモ用のコードを生成
  const codes = ['STORE001', 'STORE002', 'STORE003'];
  return codes[Math.floor(Math.random() * codes.length)];
};

export const validateQRCode = (qrCode: string): boolean => {
  // 実際の実装では、サーバーサイドでの検証が必要
  // デモ用の簡易検証
  const validCodes = ['STORE001', 'STORE002', 'STORE003', 'DEMO123'];
  return validCodes.includes(qrCode);
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const canAddStampToday = (lastUsedDate?: string): boolean => {
  const today = getTodayDateString();
  return !lastUsedDate || lastUsedDate !== today;
};

export const createSecureSession = (qrCode: string) => {
  return {
    sessionId: generateSessionId(),
    qrCode,
    isValid: true,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24時間後
    usedToday: false,
    lastUsedDate: undefined,
  };
};

// 時間ベースの追加セキュリティ
export const isWithinBusinessHours = (): boolean => {
  const now = new Date();
  const hour = now.getHours();
  // 営業時間を11:00-22:00と仮定
  return hour >= 11 && hour <= 22;
};


