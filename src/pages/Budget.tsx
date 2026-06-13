import { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, Calendar, Settings, Bell, X, Check, RefreshCw } from 'lucide-react';
import { format, differenceInDays, addMonths, addWeeks, addYears } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import { getMonthlyTotal, getCategoryTotal, formatCurrency, calculateSplitAmount, detectAnomaly } from '../utils/helpers';
import { Category, CATEGORY_LABELS, CATEGORY_COLORS, ReminderType, CycleType } from '../types';
import BudgetProgress from '../components/Common/BudgetProgress';

const categories: Category[] = ['food', 'medical', 'beauty', 'toy', 'boarding'];

const reminderTypeLabels: Record<ReminderType, string> = {
  vaccine: '疫苗接种',
  deworming: '驱虫',
  checkup: '体检',
  other: '其他',
};

const reminderColors: Record<ReminderType, string> = {
  vaccine: '#FF6B6B',
  deworming: '#FFB347',
  checkup: '#98D8C8',
  other: '#DDA0DD',
};

export default function BudgetPage() {
  const { pets, expenses, budgets, reminders, currentMonth, addBudget, updateBudget, processReminder } = useStore();
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<string | null>(null);
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newBudget, setNewBudget] = useState({
    total: 3000,
    categoryBudgets: {
      food: 800,
      medical: 600,
      beauty: 400,
      toy: 300,
      boarding: 900,
    } as Record<Category, number>,
  });
  
  const monthlyTotal = useMemo(() => getMonthlyTotal(expenses, currentMonth), [expenses, currentMonth]);
  
  const currentBudget = useMemo(() => {
    return budgets.find(b => b.month === currentMonth);
  }, [budgets, currentMonth]);
  
  const categoryTotals = useMemo(() => {
    return categories.map(cat => ({
      category: cat,
      amount: getCategoryTotal(expenses, currentMonth, cat),
      budget: currentBudget?.category_budgets[cat] || 0,
    }));
  }, [expenses, currentMonth, currentBudget]);
  
  const anomalies = useMemo(() => {
    const monthExpenses = expenses.filter(e => e.created_at.startsWith(currentMonth));
    return monthExpenses.filter(e => detectAnomaly(e, expenses));
  }, [expenses, currentMonth]);
  
  const upcomingReminders = useMemo(() => {
    const today = new Date();
    return reminders
      .map(r => {
        const pet = pets.find(p => p.id === r.pet_id);
        const nextDate = new Date(r.next_date);
        const daysUntil = differenceInDays(nextDate, today);
        return { ...r, pet, daysUntil };
      })
      .sort((a, b) => {
        if (a.is_processed !== b.is_processed) return a.is_processed ? 1 : -1;
        return a.daysUntil - b.daysUntil;
      });
  }, [reminders, pets]);
  
  const handleSaveBudget = () => {
    if (currentBudget) {
      updateBudget(currentBudget.id, {
        total_budget: newBudget.total,
        category_budgets: newBudget.categoryBudgets,
      });
    } else {
      addBudget({
        month: currentMonth,
        total_budget: newBudget.total,
        category_budgets: newBudget.categoryBudgets,
      });
    }
    setShowBudgetModal(false);
  };
  
  const handleProcessReminder = (id: string) => {
    processReminder(id, newReminderDate);
    setShowReminderModal(false);
    setEditingReminder(null);
    setNewReminderDate('');
  };
  
  const openReminderModal = (id: string) => {
    setEditingReminder(id);
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      const nextDate = new Date(reminder.next_date);
      if (reminder.type === 'vaccine') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else if (reminder.type === 'deworming') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 6);
      }
      setNewReminderDate(format(nextDate, 'yyyy-MM-dd'));
    }
    setShowReminderModal(true);
  };
  
  useEffect(() => {
    if (currentBudget) {
      setNewBudget({
        total: currentBudget.total_budget,
        categoryBudgets: currentBudget.category_budgets,
      });
    }
  }, [currentBudget]);
  
  const budgetPercentage = currentBudget ? (monthlyTotal / currentBudget.total_budget) * 100 : 0;
  const isOverBudget = budgetPercentage > 100;
  const isWarning = budgetPercentage > 80 && budgetPercentage <= 100;
  
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">预算提醒</h1>
        <p className="text-gray-500 mt-1">管理预算设置与提醒</p>
      </header>
      
      {isOverBudget && (
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-accent mb-1">预算已超支！</h3>
              <p className="text-gray-600">
                本月消费 {formatCurrency(monthlyTotal)} 已超出预算 {formatCurrency(currentBudget?.total_budget || 0)}，
                超支 {formatCurrency(monthlyTotal - (currentBudget?.total_budget || 0))}。
              </p>
            </div>
          </div>
        </div>
      )}
      
      {isWarning && (
        <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-white">
              <Bell size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-secondary mb-1">预算预警</h3>
              <p className="text-gray-600">
                本月消费已达预算的 {Math.round(budgetPercentage)}%，请注意控制支出。
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">月度预算</h2>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center gap-2 text-primary font-medium"
          >
            <Settings size={18} />
            <span>设置预算</span>
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">已花费</span>
            <span className="font-bold">
              {formatCurrency(monthlyTotal)} / {formatCurrency(currentBudget?.total_budget || 0)}
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(budgetPercentage, 100)}%`,
                backgroundColor: isOverBudget ? '#FF6B6B' : isWarning ? '#FFB347' : '#98D8C8',
              }}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {categoryTotals.map(({ category, amount, budget }) => (
            <BudgetProgress
              key={category}
              current={amount}
              budget={budget}
              category={CATEGORY_LABELS[category]}
              color={CATEGORY_COLORS[category]}
              showLabel
            />
          ))}
        </div>
      </div>
      
      {anomalies.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-accent" />
            <h2 className="text-lg font-bold">异常消费</h2>
          </div>
          <div className="space-y-3">
            {anomalies.map((expense) => {
              const pet = pets.find(p => p.id === expense.pet_id);
              const splitTotal = Object.values(calculateSplitAmount(expense)).reduce((s, v) => s + v, 0);
              return (
                <div key={expense.id} className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{pet?.avatar}</span>
                        <span className="font-medium">{pet?.name}</span>
                        <span className="text-gray-300">•</span>
                        <span style={{ color: CATEGORY_COLORS[expense.category] }}>
                          {CATEGORY_LABELS[expense.category]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{expense.remark || expense.merchant}</p>
                    </div>
                    <p className="text-lg font-bold text-accent">{formatCurrency(splitTotal)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {upcomingReminders.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-primary" />
            <h2 className="text-lg font-bold">到期提醒</h2>
          </div>
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`p-4 rounded-xl ${
                  reminder.is_processed 
                    ? 'bg-gray-50 opacity-60' 
                    : reminder.daysUntil <= 3 
                      ? 'bg-accent/10 border border-accent/20' 
                      : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${reminderColors[reminder.type]}20` }}
                    >
                      {reminder.type === 'vaccine' ? '💉' : reminder.type === 'deworming' ? '🛡️' : '🩺'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {reminder.pet?.avatar} {reminder.pet?.name} - {reminderTypeLabels[reminder.type]}
                        </p>
                        {reminder.is_processed && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                            已处理
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        下次: {format(new Date(reminder.next_date), 'yyyy年MM月dd日', { locale: zhCN })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold ${
                      reminder.is_processed 
                        ? 'text-gray-400' 
                        : reminder.daysUntil <= 0 
                          ? 'text-accent' 
                          : reminder.daysUntil <= 3 
                            ? 'text-secondary' 
                            : 'text-gray-600'
                    }`}>
                      {reminder.is_processed 
                        ? '已处理' 
                        : reminder.daysUntil <= 0 
                          ? '已到期' 
                          : `${reminder.daysUntil}天后`}
                    </p>
                    {!reminder.is_processed && (
                      <button
                        onClick={() => openReminderModal(reminder.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        <Check size={14} />
                        <span>处理</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">设置预算</h2>
              <button
                onClick={() => setShowBudgetModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  总预算 (元)
                </label>
                <input
                  type="number"
                  value={newBudget.total}
                  onChange={(e) => setNewBudget({ ...newBudget, total: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类预算
                </label>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      <span className="flex-1 text-sm font-medium">{CATEGORY_LABELS[cat]}</span>
                      <input
                        type="number"
                        value={newBudget.categoryBudgets[cat]}
                        onChange={(e) => setNewBudget({
                          ...newBudget,
                          categoryBudgets: {
                            ...newBudget.categoryBudgets,
                            [cat]: parseFloat(e.target.value) || 0,
                          },
                        })}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleSaveBudget}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors"
              >
                保存预算
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showReminderModal && editingReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">标记已处理</h2>
              <button
                onClick={() => {
                  setShowReminderModal(false);
                  setEditingReminder(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                设置下次提醒时间：
              </p>
              <input
                type="date"
                value={newReminderDate}
                onChange={(e) => setNewReminderDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              
              <button
                onClick={() => handleProcessReminder(editingReminder)}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors"
              >
                确认处理
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
