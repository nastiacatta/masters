#!/usr/bin/env python3
"""Patch the pandoc-generated thesis.tex so it compiles on Overleaf
(pdflatex, no system-specific fonts, self-contained bibliography and
figures).

Input:  writing/build/thesis.tex
Output: writing/overleaf/main.tex
Also copies writing/bibliography.bib and writing/figures/* to
writing/overleaf/.

Idempotent: running twice produces the same output.
"""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent  # repo root
SRC_TEX = ROOT / "writing" / "build" / "thesis.tex"
SRC_BIB = ROOT / "writing" / "bibliography.bib"
SRC_FIG = ROOT / "writing" / "figures"
OUT_DIR = ROOT / "writing" / "overleaf"
OUT_TEX = OUT_DIR / "main.tex"
OUT_BIB = OUT_DIR / "bibliography.bib"
OUT_FIG = OUT_DIR / "figures"

OUT_DIR.mkdir(exist_ok=True)

text = SRC_TEX.read_text()

# 1. Deduplicate the "11pt" in \documentclass options.
text = text.replace(
    "\\documentclass[\n  11pt,\n  11pt,\n  a4paper,",
    "\\documentclass[\n  11pt,\n  a4paper,",
)

# 2. Swap fontspec/Times-New-Roman block for portable mathptmx.
xetex_block = (
    "\\ifPDFTeX\\else\n"
    "  % xetex/luatex font selection\n"
    "  \\setmainfont[]{Times New Roman}\n"
    "  \\setmonofont[Scale=0.82]{Menlo}\n"
    "\\fi"
)
portable_block = (
    "% Portable Times-family body font; works under pdflatex (Overleaf\n"
    "% default) with no external fonts required.\n"
    "\\usepackage{mathptmx}"
)
text = text.replace(xetex_block, portable_block)

# 3. Rewrite figure paths to be relative to the overleaf/ folder.
text = text.replace("{writing/figures/", "{figures/")

OUT_TEX.write_text(text)
shutil.copy(SRC_BIB, OUT_BIB)

# 4. Mirror the figures folder.
if OUT_FIG.exists():
    shutil.rmtree(OUT_FIG)
shutil.copytree(SRC_FIG, OUT_FIG)

print(f"Wrote {OUT_TEX}")
print(f"Wrote {OUT_BIB}")
print(f"Wrote {OUT_FIG}/ ({len(list(OUT_FIG.iterdir()))} images)")
