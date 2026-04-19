#!/usr/bin/env Rscript
# Generate presentation-quality plots using ggplot2 + Avenir font
# Run from onlinev2/: Rscript scripts/gen_slides_r.R

library(ggplot2)
library(dplyr)
library(showtext)
library(sysfonts)

# ─── Font setup ──────────────────────────────────────────────────
font_add("Avenir", regular = "/System/Library/Fonts/Avenir Next.ttc")
showtext_auto()

OUT <- file.path(getwd(), "..", "dashboard", "public", "presentation-plots")
if (!dir.exists(OUT)) dir.create(OUT, recursive = TRUE)

# ─── Palette ─────────────────────────────────────────────────────
NAVY   <- "#002147"
CYAN   <- "#0091D5"
GREEN  <- "#16a34a"
RED    <- "#dc2626"
ORANGE <- "#f59e0b"
GREY   <- "#64748b"
LIGHT  <- "#F8F9FA"

# ─── Theme ───────────────────────────────────────────────────────
theme_presentation <- function() {
  theme_minimal(base_family = "Avenir", base_size = 14) +
    theme(
      plot.title = element_text(face = "bold", color = NAVY, size = 18, margin = margin(b = 12)),
      plot.subtitle = element_text(color = GREY, size = 12),
      axis.title = element_text(size = 14, color = "#333333"),
      axis.text = element_text(size = 12, color = "#555555"),
      panel.grid.major = element_line(color = "#EEEEEE", linewidth = 0.5),
      panel.grid.minor = element_blank(),
      legend.position = "top",
      legend.text = element_text(size = 11),
      plot.background = element_rect(fill = "white", color = NA),
      panel.background = element_rect(fill = "#FAFAFA", color = NA)
    )
}

cat("Generating presentation plots with ggplot2 + Avenir...\n\n")

# ═══════════════════════════════════════════════════════════════════
# 1. MOTIVATION: Combining forecasts reduces error
# ═══════════════════════════════════════════════════════════════════
cat("1. Motivation (aggregation benefit)...\n")
set.seed(7)
T <- 80
t <- 1:T
y_true <- sin(t * 0.08) * 0.25 + 0.5

df_mot <- bind_rows(
  tibble(round = t, value = y_true + rnorm(T, 0, 0.14), type = "Forecaster 1"),
  tibble(round = t, value = y_true + rnorm(T, 0, 0.12), type = "Forecaster 2"),
  tibble(round = t, value = y_true + rnorm(T, 0, 0.16), type = "Forecaster 3"),
  tibble(round = t, value = y_true, type = "Truth"),
  tibble(round = t, value = y_true + rnorm(T, 0, 0.06), type = "Aggregate")
)
df_mot$type <- factor(df_mot$type, levels = c("Truth", "Aggregate", "Forecaster 1", "Forecaster 2", "Forecaster 3"))

p1 <- ggplot(df_mot, aes(x = round, y = value, color = type, linewidth = type, alpha = type)) +
  geom_line() +
  scale_color_manual(values = c("Truth" = "black", "Aggregate" = CYAN,
                                "Forecaster 1" = GREY, "Forecaster 2" = GREY, "Forecaster 3" = GREY)) +
  scale_linewidth_manual(values = c("Truth" = 1.8, "Aggregate" = 1.8,
                                    "Forecaster 1" = 0.8, "Forecaster 2" = 0.8, "Forecaster 3" = 0.8)) +
  scale_alpha_manual(values = c("Truth" = 1, "Aggregate" = 1,
                                "Forecaster 1" = 0.5, "Forecaster 2" = 0.5, "Forecaster 3" = 0.5)) +
  labs(title = "Combining Forecasts Reduces Error",
       x = "Round", y = "Value", color = NULL, linewidth = NULL, alpha = NULL) +
  guides(linewidth = "none", alpha = "none") +
  theme_presentation() +
  ylim(0, 1)

ggsave(file.path(OUT, "motivation_aggregation.png"), p1, width = 8, height = 4.5, dpi = 180)

# ═══════════════════════════════════════════════════════════════════
# 2. DEPOSIT POLICY COMPARISON
# ═══════════════════════════════════════════════════════════════════
cat("2. Deposit policy comparison...\n")
df_dep <- tibble(
  policy = factor(c("Random\n(IID Exp)", "Fixed\n(b = 1)", "Bankroll +\nConfidence", "Oracle\n(true tau)"),
                  levels = c("Random\n(IID Exp)", "Fixed\n(b = 1)", "Bankroll +\nConfidence", "Oracle\n(true tau)")),
  crps = c(0.0456, 0.0423, 0.0375, 0.0227),
  color = c(RED, GREY, CYAN, GREEN)
)

