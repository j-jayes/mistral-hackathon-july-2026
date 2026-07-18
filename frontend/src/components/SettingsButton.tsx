import { Settings } from 'lucide-react';

interface SettingsButtonProps {
  onClick: () => void;
  className?: string;
}

export default function SettingsButton({ onClick, className = '' }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors ${className}`}
    >
      <Settings className="w-6 h-6 text-white" />
    </button>
  );
}