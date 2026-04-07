# Requirements Document

## Introduction

This document specifies requirements for a UI/UX redesign of the thesis dashboard for "Adaptive Skill and Stake in Forecast Markets." The current dashboard suffers from poor visual design, limited navigation affordances, static non-interactive charts, and insufficient presentation of experiment results. The redesign targets five areas: (1) improved navigation and information architecture, (2) more interactive and visually polished data visualisations, (3) better showcasing of experiment results across the thesis story, (4) a stronger narrative flow that reads like a thesis — with clear findings, logical progression, and no filler text, and (5) PDF-sourced mathematical verification to ensure all formulas displayed in the dashboard match the thesis manuscripts exactly.

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
- **FormulaCard**: A UI component that displays a mathematical formula with its LaTeX source, label, and citation reference.
- **MathBlock**: A KaTeX-rendered mathematical expression block used inline or as a display equation.
- **VerdictCard**: A UI component that presents a yes/no finding with colour-coded verdict, metric value, and interpretation.
- **Narrative_Lead**: The introductory paragraph at the top of each page that frames the question being answered.
- **Formula_Registry**: A data structure mapping each formula to its LaTeX, source PDF, section reference, and usage location.
- **Deep_Dive**: An expandable section within a page that reveals additional detail without cluttering the main narrative.
- **Source_Citation**: A muted-text reference below a formula indicating the PDF and section where it originates.

## Requirements*: The `/notes` route that presents all experiments and methodology notes.
- **Narrative_Flow**: The logical progression of the dashboard story: research question → mechanism → does it work? → where does it break? → conclusions.
- **PDF_Source**: One of the thesis PDF manuscripts in the repository root (MASTERS copy.pdf, Masters_notes (2) copy.pdf, NotesMasters copy.pdf, ESG (6) copy.pdf, Pierre_wagering copy.pdf, arbitrage copy.pdf) used as ground-truth references for mathematical formulas.
- **Formula_Reference**: A citation annotation on a displayed formula indicating which PDF_Source and equation/section it corresponds to.
- **Copy_Text**: Any descriptive, explanatory, or interpretive text displayed in the Dashboard (headings, descriptions, captions, findings, tooltips).
- **Thesis_Point**: A single, specific claim or finding that an experiment or section is designed to demonstrate.

## Requirements

### Requirement 1: Redesigned Sidebar Navigation

**User Story:** As a thesis reader, I want clear and visually structured navigation, so that I can quickly find and move between dashboard sections without confusion.

#### Acceptance Criteria

1. THE Sidebar SHALL display navigation items with descriptive icons alongside text labels for each top-level route.
2. THE Sidebar SHALL visually distinguish the currently active route using a highlighted background and accent-coloured indicator.
3. THE Sidebar SHALL group navigation items into logical sections: primary routes (Overview, Mechanism, Results, Robustness) and secondary routes (Behaviour, Notes, Appendix).
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
### Requirement 10: Page Loading and Data States

**User Story:** As a thesis reader, I want clear feedback when data is loading or unavailable, so that I know the dashboard is working and what to expect.

#### Acceptance Criteria

1. WHILE experiment data is loading, THE Dashboard SHALL display skeleton placeholder elements (pulsing grey rectangles) matching the expected layout of charts and cards.
2. WHEN data loading completes, THE Dashboard SHALL transition from skeleton placeholders to actual content with a fade-in animation (200ms duration).
3. IF a data file fails to load, THEN THE Dashboard SHALL display an inline error message within the affected component area, without breaking the rest of the page layout.
4. WHILE no experiments are available, THE Dashboard SHALL display a friendly empty state message explaining that data is not yet linked, with a reference to the data setup instructions.

### Requirement 11: Thesis Narrative Flow

**User Story:** As a thesis reader, I want the dashboard to guide me through the research like a story — from question to evidence to conclusion — so that I can follow the argument without getting lost in disconnected charts.

#### Acceptance Criteria

