import { Link, useLocation } from 'react-router-dom';
import { Home, PieChart, BarChart3, Target, Package } from 'lucide-react';

const navItems = [
  { path: '/', label: '记账', icon: Home },
  { path: '/category', label: '分类', icon: PieChart },
  { path: '/report', label: '报表', icon: BarChart3 },
  { path: '/budget', label: '预算', icon: Target },
  { path: '/items', label: '清单', icon: Package },
];

export default function Sidebar() {
  const location = useLocation();
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg p-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-2xl">
          🐾
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">宠物记账</h1>
          <p className="text-sm text-gray-500">养宠成本分析</p>
        </div>
      </div>
      
      <nav className="space-y-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-4 text-white">
          <p className="text-sm font-medium mb-1">今日消费</p>
          <p className="text-2xl font-bold">¥328.00</p>
          <p className="text-xs opacity-80 mt-1">较昨日 +12%</p>
        </div>
      </div>
    </aside>
  );
}
