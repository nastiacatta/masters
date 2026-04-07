# Design Document: Dashboard UI Redesign

## Overview

This design covers the UI/UX redesign of the thesis dashboard for "Adaptive Skill and Stake in Forecast Markets" by Anastasia Cattaneo. The dashboard visualises pre-run experiment outputs from a forecast market mechanism that combines online skill learning with stake-based wagering (Lambert 2008, Raja-Pinson extension).

The redesign addresses three core problems:
1. The current sidebar lacks icons, responsive behaviour, and visual grouping
2. Charts are functional but lack interactive polish (no drag-zoom on most pages, inconsistent tooltips, no series toggles on results charts)
3. Experiment results are not presented with the narrative structure the thesis demands: "does it work?" → "where?" → "why?" → "when does it break?"

Additionally, the redesign introduces:
4. A thesis narrative flow with "So what?" cards connecting findings to the research question, and guided forward/backward navigation between story acts
5. A formula registry that cross-checks every mathematical formula against the thesis PDFs, with source citations on FormulaCard and MathBlock components
6. Copy quality enforcement — no filler text, precise chart subtitles, proper author-year literature citations
7. A dedicated key findings presentation with traffic-light verdicts and strength-of-evidence indicators
8. Interactive narrative elements: deep-dive expandable panels, inline term tooltips from the glossary, cross-reference links between sections, and methodology notes

The thesis research question drives every design decision:
> Can combining stake with an online, time-varying skill layer improve aggregate forecasts under non-stationarity, strategic behaviour, and intermittent participation?

### Narrative Flow

The dashboard tells a story in five acts, each mapped to a route:

| Act | Route | Question | Key Charts |
|-----|-------|----------|------------|
| 1. Understand | `/` Overview | What is this mechanism? | System architecture, round timeline |
| 2. Does it work? | `/results` | Does skill×stake beat baselines? | Master comparison bars, cumulative CRPS lines, calibration |
| 3. How? | `/mechanism` | How does one round work? | Interactive pipeline, skill/wealth/error timelines |
| 4. When does it break? | `/robustness` | Where are the limits? | Intermittency, sybil, sensitivity, behaviour experiments |
| 5. So what? | `/results#findings` | What does this mean? | Key findings with verdicts, evidence strength, cross-refs |

Each page includes a `NarrativeNav` component at the bottom with forward/backward links to adjacent story acts, creating a guided reading path.

### Standardised 4-Panel Output

Every experiment result section follows the same visual contract (from NEXT_STEPS.md):

| Panel | Content | Chart Type |
|-------|---------|------------|
| Primary outcome | Relative CRPS or Brier improvement (Δ vs baseline) | Horizontal bar with error bars |
| Calibration | PIT or reliability diagram | Scatter on diagonal |
| Market structure | Wealth/influence concentration (HHI, N_eff, Gini) | Grouped bar |
| Failure mode | Where the method breaks | Context-dependent (heatmap, line, scatter) |

## Architecture

### Current Architecture

```mermaid
graph TD
    subgraph Data Layer
        A[public/data/*.json, *.csv] -->|fetch| B[adapters.ts]
        B --> C[store.tsx / explorerStore.tsx]
    end
    subgraph UI Layer
        C --> D[Pages: Home, Mechanism, Results, Robustness]
        D --> E[Chart Components]
        D --> F[Dashboard Components]
        E --> G[Recharts]
        F --> H[Framer Motion]
    end
```

### Redesigned Architecture

The redesign preserves the existing data layer (adapters, store, types) and focuses on the UI layer. No new data fetching patterns are introduced.

```mermaid
graph TD
    subgraph Data Layer - Unchanged
        A[public/data/] -->|fetch| B[adapters.ts]
        B --> C[store.tsx]
    end
    subgraph Design System - New/Enhanced
        DS[tokens.ts + theme.ts] --> TH[ThemeProvider]
        TH --> ALL[All Components]
    end
    subgraph Formula Verification - New
        FR[formula_registry.json] -->|useFormulaRegistry| FC[FormulaCard / MathBlock]
        CG[copyGuard.ts] --> ALL
    end
    subgraph Navigation - Enhanced
        S[Sidebar] -->|icons, groups, responsive| NAV[React Router]
        BC[Breadcrumb] --> NAV
        NN[NarrativeNav] --> NAV
    end
    subgraph Pages - Enhanced
        NAV --> P1[HomePage + KeyFindings]
        NAV --> P2[ResultsPage]
        NAV --> P3[MechanismPage]
        NAV --> P4[RobustnessPage]
        NAV --> P5[ExperimentsPage]
    end
    subgraph Charts - Enhanced
        P2 --> CH[Enhanced Chart Components]
        CH --> ZM[useChartZoom - existing]
        CH --> TG[Series toggles]
        CH --> AN[Animated transitions]
        CH --> FP[FourPanelLayout]
    end
    subgraph Interactive Narrative - New
        DD[DeepDive] --> P1
        DD --> P2
        TT[TermTooltip] --> ALL
        CR[CrossReference] --> NAV
        MN[MethodologyNote] --> DD
    end
```

### Key Architectural Decisions

1. **No new state management**: The existing `store.tsx` and `explorerStore.tsx` are sufficient. Theme state is added to localStorage via a lightweight `ThemeProvider` context, not the main store.

2. **Progressive enhancement**: All chart enhancements (zoom, toggles, animations) are added to existing chart components rather than replacing them. The `useChartZoom` hook already exists and is used on MechanismPage/RobustnessPage; it will be extended to all chart instances.

3. **Responsive strategy**: Tailwind breakpoints (`sm:`, `md:`, `lg:`) handle layout shifts. The sidebar uses three modes: full (≥1024px), icon-only (768–1023px), hidden with hamburger (<768px). This is CSS-driven with a small state toggle for the mobile drawer.

4. **Dark mode via CSS custom properties**: Tailwind's `dark:` variant with a class-based toggle on `<html>`. Chart colours reference CSS variables so Recharts picks up theme changes without re-rendering the chart data.


## Components and Interfaces

### 1. Navigation Components

