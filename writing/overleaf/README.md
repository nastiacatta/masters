# Overleaf project

Self-contained LaTeX source for the thesis. Paste the two files into a
new Overleaf project (or upload them as a zip) and click *Recompile*.
No further setup is required.

## Files

- `main.tex` – the thesis source (all chapters inlined).
- `bibliography.bib` – BibTeX entries for every citation.

## Compiler

Uses `pdflatex` (Overleaf's default). Bibliography is resolved by
`bibtex` through `natbib` with `\bibliographystyle{plainnat}`, which
Overleaf runs automatically on the first recompile.

If the reference list is missing on the first build, click *Recompile
from scratch* in the Overleaf menu (Overleaf runs the
`pdflatex → bibtex → pdflatex → pdflatex` passes the first time, and
caches for subsequent edits).

## Fonts

Uses `mathptmx` (Times-family) — bundled with every TeX distribution.
No system fonts required.

## Citation style

`natbib` in author-year mode with round brackets:

- `\citep{lambert2008selffinanced}` → `(Lambert et al., 2008)`
- `\citet{lambert2008selffinanced}` → `Lambert et al. (2008)`
- `\citep{k1, k2}` → `(k1, 2008; k2, 2024)` combined

To change style (e.g. to numeric, or a society format), replace the
line `\bibliographystyle{plainnat}` in `main.tex` with any natbib-
compatible style: `abbrvnat`, `unsrtnat`, `chicago`, `apalike`, etc.

## Regenerating from the markdown source

The markdown sources under `writing/*.md` in the repo are the canonical
text. To regenerate `main.tex`:

```bash
bash writing/build/build_pdf.sh         # produces writing/build/thesis.pdf
python3 writing/overleaf/patch_for_overleaf.py   # copies + patches to overleaf/
```

The patch script applies two Overleaf-specific changes to the
pandoc-generated tex: deduplicates the `11pt` document-class option
(pandoc emits it twice), and swaps the macOS-only `fontspec` block
for the portable `mathptmx` package.
