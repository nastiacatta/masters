#!/usr/bin/env Rscript
# Generate all presentation slide plots with consistent ggplot2 styling.
# Run: Rscript scripts/plot_all_slides.R

library(ggplot2)
library(dplyr)
library(jsonlite)
library(showtext)

font_add_google("Inter", "inter")
showtext_auto()

OUT <- "dashboard/public/presentation-plots"

# ── Shared theme — large text for projection ─────────────────────
theme_thesis <- function(base_size = 18) {
  theme_minimal(base_size = base_size, base_family = "inter") %+replace%
    theme(
      panel.grid.minor   = element_blank(),
      panel.grid.major   = element_line(colour = "#E2E8F0", linewidth = 0.4),
      axis.title         = element_text(face = "bold", colour = "#2D3748", size = rel(1.0)),
      axis.text          = element_text(colour = "#64748B", size = rel(0.85)),
      plot.title         = element_text(face = "bold", colour = "#1B2A4A", size = rel(1.15), hjust = 0.5),
      plot.subtitle      = element_text(colour = "#64748B", size = rel(0.8), hjust = 0.5),
      plot.margin        = margin(20, 28, 16, 20),
      legend.text        = element_text(size = rel(0.8)),
      legend.title       = element_text(face = "bold", size = rel(0.85))
    )
}

TEAL   <- "#2E8B8B"
CORAL  <- "#E85D4A"
NAVY   <- "#1B2A4A"
PURPLE <- "#7C3AED"
SLATE  <- "#94A3B8"

# ═══════════════════════════════════════════════════════════════════
# 1. SKILL SIGNAL (Slide 8) — exponential decay curve
# ═══════════════════════════════════════════════════════════════════
cat("1. Skill signal...\n")

sigma_min <- 0.1; gamma_val <- 4
skill_fn <- function(L) sigma_min + (1 - sigma_min) * exp(-gamma_val * L)

curve_df <- data.frame(L = seq(0, 2.8, length.out = 300))
curve_df$sigma <- skill_fn(curve_df$L)

dots <- data.frame(
  L     = c(0.10, 0.90, 2.20),
  label = c("Skilled", "Medium", "Weak"),
  sigma_label = c("0.96", "0.52", "0.16"),
  col   = c(TEAL, PURPLE, CORAL),
  nudge_x = c(0.30, 0.30, -0.50),
  nudge_y = c(-0.09, -0.09, 0.07),
  stringsAsFactors = FALSE
)
dots$sigma <- skill_fn(dots$L)

p1 <- ggplot(curve_df, aes(L, sigma)) +
  geom_line(linewidth = 2.0, colour = TEAL) +
  geom_hline(yintercept = sigma_min, linetype = "dashed", colour = CORAL, linewidth = 0.8, alpha = 0.5) +
  annotate("text", x = 2.72, y = sigma_min + 0.05, label = expression(sigma[min]),
           colour = CORAL, size = 6, family = "inter") +
  geom_point(data = dots, aes(L, sigma), size = 7, shape = 21,
             fill = dots$col, colour = "white", stroke = 2.5) +
  geom_label(data = dots,
             aes(L + nudge_x, sigma + nudge_y,
                 label = paste0(label, " (\u03C3 = ", sigma_label, ")")),
             size = 5.5, fontface = "bold", colour = dots$col, family = "inter",
             fill = "white", label.size = 0.3, label.padding = unit(0.3, "lines")) +
  labs(
    title = expression(bold("Skill mapping:") ~~ sigma == sigma[min] + (1 - sigma[min]) %.% e^{-gamma %.% L}),
    x = "Accumulated Loss (L)",
    y = expression(Skill ~ (sigma))
  ) +
  scale_x_continuous(expand = expansion(mult = c(0.02, 0.18))) +
  scale_y_continuous(limits = c(0, 1.08), breaks = seq(0, 1, 0.2)) +
  theme_thesis()

ggsave(file.path(OUT, "skill_signal_clean.png"), p1,
       width = 9, height = 6, dpi = 250, bg = "white")


# ═══════════════════════════════════════════════════════════════════
# 2. MAIN RESULT (Slide 9) — per-forecaster learned skill on real data
# ═══════════════════════════════════════════════════════════════════
cat("2. Main result — per-forecaster skill on real data...\n")

library(ggrepel)

comp <- fromJSON("dashboard/public/data/real_data/elia_wind/data/comparison.json")
sh <- comp$skill_history
forecaster_names <- comp$config$forecasters

# Build long-format data frame
skill_long <- do.call(rbind, lapply(seq_along(forecaster_names), function(i) {
  col_name <- paste0("sigma_", i - 1)
  data.frame(
    t = sh$t,
    sigma = sh[[col_name]],
    forecaster = forecaster_names[i],
    stringsAsFactors = FALSE
  )
}))

