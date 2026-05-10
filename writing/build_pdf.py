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

# Section markers recognised in include_order.txt. Anything between
# a marker and the next marker is emitted inside the matching
# structural block. Front matter and back matter are not page-
# counted by the DESE70002 handbook; the 35-page main-body cap
# applies only to the \mainmatter block (measured at 12pt).
SECTION_MARKERS = {
    "front matter": "frontmatter",
    "main body": "mainmatter",
    "back matter": "backmatter",
    "appendices": "appendix",
}

# Default order used when include_order.txt is missing. Mirrors the
# structure laid down by the report-format steering rule.
DEFAULT_ORDER: list[tuple[str, list[str]]] = [
    ("frontmatter", [
        "front_matter/01_abstract.md",
        "front_matter/03_acknowledgments.md",
    ]),
    ("mainmatter", [
        "10_introduction.md",
        "15_project_management.md",
        "20_literature_review.md",
        "30_mechanism_design.md",
        "40_methodology.md",
        "50_results_synthetic.md",
        "60_results_real_data.md",
        "70_recalibration_layer.md",
        "80_robustness.md",
        "90_discussion_and_limits.md",
        "95_reflection.md",
        "99_conclusion.md",
    ]),
    ("backmatter", [
        "back_matter/90_references.md",
        "back_matter/91_declaration_ai_use.md",
    ]),
    ("appendix", [
        "appendix/A_proofs.md",
        "appendix/B_hyperparameters.md",
        "appendix/C_behaviour_presets.md",
        "appendix/D_training_details.md",
        "appendix/E_bankroll_pipeline.md",
    ]),
]

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


# Unicode math/typographic characters that Latin Modern OTF does not
# contain. Replace them with LaTeX equivalents *before* markdown
# conversion so we don't have to rely on unicode-math / STIX fonts.
# Every replacement is wrapped in \ensuremath{...} so it survives the
# escape_latex_preserve placeholder pass (which recognises macros with
# braces) and works in both text and math mode.
UNICODE_TO_LATEX: dict[str, str] = {
    # Math relations / operators.
    "\u2248": r"\ensuremath{\approx}",   # ≈
    "\u2260": r"\ensuremath{\neq}",      # ≠
    "\u2264": r"\ensuremath{\leq}",      # ≤
    "\u2265": r"\ensuremath{\geq}",      # ≥
    "\u00b1": r"\ensuremath{\pm}",       # ±
    "\u00d7": r"\ensuremath{\times}",    # ×
    "\u00f7": r"\ensuremath{\div}",      # ÷
    "\u2212": r"\ensuremath{-}",         # − (minus sign)
    # Greek letters most commonly appearing in prose.
    "\u03b1": r"\ensuremath{\alpha}",   # α
    "\u03b2": r"\ensuremath{\beta}",    # β
    "\u03b3": r"\ensuremath{\gamma}",   # γ
    "\u03b4": r"\ensuremath{\delta}",   # δ
    "\u03b5": r"\ensuremath{\varepsilon}",
    "\u03b7": r"\ensuremath{\eta}",     # η
    "\u03ba": r"\ensuremath{\kappa}",   # κ
    "\u03bb": r"\ensuremath{\lambda}",  # λ
    "\u03bc": r"\ensuremath{\mu}",      # μ
    "\u03c1": r"\ensuremath{\rho}",     # ρ
    "\u03c3": r"\ensuremath{\sigma}",   # σ
    "\u03c4": r"\ensuremath{\tau}",     # τ
    "\u03c6": r"\ensuremath{\phi}",     # φ
    "\u03c8": r"\ensuremath{\psi}",     # ψ
    "\u03c9": r"\ensuremath{\omega}",   # ω
    "\u0394": r"\ensuremath{\Delta}",   # Δ
    "\u03a3": r"\ensuremath{\Sigma}",   # Σ
    "\u03a0": r"\ensuremath{\Pi}",      # Π
    "\u03a6": r"\ensuremath{\Phi}",     # Φ
    "\u03a8": r"\ensuremath{\Psi}",     # Ψ
    "\u03a9": r"\ensuremath{\Omega}",   # Ω
    # Typographic characters — en-dash, em-dash, and the Unicode arrows
    # — are already in LM, so we leave them alone.
}


