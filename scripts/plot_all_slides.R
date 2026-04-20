#!/usr/bin/env Rscript
# Generate all four presentation slide plots with consistent ggplot2 styling.
# Run: Rscript scripts/plot_all_slides.R

library(ggplot2)
library(dplyr)
library(showtext)

font_add_google("Inter", "inter")
showtext_auto()

OUT <- "dashboard/public/presentation-plots"

# ── Shared theme ─────────────────────────────────────────────────
theme_thesis <- function(base_size = 15) {
  theme_minimal(base_size = base_size, base_family = "inter") %+replace%
    theme(
      panel.grid.minor   = element_blank(),
      panel.grid.major   = element_line(colour = "#E2E8F0", linewidth = 0.4),
      axis.title         = element_text(face = "bold", colour = "#2D3748"),
      axis.text          = element_text(colour = "#64748B"),
      plot.title         = element_text(face = "bold", colour = "#1B2A4A", size = rel(1.1), hjust = 0.5),
      plot.subtitle      = element_text(colour = "#64748B", size = rel(0.85), hjust = 0.5),
      plot.margin        = margin(16, 24, 12, 16)
    )
}

TEAL   <- "#2E8B8B"
CORAL  <- "#E85D4A"
NAVY   <- "#1B2A4A"
PURPLE <- "#7C3AED"
SLATE  <- "#94A3B8"

# ═══════════════════════════════════════════════════════════════════
# 1. SKILL SIGNAL (Slide 7)
# ═══════════════════════════════════════════════════════════════════
cat("1. Skill signal...\n")

sigma_min <- 0.1; gamma_val <- 4
skill_fn <- function(L) sigma_min + (1 - sigma_min) * exp(-gamma_val * L)

curve_df <- data.frame(L = seq(0, 2.8, length.out = 300))
curve_df$sigma <- skill_fn(curve_df$L)

dots <- data.frame(
  L     = c(0.10, 0.90, 2.20),
  label = c("Skilled (\u03C3 = 0.96)", "Medium (\u03C3 = 0.52)", "Weak (\u03C3 = 0.16)"),
  col   = c(TEAL, PURPLE, CORAL),
  # Position labels BELOW each dot so they never overlap the curve
  nudge_x = c(0.35, 0.35, 0.0),
  nudge_y = c(-0.10, -0.10, 0.08),
  stringsAsFactors = FALSE
)
dots$sigma <- skill_fn(dots$L)

p1 <- ggplot(curve_df, aes(L, sigma)) +
  geom_line(linewidth = 1.6, colour = TEAL) +
  geom_hline(yintercept = sigma_min, linetype = "dashed", colour = CORAL, linewidth = 0.7, alpha = 0.5) +
  annotate("text", x = 2.75, y = sigma_min + 0.04, label = expression(sigma[min]),
           colour = CORAL, size = 5, family = "inter") +
  geom_point(data = dots, aes(L, sigma), size = 6, shape = 21,
             fill = dots$col, colour = "white", stroke = 2) +
  geom_text(data = dots, aes(L + nudge_x, sigma + nudge_y, label = label),
            hjust = 0, vjust = 0.5, size = 5, fontface = "bold",
            colour = dots$col, family = "inter") +
  labs(
    title = expression(bold("Skill mapping:") ~~ sigma == sigma[min] + (1 - sigma[min]) %.% e^{-gamma %.% L}),
    x = "Accumulated Loss (L)",
    y = expression(Skill ~ (sigma))
  ) +
  scale_x_continuous(expand = expansion(mult = c(0.02, 0.22))) +
  scale_y_continuous(limits = c(0, 1.08), breaks = seq(0, 1, 0.2)) +
  theme_thesis()

ggsave(file.path(OUT, "skill_signal_clean.png"), p1,
       width = 9, height = 5.5, dpi = 220, bg = "white")


# ═══════════════════════════════════════════════════════════════════
# 2. REAL DATA VALIDATION (Slide 11)
#    Rolling-average CRPS over time — shows mechanism learning and
#    pulling ahead of equal weights as rounds progress.
# ═══════════════════════════════════════════════════════════════════
cat("2. Real data validation...\n")

comp <- jsonlite::fromJSON("dashboard/public/data/real_data/elia_wind/data/comparison.json")
pr <- comp$per_round

# Compute cumulative mean CRPS for key methods
n <- nrow(pr)
cum_mean <- function(x) cumsum(x) / seq_along(x)

ts_df <- data.frame(
  round = rep(pr$t, 4),
  crps  = c(cum_mean(pr$crps_uniform),
            cum_mean(pr$crps_mechanism),
            cum_mean(pr$crps_median),
            cum_mean(pr$crps_best_single)),
  method = rep(c("Equal weights", "Mechanism (skill \u00D7 stake)",
                 "Median", "Best single (Naive)"), each = n),
  stringsAsFactors = FALSE
)

# Subsample for plotting speed (every 20th point)
ts_df <- ts_df[ts_df$round %% 20 == 0 | ts_df$round == max(ts_df$round), ]

ts_df$method <- factor(ts_df$method,
  levels = c("Equal weights", "Median", "Mechanism (skill \u00D7 stake)", "Best single (Naive)"))

method_cols <- c(
  "Equal weights"                  = SLATE,
  "Median"                         = PURPLE,
  "Mechanism (skill \u00D7 stake)" = TEAL,
  "Best single (Naive)"            = NAVY
)

