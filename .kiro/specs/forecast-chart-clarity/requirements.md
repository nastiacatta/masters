# Requirements Document

## Introduction

The thesis dashboard displays cumulative forecast error charts comparing 4 weighting methods (Equal, Skill-only, Skill × stake, Stake-only) as overlapping lines. Currently all lines blend together due to similar colors, uniform stroke widths, and lack of visual differentiation. This feature improves chart clarity so each method line is immediately distinguishable through color contrast, stroke patterns, thickness variation, and interactive highlighting.

Two chart instances are affected:
- **ResultsPage.tsx** (demo fallback "Accuracy" tab): 4 lines with minimal differentiation (3 thin semi-transparent, 1 thick).
- **ResearchQuestion.tsx** (benchmark chart): 4 lines all at strokeWidth 2 with no pattern or opacity differentiation.
- **ResultsPage.tsx** (real-data "CRPS over time" chart): 4 lines (uniform, skill, mechanism, best_single) with similar blending issues.

## Glossary

- **Chart**: A Recharts `LineChart` component rendering cumulative forecast error over rounds
- **Method_Line**: A single `<Line>` element in the Chart representing one weighting method
- **Stroke_Pattern**: The `strokeDasharray` SVG attribute controlling dash/gap patterns on a line
- **Legend**: The Recharts `<Legend>` component displaying method names and visual keys
- **Hover_Highlight**: An interactive behavior where mousing over a Legend entry or line emphasizes that line and dims others
- **Token_File**: The `dashboard/src/lib/tokens.ts` file containing the `METHOD` color definitions
- **Demo_Chart**: The cumulative error chart in ResultsPage.tsx under the demo fallback "Accuracy" tab
- **Benchmark_Chart**: The forecast error chart in ResearchQuestion.tsx
- **RealData_Chart**: The "CRPS over time" chart in ResultsPage.tsx under the "Real data" tab

## Requirements

### Requirement 1: High-Contrast Color Palette

**User Story:** As a thesis reader, I want each weighting method to have a visually distinct color, so that I can tell the lines apart at a glance without relying on the legend.

#### Acceptance Criteria

1. THE Token_File SHALL define four method colors with a minimum WCAG contrast ratio of 3:1 between any two adjacent method colors when rendered on a white background
2. THE Token_File SHALL use colors from distinct hue families for each method (e.g. no two methods sharing purple/indigo hues)
3. WHEN the method colors are updated in the Token_File, THE Demo_Chart, Benchmark_Chart, and RealData_Chart SHALL all reference the Token_File colors instead of hardcoded hex values

### Requirement 2: Stroke Pattern Differentiation

**User Story:** As a thesis reader, I want each line to have a unique stroke pattern (solid, dashed, dotted, dash-dot), so that I can distinguish methods even in grayscale or when colors are ambiguous.

#### Acceptance Criteria

1. THE Demo_Chart SHALL render each of the four Method_Lines with a distinct `strokeDasharray` pattern: one solid, one dashed, one dotted, one dash-dot
2. THE Benchmark_Chart SHALL render each of the four Method_Lines with the same distinct stroke patterns as the Demo_Chart
3. THE RealData_Chart SHALL render each of its Method_Lines with distinct stroke patterns consistent with the method identity
4. THE Token_File SHALL define the stroke pattern for each method alongside the color definition

### Requirement 3: Line Thickness Hierarchy

**User Story:** As a thesis reader, I want the primary method (Skill × stake) to be visually prominent and secondary methods to be clearly visible but subordinate, so that I can see the main result while still comparing all methods.

#### Acceptance Criteria

1. THE Demo_Chart SHALL render the Skill × stake Method_Line with a strokeWidth of at least 3 and all other Method_Lines with a strokeWidth of at least 2
2. THE Benchmark_Chart SHALL render the Skill × stake Method_Line with a strokeWidth of at least 3 and all other Method_Lines with a strokeWidth of at least 2
3. THE Demo_Chart SHALL render all Method_Lines with a strokeOpacity of at least 0.85 so that no line appears washed out
4. THE RealData_Chart SHALL render the Skill × stake (mechanism) Method_Line with a strokeWidth of at least 3 and all other Method_Lines with a strokeWidth of at least 2

### Requirement 4: Interactive Legend Highlighting

**User Story:** As a thesis reader, I want to hover over a legend entry and see that method's line emphasized while others dim, so that I can isolate and trace a single method across the chart.

#### Acceptance Criteria

1. WHEN a user hovers over a Legend entry in the Demo_Chart, THE Demo_Chart SHALL increase the hovered Method_Line opacity to 1.0 and reduce all other Method_Lines opacity to 0.2
2. WHEN a user stops hovering over a Legend entry in the Demo_Chart, THE Demo_Chart SHALL restore all Method_Lines to their default opacity within 200ms
3. WHEN a user hovers over a Legend entry in the Benchmark_Chart, THE Benchmark_Chart SHALL increase the hovered Method_Line opacity to 1.0 and reduce all other Method_Lines opacity to 0.2
4. WHEN a user stops hovering over a Legend entry in the Benchmark_Chart, THE Benchmark_Chart SHALL restore all Method_Lines to their default opacity within 200ms
5. WHEN a user hovers over a Legend entry in the RealData_Chart, THE RealData_Chart SHALL increase the hovered Method_Line opacity to 1.0 and reduce all other Method_Lines opacity to 0.2

### Requirement 5: Consistent Token Usage Across Charts

**User Story:** As a developer, I want all chart color, stroke pattern, and thickness values to come from a single source of truth, so that visual changes propagate consistently.

#### Acceptance Criteria

1. THE Demo_Chart SHALL read method colors, stroke patterns, and labels from the Token_File instead of inline hex values
2. THE Benchmark_Chart SHALL read method colors, stroke patterns, and labels from the Token_File instead of inline hex values or local `CHART_COLORS` constants
3. THE RealData_Chart SHALL read method colors, stroke patterns, and labels from the Token_File instead of inline hex values or local `METHOD_COLOR` constants
4. WHEN a method color or stroke pattern is changed in the Token_File, THE Demo_Chart, Benchmark_Chart, and RealData_Chart SHALL reflect the change without additional code modifications

### Requirement 6: Benchmark Chart Sizing

**User Story:** As a thesis reader, I want the benchmark chart to be tall enough to see line separation, so that the comparison is readable.

#### Acceptance Criteria

1. THE Benchmark_Chart SHALL render with a minimum height of 360 pixels instead of the current 280 pixels
