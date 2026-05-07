# presentation/R/plot_calibration_reliability.R
# Calibration reliability diagram: empirical coverage p_hat vs nominal
# quantile level tau, with 95% CIs across seeds.
#
# Chart type: reliability diagram (scatter + diagonal) — standard and
# appropriate here, but re-themed for slide consistency.
# Rationale: the existing calibration PNG was produced by matplotlib
# with default styling, which does not match the rest of the slide
# deck. The *chart type* is correct (scatter vs diagonal is the
# canonical reliability diagram), so we keep it and just redo the
# styling (typography, colour palette, deviation annotations) in the
# shared thesis theme. Adding the signed deviation labels next to each
# point makes the under-dispersion pattern in the tails immediately
# readable instead of requiring the reader to eyeball it against the
# diagonal.
#
# Run from project root:
#   Rscript presentation/R/plot_calibration_reliability.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(ggrepel)
})

# ---------------------------------------------------------------------------
# 1. Load data — prefer the multi-seed summary, fall back to single run
# ---------------------------------------------------------------------------
candidates <- c(
  "onlinev2/outputs_final/core/experiments/calibration/data/reliability.csv",
  "dashboard/public/data/experiments/calibration/data/reliability.csv",
  "dashboard/public/data/experiments 2/calibration/data/reliability.csv"
)
csv_path <- candidates[file.exists(candidates)][1]
if (is.na(csv_path)) stop("No reliability.csv found.")

df <- read.csv(csv_path, stringsAsFactors = FALSE)

# Support both schemas: the multi-seed summary (p_hat_mean, p_hat_se, ...)
# and the simpler single-seed file (p_hat, n_valid).
if ("p_hat_mean" %in% names(df)) {
  df <- df |>
    mutate(
      p_hat = p_hat_mean,
      ci_lo = p_hat_ci_low,
      ci_hi = p_hat_ci_high
    )
} else if ("p_hat" %in% names(df)) {
  df <- df |>
    mutate(ci_lo = NA_real_, ci_hi = NA_real_)
} else {
  stop("reliability.csv has neither p_hat_mean nor p_hat column.")
}

df <- df |>
  arrange(tau) |>
  mutate(
    deviation = p_hat - tau,
    dev_label = sprintf("%+.3f", deviation),
    point_col = case_when(
      abs(deviation) < 0.01 ~ PALETTE$teal,
      deviation < 0         ~ PALETTE$coral,   # under-coverage
      TRUE                  ~ PALETTE$purple   # over-coverage
    )
  )

caption_text <- sprintf(
  "Median %s-calibrated; tails under-disperse by up to %.0f pp",
  "\u03C4 = 0.5",
  max(abs(df$deviation)) * 100
)

# ---------------------------------------------------------------------------
# 2. Plot
# ---------------------------------------------------------------------------
p <- ggplot(df, aes(x = tau, y = p_hat)) +
  # Perfect-calibration diagonal
  geom_abline(slope = 1, intercept = 0,
              colour = PALETTE$slate, linetype = "dashed", linewidth = 0.55) +
  # Tolerance band (+/- 5 pp) to anchor "close to diagonal"
  geom_polygon(
    data = data.frame(
      x = c(0, 1, 1, 0),
      y = c(-0.05, 0.95, 1.05, 0.05)
    ),
    aes(x = x, y = y),
    fill = PALETTE$slate, alpha = 0.08, inherit.aes = FALSE
  ) +
  # 95% CI error bars (if available)
  geom_errorbar(
    aes(ymin = ci_lo, ymax = ci_hi),
    width = 0.02, linewidth = 0.6, colour = PALETTE$charcoal,
    alpha = 0.7, na.rm = TRUE
  ) +
  # Points
  geom_point(
    aes(fill = point_col),
    shape = 21, size = 7, colour = "white", stroke = 1.4
  ) +
  # Signed deviation label to the right of each point — use ggrepel to
  # avoid collisions when consecutive tau values are close together.
  geom_text_repel(
    aes(label = dev_label, colour = point_col),
    size = TYPO$annot_small, fontface = "bold",
    nudge_x = 0.04, direction = "y",
    segment.colour = PALETTE$slate, segment.alpha = 0.5,
    min.segment.length = 0,
    box.padding = 0.25, point.padding = 0.2,
    seed = 1, max.overlaps = Inf
  ) +
  scale_fill_identity() +
  scale_colour_identity() +
  scale_x_continuous(
    limits = c(0, 1),
    breaks = seq(0, 1, 0.25),
    expand = expansion(mult = c(0.02, 0.10))
  ) +
  scale_y_continuous(
    limits = c(0, 1),
    breaks = seq(0, 1, 0.25)
  ) +
  coord_fixed(ratio = 1) +
  annotate("text", x = 0.02, y = 0.97,
           label = "perfect calibration",
           hjust = 0, size = TYPO$annot_small, fontface = "italic",
           colour = PALETTE$slate) +
  labs(
    x = expression(bold("Nominal quantile") ~ (tau)),
    y = expression(bold("Empirical coverage") ~ (hat(p)(tau))),
    caption = caption_text
  ) +
  theme_thesis()

save_dual(p, "calibration_reliability.png", width = 12, height = 12)
message("Done: calibration_reliability.png")