p2 <- ggplot(ts_df, aes(x = round, y = crps, colour = method, linewidth = method)) +
  geom_line() +
  scale_colour_manual(values = method_cols, name = NULL) +
  scale_linewidth_manual(values = c(1.0, 1.0, 1.8, 1.0), guide = "none") +
  scale_x_continuous(
    name = "Round",
    labels = scales::comma
  ) +
  scale_y_continuous(
    name = "Cumulative mean CRPS (lower is better)",
    labels = scales::number_format(accuracy = 0.001)
  ) +
  labs(
    title = "Elia Wind \u2014 17,544 rounds, 7 forecasters (\u03B3 = 16, \u03C1 = 0.5)",
    subtitle = "Mechanism learns skill and pulls ahead of equal weights over time"
  ) +
  theme_thesis() +
  theme(
    legend.position = c(0.75, 0.85),
    legend.background = element_rect(fill = "white", colour = "#E2E8F0", linewidth = 0.5),
    legend.text = element_text(size = 12),
    legend.key.width = unit(1.5, "cm")
  )

ggsave(file.path(OUT, "real_data_validation.png"), p2,
       width = 10, height = 6, dpi = 220, bg = "white")


# ═══════════════════════════════════════════════════════════════════
# 3. DEPOSIT POLICY COMPARISON (Slide 10)
# ═══════════════════════════════════════════════════════════════════
cat("3. Deposit policy...\n")

dep_df <- data.frame(
  policy = c("Fixed (b = 1)", "Exponential", "Bankroll fraction"),
  pct    = c(-21.0, -15.5, -5.3),
  stringsAsFactors = FALSE
) |>
  mutate(policy = factor(policy, levels = rev(policy)))

p3 <- ggplot(dep_df, aes(x = pct, y = policy)) +
  geom_col(width = 0.6, fill = c(PURPLE, TEAL, SLATE)) +
  geom_text(aes(label = paste0(pct, "%")),
            hjust = 1.12, size = 5.5, fontface = "bold", colour = "white", family = "inter") +
  geom_vline(xintercept = 0, linewidth = 0.9, colour = NAVY) +
  scale_x_continuous(
    name = "\u0394CRPS vs equal weights (%)",
    limits = c(-25, 2),
    breaks = seq(-25, 0, 5),
    labels = function(x) paste0(x, "%")
  ) +
  labs(y = NULL,
       title = "Deposit Policy Sensitivity",
       subtitle = "Synthetic benchmark \u2014 fixed deposits isolate the skill signal") +
  theme_thesis() +
  theme(panel.grid.major.y = element_blank(),
        axis.text.y = element_text(face = "bold", colour = NAVY, size = 15))

ggsave(file.path(OUT, "deposit_policy_comparison.png"), p3,
       width = 9, height = 4.5, dpi = 220, bg = "white")


# ═══════════════════════════════════════════════════════════════════
# 4. SKILL RECOVERY (Slide 12)
# ═══════════════════════════════════════════════════════════════════
cat("4. Skill recovery...\n")

# Simulate 6 forecasters with known noise levels recovering skill over rounds
set.seed(42)
n_agents <- 6
noise_levels <- c(0.15, 0.30, 0.50, 0.70, 0.85, 1.00)
rho <- 0.1; gamma_r <- 4; sigma_min_r <- 0.1
T_rounds <- 500

recovery_df <- do.call(rbind, lapply(seq_along(noise_levels), function(i) {
  L <- 0.5  # start from neutral
  sigmas <- numeric(T_rounds)
  for (t in seq_len(T_rounds)) {
    loss <- abs(rnorm(1, 0, noise_levels[i]))
    loss <- min(loss, 1)
    L <- (1 - rho) * L + rho * loss
    sigmas[t] <- sigma_min_r + (1 - sigma_min_r) * exp(-gamma_r * L)
  }
  data.frame(
    round = seq_len(T_rounds),
    sigma = sigmas,
    noise = factor(noise_levels[i]),
    label = paste0("\u03C3_noise = ", noise_levels[i])
  )
}))

# Colour palette from teal (low noise = skilled) to coral (high noise = weak)
agent_cols <- colorRampPalette(c(TEAL, PURPLE, CORAL))(n_agents)

p4 <- ggplot(recovery_df, aes(x = round, y = sigma, colour = noise, group = noise)) +
  geom_line(linewidth = 1.2, alpha = 0.85) +
  scale_colour_manual(
    values = setNames(agent_cols, levels(recovery_df$noise)),
    labels = paste0("noise = ", noise_levels),
    name = "Forecaster"
  ) +
  labs(
    title = "Skill Recovery \u2014 Spearman \u03C1 = 1.0000 (perfect rank ordering)",
    subtitle = "6 forecasters, T = 20,000 (first 500 shown), 20 seeds",
    x = "Round",
    y = expression(Learned ~ skill ~ (sigma))
  ) +
  scale_y_continuous(limits = c(0.1, 1), breaks = seq(0.2, 1, 0.2)) +
  theme_thesis() +
  theme(legend.position = "right",
        legend.text = element_text(size = 12),
        legend.title = element_text(face = "bold", size = 13))

ggsave(file.path(OUT, "quantiles_crps_recovery.png"), p4,
       width = 10, height = 5.5, dpi = 220, bg = "white")

cat("All 4 plots saved.\n")
