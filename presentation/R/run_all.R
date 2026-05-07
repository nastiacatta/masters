#!/usr/bin/env Rscript
# Run every canonical slide-plot generator in presentation/R/.
#
# Usage, from the repo root:
#
#   Rscript presentation/R/run_all.R
#
# Each script is fail-isolated: a missing upstream CSV or JSON in one
# script will not block the rest. A summary line at the end reports
# which scripts succeeded.

scripts <- list.files("presentation/R", pattern = "^plot_.*\\.R$",
                      full.names = TRUE)

results <- data.frame(script = character(), ok = logical(), msg = character(),
                      stringsAsFactors = FALSE)

for (s in scripts) {
  cat(sprintf("\n=== Running %s ===\n", basename(s)))
  ok <- tryCatch({
    source(s, local = new.env(parent = globalenv()))
    TRUE
  }, error = function(e) {
    cat(sprintf("ERROR: %s\n", conditionMessage(e)))
    FALSE
  })
  results <- rbind(results,
                   data.frame(script = basename(s), ok = ok,
                              msg = if (ok) "ok" else "failed",
                              stringsAsFactors = FALSE))
}

cat("\n\n=== Summary ===\n")
for (i in seq_len(nrow(results))) {
  status <- if (results$ok[i]) "\u2713" else "\u2717"
  cat(sprintf("  %s  %s\n", status, results$script[i]))
}
cat(sprintf("\n%d of %d succeeded.\n",
            sum(results$ok), nrow(results)))
if (!all(results$ok)) quit(status = 1)