def replace_unicode_math(text: str) -> str:
    """Replace bare Unicode math characters with LaTeX macros.

    Runs before escape_latex so the backslashes in the LaTeX
    replacements do not get escaped. Safe to call on any text.
    """
    if not UNICODE_TO_LATEX:
        return text
    for u, lx in UNICODE_TO_LATEX.items():
        if u in text:
            text = text.replace(u, lx)
    return text


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
    # Protect inline math (single $...$) and display math ($$...$$) —
    # the markdown sources contain LaTeX math inline (e.g. `$\sigma$`,
    # `$\hat C_i$`) and in display blocks that span lines. Without
    # protection the `$` signs get escaped to `\$` and the enclosed
    # macros get their backslashes doubled. Display math must match
    # across newlines (hence re.DOTALL).
    protected = re.sub(r"\$\$.+?\$\$", stash, protected, flags=re.DOTALL)
    # Inline math is $...$; the regex allows newlines because the
    # source sometimes wraps inline math across two lines (e.g. a long
    # formula with `\qquad`). Cap the span at ~400 chars so an unmatched
    # `$` does not eat the rest of the paragraph.
    protected = re.sub(r"\$[^$]{1,400}?\$", stash, protected, flags=re.DOTALL)
    # Protect already-escaped LaTeX macros. Four shapes, in order from
    # most specific to least:
    #   \macro[opt]{arg1}{arg2}...  — e.g. \hypersetup{...}, \href[opt]{}
    #   \macro{arg}                — e.g. \textbf{x}, \emph{x}, \cite{k}
    #   \macro                     — e.g. \item, \hline, \newline, \maketitle
    #   \x                         — single-character math spacing like
    #                                \, \; \! \: \| \$ \# \% \& \_ \{ \}
    #                                and \<space> (inter-sentence space after
    #                                an abbreviation, e.g. ``et al.\ target'').
    # Cases 3 and 4 are important for bare commands (\item inside
    # enumerate/itemize, \, thin-space in prose) and must run after
    # the more specific patterns.
    protected = re.sub(
        r"\\[a-zA-Z]+(?:\[[^\]]*\])?(?:\{[^{}]*\}){1,4}",
        stash,
        protected,
    )
    protected = re.sub(r"\\[a-zA-Z]+\b", stash, protected)
    protected = re.sub(r"\\[,;!:|\$\#\%\&\_\{\}]", stash, protected)
    # Preserve LaTeX's inter-sentence spacing ``\<space>'' (``abbrev.\ next'')
    # so escape_latex below does not convert the backslash into
    # \textbackslash{}. Matches a backslash followed by a literal space
    # (not a newline). The trailing space is stashed with the backslash
    # as a single atomic token.
    protected = re.sub(r"\\ ", stash, protected)
    # Preserve LaTeX's non-breaking tie ``~'' (e.g. ``Chapter~\ref{ch:foo}'',
    # ``$74.0$~MW''). The tie must reach the LaTeX output; escaping it to
    # \textasciitilde{} turns a non-breaking space into a literal tilde
    # character, which breaks every cross-reference that uses the tie.
    protected = re.sub(r"~", stash, protected)

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


