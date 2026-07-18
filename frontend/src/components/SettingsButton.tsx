import { Settings } from 'lucide-react';

interface SettingsButtonProps {
  onClick: () => void;
  className?: string;
}

export default function SettingsButton({ onClick, className = '' }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-primary hover:bg-secondary transition-colors btn-raised ${className}`}
    >
      <Settings className="w-5 h-5" />
    </button>
  );
}