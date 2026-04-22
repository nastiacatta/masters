# presentation/R/plot_forecast_aggregation.R
# Forecast aggregation: CRPS improvement over time for different weighting methods.
#
# Run from project root:
#   Rscript presentation/R/plot_forecast_aggregation.R

source("presentation/R/theme_thesis.R")

library(dplyr)
library(tidyr)

# ---------------------------------------------------------------------------
# 1. Read data
# ---------------------------------------------------------------------------
data_dir <- file.path("dashboard", "public", "data", "experiments 2",
                       "forecast_aggregation", "data")

csv_path <- file.path(data_dir, "crps_timeseries.csv")

if (!file.exists(csv_path)) {
  stop(sprintf("Data file not found: %s", csv_path))
}

df <- read.csv(csv_path, stringsAsFactors = FALSE)

# ---------------------------------------------------------------------------
# 2. Validate data
# ---------------------------------------------------------------------------
expected_cols <- c("t", "crps_uniform_cum", "crps_deposit_cum",
                   "crps_skill_cum", "crps_mechanism_cum", "crps_best_single_cum")
validate_data(df, expected_cols, "crps_timeseries")

# ---------------------------------------------------------------------------
# 3. Prepare data — reshape cumulative CRPS to long format
# ---------------------------------------------------------------------------
df_long <- df %>%
  select(t, crps_uniform_cum, crps_deposit_cum,
         crps_skill_cum, crps_mechanism_cum, crps_best_single_cum) %>%
  pivot_longer(
    cols = -t,
    names_to = "method",
    values_to = "cum_crps"
  ) %>%
  mutate(
    method_label = case_when(
      method == "crps_uniform_cum"     ~ "Equal Weights",
      method == "crps_deposit_cum"     ~ "Deposit-Weighted",
      method == "crps_skill_cum"       ~ "Skill-Weighted",
      method == "crps_mechanism_cum"   ~ "Full Mechanism",
      method == "crps_best_single_cum" ~ "Best Single Forecaster",
      TRUE ~ method
    ),
    method_label = factor(method_label,
                          levels = c("Best Single Forecaster", "Full Mechanism",
                                     "Skill-Weighted", "Deposit-Weighted",
                                     "Equal Weights"))
  )

# Method colours
method_colours <- c(
  "Equal Weights"          = PALETTE$slate,
  "Deposit-Weighted"       = PALETTE$coral,
  "Skill-Weighted"         = PALETTE$purple,
  "Full Mechanism"         = PALETTE$teal,
  "Best Single Forecaster" = PALETTE$navy
)

# ---------------------------------------------------------------------------
# 4. Build the plot — cumulative CRPS over rounds
# ---------------------------------------------------------------------------
p <- ggplot(df_long, aes(x = t, y = cum_crps, colour = method_label)) +
  geom_line(linewidth = 1.0, alpha = 0.85, na.rm = TRUE) +
  scale_colour_manual(values = method_colours, name = "Weighting Method") +
  scale_y_continuous(labels = scales::number_format(accuracy = 0.001)) +
  labs(
    title = "Forecast Aggregation: Cumulative CRPS Over Time",
    subtitle = "Lower cumulative CRPS indicates better aggregate forecast quality",
    x = "Round",
    y = "Cumulative Mean CRPS"
  ) +
  theme_thesis() +
  theme(
    plot.subtitle = element_text(size = 14, colour = PALETTE$slate,
                                 margin = margin(b = 15)),
    legend.position = "right",
    legend.key.width = unit(1.5, "cm")
  )

# ---------------------------------------------------------------------------
# 5. Save to both output directories
# ---------------------------------------------------------------------------
save_dual(p, "forecast_aggregation.png")

message("Done: forecast_aggregation.png")
