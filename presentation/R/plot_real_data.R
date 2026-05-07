# presentation/R/plot_real_data.R
# Real-data validation: CRPS across methods + learned skill trajectories
# on Elia wind (+ optional electricity).
#
# Run from project root:
#   Rscript presentation/R/plot_real_data.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(tidyr)
  library(jsonlite)
  library(patchwork)
  library(ggrepel)
})

# ---------------------------------------------------------------------------
# 1. Load data
# ---------------------------------------------------------------------------
wind_path <- "dashboard/public/data/real_data/elia_wind/data/comparison.json"
elec_path <- "dashboard/public/data/real_data/elia_electricity/data/comparison.json"
if (!file.exists(wind_path)) stop(sprintf("Wind data not found: %s", wind_path))

wind_json <- fromJSON(wind_path, flatten = TRUE)

has_electricity <- file.exists(elec_path)
elec_json <- if (has_electricity) fromJSON(elec_path, flatten = TRUE) else NULL

# ---------------------------------------------------------------------------
# 2. CRPS panel builder
# ---------------------------------------------------------------------------
display_methods <- c("uniform", "mechanism", "skill", "inverse_variance",
                     "trimmed_mean", "median", "best_single",
                     "per_round_inv_crps_hindsight", "oracle")

method_labels <- c(
  uniform                      = "Equal",
  mechanism                    = "Mechanism",
  skill                        = "Skill",
  inverse_variance             = "Inverse var.",
  trimmed_mean                 = "Trimmed\nmean",
  median                       = "Median",
  best_single                  = "Best\nsingle",
  per_round_inv_crps_hindsight = "Per-round\nbest",
  oracle                       = "Oracle"
)

method_fills <- c(
  uniform                      = PALETTE$slate,
  mechanism                    = PALETTE$teal,
  skill                        = PALETTE$purple,
  inverse_variance             = PALETTE$orange,
  trimmed_mean                 = "#95A5A6",
  median                       = "#34495E",
  best_single                  = PALETTE$coral,
  per_round_inv_crps_hindsight = "#B91C5C",
  oracle                       = PALETTE$navy
)

build_crps_df <- function(json, dataset_name) {
  json$rows |>
    filter(method %in% display_methods) |>
    mutate(
      label   = method_labels[method],
      dataset = dataset_name,
      method  = factor(method, levels = display_methods)
    )
}

make_crps_panel <- function(df, facet_label) {
  # Highlight mechanism + best_single
  df <- df |>
    mutate(highlight = method %in% c("mechanism", "best_single",
                                     "per_round_inv_crps_hindsight"))

  ggplot(df, aes(x = method, y = mean_crps, fill = method)) +
    geom_col(width = 0.72, show.legend = FALSE) +
    geom_text(
      aes(label = sprintf("%.3f", mean_crps),
          colour = ifelse(highlight, "dark", "default")),
      vjust = -0.6, size = TYPO$annot_small, fontface = "bold",
      show.legend = FALSE
    ) +
    scale_fill_manual(values = method_fills) +
    scale_colour_manual(
      values = c(default = PALETTE$charcoal, dark = PALETTE$navy),
      guide  = "none"
    ) +
    scale_x_discrete(labels = method_labels) +
    scale_y_continuous(
      expand = expansion(mult = c(0, 0.22)),
      labels = scales::number_format(accuracy = 0.001)
    ) +
    labs(
      x = NULL,
      y = expression(bold("Mean CRPS") ~ (downarrow ~ "lower is better"))
    ) +
    theme_thesis(base_size = 14) +
    theme(
      axis.text.x = element_text(size = 11, lineheight = 0.9),
      plot.title  = subtitle_element()
    ) +
    ggtitle(facet_label)
}

wind_crps <- build_crps_df(wind_json, "Elia wind")
p_wind_crps <- make_crps_panel(wind_crps, "Elia wind  (T = 17,544)")

