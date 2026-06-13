export type PetType = 'cat' | 'dog';

export type Category = 'food' | 'medical' | 'beauty' | 'toy' | 'boarding';

export type ReminderType = 'vaccine' | 'deworming' | 'checkup' | 'other';

export type CycleType = 'monthly' | 'weekly' | 'quarterly' | 'yearly' | 'once';

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  avatar: string;
  created_at: string;
}

export interface ExpenseSplit {
  pet_id: string;
  amount: number;
  percentage?: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  pet_id: string;
  merchant: string;
  quantity: number;
  remark: string;
  receipt: string;
  is_fixed: boolean;
  cycle_type?: CycleType;
  next_generate_date?: string;
  splits?: ExpenseSplit[];
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  month: string;
  total_budget: number;
  category_budgets: Record<Category, number>;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  category: Category;
  avg_price: number;
  last_price: number;
  stock_count: number;
  remind_threshold: number;
  created_at: string;
}

export interface Reminder {
  id: string;
  pet_id: string;
  type: ReminderType;
  next_date: string;
  remind_days: number;
  is_processed: boolean;
  last_processed_date?: string;
  created_at: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  pet_id: string;
  merchant: string;
  cycle_type: CycleType;
  next_generate_date: string;
  is_active: boolean;
  splits?: ExpenseSplit[];
  created_at: string;
}

export interface AppState {
  pets: Pet[];
  expenses: Expense[];
  budgets: Budget[];
  items: Item[];
  reminders: Reminder[];
  fixedExpenses: FixedExpense[];
  selectedPetId: string | null;
  currentMonth: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  food: '食品',
  medical: '医疗',
  beauty: '美容',
  toy: '玩具',
  boarding: '寄养',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  food: '#FFB347',
  medical: '#FF6B6B',
  beauty: '#DDA0DD',
  toy: '#98D8C8',
  boarding: '#87CEEB',
};

export const CYCLE_LABELS: Record<CycleType, string> = {
  monthly: '每月',
  weekly: '每周',
  quarterly: '每季度',
  yearly: '每年',
  once: '一次性',
};
