#!/usr/bin/env python3
"""Compile the writing/ markdown files into a single PDF.

Usage (from repo root):
    python3 writing/build_pdf.py            # build writing/thesis_draft.pdf
    python3 writing/build_pdf.py --tex      # also keep the intermediate .tex
    python3 writing/build_pdf.py --fast     # skip pdf build, write .tex only

Design goals:

- Zero external Python dependencies (standard library only).
- Zero pandoc dependency; uses a deliberately small subset of markdown.
- One command to rebuild after any edit to writing/*.md.
- Easy to reorder/exclude sections by editing writing/include_order.txt.

Markdown subset supported (by design — keep writing/ in this register):

- Headings: # .. #### (mapped to chapter/section/subsection/subsubsection).
- Bold **x**, italic *x* and _x_, inline code `x`.
- Pipe tables with a header separator row ``|---|---|``.
- Unordered (``-``) and ordered (``1.``) lists. Nested lists are flattened
  to a single level (fine for our register).
- Block quotes with ``>``.
- Horizontal rules ``---``.
- Links ``[text](url)`` are rendered as ``text`` followed by a footnote with
  the URL (kept reviewable in print).
- Fenced code blocks ``` (rendered verbatim).

Anything outside that subset is passed through as plain text with LaTeX
escaping applied.

PDF compiler: prefers ``./tectonic`` from the repo root (tectonic ships a
complete TeX Live, so no system install needed). Falls back to
``pdflatex``/``xelatex`` if present. Tectonic is the default for
reliability on macOS.
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration

WRITING_DIR = Path(__file__).resolve().parent
REPO_ROOT = WRITING_DIR.parent

INCLUDE_ORDER_FILE = WRITING_DIR / "include_order.txt"
DEFAULT_ORDER = [
    "README.md",
    "00_outline.md",
    "10_abstract_and_question.md",
    "20_literature_review.md",
    "30_mechanism_design.md",
    "40_methodology.md",
    "50_results_synthetic.md",
    "60_results_real_data.md",
    "70_recalibration_layer.md",
    "80_robustness.md",
    "90_discussion_and_limits.md",
    "99_conclusion.md",
    "bibliography.md",
    "figures_and_tables.md",
    "open_questions.md",
    "quotes_and_snippets.md",
]

THEORY_NOTES_DIR = WRITING_DIR / "theory_notes"
THEORY_README = "README.md"
OUT_TEX = WRITING_DIR / "thesis_draft.tex"
OUT_PDF = WRITING_DIR / "thesis_draft.pdf"


# ---------------------------------------------------------------------------
# Markdown to LaTeX conversion

# Characters that need escaping in LaTeX. Order matters: backslash first.
LATEX_ESCAPES = [
    ("\\", r"\textbackslash{}"),
    ("&", r"\&"),
    ("%", r"\%"),
    ("$", r"\$"),
    ("#", r"\#"),
    ("_", r"\_"),
    ("{", r"\{"),
    ("}", r"\}"),
    ("~", r"\textasciitilde{}"),
    ("^", r"\textasciicircum{}"),
]


def escape_latex(text: str) -> str:
    """Escape LaTeX special characters in plain text."""
    out = text
    for a, b in LATEX_ESCAPES:
        out = out.replace(a, b)
    return out


def escape_latex_preserve(text: str) -> str:
    """Escape LaTeX special characters but keep already-emitted LaTeX macros.

    Two-step: (1) protect segments we've already converted (code/emph/etc.)
    by stashing them under placeholders, (2) escape the rest, (3) restore.
    """
    placeholders: list[str] = []

    def stash(match: re.Match[str]) -> str:
        placeholders.append(match.group(0))
        return f"\x00PLACEHOLDER{len(placeholders) - 1}\x00"

    # Protect inline code first (spans between single backticks).
    protected = re.sub(r"`([^`\n]+)`", stash, text)
    # Protect already-escaped LaTeX macros like \textbf{...}, \emph{...}.
    protected = re.sub(r"\\[a-zA-Z]+\{[^{}]*\}", stash, protected)

    escaped = escape_latex(protected)

    # Restore placeholders (re-converted to proper LaTeX below by caller).
    def restore(match: re.Match[str]) -> str:
        idx = int(match.group(1))
        return placeholders[idx]

    return re.sub(r"\x00PLACEHOLDER(\d+)\x00", restore, escaped)


def convert_inline(text: str) -> str:
    """Convert inline markdown (emphasis, code, links) to LaTeX.

    Runs before escape_latex_preserve — the LaTeX macros it emits are
    protected by the placeholder mechanism.
    """
    # Inline code first so *_` inside it is not touched.
    def code_sub(match: re.Match[str]) -> str:
        inner = match.group(1)
        # Use \texttt with manual escape for the inner content.
        return r"\texttt{" + escape_latex(inner) + r"}"

    text = re.sub(r"`([^`\n]+)`", code_sub, text)

    # Links: [text](url) → text (url as footnote).
    def link_sub(match: re.Match[str]) -> str:
        label = match.group(1)
        url = match.group(2)
        # Don't convert label here; the outer escape pass handles it.
        # Emit label + small sans-serif URL in footnote-style brackets.
        url_clean = url.replace("#", r"\#").replace("%", r"\%")
        return f"{label}\\,\\href{{{url_clean}}}{{\\scriptsize\\texttt{{[link]}}}}"

    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link_sub, text)

    # Bold **x**.
    text = re.sub(r"\*\*([^*\n]+)\*\*", r"\\textbf{\1}", text)
    # Italic *x* (after bold).
    text = re.sub(r"(?<![*\w])\*([^*\n]+)\*(?![*\w])", r"\\emph{\1}", text)
    # Italic _x_.
    text = re.sub(r"(?<![_\w])_([^_\n]+)_(?![_\w])", r"\\emph{\1}", text)

    return text


def render_table(header: list[str], rows: list[list[str]], alignments: list[str]) -> str:
    """Render a markdown table as a LaTeX tabular environment."""
    col_spec = "".join(alignments)
    lines = [
        r"\begin{center}",
        r"\small",
        r"\begin{tabular}{" + col_spec + r"}",
        r"\toprule",
    ]
    lines.append(" & ".join(header) + r" \\")
    lines.append(r"\midrule")
    for row in rows:
        # Normalise length against header.
        while len(row) < len(header):
            row.append("")
        lines.append(" & ".join(row[: len(header)]) + r" \\")
    lines.append(r"\bottomrule")
    lines.append(r"\end{tabular}")
    lines.append(r"\end{center}")
    return "\n".join(lines)


def parse_table(lines: list[str], start: int) -> tuple[str, int]:
    """Parse a pipe-delimited table starting at lines[start].

    Returns the LaTeX rendering and the index just past the table.
    """
    header_line = lines[start].strip().strip("|")
    sep_line = lines[start + 1].strip().strip("|")
    header = [cell.strip() for cell in header_line.split("|")]
    sep_cells = [cell.strip() for cell in sep_line.split("|")]

    # Derive alignments from the separator row.
    alignments = []
    for cell in sep_cells:
        if cell.startswith(":") and cell.endswith(":"):
            alignments.append("c")
        elif cell.endswith(":"):
            alignments.append("r")
        else:
            alignments.append("l")
    # Pad if header has more columns than separator.
    while len(alignments) < len(header):
        alignments.append("l")

    rows: list[list[str]] = []
    i = start + 2
    while i < len(lines):
        raw = lines[i]
        if not raw.strip().startswith("|"):
            break
        row_text = raw.strip().strip("|")
        row = [cell.strip() for cell in row_text.split("|")]
        # Inline-convert and escape each cell.
        row_converted = [
            escape_latex_preserve(convert_inline(c)) for c in row
        ]
        rows.append(row_converted)
        i += 1

    header_converted = [
        r"\textbf{" + escape_latex_preserve(convert_inline(h)) + r"}"
        for h in header
    ]
    return render_table(header_converted, rows, alignments), i


HEADER_COMMANDS = {
    1: "chapter",
    2: "section",
    3: "subsection",
    4: "subsubsection",
    5: "paragraph",
}


def convert_markdown_block(md: str) -> str:
    """Convert a single markdown document to LaTeX body text.

    Processes line by line to keep tables and code blocks intact.
    Returns LaTeX source without a preamble or document wrapper.
    """
    lines = md.splitlines()
    out: list[str] = []
    i = 0
    in_list = False
    list_type = None  # "itemize" or "enumerate"
    in_quote = False
    in_code_block = False

    def close_list() -> None:
        nonlocal in_list, list_type
        if in_list:
            out.append(r"\end{" + list_type + r"}")
            in_list = False
            list_type = None

    def close_quote() -> None:
        nonlocal in_quote
        if in_quote:
            out.append(r"\end{quote}")
            in_quote = False

    while i < len(lines):
        raw = lines[i]
        stripped = raw.strip()

        # Fenced code block.
        if stripped.startswith("```"):
            close_list()
            close_quote()
            if in_code_block:
                out.append(r"\end{verbatim}")
                in_code_block = False
            else:
                out.append(r"\begin{verbatim}")
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            out.append(raw)
            i += 1
            continue

        # Horizontal rule.
        if re.fullmatch(r"-{3,}|\*{3,}|_{3,}", stripped):
            close_list()
            close_quote()
            out.append(r"\vspace{0.6em}\hrule\vspace{0.6em}")
            i += 1
            continue

        # Heading.
        m = re.match(r"^(#{1,6})\s+(.*)$", raw)
        if m:
            close_list()
            close_quote()
            level = len(m.group(1))
            title = m.group(2).strip()
            title = escape_latex_preserve(convert_inline(title))
            cmd = HEADER_COMMANDS.get(level, "subsubsection")
            # Keep heading command numbered; TOC depth handled in preamble.
            out.append(f"\\{cmd}{{{title}}}")
            i += 1
            continue

        # Table (header, then separator).
        if (
            "|" in stripped
            and i + 1 < len(lines)
            and re.match(r"^\s*\|?[\s:\-\|]+\|?\s*$", lines[i + 1])
            and "-" in lines[i + 1]
        ):
            close_list()
            close_quote()
            rendered, next_i = parse_table(lines, i)
            out.append(rendered)
            i = next_i
            continue

        # Block quote.
        if stripped.startswith(">"):
            if not in_quote:
                close_list()
                out.append(r"\begin{quote}")
                in_quote = True
            payload = stripped[1:].lstrip()
            out.append(escape_latex_preserve(convert_inline(payload)))
            i += 1
            continue
        elif in_quote and stripped == "":
            # Preserve paragraph breaks inside quote.
            out.append("")
            i += 1
            continue
        else:
            close_quote()

        # Unordered list item.
        m_ul = re.match(r"^(\s*)[-*]\s+(.*)$", raw)
        if m_ul:
            if not in_list or list_type != "itemize":
                close_list()
                out.append(r"\begin{itemize}")
                in_list = True
                list_type = "itemize"
            item = escape_latex_preserve(convert_inline(m_ul.group(2).strip()))
            out.append(r"  \item " + item)
            i += 1
            continue

        # Ordered list item.
        m_ol = re.match(r"^(\s*)\d+\.\s+(.*)$", raw)
        if m_ol:
            if not in_list or list_type != "enumerate":
                close_list()
                out.append(r"\begin{enumerate}")
                in_list = True
                list_type = "enumerate"
            item = escape_latex_preserve(convert_inline(m_ol.group(2).strip()))
            out.append(r"  \item " + item)
            i += 1
            continue

        # Continuation of the previous list item (indented line).
        if in_list and raw.startswith(("  ", "\t")) and stripped:
            out.append("    " + escape_latex_preserve(convert_inline(stripped)))
            i += 1
            continue

        # Blank line.
        if stripped == "":
            close_list()
            out.append("")
            i += 1
            continue

        # Plain paragraph line.
        close_list()
        out.append(escape_latex_preserve(convert_inline(stripped)))
        i += 1

    close_list()
    close_quote()
    if in_code_block:
        out.append(r"\end{verbatim}")

    return "\n".join(out)


# ---------------------------------------------------------------------------
# LaTeX preamble and document assembly

PREAMBLE = r"""\documentclass[11pt,a4paper,openany]{report}