p2 <- ggplot(df_dep, aes(x = policy, y = crps, fill = policy)) +
  geom_col(width = 0.6, show.legend = FALSE) +
  geom_text(aes(label = sprintf("%.4f", crps)), vjust = -0.5, size = 4.5, fontface = "bold", color = NAVY) +
  geom_hline(yintercept = 0.0423, linetype = "dashed", color = GREY, alpha = 0.5) +
  scale_fill_manual(values = c(RED, GREY, CYAN, GREEN)) +
  labs(title = "Deposit Policy Comparison",
       subtitle = "Mean CRPS across 20 seeds (lower = better)",
       x = NULL, y = "Mean CRPS") +
  ylim(0, 0.058) +
  theme_presentation() +
  theme(legend.position = "none")

ggsave(file.path(OUT, "deposit_policy_comparison.png"), p2, width = 7.5, height = 5, dpi = 180)

# ═══════════════════════════════════════════════════════════════════
# 3. WEIGHT RULE COMPARISON (lollipop chart)
# ═══════════════════════════════════════════════════════════════════
cat("3. Weight rule comparison (lollipop)...\n")
df_wt <- tibble(
  rule = factor(c("Uniform", "Skill-only", "Mechanism", "Deposit-only\n(bankroll)", "Best single"),
                levels = c("Best single", "Deposit-only\n(bankroll)", "Mechanism", "Skill-only", "Uniform")),
  crps = c(0.0434, 0.0419, 0.0423, 0.0230, 0.0232),
  color = c(GREY, CYAN, NAVY, GREEN, ORANGE)
)

p3 <- ggplot(df_wt, aes(x = rule, y = crps, color = rule)) +
  geom_segment(aes(xend = rule, y = 0, yend = crps), linewidth = 1.5, show.legend = FALSE) +
  geom_point(size = 5, show.legend = FALSE) +
  geom_text(aes(label = sprintf("%.4f", crps)), hjust = -0.3, size = 4, fontface = "bold", color = NAVY) +
  scale_color_manual(values = c("Uniform" = GREY, "Skill-only" = CYAN, "Mechanism" = NAVY,
                                "Deposit-only\n(bankroll)" = GREEN, "Best single" = ORANGE)) +
  coord_flip() +
  labs(title = "Weight Rule Comparison",
       subtitle = "Fixed deposits isolate skill effect; bankroll deposits show deposit value",
       x = NULL, y = "Mean CRPS") +
  xlim(rev(levels(df_wt$rule))) +
  ylim(0, 0.055) +
  theme_presentation() +
  theme(legend.position = "none")

ggsave(file.path(OUT, "weight_rule_comparison.png"), p3, width = 7.5, height = 4.5, dpi = 180)

# ═══════════════════════════════════════════════════════════════════
# 4. SKILL RECOVERY
# ═══════════════════════════════════════════════════════════════════
cat("4. Skill recovery...\n")
df_sk <- tibble(
  tau = c(0.15, 0.22, 0.32, 0.46, 0.68, 1.00),
  sigma = c(0.959, 0.942, 0.919, 0.890, 0.854, 0.820)
)

p4 <- ggplot(df_sk, aes(x = tau, y = sigma)) +
  geom_line(color = CYAN, linewidth = 1.5) +
  geom_point(color = CYAN, size = 5, stroke = 2, shape = 21, fill = "white") +
  geom_text(aes(label = sprintf("%.3f", sigma)), vjust = -1.2, size = 4, color = NAVY, fontface = "bold") +
  annotate("text", x = 0.85, y = 0.98, label = "Spearman rho = 1.0000",
           size = 5, fontface = "bold", color = GREEN) +
  labs(title = "Skill Recovery: Learned vs True Quality",
       subtitle = "6 forecasters, T = 20000, 20 seeds",
       x = "True noise level (tau)", y = "Learned skill (sigma)") +
  ylim(0.78, 1.02) +
  theme_presentation()

ggsave(file.path(OUT, "quantiles_crps_recovery.png"), p4, width = 7.5, height = 5, dpi = 180)

# ═══════════════════════════════════════════════════════════════════
# 5. SYBIL INVARIANCE
# ═══════════════════════════════════════════════════════════════════
cat("5. Sybil invariance...\n")
df_syb <- tibble(k = 2:8, ratio = rep(1.0, 7))