def convert_markdown_block(md: str, numbered_chapters: bool = True) -> str:
    """Convert a single markdown document to LaTeX body text.

    Processes line by line to keep tables and code blocks intact.
    Returns LaTeX source without a preamble or document wrapper.

    When ``numbered_chapters`` is False, H1 headings are emitted as
    ``\\chapter*{...}`` with an explicit TOC entry so front/back
    matter files (abstract, acknowledgments, references, AI
    declaration) appear in the contents without a chapter number.
    """
    # Pre-pass: swap Unicode math / Greek characters for LaTeX macros.
    # Done before line-by-line conversion so the macros pass through the
    # escape layer unchanged (they are stashed as LaTeX commands).
    md = replace_unicode_math(md)

    # Pre-pass: strip HTML comments (`<!-- ... -->`). They are used
    # throughout writing/ as author-only cross-reference notes and
    # must not appear in the compiled PDF. The regex spans lines so
    # a multi-line comment (`<!--\n...\n-->`) is consumed whole.
    md = re.sub(r"<!--.*?-->", "", md, flags=re.DOTALL)

    # Pre-pass: figure paths are written as `writing/figures/...` in the
    # markdown sources (so they resolve from the repository root). The
    # build compiles inside the writing/ directory, so strip the
    # `writing/` prefix from `\includegraphics{...}` arguments.
    md = re.sub(
        r"(\\includegraphics(?:\[[^\]]*\])?\{)writing/",
        r"\1",
        md,
    )

    # Pre-pass: stash inline math spans that cross a line boundary so
    # that the later line-by-line escape pass does not see them as
    # naked `$` characters. Each stashed span is replaced by a
    # placeholder of the form `\x00MATHSPAN<N>\x00` which escape_latex
    # treats as plain text but which we restore to the original `$...$`
    # fragment at the end of this function. We do *not* touch
    # same-line inline math — escape_latex_preserve handles that.
    # Display math (`$$...$$` on their own lines) is handled by a
    # dedicated block inside the line loop below.
    preserved_math_spans: list[str] = []

    def _stash_multiline_math(match: re.Match[str]) -> str:
        preserved_math_spans.append(match.group(0))
        return f"\x01MATHSPAN{len(preserved_math_spans) - 1}\x01"

    # Display math `$$...$$` first, so its delimiters are consumed
    # whole before the single-`$` inline regex runs on the remainder.
    # Failing to do this causes the single-`$` regex to match the
    # inner two dollars of `$$...$$` and shred the display block.
    md = re.sub(
        r"\$\$.+?\$\$",
        _stash_multiline_math,
        md,
        flags=re.DOTALL,
    )
    # Then inline math. The span may cross a single newline (formulas
    # with `\qquad` occasionally wrap) but should not cross a blank
    # line or an unrelated `$`.
    md = re.sub(
        r"\$[^$]+?\$",
        _stash_multiline_math,
        md,
        flags=re.DOTALL,
    )

    # Raw LaTeX environments that the markdown source embeds directly
    # (\begin{table}...\end{table}, tabular, equation, align, figure,
    # enumerate, itemize — though the last two are only embedded when
    # the list spans code vs prose boundaries). Stash them whole so the
    # inner `&` and `\\` separators are not escape-mangled.
    md = re.sub(
        r"\\begin\{(table|tabular|equation\*?|align\*?|figure|gather\*?"
        r"|eqnarray\*?|array|longtable)\}.+?\\end\{\1\}",
        _stash_multiline_math,
        md,
        flags=re.DOTALL,
    )

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

        # Display-math block delimited by `$$` on its own line. The
        # enclosed content is raw LaTeX that must NOT pass through the
        # escape pass. Emit as `\[...\]` so it survives in both
        # author-year text mode and math mode.
        if stripped == "$$":
            close_list()
            close_quote()
            math_lines: list[str] = []
            j = i + 1
            while j < len(lines) and lines[j].strip() != "$$":
                math_lines.append(lines[j])
                j += 1
            out.append(r"\[")
            out.extend(math_lines)
            out.append(r"\]")
            i = j + 1
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
            # Pandoc-style inline label: `# Title {#label}`. Strip it
            # from the title and emit a matching `\label{...}` after
            # the heading so cross-references work.
            label_match = re.search(r"\s*\{#([^}]+)\}\s*$", title)
            label = None
            if label_match:
                label = label_match.group(1)
                title = title[: label_match.start()].rstrip()
            title = escape_latex_preserve(convert_inline(title))
            cmd = HEADER_COMMANDS.get(level, "subsubsection")
            if level == 1 and not numbered_chapters:
                # Unnumbered chapter with manual TOC entry, used for
                # front-matter and back-matter files (abstract,
                # acknowledgments, references, AI declaration).
                out.append(f"\\chapter*{{{title}}}")
                out.append(f"\\addcontentsline{{toc}}{{chapter}}{{{title}}}")
            else:
                # Keep heading command numbered; TOC depth handled in preamble.
                out.append(f"\\{cmd}{{{title}}}")
            if label:
                out.append(f"\\label{{{label}}}")
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

    rendered = "\n".join(out)

    # Restore multi-line inline math placeholders. We do this last so
    # all markdown conversion and escaping is complete before the raw
    # math spans reappear. The `\x01` sentinel is chosen so plain
    # escape_latex passes it through unchanged.
    #
    # The restore is iterated because a stashed environment (e.g. a
    # tabular block) can itself contain a stashed span (e.g. `$m_i$`).
    # A single substitution would reintroduce the inner placeholder
    # without expanding it. We loop until no placeholders remain, with
    # a safety cap to avoid runaway.
    if preserved_math_spans:
        def _restore(match: re.Match[str]) -> str:
            idx = int(match.group(1))
            return preserved_math_spans[idx]
        for _ in range(8):
            new_rendered = re.sub(r"\x01MATHSPAN(\d+)\x01", _restore, rendered)
            if new_rendered == rendered:
                break
            rendered = new_rendered

    return rendered