% tectonic uses XeTeX under the hood — native Unicode. Avoid inputenc.
\usepackage{fontspec}
\defaultfontfeatures{Ligatures=TeX}

% Fall back to the LaTeX-default "Latin Modern Roman" XeTeX knows about
% without any font-cache magic. fontspec auto-discovers it.
\setmainfont{Latin Modern Roman}
\setsansfont{Latin Modern Sans}
\setmonofont{Latin Modern Mono}

% Math glyphs via mathspec or unicode-math would be ideal, but they are
% touchy about font presence. Use the classic amsmath + cm-math defaults.
\usepackage{amsmath}
\usepackage{amssymb}

\usepackage[margin=2.5cm]{geometry}
\usepackage{booktabs}
\usepackage{longtable}
\usepackage{hyperref}
\hypersetup{
  colorlinks=true,
  linkcolor=black,
  urlcolor=black,
  citecolor=black,
}
\usepackage{enumitem}
\setlist{itemsep=0.2em,topsep=0.3em}
\usepackage{parskip}
\usepackage{titlesec}
\titleformat{\chapter}[hang]{\Large\bfseries}{\thechapter.}{0.5em}{}
\titlespacing*{\chapter}{0pt}{-0.8em}{0.8em}
\titleformat{\section}{\large\bfseries}{\thesection}{0.5em}{}
\titleformat{\subsection}{\normalsize\bfseries}{\thesubsection}{0.5em}{}
\titleformat{\subsubsection}{\normalsize\itshape}{}{0em}{}
\setcounter{tocdepth}{2}
\setcounter{secnumdepth}{3}
\raggedbottom