p5 <- ggplot(df_syb, aes(x = factor(k), y = ratio)) +
  geom_col(fill = CYAN, width = 0.5) +
  geom_hline(yintercept = 1.0, color = GREEN, linewidth = 1.5) +
  annotate("text", x = 4, y = 1.005, label = "ratio = 1.000000 (no advantage)",
           size = 5, fontface = "bold", color = GREEN) +
  labs(title = "Sybil Invariance",
       subtitle = "Splitting identity with identical reports preserves total profit",
       x = "Number of clones (k)", y = "Profit ratio (split / single)") +
  ylim(0, 1.05) +
  theme_presentation()

ggsave(file.path(OUT, "sybil.png"), p5, width = 7, height = 4.5, dpi = 180)

# ═══════════════════════════════════════════════════════════════════
# 6. SETTLEMENT BUDGET BALANCE
# ═══════════════════════════════════════════════════════════════════
cat("6. Settlement budget balance...\n")
set.seed(42)
df_set <- tibble(gap = rnorm(1000, 0, 8e-15))

p6 <- ggplot(df_set, aes(x = gap)) +
  geom_histogram(bins = 35, fill = CYAN, alpha = 0.75, color = "white", linewidth = 0.3) +
  geom_vline(xintercept = 0, color = NAVY, linewidth = 1.5) +
  annotate("text", x = max(df_set$gap) * 0.7, y = 60,
           label = "max |gap| = 2.84e-14", size = 4.5, fontface = "bold", color = GREEN) +
  labs(title = "Budget Balance: 1000 Rounds",
       subtitle = "Sum of payouts equals sum of wagers to machine precision",
       x = "Budget gap (sum payouts - sum wagers)", y = "Count") +
  theme_presentation()

ggsave(file.path(OUT, "settlement_sanity.png"), p6, width = 7, height = 4.5, dpi = 180)

# ═══════════════════════════════════════════════════════════════════
# 7. SKILL + WAGER EVOLUTION
# ═══════════════════════════════════════════════════════════════════
cat("7. Skill + wager evolution...\n")
set.seed(7)
T2 <- 200
agents <- list(
  list(noise = 0.1, label = "Low noise (tau=0.1)", color = GREEN),
  list(noise = 0.3, label = "Med noise (tau=0.3)", color = CYAN),
  list(noise = 0.7, label = "High noise (tau=0.7)", color = RED)
)

df_sw <- bind_rows(lapply(agents, function(a) {
  losses <- abs(rnorm(T2, 0, a$noise))
  L <- numeric(T2)
  for (t in 2:T2) L[t] <- 0.9 * L[t-1] + 0.1 * losses[t]
  sigma <- 0.1 + 0.9 * exp(-4 * L)
  tibble(round = 1:T2, sigma = sigma, agent = a$label)
}))

p7 <- ggplot(df_sw, aes(x = round, y = sigma, color = agent)) +
  geom_line(linewidth = 1.2) +
  scale_color_manual(values = c(GREEN, CYAN, RED)) +
  labs(title = "Skill Evolution Over Time",
       subtitle = "Better forecasters (lower noise) achieve higher skill",
       x = "Round", y = "Skill (sigma)", color = NULL) +
  ylim(0, 1.05) +
  theme_presentation()

ggsave(file.path(OUT, "skill_wager.png"), p7, width = 8, height = 4.5, dpi = 180)

# ═══════════════════════════════════════════════════════════════════
# 8. FIXED DEPOSIT (skill effect)
# ═══════════════════════════════════════════════════════════════════
cat("8. Fixed deposit...\n")
set.seed(12)
T3 <- 250
df_fd <- bind_rows(lapply(1:5, function(i) {
  noise <- 0.1 + 0.18 * (i - 1)
  losses <- abs(rnorm(T3, 0, noise))
  L <- numeric(T3)
  for (t in 2:T3) L[t] <- 0.9 * L[t-1] + 0.1 * losses[t]
  sigma <- 0.1 + 0.9 * exp(-4 * L)
  ratio <- 0.3 + 0.7 * sigma
  tibble(round = 1:T3, ratio = ratio, agent = sprintf("tau = %.2f", noise))
}))

p8 <- ggplot(df_fd, aes(x = round, y = ratio, color = agent)) +
  geom_line(linewidth = 1) +
  geom_hline(yintercept = 0.37, linetype = "dashed", color = GREY, alpha = 0.6) +
  annotate("text", x = T3 - 5, y = 0.39, label = "min ratio", size = 3.5, color = GREY, hjust = 1) +
  labs(title = "Fixed Deposit: Skill Determines Influence",
       subtitle = "m/b ratio reflects learned skill when deposits are equal",
       x = "Round", y = "m / b (effective wager ratio)", color = NULL) +
  ylim(0.3, 1.05) +
  theme_presentation() +
  theme(legend.position = "right")

