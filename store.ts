
import { Task, Coupon, UserProfile, Game, WithdrawalRequest, AppSettings, AdPlacement } from './types';

const STORAGE_KEYS = {
  TASKS: 'coinrush_tasks',
  COUPONS: 'coinrush_coupons',
  USERS: 'coinrush_users',
  GAMES: 'coinrush_games',
  WITHDRAWALS: 'coinrush_withdrawals',
  SETTINGS: 'coinrush_settings',
  ADMIN_LOGGED_IN: 'coinrush_admin_status'
};

const DEFAULT_SETTINGS: AppSettings = {
  withdrawEnabled: false,
  minWithdraw: 100,
  dailyBonus: 10,
  referralBonus: 50,
  adPlacements: [
    { id: 'ad1', code: '<div style="color: #666; font-size: 10px; text-align: center;">Sample Ad Banner</div>', location: 'main', enabled: true }
  ]
};

const INITIAL_TASKS: Task[] = [
  { id: '1', name: 'Follow our Telegram', description: 'Join our official channel for latest updates.', category: 'Telegram', reward: 50, link: 'https://t.me/example', completedBy: [] },
  { id: '2', name: 'Watch YouTube Video', description: 'Watch the full video to unlock rewards.', category: 'YouTube', reward: 100, link: 'https://youtube.com', completedBy: [] },
  { id: '3', name: 'Visit our Partner Site', description: 'Check out our new partner website for 20 seconds.', category: 'Website visit', reward: 30, link: 'https://google.com', completedBy: [] },
];

const INITIAL_GAMES: Game[] = [
  { id: 'g1', name: 'Gem Matcher', type: 'match', baseReward: 10, enabled: true },
  { id: 'g2', name: 'Speed Clicker', type: 'puzzle', baseReward: 15, enabled: true },
];

export const getStore = () => {
  const tasks: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || JSON.stringify(INITIAL_TASKS));
  const coupons: Coupon[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
  const users: UserProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const games: Game[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAMES) || JSON.stringify(INITIAL_GAMES));
  const withdrawals: WithdrawalRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.WITHDRAWALS) || '[]');
  const settings: AppSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));
  
  return { tasks, coupons, users, games, withdrawals, settings };
};

export const saveStore = (data: { 
  tasks?: Task[], 
  coupons?: Coupon[], 
  users?: UserProfile[], 
  games?: Game[], 
  withdrawals?: WithdrawalRequest[], 
  settings?: AppSettings 
}) => {
  if (data.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
  if (data.coupons) localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(data.coupons));
  if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
  if (data.games) localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(data.games));
  if (data.withdrawals) localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(data.withdrawals));
  if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
};

export const getAdminStatus = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_LOGGED_IN) === 'true';
};

export const setAdminStatus = (status: boolean) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_LOGGED_IN, status.toString());
};