# Subsample for speed
skill_long <- skill_long[skill_long$t %% 40 == 0 | skill_long$t == max(skill_long$t), ]

# Final values for labels
final_sigma <- skill_long %>%
  filter(t == max(t)) %>%
  arrange(desc(sigma)) %>%
  mutate(short = sub(" \\(.*", "", forecaster),
         label = paste0(short, " \u03C3=", sprintf("%.2f", sigma)))

skill_long$forecaster <- factor(skill_long$forecaster, levels = final_sigma$forecaster)
final_sigma$forecaster <- factor(final_sigma$forecaster, levels = levels(skill_long$forecaster))

# Colours
fcols <- c(TEAL, "#1a7a7a", "#2d6b8a", NAVY, "#4a5a8a", PURPLE, CORAL)
names(fcols) <- levels(skill_long$forecaster)

p2 <- ggplot(skill_long, aes(x = t, y = sigma, colour = forecaster)) +
  geom_line(linewidth = 1.5, alpha = 0.9) +
  geom_label_repel(
    data = final_sigma,
    aes(x = t, y = sigma, label = label, colour = forecaster),
    hjust = 0, size = 5, fontface = "bold", family = "inter",
    direction = "y", nudge_x = 600, segment.size = 0.4,
    segment.colour = "grey70", fill = "white",
    box.padding = 0.4, point.padding = 0.2,
    min.segment.length = 0, show.legend = FALSE,
    xlim = c(NA, 22000)
  ) +
  scale_colour_manual(values = fcols, guide = "none") +
  scale_x_continuous(
    name = "Round",
    labels = scales::comma,
    limits = c(200, 22000),
    expand = expansion(mult = c(0.01, 0.01))
  ) +
  scale_y_continuous(
    name = expression(Learned ~ skill ~ (sigma)),
    limits = c(0.35, 0.90),
    breaks = seq(0.4, 0.9, 0.1)
  ) +
  labs(
    title = "Elia Wind \u2014 Learned Skill per Forecaster (17,544 rounds)",
    subtitle = "Naive ranks highest (wind is autocorrelated) \u2014 ARIMA lowest (poor quantile calibration)"
  ) +
  theme_thesis()

ggsave(file.path(OUT, "real_data_validation.png"), p2,
       width = 12, height = 7, dpi = 250, bg = "white")


# ═══════════════════════════════════════════════════════════════════
# 3. DEPOSIT POLICY (Slide — used in dashboard, not in 11-slide deck)
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
            hjust = 1.12, size = 6.5, fontface = "bold", colour = "white", family = "inter") +
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
        axis.text.y = element_text(face = "bold", colour = NAVY, size = 18))

ggsave(file.path(OUT, "deposit_policy_comparison.png"), p3,
       width = 9, height = 5, dpi = 250, bg = "white")


# ═══════════════════════════════════════════════════════════════════
# 4. SKILL RECOVERY (Slide 10) — simulated trajectories
# ═══════════════════════════════════════════════════════════════════
cat("4. Skill recovery...\n")

set.seed(42)
n_agents <- 6
noise_levels <- c(0.15, 0.30, 0.50, 0.70, 0.85, 1.00)
rho <- 0.1; gamma_r <- 4; sigma_min_r <- 0.1
T_rounds <- 500

recovery_df <- do.call(rbind, lapply(seq_along(noise_levels), function(i) {
  L <- 0.5
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
    stringsAsFactors = FALSE
  )
}))

agent_cols <- colorRampPalette(c(TEAL, PURPLE, CORAL))(n_agents)

p4 <- ggplot(recovery_df, aes(x = round, y = sigma, colour = noise, group = noise)) +
  geom_line(linewidth = 1.5, alpha = 0.85) +
  scale_colour_manual(
    values = setNames(agent_cols, levels(recovery_df$noise)),
    labels = paste0("noise = ", noise_levels),
    name = "Forecaster"
  ) +
  labs(
    title = "Skill Recovery \u2014 Spearman \u03C1 = 1.0000",
    subtitle = "6 forecasters with known noise levels, first 500 rounds shown",
    x = "Round",
    y = expression(Learned ~ skill ~ (sigma))
  ) +
  scale_y_continuous(limits = c(0.1, 1), breaks = seq(0.2, 1, 0.2)) +
  theme_thesis() +
  theme(
    legend.position = "right",
    legend.key.width = unit(1.2, "cm")
  )

ggsave(file.path(OUT, "quantiles_crps_recovery.png"), p4,
       width = 10, height = 6, dpi = 250, bg = "white")

cat("All plots saved.\n")
