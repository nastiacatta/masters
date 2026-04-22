# presentation/R/plot_deposit_policy.R
# Deposit policy comparison: bankroll-confidence vs fixed vs oracle deposit rules.
#
# Run from project root:
#   Rscript presentation/R/plot_deposit_policy.R

source("presentation/R/theme_thesis.R")

library(dplyr)
library(tidyr)

# ---------------------------------------------------------------------------
# 1. Read data
# ---------------------------------------------------------------------------
data_dir <- file.path("dashboard", "public", "data", "experiments 2",
                       "deposit_policy_comparison", "data")

csv_path <- file.path(data_dir, "deposit_policy_comparison.csv")

if (!file.exists(csv_path)) {
  stop(sprintf("Data file not found: %s", csv_path))
}

df <- read.csv(csv_path, stringsAsFactors = FALSE)

# ---------------------------------------------------------------------------
# 2. Validate data
# ---------------------------------------------------------------------------
validate_data(df, c("deposit_policy", "mean_crps_all", "se_all",
                     "mean_crps_warmstart", "se_ws"),
              "deposit_policy_comparison")

# ---------------------------------------------------------------------------
# 3. Prepare data for plotting
# ---------------------------------------------------------------------------
# Readable labels for each deposit policy
policy_labels <- c(
  "iid_exp"          = "IID Exponential",
  "fixed_unit"       = "Fixed Unit",
  "oracle_precision" = "Oracle Precision",
  "bankroll_conf"    = "Bankroll-Confidence"
)

# Assign colours per policy
policy_colours <- c(
  "IID Exponential"     = PALETTE$slate,
  "Fixed Unit"          = PALETTE$coral,
  "Oracle Precision"    = PALETTE$purple,
  "Bankroll-Confidence" = PALETTE$teal
)

df <- df %>%
  mutate(
    policy_label = factor(policy_labels[deposit_policy],
                          levels = c("Oracle Precision", "Bankroll-Confidence",
                                     "Fixed Unit", "IID Exponential"))
  )

# ---------------------------------------------------------------------------
# 4. Build the plot — grouped bar chart with error bars
# ---------------------------------------------------------------------------
# Reshape to long format for facet-free grouped bars
df_long <- df %>%
  select(policy_label, mean_crps_all, se_all, mean_crps_warmstart, se_ws) %>%
  pivot_longer(
    cols = c(mean_crps_all, mean_crps_warmstart),
    names_to = "period",
    values_to = "mean_crps"
  ) %>%
  mutate(
    se = ifelse(period == "mean_crps_all", se_all, se_ws),
    period_label = ifelse(period == "mean_crps_all", "All Rounds", "Warm-Start Only")
  ) %>%
  select(policy_label, period_label, mean_crps, se)

p <- ggplot(df_long, aes(x = policy_label, y = mean_crps, fill = period_label)) +
  geom_col(
    position = position_dodge(width = 0.7),
    width = 0.6,
    alpha = 0.9
  ) +
  geom_errorbar(
    aes(ymin = mean_crps - se, ymax = mean_crps + se),
    position = position_dodge(width = 0.7),
    width = 0.2,
    linewidth = 0.5,
    colour = PALETTE$charcoal
  ) +
  # Value labels on top of each bar
  geom_text(
    aes(label = sprintf("%.4f", mean_crps)),
    position = position_dodge(width = 0.7),
    vjust = -0.8,
    size = 4,
    fontface = "bold",
    colour = PALETTE$charcoal
  ) +
  scale_fill_manual(
    values = c("All Rounds" = PALETTE$navy, "Warm-Start Only" = PALETTE$teal),
    name = "Evaluation Period"
  ) +
  scale_y_continuous(
    expand = expansion(mult = c(0, 0.15)),
    labels = scales::number_format(accuracy = 0.001)
  ) +
  labs(
    title = "Deposit Policy Comparison",
    subtitle = "Mean CRPS by deposit rule \u2014 lower is better",
    x = NULL,
    y = "Mean CRPS"
  ) +
  theme_thesis() +
  theme(
    plot.subtitle = element_text(size = 14, colour = PALETTE$slate,
                                 margin = margin(b = 15)),
    axis.text.x = element_text(size = 14, face = "bold"),
    legend.position = "top"
  )

# ---------------------------------------------------------------------------
# 5. Save to both output directories
# ---------------------------------------------------------------------------
save_dual(p, "deposit_policy_comparison.png")

message("Done: deposit_policy_comparison.png")
