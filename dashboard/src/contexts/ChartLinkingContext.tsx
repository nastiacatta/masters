import {
  createContext,
  useCallback,
  useState,
  type ReactNode,
} from 'react';

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

export interface ChartLinkingState {
  /** Currently hovered method key, or null if nothing is hovered. */
  hoveredMethod: string | null;
  /** Set of method keys currently visible via the persistent filter. */
  visibleMethods: Set<string>;
  /** Currently hovered round index for synchronised crosshair, or null. */
  hoveredRound: number | null;
}

/* ------------------------------------------------------------------ */
/*  Actions                                                            */
/* ------------------------------------------------------------------ */

export interface ChartLinkingActions {
  setHoveredMethod(key: string | null): void;
  toggleMethod(key: string): void;
  setHoveredRound(round: number | null): void;
  resetFilters(): void;
}

/* ------------------------------------------------------------------ */
/*  Combined context value                                             */
/* ------------------------------------------------------------------ */

export type ChartLinkingContextValue = ChartLinkingState & ChartLinkingActions;

/* ------------------------------------------------------------------ */
/*  Pure helper — exported for direct use and property-based testing   */
/* ------------------------------------------------------------------ */

/**
 * Compute the visual opacity for a method series.
 *
 * - Returns 0   if `key` is not in `visibleMethods`
 * - Returns 1.0 if `key === hoveredMethod`
 * - Returns 0.2 if another method is hovered (key ≠ hoveredMethod) but key is visible
 * - Returns 0.9 if nothing is hovered and key is visible
 */
export function getMethodOpacity(
  key: string,
  hoveredMethod: string | null,
  visibleMethods: Set<string>,
): number {
  if (!visibleMethods.has(key)) return 0;
  if (hoveredMethod === key) return 1.0;
  if (hoveredMethod !== null) return 0.2;
  return 0.9;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const noop = () => {};

const defaultValue: ChartLinkingContextValue = {
  hoveredMethod: null,
  visibleMethods: new Set<string>(),
  hoveredRound: null,
  setHoveredMethod: noop,
  toggleMethod: noop,
  setHoveredRound: noop,
  resetFilters: noop,
};

export const ChartLinkingContext =
  createContext<ChartLinkingContextValue>(defaultValue);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

interface ChartLinkingProviderProps {
  /** Method keys that should be visible initially. */
  initialMethods: string[];
  children: ReactNode;
}

export function ChartLinkingProvider({
  initialMethods,
  children,
}: ChartLinkingProviderProps) {
  const [hoveredMethod, setHoveredMethodRaw] = useState<string | null>(null);
  const [visibleMethods, setVisibleMethods] = useState<Set<string>>(
    () => new Set(initialMethods),
  );
  const [hoveredRound, setHoveredRoundRaw] = useState<number | null>(null);

  const setHoveredMethod = useCallback(
    (key: string | null) => setHoveredMethodRaw(key),
    [],
  );

  const toggleMethod = useCallback((key: string) => {
    setVisibleMethods((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const setHoveredRound = useCallback(
    (round: number | null) => setHoveredRoundRaw(round),
    [],
  );

  const resetFilters = useCallback(() => {
    setVisibleMethods(new Set(initialMethods));
    setHoveredMethodRaw(null);
    setHoveredRoundRaw(null);
  }, [initialMethods]);

  const value: ChartLinkingContextValue = {
    hoveredMethod,
    visibleMethods,
    hoveredRound,
    setHoveredMethod,
    toggleMethod,
    setHoveredRound,
    resetFilters,
  };

  return (
    <ChartLinkingContext value={value}>
      {children}
    </ChartLinkingContext>
  );
}