1. THE Overview_Page SHALL present the research question prominently, followed by a visual roadmap showing the four-act structure: Understand → Does it work? → How? → When does it break?
2. EACH page SHALL begin with a narrative lead-in paragraph (2–4 sentences) that states what question the page answers and why it matters in the thesis argument.
3. THE Dashboard SHALL display "So what?" summary cards at the bottom of each major section, stating the key takeaway in one sentence and linking it back to the research question.
4. WHEN a user completes a page, THE Dashboard SHALL display a "Next" prompt linking to the next page in the narrative sequence with a one-line preview of what comes next.
5. THE Results_Page SHALL present findings in the order: headline verdict → supporting evidence → caveats, matching the thesis argument structure.

### Requirement 12: Mathematical Formula Verification via PDF Sources

**User Story:** As a thesis reader, I want mathematical formulas in the dashboard to be accurate and traceable to the thesis PDFs, so that I can trust the notation and cross-reference with the written thesis.

#### Acceptance Criteria

1. ALL mathematical formulas displayed in the Dashboard (KaTeX blocks) SHALL be cross-checked against the thesis PDF sources (MASTERS copy.pdf, Masters_notes (2) copy.pdf, NotesMasters copy.pdf) for notation accuracy.
2. EACH FormulaCard and MathBlock component SHALL include a `source` prop indicating the PDF and page/section where the formula originates (e.g., "MASTERS §3.2, Eq. 7").
3. WHEN a formula is displayed, THE Dashboard SHALL render a small source citation below the formula block in muted text.
4. THE Mechanism_Page formulas (payoff, skill update, deposit, weight cap) SHALL match the exact notation used in the thesis PDFs, including variable names, subscripts, and operator conventions.
5. THE Dashboard SHALL maintain a formula registry (a data file or constant map) listing each formula's LaTeX, source PDF, section reference, and the component where it is used.

### Requirement 13: Copy and Text Quality Standards

**User Story:** As a thesis reader, I want all text in the dashboard to be precise, informative, and free of generic filler, so that every sentence adds value and maintains academic credibility.

#### Acceptance Criteria

1. ALL descriptive text in the Dashboard (page intros, chart subtitles, card descriptions, tooltips) SHALL be specific to the thesis content — no placeholder or generic text (e.g., "This chart shows interesting results" is not acceptable).
2. EACH chart subtitle SHALL state what the chart shows, what the axes represent, and how to interpret the key pattern in one to two sentences.
3. EACH experiment description SHALL reference the specific thesis question it addresses and name the relevant literature (e.g., "Lambert (2008)", "Vitali & Pinson (2024)") where applicable.
4. THE Dashboard SHALL avoid marketing language, superlatives, and vague qualifiers (e.g., "amazing", "cutting-edge", "state-of-the-art"). All claims SHALL be grounded in the data shown.
5. EACH VerdictCard and answer card SHALL include a precise interpretation sentence that references the actual metric values and thresholds used to reach the verdict.

### Requirement 14: Clear Main Findings Presentation

**User Story:** As a thesis reader, I want the main findings to be immediately visible and unambiguous, so that I can quickly understand what the research proved.

#### Acceptance Criteria

1. THE Overview_Page SHALL display a "Key Findings" section with 3–5 headline findings, each stated as a single declarative sentence with the supporting metric value.
2. THE Results_Page headline answer cards SHALL use a traffic-light colour system (green/amber/red) with explicit thresholds documented in the card (e.g., "Green: ΔCRPS < −5%").
3. EACH finding SHALL be accompanied by a "Strength of evidence" indicator showing whether the result is based on synthetic data only, real data, or both.
4. THE Dashboard SHALL present findings in decreasing order of importance: the primary research question answer first, then supporting evidence, then edge cases and limitations.
5. WHEN experiment data supports a finding, THE Dashboard SHALL display the specific metric values, sample sizes, and seed counts that back the claim.

### Requirement 15: Interactive Narrative Elements

**User Story:** As a thesis reader, I want interactive elements that help me explore the argument at my own pace, so that I can dig deeper into areas I find interesting without losing the overall thread.

#### Acceptance Criteria

