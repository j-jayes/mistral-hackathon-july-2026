import { VoiceInputButtonProps } from '@/types';
import { cn } from '@/lib/utils';
import { Mic, StopCircle } from 'lucide-react';

export default function VoiceInputButton({
  is_recording,
  onClick,
  disabled = false,
  className = ''
}: VoiceInputButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-center gap-2 rounded-2xl p-4 transition-all duration-200',
        'shadow-lg hover:shadow-xl active:scale-95',
        'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
        is_recording ? 'animate-pulse ring-4 ring-white/50 ring-offset-2 ring-offset-purple-700' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className
      )}
    >
      {/* Icon */}
      <span className="relative">
        {is_recording ? (
          <StopCircle className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
        
        {/* Recording indicator animation */}
        {is_recording && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-red-500 animate-ping" />
          </div>
        )}
      </span>
      
      {/* Text */}
      <span className="font-medium">
        {is_recording ? 'Stop Recording' : 'Speak Destination'}
      </span>
    </button>
  );
}

// Import types
import { VoiceInputButtonProps as VoiceInputButtonPropsType } from '@/types';

export type { VoiceInputButtonProps as VoiceInputButtonPropsType };