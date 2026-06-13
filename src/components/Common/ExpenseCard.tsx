import { Expense, Pet, CATEGORY_LABELS, CATEGORY_COLORS } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { ShoppingCart, Stethoscope, Scissors, Gamepad2, Home } from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  pet?: Pet;
  onClick?: () => void;
}

const categoryIcons = {
  food: ShoppingCart,
  medical: Stethoscope,
  beauty: Scissors,
  toy: Gamepad2,
  boarding: Home,
};

export default function ExpenseCard({ expense, pet, onClick }: ExpenseCardProps) {
  const Icon = categoryIcons[expense.category];
  const color = CATEGORY_COLORS[expense.category];
  
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon size={20} style={{ color }} />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {CATEGORY_LABELS[expense.category]}
            </p>
            <p className="text-sm text-gray-500">
              {pet?.avatar} {pet?.name}
            </p>
          </div>
        </div>
        <p className="text-lg font-bold text-foreground">
          {formatCurrency(expense.amount)}
        </p>
      </div>
      
      {(expense.merchant || expense.remark) && (
        <div className="text-sm text-gray-500 space-y-1">
          {expense.merchant && <p>商家: {expense.merchant}</p>}
          {expense.remark && <p className="line-clamp-2">{expense.remark}</p>}
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>{formatDate(expense.created_at)}</span>
        {expense.quantity > 1 && <span>×{expense.quantity}</span>}
      </div>
    </div>
  );
}
