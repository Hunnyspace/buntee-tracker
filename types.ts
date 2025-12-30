
export type UserRole = 'OWNER' | 'PARTNER';

export interface User {
  uid: string;
  email: string | null;
  role: UserRole;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  bunsSold: number;
  pricePerBun: number;
  otherSales: number;
  revenue: number;
  ingredientsCost: number;
  gasCost: number;
  packagingCost: number;
  miscCost: number;
  totalExpenses: number;
  netProfit: number;
  ownerSharePercent: number;
  partnerSharePercent: number;
  ownerAmount: number;
  partnerAmount: number;
  createdAt: any; // Firestore Timestamp
}

export interface MonthlySummary {
  month: string;
  totalBuns: number;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalOwnerPayout: number;
  totalPartnerPayout: number;
}
