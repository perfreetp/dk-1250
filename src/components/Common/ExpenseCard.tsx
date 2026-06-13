import { Expense, Pet, CATEGORY_LABELS, CATEGORY_COLORS } from '../../types';
import { formatCurrency, formatDate, calculateSplitAmount } from '../../utils/helpers';
import { ShoppingCart, Stethoscope, Scissors, Gamepad2, Home, Image } from 'lucide-react';
import { useState } from 'react';

interface ExpenseCardProps {
  expense: Expense;
  pet?: Pet;
  pets?: Pet[];
  onClick?: () => void;
}

const categoryIcons = {
  food: ShoppingCart,
  medical: Stethoscope,
  beauty: Scissors,
  toy: Gamepad2,
  boarding: Home,
};

export default function ExpenseCard({ expense, pet, pets = [], onClick }: ExpenseCardProps) {
  const Icon = categoryIcons[expense.category];
  const color = CATEGORY_COLORS[expense.category];
  const [showReceipt, setShowReceipt] = useState(false);
  
  const splits = calculateSplitAmount(expense);
  const hasMultiplePets = Object.keys(splits).length > 1;
  
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
            {hasMultiplePets ? (
              <div className="flex items-center gap-1 mt-1">
                {Object.entries(splits).map(([petId, amount]) => {
                  const splitPet = pets.find(p => p.id === petId);
                  return (
                    <span key={petId} className="text-sm text-gray-500">
                      {splitPet?.avatar}{formatCurrency(amount)}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {pet?.avatar} {pet?.name}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(expense.amount)}
          </p>
          {expense.is_fixed && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              固定
            </span>
          )}
        </div>
      </div>
      
      {(expense.merchant || expense.remark) && (
        <div className="text-sm text-gray-500 space-y-1">
          {expense.merchant && <p>商家: {expense.merchant}</p>}
          {expense.remark && <p className="line-clamp-2">{expense.remark}</p>}
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span>{formatDate(expense.created_at)}</span>
          {expense.quantity > 1 && <span>×{expense.quantity}</span>}
        </div>
        {expense.receipt && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReceipt(true);
            }}
            className="flex items-center gap-1 text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
          >
            <Image size={14} />
            <span>票据</span>
          </button>
        )}
      </div>
      
      {showReceipt && expense.receipt && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowReceipt(false);
          }}
        >
          <div className="relative max-w-2xl w-full">
            <img
              src={expense.receipt}
              alt="Receipt"
              className="w-full rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setShowReceipt(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
