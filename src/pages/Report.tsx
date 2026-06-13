import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format, subMonths, addMonths, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import { getMonthlyTotal, formatCurrency, getPetSplitAmount, calculateSplitAmount } from '../utils/helpers';
import { Category, CATEGORY_LABELS, CATEGORY_COLORS } from '../types';
import StatCard from '../components/Common/StatCard';
import MonthlyBarChart from '../components/Charts/MonthlyBarChart';
import TrendLineChart from '../components/Charts/TrendLineChart';
import PetAvatar from '../components/Common/PetAvatar';
import CategoryIcon from '../components/Common/CategoryIcon';
import * as XLSX from 'xlsx';

export default function ReportPage() {
  const { pets, expenses, currentMonth } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [filterPetId, setFilterPetId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  
  const currentDate = parseISO(`${selectedMonth}-01`);
  
  const prevMonth = () => {
    const date = subMonths(currentDate, 1);
    setSelectedMonth(format(date, 'yyyy-MM'));
  };
  
  const nextMonth = () => {
    const date = addMonths(currentDate, 1);
    if (date <= new Date()) {
      setSelectedMonth(format(date, 'yyyy-MM'));
    }
  };
  
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(e => e.created_at.startsWith(selectedMonth));
    
    if (filterPetId) {
      filtered = filtered.filter(e => {
        const splits = getPetSplitAmount(e, filterPetId);
        return splits > 0;
      });
    }
    
    if (filterCategory) {
      filtered = filtered.filter(e => e.category === filterCategory);
    }
    
    return filtered;
  }, [expenses, selectedMonth, filterPetId, filterCategory]);
  
  const monthlyTotal = useMemo(() => {
    if (filterPetId) {
      return filteredExpenses.reduce((sum, e) => sum + getPetSplitAmount(e, filterPetId), 0);
    }
    return filteredExpenses.reduce((sum, e) => {
      const splits = calculateSplitAmount(e);
      return sum + Object.values(splits).reduce((s, a) => s + a, 0);
    }, 0);
  }, [filteredExpenses, filterPetId]);
  
  const prevMonthFilteredExpenses = useMemo(() => {
    const prevDate = subMonths(currentDate, 1);
    const prevMonthStr = format(prevDate, 'yyyy-MM');
    let filtered = expenses.filter(e => e.created_at.startsWith(prevMonthStr));
    
    if (filterPetId) {
      filtered = filtered.filter(e => {
        const splits = getPetSplitAmount(e, filterPetId);
        return splits > 0;
      });
    }
    
    if (filterCategory) {
      filtered = filtered.filter(e => e.category === filterCategory);
    }
    
    return filtered;
  }, [expenses, currentDate, filterPetId, filterCategory]);
  
  const prevMonthTotal = useMemo(() => {
    if (filterPetId) {
      return prevMonthFilteredExpenses.reduce((sum, e) => sum + getPetSplitAmount(e, filterPetId), 0);
    }
    return prevMonthFilteredExpenses.reduce((sum, e) => {
      const splits = calculateSplitAmount(e);
      return sum + Object.values(splits).reduce((s, a) => s + a, 0);
    }, 0);
  }, [prevMonthFilteredExpenses, filterPetId]);
  
  const monthChange = useMemo(() => {
    if (prevMonthTotal === 0) return 0;
    return ((monthlyTotal - prevMonthTotal) / prevMonthTotal) * 100;
  }, [monthlyTotal, prevMonthTotal]);
  
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const data = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
      const dayExpenses = filteredExpenses.filter(e => e.created_at === dateStr);
      const amount = dayExpenses.reduce((sum, e) => {
        if (filterPetId) {
          return sum + getPetSplitAmount(e, filterPetId);
        }
        const splits = calculateSplitAmount(e);
        return sum + Object.values(splits).reduce((s, a) => s + a, 0);
      }, 0);
      data.push({
        date: `${day}日`,
        amount,
      });
    }
    
    return data;
  }, [filteredExpenses, selectedMonth, currentDate, filterPetId]);
  
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(currentDate, i);
      const month = format(date, 'yyyy-MM');
      let monthExpenses = expenses.filter(e => e.created_at.startsWith(month));
      
      if (filterPetId) {
        monthExpenses = monthExpenses.filter(e => {
          const splits = getPetSplitAmount(e, filterPetId);
          return splits > 0;
        });
      }
      
      if (filterCategory) {
        monthExpenses = monthExpenses.filter(e => e.category === filterCategory);
      }
      
      const total = monthExpenses.reduce((sum, e) => {
        if (filterPetId) {
          return sum + getPetSplitAmount(e, filterPetId);
        }
        const splits = calculateSplitAmount(e);
        return sum + Object.values(splits).reduce((s, a) => s + a, 0);
      }, 0);
      
      data.push({
        month: format(date, 'MM月', { locale: zhCN }),
        amount: total,
      });
    }
    return data;
  }, [expenses, currentDate, filterPetId, filterCategory]);
  
  const topExpenses = useMemo(() => {
    return filteredExpenses
      .map(e => ({
        ...e,
        displayAmount: filterPetId ? getPetSplitAmount(e, filterPetId) : (
          e.splits && e.splits.length > 0 
            ? e.splits.reduce((s, split) => s + split.amount, 0)
            : e.amount
        ),
      }))
      .sort((a, b) => b.displayAmount - a.displayAmount)
      .slice(0, 5);
  }, [filteredExpenses, filterPetId]);
  
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    let filterDesc = '';
    if (filterPetId) {
      const pet = pets.find(p => p.id === filterPetId);
      filterDesc += `${pet?.name || ''} `;
    }
    if (filterCategory) {
      filterDesc += CATEGORY_LABELS[filterCategory];
    }
    
    const summaryData = [
      ['月份', selectedMonth],
      ['筛选条件', filterDesc || '全部'],
      ['总消费', monthlyTotal],
      ['环比变化', `${monthChange.toFixed(1)}%`],
      [''],
      ['日期', '消费金额'],
      ...dailyData.map(d => [d.date, d.amount]),
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws, '消费汇总');
    
    const detailData = [
      ['日期', '分类', '分摊金额', '总金额', '商家', '备注', '宠物', '票据'],
      ...filteredExpenses.map(e => {
        const pet = pets.find(p => p.id === e.pet_id);
        const splitAmount = filterPetId ? getPetSplitAmount(e, filterPetId) : 0;
        const totalAmount = e.splits && e.splits.length > 0 
          ? e.splits.reduce((s, split) => s + split.amount, 0)
          : e.amount;
        
        let petName = pet?.name || '';
        if (e.splits && e.splits.length > 0) {
          const splitPets = e.splits.map(s => {
            const sp = pets.find(p => p.id === s.pet_id);
            return `${sp?.name}(¥${s.amount})`;
          }).join(', ');
          petName = splitPets;
        }
        
        return [
          e.created_at,
          CATEGORY_LABELS[e.category],
          filterPetId ? splitAmount : totalAmount,
          totalAmount,
          e.merchant,
          e.remark,
          petName,
          e.receipt ? '有' : '无',
        ];
      }),
    ];
    
    const ws2 = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, ws2, '消费明细');
    
    if (filteredExpenses.some(e => e.receipt)) {
      const receiptData = filteredExpenses
        .filter(e => e.receipt)
        .map(e => {
          const pet = pets.find(p => p.id === e.pet_id);
          const splitAmount = filterPetId ? getPetSplitAmount(e, filterPetId) : 0;
          return [
            e.created_at,
            CATEGORY_LABELS[e.category],
            filterPetId ? splitAmount : e.amount,
            e.merchant,
            e.remark,
            pet?.name || '',
          ];
        });
      
      if (receiptData.length > 0) {
        const receiptSheetData = [
          ['日期', '分类', '金额', '商家', '备注', '宠物'],
          ...receiptData,
        ];
        const ws3 = XLSX.utils.aoa_to_sheet(receiptSheetData);
        XLSX.utils.book_append_sheet(wb, ws3, '有票据记录');
      }
    }
    
    XLSX.writeFile(wb, `宠物消费报表_${selectedMonth}${filterDesc ? '_' + filterDesc : ''}.xlsx`);
  };
  
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">月度报表</h1>
          <p className="text-gray-500 mt-1">消费数据与趋势分析</p>
        </div>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
        >
          <Download size={18} />
          <span>导出报表</span>
        </button>
      </header>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold">
            {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
          </h2>
          <button
            onClick={nextMonth}
            disabled={selectedMonth === format(new Date(), 'yyyy-MM')}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">按宠物筛选</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterPetId(null)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterPetId === null ? 'bg-primary text-white' : 'bg-gray-100'
                }`}
              >
                全部
              </button>
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setFilterPetId(pet.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    filterPetId === pet.id ? 'bg-primary text-white' : 'bg-gray-100'
                  }`}
                >
                  <PetAvatar pet={pet} size="sm" />
                  <span>{pet.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">按分类筛选</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory(null)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterCategory === null ? 'bg-primary text-white' : 'bg-gray-100'
                }`}
              >
                全部
              </button>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    filterCategory === cat ? 'bg-primary text-white' : 'bg-gray-100'
                  }`}
                >
                  <CategoryIcon category={cat} size="sm" />
                  <span>{CATEGORY_LABELS[cat]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="本月消费"
          value={formatCurrency(monthlyTotal)}
          color="#98D8C8"
        />
        <StatCard
          title="上月消费"
          value={formatCurrency(prevMonthTotal)}
          color="#FFB347"
        />
        <StatCard
          title="环比变化"
          value={`${monthChange >= 0 ? '+' : ''}${monthChange.toFixed(1)}%`}
          trend={{
            value: Math.abs(monthChange),
            isPositive: monthChange > 0,
          }}
          color="#FF6B6B"
        />
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">日消费趋势</h2>
        <MonthlyBarChart data={dailyData} />
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">近6个月趋势</h2>
        <TrendLineChart data={trendData} />
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">TOP 5 消费</h2>
        <div className="space-y-3">
          {topExpenses.map((expense, index) => {
            const pet = pets.find(p => p.id === expense.pet_id);
            const hasSplits = expense.splits && expense.splits.length > 0;
            
            return (
              <div
                key={expense.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    <span style={{ color: CATEGORY_COLORS[expense.category] }}>
                      {CATEGORY_LABELS[expense.category]}
                    </span>
                    {expense.is_fixed && <span className="text-xs text-primary ml-2">固定</span>}
                    {expense.receipt && <span className="text-xs text-secondary ml-2">📎</span>}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{pet?.avatar} {pet?.name}</span>
                    {hasSplits && (
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                        已分摊
                      </span>
                    )}
                    <span>•</span>
                    <span>{expense.remark || expense.merchant || '无备注'}</span>
                  </div>
                </div>
                <p className="text-lg font-bold text-accent">{formatCurrency(expense.displayAmount)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
