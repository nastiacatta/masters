# Requirements Document

## Introduction

A new "Slides" tab for the Skill × Stake thesis dashboard that presents a scrollable slide-format presentation. The slides explain the real-world forecasters used (Naive, Moving Average, ARIMA, XGBoost, Neural Net), the Elia datasets (electricity and wind), and how the Skill × Stake mechanism performs on real-world data. The tab is password-protected so only authorised viewers can access it.

## Glossary

- **Slides_Page**: The React page component rendered at the `/slides` route, displaying the scrollable slide presentation
- **Slide**: A single full-width content section within the Slides_Page, visually separated from adjacent slides
- **Password_Gate**: A UI component that blocks access to the Slides_Page until the correct password is entered
- **Forecaster_Card**: A UI element within a slide that explains one forecaster method (name, type, description, strengths, weaknesses)
- **Dataset_Card**: A UI element within a slide that describes one Elia dataset (name, size, source, characteristics)
- **Performance_Summary**: A UI section showing CRPS comparison results across weighting methods for a given dataset
- **Sidebar**: The existing navigation sidebar component that lists all dashboard tabs
- **Comparison_Data**: The JSON data loaded from `comparison.json` files containing per-method CRPS results and per-round time series

## Requirements

### Requirement 1: Sidebar Navigation Entry

**User Story:** As a user, I want to see a "Slides" entry in the sidebar navigation, so that I can navigate to the presentation view.

#### Acceptance Criteria

1. THE Sidebar SHALL display a "Slides" navigation item in the secondary group below the existing divider
2. WHEN the user clicks the "Slides" navigation item, THE Sidebar SHALL navigate to the `/slides` route
3. WHILE the user is on the `/slides` route, THE Sidebar SHALL highlight the "Slides" navigation item as active

### Requirement 2: Password Protection

**User Story:** As the thesis author, I want the Slides tab to be password-protected, so that only authorised viewers can see the presentation content.

#### Acceptance Criteria

1. WHEN a user navigates to the `/slides` route without having entered the password, THE Password_Gate SHALL display a password input form instead of the slide content
2. WHEN the user submits the correct password "anastasia", THE Password_Gate SHALL grant access and display the Slides_Page content
3. WHEN the user submits an incorrect password, THE Password_Gate SHALL display an error message and remain on the password input form
4. WHILE the user session is active in the same browser tab, THE Password_Gate SHALL remember the authenticated state so the user does not need to re-enter the password on subsequent visits to the route
5. THE Password_Gate SHALL store the authentication state in React component state only (not in localStorage or cookies)

### Requirement 3: Slide Layout and Scrolling

**User Story:** As a viewer, I want to scroll through a series of clearly separated slides, so that I can follow the presentation in a logical order.

#### Acceptance Criteria

1. THE Slides_Page SHALL render slides as vertically stacked, full-width sections that the user scrolls through
2. THE Slides_Page SHALL display the following slides in order: Title slide, Data Overview slide, Forecaster Explanation slides (one per forecaster), Electricity Results slide, Wind Results slide, Key Findings slide
3. WHEN the page loads, THE Slides_Page SHALL display the date "13/08/2025" on the title slide
4. THE Slides_Page SHALL use consistent spacing and visual separation between each Slide

### Requirement 4: Title Slide

**User Story:** As a viewer, I want to see a title slide with the thesis topic and date, so that I understand the context of the presentation.

#### Acceptance Criteria

1. THE Slides_Page SHALL display the thesis title "Skill × Stake" on the title slide
2. THE Slides_Page SHALL display the subtitle "Adaptive Skill Updates for Forecast Aggregation" on the title slide
3. THE Slides_Page SHALL display the date "13/08/2025" on the title slide
4. THE Slides_Page SHALL display the author name and institution on the title slide

### Requirement 5: Data Overview Slide

**User Story:** As a viewer, I want to understand what real-world data was used, so that I can assess the validity of the results.

#### Acceptance Criteria

