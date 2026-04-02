# Requirements Document

## Introduction

This document specifies requirements for a UI/UX redesign of the thesis dashboard for "Adaptive Skill and Stake in Forecast Markets." The current dashboard suffers from poor visual design, limited navigation affordances, static non-interactive charts, and insufficient presentation of experiment results. The redesign targets three areas: (1) improved navigation and information architecture, (2) more interactive and visually polished data visualisations, and (3) better showcasing of experiment results across the thesis story.

## Glossary

- **Dashboard**: The React 19 + TypeScript + Vite web application that visualises pre-run experiment outputs from the thesis research.
- **Sidebar**: The persistent left-hand navigation panel that provides access to all top-level routes.
- **Chart**: Any Recharts-based data visualisation (line chart, bar chart, heatmap, calibration plot) rendered within the Dashboard.
- **Experiment_Card**: A UI component that presents a single experiment's key metrics, description, and entry point to detailed views.
- **Metric_Strip**: A horizontal row of MetricCard components displaying headline numeric results for an experiment or page.
- **Tooltip**: An overlay element that appears on hover or focus over a Chart data point, showing contextual numeric detail.
- **Breadcrumb**: A secondary navigation element showing the user's current location within the Dashboard hierarchy.
- **Chart_Controls**: Interactive UI elements (toggles, dropdowns, sliders) that allow users to filter, zoom, or change what data a Chart displays.
- **Experiment_Comparison_View**: A layout that places two or more experiment results side by side for direct comparison.
- **Results_Page**: The `/results` route that presents headline answers (accuracy, concentration) and evidence tabs.
- **Robustness_Page**: The `/robustness` route that presents invariant checks, adversarial tests, and failure modes.
- **Mechanism_Page**: The `/mechanism` route that provides the step-by-step round walkthrough.
- **Overview_Page**: The `/` route that frames the thesis research question and system overview.

## Requirements

### Requirement 1: Redesigned Sidebar Navigation

**User Story:** As a thesis reader, I want clear and visually structured navigation, so that I can quickly find and move between dashboard sections without confusion.

#### Acceptance Criteria

1. THE Sidebar SHALL display navigation items with descriptive icons alongside text labels for each top-level route.
2. THE Sidebar SHALL visually distinguish the currently active route using a highlighted background and accent-coloured indicator.
3. THE Sidebar SHALL group navigation items into logical sections: primary routes (Overview, Mechanism, Results, Robustness) and secondary routes (Appendix, Experiments).
4. WHEN a user hovers over a Sidebar navigation item, THE Sidebar SHALL display a subtle hover state with background colour change within 100ms.
5. THE Sidebar SHALL include the thesis title "Skill × Stake" and a short subtitle at the top as a branded header.
6. WHEN the viewport width is below 768px, THE Sidebar SHALL collapse into a hamburger menu icon that opens a slide-out drawer on tap.

### Requirement 2: Breadcrumb and Contextual Navigation

**User Story:** As a thesis reader, I want to see where I am in the dashboard hierarchy, so that I can orient myself and navigate back to parent sections.

#### Acceptance Criteria

1. WHEN a user navigates to any page, THE Dashboard SHALL display a Breadcrumb bar below the top of the main content area showing the current route path.
2. WHEN a user clicks a Breadcrumb segment, THE Dashboard SHALL navigate to that segment's corresponding route.
3. WHILE a user is on a tabbed page (Results_Page or Robustness_Page), THE Breadcrumb SHALL include the active tab name as the final segment.

### Requirement 3: Interactive Chart Enhancements

**User Story:** As a thesis reader, I want to interact with charts by zooming, filtering, and inspecting data points, so that I can explore experiment results in detail.

#### Acceptance Criteria

1. THE Chart SHALL support click-and-drag zoom on the x-axis, allowing users to select a time range to magnify.
2. WHEN a user zooms into a Chart, THE Chart SHALL display a "Reset zoom" button that restores the original axis range.
3. WHEN a user hovers over a data point on a Chart, THE Tooltip SHALL display the exact numeric values for all visible series at that point within 50ms.
4. WHERE a Chart displays multiple series (e.g., method comparison), THE Chart_Controls SHALL include toggle switches to show or hide individual series.
5. THE Chart SHALL use smooth animated transitions (duration 300ms) when data changes due to filtering or series toggling.
6. WHEN a user clicks the expand button on a ChartCard, THE Dashboard SHALL display the Chart in a fullscreen modal with increased resolution.

### Requirement 4: Consistent Visual Design System

**User Story:** As a thesis reader, I want a cohesive and polished visual appearance across all pages, so that the dashboard feels professional and easy to read.

#### Acceptance Criteria

1. THE Dashboard SHALL use a consistent colour palette: slate for text and borders, teal as the primary accent, and semantically assigned colours for each weighting method (uniform: slate-400, deposit: teal-500, skill: violet-500, mechanism: indigo-500).
2. THE Dashboard SHALL apply consistent border-radius (12px for cards, 8px for inner elements), spacing (multiples of 4px), and typography (system font stack with defined size scale) across all components.
3. THE Dashboard SHALL use Framer Motion entrance animations (fade-in with 8px upward translate, 250ms duration) for cards and sections as they enter the viewport.
4. THE MetricCard SHALL display a coloured accent bar on the left edge when the accent property is enabled.
5. THE Dashboard SHALL maintain a minimum contrast ratio of 4.5:1 between text and background colours for all text elements.

### Requirement 5: Improved Experiment Results Showcase

