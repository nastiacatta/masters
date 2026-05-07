# presentation/R/plot_skill_trajectory.R
# Synthetic skill trajectory for slide / thesis figure F4.
#
# Chart type: per-forecaster σ(t) line series with a warm-up band and
# annotated phase labels (warmup, adaptation, refinement).
# Rationale: the thesis narrative claims three distinct phases —
# (1) warmup t < warmup_end where σ sits at the prior, (2) fast
# adaptation t ∈ [warmup_end, ~800] where σ separates by noise level,
# and (3) slow refinement t > ~800. A line plot with labelled phase
# bands is the right way to communicate that — a scatter or a bar
# chart would hide the temporal structure that is the whole point of
# the figure. End-of-line labels identify each forecaster without a
# colour-only legend.
#
# Uses a reproducible parametric simulation (fixed seed, EWMA update
# matching the core skill layer at gamma = 4, rho = 0.05, sigma_min =
# 0.1) because the committed skill_recovery/data/ folder only retains
# summary statistics and not per-round trajectories.
#
# Run from project root:
#   Rscript presentation/R/plot_skill_trajectory.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(ggrepel)
})

# ---------------------------------------------------------------------------
# 1. Simulation parameters (chosen to mirror the quantiles_crps_summary.csv
#    tail distribution — tau_i in [0.15, 1.00]).
# ---------------------------------------------------------------------------
set.seed(20260507)

T_round     <- 2000
warmup_end  <- 200
tau_true    <- c(0.15, 0.22, 0.32, 0.46, 0.68, 1.00)
n_fc        <- length(tau_true)

gamma     <- 4.0    # loss -> skill steepness
rho       <- 0.05   # EWMA learning rate
sigma_min <- 0.10   # bounded floor

# Per-forecaster mean loss mapped from true tau via the same monotone
# relationship that generated the committed summary table.
mean_loss <- 0.015 + 0.10 * (tau_true / max(tau_true))

# Simulate per-round losses with iid lognormal jitter and EWMA-updated
# accumulated loss L_t -> sigma_t. Before warmup_end all sigmas sit at
# the prior (sigma = 1) per the mechanism's warmup convention.
sim_rows <- lapply(seq_len(n_fc), function(i) {
  mu       <- log(mean_loss[i]) - 0.15
  losses   <- exp(rnorm(T_round, mean = mu, sd = 0.55))
  losses   <- pmin(losses, 1.0)  # clip to [0, 1] as the scoring layer does
  L        <- 0.0
  sigma    <- numeric(T_round)
  for (t in seq_len(T_round)) {
    if (t <= warmup_end) {
      sigma[t] <- 1.0  # warmup prior
      L <- (1 - rho) * L + rho * losses[t]
    } else {
      L        <- (1 - rho) * L + rho * losses[t]
      sigma[t] <- sigma_min + (1 - sigma_min) * exp(-gamma * L)
    }
  }
  data.frame(
    t          = seq_len(T_round),
    sigma      = sigma,
    tau_true   = tau_true[i],
    forecaster = sprintf("F%d (\u03C4=%.2f)", i - 1, tau_true[i])
  )
})
df_sim <- bind_rows(sim_rows)

# Keep the forecaster factor ordered by tau so colour progression is monotone.
fc_levels <- df_sim |>
  distinct(forecaster, tau_true) |>
  arrange(tau_true) |>
  pull(forecaster)
df_sim$forecaster <- factor(df_sim$forecaster, levels = fc_levels)

# End-of-line labels
label_df <- df_sim |>
  group_by(forecaster) |>
  filter(t == max(t)) |>
  ungroup()

# ---------------------------------------------------------------------------
# 2. Phase annotations
# ---------------------------------------------------------------------------
phases <- data.frame(
  xmin = c(0, warmup_end, 800),
  xmax = c(warmup_end, 800, T_round),
  fill = c(PALETTE$slate, PALETTE$teal, PALETTE$purple),
  alpha = c(0.08, 0.05, 0.04),
  label = c("Warm-up", "Fast adaptation", "Slow refinement"),
  lx = c(warmup_end / 2,
         (warmup_end + 800) / 2,
         (800 + T_round) / 2),
  ly = c(1.06, 1.06, 1.06)
)

# Forecaster colour ramp: teal (skilled) -> coral (noisy)
fc_colours <- colorRampPalette(c(PALETTE$teal, PALETTE$coral))(n_fc)

# ---------------------------------------------------------------------------
# 3. Plot
# ---------------------------------------------------------------------------
p <- ggplot(df_sim, aes(x = t, y = sigma, colour = forecaster)) +
  # Phase bands
  geom_rect(
    data = phases,
    aes(xmin = xmin, xmax = xmax, ymin = -Inf, ymax = Inf,
        fill = fill, alpha = alpha),
    inherit.aes = FALSE
  ) +
  scale_fill_identity() +
  scale_alpha_identity() +
  # Phase labels
  geom_text(
    data = phases,
    aes(x = lx, y = ly, label = label),
    inherit.aes = FALSE,
    colour = PALETTE$charcoal, fontface = "bold",
    size = TYPO$annot_med
  ) +
  # sigma_min reference
  geom_hline(yintercept = sigma_min, linetype = "dashed",
             colour = PALETTE$slate, linewidth = 0.5) +
  annotate("text", x = T_round * 0.985, y = sigma_min + 0.035,
           label = sprintf("\u03C3_min = %.2f", sigma_min),
           hjust = 1, size = TYPO$annot_small + 0.3,
           colour = PALETTE$slate, fontface = "italic") +
  # Trajectories
  geom_line(linewidth = 1.05, alpha = 0.92) +
  # End-of-line points and labels
  geom_point(data = label_df, size = 2.2, show.legend = FALSE) +
  geom_text_repel(
    data        = label_df,
    aes(label = forecaster),
    hjust       = 0,
    direction   = "y",
    nudge_x     = T_round * 0.02,
    segment.alpha = 0.55,
    size        = TYPO$annot_small + 0.3,
    fontface    = "bold",
    show.legend = FALSE,
    seed        = 1,
    min.segment.length = 0.2,
    box.padding = 0.35
  ) +
  scale_colour_manual(values = setNames(fc_colours, fc_levels), guide = "none") +
  scale_x_continuous(
    expand = expansion(mult = c(0.02, 0.18)),
    labels = scales::label_number(big.mark = ",")
  ) +
  scale_y_continuous(
    limits = c(0, 1.12),
    breaks = seq(0, 1, 0.25)
  ) +
  labs(
    x = "Round t",
    y = expression(bold("Skill") ~ sigma)
  ) +
  theme_thesis()

save_dual(p, "skill_wager.png", width = 14, height = 8)
message("Done: skill_wager.png")
