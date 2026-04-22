# presentation/R/plot_real_data.R
# Real-data validation plot: CRPS comparison across methods
# and learned skill trajectories for Elia wind + electricity.
#
# Run from project root:
#   Rscript presentation/R/plot_real_data.R

source("presentation/R/theme_thesis.R")

library(dplyr)
library(tidyr)
library(jsonlite)
library(patchwork)

# ---------------------------------------------------------------------------
# 1. Read data
# ---------------------------------------------------------------------------
wind_path <- "dashboard/public/data/real_data/elia_wind/data/comparison.json"
elec_path <- "dashboard/public/data/real_data/elia_electricity/data/comparison.json"

if (!file.exists(wind_path)) {
  stop(sprintf("Wind comparison file not found: %s", wind_path))
}

wind_json <- fromJSON(wind_path, flatten = TRUE)

has_electricity <- file.exists(elec_path)
if (has_electricity) {
  elec_json <- fromJSON(elec_path, flatten = TRUE)
  message("Found electricity data — will include second panel.")
} else {
  message("No electricity data found — single-panel plot.")
}

# ---------------------------------------------------------------------------
# 2. Validate data
# ---------------------------------------------------------------------------
validate_rows <- function(rows, name) {
  ok <- validate_data(rows, c("method", "mean_crps", "delta_crps_vs_equal"), name)
  if (ok && any(rows$mean_crps < 0)) {
    warning(sprintf("[%s] Negative CRPS values detected", name))
  }
  ok
}

validate_rows(wind_json$rows, "wind_rows")
if (has_electricity) validate_rows(elec_json$rows, "electricity_rows")

# ---------------------------------------------------------------------------
# 3. Build CRPS comparison data
# ---------------------------------------------------------------------------
# Methods to display (in presentation order)
display_methods <- c("uniform", "mechanism", "skill", "inverse_variance",
                     "trimmed_mean", "median", "best_single", "oracle")

# Readable labels
method_labels <- c(
  uniform          = "Equal\nWeights",
  mechanism        = "Mechanism",
  skill            = "Skill\nWeighted",
  inverse_variance = "Inverse\nVariance",
  trimmed_mean     = "Trimmed\nMean",
  median           = "Median",
  best_single      = "Best\nSingle",
  oracle           = "Oracle"
)

# Colours for methods
method_colours <- c(
  uniform          = PALETTE$slate,
  mechanism        = PALETTE$teal,
  skill            = PALETTE$purple,
  inverse_variance = "#E67E22",
  trimmed_mean     = "#95A5A6",
  median           = "#34495E",
  best_single      = PALETTE$coral,
  oracle           = PALETTE$navy
)

build_crps_df <- function(json, dataset_name) {
  rows <- json$rows %>%
    filter(method %in% display_methods) %>%
    mutate(
      label   = method_labels[method],
      dataset = dataset_name,
      method  = factor(method, levels = display_methods)
    )
  rows
}

wind_crps <- build_crps_df(wind_json, "Elia Wind (T = 17,544)")
crps_df <- wind_crps

if (has_electricity) {
  elec_crps <- build_crps_df(elec_json, "Elia Electricity (T = 10,000)")
  crps_df <- bind_rows(crps_df, elec_crps)
}

# Compute improvement percentages for annotation
wind_uniform <- wind_crps$mean_crps[wind_crps$method == "uniform"]
wind_mech    <- wind_crps$mean_crps[wind_crps$method == "mechanism"]
wind_best    <- wind_crps$mean_crps[wind_crps$method == "best_single"]
wind_improv  <- round((wind_mech - wind_uniform) / wind_uniform * 100, 0)

if (has_electricity) {
  elec_uniform <- elec_crps$mean_crps[elec_crps$method == "uniform"]
  elec_mech    <- elec_crps$mean_crps[elec_crps$method == "mechanism"]
  elec_improv  <- round((elec_mech - elec_uniform) / elec_uniform * 100, 0)
}

# ---------------------------------------------------------------------------
# 4. Panel A: CRPS comparison bar chart
# ---------------------------------------------------------------------------
make_crps_panel <- function(df, title_text, improv_pct) {
  # Ensure method ordering
  df$method <- factor(df$method, levels = display_methods)

  p <- ggplot(df, aes(x = method, y = mean_crps, fill = method)) +
    geom_col(width = 0.7, show.legend = FALSE) +
    geom_text(
      aes(label = sprintf("%.4f", mean_crps)),
      vjust = -0.5, size = 3.8, fontface = "bold",
      colour = PALETTE$charcoal
    ) +
    scale_fill_manual(values = method_colours) +
    scale_x_discrete(labels = method_labels[display_methods]) +
    scale_y_continuous(expand = expansion(mult = c(0, 0.15))) +
    labs(
      title    = title_text,
      subtitle = sprintf("Mechanism: %d%% vs equal weights", improv_pct),
      x = NULL,
      y = "Mean CRPS (lower is better)"
    ) +
    theme_thesis(base_size = 14) +
    theme(
      plot.subtitle  = element_text(size = 13, colour = PALETTE$teal,
                                    face = "bold", margin = margin(b = 10)),
      axis.text.x    = element_text(size = 11, lineheight = 0.9),
      axis.title.y   = element_text(size = 13)
    )
  p
}

