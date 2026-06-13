import { useState, useMemo } from 'react';
import { Plus, ShoppingCart, Stethoscope, Scissors, Gamepad2, Home, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getMonthlyTotal, getCategoryTotal, formatCurrency } from '../utils/helpers';
import { Category, CATEGORY_LABELS, CATEGORY_COLORS } from '../types';
import StatCard from '../components/Common/StatCard';
import ExpenseCard from '../components/Common/ExpenseCard';
import PetAvatar from '../components/Common/PetAvatar';
import CategoryIcon from '../components/Common/CategoryIcon';
import BudgetProgress from '../components/Common/BudgetProgress';
import QuickAddForm from '../components/Forms/QuickAddForm';

const categories: Category[] = ['food', 'medical', 'beauty', 'toy', 'boarding'];

export default function HomePage() {
  const { pets, expenses, budgets, selectedPetId, setSelectedPet, currentMonth } = useStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  const monthlyTotal = useMemo(() => getMonthlyTotal(expenses, currentMonth), [expenses, currentMonth]);
  
  const currentBudget = useMemo(() => {
    return budgets.find(b => b.month === currentMonth);
  }, [budgets, currentMonth]);
  
  const budgetProgress = currentBudget ? (monthlyTotal / currentBudget.total_budget) * 100 : 0;
  
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(e => e.created_at.startsWith(currentMonth));
    if (selectedPetId) {
      filtered = filtered.filter(e => e.pet_id === selectedPetId);
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [expenses, currentMonth, selectedPetId]);
  
  const recentExpenses = filteredExpenses.slice(0, 5);
  
  const categoryTotals = useMemo(() => {
    return categories.map(cat => ({
      category: cat,
      amount: getCategoryTotal(expenses, currentMonth, cat),
    }));
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
              <p className="text-sm text-gray-500">本月消费</p>
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
            {recentExpenses.map((expense) => {
              const pet = pets.find(p => p.id === expense.pet_id);
              return (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  pet={pet}
                />
              );
            })}
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
