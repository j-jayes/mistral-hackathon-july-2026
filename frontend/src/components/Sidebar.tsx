import { useState, useCallback, FormEvent } from 'react';
import { X, MapPin, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onSetDestination: (address: string) => void;
  onDemo: () => void;
  currentDestination?: string | null;
}

// Address used by demo mode.
export const DEMO_ADDRESS = '21 rue des Gravilliers, Paris';

/**
 * Collapsible off-canvas sidebar: type a destination address or launch the
 * demo that routes to 21 rue des Gravilliers.
 */
export default function Sidebar({
  open,
  onClose,
  onSetDestination,
  onDemo,
  currentDestination,
}: SidebarProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const value = address.trim();
      if (!value) return;
      onSetDestination(value);
      setAddress('');
      onClose();
    },
    [address, onSetDestination, onClose],
  );

  const handleDemo = useCallback(() => {
    onDemo();
    onClose();
  }, [onDemo, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm bg-card border-r border-border shadow-xl
          flex flex-col ios-safe-area-top ios-safe-area-bottom
          transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-label="Destination"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-serif text-xl font-light text-primary">Where to?</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Typed destination */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <label htmlFor="destination-input" className="text-sm font-medium text-foreground">
              Type a destination
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="destination-input"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 21 rue des Gravilliers"
                autoComplete="off"
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button type="submit" size="lg" className="w-full gap-2" disabled={!address.trim()}>
              <Search className="w-4 h-4" />
              Find parking
            </Button>
          </form>

          {/* Demo */}
          <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              Try the demo
            </div>
            <p className="text-xs text-muted-foreground">
              Routes to <span className="font-mono">21 rue des Gravilliers</span> and points
              you to the nearest station with a free dock.
            </p>
            <Button variant="outline" size="lg" className="w-full" onClick={handleDemo}>
              Run demo
            </Button>
          </div>

          {currentDestination && (
            <p className="text-xs text-muted-foreground">
              Current destination: <span className="text-foreground">{currentDestination}</span>
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