#### Sidebar (Enhanced: `components/dashboard/Sidebar.tsx`)

Current: Plain text NavLinks, fixed 192px width, no icons, no responsive behaviour.

Redesigned:
- Each route gets an SVG icon (inline, 16×16) alongside the text label
- Routes grouped into "Primary" (Overview, Mechanism, Results, Robustness) and "Secondary" (Appendix, Experiments) with a subtle divider
- Active route: teal-500 left border accent (3px), teal-50 background, teal-700 text
- Hover: slate-800 background, 100ms transition
- Responsive modes:
  - `≥1024px`: Full sidebar (192px), icons + text
  - `768–1023px`: Icon-only (48px), expand to full on hover with `onMouseEnter`/`onMouseLeave`
  - `<768px`: Hidden; hamburger icon in a top bar opens a slide-out drawer (Framer Motion `AnimatePresence`)
- Header: "Skill × Stake" title + "Thesis dashboard" subtitle (existing), plus theme toggle button

```typescript
interface SidebarProps {
  // No props needed; reads route from React Router, theme from ThemeProvider
}

interface NavItem {
  to: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  group: 'primary' | 'secondary';
}
```

#### Breadcrumb (New: `components/dashboard/Breadcrumb.tsx`)

Renders the current route path as clickable segments. On tabbed pages (Results, Robustness), appends the active tab name.

```typescript
interface BreadcrumbProps {
  /** Override the final segment label (e.g., active tab name) */
  activeTab?: string;
}
```

Placement: Top of the main content area, below any page header, above content. Uses `useLocation()` from React Router to derive segments.

### 2. Chart Components (Enhanced)

All six existing chart components gain consistent interactive features:

#### Shared Chart Enhancements

Every chart wrapped in `ChartCard` gets:
- **Drag-to-zoom**: `useChartZoom` hook (already exists) applied to XAxis domain + ReferenceArea overlay
- **Reset zoom button**: `ZoomBadge` component (already exists in MechanismPage/RobustnessPage, extracted to shared)
- **Series toggles**: For multi-series charts, legend items are clickable to show/hide series (already implemented in `SkillTrajectoryChart`, standardised across all)
- **Animated transitions**: Recharts `isAnimationActive` with 300ms duration on data changes
- **Fullscreen expand**: Already in `ChartCard` via the expand button + `ExpandModal`
- **InfoToggle**: Each chart gets a help popover explaining what the chart shows, what the axes mean, and how to interpret it

#### FourPanelLayout (New: `components/charts/FourPanelLayout.tsx`)

The standardised 4-panel experiment output layout.

```typescript
interface FourPanelLayoutProps {
  /** Panel 1: Primary outcome chart (Δ CRPS bar) */
  primary: React.ReactNode;
  /** Panel 2: Calibration chart (PIT/reliability) */
  calibration: React.ReactNode;
  /** Panel 3: Market structure chart (HHI, N_eff, Gini bars) */
  structure: React.ReactNode;
  /** Panel 4: Failure mode chart (context-dependent) */
  failure: React.ReactNode;
  /** Experiment title */
  title: string;
  /** One-sentence thesis point this experiment makes */
  thesisPoint: string;
}
```

Layout: 2×2 grid on `≥1024px`, stacked on smaller screens. Each panel is a `ChartCard` with a panel-specific subtitle.

#### DeltaBarChart (New: `components/charts/DeltaBarChart.tsx`)

Horizontal bar chart for paired deltas (Δ CRPS vs baseline). Used in master comparison and ablation views.

```typescript
interface DeltaBarChartProps {
  data: Array<{
    label: string;
    delta: number;
    se?: number;
    color: string;
  }>;
  /** Reference line at x=0 */
  baselineLabel?: string;
  /** Axis label */
  metricLabel?: string;
}
```

