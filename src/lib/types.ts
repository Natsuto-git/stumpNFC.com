export interface StampCard {
  id: string;
  stamps: number;
  maxStamps: number;
  createdAt: Date;
  lastStampAt?: Date;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  isUsed: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface QRSession {
  sessionId: string;
  qrCode: string;
  isValid: boolean;
  expiresAt: Date;
  usedToday: boolean;
  lastUsedDate?: string;
}

export interface StampCardState {
  currentCard: StampCard;
  coupons: Coupon[];
  totalStampsEarned: number;
  qrSession?: QRSession;
  isAuthenticated: boolean;
}

export interface QRLoginData {
  qrCode: string;
  timestamp: number;
  sessionId: string;
}


