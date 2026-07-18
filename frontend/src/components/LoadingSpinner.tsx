import { LoadingSpinnerProps } from '@/types';
import { cn } from '@/lib/utils';

export default function LoadingSpinner({ size = 40, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={cn("fixed inset-0 flex items-center justify-center z-50", className)}>
      <div className="bg-card border border-border shadow-lg rounded-xl p-6">
        <div
          className="animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"
          style={{ width: size, height: size }}
        />
        <p className="mt-4 text-muted-foreground text-center">Loading...</p>
      </div>
    </div>
  );
}

// Import types
import { LoadingSpinnerProps as LoadingSpinnerPropsType } from '@/types';

export type { LoadingSpinnerProps as LoadingSpinnerPropsType };