Visual: Bars extend left (negative = better) or right (positive = worse) from a zero reference line. Error bars shown when `se` is provided. Rank badges (#1, #2, etc.) on the left.

#### ConcentrationPanel (New: `components/charts/ConcentrationPanel.tsx`)

Grouped bar chart showing Gini, HHI, and N_eff side by side for each method.

```typescript
interface ConcentrationPanelProps {
  data: Array<{
    method: string;
    label: string;
    color: string;
    gini?: number;
    hhi?: number;
    nEff?: number;
  }>;
}
```

### 3. Page Components (Enhanced)

#### ResultsPage (Enhanced)

Current: Has headline answer cards, accuracy ranking, concentration bars, calibration, ablation. Good structure but needs:
- 4-panel layout for master comparison
- Clearer visual hierarchy: headline cards → ranked list → evidence tabs
- Tab transitions: horizontal slide animation (200ms) via Framer Motion `AnimatePresence` with `mode="wait"`
- Ablation: waterfall-style chart showing which pipeline step (A–E) creates the gain

#### RobustnessPage (Enhanced)

Current: Three sections (intermittency, sybil, sensitivity) with good chart work. Needs:
- 4-panel layout per robustness test
- Behaviour experiment cards for the full behaviour matrix
- Failure mode panel for each test (e.g., "at what participation rate does accuracy degrade?")

#### ExperimentsPage (Enhanced)

Current: Exists at `/appendix/experiments`. Needs:
- Card grid layout with filter controls (block category) and search
- Each card: experiment name, description (2-line truncation), block badge, 3 key metrics
- Framer Motion `layoutId` for smooth grid re-layout on filter change

### 4. Design System Components

#### ThemeProvider (New: `lib/themeProvider.tsx`)

```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

- Reads `localStorage.getItem('theme')` on mount
- Falls back to `window.matchMedia('(prefers-color-scheme: dark)')` on first visit
- Toggles `dark` class on `document.documentElement`
- Persists choice to localStorage

#### Skeleton (New: `components/dashboard/Skeleton.tsx`)

Pulsing placeholder for loading states. Matches the dimensions of the component it replaces.

```typescript
interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}
```

#### ErrorBoundary (Enhanced: `components/dashboard/DataStates.tsx`)

Inline error display within the affected component area. Shows error message + retry button. Does not break surrounding layout.

### 5. Visual Hierarchy for Charts

Each chart type communicates a specific thesis point:

| Chart | Thesis Point | Visual Priority | Key Design Choice |
|-------|-------------|-----------------|-------------------|
| DeltaBarChart (master comparison) | Skill×stake beats baselines | Highest — first thing on Results | Bars sorted by Δ, mechanism highlighted with thicker stroke |
| Cumulative CRPS lines | Accuracy gap grows over time | High — shows the "when" | Mechanism line 2.5px, others 1.2px, 0.6 opacity |
| Calibration scatter | Forecasts are well-calibrated | Medium — supports the claim | Diagonal reference line, points coloured by distance from ideal |
| Ablation waterfall | Which pipeline step matters | Medium — explains "why" | Waterfall bars showing incremental contribution |
| Skill trajectory lines | Online layer recovers skill ordering | Medium — core thesis contribution | Agent lines with toggleable visibility, brush for time range |
| Sweep heatmap | Mechanism is not brittle | Lower — robustness evidence | λ × σ_min grid, colour intensity = metric value |
| Behaviour bars | Adversaries don't break the mechanism | Lower — robustness evidence | Horizontal bars sorted by impact |
| Participation heatmap | Intermittency is handled | Lower — robustness evidence | Agent × time blocks, colour = participation rate |


## Data Models

### Existing Data Models (Unchanged)

The redesign does not modify any data types. All types in `lib/types.ts` remain as-is:

- `ExperimentMeta` — experiment metadata from `index.json`
- `MasterComparisonRow` — method comparison with paired deltas
- `BankrollAblationRow` — ablation variants with delta vs full
- `ForecastSeriesPoint` — per-round CRPS across weighting rules
- `CalibrationPoint` — reliability diagram data (τ, p̂)
- `SweepPoint` — parameter sweep grid (λ, σ_min, metrics)
- `SkillWagerPoint` — per-agent per-round skill/wager/profit
- Various behaviour row types (PreferenceStressRow, IntermittencyStressRow, ArbitrageScanRow, etc.)

### New UI State Models

#### Theme State

```typescript
type Theme = 'light' | 'dark';
// Stored in localStorage under key 'theme'
// Applied as class on <html> element
```

#### Formula Registry Entry

```typescript
interface FormulaRegistryEntry {
  id: string;
  latex: string;
  sourcePdf: string;
  page: number;
  section: string;
  label: string;
  description?: string;
}
```

#### Key Finding

```typescript
interface KeyFinding {
  id: string;
  title: string;
  verdict: 'confirmed' | 'partial' | 'refuted';
  interpretation: string;
  soWhat: string;
  evidenceStrength: 'strong' | 'moderate' | 'weak';
  supportingExperiments: number;
  evidenceRoute: string;
  deepDive?: DeepDiveContent;
}
```

#### Deep Dive Content

```typescript
interface DeepDiveContent {
  methodology: string;
  extendedChart?: React.ReactNode;
  caveats: string[];
  crossRefs?: CrossReference[];
}
```

#### Cross Reference

```typescript
interface CrossReference {
  label: string;
  route: string;
  tab?: string;
  anchor?: string;
}
```

#### Sidebar Responsive State

```typescript
interface SidebarState {
  mode: 'full' | 'icon-only' | 'hidden';  // derived from viewport width
  drawerOpen: boolean;  // mobile drawer state
  hoverExpanded: boolean;  // icon-only mode hover expansion
}
```

#### Chart Interaction State

The existing `useChartZoom` hook provides zoom state. Series visibility is managed per-chart via local `useState<Set<string>>` (already implemented in `SkillTrajectoryChart`, to be standardised).

```typescript
// Already exists in useChartZoom.ts
interface ZoomState {
  left: string | number;
  right: string | number;
  refLeft: string;
  refRight: string;
  isZoomed: boolean;
}

// Per-chart series visibility (local state)
type HiddenSeries = Set<string>;
```

#### Experiment Card Grid State

```typescript
interface ExperimentGridState {
  blockFilter: 'all' | 'core' | 'behaviour' | 'experiments';
  searchQuery: string;
}
```

#### Formula Registry State

```typescript
interface FormulaRegistryState {
  entries: FormulaRegistryEntry[];
  loading: boolean;
  error: string | null;
}
```

#### Narrative State

```typescript
interface NarrativeState {
  /** Current story act index */
  currentAct: number;
  /** Deep-dive panels that are currently expanded */
  expandedDeepDives: Set<string>;
}
```

#### Key Findings State

```typescript
interface KeyFindingsState {
  findings: KeyFinding[];
  /** Which finding's deep-dive is expanded */
  expandedFindingId: string | null;
}
```

### Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Page
    participant Adapter
    participant Store
    participant Chart

    User->>Page: Navigate to /results
    Page->>Adapter: loadMasterComparison()
    Adapter->>Store: setMasterRows(rows)
    Store->>Page: masterRows (via hook)
    Page->>Chart: <DeltaBarChart data={sorted} />
    User->>Chart: Drag to zoom
    Chart->>Chart: useChartZoom updates XAxis domain
    User->>Chart: Click legend item
    Chart->>Chart: toggleSeries updates hiddenSeries set
```

### CSS Custom Properties for Theming

```css
:root {
  --bg-primary: #ffffff;
  --bg-card: #ffffff;
  --bg-muted: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border: #e2e8f0;
  --chart-grid: #e2e8f0;
  --chart-axis: #94a3b8;
}

.dark {
  --bg-primary: #0f172a;
  --bg-card: #1e293b;
  --bg-muted: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border: #334155;
  --chart-grid: #334155;
  --chart-axis: #64748b;
}
```

Chart components reference these variables via the `shared.ts` constants, which are updated to read from CSS custom properties when dark mode is active.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Sidebar renders icons, labels, and active styling for every route

*For any* route in the navigation configuration, the rendered Sidebar should contain both an SVG icon element and a text label for that route, and the NavLink corresponding to the currently active route should have the highlighted background class and accent indicator applied.

**Validates: Requirements 1.1, 1.2**

### Property 2: Sidebar responsive mode matches viewport width

