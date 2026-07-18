import { LoadingSpinnerProps } from '@/types';
import { cn } from '@/lib/utils';

export default function LoadingSpinner({ size = 40, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={cn("fixed inset-0 flex items-center justify-center z-50", className)}>
      <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6">
        <div 
          className="animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
          style={{ width: size, height: size }}
        />
        <p className="mt-4 text-white text-center">Loading...</p>
      </div>
    </div>
  );
}

// Import types
import { LoadingSpinnerProps as LoadingSpinnerPropsType } from '@/types';

export type { LoadingSpinnerProps as LoadingSpinnerPropsType };