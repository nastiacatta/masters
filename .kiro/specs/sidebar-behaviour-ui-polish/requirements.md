# Requirements Document

## Introduction

This feature improves the UI polish and interactivity of two areas of the thesis dashboard:

1. The left sidebar navigation — adding hover animations, better visual hierarchy, collapsible section groups, and a more refined active state.
2. The Behaviour page — decomposing the monolithic 1815-line file into focused modules, improving the tab navigation, and cleaning up layout and spacing.

The tech stack is React + TypeScript, Tailwind CSS, Framer Motion, Recharts, React Router (HashRouter), and clsx.

## Glossary

- **Sidebar**: The fixed 192px-wide left navigation panel rendered by `Sidebar.tsx`, containing grouped nav links, a header, and a footer.
- **Nav_Item**: A single clickable route link inside the Sidebar, consisting of an icon and a label.
- **Nav_Group**: A labelled collection of Nav_Items (e.g. "Primary", "Secondary") separated by a divider.
- **Behaviour_Page**: The page component at `/behaviour` that displays behaviour taxonomy, simulation results, and robustness analysis across 11 tabs.
- **Tab_Bar**: The horizontal row of tab buttons at the top of the Behaviour_Page content area.
- **Tab_Content_Module**: A self-contained React component file that renders the content for a single Behaviour_Page tab.
- **Family_Color_Map**: The mapping of behaviour family names to Tailwind colour classes and hex values used for visual coding.
- **Preset_Simulation**: A `runPipeline` call with a specific `behaviourPreset` that produces a `PipelineResult`.
- **Comparison_Summary**: The derived array of per-preset metrics (mean CRPS, delta %, Gini, N_eff, participation) used in the overview table and charts.

## Requirements

### Requirement 1: Sidebar hover and active state animations

**User Story:** As a user, I want the sidebar nav items to feel responsive and interactive when I hover or click, so that navigation feels polished and modern.

#### Acceptance Criteria

1. WHEN a user hovers over an inactive Nav_Item, THE Sidebar SHALL display a smooth background colour transition (150ms ease) and a subtle left-translate (2px) on the label and icon.
2. WHEN a Nav_Item is active, THE Sidebar SHALL render a teal left border accent, a teal-tinted background, and a slightly bolder font weight to clearly distinguish the current route.
3. WHEN a user navigates to a new route, THE Sidebar SHALL animate the active indicator transition using Framer Motion `layoutId` so the accent slides between items.
4. THE Sidebar SHALL use Framer Motion for all hover and active state animations to maintain consistency with the rest of the dashboard.

### Requirement 2: Collapsible sidebar navigation groups

**User Story:** As a user, I want the sidebar navigation groups to be collapsible, so that I can reduce visual clutter and focus on the section I am using.

#### Acceptance Criteria

1. THE Sidebar SHALL render each Nav_Group with a clickable group header label (e.g. "Primary", "Secondary") that toggles visibility of the group's Nav_Items.
2. WHEN a user clicks a Nav_Group header, THE Sidebar SHALL animate the expand/collapse of the group's Nav_Items using Framer Motion `AnimatePresence` with a vertical slide transition.
3. THE Sidebar SHALL persist all Nav_Groups in their expanded state by default on initial load.
4. WHEN a Nav_Group is collapsed, THE Sidebar SHALL display a chevron icon rotated to indicate the collapsed state, and rotate the chevron back when expanded.

### Requirement 3: Sidebar visual hierarchy and spacing improvements

**User Story:** As a user, I want the sidebar to have clearer visual hierarchy and better spacing, so that it is easier to scan and looks more refined.

#### Acceptance Criteria

1. THE Sidebar SHALL render group header labels in uppercase, 10px font size, bold weight, and slate-400 colour with wider letter-spacing to visually separate groups from Nav_Items.
2. THE Sidebar SHALL apply consistent vertical padding of 6px between Nav_Items and 16px between Nav_Groups.
3. THE Sidebar SHALL render the header section ("Skill × Stake") with a subtle gradient or accent underline to make it visually distinct from the navigation area.
4. THE Sidebar SHALL render the footer text at 9px with reduced opacity to de-emphasise it relative to navigation content.