*For any* viewport width, the Sidebar should render in the correct mode: full (≥1024px), icon-only (768–1023px), or hidden with hamburger (<768px). The layout mode should be a deterministic function of viewport width.

**Validates: Requirements 1.6, 7.1, 7.2, 7.3**

### Property 3: Breadcrumb segments match route path including active tab

*For any* route (including tabbed pages with an active tab), the Breadcrumb component should render clickable segments that correspond to each part of the route path, with the active tab name appended as the final segment on tabbed pages.

**Validates: Requirements 2.1, 2.3**

### Property 4: Breadcrumb click navigates to correct route

*For any* Breadcrumb segment, clicking it should trigger navigation to the route corresponding to that segment's path.

**Validates: Requirements 2.2**

### Property 5: Chart zoom round-trip

*For any* chart with zoom enabled, performing a drag-zoom (mouseDown at point A, mouseMove to point B, mouseUp) and then clicking the "Reset zoom" button should restore the XAxis domain to its original `['dataMin', 'dataMax']` value. This is a round-trip property: zoom → reset = identity.

**Validates: Requirements 3.1, 3.2**

### Property 6: Tooltip shows values for exactly the visible series

*For any* data point on a multi-series chart and *for any* subset of visible series (after toggling), the Tooltip should display numeric values for exactly the series that are currently visible — no more, no less.

**Validates: Requirements 3.3, 3.4**

### Property 7: Method colour tokens are semantically consistent

*For any* weighting method key (uniform, deposit, skill, mechanism), the colour assigned in `tokens.ts` and `formatters.ts` should be identical, and each method should have a unique colour distinct from all other methods.

**Validates: Requirements 4.1**

### Property 8: Text/background colour pairs meet WCAG contrast ratio

*For any* text/background colour pair defined in the theme (both light and dark modes), the computed contrast ratio should be at least 4.5:1 for normal text.

**Validates: Requirements 4.5**

### Property 9: MetricCard accent bar conditional rendering

*For any* MetricCard component, when the `accent` prop is `true`, the rendered output should contain a left-edge accent bar element; when `accent` is `false` or absent, no accent bar should be rendered.

**Validates: Requirements 4.4**

### Property 10: Answer cards contain all required fields

*For any* headline answer card rendered on the Results page, the card should contain all five required elements: a question title, a key metric value, a verdict indicator with colour coding, an interpretation sentence, and a caveat note.

**Validates: Requirements 5.1**

### Property 11: Method ranking is sorted by accuracy

*For any* set of method comparison results with ΔCRPS values, the displayed ranked list should be sorted in ascending order of ΔCRPS (most negative = best accuracy first). The sort order should be a stable function of the input data.

**Validates: Requirements 5.2**

### Property 12: Experiment cards contain all required fields

*For any* experiment in the experiment list, the rendered Experiment_Card should contain: the experiment name, a description (truncated to 2 lines), a block category badge, and up to 3 key metric values.

**Validates: Requirements 6.1**

### Property 13: Experiment grid filtering returns only matching experiments

*For any* combination of block filter and search query, the displayed Experiment_Cards should be exactly the subset of experiments whose block matches the filter (or all if filter is 'all') AND whose name or description contains the search query (case-insensitive).

**Validates: Requirements 6.3, 6.5**

### Property 14: Chart ResponsiveContainer maintains minimum height

*For any* chart component, the ResponsiveContainer should specify a minimum height of at least 250px, ensuring charts remain readable at any parent width.

**Validates: Requirements 7.4**

### Property 15: Mechanism stepper click activates the correct step

*For any* step in the walkthrough stepper (Inputs, DGP, Behaviour, Core, Results, Next State), clicking that step's indicator should set it as the active step, and the active step should be visually highlighted with the primary accent colour.

**Validates: Requirements 8.2**

### Property 16: Dark mode applies correct theme tokens

*For any* theme state (light or dark), toggling to that state should apply the corresponding CSS class on the document element and update all CSS custom properties (background, text, border, chart grid, chart axis colours) to match the expected theme values.

**Validates: Requirements 9.2, 9.3**

### Property 17: Theme persistence round-trip

*For any* theme choice (light or dark), setting the theme should persist it to localStorage, and on a subsequent page load, reading from localStorage should restore the same theme. This is a round-trip: `setTheme(t) → localStorage.setItem → localStorage.getItem → getTheme() === t`.

**Validates: Requirements 9.4**

### Property 18: Theme defaults to OS preference on first visit

*For any* OS colour scheme preference (light or dark), when no theme is stored in localStorage, the dashboard should default to the OS preference as reported by `prefers-color-scheme`.

**Validates: Requirements 9.5**

### Property 19: Data loading error isolation

*For any* page with multiple data-dependent components, if one component's data fetch fails, the error should be displayed inline within that component's area, and all other components on the page should continue to render normally.

**Validates: Requirements 10.3**

### Property 20: Narrative sequence with forward/backward navigation

*For any* page in the story acts sequence, the page should render a NarrativeNav component containing a link to the previous act (if not the first) and a link to the next act (if not the last), and clicking either link should navigate to the correct route.

**Validates: Requirements 11.1, 11.3**

### Property 21: Finding cards contain all required fields including soWhat

*For any* KeyFinding object, the rendered FindingCard should contain: a title, a traffic-light verdict border, an interpretation sentence, a "so what" connection to the research question, and an evidence strength indicator. No field may be empty or missing.

**Validates: Requirements 11.2, 14.1**

### Property 22: Finding verdict and evidence strength visual indicators

*For any* verdict value (confirmed, partial, refuted), the FindingCard should render the correct traffic-light border colour (green, amber, red respectively). *For any* evidence strength value (strong, moderate, weak), the card should render the corresponding indicator (3, 2, or 1 filled circles respectively).

**Validates: Requirements 14.2, 14.3**

### Property 23: Formula registry entries have all required fields

*For any* entry in the formula registry JSON, the entry should contain all required fields: id (non-empty string), latex (non-empty string), sourcePdf (matching one of the known thesis PDFs), page (positive integer), section (non-empty string), and label (non-empty string).

