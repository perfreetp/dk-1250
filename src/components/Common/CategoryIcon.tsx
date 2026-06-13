import { Category, CATEGORY_LABELS, CATEGORY_COLORS } from '../../types';
import { ShoppingCart, Stethoscope, Scissors, Gamepad2, Home } from 'lucide-react';

interface CategoryIconProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizes = {
  sm: { icon: 20, wrapper: 36 },
  md: { icon: 24, wrapper: 44 },
  lg: { icon: 28, wrapper: 56 },
};

const categoryIcons = {
  food: ShoppingCart,
  medical: Stethoscope,
  beauty: Scissors,
  toy: Gamepad2,
  boarding: Home,
};

export default function CategoryIcon({ category, size = 'md', showLabel = false }: CategoryIconProps) {
  const Icon = categoryIcons[category];
  const color = CATEGORY_COLORS[category];
  const sizeConfig = sizes[size];
  
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-xl flex items-center justify-center"
        style={{
          width: sizeConfig.wrapper,
          height: sizeConfig.wrapper,
          backgroundColor: `${color}20`,
        }}
      >
        <Icon size={sizeConfig.icon} style={{ color }} />
      </div>
      {showLabel && (
        <span className="font-medium text-foreground">
          {CATEGORY_LABELS[category]}
        </span>
      )}
    </div>
  );
}
