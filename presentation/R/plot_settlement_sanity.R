# presentation/R/plot_settlement_sanity.R
# Settlement sanity plot: budget balance gap and payout distribution.
#
# Run from project root:
#   Rscript presentation/R/plot_settlement_sanity.R

source("presentation/R/theme_thesis.R")

library(dplyr)

# ---------------------------------------------------------------------------
# 1. Read data
# ---------------------------------------------------------------------------
data_dir <- file.path("dashboard", "public", "data", "experiments 2",
                       "settlement_sanity", "data")

summary_path <- file.path(data_dir, "summary.csv")
hist_path    <- file.path(data_dir, "hist.csv")
series_path  <- file.path(data_dir, "series.csv")

if (!file.exists(summary_path)) stop(sprintf("Summary file not found: %s", summary_path))
if (!file.exists(hist_path))    stop(sprintf("Hist file not found: %s", hist_path))
if (!file.exists(series_path))  stop(sprintf("Series file not found: %s", series_path))

df_summary <- read.csv(summary_path, stringsAsFactors = FALSE)
df_hist    <- read.csv(hist_path, stringsAsFactors = FALSE)
df_series  <- read.csv(series_path, stringsAsFactors = FALSE)

# ---------------------------------------------------------------------------
# 2. Validate data
# ---------------------------------------------------------------------------
validate_data(df_summary, c("metric", "value"), "summary")
validate_data(df_hist, c("series", "value"), "hist")
validate_data(df_series, c("round", "budget_gap", "min_payout_active"), "series")

# ---------------------------------------------------------------------------
# 3. Panel A — Budget balance gap over rounds (clean, no annotations)
# ---------------------------------------------------------------------------
p_gap <- ggplot(df_series, aes(x = round, y = budget_gap)) +
  geom_line(colour = PALETTE$teal, linewidth = 0.6, alpha = 0.7) +
  geom_point(colour = PALETTE$teal, size = 0.8, alpha = 0.5) +
  geom_hline(yintercept = 0, linetype = "dashed", colour = PALETTE$slate, linewidth = 0.4) +
  scale_y_continuous(labels = scales::scientific) +
  labs(
    title = NULL,
    subtitle = NULL,
    x = "Round",
    y = "Budget gap"
  ) +
  theme_thesis()

# ---------------------------------------------------------------------------
# 4. Panel B — Profit distribution histogram (clean, no annotations)
# ---------------------------------------------------------------------------
df_profit <- df_hist %>% filter(series == "profit")

p_profit <- ggplot(df_profit, aes(x = value)) +
  geom_histogram(
    bins = 60,
    fill = PALETTE$coral,
    colour = "white",
    alpha = 0.85,
    linewidth = 0.3
  ) +
  geom_vline(xintercept = 0, linetype = "dashed", colour = PALETTE$navy, linewidth = 0.6) +
  labs(
    title = NULL,
    subtitle = NULL,
    x = "Profit",
    y = "Count"
  ) +
  theme_thesis()

# ---------------------------------------------------------------------------
# 5. Combine panels (no patchwork title/subtitle)
# ---------------------------------------------------------------------------
library(patchwork)

p_combined <- p_gap / p_profit

# ---------------------------------------------------------------------------
# 6. Save to both output directories
# ---------------------------------------------------------------------------
save_dual(p_combined, "settlement_sanity.png")

message("Done: settlement_sanity.png")
