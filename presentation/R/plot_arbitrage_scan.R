# presentation/R/plot_arbitrage_scan.R
# Arbitrage profit as a function of the skill-gate floor lambda.
# Implements the mean-absolute-error analogue of Chen-Devanur-Pennock-
# Vaughan (2014) Theorem 3.3, so the plot is a direct empirical
# verification of the theorem: profit rises monotonically with lambda.
#
# Reads:
#   onlinev2/outputs/behaviour/experiments/arbitrage_scan/data/
#     arbitrage_scan_by_lam.csv
#
# Writes:
#   dashboard/public/presentation-plots/arbitrage_scan.png
#   writing/figures/arbitrage.png

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(ggplot2)
})

path <- "onlinev2/outputs/behaviour/experiments/arbitrage_scan/data/arbitrage_scan_by_lam.csv"
if (!file.exists(path)) stop(sprintf("Missing %s", path))

df <- read.csv(path, stringsAsFactors = FALSE) |>
  arrange(lam) |>
  mutate(
    lam_fac = factor(lam, levels = lam,
                     labels = sprintf("%.1f", lam))
  )

y_label <- expression(bold("Cumulative arbitrageur profit") ~
                        "(per 1,000 rounds)")

p <- ggplot(df, aes(x = lam_fac, y = mean_profit)) +
  geom_col(fill = PALETTE$coral, width = 0.65,
           colour = "white", linewidth = 0.6) +
  geom_errorbar(aes(ymin = ci_low, ymax = ci_high),
                width = 0.18, linewidth = 0.6,
                colour = PALETTE$charcoal) +
  geom_text(aes(y = ci_high,
                label = sprintf("%+.1f", mean_profit)),
            vjust = -0.8, size = TYPO$annot_small,
            fontface = "bold", colour = PALETTE$charcoal) +
  scale_y_continuous(
    expand = expansion(mult = c(0, 0.18)),
    breaks = seq(0, 30, 5)
  ) +
  labs(
    x = expression(bold("Skill-gate floor") ~ lambda),
    y = y_label,
    caption = "20 seeds, T = 1,000 rounds; error bars are 95% CIs"
  ) +
  theme_thesis(base_size = 14)

save_dual(p, "arbitrage_scan.png", width = 12, height = 7)

if (!dir.exists("writing/figures")) dir.create("writing/figures", recursive = TRUE)
ggsave("writing/figures/arbitrage.png", plot = p,
       width = 12, height = 7, dpi = 300, bg = "white")
message("Saved: writing/figures/arbitrage.png")
message("Done: arbitrage_scan.png")
