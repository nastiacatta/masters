# presentation/R/plot_parameter_sweep.R
# Parameter sweep over skill-gate λ and σ_min.
#
# Chart type: heatmap (geom_raster) with viridis fill and per-cell text.
# Rationale: parameter sweeps over a small 2D grid (5×5) are the
# canonical use of a heatmap — the eye reads both the x-axis factor
# level and the colour encoding the metric simultaneously. The
# previous PNG used a two-colour light-grey → pink gradient that
# (a) is not perceptually uniform, (b) is hard to read in greyscale,
# and (c) puts high values at "pink" rather than the conventional
# dark end. Switching to viridis with direction = -1 inverts that so
# dark = worse and adds colourblind safety. Per-cell text labels mean
# the reader never has to eyeball the colour bar.
#
# Run from project root:
#   Rscript presentation/R/plot_parameter_sweep.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
})

# ---------------------------------------------------------------------------
# 1. Load data — tolerate either experiments folder and either filename
# ---------------------------------------------------------------------------
candidates <- c(
  "dashboard/public/data/experiments/parameter_sweep/data/sweep.csv",
  "dashboard/public/data/experiments 2/parameter_sweep/data/sweep.csv",
  "dashboard/public/data/experiments/parameter_sweep/data/parameter_sweep.csv",
  "dashboard/public/data/experiments 2/parameter_sweep/data/parameter_sweep.csv",
  "onlinev2/outputs_final/core/experiments/parameter_sweep/data/sweep.csv",
  "onlinev2/outputs_final/core/experiments/parameter_sweep/data/parameter_sweep.csv"
)
csv_path <- candidates[file.exists(candidates)][1]
if (is.na(csv_path)) stop("parameter_sweep data not found in any known path.")

df <- read.csv(csv_path, stringsAsFactors = FALSE)
validate_data(df, c("lam", "sigma_min", "mean_crps"), "parameter_sweep")

# ---------------------------------------------------------------------------
# 2. Shape — treat both axes as ordered factors (grid is not evenly spaced)
# ---------------------------------------------------------------------------
df <- df |>
  mutate(
    lam_f       = factor(lam,       levels = sort(unique(lam))),
    sigma_min_f = factor(sigma_min, levels = sort(unique(sigma_min)))
  )

crps_range <- range(df$mean_crps, na.rm = TRUE)

# Label colour — white on dark tiles, dark on light tiles
label_colour_for <- function(vals, vmin, vmax) {
  t <- (vals - vmin) / (vmax - vmin + 1e-12)
  # Viridis with direction = -1 means low values are LIGHT (yellow end)
  # and high values are DARK (purple end). So invert.
  ifelse(t < 0.55, "grey15", "white")
}
df$crps_label_col <- label_colour_for(df$mean_crps, crps_range[1], crps_range[2])

# Highlight the best tile
best_idx <- which.min(df$mean_crps)
df$is_best <- seq_len(nrow(df)) == best_idx

# ---------------------------------------------------------------------------
# 3. Plot — CRPS heatmap
# ---------------------------------------------------------------------------
p <- ggplot(df, aes(x = lam_f, y = sigma_min_f, fill = mean_crps)) +
  geom_raster() +
  # Per-cell numeric label
  geom_text(
    aes(label = sprintf("%.4f", mean_crps),
        colour = crps_label_col),
    fontface = "bold", size = TYPO$annot_small + 0.3,
    show.legend = FALSE
  ) +
  # Highlight the best cell
  geom_tile(
    data = df |> filter(is_best),
    fill = NA, colour = PALETTE$coral, linewidth = 1.2
  ) +
  geom_text(
    data = df |> filter(is_best),
    aes(label = "min"),
    nudge_y = 0.32, colour = PALETTE$coral,
    size = TYPO$annot_small, fontface = "italic",
    show.legend = FALSE
  ) +
  scale_fill_viridis_c(
    name = "Mean CRPS",
    option = "viridis",
    direction = -1,
    labels = scales::number_format(accuracy = 0.0001),
    guide = guide_colourbar(barheight = unit(6, "cm"),
                            barwidth = unit(0.4, "cm"),
                            ticks.colour = "white",
                            frame.colour = NA)
  ) +
  scale_colour_identity() +
  coord_fixed() +
  labs(
    x = expression(bold("Skill-gate floor") ~ lambda),
    y = expression(bold("Skill floor") ~ sigma[min]),
    caption = "Lower is better. Red outline marks the minimum-CRPS cell."
  ) +
  theme_thesis() +
  theme(
    panel.grid = element_blank(),
    axis.text  = element_text(face = "bold", size = TYPO$axis_text),
    legend.position = "right"
  )

save_dual(p, "parameter_sweep.png", width = 12, height = 9)
message("Done: parameter_sweep.png")
