# presentation/R/plot_behaviour_concentration.R
# Behaviour matrix: final Gini and N_eff across scenarios.
#
# Chart type: two-panel Cleveland dot plot (Gini and N_eff side by side)
# with scenarios ordered by final_gini.
# Rationale: we are comparing point estimates (final Gini, final N_eff)
# across six behaviour scenarios. A 2D scatter (Gini vs N_eff) would hide
# which scenario each point belongs to without careful labelling; a
# grouped bar chart anchors at zero and visually inflates small
# differences. A Cleveland dot plot on each metric puts the scenarios
# on a common y-axis so the reader can follow the same label across
# panels, see ordering immediately, and spot outliers (sybil_split)
# without interpretation. The "sybil_split" outlier is highlighted in
# coral so the narrative point — "sybil attacks push concentration up
# and mechanical N_eff up" — is immediately visible.
#
# Run from project root:
#   Rscript presentation/R/plot_behaviour_concentration.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(tidyr)
  library(patchwork)
})

# ---------------------------------------------------------------------------
# 1. Load data — tolerate both "behaviour" and "behaviour 2" folders
# ---------------------------------------------------------------------------
candidates <- c(
  "dashboard/public/data/behaviour/experiments/behaviour_matrix/data/behaviour_matrix.csv",
  "dashboard/public/data/behaviour 2/experiments/behaviour_matrix/data/behaviour_matrix.csv"
)
csv_path <- candidates[file.exists(candidates)][1]
if (is.na(csv_path)) stop("behaviour_matrix.csv not found.")

df <- read.csv(csv_path, stringsAsFactors = FALSE)
validate_data(df, c("scenario", "final_gini", "final_n_eff"),
              "behaviour_matrix")

# ---------------------------------------------------------------------------
# 2. Clean up scenario labels and flag the sybil outlier
# ---------------------------------------------------------------------------
scenario_labels <- c(
  benign_baseline     = "Benign baseline",
  bursty_kelly        = "Bursty Kelly",
  risk_averse_hedged  = "Risk-averse hedged",
  lumpy_miscalibrated = "Lumpy miscalibrated",
  edge_threshold      = "Edge threshold",
  sybil_split         = "Sybil split"
)

df <- df |>
  mutate(
    scenario_label = scenario_labels[scenario],
    scenario_label = ifelse(is.na(scenario_label), scenario, scenario_label),
    is_attack = scenario == "sybil_split"
  ) |>
  arrange(final_gini) |>
  mutate(scenario_label = factor(scenario_label, levels = scenario_label))

pt_colour <- function(is_attack) ifelse(is_attack, PALETTE$coral, PALETTE$teal)
pt_shape  <- function(is_attack) ifelse(is_attack, 17, 16)

# ---------------------------------------------------------------------------
# 3. Panel A — Final Gini
# ---------------------------------------------------------------------------
p_gini <- ggplot(df, aes(x = final_gini, y = scenario_label)) +
  geom_segment(
    aes(x = 0, xend = final_gini, yend = scenario_label),
    colour = PALETTE$border, linewidth = 0.6, alpha = 0.7
  ) +
  geom_point(
    aes(colour = pt_colour(is_attack), shape = pt_shape(is_attack)),
    size = 6, stroke = 1.1, show.legend = FALSE
  ) +
  geom_text(
    aes(label = sprintf("%.3f", final_gini),
        colour = pt_colour(is_attack)),
    hjust = -0.35, size = TYPO$annot_small, fontface = "bold",
    show.legend = FALSE
  ) +
  scale_colour_identity() +
  scale_shape_identity() +
  scale_x_continuous(
    expand = expansion(mult = c(0.02, 0.25)),
    labels = scales::number_format(accuracy = 0.01)
  ) +
  labs(
    x = "Final Gini (wealth concentration)",
    y = NULL
  ) +
  theme_thesis() +
  theme(
    plot.title = subtitle_element(),
    panel.grid.major.y = element_blank(),
    axis.text.y = element_text(face = "bold",
                               size = TYPO$axis_text + 1)
  ) +
  ggtitle("Wealth concentration (Gini)")

# ---------------------------------------------------------------------------
# 4. Panel B — Final N_eff
# ---------------------------------------------------------------------------
p_neff <- ggplot(df, aes(x = final_n_eff, y = scenario_label)) +
  geom_segment(
    aes(x = 0, xend = final_n_eff, yend = scenario_label),
    colour = PALETTE$border, linewidth = 0.6, alpha = 0.7
  ) +
  geom_point(
    aes(colour = pt_colour(is_attack), shape = pt_shape(is_attack)),
    size = 6, stroke = 1.1, show.legend = FALSE
  ) +
  geom_text(
    aes(label = sprintf("%.2f", final_n_eff),
        colour = pt_colour(is_attack)),
    hjust = -0.35, size = TYPO$annot_small, fontface = "bold",
    show.legend = FALSE
  ) +
  scale_colour_identity() +
  scale_shape_identity() +
  scale_x_continuous(expand = expansion(mult = c(0.02, 0.25))) +
  labs(
    x = expression(bold("Effective participants") ~ (N[eff])),
    y = NULL
  ) +
  theme_thesis() +
  theme(
    plot.title = subtitle_element(),
    panel.grid.major.y = element_blank(),
    axis.text.y = element_blank(),
    axis.ticks.y = element_blank()
  ) +
  ggtitle("Market participation (N_eff)")

# ---------------------------------------------------------------------------
# 5. Compose side by side
# ---------------------------------------------------------------------------
p_combined <- (p_gini | p_neff) + plot_layout(widths = c(1.3, 1))

save_dual(p_combined, "behaviour_concentration.png", width = 16, height = 8)
message("Done: behaviour_concentration.png")
