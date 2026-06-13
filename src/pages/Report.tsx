import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format, subMonths, addMonths, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import { getMonthlyTotal, formatCurrency } from '../utils/helpers';
import StatCard from '../components/Common/StatCard';
import MonthlyBarChart from '../components/Charts/MonthlyBarChart';
import TrendLineChart from '../components/Charts/TrendLineChart';
import * as XLSX from 'xlsx';

export default function ReportPage() {
  const { expenses, currentMonth, setCurrentMonth } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
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
  
  const monthlyTotal = useMemo(() => getMonthlyTotal(expenses, selectedMonth), [expenses, selectedMonth]);
  
  const prevMonthTotal = useMemo(() => {
    const date = subMonths(currentDate, 1);
    const month = format(date, 'yyyy-MM');
    return getMonthlyTotal(expenses, month);
  }, [expenses, currentDate]);
  
  const monthChange = useMemo(() => {
    if (prevMonthTotal === 0) return 0;
    return ((monthlyTotal - prevMonthTotal) / prevMonthTotal) * 100;
  }, [monthlyTotal, prevMonthTotal]);
  
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const data = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
      const dayExpenses = expenses.filter(e => e.created_at === dateStr);
      const amount = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      data.push({
        date: `${day}日`,
        amount,
      });
    }
    
    return data;
  }, [expenses, selectedMonth, currentDate]);
  
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(currentDate, i);
      const month = format(date, 'yyyy-MM');
      const total = getMonthlyTotal(expenses, month);
      data.push({
        month: format(date, 'MM月', { locale: zhCN }),
        amount: total,
      });
    }
    return data;
  }, [expenses, currentDate]);
  
  const topExpenses = useMemo(() => {
    const monthExpenses = expenses
      .filter(e => e.created_at.startsWith(selectedMonth))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    return monthExpenses;
  }, [expenses, selectedMonth]);
  
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const summaryData = [
      ['月份', selectedMonth],
      ['总消费', monthlyTotal],
      ['环比变化', `${monthChange.toFixed(1)}%`],
      [''],
      ['日期', '消费金额'],
      ...dailyData.map(d => [d.date, d.amount]),
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws, '消费汇总');
    
    const detailData = [
      ['日期', '分类', '金额', '商家', '备注'],
      ...expenses
        .filter(e => e.created_at.startsWith(selectedMonth))
        .map(e => [e.created_at, e.category, e.amount, e.merchant, e.remark]),
    ];
    
    const ws2 = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, ws2, '消费明细');
    
    XLSX.writeFile(wb, `宠物消费报表_${selectedMonth}.xlsx`);
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
        <div className="flex items-center justify-between">
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
          {topExpenses.map((expense, index) => (
            <div
              key={expense.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-50"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium">{expense.category}</p>
                <p className="text-sm text-gray-500">{expense.remark || expense.merchant || '无备注'}</p>
              </div>
              <p className="text-lg font-bold text-accent">{formatCurrency(expense.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
