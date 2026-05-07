# presentation/R/plot_baseline_comparison.R
# -----------------------------------------------------------------------------
# Benchmark CRPS on Elia wind: equal weights, Raja (history-free),
# Vitali (OGD on simplex) and this project's mechanism.
#
# Output: a single rolling-mean CRPS chart with direct end-of-line labels.
#
# Reads:
#   presentation/plots/data/baseline_comparison_elia_wind.csv
#   presentation/plots/data/baseline_rolling_elia_wind.csv
#
# Writes:
#   presentation/plots/baseline_comparison.png
#   dashboard/public/presentation-plots/baseline_comparison.png
#
# Usage (from repo root):
#   Rscript presentation/R/plot_baseline_comparison.R
# -----------------------------------------------------------------------------

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(ggrepel)
})

# ---------------------------------------------------------------------------
# Labels + colours
# ---------------------------------------------------------------------------
METHOD_LABELS <- c(
  uniform                 = "Equal weights",
  raja_history_free       = "Raja et al.",
  vitali_ogd_per_quantile = "Vitali & Pinson",
  mechanism               = "This project"
)

# ---------------------------------------------------------------------------
# Load rolling series
# ---------------------------------------------------------------------------
rolling_path <- "presentation/plots/data/baseline_rolling_elia_wind.csv"
if (!file.exists(rolling_path)) {
  stop(sprintf("Missing %s — run scripts/run_baseline_comparison.py first.",
               rolling_path))
}
roll_wind <- read.csv(rolling_path, stringsAsFactors = FALSE) |>
  mutate(method = factor(method, levels = names(METHOD_LABELS)))

# ---------------------------------------------------------------------------
# Per-series headline deltas (for caption) — optional
# ---------------------------------------------------------------------------
sum_path <- "presentation/plots/data/baseline_comparison_elia_wind.csv"
caption_text <- NULL
if (file.exists(sum_path)) {
  wind_sum <- read.csv(sum_path, stringsAsFactors = FALSE)
  if (all(c("method", "pct_vs_uniform") %in% names(wind_sum))) {
    caption_text <- wind_sum |>
      filter(method != "uniform") |>
      mutate(label = sprintf("%s: %+.1f%%",
                             METHOD_LABELS[method], pct_vs_uniform)) |>
      pull(label) |>
      paste(collapse = "  \u2022  ")
    caption_text <- paste0("Mean CRPS vs equal weights on Elia wind  \u2014  ",
                           caption_text)
  }
}

# ---------------------------------------------------------------------------
# End-of-line labels (with small vertical nudges to avoid overlap)
# ---------------------------------------------------------------------------
label_df <- roll_wind |>
  group_by(method) |>
  filter(t == max(t)) |>
  ungroup() |>
  mutate(label = METHOD_LABELS[as.character(method)]) |>
  arrange(desc(crps))

# ---------------------------------------------------------------------------
# Plot
# ---------------------------------------------------------------------------
# Lower-is-better cue on the y-axis — use an arrow in the axis title.
y_title <- expression(bold("Rolling mean CRPS") ~ (downarrow ~ "lower is better"))

p <- ggplot(roll_wind, aes(x = t, y = crps, colour = method)) +
  geom_line(linewidth = 1.0, alpha = 0.95) +
  geom_point(data = label_df, aes(x = t, y = crps, colour = method),
             size = 2.4, show.legend = FALSE) +
  geom_text_repel(
    data        = label_df,
    aes(x = t, y = crps, label = label, colour = method),
    hjust       = 0,
    direction   = "y",
    nudge_x     = max(roll_wind$t, na.rm = TRUE) * 0.025,
    segment.colour = PALETTE$border,
    segment.alpha  = 0.7,
    size        = TYPO$annot_med,
    fontface    = "bold",
    seed        = 1,
    show.legend = FALSE,
    box.padding = 0.55,
    point.padding = 0.35,
    min.segment.length = 0,
    force = 2,
    max.overlaps = Inf,
    xlim        = c(max(roll_wind$t, na.rm = TRUE) * 1.015, NA)
  ) +
  scale_colour_manual(values = METHOD_COLOURS, guide = "none") +
  scale_x_continuous(
    expand = expansion(mult = c(0.02, 0.26)),
    labels = scales::label_number(big.mark = ",")
  ) +
  scale_y_continuous(labels = scales::number_format(accuracy = 0.001)) +
  labs(
    x = "Round t",
    y = y_title,
    caption = caption_text
  ) +
  theme_thesis()

# ---------------------------------------------------------------------------
# Save
# ---------------------------------------------------------------------------
save_dual(p, "baseline_comparison.png", width = 16, height = 9)
message("Done: baseline_comparison.png")