# ---------------------------------------------------------------------------
# LaTeX preamble and document assembly

PREAMBLE = r"""\documentclass[12pt,a4paper,openany]{report}

% Engine-agnostic preamble: works with pdflatex, xelatex, and tectonic.
%
% We detect the engine with iftex. For XeTeX/LuaTeX we use fontspec +
% Latin Modern via the TeX Live TTFs (Tectonic fetches these on demand
% from its bundle). For plain pdfTeX (no Unicode, no fontspec) we use
% the classical inputenc + lmodern route, which ships with any texlive.
\usepackage{iftex}
\ifxetex
  \usepackage{fontspec}
  \defaultfontfeatures{Ligatures=TeX}
  % `Latin Modern Roman` is the XeTeX-visible name installed by TeX Live.
  % If it is absent (as with an incomplete font cache), fontspec will
  % throw a recoverable error. Tectonic resolves it from its bundle.
  \IfFontExistsTF{Latin Modern Roman}{%
    \setmainfont{Latin Modern Roman}%
    \setsansfont{Latin Modern Sans}%
    \setmonofont{Latin Modern Mono}%
  }{%
    % Tectonic bundle ships with lmroman10-regular.otf; try that by file.
    \IfFontExistsTF{lmroman10-regular.otf}{%
      \setmainfont{lmroman10-regular.otf}[%
        BoldFont        = lmroman10-bold.otf,%
        ItalicFont      = lmroman10-italic.otf,%
        BoldItalicFont  = lmroman10-bolditalic.otf%
      ]%
      \setsansfont{lmsans10-regular.otf}[%
        BoldFont        = lmsans10-bold.otf,%
        ItalicFont      = lmsans10-oblique.otf%
      ]%
      \setmonofont{lmmono10-regular.otf}[%
        BoldFont   = lmmonolt10-bold.otf,%
        ItalicFont = lmmono10-italic.otf%
      ]%
    }{%
      % Last resort: system default, warn to log but continue.
      \PackageWarning{thesis}{Latin Modern not found; using fontspec default}%
    }%
  }
\else\ifluatex
  \usepackage{fontspec}
  \defaultfontfeatures{Ligatures=TeX}
  \setmainfont{Latin Modern Roman}
  \setsansfont{Latin Modern Sans}
  \setmonofont{Latin Modern Mono}
\else
  % pdfTeX path.
  \usepackage[T1]{fontenc}
  \usepackage[utf8]{inputenc}
  \usepackage{lmodern}
  \usepackage{textcomp}
\fi\fi

% Math glyphs — classical amsmath + amssymb work under all three engines.
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{amsthm}
% Theorem-like environments used in the mechanism-design chapter.
\newtheorem{lemma}{Lemma}[chapter]
\newtheorem{theorem}[lemma]{Theorem}
\newtheorem{proposition}[lemma]{Proposition}
\newtheorem{corollary}[lemma]{Corollary}
\theoremstyle{definition}
\newtheorem{definition}[lemma]{Definition}
\theoremstyle{remark}
\newtheorem*{remark}{Remark}

\usepackage[margin=2.5cm]{geometry}
\usepackage{booktabs}
\usepackage{longtable}
\usepackage{tabularx}
\usepackage{array}
% Column type ``Y'' = tabularx column that wraps on word boundaries
% (`>{\raggedright\arraybackslash}`), useful for wide appendix tables.
\newcolumntype{Y}{>{\raggedright\arraybackslash}X}
\usepackage{graphicx}
% Figure paths in the markdown sources are written as
% `writing/figures/...` (so they resolve from the repo root). When
% build_pdf.py compiles in the writing/ directory, the same paths are
% one level too deep. Add both search paths so either form works.
\graphicspath{{./}{./figures/}{./writing/}{./writing/figures/}{../writing/figures/}}

% natbib is loaded *before* hyperref to get clean \citet/\citep links.
% The markdown source uses natbib-style citations pervasively
% (\citet{...} and \citep{...}); without this the \cite* commands are
% undefined. authoryear gives the (Author, Year) form; round puts them
% in parentheses to match the prose in chapters 2, 6, 7, 8.
\IfFileExists{natbib.sty}{%
  \usepackage[round,authoryear]{natbib}%
}{%
  % Fallback: define \citet/\citep to plain \cite so the document still
  % compiles if natbib is absent. Citation keys will appear as [key].
  \providecommand{\citet}[1]{\cite{#1}}%
  \providecommand{\citep}[1]{\cite{#1}}%
}

% Allow \url{...} inside hyperref to break at hyphens in long URLs.
% Must be passed before hyperref loads the url package internally.
\PassOptionsToPackage{hyphens}{url}
\usepackage{hyperref}
\hypersetup{
  colorlinks=true,
  linkcolor=black,
  urlcolor=black,
  citecolor=black,
}

% microtype does subtle glyph scaling, character protrusion, and
% spacing that fixes most overfull/underfull \hbox warnings in
% body text. Font expansion is pdftex-only; under xetex/luatex we
% enable protrusion only. Optional: skip if absent (texlive-basic
% does not include it; tectonic's bundle does).
\IfFileExists{microtype.sty}{%
  \ifxetex
    \usepackage[protrusion=true,final]{microtype}%
  \else\ifluatex
    \usepackage[protrusion=true,expansion=true,final]{microtype}%
  \else
    \usepackage[protrusion=true,expansion=true,final]{microtype}%
  \fi\fi
}{}

% Allow LaTeX to stretch inter-word spacing in problematic
% paragraphs rather than producing overfull \hbox warnings. 3em
% is the conventional value; larger values relax the penalty
% further but risk visibly loose lines.
\setlength{\emergencystretch}{3em}

% Set a modest tolerance bump so the engine does not chase every
% fractional-point overflow.
\hbadness=2000
\vbadness=2000

% Optional packages: enumitem tightens list spacing; titlesec tightens
% chapter/section headings. Both are nice-to-have but ship in texlive-full
% rather than texlive-basic. Skip gracefully if missing.
\IfFileExists{enumitem.sty}{%
  \usepackage{enumitem}%
  \setlist{itemsep=0.2em,topsep=0.3em}%
}{}

\usepackage{parskip}

\IfFileExists{titlesec.sty}{%
  \usepackage{titlesec}%
  \titleformat{\chapter}[hang]{\Large\bfseries}{\thechapter.}{0.5em}{}%
  \titlespacing*{\chapter}{0pt}{-0.8em}{0.8em}%
  \titleformat{\section}{\large\bfseries}{\thesection}{0.5em}{}%
  \titleformat{\subsection}{\normalsize\bfseries}{\thesubsection}{0.5em}{}%
  \titleformat{\subsubsection}{\normalsize\itshape}{}{0em}{}%
}{}

\setcounter{tocdepth}{2}
\setcounter{secnumdepth}{3}
\raggedbottom

% The `report` class does not define \frontmatter / \mainmatter /
% \backmatter (those live in `book` and `memoir`). We provide
% lightweight equivalents that implement the DESE70002 handbook
% page-numbering policy: roman in front matter, arabic (reset to 1)
% in the main body, and no reset in back matter. Unnumbered chapters
% in front/back matter are handled by the markdown→LaTeX converter,
% which emits \chapter* when numbered_chapters=False.
\makeatletter
\providecommand{\frontmatter}{%
  \cleardoublepage
  \pagenumbering{roman}%
}
\providecommand{\mainmatter}{%
  \cleardoublepage
  \pagenumbering{arabic}%
}
\providecommand{\backmatter}{%
  \cleardoublepage
}
\makeatother

% Natbib emits the bibliography under its own chapter heading. The
% handbook asks for "References" rather than "Bibliography", so we
% rename the label here.
\IfFileExists{natbib.sty}{\renewcommand{\bibname}{References}}{}

\title{%
  Online Skill Learning for Self-Financed Prediction Markets\\
  \vspace{0.3em}\large A weighted-score wagering mechanism with an
  online skill-estimation layer and post-hoc recalibration%
}
\author{Anastasia Cattaneo}
\date{\today}

\begin{document}
\frontmatter
\maketitle
% Abstract and acknowledgments are emitted from the front_matter/
% markdown sources; the TOC follows them so every page-counted
% main-body heading is reachable from the contents page.
"""

