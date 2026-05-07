# presentation/R/plot_deposit_policy.R
# Deposit policy comparison: four policies compared under the Mechanism
# weight rule.
#
# Chart type: horizontal Cleveland dot plot with SE error bars.
# Rationale: we are comparing four point estimates (mean CRPS) with
# standard errors across two evaluation periods. A grouped bar chart
# doubles the marks for near-identical values, anchors each bar at
# zero (which compresses the differences), and hides the ordering.
# A Cleveland dot plot:
#   * puts the point estimate on a single, comparable axis
#   * shows uncertainty directly via error bars
#   * sorts policies by value so the best / worst is immediately visible
#   * overlays the two evaluation windows as a shape+colour pair so the
#     reader can see warm-start effects directly
#
# Run from project root:
#   Rscript presentation/R/plot_deposit_policy.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(tidyr)
})

# ---------------------------------------------------------------------------
# 1. Load data — tolerate either experiments folder
# ---------------------------------------------------------------------------
candidates <- c(
  "dashboard/public/data/experiments/deposit_policy_comparison/data",
  "dashboard/public/data/experiments 2/deposit_policy_comparison/data"
)
data_dir <- candidates[
  file.exists(file.path(candidates, "deposit_policy_comparison.csv"))
][1]
if (is.na(data_dir)) stop("deposit_policy_comparison data not found.")

df <- read.csv(file.path(data_dir, "deposit_policy_comparison.csv"),
               stringsAsFactors = FALSE)

validate_data(df,
              c("deposit_policy", "mean_crps_all", "se_all",
                "mean_crps_warmstart", "se_ws"),
              "deposit_policy_comparison")

# ---------------------------------------------------------------------------
# 2. Shape
# ---------------------------------------------------------------------------
policy_labels <- c(
  "iid_exp"          = "IID exponential",
  "fixed_unit"       = "Fixed unit (b = 1)",
  "oracle_precision" = "Oracle precision",
  "bankroll_conf"    = "Bankroll + confidence"
)

df_long <- df |>
  mutate(policy_label = policy_labels[deposit_policy]) |>
  select(policy_label,
         mean_crps_all, se_all,
         mean_crps_warmstart, se_ws) |>
  pivot_longer(
    cols = c(mean_crps_all, mean_crps_warmstart),
    names_to = "period", values_to = "mean_crps"
  ) |>
  mutate(
    se = ifelse(period == "mean_crps_all", se_all, se_ws),
    period_label = factor(
      ifelse(period == "mean_crps_all", "All rounds", "Warm-start only"),
      levels = c("All rounds", "Warm-start only")
    )
  ) |>
  select(policy_label, period_label, mean_crps, se)

# Order policies by the warm-start estimate (best = top)
rank_df <- df_long |>
  filter(period_label == "Warm-start only") |>
  arrange(mean_crps)

df_long$policy_label <- factor(
  df_long$policy_label,
  levels = rev(rank_df$policy_label)
)

# ---------------------------------------------------------------------------
# 3. Plot: Cleveland dot plot with error bars
# ---------------------------------------------------------------------------
dodge <- position_dodge(width = 0.45)

p <- ggplot(df_long,
            aes(x = mean_crps, y = policy_label,
                colour = period_label, shape = period_label)) +
  # Faint row guides
  geom_hline(yintercept = seq_len(nlevels(df_long$policy_label)),
             colour = PALETTE$lightBg, linewidth = 0.4) +
  # SE error bars
  geom_errorbar(
    aes(xmin = mean_crps - se, xmax = mean_crps + se),
    width = 0.22, linewidth = 0.7, alpha = 0.9,
    position = dodge, orientation = "y"
  ) +
  # Point estimates
  geom_point(size = 6, stroke = 1.2, position = dodge) +
  # Numeric labels next to warm-start points (primary evaluation window)
  geom_text(
    data = df_long |> filter(period_label == "Warm-start only"),
    aes(label = sprintf("%.4f", mean_crps)),
    position = dodge,
    hjust = -0.28, size = TYPO$annot_small, fontface = "bold",
    colour = PALETTE$charcoal, show.legend = FALSE
  ) +
  scale_colour_manual(
    values = c("All rounds" = PALETTE$slate,
               "Warm-start only" = PALETTE$teal),
    name = NULL
  ) +
  scale_shape_manual(
    values = c("All rounds" = 16, "Warm-start only" = 17),
    name = NULL
  ) +
  scale_x_continuous(
    expand = expansion(mult = c(0.02, 0.18)),
    labels = scales::number_format(accuracy = 0.001)
  ) +
  labs(
    x = expression(bold("Mean CRPS") ~ (downarrow ~ "lower is better")),
    y = NULL
  ) +
  theme_thesis() +
  theme(
    legend.position = "top",
    legend.text     = element_text(size = TYPO$legend),
    axis.text.y     = element_text(face = "bold",
                                   size = TYPO$axis_text + 2),
    panel.grid.major.y = element_blank()
  )

# ---------------------------------------------------------------------------
# 4. Save
# ---------------------------------------------------------------------------
save_dual(p, "deposit_policy_comparison.png", width = 14, height = 8)
message("Done: deposit_policy_comparison.png")
