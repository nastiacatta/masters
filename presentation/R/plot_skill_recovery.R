# presentation/R/plot_skill_recovery.R
# Skill recovery: true noise level (tau) vs learned skill (sigma_tail).
# Slide 9 (Synthetic Validation: Convergence).
#
# Chart type: scatter with a loess guidance curve (no straight-line
# interpolation between observations).
# Rationale: we have six forecasters sampled at discrete tau values and
# the relationship is a smooth monotonic decay. A straight line between
# consecutive tau points implies linearity that the data do not claim;
# the statistical claim is the Spearman rho across seeds, which is
# reported in the caption. A light loess curve communicates the shape
# without overclaiming, and labelled points make each forecaster
# individually readable.
#
# Run from project root:
#   Rscript presentation/R/plot_skill_recovery.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(ggrepel)
})

# ---------------------------------------------------------------------------
# 1. Locate data — tolerate either "experiments" or "experiments 2"
# ---------------------------------------------------------------------------
candidates <- c(
  "dashboard/public/data/experiments/skill_recovery/data",
  "dashboard/public/data/experiments 2/skill_recovery/data"
)
data_dir <- candidates[file.exists(file.path(candidates, "quantiles_crps_summary.csv"))][1]
if (is.na(data_dir)) {
  stop("Could not find quantiles_crps_summary.csv in either experiments folder.")
}

df_summary <- read.csv(file.path(data_dir, "quantiles_crps_summary.csv"),
                       stringsAsFactors = FALSE)
df_seeds   <- read.csv(file.path(data_dir, "quantiles_crps_seeds.csv"),
                       stringsAsFactors = FALSE)

validate_data(df_summary,
              c("forecaster", "tau_true", "mean_loss_tail", "mean_sigma_tail"),
              "quantiles_crps_summary")
validate_data(df_seeds, c("seed", "corr_loss", "corr_sigma"),
              "quantiles_crps_seeds")

# ---------------------------------------------------------------------------
# 2. Prepare point data + smooth guidance curve
# ---------------------------------------------------------------------------
df_summary <- df_summary |>
  arrange(tau_true) |>
  mutate(forecaster_label = paste0("F", forecaster))

# Rank correlation across seeds — the statistical claim
mean_rho <- mean(df_seeds$corr_sigma, na.rm = TRUE)
rho_label <- sprintf("Spearman \u03C1(\u03C3_learned, \u03C3_true) = %.3f across %d seeds",
                     mean_rho, nrow(df_seeds))

# Loess smooth across a dense grid — for visual shape only
smooth_x  <- seq(min(df_summary$tau_true),
                 max(df_summary$tau_true),
                 length.out = 200)
loess_fit <- loess(mean_sigma_tail ~ tau_true,
                   data = df_summary, span = 1.0)
df_smooth <- data.frame(
  tau_true  = smooth_x,
  sigma_hat = predict(loess_fit, newdata = data.frame(tau_true = smooth_x))
)

point_fill <- colorRampPalette(c(PALETTE$teal, PALETTE$coral))(nrow(df_summary))

# ---------------------------------------------------------------------------
# 3. Plot
# ---------------------------------------------------------------------------
p <- ggplot(df_summary, aes(x = tau_true, y = mean_sigma_tail)) +
  # Faint monotone guidance curve behind the points
  geom_line(
    data = df_smooth,
    aes(x = tau_true, y = sigma_hat),
    colour = PALETTE$teal, linewidth = 1.0, alpha = 0.5
  ) +
  # Points, one per forecaster
  geom_point(aes(fill = factor(forecaster)),
             shape = 21, size = 8, colour = "white", stroke = 1.5,
             show.legend = FALSE) +
  # Combined F-id + sigma label, repelled so nothing collides with
  # neighbouring points (F0..F2 are at tau = 0.15, 0.22, 0.32 — very close).
  geom_label_repel(
    aes(label = sprintf("%s\n\u03C3 = %.3f",
                        forecaster_label, mean_sigma_tail)),
    size        = TYPO$annot_small + 0.3,
    fontface    = "bold",
    colour      = PALETTE$charcoal,
    fill        = "white",
    label.size  = 0,
    label.padding = unit(0.3, "lines"),
    seed        = 1,
    segment.colour = PALETTE$slate,
    segment.alpha  = 0.6,
    box.padding = 0.6,
    point.padding = 0.5,
    nudge_y     = 0.035,
    min.segment.length = 0,
    direction = "both",
    max.overlaps = Inf
  ) +
  scale_fill_manual(values = setNames(point_fill, df_summary$forecaster)) +
  scale_x_continuous(
    breaks = c(0.15, 0.22, 0.32, 0.46, 0.68, 1.00),
    labels = function(b) sprintf("%.2f", b),
    minor_breaks = NULL,
    expand = expansion(mult = c(0.08, 0.08))
  ) +
  scale_y_continuous(
    labels = scales::number_format(accuracy = 0.01),
    expand = expansion(mult = c(0.15, 0.15))
  ) +
  labs(
    x = expression(bold("True noise level") ~ tau[true]),
    y = expression(bold("Learned skill") ~ bar(sigma)[tail]),
    caption = rho_label
  ) +
  theme_thesis_grid()

# ---------------------------------------------------------------------------
# 4. Save
# ---------------------------------------------------------------------------
save_dual(p, "quantiles_crps_recovery.png", width = 14, height = 8)
message("Done: quantiles_crps_recovery.png")
