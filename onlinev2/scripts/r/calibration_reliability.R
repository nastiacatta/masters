#!/usr/bin/env Rscript
# Calibration: reliability curve p_hat(tau) vs tau. Perfect calibration is the diagonal.
args <- commandArgs(trailingOnly = TRUE)
outdir <- if (length(args) >= 1) args[1] else "outputs"

if (!requireNamespace("ggplot2", quietly = TRUE)) {
  stop("Install ggplot2: install.packages('ggplot2')")
}
library(ggplot2)

PINK <- "#E91E8C"

cal_file <- file.path(outdir, "calibration_reliability.csv")
out_file <- file.path(outdir, "calibration_reliability.png")

if (!file.exists(cal_file)) {
  stop("Missing: ", cal_file)
}
d <- read.csv(cal_file, na.strings = c("NA", "nan", "NaN", ""))

p <- ggplot(d, aes(x = tau, y = p_hat)) +
  geom_point(color = PINK, size = 3) +
  geom_line(color = PINK, linewidth = 0.8) +
  geom_abline(slope = 1, intercept = 0, linetype = "dashed", color = "gray50", linewidth = 0.8) +
  coord_fixed(xlim = c(0, 1), ylim = c(0, 1)) +
  labs(
    x = expression(tau),
    y = expression(hat(p)(tau)),
    title = "Quantile reliability curve (aggregate forecast)"
  ) +
  theme_minimal()

ggsave(out_file, p, width = 6, height = 5, dpi = 100)
cat("Saved", out_file, "\n")
