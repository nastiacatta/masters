# presentation/R/theme_thesis.R
# Shared ggplot2 theme, palette, helpers, and forecaster colours
# for all thesis defence presentation plots.
#
# Usage: source("presentation/R/theme_thesis.R")  (from project root)

library(ggplot2)

# ---------------------------------------------------------------------------
# Colour palette — mirrors dashboard/src/components/slides/shared/presentationConstants.ts
# ---------------------------------------------------------------------------
PALETTE <- list(
  navy     = "#1B2A4A",
  teal     = "#2E8B8B",
  coral    = "#E85D4A",
  purple   = "#7C3AED",
  imperial = "#003E74",
  slate    = "#64748B",
  charcoal = "#2D3748"
)

# ---------------------------------------------------------------------------
# Forecaster colours — consistent colouring across all plots
# ---------------------------------------------------------------------------
FORECASTER_COLOURS <- c(
  Naive    = "#1B2A4A",
  EWMA     = "#2E8B8B",
  ARIMA    = "#E85D4A",
  XGBoost  = "#7C3AED",
  MLP      = "#E67E22",
  Theta    = "#64748B",
  Ensemble = "#003E74"
)

# ---------------------------------------------------------------------------
# Shared ggplot2 theme
# ---------------------------------------------------------------------------
theme_thesis <- function(base_size = 16) {
  # Try Avenir Next first; fall back to sans if unavailable
  font_family <- tryCatch(
    {
      if ("Avenir Next" %in% systemfonts::system_fonts()$family) {
        "Avenir Next"
      } else {
        "sans"
      }
    },
    error = function(e) "sans"
  )

  theme_minimal(base_size = base_size) +
    theme(
      text             = element_text(family = font_family, colour = PALETTE$charcoal),
      plot.title       = element_blank(),
      plot.subtitle    = element_blank(),
      plot.margin      = margin(20, 20, 20, 20),
      axis.title       = element_text(size = 18, face = "bold"),
      axis.text        = element_text(size = 17),
      legend.text      = element_text(size = 16),
      legend.title     = element_text(size = 16, face = "bold"),
      legend.key.size  = unit(1.2, "lines"),
      panel.grid.major = element_line(colour = "#E8ECF0", linewidth = 0.3),
      panel.grid.minor = element_blank(),
      plot.background  = element_rect(fill = "white", colour = NA),
      panel.background = element_rect(fill = "white", colour = NA)
    )
}

# ---------------------------------------------------------------------------
# Data-validation helper
# ---------------------------------------------------------------------------
#' Validate that a data frame contains the expected columns.
#'
#' @param df         A data.frame to check.
#' @param expected_cols Character vector of required column names.
#' @param name       A human-readable label used in warning messages.
#' @return TRUE if all columns are present, FALSE otherwise.
validate_data <- function(df, expected_cols, name) {
  missing <- setdiff(expected_cols, names(df))
  if (length(missing) > 0) {
    warning(sprintf("[%s] Missing columns: %s", name, paste(missing, collapse = ", ")))
    return(FALSE)
  }
  return(TRUE)
}

# ---------------------------------------------------------------------------
# Dual-save helper
# ---------------------------------------------------------------------------
#' Save a ggplot to both output directories used by the presentation.
#'
#' @param plot   A ggplot object.
#' @param name   File name (e.g. "skill_recovery.png").
#' @param width  Width in inches (default 16).
#' @param height Height in inches (default 9).
#' @param dpi    Resolution (default 300).
save_dual <- function(plot, name, width = 16, height = 9, dpi = 300) {
  dirs <- c(
    "dashboard/public/presentation-plots",
    "presentation/plots"
  )
  for (d in dirs) {
    if (!dir.exists(d)) {
      dir.create(d, recursive = TRUE)
    }
    path <- file.path(d, name)
    ggsave(path, plot = plot, width = width, height = height, dpi = dpi)
    message(sprintf("Saved: %s", path))
  }
}
