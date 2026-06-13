interface BudgetProgressProps {
  current: number;
  budget: number;
  category?: string;
  color?: string;
  showLabel?: boolean;
}

export default function BudgetProgress({ 
  current, 
  budget, 
  category,
  color = '#98D8C8',
  showLabel = false 
}: BudgetProgressProps) {
  const percentage = Math.min((current / budget) * 100, 100);
  const isOverBudget = current > budget;
  
  const displayColor = isOverBudget ? '#FF6B6B' : color;
  
  return (
    <div className="space-y-2">
      {category && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{category}</span>
          <span className="font-medium">
            ¥{current.toFixed(0)} / ¥{budget.toFixed(0)}
          </span>
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: displayColor,
          }}
        />
      </div>
      {showLabel && (
        <p className={`text-xs ${isOverBudget ? 'text-accent' : 'text-gray-400'}`}>
          {isOverBudget ? `超出 ¥${(current - budget).toFixed(0)}` : `剩余 ¥${(budget - current).toFixed(0)}`}
        </p>
      )}
    </div>
  );
}
