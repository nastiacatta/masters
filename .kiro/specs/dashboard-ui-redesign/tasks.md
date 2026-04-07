# Implementation Plan: Dashboard UI Redesign

## Overview

Minimal, academic, interactive redesign of the thesis dashboard. Focus on chart interactivity, clear results presentation, and clean navigation. No dark mode, no excessive responsive complexity, no flashy animations.

Priority: charts → new chart components → results page → sidebar → experiment grid → breadcrumbs → loading states → mechanism visuals.

## Tasks

- [ ] 1. Enhance existing charts with zoom, tooltips, and series toggles
  - [ ] 1.1 Extract shared ZoomBadge component from MechanismPage/RobustnessPage into `components/charts/ZoomBadge.tsx`
    - Currently duplicated in MechanismPage.tsx and RobustnessPage.tsx
    - Create a single shared component and update imports in both pages
    - _Requirements: 3.2_

  - [ ] 1.2 Add drag-to-zoom (`useChartZoom`) to ForecastQualityChart
    - Import `useChartZoom` hook, add `onMouseDown/onMouseMove/onMouseUp` handlers
    - Add `ReferenceArea` overlay for drag selection
    - Set XAxis `domain` from zoom state
    - Add ZoomBadge for reset
    - _Requirements: 3.1, 3.2_

  - [ ] 1.3 Add drag-to-zoom to CalibrationChart
    - Apply `useChartZoom` to the ScatterChart XAxis
    - Add ZoomBadge reset button
    - _Requirements: 3.1, 3.2_

  - [ ] 1.4 Add drag-to-zoom to BehaviourComparisonChart
    - Apply `useChartZoom` to the BarChart XAxis
    - Add ZoomBadge reset button
    - _Requirements: 3.1, 3.2_

  - [ ] 1.5 Add drag-to-zoom to SweepHeatmap (optional: zoom on λ axis)
    - If feasible with table-based heatmap, add row/column range selection
    - Otherwise, add a note that heatmap zoom is not applicable
    - _Requirements: 3.1_

  - [ ] 1.6 Standardise clickable legend toggles across all multi-series charts
    - SkillTrajectoryChart already has `hiddenAgents` toggle via Legend onClick — use same pattern
    - Add series toggle to ForecastQualityChart (toggle individual CRPS lines)
    - Add series toggle to BehaviourComparisonChart (toggle scenarios)
    - Each chart: maintain `hiddenSeries: Set<string>` local state, set `hide` prop on Line/Bar
    - _Requirements: 3.4_

  - [ ] 1.7 Add `isAnimationActive` with 300ms duration to all chart components
    - Set `isAnimationActive={true}` and `animationDuration={300}` on Line, Bar, Area, Scatter elements
    - _Requirements: 3.5_

  - [ ] 1.8 Add `help` prop (InfoToggle) to all ChartCard instances that lack it
    - ForecastQualityChart, CalibrationChart, BehaviourComparisonChart, SweepHeatmap, ParticipationHeatmap need `help` with term, definition, interpretation, axes
    - ChartCard already supports `help` prop — just pass it
    - _Requirements: 3.3_

  - [ ]* 1.9 Write property test for chart zoom round-trip (Property 5)
    - **Property 5: Chart zoom round-trip**
    - Generate random start/end drag points, verify zoom → reset restores original domain
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 1.10 Write property test for tooltip visible series (Property 6)
    - **Property 6: Tooltip shows values for exactly the visible series**
    - Generate random subset of series to hide, verify tooltip content matches
    - **Validates: Requirements 3.3, 3.4**

