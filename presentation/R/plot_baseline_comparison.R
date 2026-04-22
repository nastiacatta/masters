# presentation/R/plot_baseline_comparison.R
# -----------------------------------------------------------------------------
# Benchmark CRPS comparison: Raja (history-free) and Vitali (OGD on simplex)
# alongside the thesis mechanism on Elia wind and electricity.
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
  mechanism               = "This thesis\n(skill + self-financed)"
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
elec_sum <- load_summary("elia_electricity")

# --- Panel A: headline bars (% vs equal weights, per dataset) --------------
bars_df <- bind_rows(wind_sum, elec_sum) %>%
  mutate(
    series = factor(series, levels = names(SERIES_LABELS), labels = SERIES_LABELS),
    pct_text = sprintf("%+.1f%%", pct_vs_uniform)
  )

panel_A <- ggplot(bars_df, aes(x = method, y = pct_vs_uniform, fill = method)) +
  geom_col(width = 0.72, alpha = 0.92) +
  geom_hline(yintercept = 0, colour = PALETTE$charcoal, linewidth = 0.4) +
  # Short bars: label above the zero line (dark text).  Tall bars: label inside (white).
  geom_text(
    data = . %>% filter(abs(pct_vs_uniform) >= 8),
    aes(y = pct_vs_uniform / 2, label = pct_text),
    size = 5.2, fontface = "bold", colour = "white"
  ) +
  geom_text(
    data = . %>% filter(abs(pct_vs_uniform) < 8),
    aes(y = 0, label = pct_text),
    vjust = -0.8, size = 5.0, fontface = "bold", colour = PALETTE$charcoal
  ) +
  facet_wrap(~ series, scales = "free_y") +
  scale_fill_manual(values = METHOD_COLOURS, labels = METHOD_LABELS, guide = "none") +
  scale_x_discrete(labels = METHOD_LABELS) +
  scale_y_continuous(expand = expansion(mult = c(0.14, 0.22))) +
  labs(
    title = "Mean CRPS relative to equal-weights baseline",
    subtitle = "Lower is better.  Bars report percentage change in CRPS against the uniform aggregate on the same forecasts.",
    x = NULL,
    y = "% change in CRPS"
  ) +
  theme_thesis(base_size = 16) +
  theme(
    axis.text.x   = element_text(size = 12, lineheight = 0.9),
    strip.text    = element_text(size = 15, face = "bold", colour = PALETTE$navy),
    panel.spacing = unit(1.6, "lines")
  )

# --- Panel B: rolling CRPS on wind (most legible series) -------------------
roll_wind <- load_rolling("elia_wind")
panel_B <- ggplot(roll_wind, aes(x = t, y = crps, colour = method)) +
  geom_line(linewidth = 0.9, alpha = 0.95) +
  scale_colour_manual(values = METHOD_COLOURS, labels = METHOD_LABELS) +
  labs(
    title = "Rolling CRPS on Elia wind (window = T / 100)",
    subtitle = "How each design tracks forecast accuracy over the full 2-year series.",
    x = "Round t",
    y = "Rolling mean CRPS",
    colour = NULL
  ) +
  theme_thesis(base_size = 16) +
  theme(
    legend.position = "bottom",
    legend.text     = element_text(lineheight = 0.9)
  )

combo <- panel_A / panel_B + plot_layout(heights = c(1, 1.1)) +
  plot_annotation(
    title = "Benchmark comparison on real Elia data",
    subtitle = paste0(
      "Same 7-forecaster panel, same quantile reports, same warm-up (200).  ",
      "The thesis mechanism retains Lambert's seven economic properties; Vitali & Pinson does not."
    ),
    theme = theme(
      plot.title    = element_text(size = 22, face = "bold", colour = PALETTE$navy),
      plot.subtitle = element_text(size = 14, colour = PALETTE$slate)
    )
  )

save_dual(combo, "baseline_comparison.png", width = 16, height = 11, dpi = 300)
