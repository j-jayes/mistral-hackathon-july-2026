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
        'shadow-md hover:shadow-lg active:scale-95',
        is_recording
          ? 'bg-destructive text-destructive-foreground animate-pulse ring-4 ring-destructive/30'
          : 'bg-primary text-primary-foreground hover:bg-primary/90',
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