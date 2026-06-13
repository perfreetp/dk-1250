import { Pet } from '../../types';

interface PetAvatarProps {
  pet: Pet;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
}

const sizes = {
  sm: { avatar: 32, text: 'text-lg' },
  md: { avatar: 40, text: 'text-2xl' },
  lg: { avatar: 56, text: 'text-3xl' },
};

export default function PetAvatar({ pet, size = 'md', selected = false, onClick }: PetAvatarProps) {
  const sizeConfig = sizes[size];
  
  return (
    <div
      onClick={onClick}
      className={`relative rounded-full flex items-center justify-center transition-all ${
        selected ? 'ring-2 ring-primary ring-offset-2' : ''
      } ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      style={{
        width: sizeConfig.avatar,
        height: sizeConfig.avatar,
        backgroundColor: selected ? '#98D8C820' : '#f3f4f6',
      }}
    >
      <span className={sizeConfig.text}>{pet.avatar}</span>
      {selected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white" />
      )}
    </div>
  );
}