**User Story:** As a thesis reader, I want experiment results presented with clear narrative structure and visual hierarchy, so that I can understand what each experiment proves and how it relates to the research question.

#### Acceptance Criteria

1. THE Results_Page SHALL display headline answer cards at the top, each containing: a question, a key metric value, a verdict indicator (good/neutral/bad with colour coding), an interpretation sentence, and a caveat note.
2. WHEN experiment data is loaded, THE Results_Page SHALL display a ranked list of methods sorted by accuracy (lowest ΔCRPS first) with rank badges (#1, #2, etc.) and colour-coded bars.
3. THE Results_Page SHALL organise evidence into clearly labelled tabs (Accuracy, Concentration, Calibration, Ablation) with a visible active-tab indicator.
4. WHEN a user switches between evidence tabs, THE Results_Page SHALL animate the tab content transition using a horizontal slide (200ms duration).
5. IF experiment data fails to load, THEN THE Results_Page SHALL display a descriptive error message with a retry button, and fall back to the in-browser demo mode with a visible "Illustrative only" banner.

### Requirement 6: Experiment Card Grid for Cross-Scenario Comparison

**User Story:** As a thesis reader, I want to browse all experiments in a visual grid, so that I can quickly scan what experiments exist and jump into any one.

#### Acceptance Criteria

1. THE Experiment_Comparison_View SHALL display experiments as a grid of Experiment_Cards, each showing: experiment name, description (truncated to 2 lines), block category badge (core/behaviour/experiments), and up to 3 key metric values.
2. WHEN a user clicks an Experiment_Card, THE Dashboard SHALL navigate to the detailed view for that experiment.
3. THE Experiment_Comparison_View SHALL provide filter controls to narrow experiments by block category (all, core, behaviour, experiments).
4. WHEN a filter is applied, THE Experiment_Comparison_View SHALL animate the card grid re-layout using Framer Motion layout animations (200ms duration).
5. THE Experiment_Comparison_View SHALL support a search input that filters Experiment_Cards by name or description as the user types.

### Requirement 7: Responsive Layout

**User Story:** As a thesis reader, I want the dashboard to work well on different screen sizes, so that I can review results on a laptop, tablet, or large monitor.

#### Acceptance Criteria

1. WHILE the viewport width is 1024px or wider, THE Dashboard SHALL display the Sidebar and main content side by side.
2. WHILE the viewport width is between 768px and 1023px, THE Dashboard SHALL collapse the Sidebar to icon-only mode (48px wide) and expand on hover.
3. WHILE the viewport width is below 768px, THE Dashboard SHALL hide the Sidebar and display a top navigation bar with a hamburger menu.
4. THE Chart components SHALL use ResponsiveContainer to fill their parent width and maintain a minimum height of 250px.
5. THE card grid layouts SHALL adapt column count: 1 column below 640px, 2 columns between 640px and 1023px, and 3 or more columns at 1024px and above.

### Requirement 8: Mechanism Walkthrough Visual Improvements

**User Story:** As a thesis reader, I want the mechanism walkthrough to be visually engaging with clear step progression, so that I can follow how one round of the market works.

#### Acceptance Criteria

1. THE Mechanism_Page SHALL display walkthrough steps (Inputs, DGP, Behaviour, Core, Results, Next State) as a horizontal stepper with numbered step indicators and connecting lines.
2. WHEN a user clicks a step indicator, THE Mechanism_Page SHALL navigate to that step and highlight the active step with the primary accent colour.
3. WHILE a step is active, THE Mechanism_Page SHALL display the step content panel with a fade-in animation (250ms duration).
4. THE Mechanism_Page SHALL display mathematical formulas using KaTeX with consistent font sizing (14px for inline, 18px for display blocks) and adequate surrounding whitespace (16px vertical margin).
5. WHEN a user advances to the next step, THE Mechanism_Page SHALL animate the transition with a horizontal slide-out of the current step and slide-in of the next step (300ms duration).

### Requirement 9: Dark Mode Support

**User Story:** As a thesis reader, I want to switch between light and dark colour themes, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a theme toggle button accessible from the Sidebar header area.
2. WHEN a user activates dark mode, THE Dashboard SHALL switch all background colours to dark slate tones (slate-900 for main background, slate-800 for cards) and text colours to light tones (slate-100 for primary text, slate-400 for secondary text) within 150ms.
3. WHEN a user activates dark mode, THE Chart components SHALL update axis colours, grid colours, and tooltip backgrounds to dark-theme equivalents.
4. THE Dashboard SHALL persist the selected theme preference in localStorage and restore it on subsequent visits.
5. THE Dashboard SHALL default to the user's operating system colour scheme preference (prefers-color-scheme media query) on first visit.

### Requirement 10: Page Loading and Data States

**User Story:** As a thesis reader, I want clear feedback when data is loading or unavailable, so that I know the dashboard is working and what to expect.

#### Acceptance Criteria

1. WHILE experiment data is loading, THE Dashboard SHALL display skeleton placeholder elements (pulsing grey rectangles) matching the expected layout of charts and cards.
2. WHEN data loading completes, THE Dashboard SHALL transition from skeleton placeholders to actual content with a fade-in animation (200ms duration).
3. IF a data file fails to load, THEN THE Dashboard SHALL display an inline error message within the affected component area, without breaking the rest of the page layout.
4. WHILE no experiments are available, THE Dashboard SHALL display a friendly empty state message explaining that data is not yet linked, with a reference to the data setup instructions.