**Validates: Requirements 12.2**

### Property 24: Formula source citation rendering

*For any* FormulaCard or MathBlock with a `source` prop provided, the rendered output should contain a citation line displaying the PDF filename, section reference, and page number. When no `source` prop is provided, no citation line should appear.

**Validates: Requirements 12.1**

### Property 25: Formula registry cross-check warning

*For any* LaTeX string rendered in a FormulaCard, if the LaTeX does not match any entry in the formula registry (after whitespace normalisation), the component should display an "unverified" warning indicator. If it does match, no warning should appear.

**Validates: Requirements 12.3**

### Property 26: No filler text in rendered content

*For any* user-visible text string rendered in the dashboard, the text should not match any pattern in the FILLER_PATTERNS list (lorem ipsum, TODO, placeholder, TBD, coming soon). The `validateCopy` function should return `valid: true` for all rendered text.

**Validates: Requirements 13.1**

### Property 27: Deep-dive toggle expands panel with methodology note

*For any* component with a deep-dive toggle, clicking the toggle should transition the panel from collapsed to expanded (or vice versa), and the expanded panel should contain a MethodologyNote element with non-empty setup text.

**Validates: Requirements 15.1, 15.4**

### Property 28: Term tooltip shows glossary definition on hover

*For any* technical term wrapped in a TermTooltip component, hovering over the term should display a tooltip containing the term's definition as found in GLOSSARY_ENTRIES. The definition text in the tooltip should exactly match the glossary entry.

**Validates: Requirements 15.2**

### Property 29: Cross-reference links navigate to correct section

*For any* CrossReference component with a given route and optional tab/anchor, clicking the link should trigger navigation to the specified route. If a tab is specified, it should be included as a URL parameter.

**Validates: Requirements 15.3**


### 6. Narrative Flow Components (Requirements 11, 14)

#### Story Structure

The dashboard narrative is extended from four acts to five, adding a concluding "So what?" act:

| Act | Route | Question | Key Content |
|-----|-------|----------|-------------|
| 1. Understand | `/` Overview | What is this mechanism? | System architecture, round timeline, key findings |
| 2. Does it work? | `/results` | Does skill×stake beat baselines? | Master comparison, cumulative CRPS, calibration |
| 3. How? | `/mechanism` | How does one round work? | Interactive pipeline, skill/wealth/error timelines |
| 4. When does it break? | `/robustness` | Where are the limits? | Intermittency, sybil, sensitivity, behaviour |
| 5. So what? | `/results#findings` | What does this mean for the thesis? | Key findings with verdicts, evidence strength, cross-refs |

Each page includes forward/backward navigation links at the bottom connecting to the adjacent story acts, creating a guided reading path through the thesis narrative.

#### NarrativeNav (New: `components/dashboard/NarrativeNav.tsx`)

Bottom-of-page navigation linking to previous and next story acts.

```typescript
interface NarrativeNavProps {
  /** Current act index (0-based) in the STORY_ACTS array */
  currentAct: number;
}

const STORY_ACTS = [
  { route: '/',            label: 'Understand',         question: 'What is this mechanism?' },
  { route: '/results',     label: 'Does it work?',      question: 'Does skill×stake beat baselines?' },
  { route: '/mechanism',   label: 'How?',               question: 'How does one round work?' },
  { route: '/robustness',  label: 'When does it break?', question: 'Where are the limits?' },
  { route: '/results#findings', label: 'So what?',      question: 'What does this mean?' },
] as const;
```

Renders a two-column layout: "← Previous: {label}" on the left, "Next: {label} →" on the right. Uses React Router `<Link>` for navigation.

#### KeyFindingsSection (Enhanced: on Overview page)

The existing `FINDINGS` array on `HomePage.tsx` is extended to a richer data structure:

```typescript
interface KeyFinding {
  id: string;
  title: string;
  /** Traffic-light verdict */
  verdict: 'confirmed' | 'partial' | 'refuted';
  /** One-sentence interpretation */
  interpretation: string;
  /** Connection back to the research question */
  soWhat: string;
  /** Evidence strength: 'strong' | 'moderate' | 'weak' */
  evidenceStrength: 'strong' | 'moderate' | 'weak';
  /** Number of supporting experiments */
  supportingExperiments: number;
  /** Route to the detailed evidence */
  evidenceRoute: string;
  /** Optional deep-dive content */
  deepDive?: DeepDiveContent;
}
```

Visual design:
- Traffic-light left border: green (`emerald-500`) for confirmed, amber (`amber-400`) for partial, red (`red-400`) for refuted
- Evidence strength shown as 1–3 filled circles (●●○ for moderate)
- "So what?" line rendered in slightly bolder text below the interpretation
- Max 5 findings displayed

#### FindingCard (New: `components/dashboard/FindingCard.tsx`)

```typescript
interface FindingCardProps {
  finding: KeyFinding;
}
```

Renders: title, verdict colour border, metric value, interpretation, soWhat line, evidence strength indicator, and optional deep-dive toggle.

### 7. Formula Registry and Source Citations (Requirement 12)

#### Formula Registry Data Model

A new static JSON file at `public/data/formula_registry.json` maps every formula used in the dashboard to its thesis source:

```typescript
interface FormulaRegistryEntry {
  /** Unique formula ID, e.g. "effective_wager" */
  id: string;
  /** LaTeX representation */
  latex: string;
  /** Source PDF filename from repo root */
  sourcePdf: string;
  /** Page number in the PDF */
  page: number;
  /** Section reference, e.g. "§3.2" */
  section: string;
  /** Human-readable label */
  label: string;
  /** Optional brief description */
  description?: string;
}
```

Example entries:

