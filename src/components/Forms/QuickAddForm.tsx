import { useState, useRef } from 'react';
import { X, ShoppingCart, Stethoscope, Scissors, Gamepad2, Home, Upload, Calendar } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Category, CATEGORY_LABELS, CATEGORY_COLORS, CycleType, CYCLE_LABELS, ExpenseSplit } from '../../types';
import PetAvatar from '../Common/PetAvatar';
import { convertFileToBase64 } from '../../utils/helpers';

interface QuickAddFormProps {
  onClose: () => void;
}

const categories: Category[] = ['food', 'medical', 'beauty', 'toy', 'boarding'];
const cycleTypes: CycleType[] = ['once', 'monthly', 'weekly', 'quarterly', 'yearly'];

const categoryIcons = {
  food: ShoppingCart,
  medical: Stethoscope,
  beauty: Scissors,
  toy: Gamepad2,
  boarding: Home,
};

export default function QuickAddForm({ onClose }: QuickAddFormProps) {
  const { pets, addExpense, addFixedExpense } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [selectedPets, setSelectedPets] = useState<string[]>([pets[0]?.id || '']);
  const [splits, setSplits] = useState<{ [petId: string]: string }>({});
  const [percentages, setPercentages] = useState<{ [petId: string]: string }>({});
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'custom'>('equal');
  const [merchant, setMerchant] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [remark, setRemark] = useState('');
  const [receipt, setReceipt] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [cycleType, setCycleType] = useState<CycleType>('monthly');
  const [nextGenerateDate, setNextGenerateDate] = useState('');
  
  const handlePetToggle = (petId: string) => {
    if (selectedPets.includes(petId)) {
      if (selectedPets.length > 1) {
        setSelectedPets(selectedPets.filter(id => id !== petId));
        const newSplits = { ...splits };
        const newPercentages = { ...percentages };
        delete newSplits[petId];
        delete newPercentages[petId];
        setSplits(newSplits);
        setPercentages(newPercentages);
      }
    } else {
      setSelectedPets([...selectedPets, petId]);
    }
  };
  
  const handleSplitChange = (petId: string, value: string) => {
    setSplits({ ...splits, [petId]: value });
  };
  
  const handlePercentageChange = (petId: string, value: string) => {
    setPercentages({ ...percentages, [petId]: value });
  };
  
  const handleEqualSplit = () => {
    const total = parseFloat(amount) || 0;
    const perPet = (total / selectedPets.length).toFixed(2);
    const newSplits: { [petId: string]: string } = {};
    selectedPets.forEach(id => {
      newSplits[id] = perPet;
    });
    setSplits(newSplits);
    setPercentages({});
  };
  
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);
        setReceipt(base64);
      } catch (error) {
        console.error('Failed to upload receipt:', error);
      }
    }
  };
  
  const getExpenseSplits = (): ExpenseSplit[] => {
    if (selectedPets.length === 1) {
      return [];
    }
    
    const total = parseFloat(amount) || 0;
    
    if (splitType === 'equal') {
      const perPet = total / selectedPets.length;
      return selectedPets.map(petId => ({
        pet_id: petId,
        amount: parseFloat(perPet.toFixed(2)),
        percentage: 100 / selectedPets.length,
      }));
    }
    
    if (splitType === 'percentage') {
      return selectedPets.map(petId => {
        const pct = parseFloat(percentages[petId] || '0');
        const splitAmount = (total * pct) / 100;
        return {
          pet_id: petId,
          amount: parseFloat(splitAmount.toFixed(2)),
          percentage: pct,
        };
      });
    }
    
    return selectedPets.map(petId => {
      const splitAmount = parseFloat(splits[petId] || '0');
      return {
        pet_id: petId,
        amount: splitAmount,
        percentage: total > 0 ? (splitAmount / total) * 100 : 0,
      };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) return;
    
    const expenseData = {
      amount: parseFloat(amount),
      category,
      pet_id: selectedPets[0] || '',
      merchant,
      quantity: parseInt(quantity) || 1,
      remark,
      receipt,
      is_fixed: isFixed,
      cycle_type: isFixed ? cycleType : undefined,
      next_generate_date: isFixed ? nextGenerateDate : undefined,
      splits: getExpenseSplits(),
      created_at: new Date().toISOString().split('T')[0],
    };
    
    if (isFixed) {
      addFixedExpense({
        name: remark || `${CATEGORY_LABELS[category]} - ${merchant}`,
        amount: parseFloat(amount),
        category,
        pet_id: selectedPets[0] || '',
        merchant,
        cycle_type: cycleType,
        next_generate_date: nextGenerateDate,
        is_active: true,
        splits: getExpenseSplits(),
      });
    }
    
    addExpense(expenseData);
    onClose();
  };
  
  const totalAllocated = selectedPets.reduce((sum, petId) => {
    if (splitType === 'percentage') {
      const pct = parseFloat(percentages[petId] || '0');
      return sum + pct;
    }
    return sum + (parseFloat(splits[petId] || '0') || 0);
  }, 0);
  
  const total = parseFloat(amount) || 0;
  const totalAmountDisplay = splitType === 'percentage' 
    ? `${totalAllocated.toFixed(1)}%`
    : `¥${totalAllocated.toFixed(2)}`;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
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
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (splitType === 'equal') handleEqualSplit();
                }}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              宠物 {selectedPets.length > 1 && <span className="text-accent">（分摊）</span>}
            </label>
            <div className="flex flex-wrap gap-3">
              {pets.map((pet) => {
                const isSelected = selectedPets.includes(pet.id);
                return (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => handlePetToggle(pet.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      isSelected ? 'bg-primary text-white' : 'bg-gray-100'
                    }`}
                  >
                    <PetAvatar pet={pet} size="sm" />
                    <span className="font-medium">{pet.name}</span>
                  </button>
                );
              })}
            </div>
            
            {selectedPets.length > 1 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSplitType('equal');
                      handleEqualSplit();
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                      splitType === 'equal' ? 'bg-primary text-white' : 'bg-white'
                    }`}
                  >
                    平均分摊
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSplitType('percentage');
                      setSplits({});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                      splitType === 'percentage' ? 'bg-primary text-white' : 'bg-white'
                    }`}
                  >
                    按百分比
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSplitType('custom');
                      setPercentages({});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                      splitType === 'custom' ? 'bg-primary text-white' : 'bg-white'
                    }`}
                  >
                    自定义金额
                  </button>
                </div>
                
                {selectedPets.map((petId) => {
                  const pet = pets.find(p => p.id === petId);
                  const pct = parseFloat(percentages[petId] || '0');
                  const splitAmt = splitType === 'percentage' 
                    ? ((total * pct) / 100).toFixed(2)
                    : splits[petId] || '';
                  
                  return (
                    <div key={petId} className="flex items-center gap-3">
                      <span className="text-xl">{pet?.avatar}</span>
                      <span className="flex-1 text-sm">{pet?.name}</span>
                      {splitType === 'percentage' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={percentages[petId] || ''}
                            onChange={(e) => handlePercentageChange(petId, e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <span className="text-gray-400">%</span>
                          <span className="text-xs text-gray-500 ml-1">
                            = ¥{splitAmt}
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                          <input
                            type="number"
                            step="0.01"
                            value={splits[petId] || ''}
                            onChange={(e) => handleSplitChange(petId, e.target.value)}
                            placeholder="0.00"
                            className="w-28 pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                
                <div className="flex justify-between text-sm">
                  <span>合计</span>
                  <span className={Math.abs(totalAllocated - (splitType === 'percentage' ? 100 : total)) < 0.01 ? 'text-green-500' : 'text-accent'}>
                    {totalAmountDisplay} / {splitType === 'percentage' ? '100%' : `¥${total.toFixed(2)}`}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFixed}
                  onChange={(e) => setIsFixed(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Calendar size={16} />
                <span>设为固定开销</span>
              </label>
            </label>
            
            {isFixed && (
              <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">周期</label>
                  <div className="flex gap-2">
                    {cycleTypes.map((cycle) => (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => setCycleType(cycle)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          cycleType === cycle ? 'bg-primary text-white' : 'bg-white'
                        }`}
                      >
                        {CYCLE_LABELS[cycle]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">下次生成日期</label>
                  <input
                    type="date"
                    value={nextGenerateDate}
                    onChange={(e) => setNextGenerateDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            )}
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
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">票据照片</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleReceiptUpload}
              className="hidden"
            />
            
            {receipt ? (
              <div className="relative">
                <img
                  src={receipt}
                  alt="Receipt"
                  className="w-full h-40 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setReceipt('')}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors"
              >
                <Upload size={24} />
                <span className="text-sm">点击上传票据照片</span>
              </button>
            )}
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
