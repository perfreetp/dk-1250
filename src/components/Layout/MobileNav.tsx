import { Link, useLocation } from 'react-router-dom';
import { Home, PieChart, BarChart3, Target, Package } from 'lucide-react';

const navItems = [
  { path: '/', label: '记账', icon: Home },
  { path: '/category', label: '分类', icon: PieChart },
  { path: '/report', label: '报表', icon: BarChart3 },
  { path: '/budget', label: '预算', icon: Target },
  { path: '/items', label: '清单', icon: Package },
];

export default function MobileNav() {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-inset-bottom">
      <div className="flex justify-around items-center">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
