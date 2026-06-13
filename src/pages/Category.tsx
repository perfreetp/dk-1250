import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getCategoryTotal, formatCurrency } from '../utils/helpers';
import { Category, CATEGORY_LABELS, CATEGORY_COLORS } from '../types';
import CategoryIcon from '../components/Common/CategoryIcon';
import ExpenseCard from '../components/Common/ExpenseCard';
import CategoryPieChart from '../components/Charts/CategoryPieChart';

const categories: Category[] = ['food', 'medical', 'beauty', 'toy', 'boarding'];

export default function CategoryPage() {
  const { pets, expenses, currentMonth } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const categoryTotals = useMemo(() => {
    return categories.map(cat => ({
      category: cat,
      amount: getCategoryTotal(expenses, currentMonth, cat),
    }));
  }, [expenses, currentMonth]);
  
  const chartData = useMemo(() => {
    return categoryTotals
      .filter(c => c.amount > 0)
      .map(c => ({
        category: c.category,
        value: c.amount,
      }));
  }, [categoryTotals]);
  
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(e => e.created_at.startsWith(currentMonth));
    if (selectedCategory) {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [expenses, currentMonth, selectedCategory]);
  
  const totalAmount = categoryTotals.reduce((sum, c) => sum + c.amount, 0);
  
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">分类明细</h1>
        <p className="text-gray-500 mt-1">按类别查看消费分布</p>
      </header>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">支出占比</h2>
        {chartData.length > 0 ? (
          <CategoryPieChart data={chartData} />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            暂无数据
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">各类别统计</h2>
        <div className="space-y-3">
          {categoryTotals.map(({ category, amount }) => {
            const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
            const isSelected = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(isSelected ? null : category)}
                className={`w-full p-4 rounded-xl transition-all text-left ${
                  isSelected ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <CategoryIcon category={category} />
                    <span className="font-medium">{CATEGORY_LABELS[category]}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatCurrency(amount)}</p>
                    <p className="text-sm text-gray-400">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: CATEGORY_COLORS[category],
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {selectedCategory ? CATEGORY_LABELS[selectedCategory] : '全部明细'}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredExpenses.length} 笔记录
          </span>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-400">暂无消费记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => {
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
    </div>
  );
}