```json
[
  {
    "id": "effective_wager",
    "latex": "m_i = b_i \\cdot g(\\sigma_i), \\quad g(\\sigma) = \\lambda + (1-\\lambda)\\sigma^\\eta",
    "sourcePdf": "MASTERS copy.pdf",
    "page": 34,
    "section": "§3.2",
    "label": "Effective wager",
    "description": "Deposit filtered through the skill gate function"
  },
  {
    "id": "ewma_skill",
    "latex": "L_{i,t} = (1-\\rho)L_{i,t-1} + \\rho\\,\\ell_{i,t}",
    "sourcePdf": "MASTERS copy.pdf",
    "page": 37,
    "section": "§3.3",
    "label": "EWMA skill update"
  },
  {
    "id": "payoff",
    "latex": "\\Pi_i = m_i\\left(1 + s(r_i, \\omega) - \\frac{\\sum_j m_j\\, s(r_j, \\omega)}{\\sum_j m_j}\\right)",
    "sourcePdf": "Pierre_wagering copy.pdf",
    "page": 12,
    "section": "§2.1",
    "label": "Weighted-score payoff"
  }
]
```

The thesis PDFs in the repo root are: `ESG (6) copy.pdf`, `MASTERS copy.pdf`, `Masters_notes (2) copy.pdf`, `NotesMasters copy.pdf`, `Pierre_wagering copy.pdf`, `arbitrage copy.pdf`.

#### FormulaCard Enhancement

The existing `FormulaCard` component gains an optional `source` prop:

```typescript
interface FormulaCardProps {
  title: string;
  latex?: string;
  formula?: string;
  caption: string;
  /** Source citation from formula registry */
  source?: {
    pdf: string;
    page: number;
    section: string;
  };
  /** If true, show a warning that formula is not in registry */
  unverified?: boolean;
}
```

When `source` is provided, a small citation line renders below the caption:
```
📄 MASTERS copy.pdf, §3.2, p. 34
```

When `unverified` is true, a subtle amber warning badge appears: `⚠ Not in formula registry`.

#### MathBlock Enhancement

The existing `MathBlock` component gains an optional `source` prop with the same structure. When provided, a small superscript citation indicator appears that shows the source on hover.

#### useFormulaRegistry Hook (New: `hooks/useFormulaRegistry.ts`)

```typescript
function useFormulaRegistry(): {
  registry: FormulaRegistryEntry[];
  lookup: (latex: string) => FormulaRegistryEntry | undefined;
  lookupById: (id: string) => FormulaRegistryEntry | undefined;
  loading: boolean;
}
```

Fetches `formula_registry.json` once and caches it. The `lookup` function normalises whitespace before comparing LaTeX strings.

### 8. Copy Quality Guidelines (Requirement 13)

#### Text Patterns and Anti-Patterns

All user-visible text in the dashboard must follow these rules:

1. **No filler text**: No "Lorem ipsum", "TODO", "placeholder", "TBD", "coming soon", or empty strings in any rendered text element
2. **Precise chart subtitles**: Every `ChartCard` subtitle must describe what the chart shows and how to read it, referencing specific metrics or axes. Example: "Cumulative CRPS over 300 rounds. Lower = better. Mechanism (indigo) vs equal weights (grey)." Anti-example: "Chart showing results."
3. **Author-year citations**: All literature references use "Author Year" format (e.g., "Lambert 2008", "Chen et al. 2014", "Vitali & Pinson 2024"). No "see paper" or "as described in the literature."

These are enforced via:
- A `FILLER_PATTERNS` constant in `lib/copyGuard.ts` containing regex patterns for known filler text
- A `validateCopy(text: string): { valid: boolean; violations: string[] }` utility function
- Unit tests that scan all rendered text for filler patterns

```typescript
// lib/copyGuard.ts
export const FILLER_PATTERNS = [
  /lorem\s+ipsum/i,
  /\bTODO\b/,
  /\bplaceholder\b/i,
  /\bTBD\b/,
  /\bcoming\s+soon\b/i,
  /\bfoo\b/i,
  /\bbar\b/i,
  /\bbaz\b/i,
];

export function validateCopy(text: string): { valid: boolean; violations: string[] } {
  const violations = FILLER_PATTERNS
    .filter(p => p.test(text))
    .map(p => p.source);
  return { valid: violations.length === 0, violations };
}
```

### 9. Interactive Narrative Elements (Requirement 15)

#### DeepDive (New: `components/dashboard/DeepDive.tsx`)

An expandable inline panel that reveals additional methodology details, extended charts, and caveats.

```typescript
interface DeepDiveContent {
  /** Methodology note: experimental setup, controls, limitations */
  methodology: string;
  /** Optional extended chart (ReactNode) */
  extendedChart?: React.ReactNode;
  /** Caveats and limitations */
  caveats: string[];
  /** Cross-references to other sections */
  crossRefs?: CrossReference[];
}

interface DeepDiveProps {
  content: DeepDiveContent;
  /** Label for the toggle button */
  label?: string;
}
```

Visual: A "Deep dive ▾" button that expands a bordered panel below the parent card. Uses Framer Motion `AnimatePresence` with height animation (200ms). The panel contains:
1. A "Methodology" callout box (slate-50 background, left border accent)
2. Optional extended chart
3. Caveats as a bulleted list
4. Cross-reference links

#### TermTooltip (New: `components/dashboard/TermTooltip.tsx`)

Inline tooltip that appears on hover over technical terms, showing the glossary definition.

```typescript
interface TermTooltipProps {
  /** The technical term to display */
  term: string;
  /** Override definition (defaults to GLOSSARY_ENTRIES lookup) */
  definition?: string;
  children: React.ReactNode;
}
```

Implementation:
- Wraps the term text in a `<span>` with a dotted underline (`border-b border-dotted border-slate-400`)
- On hover, shows a small tooltip (positioned above) with the definition from `GLOSSARY_ENTRIES` in `tokens.ts`
- Uses `onMouseEnter`/`onMouseLeave` with a 150ms delay to avoid flicker
- Falls back to the existing `StickyGlossary` if the term is not found

The existing `GLOSSARY_ENTRIES` in `tokens.ts` already contains definitions for CRPS, Gini, N_eff, and key symbols. New terms are added as needed.

#### CrossReference (New: `components/dashboard/CrossReference.tsx`)

A clickable inline link that navigates to another section or experiment.

