# presentation/R/plot_weight_rule_comparison.R
# Weight rule comparison: five weight rules under two deposit policies.
#
# Chart type: Cleveland dot plot with SE error bars, faceted by deposit
# policy, rules ordered by warm-start CRPS.
# Rationale: we are comparing ten point estimates (5 rules × 2 policies)
# with standard errors. A bar chart double-encodes value in height AND
# position, inflates the visual weight of small differences, and makes
# ordering by value impossible when bars are anchored at zero. Dot plot
# with error bars puts each estimate on a single comparable axis, shows
# uncertainty directly, orders by value, and lets the reader compare
# between the two deposit policies at a glance because the x-axis is
# shared across facets.
#
# Run from project root:
#   Rscript presentation/R/plot_weight_rule_comparison.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
})

# ---------------------------------------------------------------------------
# 1. Load data — tolerate either experiments folder
# ---------------------------------------------------------------------------
candidates <- c(
  "dashboard/public/data/experiments/weight_rule_comparison/data",
  "dashboard/public/data/experiments 2/weight_rule_comparison/data",
  "onlinev2/outputs_final/core/experiments/weight_rule_comparison/data",
  "onlinev2/outputs/core/experiments/weight_rule_comparison/data"
)
csv_path <- NA
for (d in candidates) {
  p <- file.path(d, "weight_rule_comparison.csv")
  if (file.exists(p)) { csv_path <- p; break }
}
if (is.na(csv_path)) {
  stop("weight_rule_comparison.csv not found in any known output folder.")
}

df <- read.csv(csv_path, stringsAsFactors = FALSE)
validate_data(df, c("deposit_policy", "weight_rule",
                     "mean_crps_all", "se_all",
                     "mean_crps_warmstart", "se_ws"),
              "weight_rule_comparison")

# ---------------------------------------------------------------------------
# 2. Prepare labels
# ---------------------------------------------------------------------------
rule_labels <- c(
  uniform     = "Uniform",
  deposit     = "Deposit",
  skill       = "Skill",
  mechanism   = "Mechanism",
  best_single = "Best single"
)
policy_labels <- c(
  fixed_unit    = "Fixed unit (b = 1) — isolates skill",
  bankroll_conf = "Bankroll-Confidence — realistic deposits"
)

df <- df |>
  mutate(
    rule_label   = rule_labels[weight_rule],
    policy_label = policy_labels[deposit_policy]
  ) |>
  filter(!is.na(rule_label), !is.na(policy_label))

# Order rules by warm-start CRPS within the fixed-unit policy
if ("fixed_unit" %in% df$deposit_policy) {
  rule_order <- df |>
    filter(deposit_policy == "fixed_unit") |>
    arrange(mean_crps_warmstart) |>
    pull(rule_label)
} else {
  rule_order <- unname(rule_labels)
}
df$rule_label <- factor(df$rule_label, levels = rev(rule_order))

# Keep the two panels in a sensible reading order
df$policy_label <- factor(
  df$policy_label,
  levels = c(policy_labels["fixed_unit"], policy_labels["bankroll_conf"])
)

# ---------------------------------------------------------------------------
# 3. Cleveland dot plot, faceted by deposit policy
# ---------------------------------------------------------------------------
rule_colours <- c(
  "Uniform"     = PALETTE$slate,
  "Deposit"     = PALETTE$coral,
  "Skill"       = PALETTE$purple,
  "Mechanism"   = PALETTE$teal,
  "Best single" = PALETTE$navy
)

p <- ggplot(df,
            aes(x = mean_crps_warmstart, y = rule_label, colour = rule_label)) +
  # Subtle horizontal reference stripes
  geom_hline(yintercept = seq_len(nlevels(df$rule_label)),
             colour = PALETTE$lightBg, linewidth = 0.4) +
  # Error bars (1 SE)
  geom_errorbar(
    aes(xmin = mean_crps_warmstart - se_ws,
        xmax = mean_crps_warmstart + se_ws),
    width = 0.25, linewidth = 0.7, alpha = 0.9, orientation = "y"
  ) +
  # Point estimates
  geom_point(size = 5.5, stroke = 1.1) +
  # Numeric labels — place clear of the right error bar whisker using a
  # data-driven nudge so the text never sits on top of the bar.
  geom_text(
    aes(label = sprintf("%.4f", mean_crps_warmstart),
        x    = mean_crps_warmstart + se_ws),
    hjust = -0.25, vjust = 0.5,
    size = TYPO$annot_small, fontface = "bold",
    colour = PALETTE$charcoal,
    show.legend = FALSE
  ) +
  scale_colour_manual(values = rule_colours, guide = "none") +
  scale_x_continuous(
    expand = expansion(mult = c(0.03, 0.26)),
    labels = scales::number_format(accuracy = 0.001)
  ) +
  facet_wrap(~ policy_label, ncol = 2) +
  labs(
    x = expression(bold("Mean CRPS (warm-start)") ~ (downarrow ~ "lower is better")),
    y = NULL
  ) +
  theme_thesis() +
  theme(
    axis.text.y        = element_text(face = "bold", size = TYPO$axis_text + 1),
    panel.grid.major.y = element_blank(),
    strip.background   = element_blank(),
    strip.text         = element_text(size = TYPO$subtitle, face = "bold",
                                      colour = PALETTE$navy,
                                      margin = margin(b = 12))
  )

# ---------------------------------------------------------------------------
# 4. Save
# ---------------------------------------------------------------------------
save_dual(p, "weight_rule_comparison.png", width = 16, height = 8)
message("Done: weight_rule_comparison.png")