if (has_electricity) {
  elec_crps <- build_crps_df(elec_json, "Elia electricity")
  p_elec_crps <- make_crps_panel(elec_crps, "Elia electricity  (T = 10,000)")
}

# ---------------------------------------------------------------------------
# 3. Skill trajectory panel builder
# ---------------------------------------------------------------------------
forecaster_short <- c("Naive", "EWMA", "ARIMA", "XGBoost", "MLP",
                      "Theta", "Ensemble")

make_skill_panel <- function(json, dataset_label) {
  skill_raw <- json$skill_history
  n_fc <- json$config$n_forecasters
  sigma_cols <- paste0("sigma_", 0:(n_fc - 1))
  available  <- intersect(sigma_cols, names(skill_raw))
  if (length(available) == 0) {
    message(sprintf("No sigma history for %s — skipping.", dataset_label))
    return(NULL)
  }

  skill_long <- skill_raw |>
    select(t, all_of(available)) |>
    pivot_longer(cols = all_of(available),
                 names_to = "fid", values_to = "sigma") |>
    mutate(
      idx        = as.integer(gsub("sigma_", "", fid)),
      forecaster = forecaster_short[idx + 1]
    )

  # Rolling mean for readability
  skill_long <- skill_long |>
    group_by(forecaster) |>
    arrange(t, .by_group = TRUE) |>
    mutate(sigma_smooth = {
      w <- max(5, floor(n() * 0.03))
      as.numeric(stats::filter(sigma, rep(1 / w, w), sides = 1))
    }) |>
    ungroup() |>
    mutate(forecaster = factor(forecaster, levels = forecaster_short))

  # End-of-line labels
  label_df <- skill_long |>
    group_by(forecaster) |>
    filter(!is.na(sigma_smooth)) |>
    filter(t == max(t)) |>
    ungroup()

  ggplot(skill_long, aes(x = t, y = sigma_smooth, colour = forecaster)) +
    geom_line(linewidth = 1.1, alpha = 0.95, na.rm = TRUE) +
    geom_point(data = label_df, size = 2.4, show.legend = FALSE) +
    geom_text_repel(
      data        = label_df,
      aes(x = t, y = sigma_smooth, label = forecaster, colour = forecaster),
      hjust       = 0,
      direction   = "y",
      nudge_x     = max(skill_long$t, na.rm = TRUE) * 0.025,
      segment.alpha = 0.6,
      size        = TYPO$annot_small,
      fontface    = "bold",
      show.legend = FALSE,
      seed        = 1,
      min.segment.length = 0,
      box.padding = 0.45,
      point.padding = 0.25,
      max.overlaps = Inf,
      force = 2,
      xlim        = c(max(skill_long$t, na.rm = TRUE) * 1.015, NA)
    ) +
    scale_colour_manual(values = FORECASTER_COLOURS, guide = "none") +
    scale_x_continuous(
      expand = expansion(mult = c(0.02, 0.22)),
      labels = scales::label_number(big.mark = ",")
    ) +
    scale_y_continuous(limits = c(0, 1), breaks = seq(0, 1, 0.25)) +
    labs(
      x = "Round t",
      y = expression(bold("Learned skill") ~ sigma)
    ) +
    theme_thesis(base_size = 14) +
    theme(plot.title = subtitle_element()) +
    ggtitle(paste0("Learned skill — ", dataset_label))
}

p_wind_skill <- make_skill_panel(wind_json, "Wind")
p_elec_skill <- if (has_electricity) make_skill_panel(elec_json, "Electricity") else NULL

# ---------------------------------------------------------------------------
# 4. Compose final figure
# ---------------------------------------------------------------------------
if (has_electricity && !is.null(p_elec_skill)) {
  p_final <- (p_wind_crps | p_elec_crps) /
             (p_wind_skill | p_elec_skill)
} else {
  p_final <- p_wind_crps / p_wind_skill
}

save_dual(p_final, "real_data_validation.png", width = 18, height = 10)
message("Done: real_data_validation.png")
