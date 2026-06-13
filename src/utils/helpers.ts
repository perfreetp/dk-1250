import { format } from 'date-fns';
import { Expense, Category, Budget, ExpenseSplit } from '../types';

const STORAGE_KEYS = {
  PETS: 'pet_expense_tracker_pets',
  EXPENSES: 'pet_expense_tracker_expenses',
  BUDGETS: 'pet_expense_tracker_budgets',
  ITEMS: 'pet_expense_tracker_items',
  REMINDERS: 'pet_expense_tracker_reminders',
  FIXED_EXPENSES: 'pet_expense_tracker_fixed_expenses',
};

export const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

export const getCurrentMonth = () => format(new Date(), 'yyyy-MM');

export const calculateSplitAmount = (expense: Expense): { [petId: string]: number } => {
  const result: { [petId: string]: number } = {};
  
  if (expense.splits && expense.splits.length > 0) {
    expense.splits.forEach(split => {
      result[split.pet_id] = split.amount;
    });
  } else {
    result[expense.pet_id] = expense.amount;
  }
  
  return result;
};

export const getMonthlyTotal = (expenses: Expense[], month: string) => {
  return expenses
    .filter(e => e.created_at.startsWith(month))
    .reduce((sum, e) => {
      const splits = calculateSplitAmount(e);
      return sum + Object.values(splits).reduce((s, a) => s + a, 0);
    }, 0);
};

export const getCategoryTotal = (expenses: Expense[], month: string, category: Category) => {
  return expenses
    .filter(e => e.created_at.startsWith(month) && e.category === category)
    .reduce((sum, e) => {
      const splits = calculateSplitAmount(e);
      return sum + Object.values(splits).reduce((s, a) => s + a, 0);
    }, 0);
};

export const getPetTotal = (expenses: Expense[], month: string, petId: string) => {
  return expenses
    .filter(e => e.created_at.startsWith(month))
    .reduce((sum, e) => {
      const splits = calculateSplitAmount(e);
      return sum + (splits[petId] || 0);
    }, 0);
};

export const getFilteredExpenses = (
  expenses: Expense[],
  month: string,
  petId?: string | null,
  category?: Category | null
) => {
  let filtered = expenses.filter(e => e.created_at.startsWith(month));
  
  if (petId) {
    filtered = filtered.filter(e => {
      const splits = calculateSplitAmount(e);
      return splits[petId] !== undefined;
    });
  }
  
  if (category) {
    filtered = filtered.filter(e => e.category === category);
  }
  
  return filtered;
};

export const getExpandedSplits = (expenses: Expense[]): { pet_id: string; expense: Expense; split_amount: number }[] => {
  const result: { pet_id: string; expense: Expense; split_amount: number }[] = [];
  
  expenses.forEach(expense => {
    const splits = calculateSplitAmount(expense);
    Object.entries(splits).forEach(([petId, amount]) => {
      result.push({ pet_id: petId, expense, split_amount: amount });
    });
  });
  
  return result;
};

export const detectAnomaly = (expense: Expense, historicalExpenses: Expense[]) => {
  const categoryExpenses = historicalExpenses.filter(e => e.category === expense.category);
  if (categoryExpenses.length === 0) return false;
  
  const totalAmount = categoryExpenses.reduce((sum, e) => {
    const splits = calculateSplitAmount(e);
    return sum + Object.values(splits).reduce((s, a) => s + a, 0);
  }, 0);
  
  const avgAmount = totalAmount / categoryExpenses.length;
  const expenseTotal = Object.values(calculateSplitAmount(expense)).reduce((s, a) => s + a, 0);
  
  return expenseTotal > avgAmount * 2;
};

export const calculateAvgPrice = (purchases: { price: number }[]) => {
  if (purchases.length === 0) return 0;
  const total = purchases.reduce((sum, p) => sum + p.price, 0);
  return total / purchases.length;
};

export const checkReminders = (reminders: { next_date: string; remind_days: number; is_processed?: boolean }[]) => {
  const today = new Date();
  return reminders
    .filter(r => !r.is_processed)
    .filter(r => {
      const nextDate = new Date(r.next_date);
      const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= r.remind_days && daysUntil >= 0;
    });
};

export const formatCurrency = (amount: number) => {
  return `¥${amount.toFixed(2)}`;
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return format(date, 'MM月dd日');
};

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export { STORAGE_KEYS };