1. THE Dashboard SHALL provide expandable "Deep dive" sections within each page that reveal additional detail (extra charts, methodology notes, parameter sensitivity) without cluttering the main narrative.
2. WHEN a user hovers over a technical term (e.g., "CRPS", "Gini", "EWMA", "sybilproof"), THE Dashboard SHALL display a tooltip with a concise definition (one to two sentences).
3. THE Dashboard SHALL provide cross-reference links between related sections (e.g., a finding on the Results page links to the robustness test that validates it).
4. EACH chart section SHALL include a collapsible "Methodology" note explaining the experimental setup: seed count, agent count, rounds, DGP, and what is held constant.
5. THE Dashboard SHALL support keyboard navigation for all interactive elements (tabs, expandable sections, chart controls) to ensure accessibility.

#### Acceptance Criteria

1. WHILE experiment data is loading, THE Dashboard SHALL display skeleton placeholder elements (pulsing grey rectangles) matching the expected layout of charts and cards.
2. WHEN data loading completes, THE Dashboard SHALL transition from skeleton placeholders to actual content with a fade-in animation (200ms duration).
3. IF a data file fails to load, THEN THE Dashboard SHALL display an inline error message within the affected component area, without breaking the rest of the page layout.
4. WHILE no experiments are available, THE Dashboard SHALL display a friendly empty state message explaining that data is not yet linked, with a reference to the data setup instructions.

### Requirement 11: Thesis Narrative Flow and Story Structure

**User Story:** As a thesis reader, I want the dashboard to read like a thesis — with a clear research question, logical progression through evidence, and explicit conclusions — so that I can follow the argument without jumping between disconnected pages.

#### Acceptance Criteria

1. THE Overview_Page SHALL present the thesis argument in a structured narrative: (a) research question, (b) why it matters (forecast markets context), (c) what the mechanism does (one-paragraph summary), (d) key findings (3 headline results with specific numbers), and (e) navigation prompts that frame each subsequent page as the next chapter of the argument.
2. THE Overview_Page SHALL frame each navigation link with a thesis-relevant question (e.g., "Does skill × stake beat baselines?" for Results, "What happens under adversarial behaviour?" for Behaviour) rather than generic labels.
3. WHEN a user navigates between pages, THE Dashboard SHALL maintain narrative continuity by displaying a contextual subtitle on each page header that states the specific thesis question that page answers.
4. THE Results_Page SHALL present findings in a logical sequence: headline verdict first ("Yes, the mechanism improves accuracy by X%"), then supporting evidence (accuracy → concentration → calibration → ablation), then caveats.
5. THE Behaviour_Page SHALL frame each behaviour experiment with a specific adversarial question (e.g., "Can a sybil attack gain advantage?") and a one-sentence verdict before showing the data.
6. THE Notes_Page SHALL organise experiments into thesis chapters (Pure Forecasting Gain, Dynamic Robustness, Strategic Robustness, Real Data Validation) matching the thesis ladder structure, rather than a flat list.
7. EACH page SHALL include a "What this means" summary section at the bottom that states the page's contribution to the overall thesis argument in 1–2 sentences.

### Requirement 12: PDF-Sourced Mathematical Verification

**User Story:** As a thesis reader, I want to know that every formula in the dashboard matches the thesis manuscripts exactly, so that I can trust the mathematical content and cross-reference with the written thesis.

#### Acceptance Criteria

1. THE Dashboard SHALL source all mathematical formulas from the thesis PDF manuscripts (MASTERS copy.pdf, Masters_notes (2) copy.pdf, NotesMasters copy.pdf, Pierre_wagering copy.pdf, arbitrage copy.pdf) as ground-truth references.
2. EACH displayed formula (FormulaCard, MathBlock) SHALL include a Formula_Reference annotation indicating the source PDF and the equation number or section where the formula appears (e.g., "MASTERS §3.2, Eq. 7").
3. THE Mechanism_Page SHALL display the five core formulas (scoring, effective wager, aggregation, settlement, skill update) with LaTeX notation that matches the thesis PDF notation character-for-character, including variable names, subscripts, and operator symbols.
4. WHEN a formula is displayed, THE FormulaCard SHALL render a small citation badge showing the PDF source reference, visible without interaction.
5. IF a formula in the codebase does not match a PDF source, THEN THE Dashboard SHALL flag the formula with a "Verify" indicator until the discrepancy is resolved.
6. THE Dashboard SHALL maintain a formula registry (a data structure mapping each displayed formula to its PDF source, equation identifier, and LaTeX string) that can be audited for completeness.

