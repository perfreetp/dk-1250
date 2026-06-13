export type PetType = 'cat' | 'dog';

export type Category = 'food' | 'medical' | 'beauty' | 'toy' | 'boarding';

export type ReminderType = 'vaccine' | 'deworming' | 'checkup' | 'other';

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  avatar: string;
  created_at: string;
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
  created_at: string;
}

export interface AppState {
  pets: Pet[];
  expenses: Expense[];
  budgets: Budget[];
  items: Item[];
  reminders: Reminder[];
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
