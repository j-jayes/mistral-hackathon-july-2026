import * as React from 'react';
import { cn } from '@/lib/utils';

// A minimal shadcn-Select-compatible API backed by a native <select>, so no
// @radix-ui/react-select dependency is required. SelectTrigger/SelectValue/
// SelectContent are accepted for API compatibility; the actual options are
// collected from <SelectItem> descendants.

interface SelectItemProps {
  value: string;
  children?: React.ReactNode;
}

const SELECT_ITEM = Symbol.for('velib.SelectItem');

export function SelectItem(_props: SelectItemProps): JSX.Element | null {
  return null;
}
(SelectItem as unknown as { $$type: symbol }).$$type = SELECT_ITEM;

export function SelectTrigger({ children }: { className?: string; children?: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectValue(_props: { placeholder?: string }): null {
  return null;
}

export function SelectContent({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function collectItems(
  node: React.ReactNode,
  out: { value: string; label: React.ReactNode }[],
): void {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    const type = child.type as unknown as { $$type?: symbol };
    if (type && type.$$type === SELECT_ITEM) {
      const props = child.props as SelectItemProps;
      out.push({ value: props.value, label: props.children });
    } else if ((child.props as { children?: React.ReactNode })?.children) {
      collectItems((child.props as { children?: React.ReactNode }).children, out);
    }
  });
}

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const items: { value: string; label: React.ReactNode }[] = [];
  collectItems(children, items);

  return (
    <select
      className={cn(
        'flex h-10 w-full items-center rounded-md border border-input bg-white px-3 py-2 text-sm',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {typeof item.label === 'string' ? item.label : item.value}
        </option>
      ))}
    </select>
  );
}

export default Select;
