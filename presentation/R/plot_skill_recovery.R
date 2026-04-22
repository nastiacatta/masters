# presentation/R/plot_skill_recovery.R
# Skill recovery plot: true noise level vs learned skill (σ_tail)
# for the quantiles-CRPS scoring rule.
#
# Run from project root:
#   Rscript presentation/R/plot_skill_recovery.R

source("presentation/R/theme_thesis.R")

library(dplyr)

# ---------------------------------------------------------------------------
# 1. Read data
# ---------------------------------------------------------------------------
data_dir <- "dashboard/public/data/experiments 2/skill_recovery/data"

summary_path <- file.path(data_dir, "quantiles_crps_summary.csv")
seeds_path   <- file.path(data_dir, "quantiles_crps_seeds.csv")

if (!file.exists(summary_path)) {
  stop(sprintf("Summary file not found: %s", summary_path))
}
if (!file.exists(seeds_path)) {
  stop(sprintf("Seeds file not found: %s", seeds_path))
}

df_summary <- read.csv(summary_path, stringsAsFactors = FALSE)
df_seeds   <- read.csv(seeds_path, stringsAsFactors = FALSE)

# ---------------------------------------------------------------------------
# 2. Validate data
# ---------------------------------------------------------------------------
validate_data(df_summary, c("forecaster", "tau_true", "mean_loss_tail", "mean_sigma_tail"),
              "quantiles_crps_summary")
validate_data(df_seeds, c("seed", "corr_loss", "corr_sigma"),
              "quantiles_crps_seeds")

# ---------------------------------------------------------------------------
# 3. Build the plot (clean scatter + line, no annotations)
# ---------------------------------------------------------------------------
df_summary <- df_summary %>%
  mutate(forecaster_label = paste0("F", forecaster))

p <- ggplot(df_summary, aes(x = tau_true, y = mean_sigma_tail)) +
  # Line connecting the points to show the monotonic relationship
  geom_line(colour = PALETTE$teal, linewidth = 1.2, alpha = 0.6) +
  # Points for each forecaster
  geom_point(
    aes(fill = factor(forecaster)),
    shape = 21, size = 5, colour = "white", stroke = 1.2
  ) +
  # Label each point with its forecaster ID
  geom_text(
    aes(label = forecaster_label),
    vjust = -1.3, size = 4.5, fontface = "bold",
    colour = PALETTE$charcoal
  ) +
  scale_fill_manual(
    values = c(
      "0" = PALETTE$teal,
      "1" = PALETTE$coral,
      "2" = PALETTE$purple,
      "3" = "#E67E22",
      "4" = PALETTE$slate,
      "5" = PALETTE$navy
    ),
    guide = "none"
  ) +
  scale_x_continuous(
    breaks = df_summary$tau_true,
    labels = sprintf("%.2f", df_summary$tau_true)
  ) +
  scale_y_continuous(
    labels = scales::number_format(accuracy = 0.01)
  ) +
  labs(
    title = NULL,
    subtitle = NULL,
    x = expression(bold("True noise level") ~ (tau[true])),
    y = expression(bold("Learned skill") ~ (bar(sigma)[tail]))
  ) +
  theme_thesis()

# ---------------------------------------------------------------------------
# 4. Save to both output directories
# ---------------------------------------------------------------------------
save_dual(p, "quantiles_crps_recovery.png")

message("Done: quantiles_crps_recovery.png")
