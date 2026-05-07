# presentation/R/theme_thesis.R
# Shared ggplot2 theme, palette, helpers, and forecaster colours
# for all thesis defence presentation plots.
#
# Single source of truth for colours and typography. Mirrors
# `dashboard/src/components/slides/shared/presentationConstants.ts`.
#
# Usage: source("presentation/R/theme_thesis.R")  (from project root)

suppressPackageStartupMessages({
  library(ggplot2)
})

# ---------------------------------------------------------------------------
# Colour palette — mirrors presentationConstants.ts exactly
# ---------------------------------------------------------------------------
PALETTE <- list(
  navy     = "#1B2A4A",
  white    = "#FFFFFF",
  offWhite = "#F8FAFC",
  imperial = "#003E74",
  teal     = "#2E8B8B",
  coral    = "#E85D4A",
  purple   = "#7C3AED",
  charcoal = "#2D3748",
  slate    = "#64748B",
  border   = "#CBD5E1",
  lightBg  = "#F1F5F9",
  # convenience for warm accent used by MLP series
  orange   = "#E67E22"
)

# ---------------------------------------------------------------------------
# Forecaster colours — identical to FORECASTER_META in the slide component
# ---------------------------------------------------------------------------
FORECASTER_COLOURS <- c(
  Naive    = PALETTE$navy,
  EWMA     = PALETTE$teal,
  ARIMA    = PALETTE$coral,
  XGBoost  = PALETTE$purple,
  MLP      = PALETTE$orange,
  Theta    = PALETTE$slate,
  Ensemble = PALETTE$imperial
)

# ---------------------------------------------------------------------------
# Semantic method colours — reused across baseline/aggregation plots
# ---------------------------------------------------------------------------
METHOD_COLOURS <- c(
  uniform                 = PALETTE$slate,
  equal                   = PALETTE$slate,
  deposit                 = PALETTE$coral,
  skill                   = PALETTE$purple,
  mechanism               = PALETTE$teal,
  best_single             = PALETTE$navy,
  oracle                  = PALETTE$navy,
  raja_history_free       = PALETTE$imperial,
  vitali_ogd_per_quantile = PALETTE$purple
)

# ---------------------------------------------------------------------------
# Typography tokens — proportional to a 16x9 slide at 300dpi
# ---------------------------------------------------------------------------
TYPO <- list(
  base        = 16,
  axis_title  = 18,
  axis_text   = 14,
  legend      = 14,
  subtitle    = 15,
  annot_large = 7,     # geom_text size units (not pt)
  annot_med   = 5,
  annot_small = 4
)

# ---------------------------------------------------------------------------
# Shared ggplot2 theme
# ---------------------------------------------------------------------------
theme_thesis <- function(base_size = TYPO$base) {
  # Try Avenir Next first; fall back to sans if unavailable
  font_family <- tryCatch({
    if (requireNamespace("systemfonts", quietly = TRUE) &&
        "Avenir Next" %in% systemfonts::system_fonts()$family) {
      "Avenir Next"
    } else {
      "sans"
    }
  }, error = function(e) "sans")

  theme_minimal(base_size = base_size) +
    theme(
      text             = element_text(family = font_family, colour = PALETTE$charcoal),
      plot.title       = element_blank(),
      plot.subtitle    = element_blank(),
      plot.caption     = element_text(size = base_size - 4, colour = PALETTE$slate,
                                      hjust = 1, margin = margin(t = 8)),
      plot.margin      = margin(18, 22, 14, 18),
      axis.title.x     = element_text(size = TYPO$axis_title, face = "bold",
                                      margin = margin(t = 10)),
      axis.title.y     = element_text(size = TYPO$axis_title, face = "bold",
                                      margin = margin(r = 10)),
      axis.text        = element_text(size = TYPO$axis_text, colour = PALETTE$charcoal),
      axis.ticks       = element_blank(),
      axis.line.x      = element_line(colour = PALETTE$border, linewidth = 0.4),
      axis.line.y      = element_blank(),
      legend.text      = element_text(size = TYPO$legend),
      legend.title     = element_text(size = TYPO$legend, face = "bold"),
      legend.key.size  = unit(1.1, "lines"),
      panel.grid.major.x = element_blank(),
      panel.grid.major.y = element_line(colour = PALETTE$border,
                                        linewidth = 0.3, linetype = "solid"),
      panel.grid.minor   = element_blank(),
      plot.background    = element_rect(fill = "white", colour = NA),
      panel.background   = element_rect(fill = "white", colour = NA),
      strip.text         = element_text(size = TYPO$subtitle, face = "bold",
                                        colour = PALETTE$navy,
                                        margin = margin(b = 8))
    )
}

# Variant with both grids on (useful for scatter plots)
theme_thesis_grid <- function(base_size = TYPO$base) {
  theme_thesis(base_size) +
    theme(
      panel.grid.major.x = element_line(colour = PALETTE$border,
                                        linewidth = 0.3, linetype = "solid")
    )
}

# ---------------------------------------------------------------------------
# Subtitle label — use inside plot_layout() when a per-panel label is needed
# ---------------------------------------------------------------------------
subtitle_element <- function() {
  element_text(size = TYPO$subtitle, face = "bold", colour = PALETTE$navy,
               margin = margin(b = 10))
}

# ---------------------------------------------------------------------------
# Data-validation helper
# ---------------------------------------------------------------------------
#' Validate that a data frame contains the expected columns.
validate_data <- function(df, expected_cols, name) {
  missing <- setdiff(expected_cols, names(df))
  if (length(missing) > 0) {
    warning(sprintf("[%s] Missing columns: %s", name, paste(missing, collapse = ", ")))
    return(FALSE)
  }
  TRUE
}

# ---------------------------------------------------------------------------
# Dual-save helper — writes PNG to slide and archive directories.
# ---------------------------------------------------------------------------
#' Save a ggplot to the presentation output directories.
#'
#' @param plot    ggplot object
#' @param name    File name (e.g. "skill_recovery.png")
#' @param width   Width in inches (default 16 for 16:9 slides)
#' @param height  Height in inches (default 9)
#' @param dpi     Resolution (default 300)
#' @param also_pdf Whether to also write a PDF alongside the PNG
save_dual <- function(plot, name, width = 16, height = 9, dpi = 300,
                      also_pdf = FALSE) {
  dirs <- c(
    "dashboard/public/presentation-plots",
    "presentation/plots"
  )
  for (d in dirs) {
    if (!dir.exists(d)) dir.create(d, recursive = TRUE)
    path <- file.path(d, name)
    ggsave(path, plot = plot, width = width, height = height, dpi = dpi,
           bg = "white")
    message(sprintf("Saved: %s", path))
    if (also_pdf) {
      pdf_path <- sub("\\.png$", ".pdf", path)
      ggsave(pdf_path, plot = plot, width = width, height = height,
             device = cairo_pdf, bg = "white")
      message(sprintf("Saved: %s", pdf_path))
    }
  }
}

# ---------------------------------------------------------------------------
# Direct-labelling helper — pair with geom_line to annotate series at the end
# ---------------------------------------------------------------------------
#' Build a data frame containing the last point of each series for direct
#' end-of-line labels. Call with an already-grouped tibble or a grouping var.
#'
#' @param df Data with columns for x (named `x_col`), y (`y_col`) and a
#'           grouping column (`group_col`).
end_label_points <- function(df, x_col = "t", y_col = "value",
                             group_col = "method") {
  df |>
    dplyr::group_by(.data[[group_col]]) |>
    dplyr::filter(.data[[x_col]] == max(.data[[x_col]], na.rm = TRUE)) |>
    dplyr::ungroup()
}
