#!/usr/bin/env Rscript
# Forecast aggregation: CRPS-hat over time and cumulative mean CRPS-hat by baseline
args <- commandArgs(trailingOnly = TRUE)
outdir <- if (length(args) >= 1) args[1] else "outputs"

if (!requireNamespace("ggplot2", quietly = TRUE)) {
  stop("Install ggplot2: install.packages('ggplot2')")
}
library(ggplot2)

PINK <- "#E91E8C"
BLUE <- "#0088FF"
GREEN <- "#00AA44"
ORANGE <- "#FF8800"

agg_file <- file.path(outdir, "forecast_aggregation.csv")
out_file <- file.path(outdir, "forecast_aggregation.png")

if (!file.exists(agg_file)) {
  stop("Missing: ", agg_file)
}
d <- read.csv(agg_file, na.strings = c("NA", "nan", "NaN", ""))

# Long format for rolling mean CRPS
d_roll <- data.frame(
  t = rep(d$t, 4),
  crps = c(d$crps_blended_roll, d$crps_equal_roll, d$crps_stake_roll, d$crps_skill_roll),
  baseline = rep(c("blended", "equal", "stake_only", "skill_only"), each = nrow(d))
)
d_roll <- d_roll[!is.na(d_roll$crps), ]

# Cumulative mean CRPS
d_cum <- data.frame(
  t = rep(d$t, 4),
  crps_cum = c(d$crps_blended_cum, d$crps_equal_cum, d$crps_stake_cum, d$crps_skill_cum),
  baseline = rep(c("blended", "equal", "stake_only", "skill_only"), each = nrow(d))
)
d_cum <- d_cum[!is.na(d_cum$crps_cum), ]

p1 <- ggplot(d_roll, aes(x = t, y = crps, color = baseline)) +
  geom_line(linewidth = 0.8) +
  scale_color_manual(
    values = c(blended = PINK, equal = BLUE, stake_only = GREEN, skill_only = ORANGE),
    name = "Aggregate"
  ) +
  labs(x = "Round t", y = "Rolling mean CRPS-hat", title = "Aggregate loss over time (rolling mean)") +
  theme_minimal() +
  theme(legend.position = "bottom")

p2 <- ggplot(d_cum, aes(x = t, y = crps_cum, color = baseline)) +
  geom_line(linewidth = 0.8) +
  scale_color_manual(
    values = c(blended = PINK, equal = BLUE, stake_only = GREEN, skill_only = ORANGE),
    name = "Aggregate"
  ) +
  labs(x = "Round t", y = "Cumulative mean CRPS-hat", title = "Cumulative mean CRPS-hat by baseline") +
  theme_minimal() +
  theme(legend.position = "bottom")

png(out_file, width = 1000, height = 500, res = 100)
if (requireNamespace("gridExtra", quietly = TRUE)) {
  print(gridExtra::grid.arrange(p1, p2, ncol = 2))
} else {
  grid::grid.newpage()
  grid::pushViewport(grid::viewport(layout = grid::grid.layout(1, 2)))
  print(p1, vp = grid::viewport(layout.pos.row = 1, layout.pos.col = 1))
  print(p2, vp = grid::viewport(layout.pos.row = 1, layout.pos.col = 2))
}
invisible(dev.off())

cat("Saved", out_file, "\n")
