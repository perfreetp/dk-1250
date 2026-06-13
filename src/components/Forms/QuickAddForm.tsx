import { useState } from 'react';
import { X, ShoppingCart, Stethoscope, Scissors, Gamepad2, Home } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Category, CATEGORY_LABELS, CATEGORY_COLORS } from '../../types';
import PetAvatar from '../Common/PetAvatar';

interface QuickAddFormProps {
  onClose: () => void;
}

const categories: Category[] = ['food', 'medical', 'beauty', 'toy', 'boarding'];

const categoryIcons = {
  food: ShoppingCart,
  medical: Stethoscope,
  beauty: Scissors,
  toy: Gamepad2,
  boarding: Home,
};

export default function QuickAddForm({ onClose }: QuickAddFormProps) {
  const { pets, addExpense } = useStore();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [petId, setPetId] = useState(pets[0]?.id || '');
  const [merchant, setMerchant] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [remark, setRemark] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !petId) return;
    
    addExpense({
      amount: parseFloat(amount),
      category,
      pet_id: petId,
      merchant,
      quantity: parseInt(quantity) || 1,
      remark,
      receipt: '',
      is_fixed: false,
      created_at: new Date().toISOString().split('T')[0],
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold">快速记账</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">金额</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">¥</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-4 text-3xl font-bold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <div className="grid grid-cols-5 gap-2">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat];
                const color = CATEGORY_COLORS[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      isSelected ? 'ring-2 ring-primary' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    <span className="text-xs font-medium">{CATEGORY_LABELS[cat]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">宠物</label>
            <div className="flex gap-3">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => setPetId(pet.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    petId === pet.id ? 'bg-primary text-white' : 'bg-gray-100'
                  }`}
                >
                  <PetAvatar pet={pet} size="sm" />
                  <span className="font-medium">{pet.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">商家</label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="商家名称"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">数量</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="添加备注..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors"
          >
            保存记录
          </button>
        </form>
      </div>
    </div>
  );
}
