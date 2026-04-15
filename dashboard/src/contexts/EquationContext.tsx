import { createContext, useRef, type ReactNode } from 'react';
import type { NumberingContextValue } from '@/contexts/FigureContext';

const defaultValue: NumberingContextValue = {
  next: () => 0,
  reset: () => {},
};

export const EquationContext = createContext<NumberingContextValue>(defaultValue);

export function EquationProvider({ children }: { children: ReactNode }) {
  const counter = useRef(0);

  // Reset on every mount so each page starts from 1.
  counter.current = 0;

  const value: NumberingContextValue = {
    next() {
      counter.current += 1;
      return counter.current;
    },
    reset() {
      counter.current = 0;
    },
  };

  return <EquationContext value={value}>{children}</EquationContext>;
}