```typescript
interface CrossReference {
  /** Display label */
  label: string;
  /** Target route */
  route: string;
  /** Optional target tab on the destination page */
  tab?: string;
  /** Optional anchor within the page */
  anchor?: string;
}

interface CrossReferenceProps extends CrossReference {}
```

Visual: Rendered as an inline link with a small arrow icon (→), styled in teal-600 with hover underline. Uses React Router `<Link>` for SPA navigation. If `tab` is provided, it's passed as a URL search parameter.

#### MethodologyNote (New: `components/dashboard/MethodologyNote.tsx`)

A styled callout box for methodology details within deep-dive panels.

```typescript
interface MethodologyNoteProps {
  /** Setup description */
  setup: string;
  /** Controls used */
  controls?: string[];
  /** Known limitations */
  limitations?: string[];
}
```

Visual: Rounded card with slate-50 background, indigo-500 left border (3px), small "Methodology" header in uppercase tracking. Compact text layout.

## Error Handling

### Data Loading Errors

The dashboard loads experiment data from static files in `public/data/`. Errors can occur when:

1. **File not found (404)**: An experiment listed in `index.json` has missing data files. The existing `fetchCSV`/`fetchJSON` in `adapters.ts` already throw on non-200 responses.
2. **Parse errors**: Malformed CSV or JSON. PapaParse handles CSV gracefully (returns partial data); JSON parse errors throw.
3. **Missing experiment data**: No `index.json` or empty experiment list.

**Strategy:**

- **Component-level error boundaries**: Each data-dependent section (chart, card, panel) catches its own errors and renders an inline error message with a retry button. This prevents one broken experiment from taking down the whole page.
- **Fallback to demo mode**: The Results page already falls back to in-browser pipeline demo when experiment data is unavailable. This pattern is extended to Robustness page.
- **Skeleton → Error transition**: While loading, show skeleton placeholders. On error, replace skeleton with error message. On success, replace skeleton with content.
- **No silent failures**: Every fetch error is logged to console in dev mode (existing behaviour) and shown to the user as an inline message.

### Theme Errors

- **localStorage unavailable**: If localStorage is blocked (e.g., private browsing in some browsers), the theme provider catches the error and falls back to OS preference without persisting.
- **Invalid stored value**: If localStorage contains an invalid theme value, default to OS preference.

### Chart Interaction Errors

- **Empty data**: Charts handle empty arrays gracefully by showing an empty state message instead of rendering an empty chart.
- **NaN/Infinity values**: The existing `fmt()` and `fmtNum()` formatters already handle NaN/null. Chart data is filtered to exclude non-finite values before rendering.
- **Zoom to zero-width range**: The `useChartZoom` hook already handles the case where `refLeft === refRight` by not applying the zoom.

### Navigation Errors

- **Unknown routes**: The existing catch-all `<Route path="*" element={<Navigate to="/" replace />} />` handles unknown routes.
- **Breadcrumb on unknown paths**: The Breadcrumb component gracefully handles paths not in the route config by showing only the segments it can resolve.

### Formula Registry Errors

- **Registry file not found**: If `formula_registry.json` fails to load, the `useFormulaRegistry` hook returns an empty registry. FormulaCard and MathBlock render normally without source citations — no crash, no warning.
- **Malformed registry entries**: Entries missing required fields are skipped during parsing. A console warning is logged in dev mode.
- **LaTeX mismatch**: When a formula's LaTeX doesn't match any registry entry, the `unverified` warning is shown as a subtle amber indicator — informational, not blocking.

### Narrative and Deep-Dive Errors

- **Missing deep-dive content**: If a FindingCard has no `deepDive` content, the "Deep dive" toggle button is not rendered. No error state needed.
- **Broken cross-references**: If a CrossReference targets a route that doesn't exist, React Router's catch-all redirect handles it gracefully. The link still renders but navigates to `/`.
- **Missing glossary term**: If a TermTooltip references a term not in `GLOSSARY_ENTRIES`, the tooltip shows the `definition` prop if provided, or falls back to "No definition available."

## Testing Strategy

### Dual Testing Approach

The testing strategy uses both unit tests and property-based tests:

- **Unit tests** (Vitest + React Testing Library): Specific examples, edge cases, error conditions, and integration points
- **Property-based tests** (fast-check): Universal properties across generated inputs, minimum 100 iterations per property

### Property-Based Testing Configuration