### Requirement 4: Sidebar tooltip on nav items

**User Story:** As a user, I want to see a tooltip when hovering over a nav item, so that I get a brief description of each page.

#### Acceptance Criteria

1. WHEN a user hovers over a Nav_Item for more than 400ms, THE Sidebar SHALL display a tooltip to the right of the Nav_Item showing a short description of the destination page.
2. WHEN the user moves the cursor away from the Nav_Item, THE Sidebar SHALL dismiss the tooltip with a fade-out transition within 100ms.
3. THE Sidebar SHALL position each tooltip so that it does not overflow the viewport.

### Requirement 5: Behaviour page file decomposition

**User Story:** As a developer, I want the Behaviour page to be split into focused modules, so that the codebase is maintainable and each tab's logic is isolated.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL import each tab's content from a dedicated Tab_Content_Module file located in `dashboard/src/components/behaviour/tabs/`.
2. THE Behaviour_Page SHALL move all shared helper components (SmartTooltip, Metric, VerdictCard) into a shared module at `dashboard/src/components/behaviour/shared.tsx`.
3. THE Behaviour_Page SHALL move all hardcoded constants (Family_Color_Map, FAMILY_HEX, FAMILY_DESCRIPTIONS) into `dashboard/src/lib/behaviour/familyConstants.ts`.
4. THE Behaviour_Page SHALL move the `compare` utility function and Comparison_Summary derivation logic into `dashboard/src/lib/behaviour/comparisonUtils.ts`.
5. THE Behaviour_Page main file SHALL contain only the top-level layout, tab state management, and tab routing — reducing the file to under 150 lines.

### Requirement 6: Behaviour page tab bar redesign

**User Story:** As a user, I want the Behaviour page tab navigation to be clearer and easier to use, so that I can quickly find and switch between the 11 analysis tabs.

#### Acceptance Criteria

1. THE Tab_Bar SHALL group tabs visually by category: a "Core" group (Overview, Sensitivity) and a "Families" group (the 9 behaviour family tabs), separated by a subtle vertical divider.
2. WHEN a user clicks a tab, THE Tab_Bar SHALL animate the active underline indicator to slide to the selected tab using Framer Motion `layoutId`.
3. THE Tab_Bar SHALL display the experiment/taxonomy status dot to the right of each tab label, using emerald for experiment-backed tabs and amber for taxonomy-only tabs.
4. WHEN the tab count exceeds the visible width, THE Tab_Bar SHALL allow horizontal scrolling with fade-out gradient indicators on the overflow edges.
5. THE Tab_Bar SHALL render each tab with 12px font size, medium font weight, and 12px horizontal padding for consistent sizing.

### Requirement 7: Behaviour page layout and spacing cleanup

**User Story:** As a user, I want the Behaviour page content to have consistent spacing and visual hierarchy, so that the analysis results are easy to read and compare.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL apply a consistent 24px vertical gap between major content sections (verdict cards, metric grids, chart cards) within each tab.
2. THE Behaviour_Page SHALL render verdict cards in a responsive grid that displays 1 column on small screens, 2 columns on medium screens, and 3 columns on large screens.
3. THE Behaviour_Page SHALL render metric strips in a responsive grid that displays 2 columns on small screens and 4 columns on medium screens and above.
4. THE Behaviour_Page SHALL wrap each tab's content in a Framer Motion fade-slide animation (opacity 0→1, translateY 8px→0) with a 150ms duration on tab switch.

### Requirement 8: Preset simulation data extraction

**User Story:** As a developer, I want all 19 preset simulation calls to be managed outside the main page component, so that the page component is focused on rendering.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL delegate all 19 Preset_Simulation `runPipeline` calls to a custom hook `usePresetSimulations` located in `dashboard/src/hooks/usePresetSimulations.ts`.
2. THE `usePresetSimulations` hook SHALL return a typed record mapping each `BehaviourPresetId` to its `PipelineResult`.
3. THE `usePresetSimulations` hook SHALL compute the Comparison_Summary array and the family impact data, returning them alongside the individual pipeline results.
4. THE `usePresetSimulations` hook SHALL memoize all pipeline results using `useMemo` with an empty dependency array to prevent re-computation on re-renders.