\title{%
  Online Skill Learning for Self-Financed Forecasting Markets\\
  \vspace{0.3em}\large Thesis writing workspace — compiled draft%
}
\author{Anastasia Cattaneo}
\date{\today}

\begin{document}
\maketitle
\tableofcontents
\clearpage
"""

POSTAMBLE = r"""
\end{document}
"""


def load_include_order() -> list[str]:
    """Return the ordered list of markdown filenames to include."""
    if INCLUDE_ORDER_FILE.exists():
        names = []
        for line in INCLUDE_ORDER_FILE.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            names.append(line)
        return names
    return DEFAULT_ORDER


def build_latex() -> str:
    """Assemble the full LaTeX source."""
    parts = [PREAMBLE]
    order = load_include_order()
    missing = []

    for name in order:
        path = WRITING_DIR / name
        if not path.exists():
            missing.append(name)
            continue
        title = name_to_part_label(name)
        parts.append(rf"% ---- begin {name} ----")
        parts.append(rf"\part*{{{title}}}")
        parts.append(r"\addcontentsline{toc}{part}{" + title + r"}")
        parts.append(convert_markdown_block(path.read_text()))
        parts.append(rf"% ---- end {name} ----")
        parts.append("")

    # Theory notes appendix.
    if THEORY_NOTES_DIR.exists():
        parts.append(r"\appendix")
        parts.append(r"\part*{Appendix: Theory notes}")
        parts.append(r"\addcontentsline{toc}{part}{Appendix: Theory notes}")
        readme = THEORY_NOTES_DIR / THEORY_README
        if readme.exists():
            parts.append(convert_markdown_block(readme.read_text()))
        note_files = sorted(
            p for p in THEORY_NOTES_DIR.glob("*.md")
            if p.name != THEORY_README
        )
        for note in note_files:
            parts.append(rf"% ---- theory note {note.name} ----")
            parts.append(convert_markdown_block(note.read_text()))
            parts.append("")

    if missing:
        parts.append(r"\chapter*{Missing source files}")
        parts.append("The following files were listed in include_order.txt "
                     "but not found:")
        parts.append(r"\begin{itemize}")
        for m in missing:
            parts.append(r"  \item " + escape_latex(m))
        parts.append(r"\end{itemize}")

    parts.append(POSTAMBLE)
    return "\n".join(parts)


def name_to_part_label(name: str) -> str:
    """Return a human-readable part label for a filename."""
    base = name.removesuffix(".md")
    # Strip the leading "NN_" prefix if present.
    base = re.sub(r"^\d+_", "", base)
    base = base.replace("_", " ").strip()
    return escape_latex(base.capitalize())


# ---------------------------------------------------------------------------
# PDF build

def find_tectonic() -> Path | None:
    candidate = REPO_ROOT / "tectonic"
    if candidate.exists() and os.access(candidate, os.X_OK):
        return candidate
    return None


def run_compiler(tex_path: Path) -> int:
    """Compile the .tex to .pdf using tectonic (preferred) or xelatex."""
    tex_dir = tex_path.parent
    tectonic = find_tectonic()
    if tectonic is not None:
        cmd = [
            str(tectonic),
            "--outdir", str(tex_dir),
            "--keep-intermediates",
            "--keep-logs",
            str(tex_path),
        ]
        print("[build_pdf] running:", " ".join(cmd))
        return subprocess.run(cmd, check=False).returncode

    # Fallback: try xelatex (handles unicode), then pdflatex.
    for compiler in ("xelatex", "pdflatex"):
        try:
            cmd = [
                compiler,
                "-interaction=nonstopmode",
                "-halt-on-error",
                "-output-directory", str(tex_dir),
                str(tex_path),
            ]
            print("[build_pdf] running:", " ".join(cmd))
            rc = subprocess.run(cmd, check=False).returncode
            if rc == 0:
                # Second pass for TOC.
                subprocess.run(cmd, check=False)
                return 0
        except FileNotFoundError:
            continue
    print("[build_pdf] ERROR: no compiler available (tectonic, xelatex, pdflatex).")
    return 1


def write_include_order_if_missing() -> None:
    if INCLUDE_ORDER_FILE.exists():
        return
    INCLUDE_ORDER_FILE.write_text(
        "# One filename per line, in the order they should appear in the PDF.\n"
        "# Blank lines and lines starting with '#' are ignored.\n"
        "# Remove a line to exclude that file from the build.\n\n"
        + "\n".join(DEFAULT_ORDER) + "\n"
    )
    print(f"[build_pdf] wrote default include order to {INCLUDE_ORDER_FILE}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--tex", action="store_true",
                    help="keep the .tex intermediate alongside the .pdf")
    ap.add_argument("--fast", action="store_true",
                    help="write .tex only, skip compilation")
    args = ap.parse_args()

    write_include_order_if_missing()

    print(f"[build_pdf] assembling LaTeX source → {OUT_TEX}")
    latex = build_latex()
    OUT_TEX.write_text(latex)

    if args.fast:
        print("[build_pdf] --fast: skipping PDF compile.")
        return 0

    rc = run_compiler(OUT_TEX)
    if rc != 0:
        print(f"[build_pdf] compile failed (rc={rc}); see log beside {OUT_TEX}.")
        return rc

    if not args.tex and OUT_TEX.exists():
        OUT_TEX.unlink()

    if OUT_PDF.exists():
        print(f"[build_pdf] wrote {OUT_PDF}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