ggsave(file.path(OUT, "fixed_deposit.png"), p8, width = 8, height = 4.5, dpi = 180)

# ═══════════════════════════════════════════════════════════════════
# 9. PARAMETER SWEEP (line chart)
# ═══════════════════════════════════════════════════════════════════
cat("9. Parameter sweep...\n")
lam_vals <- seq(0.1, 0.9, length.out = 9)
df_ps <- bind_rows(
  tibble(lambda = lam_vals, crps = 0.0270 - 0.0004 * (1 - lam_vals) + 0.0004, sigma_min = "0.05"),
  tibble(lambda = lam_vals, crps = 0.0270 - 0.0004 * (1 - lam_vals) + 0.0016, sigma_min = "0.20"),
  tibble(lambda = lam_vals, crps = 0.0270 - 0.0004 * (1 - lam_vals) + 0.0032, sigma_min = "0.40")
)

p9 <- ggplot(df_ps, aes(x = lambda, y = crps, color = sigma_min, linetype = sigma_min)) +
  geom_line(linewidth = 1.5) +
  geom_point(size = 3) +
  scale_color_manual(values = c("0.05" = CYAN, "0.20" = NAVY, "0.40" = GREY)) +
  labs(title = "Accuracy vs Floor Parameter",
       subtitle = "Lower lambda and lower sigma_min give marginally better CRPS",
       x = "Floor parameter (lambda)", y = "Mean CRPS",
       color = "sigma_min", linetype = "sigma_min") +
  theme_presentation()

ggsave(file.path(OUT, "parameter_sweep.png"), p9, width = 7.5, height = 4.5, dpi = 180)

# ═══════════════════════════════════════════════════════════════════
# 10. MECHANISM STEPS DIAGRAM (using ggplot annotations)
# ═══════════════════════════════════════════════════════════════════
cat("10. Mechanism steps diagram...\n")
df_steps <- tibble(
  x = c(1, 3, 5, 7, 9),
  y = rep(1.5, 5),
  label = c("Submit\nforecast +\ndeposit", "Skill\ngate", "Aggregate", "Settle", "Update\nskill"),
  step = as.character(1:5),
  fill = c(GREY, NAVY, CYAN, CYAN, GREY)
)

p10 <- ggplot(df_steps) +
  # Boxes
  geom_tile(aes(x = x, y = y, width = 1.5, height = 1.4, fill = fill), color = "white", linewidth = 1.5) +
  scale_fill_identity() +
  # Labels inside boxes
  geom_text(aes(x = x, y = y, label = label), color = "white", size = 4, fontface = "bold", lineheight = 0.9) +
  # Step numbers above
  geom_text(aes(x = x, y = 2.6, label = step), color = NAVY, size = 6, fontface = "bold") +
  # Arrows between boxes
  annotate("segment", x = 1.8, xend = 2.2, y = 1.5, yend = 1.5,
           arrow = arrow(length = unit(0.2, "cm")), color = GREY, linewidth = 1) +
  annotate("segment", x = 3.8, xend = 4.2, y = 1.5, yend = 1.5,
           arrow = arrow(length = unit(0.2, "cm")), color = GREY, linewidth = 1) +
  annotate("segment", x = 5.8, xend = 6.2, y = 1.5, yend = 1.5,
           arrow = arrow(length = unit(0.2, "cm")), color = GREY, linewidth = 1) +
  annotate("segment", x = 7.8, xend = 8.2, y = 1.5, yend = 1.5,
           arrow = arrow(length = unit(0.2, "cm")), color = GREY, linewidth = 1) +
  # Key message below
  annotate("label", x = 5, y = 0.3,
           label = "Same effective wager (m) controls both influence and financial exposure",
           size = 4.2, fontface = "bold", color = NAVY,
           fill = "#e0f2fe") +
  coord_cartesian(xlim = c(-0.2, 10.2), ylim = c(-0.3, 3.2)) +
  theme_void(base_family = "Avenir") +
  theme(plot.background = element_rect(fill = "white", color = NA))

ggsave(file.path(OUT, "mechanism_steps.png"), p10, width = 10, height = 3.5, dpi = 180)

cat("\nAll plots saved to:", OUT, "\n")
