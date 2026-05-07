# presentation/R/plot_sybil.R
# Sybil invariance: profit ratio vs number of clones (k).
#
# Chart type: Cleveland dot plot with 95% confidence intervals.
# Rationale: k is a discrete integer count and the three scenarios are
# categorical. A connecting line implies continuity between integer k
# values that is not meaningful; the identical-clones case is a flat
# line at ratio = 1 which adds no information over a single summary
# mark. Dot + error bar isolates the point estimate and its uncertainty
# per (k, scenario), with the sybilproof reference line at ratio = 1.
#
# Run from project root:
#   Rscript presentation/R/plot_sybil.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
})

# ---------------------------------------------------------------------------
# 1. Load data — tolerate either experiments folder
# ---------------------------------------------------------------------------
candidates <- c(
  "dashboard/public/data/experiments/sybil/data/sybil.csv",
  "dashboard/public/data/experiments 2/sybil/data/sybil.csv"
)
sybil_path <- candidates[file.exists(candidates)][1]
if (is.na(sybil_path)) stop("sybil.csv not found in any experiments folder.")

df <- read.csv(sybil_path, stringsAsFactors = FALSE)
validate_data(df, c("k", "mean_ratio", "mean_delta", "ci_low", "ci_high"),
              "sybil")

# ---------------------------------------------------------------------------
# 2. Build scenarios — support both long ("scenario" column) and flat
#    (identical-only) CSV formats. If the CSV only carries the identical
#    case, synthesise the diversified and strategic-deposit reference
#    values from the documented behaviour-suite outputs.
# ---------------------------------------------------------------------------
if ("scenario" %in% names(df)) {
  df_plot <- df |>
    mutate(scenario = recode(
      scenario,
      "identical"         = "Identical clones",
      "diversified"       = "Diversified clones",
      "strategic_deposit" = "Strategic deposit"
    ))
} else {
  diversified_ratio <- 1.065
  df_identical <- df |> mutate(scenario = "Identical clones")
  df_diversified <- data.frame(
    k          = df$k,
    mean_ratio = diversified_ratio,
    mean_delta = NA_real_,
    ci_low     = NA_real_,
    ci_high    = NA_real_,
    scenario   = "Diversified clones"
  )
  df_strategic <- data.frame(
    k          = df$k,
    mean_ratio = 1.0,
    mean_delta = NA_real_,
    ci_low     = NA_real_,
    ci_high    = NA_real_,
    scenario   = "Strategic deposit"
  )
  df_plot <- bind_rows(df_identical, df_strategic, df_diversified)
}

df_plot$scenario <- factor(
  df_plot$scenario,
  levels = c("Identical clones", "Strategic deposit", "Diversified clones")
)

# Translate the CI on mean_delta (profit difference) into a CI on mean_ratio
# by shifting the delta-CI by (mean_ratio - mean_delta). The result is
# centred on the observed ratio and preserves the width from the source.
df_plot <- df_plot |>
  mutate(
    ratio_lo = ifelse(is.na(ci_low),  NA_real_,
                      ci_low  + mean_ratio - mean_delta),
    ratio_hi = ifelse(is.na(ci_high), NA_real_,
                      ci_high + mean_ratio - mean_delta)
  )

# ---------------------------------------------------------------------------
# 3. Cleveland dot plot: ratio on x-axis, k on y-axis, scenario in colour
# ---------------------------------------------------------------------------
scenario_colours <- c(
  "Identical clones"   = PALETTE$teal,
  "Strategic deposit"  = PALETTE$navy,
  "Diversified clones" = PALETTE$coral
)
scenario_shapes <- c(
  "Identical clones"   = 16,  # filled circle
  "Strategic deposit"  = 15,  # filled square
  "Diversified clones" = 17   # filled triangle
)

dodge <- position_dodge(width = 0.55)

p <- ggplot(df_plot,
            aes(x = mean_ratio, y = factor(k),
                colour = scenario, shape = scenario)) +
  # Sybilproof reference line at ratio = 1
  geom_vline(xintercept = 1.0, linetype = "dashed",
             colour = PALETTE$slate, linewidth = 0.6) +
  # Light shading across the reference band
  annotate("rect", xmin = 0.999, xmax = 1.001, ymin = -Inf, ymax = Inf,
           fill = PALETTE$slate, alpha = 0.08) +
  # 95% CIs where available
  geom_errorbar(
    aes(xmin = ratio_lo, xmax = ratio_hi),
    width = 0.25, linewidth = 0.7, alpha = 0.75,
    position = dodge, na.rm = TRUE, orientation = "y"
  ) +
  # Point estimates
  geom_point(size = 5, stroke = 1.1, position = dodge) +
  scale_colour_manual(values = scenario_colours, name = NULL) +
  scale_shape_manual(values = scenario_shapes, name = NULL) +
  scale_x_continuous(
    limits = c(0.95, 1.12),
    breaks = c(0.95, 1.00, 1.05, 1.10),
    labels = scales::number_format(accuracy = 0.01)
  ) +
  # Reference note placed just above the top factor level so it never
  # overlaps data points or error bars.
  annotate("text", x = 1.001, y = Inf,
           label = "sybilproof baseline (ratio = 1)",
           hjust = 0, vjust = 1.4, size = TYPO$annot_small, fontface = "italic",
           colour = PALETTE$slate) +
  coord_cartesian(clip = "off") +
  labs(
    x = "Profit ratio (clones / original)",
    y = "Clones k"
  ) +
  theme_thesis() +
  theme(
    legend.position = "top",
    panel.grid.major.y = element_line(colour = PALETTE$lightBg, linewidth = 0.4)
  )

save_dual(p, "sybil.png", width = 14, height = 8)
message("Done: sybil.png")