- **Library**: [fast-check](https://github.com/dubzzz/fast-check) — the standard PBT library for TypeScript/JavaScript
- **Minimum iterations**: 100 per property test
- **Tag format**: Each property test includes a comment referencing the design property:
  ```typescript
  // Feature: dashboard-ui-redesign, Property 5: Chart zoom round-trip
  ```
- **Each correctness property is implemented by a single property-based test**

### Test Plan

#### Property-Based Tests

| Property | Test Description | Generator Strategy |
|----------|-----------------|-------------------|
| P1: Sidebar icons/labels/active | Generate random route from ROUTES array, render Sidebar, check icon + label + active class | `fc.constantFrom(...ROUTES)` |
| P2: Sidebar responsive mode | Generate random viewport width (300–2000px), check sidebar mode | `fc.integer({min: 300, max: 2000})` |
| P3: Breadcrumb segments | Generate random route path + optional tab name, check segments | `fc.constantFrom(...ALL_ROUTES)` × `fc.option(fc.constantFrom(...TABS))` |
| P4: Breadcrumb navigation | Generate random breadcrumb segment, simulate click, check navigation | `fc.constantFrom(...BREADCRUMB_SEGMENTS)` |
| P5: Zoom round-trip | Generate random start/end points for drag, zoom in, reset, check domain restored | `fc.tuple(fc.integer({min: 1, max: 500}), fc.integer({min: 1, max: 500}))` |
| P6: Tooltip visible series | Generate random subset of series to hide, hover a point, check tooltip content | `fc.subarray(ALL_SERIES)` |
| P7: Method colour consistency | Generate random method key, check colour matches across tokens.ts and formatters.ts | `fc.constantFrom(...METHOD_KEYS)` |
| P8: Contrast ratio | Generate all theme colour pairs, compute contrast ratio, check ≥ 4.5 | Enumerate all pairs from theme config |
| P9: MetricCard accent | Generate random accent boolean, render MetricCard, check accent bar presence | `fc.boolean()` |
| P10: Answer card fields | Generate random answer card data, render, check all 5 fields present | `fc.record({question: fc.string(), metric: fc.string(), ...})` |
| P11: Method ranking sort | Generate random array of method results with ΔCRPS values, check sort order | `fc.array(fc.record({method: fc.string(), deltaCrps: fc.float()}))` |
| P12: Experiment card fields | Generate random ExperimentMeta, render card, check required fields | Custom ExperimentMeta arbitrary |
| P13: Experiment filtering | Generate random experiment list + filter + query, check filtered results | `fc.array(experimentMetaArb)` × `fc.constantFrom('all','core','behaviour','experiments')` × `fc.string()` |
| P14: Chart min height | Enumerate all chart components, check ResponsiveContainer minHeight ≥ 250 | Enumerate chart component list |
| P15: Stepper click | Generate random step from WALKTHROUGH_STEPS, simulate click, check active state | `fc.constantFrom(...WALKTHROUGH_STEPS)` |
| P16: Dark mode tokens | Generate random theme state, toggle, check CSS class and custom properties | `fc.constantFrom('light', 'dark')` |
| P17: Theme persistence | Generate random theme, set it, read from localStorage, check match | `fc.constantFrom('light', 'dark')` |
| P18: Theme OS default | Generate random OS preference, clear localStorage, check theme matches | `fc.constantFrom('light', 'dark')` |
| P19: Error isolation | Generate random component to fail, simulate fetch error, check other components render | `fc.constantFrom(...COMPONENT_IDS)` |
| P20: Narrative nav links | Generate random story act index, render NarrativeNav, check prev/next links present and correct | `fc.integer({min: 0, max: STORY_ACTS.length - 1})` |
| P21: Finding card fields | Generate random KeyFinding data, render FindingCard, check all 6 fields present (title, verdict, interpretation, soWhat, evidenceStrength, metric) | Custom `keyFindingArb` with `fc.record(...)` |
| P22: Verdict/evidence indicators | Generate random verdict × evidence strength, render FindingCard, check border colour and filled circles count | `fc.constantFrom('confirmed','partial','refuted')` × `fc.constantFrom('strong','moderate','weak')` |
| P23: Formula registry fields | Generate random registry entry, validate all required fields present and non-empty | Custom `formulaRegistryEntryArb` |
| P24: Formula source citation | Generate random FormulaCard props with/without source, check citation line presence | `fc.option(sourceArb)` |
| P25: Formula registry cross-check | Generate random LaTeX string, check against mock registry, verify warning presence matches lookup result | `fc.string()` combined with mock registry |
| P26: No filler text | Generate random strings, run through `validateCopy`, verify filler patterns are detected | `fc.oneof(fc.string(), fc.constantFrom(...FILLER_STRINGS))` |
| P27: Deep-dive toggle | Generate random deep-dive content, simulate toggle click, check expanded state and methodology note | Custom `deepDiveContentArb` |
| P28: Term tooltip | Generate random glossary term from GLOSSARY_ENTRIES, simulate hover, check tooltip definition matches | `fc.constantFrom(...GLOSSARY_ENTRIES.map(e => e.symbol))` |
| P29: Cross-reference nav | Generate random CrossReference with route/tab/anchor, simulate click, check navigation target | Custom `crossRefArb` |

#### Unit Tests (Examples and Edge Cases)

| Test | Description | Validates |
|------|-------------|-----------|
| Sidebar groups have divider | Render Sidebar, check primary/secondary groups separated by divider | Req 1.3 |
| Sidebar header text | Render Sidebar, check "Skill × Stake" and subtitle present | Req 1.5 |
| ChartCard expand modal | Click expand button, check modal renders | Req 3.6 |
| Results tabs exist | Render ResultsPage, check all expected tabs present | Req 5.3 |
| Results error fallback | Simulate data load failure, check error message + retry + demo banner | Req 5.5 |
| Experiment card click navigates | Click an experiment card, check navigation to detail route | Req 6.2 |
| Mechanism stepper structure | Render stepper, check numbered indicators and connecting lines | Req 8.1 |
| Theme toggle button exists | Render Sidebar, check theme toggle button present | Req 9.1 |
| Skeleton loading state | Set loading=true, check skeleton elements rendered | Req 10.1 |
| Empty experiment state | Set experiments=[], check empty state message | Req 10.4 |
| Card grid columns at breakpoints | Render grid at 500px, 800px, 1200px, check column counts 1, 2, 3+ | Req 7.5 |
| NarrativeNav first act has no prev | Render NarrativeNav with currentAct=0, check no "Previous" link | Req 11.3 |
| NarrativeNav last act has no next | Render NarrativeNav with currentAct=4, check no "Next" link | Req 11.3 |
| Formula registry loads valid JSON | Fetch formula_registry.json, parse, check array of entries | Req 12.2 |
| FormulaCard unverified warning | Render FormulaCard with unverified=true, check amber warning badge | Req 12.3 |
| validateCopy rejects lorem ipsum | Call validateCopy("Lorem ipsum dolor"), check valid=false | Req 13.1 |
| validateCopy accepts clean text | Call validateCopy("Cumulative CRPS over 300 rounds"), check valid=true | Req 13.1 |
| Chart subtitles are non-empty | Render each page, check all ChartCard subtitles are non-empty strings | Req 13.2 |
| Literature refs use author-year | Scan rendered text for citation patterns, verify "Author Year" format | Req 13.3 |
| FindingCard max 5 findings | Render KeyFindingsSection with 7 findings, check only 5 rendered | Req 14.1 |
| DeepDive collapsed by default | Render DeepDive, check panel is not visible initially | Req 15.1 |
| TermTooltip fallback for unknown term | Render TermTooltip with unknown term, check "No definition available" | Req 15.2 |
| CrossReference with tab param | Render CrossReference with tab="Accuracy", check link includes tab param | Req 15.3 |
| MethodologyNote renders setup | Render MethodologyNote with setup text, check text is present | Req 15.4 |

