import { HeaderProps } from '@/types';
import { Settings } from 'lucide-react';

export default function Header({ title, subtitle, rightContent }: HeaderProps) {
  return (
    <header className="w-full px-4 py-4 ios-safe-area-top">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">{title}</h1>
          {subtitle && (
            <p className="text-sm text-white/70 mt-1">{subtitle}</p>
          )}
        </div>
        
        {rightContent && (
          <div className="ml-4">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}

// Import types
import { HeaderProps as HeaderPropsType } from '@/types';

export type { HeaderProps as HeaderPropsType };

// Settings button component
export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
    >
      <Settings className="w-6 h-6 text-white" />
    </button>
  );
}