import { HeaderProps } from '@/types';
import { Settings } from 'lucide-react';

export default function Header({ title, subtitle, rightContent, leftContent }: HeaderProps) {
  return (
    <header className="w-full px-4 py-4 ios-safe-area-top">
      <div className="flex items-center justify-between max-w-2xl mx-auto gap-3">
        {leftContent && <div className="shrink-0">{leftContent}</div>}
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-2xl font-light text-primary truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
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
      className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-primary hover:bg-secondary transition-colors btn-raised"
    >
      <Settings className="w-5 h-5" />
    </button>
  );
}