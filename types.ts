
export interface Task {
  id: string;
  name: string;
  description: string;
  category: string;
  reward: number;
  link: string;
  completedBy: string[]; // IP addresses
}

export interface Coupon {
  id: string;
  code: string;
  reward: number;
  limit: number;
  usedCount: number;
  expiryDate: string;
  usedBy: string[]; // IP addresses
}

export interface UserProfile {
  ip: string;
  coins: number;
  lastDailyBonus: string | null;
  tasksCompleted: string[];
  couponsUsed: string[];
  isBlocked: boolean;
  isFirstVisit: boolean;
  referralCode: string;
  referredBy: string | null;
}

export interface Game {
  id: string;
  name: string;
  type: 'match' | 'puzzle' | 'clicker';
  baseReward: number;
  enabled: boolean;
}

export interface WithdrawalRequest {
  id: string;
  ip: string;
  address: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface AdPlacement {
  id: string;
  code: string;
  location: 'main' | 'tasks' | 'games' | 'coupons' | 'bonus' | 'all';
  enabled: boolean;
}

export interface AppSettings {
  withdrawEnabled: boolean;
  minWithdraw: number;
  dailyBonus: number;
  referralBonus: number;
  adPlacements: AdPlacement[];
}