### Requirement 13: Copy and Text Quality Standards

**User Story:** As a thesis reader, I want all text in the dashboard to be precise, specific, and academically meaningful — with no generic filler — so that every sentence adds information and the dashboard reads as a credible research presentation.

#### Acceptance Criteria

1. THE Dashboard SHALL use precise, quantified language in all finding descriptions (e.g., "improves CRPS by 21% on wind data, DM test p < 0.001" rather than "significantly improves accuracy").
2. THE Dashboard SHALL avoid vague qualifiers ("significant", "substantial", "notable", "impressive") in all Copy_Text; every claim SHALL include the specific metric, dataset, and test that supports it.
3. EACH Experiment_Card description SHALL state the specific question the experiment answers and the specific metric used to answer it, in one sentence.
4. EACH Chart caption and axis label SHALL use the precise variable name and unit (e.g., "ΔCRPS vs equal weighting" not "Improvement", "Gini coefficient [0,1]" not "Concentration").
5. THE Overview_Page key findings SHALL each cite the specific dataset, sample size, and statistical test (e.g., "21.1% improvement on Elia wind (n=17,544, DM p < 0.001)") rather than unattributed claims.
6. THE Dashboard SHALL avoid filler sentences that do not convey information (e.g., "This section shows the results" or "The following chart displays the data"). Every sentence SHALL either state a finding, define a term, or explain a method.
7. EACH tooltip help text (InfoToggle) SHALL explain what the chart measures, what the axes represent, and how to interpret the result — in domain-specific terms, not generic chart descriptions.

### Requirement 14: Clear Main Findings Presentation

**User Story:** As a thesis reader, I want the main findings to be immediately visible and unambiguous on the Overview and Results pages, so that I can grasp the thesis contribution within 30 seconds of landing on the dashboard.

#### Acceptance Criteria

1. THE Overview_Page SHALL display the three main findings as prominent cards with: (a) a one-line claim, (b) the key number, (c) the dataset and conditions, and (d) a verdict icon (confirmed/partial/rejected).
2. THE Results_Page SHALL display a "Bottom Line" summary at the top — before any charts — stating the overall thesis verdict in one sentence with the primary metric (e.g., "The skill × stake mechanism improves forecast accuracy by 21.1% on real wind data").
3. WHEN the Dashboard loads the Overview_Page, THE main findings cards SHALL be visible above the fold without scrolling on a 1080p display.
4. THE main findings SHALL distinguish between synthetic and real-data results, displaying both with their respective sample sizes and significance levels.
5. THE Results_Page headline answer cards SHALL use colour-coded verdict indicators: green for confirmed improvements (statistically significant), amber for partial or conditional results, red for no improvement or degradation.

### Requirement 15: Interactive Narrative Elements

**User Story:** As a thesis reader, I want interactive elements that let me explore the thesis argument at my own pace — expanding details, comparing scenarios, and drilling into evidence — so that the dashboard is more engaging than a static PDF.

#### Acceptance Criteria

1. WHEN a user clicks on a finding card on the Overview_Page, THE Dashboard SHALL expand the card to show supporting evidence (the specific experiment, chart preview, and link to the full results).
2. THE Mechanism_Page SHALL provide interactive parameter exploration: WHEN a user adjusts a parameter (λ, η, σ_min) via a slider, THE Dashboard SHALL update the displayed formula output and show how the effective wager changes.
3. THE Results_Page SHALL provide a "Compare methods" toggle that overlays multiple weighting methods on the same chart for direct visual comparison.
4. WHEN a user hovers over a statistical claim (e.g., "p < 0.001"), THE Dashboard SHALL display a tooltip explaining the test used (e.g., "Diebold-Mariano test with HAC variance, Newey-West correction").
5. THE Behaviour_Page SHALL provide a scenario selector that lets users switch between behaviour presets (baseline, sybil, collusion, intermittent) and see the impact on accuracy and concentration metrics update in the same view.
