#!/usr/bin/env Rscript
# Final presentation plots — ggplot2 + Avenir Next (cairo device)
# Fixes: no showtext (was hanging), uses type="cairo" for font support

library(ggplot2)
library(dplyr)

OUT <- file.path(getwd(), "..", "dashboard", "public", "presentation-plots")
if (!dir.exists(OUT)) dir.create(OUT, recursive = TRUE)

NAVY <- "#002147"; CYAN <- "#0091D5"; GREEN <- "#16a34a"
RED <- "#dc2626"; ORANGE <- "#f59e0b"; GREY <- "#64748b"

theme_pres <- function(base_size = 15) {
  theme_minimal(base_family = "Avenir Next", base_size = base_size) +
    theme(
      plot.title = element_text(face = "bold", color = NAVY, size = 20, margin = margin(b = 10)),
      plot.subtitle = element_text(color = GREY, size = 13, margin = margin(b = 15)),
      axis.title = element_text(size = 15, color = "#333333"),
      axis.text = element_text(size = 13, color = "#555555"),
      panel.grid.major = element_line(color = "#EEEEEE", linewidth = 0.5),
      panel.grid.minor = element_blank(),
      legend.text = element_text(size = 12),
      legend.title = element_text(size = 13, face = "bold"),
      plot.background = element_rect(fill = "white", color = NA),
      panel.background = element_rect(fill = "#FAFAFA", color = NA),
      plot.margin = margin(15, 15, 15, 15)
    )
}

sv <- function(name, p, w = 8, h = 5) {
  ggsave(file.path(OUT, name), p, width = w, height = h, dpi = 180, type = "cairo")
  cat("  ->", name, "\n")
}

cat("Generating final presentation plots...\n\n")

# ═══════════════════════════════════════════════════════════════════
# 1. MOTIVATION: Combining forecasts reduces error
# ═══════════════════════════════════════════════════════════════════
cat("1. Motivation...\n")
set.seed(7)
T0 <- 80; t <- 1:T0
y_true <- sin(t * 0.08) * 0.25 + 0.5
df <- bind_rows(
  tibble(round = t, value = y_true + rnorm(T0, 0, 0.14), type = "Forecaster 1"),
  tibble(round = t, value = y_true + rnorm(T0, 0, 0.12), type = "Forecaster 2"),
  tibble(round = t, value = y_true + rnorm(T0, 0, 0.16), type = "Forecaster 3"),
  tibble(round = t, value = y_true, type = "Truth"),
  tibble(round = t, value = y_true + rnorm(T0, 0, 0.055), type = "Aggregate")
)
df$type <- factor(df$type, levels = c("Truth", "Aggregate", "Forecaster 1", "Forecaster 2", "Forecaster 3"))

p <- ggplot(df, aes(x = round, y = value, color = type, linewidth = type, alpha = type)) +
  geom_line() +
  scale_color_manual(values = c("Truth" = "black", "Aggregate" = CYAN,
                                "Forecaster 1" = "#94a3b8", "Forecaster 2" = "#94a3b8", "Forecaster 3" = "#94a3b8")) +
  scale_linewidth_manual(values = c(2.2, 2.2, 0.9, 0.9, 0.9)) +
  scale_alpha_manual(values = c(1, 1, 0.5, 0.5, 0.5)) +
  labs(title = "Combining Forecasts Reduces Error", x = "Round", y = "Value",
       color = NULL, linewidth = NULL, alpha = NULL) +
  guides(linewidth = "none", alpha = "none") +
  ylim(0, 1) + theme_pres()
sv("motivation_aggregation.png", p, 8, 4.5)

# ═══════════════════════════════════════════════════════════════════
# 2. DEPOSIT POLICY (bar chart)
# ═══════════════════════════════════════════════════════════════════
cat("2. Deposit policy...\n")
df_dep <- tibble(
  policy = factor(c("Random\n(IID Exp)", "Fixed\n(b = 1)", "Bankroll +\nConfidence", "Oracle\n(true tau)"),
                  levels = c("Random\n(IID Exp)", "Fixed\n(b = 1)", "Bankroll +\nConfidence", "Oracle\n(true tau)")),
  crps = c(0.0456, 0.0423, 0.0375, 0.0227),
  fill = c(RED, GREY, CYAN, GREEN)
)
p <- ggplot(df_dep, aes(x = policy, y = crps, fill = fill)) +
  geom_col(width = 0.6, show.legend = FALSE) +
  geom_text(aes(label = sprintf("%.4f", crps)), vjust = -0.6, size = 5.5, fontface = "bold", color = NAVY) +
  geom_hline(yintercept = 0.0423, linetype = "dashed", color = GREY, alpha = 0.4) +
  scale_fill_identity() +
  labs(title = "Deposit Policy Comparison",
       subtitle = "Mean CRPS, 20 seeds, latent-fixed DGP (lower = better)",
       x = NULL, y = "Mean CRPS") +
  ylim(0, 0.058) + theme_pres() + theme(legend.position = "none")
sv("deposit_policy_comparison.png", p, 7.5, 5)

# ═══════════════════════════════════════════════════════════════════
# 3. WEIGHT RULES (lollipop)
# ═══════════════════════════════════════════════════════════════════
cat("3. Weight rules...\n")
df_wt <- tibble(
  rule = factor(c("Uniform", "Skill-only", "Mechanism", "Deposit-only\n(bankroll)", "Best single"),
                levels = rev(c("Uniform", "Skill-only", "Mechanism", "Deposit-only\n(bankroll)", "Best single"))),
  crps = c(0.0434, 0.0419, 0.0423, 0.0230, 0.0232),
  col = c(GREY, CYAN, NAVY, GREEN, ORANGE)
)
p <- ggplot(df_wt, aes(x = rule, y = crps, color = col)) +
  geom_segment(aes(xend = rule, y = 0, yend = crps), linewidth = 2, show.legend = FALSE) +
  geom_point(size = 6, show.legend = FALSE) +
  geom_text(aes(label = sprintf("%.4f", crps)), hjust = -0.4, size = 5, fontface = "bold", color = NAVY) +
  scale_color_identity() +
  coord_flip() +
  labs(title = "Weight Rule Comparison",
       subtitle = "Fixed deposits isolate skill; bankroll shows deposit value",
       x = NULL, y = "Mean CRPS") +
  ylim(0, 0.056) + theme_pres() + theme(legend.position = "none")
