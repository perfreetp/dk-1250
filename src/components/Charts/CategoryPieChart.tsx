import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Category, CATEGORY_LABELS, CATEGORY_COLORS } from '../../types';

interface CategoryPieChartProps {
  data: { category: Category; value: number }[];
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = data.map(item => ({
    name: CATEGORY_LABELS[item.category],
    value: item.value,
    color: CATEGORY_COLORS[item.category],
  }));
  
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`¥${value.toFixed(2)}`, '']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend
            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-2">
        <p className="text-sm text-gray-500">总计</p>
        <p className="text-2xl font-bold text-foreground">¥{total.toFixed(2)}</p>
      </div>
    </div>
  );
}
