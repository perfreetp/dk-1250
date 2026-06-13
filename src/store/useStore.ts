import { create } from 'zustand';
import { Pet, Expense, Budget, Item, Reminder, FixedExpense, ExpenseSplit, Category } from '../types';
import { loadData, saveData, getCurrentMonth, STORAGE_KEYS } from '../utils/helpers';
import { mockPets, mockExpenses, mockBudgets, mockItems, mockReminders } from '../data/mockData';

interface AppStore {
  pets: Pet[];
  expenses: Expense[];
  budgets: Budget[];
  items: Item[];
  reminders: Reminder[];
  fixedExpenses: FixedExpense[];
  selectedPetId: string | null;
  currentMonth: string;
  
  addPet: (pet: Omit<Pet, 'id' | 'created_at'>) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  setSelectedPet: (id: string | null) => void;
  
  addExpense: (expense: Omit<Expense, 'id' | 'updated_at'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  addBudget: (budget: Omit<Budget, 'id' | 'created_at'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  
  addItem: (item: Omit<Item, 'id' | 'created_at'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  
  addReminder: (reminder: Omit<Reminder, 'id' | 'created_at'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  processReminder: (id: string, nextDate?: string) => void;
  
  addFixedExpense: (fixedExpense: Omit<FixedExpense, 'id' | 'created_at'>) => void;
  updateFixedExpense: (id: string, updates: Partial<FixedExpense>) => void;
  deleteFixedExpense: (id: string) => void;
  generateFixedExpense: (id: string) => void;
  
  setCurrentMonth: (month: string) => void;
  
  generateId: () => string;
}

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useStore = create<AppStore>((set, get) => ({
  pets: loadData(STORAGE_KEYS.PETS, mockPets),
  expenses: loadData(STORAGE_KEYS.EXPENSES, mockExpenses),
  budgets: loadData(STORAGE_KEYS.BUDGETS, mockBudgets),
  items: loadData(STORAGE_KEYS.ITEMS, mockItems),
  reminders: loadData(STORAGE_KEYS.REMINDERS, mockReminders),
  fixedExpenses: loadData(STORAGE_KEYS.FIXED_EXPENSES, []),
  selectedPetId: null,
  currentMonth: getCurrentMonth(),
  
  addPet: (pet) => {
    const newPet: Pet = {
      ...pet,
      id: generateId(),
      created_at: new Date().toISOString().split('T')[0],
    };
    const pets = [...get().pets, newPet];
    set({ pets });
    saveData(STORAGE_KEYS.PETS, pets);
  },
  
  updatePet: (id, updates) => {
    const pets = get().pets.map(p => p.id === id ? { ...p, ...updates } : p);
    set({ pets });
    saveData(STORAGE_KEYS.PETS, pets);
  },
  
  deletePet: (id) => {
    const pets = get().pets.filter(p => p.id !== id);
    set({ pets });
    saveData(STORAGE_KEYS.PETS, pets);
  },
  
  setSelectedPet: (id) => set({ selectedPetId: id }),
  
  addExpense: (expense) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      updated_at: new Date().toISOString().split('T')[0],
    };
    const expenses = [...get().expenses, newExpense];
    set({ expenses });
    saveData(STORAGE_KEYS.EXPENSES, expenses);
  },
  
  updateExpense: (id, updates) => {
    const expenses = get().expenses.map(e => 
      e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString().split('T')[0] } : e
    );
    set({ expenses });
    saveData(STORAGE_KEYS.EXPENSES, expenses);
  },
  
  deleteExpense: (id) => {
    const expenses = get().expenses.filter(e => e.id !== id);
    set({ expenses });
    saveData(STORAGE_KEYS.EXPENSES, expenses);
  },
  
  addBudget: (budget) => {
    const newBudget: Budget = {
      ...budget,
      id: generateId(),
      created_at: new Date().toISOString().split('T')[0],
    };
    const budgets = [...get().budgets, newBudget];
    set({ budgets });
    saveData(STORAGE_KEYS.BUDGETS, budgets);
  },
  
  updateBudget: (id, updates) => {
    const budgets = get().budgets.map(b => b.id === id ? { ...b, ...updates } : b);
    set({ budgets });
    saveData(STORAGE_KEYS.BUDGETS, budgets);
  },
  
  addItem: (item) => {
    const newItem: Item = {
      ...item,
      id: generateId(),
      created_at: new Date().toISOString().split('T')[0],
    };
    const items = [...get().items, newItem];
    set({ items });
    saveData(STORAGE_KEYS.ITEMS, items);
  },
  
  updateItem: (id, updates) => {
    const items = get().items.map(i => i.id === id ? { ...i, ...updates } : i);
    set({ items });
    saveData(STORAGE_KEYS.ITEMS, items);
  },
  
  deleteItem: (id) => {
    const items = get().items.filter(i => i.id !== id);
    set({ items });
    saveData(STORAGE_KEYS.ITEMS, items);
  },
  
  addReminder: (reminder) => {
    const newReminder: Reminder = {
      ...reminder,
      id: generateId(),
      created_at: new Date().toISOString().split('T')[0],
    };
    const reminders = [...get().reminders, newReminder];
    set({ reminders });
    saveData(STORAGE_KEYS.REMINDERS, reminders);
  },
  
  updateReminder: (id, updates) => {
    const reminders = get().reminders.map(r => r.id === id ? { ...r, ...updates } : r);
    set({ reminders });
    saveData(STORAGE_KEYS.REMINDERS, reminders);
  },
  
  deleteReminder: (id) => {
    const reminders = get().reminders.filter(r => r.id !== id);
    set({ reminders });
    saveData(STORAGE_KEYS.REMINDERS, reminders);
  },
  
  processReminder: (id, nextDate) => {
    const reminders = get().reminders.map(r => {
      if (r.id === id) {
        const newNextDate = nextDate || r.next_date;
        return {
          ...r,
          is_processed: true,
          last_processed_date: new Date().toISOString().split('T')[0],
          next_date: newNextDate,
        };
      }
      return r;
    });
    set({ reminders });
    saveData(STORAGE_KEYS.REMINDERS, reminders);
  },
  
  addFixedExpense: (fixedExpense) => {
    const newFixedExpense: FixedExpense = {
      ...fixedExpense,
      id: generateId(),
      created_at: new Date().toISOString().split('T')[0],
    };
    const fixedExpenses = [...get().fixedExpenses, newFixedExpense];
    set({ fixedExpenses });
    saveData(STORAGE_KEYS.FIXED_EXPENSES, fixedExpenses);
  },
  
  updateFixedExpense: (id, updates) => {
    const fixedExpenses = get().fixedExpenses.map(f => f.id === id ? { ...f, ...updates } : f);
    set({ fixedExpenses });
    saveData(STORAGE_KEYS.FIXED_EXPENSES, fixedExpenses);
  },
  
  deleteFixedExpense: (id) => {
    const fixedExpenses = get().fixedExpenses.filter(f => f.id !== id);
    set({ fixedExpenses });
    saveData(STORAGE_KEYS.FIXED_EXPENSES, fixedExpenses);
  },
  
  generateFixedExpense: (id) => {
    const fixedExpense = get().fixedExpenses.find(f => f.id === id);
    if (!fixedExpense) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newExpense: Expense = {
      id: generateId(),
      amount: fixedExpense.amount,
      category: fixedExpense.category,
      pet_id: fixedExpense.pet_id,
      merchant: fixedExpense.merchant,
      quantity: 1,
      remark: `[自动生成] ${fixedExpense.name}`,
      receipt: '',
      is_fixed: true,
      created_at: today,
      updated_at: today,
      splits: fixedExpense.splits,
    };
    
    const expenses = [...get().expenses, newExpense];
    set({ expenses });
    saveData(STORAGE_KEYS.EXPENSES, expenses);
  },
  
  setCurrentMonth: (month) => set({ currentMonth: month }),
  
  generateId,
}));
