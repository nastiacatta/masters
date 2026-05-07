# presentation/R/plot_settlement_sanity.R
# Settlement sanity: budget-balance gap and profit distribution.
#
# Chart type: two histograms (budget gap + profit) with dashed
# reference lines at zero and an annotated max-|gap| marker.
# Rationale: budget gaps are at machine-precision noise (~1e-14). A
# line of rounds-vs-gap plots that noise as if it were a time-series
# signal, which it is not; the only meaningful property is the
# *distribution* being concentrated at zero. A histogram makes that
# property immediately visible and puts the max-|gap| annotation on
# the same axis. The profit histogram stays next to it to demonstrate
# the zero-mean self-financed property side by side.
#
# Run from project root:
#   Rscript presentation/R/plot_settlement_sanity.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(patchwork)
})

# ---------------------------------------------------------------------------
# 1. Load data — tolerate either experiments folder
# ---------------------------------------------------------------------------
candidates <- c(
  "dashboard/public/data/experiments/settlement_sanity/data",
  "dashboard/public/data/experiments 2/settlement_sanity/data"
)
data_dir <- candidates[file.exists(file.path(candidates, "summary.csv"))][1]
if (is.na(data_dir)) stop("settlement_sanity data not found.")

df_summary <- read.csv(file.path(data_dir, "summary.csv"),
                       stringsAsFactors = FALSE)
df_hist    <- read.csv(file.path(data_dir, "hist.csv"),
                       stringsAsFactors = FALSE)
df_series  <- read.csv(file.path(data_dir, "series.csv"),
                       stringsAsFactors = FALSE)

validate_data(df_summary, c("metric", "value"), "summary")
validate_data(df_hist,    c("series", "value"), "hist")
validate_data(df_series,  c("round", "budget_gap", "min_payout_active"),
              "series")

# ---------------------------------------------------------------------------
# 2. Headline numbers
# ---------------------------------------------------------------------------
get_val <- function(metric) {
  v <- df_summary$value[df_summary$metric == metric]
  if (length(v) == 0) NA_real_ else as.numeric(v)
}
max_gap     <- get_val("max_abs_budget_gap")
mean_profit <- get_val("mean_profit")
n_rounds    <- as.integer(get_val("n_rounds"))

# Prefer the full per-round series for the gap histogram.
gaps_vec <- df_series$budget_gap

# ---------------------------------------------------------------------------
# 3. Budget-gap panel — histogram
# ---------------------------------------------------------------------------
p_gap <- ggplot(data.frame(gap = gaps_vec), aes(x = gap)) +
  geom_histogram(bins = 40, fill = PALETTE$teal, colour = "white",
                 alpha = 0.88, linewidth = 0.3) +
  geom_vline(xintercept = 0, linetype = "dashed",
             colour = PALETTE$navy, linewidth = 0.6) +
  scale_x_continuous(labels = scales::label_scientific(digits = 1)) +
  labs(
    x = expression(paste(Sigma, " payouts \u2212 ", Sigma, " wagers")),
    y = "Count"
  ) +
  theme_thesis() +
  theme(plot.title = subtitle_element()) +
  ggtitle(sprintf("Budget gap — max |\u0394| = %.2e across %d rounds",
                  max_gap, n_rounds))

# ---------------------------------------------------------------------------
# 4. Profit distribution panel — histogram
# ---------------------------------------------------------------------------
df_profit <- df_hist |> filter(series == "profit")

p_profit <- ggplot(df_profit, aes(x = value)) +
  geom_histogram(bins = 60, fill = PALETTE$coral, colour = "white",
                 alpha = 0.88, linewidth = 0.3) +
  geom_vline(xintercept = 0, linetype = "dashed",
             colour = PALETTE$navy, linewidth = 0.6) +
  scale_x_continuous(labels = scales::number_format(accuracy = 0.001)) +
  labs(
    x = "Realised profit per forecaster per round",
    y = "Count"
  ) +
  theme_thesis() +
  theme(plot.title = subtitle_element()) +
  ggtitle(sprintf("Profit — mean = %.2e (zero-sum)", mean_profit))

# ---------------------------------------------------------------------------
# 5. Compose: side-by-side
# ---------------------------------------------------------------------------
p_combined <- p_gap | p_profit

save_dual(p_combined, "settlement_sanity.png", width = 16, height = 8)
message("Done: settlement_sanity.png")
