# Implementation Plan: Slides Tab

## Overview

Add a password-protected, scrollable slide presentation tab to the Skill × Stake thesis dashboard. Implementation proceeds from shared utilities and wrapper components, through individual slide components, to route/sidebar wiring and integration.

## Tasks

- [x] 1. Create SlideWrapper and PasswordGate components
  - [x] 1.1 Create `src/components/slides/SlideWrapper.tsx`
    - Implement a shared wrapper component that provides consistent full-width layout, white background, border/spacing, and padding for each slide
    - Accept `children` and optional `className` prop per the `SlideWrapperProps` interface
    - Use existing Tailwind design tokens (white bg, slate borders, consistent spacing)
    - _Requirements: 3.1, 3.4, 9.1, 9.2, 9.3_

  - [x] 1.2 Create `src/components/slides/PasswordGate.tsx`
    - Implement password form UI with an input field and submit button
    - Compare submitted value against the password `"anastasia"` (exact match)
    - On correct password, call `onAuthenticate()` prop
    - On incorrect password, display an inline error message and remain on the form
    - Handle empty submissions as incorrect password
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 1.3 Write property test for password validation (Property 1)
    - **Property 1: Invalid passwords are always rejected**
    - Generate 100+ arbitrary strings (excluding exact `"anastasia"`), verify all are rejected
    - Test near-matches: `"Anastasia"`, `"anastasia "`, `" anastasia"`, `"ANASTASIA"`, empty string, whitespace-only
    - **Validates: Requirement 2.3**

- [x] 2. Create static slide components
  - [x] 2.1 Create `src/components/slides/TitleSlide.tsx`
    - Display thesis title "Skill × Stake", subtitle "Adaptive Skill Updates for Forecast Aggregation", date "13/08/2025", and author name/institution
    - Use SlideWrapper for layout
    - Use text-lg or larger for headings, text-sm for body per existing conventions
    - _Requirements: 3.3, 4.1, 4.2, 4.3, 4.4, 9.3_

  - [x] 2.2 Create `src/components/slides/DataOverviewSlide.tsx`
    - Render two Dataset Cards: Elia Electricity (10,000 rounds, 5 forecasters, Belgian electricity load from Elia TSO) and Elia Wind (17,544 rounds, 5 forecasters, Belgian wind power generation from Elia TSO)
    - Include explanatory text that both datasets use the same 5 forecaster models
    - Use SlideWrapper for layout
    - _Requirements: 5.1, 5.2, 5.3, 9.1_

  - [x] 2.3 Create `src/components/slides/ForecasterSlide.tsx`
    - Implement a reusable component accepting `ForecasterData` props (name, type, description, strengths, weaknesses)
    - Hardcode the static array of 5 forecasters: Naive, Moving Average (20), ARIMA(2,1,1), XGBoost, Neural Net (MLP) with all required details from the design
    - Use SlideWrapper for layout
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 9.1_

  - [x] 2.4 Create `src/components/slides/KeyFindingsSlide.tsx`
    - Display 3 key findings: skill-weighted aggregation improves over equal weighting, mechanism achieves lowest CRPS, equal weighting remains a strong baseline especially on electricity
    - Use SlideWrapper for layout
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1_

- [x] 3. Checkpoint
  - Ensure all static slide components compile without errors, ask the user if questions arise.

- [ ] 4. Create ResultsSlide with data fetching
  - [x] 4.1 Create `src/components/slides/ResultsSlide.tsx`
    - Accept `title` and `dataPath` props per `ResultsSlideProps` interface
    - Fetch comparison.json from the given `dataPath` on mount using `useEffect` + `fetch`
    - Use AbortController to cancel in-flight requests on unmount
    - Manage `{ data, error, loading }` state pattern
    - On success, render a Performance Summary table showing each row's `method`, `mean_crps`, and `delta_crps_vs_equal`
    - On fetch failure or unexpected JSON shape, display a user-friendly error message in place of the table
    - Show a loading indicator while data is being fetched
    - Use SlideWrapper for layout
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 9.1_

  - [ ] 4.2 Write property test for performance summary rendering (Property 2)
    - **Property 2: Performance summary displays all comparison rows**
    - Generate 100+ random `ComparisonData.rows` arrays (1–10 rows, arbitrary method names, mean_crps in [0,1], delta_crps_vs_equal in [-1,1])
    - Verify the formatting/render function produces output containing every row's method, formatted mean_crps, and formatted delta_crps_vs_equal
    - **Validates: Requirements 7.3, 7.4**

- [x] 5. Create SlidesPage and wire route + sidebar
  - [x] 5.1 Create `src/pages/SlidesPage.tsx`
    - Manage `isAuthenticated` state via `useState(false)` — no localStorage or cookies
    - When not authenticated, render `PasswordGate` with `onAuthenticate` callback that sets state to `true`
    - When authenticated, render a scrollable container with all slides in order: TitleSlide → DataOverviewSlide → ForecasterSlide ×5 → ResultsSlide (electricity) → ResultsSlide (wind) → KeyFindingsSlide
    - Pass correct `dataPath` props to each ResultsSlide: `data/real_data/elia_electricity/data/comparison.json` and `data/real_data/elia_wind/data/comparison.json`
    - _Requirements: 2.1, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4_

  - [x] 5.2 Add `/slides` route to `src/App.tsx`
    - Import `SlidesPage` and add `<Route path="/slides" element={<SlidesPage />} />` in the primary routes section
    - _Requirements: 1.2_

  - [x] 5.3 Add "Slides" nav item to `src/components/dashboard/Sidebar.tsx`
    - Create a 16×16 inline SVG slides/presentation icon following the existing icon pattern
    - Add `{ to: '/slides', label: 'Slides', icon: SlidesIcon, group: 'secondary' }` to the `NAV_ITEMS` array in the secondary group
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 6. Final checkpoint
  - Ensure all components compile, slides render in correct order, password gate works, data loads from comparison.json files. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The design uses TypeScript + React + Tailwind CSS, matching the existing dashboard stack
- Property tests use `fast-check` (already in devDependencies)
- Static forecaster/dataset content is hardcoded per design decision — no data fetching needed for those slides
- Only `config` and `rows` from comparison.json are used; `per_round` is ignored
