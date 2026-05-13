# presentation/R/plot_recalibration_reliability.R
# Side-by-side reliability diagrams: mechanism aggregate BEFORE vs AFTER
# rolling isotonic recalibration, on the Elia wind audit slice.
#
# Reads:
#   onlinev2/outputs/audit_per_quantile/coverage_recal.json
#
# Writes:
#   dashboard/public/presentation-plots/recalibration_reliability.png
#   writing/figures/calibration.png  (thesis copy)

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(tidyr)
  library(jsonlite)
  library(patchwork)
  library(ggrepel)
})

path <- "onlinev2/outputs/audit_per_quantile/coverage_recal.json"
if (!file.exists(path)) stop(sprintf("Missing %s", path))

j <- fromJSON(path)

df <- tibble::tibble(
  tau             = j$taus,
  nominal         = j$nominal,
  mech_coverage   = j$mech_coverage,
  recal_coverage  = j$recal_coverage
) |>
  mutate(
    mech_dev  = mech_coverage  - tau,
    recal_dev = recal_coverage - tau
  )

make_panel <- function(df, coverage_col, dev_col, title_text, subtitle_text) {
  df2 <- df |>
    mutate(
      p_hat     = .data[[coverage_col]],
      deviation = .data[[dev_col]],
      point_col = case_when(
        abs(deviation) < 0.01 ~ PALETTE$teal,
        deviation < 0         ~ PALETTE$coral,
        TRUE                  ~ PALETTE$purple
      ),
      dev_label = sprintf("%+.3f", deviation)
    )

  ggplot(df2, aes(x = tau, y = p_hat)) +
    geom_abline(slope = 1, intercept = 0,
                colour = PALETTE$slate, linetype = "dashed", linewidth = 0.55) +
    geom_polygon(
      data = data.frame(
        x = c(0, 1, 1, 0),
        y = c(-0.05, 0.95, 1.05, 0.05)
      ),
      aes(x = x, y = y),
      fill = PALETTE$slate, alpha = 0.08, inherit.aes = FALSE
    ) +
    geom_point(aes(fill = point_col),
               shape = 21, size = 6, colour = "white", stroke = 1.2) +
    geom_text_repel(
      aes(label = dev_label, colour = point_col),
      size = TYPO$annot_small, fontface = "bold",
      nudge_x = 0.045, direction = "y",
      segment.colour = PALETTE$slate, segment.alpha = 0.45,
      min.segment.length = 0,
      box.padding = 0.2, point.padding = 0.18,
      seed = 1, max.overlaps = Inf
    ) +
    scale_fill_identity() +
    scale_colour_identity() +
    scale_x_continuous(
      limits = c(0, 1),
      breaks = seq(0, 1, 0.25),
      expand = expansion(mult = c(0.02, 0.12))
    ) +
    scale_y_continuous(
      limits = c(0, 1),
      breaks = seq(0, 1, 0.25)
    ) +
    coord_fixed(ratio = 1) +
    labs(
      x = expression(bold("Nominal quantile") ~ (tau)),
      y = expression(bold("Empirical coverage") ~ (hat(p)(tau))),
      subtitle = subtitle_text
    ) +
    theme_thesis(base_size = 14) +
    theme(
      plot.subtitle = subtitle_element(),
      plot.margin   = margin(16, 18, 14, 16)
    ) +
    ggtitle(title_text)
}

p_before <- make_panel(
  df, "mech_coverage", "mech_dev",
  "Before recalibration",
  sprintf("tail dev = %.3f,  centre dev = %.3f",
          j$mech_tail_dev, j$mech_centre_dev)
)

p_after <- make_panel(
  df, "recal_coverage", "recal_dev",
  "After rolling isotonic recalibration",
  sprintf("tail dev = %.3f,  centre dev = %.3f",
          j$recal_tail_dev, j$recal_centre_dev)
)

p_final <- p_before + p_after +
  plot_layout(widths = c(1, 1))

save_dual(p_final, "recalibration_reliability.png",
          width = 16, height = 8)

# Also drop into writing/figures/ so the thesis picks it up in-place.
if (!dir.exists("writing/figures")) dir.create("writing/figures", recursive = TRUE)
ggsave("writing/figures/calibration.png", plot = p_final,
       width = 16, height = 8, dpi = 300, bg = "white")
message("Saved: writing/figures/calibration.png")
message("Done: recalibration_reliability.png")
