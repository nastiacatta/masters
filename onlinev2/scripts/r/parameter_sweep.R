#!/usr/bin/env Rscript
# Parameter sweep: heatmaps over lam and sigma_min (CRPS-hat, Gini, frac meaningful market)
args <- commandArgs(trailingOnly = TRUE)
outdir <- if (length(args) >= 1) args[1] else "outputs"

if (!requireNamespace("ggplot2", quietly = TRUE)) {
  stop("Install ggplot2: install.packages('ggplot2')")
}
library(ggplot2)

sweep_file <- file.path(outdir, "parameter_sweep.csv")
out_crps <- file.path(outdir, "parameter_sweep_crps.png")
out_gini <- file.path(outdir, "parameter_sweep_gini.png")
out_frac <- file.path(outdir, "parameter_sweep_frac_meaningful.png")

if (!file.exists(sweep_file)) {
  stop("Missing: ", sweep_file)
}
d <- read.csv(sweep_file, na.strings = c("NA", "nan", "NaN", ""))

p_crps <- ggplot(d, aes(x = factor(lam), y = factor(sigma_min), fill = mean_crps_hat)) +
  geom_tile() +
  geom_text(aes(label = sprintf("%.3f", mean_crps_hat)), color = "white", size = 2.5) +
  scale_fill_gradient(low = "#f0f0f0", high = "#E91E8C", name = "Mean CRPS-hat") +
  labs(x = expression(lambda), y = expression(sigma[min]), title = "Aggregate loss (CRPS-hat)") +
  theme_minimal() +
  theme(panel.grid = element_blank())

p_gini <- ggplot(d, aes(x = factor(lam), y = factor(sigma_min), fill = gini_profit)) +
  geom_tile() +
  geom_text(aes(label = sprintf("%.2f", gini_profit)), color = "white", size = 2.5) +
  scale_fill_gradient(low = "#f0f0f0", high = "#E91E8C", name = "Gini (profits)") +
  labs(x = expression(lambda), y = expression(sigma[min]), title = "Payout concentration (Gini)") +
  theme_minimal() +
  theme(panel.grid = element_blank())

p_frac <- ggplot(d, aes(x = factor(lam), y = factor(sigma_min), fill = frac_meaningful_market)) +
  geom_tile() +
  geom_text(aes(label = sprintf("%.2f", frac_meaningful_market)), color = "white", size = 2.5) +
  scale_fill_gradient(low = "#f0f0f0", high = "#E91E8C", name = "Fraction") +
  labs(x = expression(lambda), y = expression(sigma[min]), title = "Fraction of rounds with meaningful market") +
  theme_minimal() +
  theme(panel.grid = element_blank())

ggsave(out_crps, p_crps, width = 6, height = 5, dpi = 100)
ggsave(out_gini, p_gini, width = 6, height = 5, dpi = 100)
ggsave(out_frac, p_frac, width = 6, height = 5, dpi = 100)
cat("Saved", out_crps, out_gini, out_frac, "\n")