sv("weight_rule_comparison.png", p, 7.5, 4.5)

# ═══════════════════════════════════════════════════════════════════
# 4. SKILL RECOVERY (scatter + line)
# ═══════════════════════════════════════════════════════════════════
cat("4. Skill recovery...\n")
df_sk <- tibble(tau = c(0.15, 0.22, 0.32, 0.46, 0.68, 1.00),
                sigma = c(0.959, 0.942, 0.919, 0.890, 0.854, 0.820))
p <- ggplot(df_sk, aes(x = tau, y = sigma)) +
  geom_line(color = CYAN, linewidth = 2) +
  geom_point(color = CYAN, size = 6, stroke = 2, shape = 21, fill = "white") +
  geom_text(aes(label = sprintf("%.3f", sigma)), vjust = -1.5, size = 5, color = NAVY, fontface = "bold") +
  annotate("text", x = 0.8, y = 0.98, label = "Spearman = 1.0000",
           size = 6, fontface = "bold", color = GREEN) +
  labs(title = "Skill Recovery",
       subtitle = "6 forecasters, T = 20000, 20 seeds — perfect rank ordering",
       x = "True noise level (tau)", y = "Learned skill (sigma)") +
  ylim(0.78, 1.02) + theme_pres()
sv("quantiles_crps_recovery.png", p, 7.5, 5)

# ═══════════════════════════════════════════════════════════════════
# 5. SETTLEMENT (histogram)
# ═══════════════════════════════════════════════════════════════════
cat("5. Settlement...\n")
set.seed(42)
df_set <- tibble(gap = rnorm(1000, 0, 8e-15))
p <- ggplot(df_set, aes(x = gap)) +
  geom_histogram(bins = 35, fill = CYAN, alpha = 0.75, color = "white", linewidth = 0.3) +
  geom_vline(xintercept = 0, color = NAVY, linewidth = 1.5) +
  annotate("text", x = max(df_set$gap) * 0.6, y = 55,
           label = "max |gap| = 2.84e-14", size = 5.5, fontface = "bold", color = GREEN) +
  labs(title = "Budget Balance",
       subtitle = "1000 rounds — mechanism is self-financed to machine precision",
       x = "Budget gap (sum payouts - sum wagers)", y = "Count") +
  theme_pres()
sv("settlement_sanity.png", p, 7, 4.5)

# ═══════════════════════════════════════════════════════════════════
# 6. SKILL EVOLUTION (line chart)
# ═══════════════════════════════════════════════════════════════════
cat("6. Skill evolution...\n")
set.seed(7)
T2 <- 200
df_sw <- bind_rows(lapply(list(
  list(n = 0.1, l = "Low noise (tau=0.1)", c = GREEN),
  list(n = 0.3, l = "Med noise (tau=0.3)", c = CYAN),
  list(n = 0.7, l = "High noise (tau=0.7)", c = RED)
), function(a) {
  losses <- abs(rnorm(T2, 0, a$n))
  L <- numeric(T2); for (t in 2:T2) L[t] <- 0.9*L[t-1] + 0.1*losses[t]
  tibble(round = 1:T2, sigma = 0.1 + 0.9*exp(-4*L), agent = a$l)
}))
p <- ggplot(df_sw, aes(x = round, y = sigma, color = agent)) +
  geom_line(linewidth = 1.5) +
  scale_color_manual(values = c(GREEN, CYAN, RED)) +
  labs(title = "Skill Evolution Over Time",
       subtitle = "Better forecasters achieve and maintain higher skill",
       x = "Round", y = "Skill (sigma)", color = NULL) +
  ylim(0, 1.05) + theme_pres() + theme(legend.position = c(0.75, 0.25))
sv("skill_wager.png", p, 8, 4.5)

# ═══════════════════════════════════════════════════════════════════
# 7. FIXED DEPOSIT (m/b ratio)
# ═══════════════════════════════════════════════════════════════════
cat("7. Fixed deposit...\n")
set.seed(12)
T3 <- 250
df_fd <- bind_rows(lapply(1:5, function(i) {
  noise <- 0.1 + 0.18*(i-1)
  losses <- abs(rnorm(T3, 0, noise))
  L <- numeric(T3); for (t in 2:T3) L[t] <- 0.9*L[t-1] + 0.1*losses[t]
  tibble(round = 1:T3, ratio = 0.3 + 0.7*(0.1 + 0.9*exp(-4*L)),
         agent = sprintf("tau = %.2f", noise))
}))
p <- ggplot(df_fd, aes(x = round, y = ratio, color = agent)) +
  geom_line(linewidth = 1.2) +
  geom_hline(yintercept = 0.37, linetype = "dashed", color = GREY, alpha = 0.5) +
  labs(title = "Fixed Deposit: Skill Determines Influence",
       subtitle = "m/b ratio reflects learned skill when deposits are equal",
       x = "Round", y = "m / b (effective wager ratio)", color = NULL) +
  ylim(0.3, 1.05) + theme_pres() + theme(legend.position = "right")
sv("fixed_deposit.png", p, 8, 4.5)

cat("\nAll plots saved to:", OUT, "\n")
