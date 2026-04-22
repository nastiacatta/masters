# presentation/R/plot_positioning_matrix.R
# Literature positioning matrix: 2×2 grid of Adaptiveness vs Self-financed.
# Uses static data — no external file reads.
#
# Run from project root:
#   Rscript presentation/R/plot_positioning_matrix.R

source("presentation/R/theme_thesis.R")

# ---------------------------------------------------------------------------
# 1. Define static node data
# ---------------------------------------------------------------------------
nodes <- data.frame(
  label = c("Lambert et al.", "Online Aggregation\n(Cesa-Bianchi & Lugosi)",
            "Vitali & Pinson", "THIS THESIS"),
  x     = c(0.75, 0.25, 0.30, 0.80),
  y     = c(0.25, 0.75, 0.70, 0.82),
  highlight = c(FALSE, FALSE, FALSE, TRUE),
  stringsAsFactors = FALSE
)

# ---------------------------------------------------------------------------
# 2. Build the 2×2 positioning matrix
# ---------------------------------------------------------------------------
p <- ggplot(nodes, aes(x = x, y = y)) +
  # Quadrant shading
  annotate("rect", xmin = 0, xmax = 0.5, ymin = 0.5, ymax = 1,
           fill = "#F0F4F8", alpha = 0.5) +
  annotate("rect", xmin = 0.5, xmax = 1, ymin = 0.5, ymax = 1,
           fill = "#E8F5E9", alpha = 0.5) +
  annotate("rect", xmin = 0, xmax = 0.5, ymin = 0, ymax = 0.5,
           fill = "#FFF8E1", alpha = 0.5) +
  annotate("rect", xmin = 0.5, xmax = 1, ymin = 0, ymax = 0.5,
           fill = "#FFF3E0", alpha = 0.5) +
  # Quadrant dividers
  geom_hline(yintercept = 0.5, linetype = "dashed", colour = PALETTE$slate,
             linewidth = 0.5, alpha = 0.6) +
  geom_vline(xintercept = 0.5, linetype = "dashed", colour = PALETTE$slate,
             linewidth = 0.5, alpha = 0.6) +
  # Quadrant labels (subtle, in corners)
  annotate("text", x = 0.25, y = 0.97, label = "Adaptive\nNot Self-Financed",
           size = 3.5, colour = PALETTE$slate, fontface = "italic", alpha = 0.6) +
  annotate("text", x = 0.75, y = 0.97, label = "Adaptive\nSelf-Financed",
           size = 3.5, colour = PALETTE$teal, fontface = "italic", alpha = 0.8) +
  annotate("text", x = 0.25, y = 0.03, label = "Static\nNot Self-Financed",
           size = 3.5, colour = PALETTE$slate, fontface = "italic", alpha = 0.6) +
  annotate("text", x = 0.75, y = 0.03, label = "Static\nSelf-Financed",
           size = 3.5, colour = PALETTE$slate, fontface = "italic", alpha = 0.6) +
  # Non-highlighted nodes
  geom_point(
    data = nodes[!nodes$highlight, ],
    size = 8, shape = 21,
    fill = PALETTE$slate, colour = "white", stroke = 1.5, alpha = 0.8
  ) +
  geom_label(
    data = nodes[!nodes$highlight, ],
    aes(label = label),
    size = 4.5, fontface = "bold",
    fill = "white", colour = PALETTE$charcoal,
    label.padding = unit(0.4, "lines"),
    label.r = unit(0.3, "lines"),
    nudge_y = -0.07, alpha = 0.9
  ) +
  # Highlighted node (THIS THESIS)
  geom_point(
    data = nodes[nodes$highlight, ],
    size = 12, shape = 21,
    fill = PALETTE$teal, colour = "white", stroke = 2.5
  ) +
  geom_label(
    data = nodes[nodes$highlight, ],
    aes(label = label),
    size = 5.5, fontface = "bold",
    fill = PALETTE$navy, colour = "white",
    label.padding = unit(0.6, "lines"),
    label.r = unit(0.3, "lines"),
    nudge_y = -0.09
  ) +
  # Axis labels
  scale_x_continuous(
    limits = c(-0.05, 1.05),
    breaks = c(0.25, 0.75),
    labels = c("Low", "High"),
    expand = c(0, 0)
  ) +
  scale_y_continuous(
    limits = c(-0.05, 1.05),
    breaks = c(0.25, 0.75),
    labels = c("No", "Yes"),
    expand = c(0, 0)
  ) +
  labs(
    title = "Where This Work Fits",
    subtitle = "Positioning relative to existing forecast aggregation approaches",
    x = expression(bold("Adaptiveness") ~ "(learns over time)"),
    y = expression(bold("Self-Financed") ~ "(participants stake money)")
  ) +
  theme_thesis() +
  theme(
    plot.subtitle = element_text(size = 14, colour = PALETTE$slate,
                                 margin = margin(b = 15)),
    panel.grid.major = element_blank(),
    panel.grid.minor = element_blank(),
    axis.text = element_text(size = 14, face = "bold")
  ) +
  coord_fixed(ratio = 1)

# ---------------------------------------------------------------------------
# 3. Save to both output directories
# ---------------------------------------------------------------------------
save_dual(p, "positioning_matrix.png")

message("Done: positioning_matrix.png")
