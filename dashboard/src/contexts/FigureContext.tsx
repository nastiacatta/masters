import { createContext, useRef, type ReactNode } from 'react';

/** Shared interface for sequential numbering contexts. */
export interface NumberingContextValue {
  /** Returns the next sequential number (1, 2, 3, …). */
  next(): number;
  /** Resets the counter to 0 so the next call to `next()` returns 1. */
  reset(): void;
}

const defaultValue: NumberingContextValue = {
  next: () => 0,
  reset: () => {},
};

export const FigureContext = createContext<NumberingContextValue>(defaultValue);

export function FigureProvider({ children }: { children: ReactNode }) {
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

  return <FigureContext value={value}>{children}</FigureContext>;
}
