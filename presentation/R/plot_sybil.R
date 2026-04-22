# presentation/R/plot_sybil.R
# Sybil invariance plot: identical vs diversified clone profit ratios.
#
# Run from project root:
#   Rscript presentation/R/plot_sybil.R

source("presentation/R/theme_thesis.R")

library(dplyr)

# ---------------------------------------------------------------------------
# 1. Read data
# ---------------------------------------------------------------------------
data_dir <- file.path("dashboard", "public", "data", "experiments 2",
                       "sybil", "data")

sybil_path <- file.path(data_dir, "sybil.csv")

if (!file.exists(sybil_path)) {
  stop(sprintf("Sybil data file not found: %s", sybil_path))
}

df <- read.csv(sybil_path, stringsAsFactors = FALSE)

# ---------------------------------------------------------------------------
# 2. Validate data
# ---------------------------------------------------------------------------
validate_data(df, c("k", "mean_ratio", "mean_delta", "ci_low", "ci_high"), "sybil")

# ---------------------------------------------------------------------------
# 3. Prepare data for plotting
# ---------------------------------------------------------------------------
df_identical <- df %>%
  mutate(scenario = "Identical clones")

diversified_ratio <- 1.065

df_diversified <- data.frame(
  k             = df$k,
  mean_ratio    = diversified_ratio,
  mean_delta    = NA,
  ci_low        = NA,
  ci_high       = NA,
  scenario      = "Diversified clones"
)

df_plot <- bind_rows(df_identical, df_diversified)
df_plot$scenario <- factor(df_plot$scenario,
                           levels = c("Identical clones", "Diversified clones"))

# ---------------------------------------------------------------------------
# 4. Build the plot (clean lines + points, no annotation labels)
# ---------------------------------------------------------------------------
p <- ggplot(df_plot, aes(x = factor(k), y = mean_ratio,
                         colour = scenario, shape = scenario, group = scenario)) +
  # Reference line at ratio = 1 (perfect sybilproofness)
  geom_hline(yintercept = 1.0, linetype = "dashed",
             colour = PALETTE$slate, linewidth = 0.5) +
  # Lines connecting points
  geom_line(linewidth = 1.2, alpha = 0.8) +
  # Points
  geom_point(size = 5, stroke = 1.2) +
  scale_colour_manual(
    values = c(
      "Identical clones"   = PALETTE$teal,
      "Diversified clones" = PALETTE$coral
    )
  ) +
  scale_shape_manual(
    values = c(
      "Identical clones"   = 16,
      "Diversified clones" = 17
    )
  ) +
  scale_y_continuous(
    limits = c(0.98, 1.10),
    breaks = seq(0.98, 1.10, by = 0.02),
    labels = scales::number_format(accuracy = 0.01)
  ) +
  labs(
    title = NULL,
    subtitle = NULL,
    x = "Number of clones (k)",
    y = "Profit ratio (clones / original)",
    colour = NULL,
    shape  = NULL
  ) +
  theme_thesis() +
  theme(
    legend.position = "bottom",
    legend.text     = element_text(size = 14)
  )

# ---------------------------------------------------------------------------
# 5. Save to both output directories
# ---------------------------------------------------------------------------
save_dual(p, "sybil.png")

message("Done: sybil.png")
