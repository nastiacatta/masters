# Thesis writing workspace

This folder is the living reference for the written thesis. Every file here
is meant to be a **durable block of source material** — results, phrasing,
theoretical context, bibliographic entries — that feeds the final report
without having to be re-derived. If a number, plot, or quote lives here, it
came from a committed artefact in the repo and is traceable back to it.

## Status

Several experiments are still running. Sections tagged `[PENDING]` below are
scaffolds with the expected inputs and shape of the numbers; drop the real
values in as each run completes. Everything marked `[LOCKED]` is already
supported by committed outputs and should be treated as stable.

## Layout

| File | Purpose | Status |
|---|---|---|
| `00_outline.md` | Top-level thesis structure + section word budgets | skeleton |
| `10_abstract_and_question.md` | Abstract drafts, research question framing | partial draft |
| `20_literature_review.md` | What exists, what's missing, where this sits | partial draft |
| `30_mechanism_design.md` | Full mechanism description — math + intuition | [LOCKED] |
| `40_methodology.md` | DGPs, forecaster panel, experiment protocol | [LOCKED] |
| `50_results_synthetic.md` | Correctness, skill recovery, ablation | [LOCKED] |
| `60_results_real_data.md` | Elia wind + electricity headline results | [LOCKED] — full-length wind (expanding mode), audit slice (static mode for calibration), electricity null, Elia operational-forecast baseline; horizons and published-OGD head-to-head still static-mode pending expanding re-run |
| `70_recalibration_layer.md` | Calibration deviation + isotonic fix | [LOCKED] |
| `80_robustness.md` | Behaviour presets, sybils, arbitrage | [LOCKED] |
| `90_discussion_and_limits.md` | Interpretation, caveats, what this is not | partial draft |
| `99_conclusion.md` | Conclusion, contributions, future work | partial draft |
| `bibliography.md` | Bibtex-ready entries, ordered by topic | partial, keep growing |
| `figures_and_tables.md` | Registry of every figure/table with source path | partial |
| `open_questions.md` | Running list of things still to check | active |
| `quotes_and_snippets.md` | Useful phrasings, reusable paragraphs | active |
| `theory_notes/` | One markdown note per key paper with citation + what-we-use | partial |

## Rules for this folder

1. **Never put a number here without a source path.** The source should be
   a committed file (JSON, CSV, script, spec). Pattern: `[source:
   onlinev2/outputs/...]` or `[source: scripts/...]`.
2. **Never paraphrase a theoretical claim without a citation.** Use the
   short form `(Author Year, §X)` and make sure the entry exists in
   `bibliography.md`.
3. **Every table or figure referenced in a prose section must also be
   registered in `figures_and_tables.md`.** That file is the single index
   used when assembling the final report.
4. **If something is waiting on a pending run, mark it `[PENDING]`.** Leave
   the shape of the table/paragraph visible so the result slots in cleanly.
5. **Keep `quotes_and_snippets.md` honest — it's for our voice, not
   marketing copy.** The voice is the thesis-claims voice: direct,
   source-linked, honest about scope.

## How it relates to the rest of the repo

- `THESIS_CLAIMS.md` is the canonical claim list. Anything in `writing/`
  should be consistent with a claim there, or should explicitly flag that
  it extends / refines the claim.
- `dashboard/docs/MECHANISM_ANALYSIS.md` is the narrative companion for the
  interactive dashboard and uses a looser register. We can reuse wording
  but tighten it for print.
- `presentation/script-2026-04-20.md` and the three `script_part*.md` files
  are the oral-defence register. Good source for intuition paragraphs; not
  suitable verbatim for the written thesis.
- `theory/` holds the PDFs of the primary sources and their OCR-to-markdown
  versions. `writing/theory_notes/` extracts only what the thesis uses.
- `docs/references_sources.md` is the forecast-evaluation-focused
  bibliography. `writing/bibliography.md` supersedes it and should be the
  single authoritative source going forward.