p_wind_crps <- make_crps_panel(wind_crps, "Elia Wind", wind_improv)

if (has_electricity) {
  p_elec_crps <- make_crps_panel(elec_crps, "Elia Electricity", elec_improv)
}

# ---------------------------------------------------------------------------
# 5. Panel B: Learned skill trajectories (sigma over time)
# ---------------------------------------------------------------------------
# Short forecaster labels for the legend
forecaster_short <- c(
  "Naive", "EWMA", "ARIMA", "XGBoost", "MLP", "Theta", "Ensemble"
)

make_skill_panel <- function(json, dataset_label) {
  skill_raw <- json$skill_history
  n_fc <- json$config$n_forecasters

  # Extract sigma columns and pivot to long format
  sigma_cols <- paste0("sigma_", 0:(n_fc - 1))
  available  <- intersect(sigma_cols, names(skill_raw))

  if (length(available) == 0) {
    message(sprintf("No skill_history sigma columns found for %s — skipping skill panel.", dataset_label))
    return(NULL)
  }

  skill_long <- skill_raw %>%
    select(t, all_of(available)) %>%
    pivot_longer(
      cols      = all_of(available),
      names_to  = "forecaster_id",
      values_to = "sigma"
    ) %>%
    mutate(
      idx        = as.integer(gsub("sigma_", "", forecaster_id)),
      forecaster = forecaster_short[idx + 1]
    )

  # Map to FORECASTER_COLOURS
  skill_long$forecaster <- factor(skill_long$forecaster, levels = forecaster_short)

  p <- ggplot(skill_long, aes(x = t, y = sigma, colour = forecaster)) +
    geom_line(linewidth = 0.9, alpha = 0.85) +
    scale_colour_manual(values = FORECASTER_COLOURS, name = "Forecaster") +
    scale_y_continuous(limits = c(0, 1), breaks = seq(0, 1, 0.2)) +
    labs(
      title = paste0("Learned Skill Trajectories — ", dataset_label),
      x     = "Round (t)",
      y     = expression(bold("Skill signal") ~ (sigma))
    ) +
    theme_thesis(base_size = 14) +
    theme(
      legend.position = "bottom",
      legend.text     = element_text(size = 11),
      legend.title    = element_text(size = 12, face = "bold")
    ) +
    guides(colour = guide_legend(nrow = 1))

  p
}

p_wind_skill <- make_skill_panel(wind_json, "Wind")

if (has_electricity) {
  p_elec_skill <- make_skill_panel(elec_json, "Electricity")
}

# ---------------------------------------------------------------------------
# 6. Compose final plot with patchwork
# ---------------------------------------------------------------------------
if (has_electricity) {
  # 2×2 layout: top row = CRPS bars, bottom row = skill trajectories
  p_final <- (p_wind_crps | p_elec_crps) /
             (p_wind_skill | p_elec_skill) +
    plot_annotation(
      title    = "Real-Data Validation: Elia Wind & Electricity",
      subtitle = "CRPS comparison across aggregation methods and learned skill evolution",
      theme = theme_thesis(base_size = 16) &
        theme(
          plot.title    = element_text(size = 20, face = "bold", colour = PALETTE$navy),
          plot.subtitle = element_text(size = 15, colour = PALETTE$slate,
                                       margin = margin(b = 10))
        )
    )
} else {
  # Single dataset: stack vertically
  p_final <- p_wind_crps / p_wind_skill +
    plot_annotation(
      title    = "Real-Data Validation: Elia Wind",
      subtitle = "CRPS comparison across aggregation methods and learned skill evolution",
      theme = theme_thesis(base_size = 16) &
        theme(
          plot.title    = element_text(size = 20, face = "bold", colour = PALETTE$navy),
          plot.subtitle = element_text(size = 15, colour = PALETTE$slate,
                                       margin = margin(b = 10))
        )
    )
}

# ---------------------------------------------------------------------------
# 7. Save to both output directories
# ---------------------------------------------------------------------------
save_dual(p_final, "real_data_validation.png", width = 18, height = 10)

message("Done: real_data_validation.png")