POSTAMBLE = r"""
\end{document}
"""


# Per-block prologues emitted by build_latex. The TOC lives inside
# the front matter so roman-numeral pagination covers it.
FRONTMATTER_PROLOGUE = ""
FRONTMATTER_EPILOGUE = r"""
\tableofcontents
\clearpage
"""

# Arabic pagination restarts at 1 inside \mainmatter by default.
MAINMATTER_PROLOGUE = r"""
\mainmatter
\label{mainmatter:start}
"""
MAINMATTER_EPILOGUE = r"""
\label{mainmatter:end}
"""

# Back matter: references (via natbib) + AI-use declaration. The
# handbook requires the AI-use notice to appear *after* the list of
# references.
BACKMATTER_PROLOGUE = r"""
\backmatter
\IfFileExists{natbib.sty}{%
  \bibliographystyle{plainnat}%
  \IfFileExists{bibliography.bib}{\bibliography{bibliography}}{}%
}{}
"""
BACKMATTER_EPILOGUE = ""

APPENDIX_PROLOGUE = r"""
\appendix
"""
APPENDIX_EPILOGUE = ""


def load_include_order() -> list[tuple[str, list[str]]]:
    """Return the include order as a list of (section, [paths]) pairs.

    Section is one of 'frontmatter', 'mainmatter', 'backmatter',
    'appendix'. Order follows the section markers in
    include_order.txt (``# -- front matter --`` etc.). Files listed
    before any marker are assigned to the main body by default so
    a legacy include_order.txt still works.
    """
    if not INCLUDE_ORDER_FILE.exists():
        return DEFAULT_ORDER

    sections: list[tuple[str, list[str]]] = [
        ("frontmatter", []),
        ("mainmatter", []),
        ("backmatter", []),
        ("appendix", []),
    ]
    index_by_name = {name: i for i, (name, _) in enumerate(sections)}
    current = "mainmatter"

    for raw in INCLUDE_ORDER_FILE.read_text().splitlines():
        line = raw.strip()
        if not line:
            continue
        # Section-marker comments: "# -- front matter --", etc.
        marker_match = re.match(r"#\s*--\s*(.+?)\s*--\s*$", line)
        if marker_match:
            label = marker_match.group(1).lower()
            if label in SECTION_MARKERS:
                current = SECTION_MARKERS[label]
            continue
        if line.startswith("#"):
            continue
        sections[index_by_name[current]][1].append(line)
    return sections


