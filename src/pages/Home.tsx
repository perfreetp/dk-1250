import { useState, useMemo, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, AlertCircle, Check, X } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useStore } from '../store/useStore';
import { getMonthlyTotal, getCategoryTotal, formatCurrency, getPetSplitAmount, getDaysUntil } from '../utils/helpers';
import { Category, CATEGORY_LABELS } from '../types';
import ExpenseCard from '../components/Common/ExpenseCard';
import PetAvatar from '../components/Common/PetAvatar';
import CategoryIcon from '../components/Common/CategoryIcon';
import BudgetProgress from '../components/Common/BudgetProgress';
import QuickAddForm from '../components/Forms/QuickAddForm';

const categories: Category[] = ['food', 'medical', 'beauty', 'toy', 'boarding'];

export default function HomePage() {
  const { pets, expenses, budgets, fixedExpenses, pendingBills, selectedPetId, setSelectedPet, currentMonth, checkAndGeneratePendingBills, confirmPendingBill, deletePendingBill } = useStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  useEffect(() => {
    checkAndGeneratePendingBills();
  }, [checkAndGeneratePendingBills]);
  
  const monthlyTotal = useMemo(() => getMonthlyTotal(expenses, currentMonth, selectedPetId), [expenses, currentMonth, selectedPetId]);
  
  const currentBudget = useMemo(() => {
    return budgets.find(b => b.month === currentMonth);
  }, [budgets, currentMonth]);
  
  const budgetProgress = currentBudget ? (monthlyTotal / currentBudget.total_budget) * 100 : 0;
  
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(e => e.created_at.startsWith(currentMonth));
    if (selectedPetId) {
      filtered = filtered.filter(e => {
        const splits = getPetSplitAmount(e, selectedPetId);
        return splits > 0;
      });
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [expenses, currentMonth, selectedPetId]);
  
  const recentExpenses = filteredExpenses.slice(0, 5);
  
  const categoryTotals = useMemo(() => {
    return categories.map(cat => ({
      category: cat,
      amount: getCategoryTotal(expenses, currentMonth, cat, selectedPetId),
    }));
  }, [expenses, currentMonth, selectedPetId]);
  
  const upcomingFixedExpenses = useMemo(() => {
    const today = new Date();
    const pendingIds = pendingBills.map(b => b.fixed_expense_id);
    return fixedExpenses
      .filter(f => f.is_active && !pendingIds.includes(f.id))
      .map(f => {
        const nextDate = new Date(f.next_generate_date);
        const daysUntil = differenceInDays(nextDate, today);
        return { ...f, daysUntil, status: daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'upcoming' : 'normal' };
      })
      .filter(f => f.daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [fixedExpenses, pendingBills]);
  
  const confirmedThisMonth = useMemo(() => {
    return expenses.filter(e => 
      e.is_fixed && e.is_confirmed && e.created_at.startsWith(currentMonth)
    );
  }, [expenses, currentMonth]);
  
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">宠物记账</h1>
          <p className="text-gray-500 mt-1">记录每一份爱与支出</p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">
                {selectedPetId ? pets.find(p => p.id === selectedPetId)?.name + '的' : ''}本月消费
              </p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(monthlyTotal)}</p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#f0f0f0"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke={budgetProgress > 100 ? '#FF6B6B' : '#98D8C8'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${Math.min(budgetProgress, 100) * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{Math.round(budgetProgress)}%</span>
                <span className="text-xs text-gray-400">预算</span>
              </div>
            </div>
          </div>
          {currentBudget && (
            <BudgetProgress
              current={monthlyTotal}
              budget={currentBudget.total_budget}
              color="#98D8C8"
              showLabel
            />
          )}
        </div>
        
        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} />
            <span className="font-medium">消费趋势</span>
          </div>
          <p className="text-sm opacity-80 mb-2">较上月同期</p>
          <p className="text-3xl font-bold mb-4">-12.5%</p>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="opacity-80">本周</p>
              <p className="font-bold">¥456</p>
            </div>
            <div>
              <p className="opacity-80">今日</p>
              <p className="font-bold">¥88</p>
            </div>
          </div>
        </div>
      </div>
      
      {pendingBills.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 shadow-sm border border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-amber-500" />
            <h2 className="text-lg font-bold">待确认账单</h2>
            <span className="ml-auto text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
              {pendingBills.length} 条待处理
            </span>
          </div>
          <div className="space-y-3">
            {pendingBills.map((bill) => {
              const pet = pets.find(p => p.id === bill.pet_id);
              const daysUntil = getDaysUntil(bill.scheduled_date);
              return (
                <div key={bill.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pet?.avatar}</span>
                    <div>
                      <p className="font-medium">{bill.fixed_expense_name}</p>
                      <p className="text-sm text-amber-600 font-medium">
                        {daysUntil <= 0 ? '⚠️ 今天到期，请确认' : `⏰ ${daysUntil}天后到期`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{formatCurrency(bill.amount)}</span>
                    <button
                      onClick={() => confirmPendingBill(bill.id)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      title="确认入账"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => deletePendingBill(bill.id)}
                      className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                      title="取消"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-amber-600 mt-3">
            确认后会自动计入本月消费，下次日期将自动顺延
          </p>
        </div>
      )}
      
      {upcomingFixedExpenses.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-blue-500" />
            <h2 className="text-lg font-bold">即将到期</h2>
            <span className="ml-auto text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {upcomingFixedExpenses.length} 条计划
            </span>
          </div>
          <div className="space-y-3">
            {upcomingFixedExpenses.map((fixed) => {
              const pet = pets.find(p => p.id === fixed.pet_id);
              return (
                <div key={fixed.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pet?.avatar}</span>
                    <div>
                      <p className="font-medium">{fixed.name}</p>
                      <p className={`text-sm font-medium ${
                        fixed.status === 'urgent' ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {fixed.daysUntil <= 0 ? '⚡ 今天到期' : `📅 ${fixed.daysUntil}天后到期`}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold">{formatCurrency(fixed.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {confirmedThisMonth.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
          <div className="flex items-center gap-2 mb-4">
            <Check size={20} className="text-green-500" />
            <h2 className="text-lg font-bold">已确认入账</h2>
            <span className="ml-auto text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
              本月 {confirmedThisMonth.length} 笔
            </span>
          </div>
          <div className="space-y-2">
            {confirmedThisMonth.slice(0, 3).map((expense) => {
              const pet = pets.find(p => p.id === expense.pet_id);
              const fixedExpense = fixedExpenses.find(f => f.id === expense.fixed_expense_id);
              return (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pet?.avatar}</span>
                    <div>
                      <p className="font-medium">{fixedExpense?.name || expense.remark}</p>
                      <p className="text-xs text-gray-500">
                        {CATEGORY_LABELS[expense.category]} · {expense.created_at.slice(5)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">{formatCurrency(expense.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">我的宠物</h2>
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setSelectedPet(null)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              selectedPetId === null ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            全部
          </button>
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => setSelectedPet(pet.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                selectedPetId === pet.id ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              <PetAvatar pet={pet} size="sm" />
              <span>{pet.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">快捷分类</h2>
        <div className="grid grid-cols-5 gap-3">
          {categories.map((cat) => {
            const total = categoryTotals.find(c => c.category === cat)?.amount || 0;
            return (
              <button
                key={cat}
                onClick={() => setShowQuickAdd(true)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all"
              >
                <CategoryIcon category={cat} size="lg" />
                <span className="text-xs font-medium">{CATEGORY_LABELS[cat]}</span>
                <span className="text-xs text-gray-400">{formatCurrency(total)}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">最近记录</h2>
          <button className="text-sm text-primary font-medium">查看全部</button>
        </div>
        
        {recentExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-400 mb-4">暂无消费记录</p>
            <button
              onClick={() => setShowQuickAdd(true)}
              className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              添加第一条记录
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                pet={pets.find(p => p.id === expense.pet_id)}
                pets={pets}
                filterPetId={selectedPetId}
              />
            ))}
          </div>
        )}
      </div>
      
      <button
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition-all hover:scale-105 z-40"
      >
        <Plus size={28} />
      </button>
      
      {showQuickAdd && <QuickAddForm onClose={() => setShowQuickAdd(false)} />}
    </div>
  );
}
