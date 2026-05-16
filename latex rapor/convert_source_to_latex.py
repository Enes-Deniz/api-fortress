#!/usr/bin/env python3
"""Convert latex rapor/source.md body to OTUMF LaTeX MainSections."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "source.md"
OUT_DIR = ROOT / "sablon" / "OTUMF_BPSablonu" / "MainSections"

CHAPTER_FILES = {
    1: "10_Introduction.tex",
    2: "11_Background.tex",
    3: "12_RelatedWork.tex",
    4: "13_Requirements.tex",
    5: "14_Design.tex",
    6: "15_Vulnerable.tex",
    7: "16_Secure.tex",
    8: "17_Development.tex",
    9: "18_Results.tex",
    10: "19_Conclusion.tex",
}

CHAPTER_LABELS = {
    1: "bolum1", 2: "bolum2", 3: "bolum3", 4: "bolum4", 5: "bolum5",
    6: "bolum6", 7: "bolum7", 8: "bolum8", 9: "bolum9", 10: "bolum10",
}

SECTION_RE = re.compile(r"^(\d+)\.\s+(.+)$")
SUBSECTION_RE = re.compile(r"^(\d+)\.(\d+)\.\s+(.+)$")
BULLET_RE = re.compile(r"^[\uf0b7\u2022]\s*")
TOC_LINE_RE = re.compile(r"^\d+(\.\d+)?\.\s+.+\s+\d+\s*$")
CODE_START_MARKERS = (
    "@", "# ", "from ", "import ", "def ", "class ", "WAF_", "limiter",
    "pip ", "version:", "services:", "{", "GET ", "POST ", "Authorization:",
    "X-", "OR 1=1", "routes_", "new_user", "user =", "return jsonify",
    "db.session", "bcrypt.", "if request", "elif ", "else:",
)
TABLE_HEADER_HINTS = (
    "ID\t", "Endpoint\t", "HTTP Metodu\t", "Alan\t", "Teknoloji\t",
    "Senaryo\t", "Kısaltma\t", "ID\tGereksinim",
)


def is_toc_line(line: str) -> bool:
    return bool(TOC_LINE_RE.match(line.strip()))


def escape_latex(text: str) -> str:
    if not text:
        return ""
    for a, b in [
        ("\\", r"\textbackslash{}"), ("&", r"\&"), ("%", r"\%"),
        ("$", r"\$"), ("#", r"\#"), ("_", r"\_"), ("{", r"\{"),
        ("}", r"\}"), ("~", r"\textasciitilde{}"), ("^", r"\textasciicircum{}"),
    ]:
        text = text.replace(a, b)
    text = text.replace("'", "'").replace(""", "``").replace(""", "''")
    text = text.replace("–", "--").replace("—", "---").replace("'", "'")
    return text


def slugify(title: str) -> str:
    s = re.sub(r"\s+\d+$", "", title.strip())
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:40] or "sec"


def clean_section_title(title: str) -> str:
    return re.sub(r"\s+\d+$", "", title.strip())


def is_code_line(line: str) -> bool:
    s = line.strip()
    if not s:
        return False
    if BULLET_RE.match(line):
        return False
    if s.startswith(CODE_START_MARKERS):
        return True
    if re.match(r"^[\{\}\[\]\"]", s):
        return True
    if re.match(r"^[a-zA-Z_][\w\.]*\s*=", s):
        return True
    return False


def is_table_block(lines: list[str], start: int) -> bool:
    if BULLET_RE.match(lines[start]):
        return False
    line = lines[start]
    if any(line.startswith(h) for h in TABLE_HEADER_HINTS):
        return True
    if "\t" in line:
        parts = line.split("\t")
        if len(parts) >= 3 and not BULLET_RE.match(line):
            return True
    return False


def parse_table(lines: list[str], start: int) -> tuple[str, int]:
    rows: list[list[str]] = []
    i = start
    while i < len(lines):
        line = lines[i].rstrip("\n")
        if not line.strip():
            if rows:
                break
            i += 1
            continue
        if is_toc_line(line) or SUBSECTION_RE.match(line) or SECTION_RE.match(line):
            break
        if BULLET_RE.match(line):
            break
        if is_code_line(line) and rows:
            break
        if "\t" not in line:
            if rows:
                break
            i += 1
            continue
        rows.append([c.strip() for c in line.split("\t")])
        i += 1
    if not rows or len(rows) < 2:
        return "", start

    ncol = max(len(r) for r in rows)
    col_w = min(3.5, 12.0 / ncol)
    col_spec = "|" + "|".join([f"L{{{col_w}cm}}"] * ncol) + "|"
    out = ["\\begin{table}[H]", "\\centering", f"\\begin{{tabular}}{{{col_spec}}}", "\\hline"]
    for ri, row in enumerate(rows):
        while len(row) < ncol:
            row.append("")
        cells = []
        for c in row:
            cell = escape_latex(c)
            if ri == 0:
                cell = f"\\textbf{{{cell}}}"
            cells.append(cell)
        out.append(" & ".join(cells) + " \\\\")
        out.append("\\hline")
    out.extend(["\\end{tabular}", "\\end{table}", ""])
    return "\n".join(out), i


def parse_code_block(lines: list[str], start: int) -> tuple[str, int]:
    block: list[str] = []
    i = start
    while i < len(lines):
        line = lines[i].rstrip("\n")
        stripped = line.strip()
        if not stripped:
            if block:
                # allow one blank inside block
                if i + 1 < len(lines) and is_code_line(lines[i + 1]):
                    block.append("")
                    i += 1
                    continue
                break
            i += 1
            continue
        if SUBSECTION_RE.match(line) or SECTION_RE.match(line):
            if not is_toc_line(line):
                break
        if block and BULLET_RE.match(line):
            break
        if block and not is_code_line(line):
            if stripped.endswith(".") and len(stripped) > 40:
                break
            if not re.match(r"^[\}\]]", stripped) and not stripped.endswith(","):
                if not stripped.startswith(("{", "}", '"', "'", "]")):
                    break
        if is_code_line(line) or (block and stripped):
            block.append(line.rstrip())
            i += 1
        else:
            break
    # lstlisting: minimal escaping
    safe = []
    for ln in block:
        ln = ln.replace("\\", "\\textbackslash{}")
        safe.append(ln)
    return "\\begin{lstlisting}\n" + "\n".join(safe) + "\n\\end{lstlisting}\n\n", i


def convert_body(lines: list[str]) -> dict[int, list[str]]:
    chapters: dict[int, list[str]] = {k: [] for k in CHAPTER_FILES}
    current_ch = 1
    list_env: str | None = None  # itemize | enumerate

    def close_list() -> None:
        nonlocal list_env
        if list_env:
            chapters[current_ch].append(f"\\end{{{list_env}}}\n\n")
            list_env = None

    i = 0
    while i < len(lines):
        line = lines[i].rstrip("\n")

        if is_toc_line(line):
            i += 1
            continue

        m_sub = SUBSECTION_RE.match(line)
        m_sec = SECTION_RE.match(line) if not m_sub else None

        if m_sub:
            close_list()
            ch, _, title = m_sub.groups()
            title = clean_section_title(title)
            current_ch = int(ch)
            chapters[current_ch].append(
                f"\\subsection{{{escape_latex(title)}}}\n\\label{{{slugify(title)}}}\n\n"
            )
            i += 1
            continue

        if m_sec:
            ch, title = m_sec.groups()
            title = clean_section_title(title)
            # Avoid treating "1. Parola ..." list items as chapters
            letters = re.sub(r"[^a-zA-ZğüşıöçĞÜŞİÖÇ]", "", title)
            upper_ratio = (
                sum(1 for c in letters if c.isupper()) / len(letters) if letters else 0
            )
            is_chapter = int(ch) <= 10 and (upper_ratio > 0.45 or title.isupper())
            if is_chapter:
                close_list()
                current_ch = int(ch)
                chapters[current_ch].append(
                    f"\\section{{{escape_latex(title)}}}\n"
                    f"\\label{{{CHAPTER_LABELS.get(int(ch), slugify(title))}}}\n\n"
                )
            else:
                if list_env != "enumerate":
                    close_list()
                    chapters[current_ch].append("\\begin{enumerate}[leftmargin=*]\n")
                    list_env = "enumerate"
                chapters[current_ch].append(f"    \\item {escape_latex(title)}\n")
            i += 1
            continue

        if BULLET_RE.match(line):
            if list_env != "itemize":
                close_list()
                chapters[current_ch].append("\\begin{itemize}[leftmargin=*]\n")
                list_env = "itemize"
            item = BULLET_RE.sub("", line).replace("\t", " ").strip()
            chapters[current_ch].append(f"    \\item {escape_latex(item)}\n")
            i += 1
            continue

        if is_table_block(lines, i):
            close_list()
            tbl, i = parse_table(lines, i)
            if tbl:
                chapters[current_ch].append(tbl + "\n")
            else:
                i += 1
            continue

        if is_code_line(line):
            close_list()
            code, i = parse_code_block(lines, i)
            chapters[current_ch].append(code)
            continue

        stripped = line.strip()
        if not stripped:
            i += 1
            continue

        # Numbered sub-points (1. Parola...) not sections
        m_num = re.match(r"^(\d+)\.\s+(.+)$", stripped)
        if m_num and not m_sub:
            num, rest = m_num.groups()
            if int(num) <= 5 and len(rest) > 10:
                if list_env != "enumerate":
                    close_list()
                    chapters[current_ch].append("\\begin{enumerate}[leftmargin=*]\n")
                    list_env = "enumerate"
                chapters[current_ch].append(f"    \\item {escape_latex(rest)}\n")
                i += 1
                continue

        if re.match(r"^(NFR|TR|FR)-\d+:", stripped):
            close_list()
            key, val = stripped.split(":", 1)
            chapters[current_ch].append(
                f"\\noindent\\textbf{{{escape_latex(key)}:}} {escape_latex(val.strip())}\n\n"
            )
            i += 1
            continue

        # Short unnumbered headings
        if (
            len(stripped) < 55
            and not stripped.endswith(".")
            and i + 1 < len(lines)
            and (BULLET_RE.match(lines[i + 1]) or lines[i + 1].strip().endswith("."))
            and not stripped.startswith(("http", "FR-", "NFR"))
        ):
            close_list()
            chapters[current_ch].append(f"\\subsubsection{{{escape_latex(stripped)}}}\n\n")
            i += 1
            continue

        close_list()
        chapters[current_ch].append(escape_latex(stripped) + "\n\n")
        i += 1

    close_list()
    return chapters


def main() -> None:
    all_lines = SOURCE.read_text(encoding="utf-8").splitlines()
    start = next(
        i for i, l in enumerate(all_lines)
        if re.match(r"^1\. GİRİŞ\s*$", l.strip())
    )
    end = next(i for i, l in enumerate(all_lines) if l.strip() == "KAYNAKLAR")
    body_lines = all_lines[start:end]
    chapters = convert_body(body_lines)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for ch_num, fname in CHAPTER_FILES.items():
        content = "".join(chapters.get(ch_num, []))
        if ch_num < 10:
            content += "\n\\clearpage\n"
        (OUT_DIR / fname).write_text(content, encoding="utf-8")
        print(f"Wrote {fname} ({len(content)} chars)")


if __name__ == "__main__":
    main()