def build_latex() -> str:
    """Assemble the full LaTeX source with front/main/back/appendix split."""
    parts = [PREAMBLE]
    ordered = load_include_order()
    missing: list[str] = []

    prologues = {
        "frontmatter": FRONTMATTER_PROLOGUE,
        "mainmatter": MAINMATTER_PROLOGUE,
        "backmatter": BACKMATTER_PROLOGUE,
        "appendix": APPENDIX_PROLOGUE,
    }
    epilogues = {
        "frontmatter": FRONTMATTER_EPILOGUE,
        "mainmatter": MAINMATTER_EPILOGUE,
        "backmatter": BACKMATTER_EPILOGUE,
        "appendix": APPENDIX_EPILOGUE,
    }

    for section, names in ordered:
        if not names and section not in ("frontmatter", "mainmatter",
                                          "backmatter"):
            # Skip empty optional sections (e.g. no appendices).
            continue
        parts.append(prologues[section])

        for name in names:
            path = WRITING_DIR / name
            if not path.exists():
                missing.append(name)
                continue
            parts.append(rf"% ---- begin {name} ----")
            numbered = section == "mainmatter" or section == "appendix"
            parts.append(convert_markdown_block(
                path.read_text(), numbered_chapters=numbered,
            ))
            parts.append(rf"% ---- end {name} ----")
            parts.append("")

        parts.append(epilogues[section])

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
    """Compile the .tex to .pdf. Try tectonic, then xelatex, then pdflatex.

    The preamble is engine-agnostic (see PREAMBLE): pdflatex uses
    inputenc + lmodern; xelatex/tectonic use fontspec with Latin Modern.
    If tectonic is present but fails (e.g. incomplete font cache),
    we fall through to xelatex / pdflatex.
    """
    tex_dir = tex_path.parent
    tectonic = find_tectonic()
    attempts: list[list[str]] = []
    if tectonic is not None:
        attempts.append([
            str(tectonic),
            "--outdir", str(tex_dir),
            "--keep-intermediates",
            "--keep-logs",
            str(tex_path),
        ])
    for compiler in ("xelatex", "pdflatex"):
        attempts.append([
            compiler,
            "-interaction=nonstopmode",
            "-halt-on-error",
            "-output-directory", str(tex_dir),
            str(tex_path),
        ])

    last_rc = 1
    for cmd in attempts:
        try:
            print("[build_pdf] running:", " ".join(cmd))
            rc = subprocess.run(cmd, check=False).returncode
        except FileNotFoundError:
            print(f"[build_pdf]   {cmd[0]!r} not found; trying next compiler.")
            continue
        if rc == 0:
            # For non-tectonic compilers, run a second pass so TOC resolves.
            if "tectonic" not in cmd[0]:
                subprocess.run(cmd, check=False)
            return 0
        print(f"[build_pdf]   {cmd[0]!r} failed (rc={rc}); trying next compiler.")
        last_rc = rc

    print("[build_pdf] ERROR: no compiler succeeded (tectonic, xelatex, pdflatex).")
    return last_rc


def write_include_order_if_missing() -> None:
    if INCLUDE_ORDER_FILE.exists():
        return
    lines = [
        "# One filename per line, in the order they appear in the PDF.",
        "# Blank lines and lines starting with '#' are ignored.",
        "# Remove a line to exclude that file from the build.",
        "#",
        "# Section markers:",
        "#   # -- front matter --  (not page-counted)",
        "#   # -- main body --     (35-page cap at 12pt)",
        "#   # -- back matter --   (not page-counted)",
        "#   # -- appendices --    (not page-counted)",
        "",
    ]
    for section, paths in DEFAULT_ORDER:
        label = {
            "frontmatter": "front matter",
            "mainmatter": "main body",
            "backmatter": "back matter",
            "appendix": "appendices",
        }[section]
        lines.append(f"# -- {label} --")
        lines.extend(paths)
        lines.append("")
    INCLUDE_ORDER_FILE.write_text("\n".join(lines))
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