- [ ] 2. Checkpoint — Ensure chart enhancements compile and render
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Create new chart components (DeltaBarChart, ConcentrationPanel, FourPanelLayout)
  - [ ] 3.1 Create `components/charts/DeltaBarChart.tsx`
    - Horizontal BarChart with bars extending left/right from zero reference line
    - Props: `data: Array<{ label, delta, se?, color }>`, `baselineLabel?`, `metricLabel?`
    - Error bars rendered as thin lines when `se` is provided
    - Rank badges (#1, #2, …) on the left side
    - Wrap in ChartCard with help prop
    - _Requirements: 5.2, 3.1_

  - [ ] 3.2 Create `components/charts/ConcentrationPanel.tsx`
    - Grouped bar chart: Gini, HHI, N_eff side by side per method
    - Props: `data: Array<{ method, label, color, gini?, hhi?, nEff? }>`
    - Use Recharts grouped BarChart with three Bar elements
    - Wrap in ChartCard
    - _Requirements: 5.3_

  - [ ] 3.3 Create `components/charts/FourPanelLayout.tsx`
    - 2×2 CSS grid layout (`grid-cols-2` on lg, stacked on smaller)
    - Props: `primary`, `calibration`, `structure`, `failure` (ReactNode), `title`, `thesisPoint`
    - Each panel slot renders its child inside a labelled container
    - _Requirements: 5.1, 5.3_

  - [ ]* 3.4 Write property test for method ranking sort order (Property 11)
    - **Property 11: Method ranking is sorted by accuracy**
    - Generate random array of method results with ΔCRPS values, verify DeltaBarChart data is sorted ascending
    - **Validates: Requirements 5.2**

  - [ ]* 3.5 Write unit tests for DeltaBarChart and ConcentrationPanel
    - Test that DeltaBarChart renders correct number of bars
    - Test that ConcentrationPanel renders grouped bars for each method
    - Test error bar rendering when `se` is provided vs absent
    - _Requirements: 5.2_

- [ ] 4. Improve Results page with headline cards, ranked methods, and evidence tabs
  - [ ] 4.1 Refactor ResultsPage accuracy section to use DeltaBarChart
    - Replace the inline BarChart in the experiment-backed Accuracy tab with `<DeltaBarChart>`
    - Pass sorted `expAccuracyDisplay` data mapped to DeltaBarChart props
    - Keep the existing ranking-at-a-glance cards above the chart
    - _Requirements: 5.2_

  - [ ] 4.2 Refactor ResultsPage concentration section to use ConcentrationPanel
    - Replace the two separate Gini and HHI/N_eff bar charts with a single `<ConcentrationPanel>`
    - Map `methodAgg` data to ConcentrationPanel props
    - _Requirements: 5.3_

  - [ ] 4.3 Wrap master comparison results in FourPanelLayout
    - Primary panel: DeltaBarChart (accuracy ranking)
    - Calibration panel: existing calibration scatter
    - Structure panel: ConcentrationPanel
    - Failure panel: ablation waterfall chart (existing)
    - _Requirements: 5.1, 5.3_

  - [ ] 4.4 Add tab transition animation
    - Wrap tab content in Framer Motion `AnimatePresence` with `mode="wait"`
    - Horizontal slide animation (200ms) on tab switch
    - _Requirements: 5.4_

  - [ ]* 4.5 Write property test for answer card fields (Property 10)
    - **Property 10: Answer cards contain all required fields**
    - Generate random answer card data, render AnswerCard, verify all 5 fields present
    - **Validates: Requirements 5.1**

- [ ] 5. Checkpoint — Ensure results page renders correctly with new components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Improve Sidebar navigation with icons, active state, and grouping
  - [ ] 6.1 Add SVG icons to each Sidebar NavLink
    - Define inline SVG icons (16×16) for each route: Overview (home), Mechanism (cog/gear), Results (chart-bar), Robustness (shield), Appendix (book), Experiments (beaker)
    - Create a `NavItem` type with `{ to, label, icon, group }` and update ROUTES array
    - Render icon alongside label in each NavLink
    - _Requirements: 1.1_

  - [ ] 6.2 Improve active route styling
    - Active: teal-500 left border (3px), teal-50 background, teal-700 text
    - Hover: slate-800 background, 100ms transition
    - _Requirements: 1.2, 1.4_

  - [ ] 6.3 Group routes into primary and secondary with divider
    - Primary: Overview, Mechanism, Results, Robustness
    - Secondary: Appendix, Experiments
    - Render a subtle `border-t border-slate-700/50` divider between groups
    - _Requirements: 1.3_

  - [ ]* 6.4 Write property test for sidebar icons, labels, and active styling (Property 1)
    - **Property 1: Sidebar renders icons, labels, and active styling for every route**
    - For each route, verify icon SVG element, text label, and active class on current route
    - **Validates: Requirements 1.1, 1.2**

- [ ] 7. Create Experiment Card grid on ExperimentsPage
  - [ ] 7.1 Create `components/dashboard/ExperimentCard.tsx`
    - Props: `experiment: ExperimentMeta`
    - Render: name, description (2-line truncation via `line-clamp-2`), block badge (coloured pill), up to 3 key metrics from summary
    - Click navigates to experiment detail
    - _Requirements: 6.1, 6.2_

  - [ ] 7.2 Add filter controls and search to ExperimentsPage
    - Block filter buttons: All, Core, Behaviour, Experiments
    - Search input that filters by name or description (case-insensitive)
    - Store filter state in local `useState`
    - _Requirements: 6.3, 6.5_

  - [ ] 7.3 Render filtered ExperimentCards in responsive grid
    - Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
    - Use Framer Motion `layoutId` on cards for smooth re-layout on filter change
    - _Requirements: 6.4, 7.5_

  - [ ]* 7.4 Write property test for experiment grid filtering (Property 13)
    - **Property 13: Experiment grid filtering returns only matching experiments**
    - Generate random experiment list + filter + query, verify filtered results match
    - **Validates: Requirements 6.3, 6.5**

  - [ ]* 7.5 Write property test for experiment card fields (Property 12)
    - **Property 12: Experiment cards contain all required fields**
    - Generate random ExperimentMeta, render card, verify name, description, badge, metrics
    - **Validates: Requirements 6.1**

- [ ] 8. Add Breadcrumb navigation component
  - [ ] 8.1 Create `components/dashboard/Breadcrumb.tsx`
    - Uses `useLocation()` from React Router to derive path segments
    - Each segment is a clickable link to its route
    - Accepts optional `activeTab` prop to append tab name as final segment
    - Renders below page header, above content
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 8.2 Integrate Breadcrumb into ResultsPage and RobustnessPage
    - Pass `activeTab` prop from the current tab state
    - Place Breadcrumb at top of page content area
    - _Requirements: 2.1, 2.3_

  - [ ]* 8.3 Write property test for breadcrumb segments (Property 3)
    - **Property 3: Breadcrumb segments match route path including active tab**
    - Generate random route + optional tab, verify segments
    - **Validates: Requirements 2.1, 2.3**

  - [ ]* 8.4 Write property test for breadcrumb navigation (Property 4)
    - **Property 4: Breadcrumb click navigates to correct route**
    - Simulate click on breadcrumb segment, verify navigation
    - **Validates: Requirements 2.2**

- [ ] 9. Add loading skeleton and error states
  - [ ] 9.1 Create `components/dashboard/Skeleton.tsx`
    - Pulsing placeholder component with `animate-pulse` Tailwind class
    - Props: `width?`, `height?`, `className?`, `variant?: 'rect' | 'circle' | 'text'`
    - _Requirements: 10.1_

  - [ ] 9.2 Add skeleton loading states to ResultsPage
    - Show skeleton placeholders while `loading` is true (matching layout of answer cards, charts)
    - Fade-in transition (200ms) when data arrives
    - _Requirements: 10.1, 10.2_

  - [ ] 9.3 Enhance ErrorState in DataStates.tsx with retry button
    - Add `onRetry?: () => void` prop to ErrorState
    - Render retry button when `onRetry` is provided
    - Ensure error is displayed inline without breaking surrounding layout
    - _Requirements: 10.3_

  - [ ]* 9.4 Write property test for MetricCard accent rendering (Property 9)
    - **Property 9: MetricCard accent bar conditional rendering**
    - Generate random accent boolean, verify accent bar presence/absence
    - **Validates: Requirements 4.4**

- [ ] 10. Mechanism walkthrough visual improvements
  - [ ] 10.1 Add `help` InfoToggle to all MechanismPage chart sections that lack it
    - Ensure each chart (error, skill, wealth) has an InfoToggle with term, definition, interpretation, axes
    - Some already have it — verify and fill gaps
    - _Requirements: 3.3, 8.4_

  - [ ] 10.2 Add consistent entrance animations to StepSection content
    - Wrap StepSection children in Framer Motion `motion.div` with fade-in + 8px upward translate, 250ms
    - _Requirements: 4.3, 8.3_

  - [ ]* 10.3 Write property test for method colour consistency (Property 7)
    - **Property 7: Method colour tokens are semantically consistent**
    - For each method key, verify colour in `tokens.ts` matches `formatters.ts`
    - **Validates: Requirements 4.1**

- [ ] 11. Checkpoint — Ensure all original components compile and integrate
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement thesis narrative flow and NarrativeNav component
  - [ ] 12.1 Create `components/dashboard/NarrativeNav.tsx`
    - Define `STORY_ACTS` array with route, label, and question for each act (Understand, Does it work?, How?, When does it break?, So what?)
    - Props: `currentAct: number` (0-based index)
    - Render two-column layout: "← Previous: {label}" on left, "Next: {label} →" on right
    - Use React Router `<Link>` for navigation; hide prev on first act, hide next on last act
    - _Requirements: 11.1, 11.3_

  - [ ] 12.2 Add NarrativeNav to all main pages
    - Add `<NarrativeNav currentAct={N} />` at the bottom of HomePage (act 0), ResultsPage (act 1), MechanismPage (act 2), RobustnessPage/BehaviourPage (act 3), and Results#findings (act 4)
    - _Requirements: 11.1, 11.3_

  - [ ] 12.3 Add contextual thesis-question subtitles to each page header
    - Update PageHeader or page-level headers to include a subtitle stating the thesis question that page answers (e.g., "Does skill × stake beat baselines?" on Results)
    - Frame navigation links on Overview with thesis-relevant questions instead of generic labels
    - _Requirements: 11.2, 11.3_

  - [ ] 12.4 Add "What this means" summary section to each page
    - Add a bottom section on each page (before NarrativeNav) with 1–2 sentences stating the page's contribution to the thesis argument
    - Style as a subtle callout (slate-50 background, left border accent)
    - _Requirements: 11.7_

  - [ ]* 12.5 Write property test for narrative nav links (Property 20)
    - **Property 20: Narrative sequence with forward/backward navigation**
    - Generate random story act index, render NarrativeNav, verify prev/next links present and correct
    - **Validates: Requirements 11.1, 11.3**

- [ ] 13. Implement formula registry and source citations
  - [ ] 13.1 Create `public/data/formula_registry.json`
    - Populate with all formulas used in the dashboard: effective wager, EWMA skill update, payoff, scoring rule, aggregation, settlement
    - Each entry: `{ id, latex, sourcePdf, page, section, label, description? }`
    - Cross-reference against thesis PDFs (MASTERS copy.pdf, Pierre_wagering copy.pdf, etc.)
    - _Requirements: 12.1, 12.2, 12.6_

  - [ ] 13.2 Create `hooks/useFormulaRegistry.ts`
    - Fetch `formula_registry.json` once and cache in state
    - Export `{ registry, lookup, lookupById, loading }` — `lookup` normalises whitespace before comparing LaTeX strings
    - _Requirements: 12.6_

  - [ ] 13.3 Enhance FormulaCard with `source` and `unverified` props
    - Add optional `source: { pdf, page, section }` prop to FormulaCard
    - When `source` is provided, render a small citation line below caption: "📄 {pdf}, {section}, p. {page}"
    - When `unverified` is true, render an amber "⚠ Not in formula registry" badge
    - _Requirements: 12.2, 12.4, 12.5_

  - [ ] 13.4 Enhance MathBlock with optional `source` prop
    - Add optional `source` prop with same structure as FormulaCard
    - When provided, render a small superscript citation indicator that shows source on hover
    - _Requirements: 12.2, 12.4_

  - [ ] 13.5 Wire useFormulaRegistry into FormulaCard/MathBlock instances across pages
    - On MechanismPage, BehaviourPage, and ResultsPage, use `useFormulaRegistry` to look up each formula and pass `source` prop
    - Flag any formula not found in registry with `unverified={true}`
    - _Requirements: 12.3, 12.5_

  - [ ]* 13.6 Write property test for formula registry entry fields (Property 23)
    - **Property 23: Formula registry entries have all required fields**
    - Generate random registry entry, validate all required fields present and non-empty
    - **Validates: Requirements 12.2**

  - [ ]* 13.7 Write property test for formula source citation rendering (Property 24)
    - **Property 24: Formula source citation rendering**
    - Generate random FormulaCard props with/without source, check citation line presence
    - **Validates: Requirements 12.1**

  - [ ]* 13.8 Write property test for formula registry cross-check warning (Property 25)
    - **Property 25: Formula registry cross-check warning**
    - Generate random LaTeX string, check against mock registry, verify unverified warning presence matches lookup result
    - **Validates: Requirements 12.3**

- [ ] 14. Implement copy quality enforcement
  - [ ] 14.1 Create `lib/copyGuard.ts` with FILLER_PATTERNS and validateCopy utility
    - Define `FILLER_PATTERNS` regex array (lorem ipsum, TODO, placeholder, TBD, coming soon, foo, bar, baz)
    - Export `validateCopy(text: string): { valid: boolean; violations: string[] }`
    - _Requirements: 13.1, 13.6_

  - [ ] 14.2 Audit and improve all ChartCard subtitles across pages
    - Review every ChartCard instance on ResultsPage, BehaviourPage, MechanismPage, RobustnessPage
    - Replace any vague subtitles with precise descriptions referencing specific metrics, axes, and interpretation guidance
    - Ensure axis labels use precise variable names and units (e.g., "ΔCRPS vs equal weighting" not "Improvement")
    - _Requirements: 13.2, 13.4, 13.7_

  - [ ] 14.3 Audit and improve ExperimentCard descriptions and VerdictCard text
    - Ensure each ExperimentCard description states the specific question and metric in one sentence
    - Ensure each VerdictCard interpretation references actual metric values and thresholds
    - Replace vague qualifiers with quantified language throughout
    - _Requirements: 13.3, 13.5_

  - [ ]* 14.4 Write property test for no filler text (Property 26)
    - **Property 26: No filler text in rendered content**
    - Generate random strings including known filler patterns, run through validateCopy, verify detection
    - **Validates: Requirements 13.1**

- [ ] 15. Implement clear main findings presentation
  - [ ] 15.1 Create `components/dashboard/FindingCard.tsx`
    - Props: `finding: KeyFinding`
    - Render: title, traffic-light verdict border (green/amber/red for confirmed/partial/refuted), interpretation sentence, "so what" line in bolder text, evidence strength indicator (1–3 filled circles)
    - Optional deep-dive toggle button when `finding.deepDive` is present
    - _Requirements: 14.1, 14.5_

  - [ ] 15.2 Create KeyFindingsSection on Overview page
    - Extend existing `FINDINGS` array on HomePage to use `KeyFinding` interface with verdict, soWhat, evidenceStrength, supportingExperiments, evidenceRoute
    - Render up to 5 FindingCards as prominent cards visible above the fold
    - Distinguish between synthetic and real-data results with respective sample sizes
    - _Requirements: 14.1, 14.3, 14.4_

  - [ ] 15.3 Add "Bottom Line" summary to ResultsPage
    - Display a one-sentence thesis verdict at the top of ResultsPage, before any charts
    - Use colour-coded verdict indicators on headline answer cards (green/amber/red)
    - _Requirements: 14.2, 14.5_

  - [ ]* 15.4 Write property test for finding card fields including soWhat (Property 21)
    - **Property 21: Finding cards contain all required fields including soWhat**
    - Generate random KeyFinding data, render FindingCard, verify all 6 fields present
    - **Validates: Requirements 11.2, 14.1**

  - [ ]* 15.5 Write property test for verdict and evidence strength indicators (Property 22)
    - **Property 22: Finding verdict and evidence strength visual indicators**
    - Generate random verdict × evidence strength, render FindingCard, check border colour and filled circles count
    - **Validates: Requirements 14.2, 14.3**

- [ ] 16. Implement interactive narrative elements
  - [ ] 16.1 Create `components/dashboard/DeepDive.tsx`
    - Props: `content: DeepDiveContent`, `label?: string`
    - Render a "Deep dive ▾" toggle button that expands a bordered panel with Framer Motion height animation (200ms)
    - Expanded panel contains: MethodologyNote callout, optional extended chart, caveats as bulleted list, cross-reference links
    - _Requirements: 15.1_

  - [ ] 16.2 Create `components/dashboard/TermTooltip.tsx`
    - Props: `term: string`, `definition?: string`, `children: ReactNode`
    - Wrap term in `<span>` with dotted underline (`border-b border-dotted border-slate-400`)
    - On hover (150ms delay), show tooltip with definition from `GLOSSARY_ENTRIES` in `tokens.ts`
    - Fall back to "No definition available" if term not found and no override definition provided
    - _Requirements: 15.4_

  - [ ] 16.3 Create `components/dashboard/CrossReference.tsx`
    - Props: `label, route, tab?, anchor?`
    - Render as inline teal-600 link with arrow icon (→) and hover underline
    - Use React Router `<Link>` for SPA navigation; include `tab` as URL search parameter if provided
    - _Requirements: 15.3_

  - [ ] 16.4 Create `components/dashboard/MethodologyNote.tsx`
    - Props: `setup: string`, `controls?: string[]`, `limitations?: string[]`
    - Render as rounded card with slate-50 background, indigo-500 left border (3px), "Methodology" header in uppercase tracking
    - _Requirements: 15.1, 15.4_

  - [ ] 16.5 Wire DeepDive into FindingCards and key result sections
    - Add deep-dive content to KeyFinding entries on Overview page
    - Add DeepDive panels to key chart sections on ResultsPage and BehaviourPage where methodology context is valuable
    - _Requirements: 15.1_

  - [ ]* 16.6 Write property test for deep-dive toggle (Property 27)
    - **Property 27: Deep-dive toggle expands panel with methodology note**
    - Generate random deep-dive content, simulate toggle click, check expanded state and methodology note presence
    - **Validates: Requirements 15.1, 15.4**

  - [ ]* 16.7 Write property test for term tooltip (Property 28)
    - **Property 28: Term tooltip shows glossary definition on hover**
    - Generate random glossary term from GLOSSARY_ENTRIES, simulate hover, check tooltip definition matches
    - **Validates: Requirements 15.2**

  - [ ]* 16.8 Write property test for cross-reference navigation (Property 29)
    - **Property 29: Cross-reference links navigate to correct section**
    - Generate random CrossReference with route/tab/anchor, simulate click, check navigation target
    - **Validates: Requirements 15.3**

- [ ] 17. Final checkpoint — Ensure all new components compile and integrate
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Dark mode (Requirement 9) is intentionally excluded per user direction
- Responsive complexity is kept minimal — basic Tailwind breakpoints only, no icon-only sidebar mode
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Checkpoints ensure incremental validation
- Tasks 12–17 cover Requirements 11–15 (narrative flow, formula verification, copy quality, findings presentation, interactive elements)
- The formula registry (task 13) should be populated early since it feeds into FormulaCard/MathBlock enhancements across multiple pages
