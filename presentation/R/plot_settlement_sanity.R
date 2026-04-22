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
# 3. Extract summary statistics for annotations
# ---------------------------------------------------------------------------
get_metric <- function(name) {
  row <- df_summary[df_summary$metric == name, ]
  if (nrow(row) == 0) return(NA)
  return(as.numeric(row$value[1]))
}

max_abs_gap <- get_metric("max_abs_budget_gap")
n_rounds    <- get_metric("n_rounds")

# ---------------------------------------------------------------------------
# 4. Panel A — Budget balance gap over rounds
# ---------------------------------------------------------------------------
p_gap <- ggplot(df_series, aes(x = round, y = budget_gap)) +
  geom_line(colour = PALETTE$teal, linewidth = 0.6, alpha = 0.7) +
  geom_point(colour = PALETTE$teal, size = 0.8, alpha = 0.5) +
  geom_hline(yintercept = 0, linetype = "dashed", colour = PALETTE$slate, linewidth = 0.4) +
  annotate(
    "label",
    x = max(df_series$round) * 0.02,
    y = max(abs(df_series$budget_gap)) * 0.85,
    label = sprintf("max |gap| = %.1e", max_abs_gap),
    size = 5, fontface = "bold",
    fill = PALETTE$navy, colour = "white",
    label.padding = unit(0.5, "lines"),
    label.r = unit(0.3, "lines")
  ) +
  scale_y_continuous(labels = scales::scientific) +
  labs(
    title = "Budget Balance Gap per Round",
    subtitle = "Total payouts \u2212 total wagers (should be \u2248 0)",
    x = "Round",
    y = "Budget gap"
  ) +
  theme_thesis() +
  theme(
    plot.subtitle = element_text(size = 14, colour = PALETTE$slate,
                                 margin = margin(b = 10))
  )

# ---------------------------------------------------------------------------
# 5. Panel B — Profit distribution histogram
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
  annotate(
    "label",
    x = max(df_profit$value) * 0.55,
    y = Inf,
    vjust = 1.5,
    label = sprintf("mean = %.2e\nsd = %.2f",
                    get_metric("mean_profit"),
                    get_metric("std_profit")),
    size = 4.5, fontface = "bold",
    fill = PALETTE$navy, colour = "white",
    label.padding = unit(0.5, "lines"),
    label.r = unit(0.3, "lines")
  ) +
  labs(
    title = "Payout Distribution (Profit per Agent-Round)",
    subtitle = "Centred near zero \u2014 mechanism redistributes, does not create value",
    x = "Profit",
    y = "Count"
  ) +
  theme_thesis() +
  theme(
    plot.subtitle = element_text(size = 14, colour = PALETTE$slate,
                                 margin = margin(b = 10))
  )

# ---------------------------------------------------------------------------
# 6. Combine panels
# ---------------------------------------------------------------------------
library(patchwork)

p_combined <- p_gap / p_profit +
  plot_annotation(
    title = "Settlement Sanity Checks",
    subtitle = sprintf("%d rounds \u2014 budget balance holds to machine precision",
                       as.integer(n_rounds)),
    theme = theme_thesis() +
      theme(
        plot.title = element_text(size = 22, face = "bold", colour = PALETTE$navy,
                                  margin = margin(b = 5)),
        plot.subtitle = element_text(size = 16, colour = PALETTE$slate,
                                     margin = margin(b = 15))
      )
  )

# ---------------------------------------------------------------------------
# 7. Save to both output directories
# ---------------------------------------------------------------------------
save_dual(p_combined, "settlement_sanity.png")

message("Done: settlement_sanity.png")
