# presentation/R/plot_baseline_comparison.R
# -----------------------------------------------------------------------------
# Benchmark CRPS comparison: Raja (history-free) and Vitali (OGD on simplex)
# alongside the project's mechanism on Elia wind and electricity.
#
# Layout: side-by-side
#   Left (75%):  Rolling mean CRPS line chart (wind only) with direct labels
#   Right (25%): Compact bar chart showing % change (wind only, vertical)
#
# Reads:
#   presentation/plots/data/baseline_comparison_{elia_wind,elia_electricity}.csv
#   presentation/plots/data/baseline_rolling_{elia_wind,elia_electricity}.csv
#
# Writes:
#   presentation/plots/baseline_comparison.png
#   dashboard/public/presentation-plots/baseline_comparison.png
#
# Usage (from repo root):
#   Rscript presentation/R/plot_baseline_comparison.R
# -----------------------------------------------------------------------------

suppressPackageStartupMessages({
  library(ggplot2)
  library(dplyr)
  library(tidyr)
  library(patchwork)
  library(scales)
})

source("presentation/R/theme_thesis.R")

# --- Method labels + colours ------------------------------------------------
METHOD_LABELS <- c(
  uniform                 = "Equal weights\n(baseline)",
  raja_history_free       = "Raja et al.\n(history-free, Lambert)",
  vitali_ogd_per_quantile = "Vitali & Pinson\n(OGD on simplex)",
  mechanism               = "This project\n(skill + self-financed)"
)

# Short labels for direct annotation on the rolling chart
METHOD_SHORT <- c(
  uniform                 = "Equal weights",
  raja_history_free       = "Raja et al.",
  vitali_ogd_per_quantile = "Vitali & Pinson",
  mechanism               = "This project"
)

METHOD_COLOURS <- c(
  uniform                 = PALETTE$slate,
  raja_history_free       = PALETTE$imperial,
  vitali_ogd_per_quantile = PALETTE$purple,
  mechanism               = PALETTE$coral
)

SERIES_LABELS <- c(
  elia_wind        = "Elia offshore wind  (T = 17 544)",
  elia_electricity = "Elia imbalance prices  (T = 10 000)"
)

# --- Load summaries ---------------------------------------------------------
load_summary <- function(series) {
  path <- sprintf("presentation/plots/data/baseline_comparison_%s.csv", series)
  if (!file.exists(path)) stop(sprintf("Missing %s", path))
  df <- read.csv(path, stringsAsFactors = FALSE)
  df$series <- series
  df$method <- factor(df$method, levels = names(METHOD_LABELS))
  df
}

load_rolling <- function(series) {
  path <- sprintf("presentation/plots/data/baseline_rolling_%s.csv", series)
  if (!file.exists(path)) stop(sprintf("Missing %s", path))
  df <- read.csv(path, stringsAsFactors = FALSE)
  df$series <- series
  df$method <- factor(df$method, levels = names(METHOD_LABELS))
  df
}

wind_sum <- load_summary("elia_wind")

# --- Panel A (right): compact bar chart — wind only, vertical ---------------
bars_df <- wind_sum %>%
  mutate(
    method_label = METHOD_LABELS[as.character(method)]
  )

panel_A <- ggplot(bars_df, aes(x = method, y = pct_vs_uniform, fill = method)) +
  geom_col(width = 0.72, alpha = 0.92) +
  geom_hline(yintercept = 0, colour = PALETTE$charcoal, linewidth = 0.4) +
  coord_flip() +
  scale_fill_manual(values = METHOD_COLOURS, labels = METHOD_LABELS, guide = "none") +
  scale_x_discrete(labels = METHOD_LABELS) +
  scale_y_continuous(expand = expansion(mult = c(0.14, 0.22))) +
  labs(
    title = NULL,
    subtitle = "Elia wind — % change in CRPS",
    x = NULL,
    y = "% change in CRPS"
  ) +
  theme_thesis(base_size = 14) +
  theme(
    plot.subtitle  = element_text(size = 13, face = "bold", colour = PALETTE$navy,
                                  margin = margin(0, 0, 8, 0)),
    axis.text.x    = element_text(size = 10),
    axis.text.y    = element_text(size = 10, lineheight = 0.85),
    axis.title.x   = element_text(size = 11),
    plot.margin    = margin(8, 12, 4, 8)
  )

# --- Panel B (left): rolling CRPS on wind with direct labels ----------------
roll_wind <- load_rolling("elia_wind")

# Get the last data point for each method for direct labelling
# Nudge overlapping labels apart (Equal Weights ≈ 0.073, Raja ≈ 0.071)
label_df <- roll_wind %>%
  group_by(method) %>%
  filter(t == max(t)) %>%
  ungroup() %>%
  mutate(label = METHOD_SHORT[as.character(method)]) %>%
  arrange(desc(crps)) %>%
  mutate(
    nudged_y = case_when(
      method == "uniform"           ~ crps + 0.003,
      method == "raja_history_free" ~ crps - 0.003,
      TRUE                          ~ crps
    )
  )

panel_B <- ggplot(roll_wind, aes(x = t, y = crps, colour = method)) +
  geom_line(linewidth = 0.9, alpha = 0.95) +
  geom_segment(
    data = label_df %>% filter(method %in% c("uniform", "raja_history_free")),
    aes(x = t, xend = t + 200, y = crps, yend = nudged_y, colour = method),
    linewidth = 0.4, linetype = "dotted", show.legend = FALSE
  ) +
  geom_text(
    data = label_df,
    aes(x = t, y = nudged_y, label = label, colour = method),
    hjust = -0.05, vjust = 0.35, size = 5.5, fontface = "bold",
    show.legend = FALSE
  ) +
  scale_colour_manual(values = METHOD_COLOURS, labels = METHOD_LABELS, guide = "none") +
  scale_x_continuous(expand = expansion(mult = c(0.02, 0.22))) +
  labs(
    title = NULL,
    subtitle = "Elia wind — rolling mean CRPS over time",
    x = "Round t",
    y = "Rolling mean CRPS"
  ) +
  theme_thesis(base_size = 16) +
  theme(
    plot.subtitle  = element_text(size = 15, face = "bold", colour = PALETTE$navy,
                                  margin = margin(0, 0, 8, 0)),
    legend.position = "none"
  )

# --- Combine: rolling chart only (full width) ------------------------------
save_dual(panel_B, "baseline_comparison.png", width = 16, height = 9, dpi = 300)