1. THE Slides_Page SHALL display a Dataset_Card for the Elia Electricity dataset containing: the dataset name, the number of rounds (10,000), the number of forecasters (5), and a description of the data source (Belgian electricity load from Elia TSO)
2. THE Slides_Page SHALL display a Dataset_Card for the Elia Wind dataset containing: the dataset name, the number of rounds (17,544), the number of forecasters (5), and a description of the data source (Belgian wind power generation from Elia TSO)
3. THE Slides_Page SHALL explain that both datasets use the same 5 forecaster models

### Requirement 6: Forecaster Explanation Slides

**User Story:** As a viewer, I want detailed explanations of each forecasting method, so that I understand the models being compared.

#### Acceptance Criteria

1. THE Slides_Page SHALL display a Forecaster_Card for the Naive (last value) forecaster explaining: the method uses the most recent observed value as the forecast, it serves as a baseline with zero computational cost, and it performs well when the series is a random walk
2. THE Slides_Page SHALL display a Forecaster_Card for the Moving Average (20) forecaster explaining: the method averages the last 20 observations, it smooths short-term noise, and the window size of 20 balances responsiveness with stability
3. THE Slides_Page SHALL display a Forecaster_Card for the ARIMA(2, 1, 1) forecaster explaining: the method is an autoregressive integrated moving average model with parameters p=2, d=1, q=1, it captures linear temporal dependencies after differencing, and it is a classical statistical time-series model
4. THE Slides_Page SHALL display a Forecaster_Card for the XGBoost forecaster explaining: the method is a gradient-boosted decision tree ensemble, it captures non-linear patterns and feature interactions, and it is trained on lagged features of the target series
5. THE Slides_Page SHALL display a Forecaster_Card for the Neural Net (MLP) forecaster explaining: the method is a multi-layer perceptron with one or more hidden layers, it learns non-linear mappings from lagged inputs to forecasts, and it is the most flexible but also the most data-hungry model in the panel

### Requirement 7: Real-World Performance Slides

**User Story:** As a viewer, I want to see how the Skill × Stake mechanism performs on real data, so that I can evaluate its practical value.

#### Acceptance Criteria

1. THE Slides_Page SHALL load Comparison_Data from `data/real_data/elia_electricity/data/comparison.json` and display a Performance_Summary for the electricity dataset
2. THE Slides_Page SHALL load Comparison_Data from `data/real_data/elia_wind/data/comparison.json` and display a Performance_Summary for the wind dataset
3. WHEN Comparison_Data is loaded, THE Performance_Summary SHALL display the mean CRPS for each weighting method (uniform, skill, mechanism, best_single)
4. WHEN Comparison_Data is loaded, THE Performance_Summary SHALL display the delta CRPS versus equal weighting for each method
5. IF the Comparison_Data fails to load, THEN THE Slides_Page SHALL display a user-friendly error message in place of the Performance_Summary

### Requirement 8: Key Findings Slide

**User Story:** As a viewer, I want a summary of the key takeaways, so that I leave with a clear understanding of the thesis contributions.

#### Acceptance Criteria

1. THE Slides_Page SHALL display a Key Findings slide as the final slide
2. THE Slides_Page SHALL summarise that skill-weighted aggregation improves accuracy over equal weighting on real data
3. THE Slides_Page SHALL summarise that the mechanism (skill + stake) achieves the lowest CRPS among aggregation methods
4. THE Slides_Page SHALL summarise that equal weighting remains a strong baseline, especially on the electricity dataset where improvements are smaller

### Requirement 9: Visual Design Consistency

**User Story:** As a viewer, I want the slides to look clean and consistent with the rest of the dashboard, so that the presentation feels professional.

#### Acceptance Criteria

1. THE Slides_Page SHALL use the same Tailwind CSS design tokens (colours, spacing, typography) as the existing dashboard pages
2. THE Slides_Page SHALL use a white or light background for each slide with clear borders or spacing for visual separation
3. THE Slides_Page SHALL use the existing dashboard font stack and text size conventions (text-sm, text-xs for labels, text-lg or larger for headings)
