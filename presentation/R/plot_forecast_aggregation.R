# presentation/R/plot_forecast_aggregation.R
# Cumulative CRPS over time for different weighting methods.
#
# Run from project root:
#   Rscript presentation/R/plot_forecast_aggregation.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(tidyr)
  library(ggrepel)
})

# ---------------------------------------------------------------------------
# 1. Load data — tolerate either experiments folder
# ---------------------------------------------------------------------------
candidates <- c(
  "dashboard/public/data/experiments/forecast_aggregation/data",
  "dashboard/public/data/experiments 2/forecast_aggregation/data"
)
data_dir <- candidates[file.exists(file.path(candidates, "crps_timeseries.csv"))][1]
if (is.na(data_dir)) stop("forecast_aggregation CRPS timeseries not found.")

df <- read.csv(file.path(data_dir, "crps_timeseries.csv"),
               stringsAsFactors = FALSE)

expected_cols <- c("t", "crps_uniform_cum", "crps_deposit_cum",
                   "crps_skill_cum", "crps_mechanism_cum",
                   "crps_best_single_cum")
validate_data(df, expected_cols, "crps_timeseries")

# ---------------------------------------------------------------------------
# 2. Reshape
# ---------------------------------------------------------------------------
method_map <- c(
  crps_uniform_cum     = "Equal weights",
  crps_deposit_cum     = "Deposit-weighted",
  crps_skill_cum       = "Skill-weighted",
  crps_mechanism_cum   = "Full mechanism",
  crps_best_single_cum = "Best single"
)

method_levels <- c("Best single", "Full mechanism", "Skill-weighted",
                   "Deposit-weighted", "Equal weights")

df_long <- df |>
  select(t, all_of(names(method_map))) |>
  pivot_longer(-t, names_to = "method_key", values_to = "cum_crps") |>
  mutate(method_label = factor(method_map[method_key], levels = method_levels))

method_colour_map <- c(
  "Equal weights"    = PALETTE$slate,
  "Deposit-weighted" = PALETTE$coral,
  "Skill-weighted"   = PALETTE$purple,
  "Full mechanism"   = PALETTE$teal,
  "Best single"      = PALETTE$navy
)

# ---------------------------------------------------------------------------
# 3. End-of-line labels
# ---------------------------------------------------------------------------
label_df <- df_long |>
  group_by(method_label) |>
  filter(t == max(t)) |>
  ungroup()

# ---------------------------------------------------------------------------
# 4. Plot
# ---------------------------------------------------------------------------
p <- ggplot(df_long, aes(x = t, y = cum_crps, colour = method_label)) +
  geom_line(linewidth = 1.0, alpha = 0.92, na.rm = TRUE) +
  geom_point(data = label_df, size = 2.2, show.legend = FALSE) +
  geom_text_repel(
    data        = label_df,
    aes(label = method_label),
    hjust       = 0,
    direction   = "y",
    nudge_x     = max(df_long$t, na.rm = TRUE) * 0.02,
    segment.alpha = 0.6,
    size        = TYPO$annot_med,
    fontface    = "bold",
    show.legend = FALSE,
    seed        = 1,
    min.segment.length = 0,
    box.padding = 0.5,
    point.padding = 0.3,
    max.overlaps = Inf,
    force = 2,
    xlim        = c(max(df_long$t, na.rm = TRUE) * 1.01, NA)
  ) +
  scale_colour_manual(values = method_colour_map, guide = "none") +
  scale_x_continuous(
    expand = expansion(mult = c(0.02, 0.26)),
    labels = scales::label_number(big.mark = ",")
  ) +
  scale_y_continuous(labels = scales::number_format(accuracy = 0.001)) +
  labs(
    x = "Round t",
    y = expression(bold("Cumulative mean CRPS") ~ (downarrow ~ "lower is better"))
  ) +
  theme_thesis()

save_dual(p, "forecast_aggregation.png", width = 16, height = 9)
message("Done: forecast_aggregation.png")
