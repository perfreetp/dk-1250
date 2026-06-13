import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getCategoryTotal, formatCurrency, getPetSplitAmount } from '../utils/helpers';
import { Category, CATEGORY_LABELS, CATEGORY_COLORS } from '../types';
import CategoryIcon from '../components/Common/CategoryIcon';
import ExpenseCard from '../components/Common/ExpenseCard';
import CategoryPieChart from '../components/Charts/CategoryPieChart';
import PetAvatar from '../components/Common/PetAvatar';

const categories: Category[] = ['food', 'medical', 'beauty', 'toy', 'boarding'];

export default function CategoryPage() {
  const { pets, expenses, currentMonth } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(e => e.created_at.startsWith(currentMonth));
    
    if (selectedPetId) {
      filtered = filtered.filter(e => {
        const splits = getPetSplitAmount(e, selectedPetId);
        return splits > 0;
      });
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }
    
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [expenses, currentMonth, selectedCategory, selectedPetId]);
  
  const chartData = useMemo(() => {
    let filteredExpenses = expenses.filter(e => e.created_at.startsWith(currentMonth));
    
    if (selectedPetId) {
      filteredExpenses = filteredExpenses.filter(e => {
        const splits = getPetSplitAmount(e, selectedPetId);
        return splits > 0;
      });
    }
    
    const categoryTotals = categories.map(cat => {
      const catExpenses = filteredExpenses.filter(e => e.category === cat);
      const total = catExpenses.reduce((sum, e) => {
        if (selectedPetId) {
          return sum + getPetSplitAmount(e, selectedPetId);
        }
        const splits = Object.values(getPetSplitAmount(e, e.pet_id));
        return sum + splits.reduce((s, a) => s + a, 0);
      }, 0);
      return { category: cat, amount: total };
    });
    
    return categoryTotals.filter(c => c.amount > 0);
  }, [expenses, currentMonth, selectedPetId]);
  
  const totalAmount = chartData.reduce((sum, c) => sum + c.amount, 0);
  
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">分类明细</h1>
        <p className="text-gray-500 mt-1">按类别查看消费分布</p>
      </header>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">筛选</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-2">按宠物筛选</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedPetId(null)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedPetId === null ? 'bg-primary text-white' : 'bg-gray-100'
                }`}
              >
                全部宠物
              </button>
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
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
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">支出占比</h2>
        {chartData.length > 0 ? (
          <CategoryPieChart data={chartData.map(c => ({ category: c.category, value: c.amount }))} />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            暂无数据
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">各类别统计</h2>
        <div className="space-y-3">
          {categories.map((cat) => {
            let catTotal = getCategoryTotal(expenses, currentMonth, cat, selectedPetId);
            
            const percentage = totalAmount > 0 ? (catTotal / totalAmount) * 100 : 0;
            const isSelected = selectedCategory === cat;
            
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                className={`w-full p-4 rounded-xl transition-all text-left ${
                  isSelected ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <CategoryIcon category={cat} />
                    <span className="font-medium">{CATEGORY_LABELS[cat]}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatCurrency(catTotal)}</p>
                    <p className="text-sm text-gray-400">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: CATEGORY_COLORS[cat],
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
            {selectedPetId && ` - ${pets.find(p => p.id === selectedPetId)?.name}`}
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
            {filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                pet={pets.find(p => p.id === expense.pet_id)}
                pets={pets}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
