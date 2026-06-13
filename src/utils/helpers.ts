import { format } from 'date-fns';
import { Expense, Category, Budget } from '../types';

const STORAGE_KEYS = {
  PETS: 'pet_expense_tracker_pets',
  EXPENSES: 'pet_expense_tracker_expenses',
  BUDGETS: 'pet_expense_tracker_budgets',
  ITEMS: 'pet_expense_tracker_items',
  REMINDERS: 'pet_expense_tracker_reminders',
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

export const getMonthlyTotal = (expenses: Expense[], month: string) => {
  return expenses
    .filter(e => e.created_at.startsWith(month))
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getCategoryTotal = (expenses: Expense[], month: string, category: Category) => {
  return expenses
    .filter(e => e.created_at.startsWith(month) && e.category === category)
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getPetTotal = (expenses: Expense[], month: string, petId: string) => {
  return expenses
    .filter(e => e.created_at.startsWith(month) && e.pet_id === petId)
    .reduce((sum, e) => sum + e.amount, 0);
};

export const detectAnomaly = (expense: Expense, historicalExpenses: Expense[]) => {
  const categoryExpenses = historicalExpenses.filter(e => e.category === expense.category);
  if (categoryExpenses.length === 0) return false;
  
  const avgAmount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length;
  return expense.amount > avgAmount * 2;
};

export const calculateAvgPrice = (purchases: { price: number }[]) => {
  if (purchases.length === 0) return 0;
  const total = purchases.reduce((sum, p) => sum + p.price, 0);
  return total / purchases.length;
};

export const checkReminders = (reminders: { next_date: string; remind_days: number }[]) => {
  const today = new Date();
  return reminders.filter(r => {
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

export { STORAGE_KEYS };
