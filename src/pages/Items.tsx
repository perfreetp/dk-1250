import { useState, useMemo } from 'react';
import { Plus, X, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/helpers';
import { Category, CATEGORY_LABELS, CATEGORY_COLORS } from '../types';
import CategoryIcon from '../components/Common/CategoryIcon';

const categories: Category[] = ['food', 'medical', 'beauty', 'toy', 'boarding'];

export default function ItemsPage() {
  const { pets, items, addItem, updateItem, deleteItem } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'food' as Category,
    avg_price: 0,
    last_price: 0,
    stock_count: 0,
    remind_threshold: 1,
  });
  
  const lowStockItems = useMemo(() => {
    return items.filter(item => item.stock_count <= item.remind_threshold);
  }, [items]);
  
  const handleSaveItem = () => {
    if (!newItem.name) return;
    
    if (editingItem) {
      updateItem(editingItem, newItem);
    } else {
      addItem(newItem);
    }
    
    setShowModal(false);
    setEditingItem(null);
    setNewItem({
      name: '',
      category: 'food',
      avg_price: 0,
      last_price: 0,
      stock_count: 0,
      remind_threshold: 1,
    });
  };
  
  const handleEdit = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setNewItem({
        name: item.name,
        category: item.category,
        avg_price: item.avg_price,
        last_price: item.last_price,
        stock_count: item.stock_count,
        remind_threshold: item.remind_threshold,
      });
      setEditingItem(itemId);
      setShowModal(true);
    }
  };
  
  const handleDelete = (itemId: string) => {
    if (window.confirm('确定要删除这个物品吗？')) {
      deleteItem(itemId);
    }
  };
  
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">物品清单</h1>
        <p className="text-gray-500 mt-1">常购物品管理与均价对比</p>
      </header>
      
      {lowStockItems.length > 0 && (
        <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-white">
              <Package size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-secondary mb-1">库存提醒</h3>
              <p className="text-gray-600 mb-3">
                以下物品库存不足，请及时补充：
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map((item) => (
                  <span
                    key={item.id}
                    className="px-3 py-1 bg-white rounded-full text-sm font-medium"
                  >
                    {item.name} (剩{item.stock_count})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">常购物品</h2>
          <span className="text-sm text-gray-500">{items.length} 个物品</span>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 mb-4">暂无常购物品</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              添加第一个物品
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const priceChange = item.last_price - item.avg_price;
              const changePercentage = item.avg_price > 0 ? (priceChange / item.avg_price) * 100 : 0;
              const isLowStock = item.stock_count <= item.remind_threshold;
              
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border ${
                    isLowStock ? 'border-secondary/30 bg-secondary/5' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={item.category} size="sm" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {CATEGORY_LABELS[item.category]}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-sm text-primary font-medium px-3 py-1 hover:bg-primary/10 rounded-lg"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm text-accent font-medium px-3 py-1 hover:bg-accent/10 rounded-lg"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">均价</p>
                      <p className="font-bold text-foreground">{formatCurrency(item.avg_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">最近价格</p>
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-foreground">{formatCurrency(item.last_price)}</p>
                        {priceChange !== 0 && (
                          <div className={`flex items-center text-xs ${
                            priceChange > 0 ? 'text-accent' : 'text-green-500'
                          }`}>
                            {priceChange > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span>{Math.abs(changePercentage).toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">库存</p>
                      <p className={`font-bold ${isLowStock ? 'text-secondary' : 'text-foreground'}`}>
                        {item.stock_count}
                        {isLowStock && ' ⚠️'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">提醒阈值</p>
                      <p className="font-bold text-foreground">{item.remind_threshold}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <button
        onClick={() => {
          setShowModal(true);
          setEditingItem(null);
          setNewItem({
            name: '',
            category: 'food',
            avg_price: 0,
            last_price: 0,
            stock_count: 0,
            remind_threshold: 1,
          });
        }}
        className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition-all hover:scale-105 z-40"
      >
        <Plus size={28} />
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingItem ? '编辑物品' : '添加物品'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  物品名称
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="请输入物品名称"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as Category })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    均价 (元)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.avg_price}
                    onChange={(e) => setNewItem({ ...newItem, avg_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最近价格 (元)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.last_price}
                    onChange={(e) => setNewItem({ ...newItem, last_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    库存数量
                  </label>
                  <input
                    type="number"
                    value={newItem.stock_count}
                    onChange={(e) => setNewItem({ ...newItem, stock_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    提醒阈值
                  </label>
                  <input
                    type="number"
                    value={newItem.remind_threshold}
                    onChange={(e) => setNewItem({ ...newItem, remind_threshold: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <button
                onClick={handleSaveItem}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors"
              >
                {editingItem ? '保存修改' : '添加物品'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
